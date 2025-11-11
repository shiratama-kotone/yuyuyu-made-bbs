// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// 管理者IDリスト（コード内に直接記述）
const ADMIN_IDS = [
  "@42d3e89",
  "@9b0919e", 
  "ざーこざーこばーかばーか",
  "@9303157",
  "@07fcc1a"
];

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 投稿制限用
const requestTimestamps = {};

// 初期ファイル作成
function initializeFiles() {
  // data.jsonが存在しない場合は作成
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      topic: "掲示板",
      posts: [],
      nextPostNumber: 1
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log("data.json を作成しました");
  }
}

// 起動時にファイルを初期化
initializeFiles();

// ヘルスチェック用エンドポイント
app.get("/", (req, res) => {
  res.send("掲示板サーバーが正常に動作しています");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});



// 投稿整理
function prunePosts(jsonData) {
  return new Promise((resolve, reject) => {
    jsonData.posts = jsonData.posts.slice(-3);
    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return reject(err);
      resolve(jsonData);
    });
  });
}

// ----------------------
// 掲示板API
// ----------------------
app.get("/api", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "データ読み込み失敗" });
    res.json(JSON.parse(data));
  });
});

app.post("/api", async (req, res) => {
  // クエリパラメーターとJSONボディの両方をサポート
  const { name, pass, content } = req.query.name ? req.query : req.body;

  if (!name || !pass || !content) return res.status(400).json({ error: "全フィールド必須" });

  const now = Date.now();
  if (requestTimestamps[pass] && now - requestTimestamps[pass] < 1000)
    return res.status(429).json({ error: "同じパスワードで1秒に1回まで" });

  const hashedId = "@" + crypto.createHash("sha256").update(pass).digest("hex").substr(0, 7);

  try {
    let jsonData = JSON.parse(await fs.promises.readFile(DATA_FILE, "utf8"));

    // nextPostNumberが存在しない場合は既存の投稿から最大番号を取得して初期化
    if (typeof jsonData.nextPostNumber !== 'number') {
      const maxNo = jsonData.posts.length > 0 ? Math.max(...jsonData.posts.map(post => post.no || 0)) : 0;
      jsonData.nextPostNumber = maxNo + 1;
    }

    // 全削除コマンド
    if (content === "/clear") {
      const isAdminId = ADMIN_IDS.includes(hashedId);
      if (isAdminId) {
        jsonData.posts = [];
        jsonData.nextPostNumber = 1; // 投稿番号もリセット
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));
        return res.status(200).json({ message: "掲示板クリアされました" });
      }
    }

    // 個別削除コマンド（/del 番号）
    const deleteMatch = content.match(/^\/del\s+(\d+)$/);
    if (deleteMatch) {
      const postNumber = parseInt(deleteMatch[1]);
      const isAdminId = ADMIN_IDS.includes(hashedId);

      if (isAdminId) {
        const postIndex = jsonData.posts.findIndex(post => post.no === postNumber);
        if (postIndex !== -1) {
          jsonData.posts[postIndex].name = "削除されました";
          jsonData.posts[postIndex].content = "削除されました";
          jsonData.posts[postIndex].id = "";
          await fs.promises.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));
          return res.status(200).json({ message: `投稿番号${postNumber}を削除しました` });
        } else {
          return res.status(404).json({ error: `投稿番号${postNumber}が見つかりません` });
        }
      } else {
        return res.status(403).json({ error: "削除権限がありません" });
      }
    }

    // トピック変更コマンド（/topic 新しいトピック）
    const topicMatch = content.match(/^\/topic\s+(.+)$/);
    if (topicMatch) {
      const newTopic = topicMatch[1];
      const isAdminId = ADMIN_IDS.includes(hashedId);

      if (isAdminId) {
        jsonData.topic = newTopic;
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));
        return res.status(200).json({ message: `トピックを「${newTopic}」に変更しました` });
      } else {
        return res.status(403).json({ error: "トピック変更権限がありません" });
      }
    }

    // 新しい投稿に番号を付与
    const newPost = { 
      no: jsonData.nextPostNumber,
      name, 
      content, 
      id: hashedId, 
      time: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) 
    };

    jsonData.posts.unshift(newPost);
    jsonData.nextPostNumber++; // 次の投稿番号をインクリメント

    if (jsonData.posts.length > 200) await prunePosts(jsonData);
    else await fs.promises.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));

    requestTimestamps[pass] = now;
    res.status(200).json({ message: "投稿成功", post: newPost });
  } catch (err) {
    res.status(500).json({ error: "データ処理失敗" });
  }
});

app.post("/topic", (req, res) => {
  const { topic, adminPassword } = req.body;
  if (!topic) return res.status(400).json({ error: "トピック入力必須" });
  if (adminPassword !== ADMIN_PASSWORD) return res.status(403).json({ error: "パスワード不正" });

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "データ読み込み失敗" });
    const jsonData = JSON.parse(data);
    jsonData.topic = topic;
    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "トピック更新失敗" });
      res.status(200).json({ message: "トピック更新完了" });
    });
  });
});

app.post("/delete", (req, res) => {
  const { postNumber, adminPassword } = req.body;
  if (!postNumber || adminPassword !== ADMIN_PASSWORD) return res.status(403).json({ error: "パスワード不正か投稿番号未指定" });

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "データ読み込み失敗" });
    const jsonData = JSON.parse(data);
    const indexToDelete = postNumber - 1;
    if (indexToDelete < 0 || indexToDelete >= jsonData.posts.length)
      return res.status(404).json({ error: "投稿見つからず" });

    jsonData.posts[indexToDelete].name = "削除されました";
    jsonData.posts[indexToDelete].content = "削除されました";
    jsonData.posts[indexToDelete].id = "";
    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "保存失敗" });
      res.status(200).json({ message: "投稿削除完了" });
    });
  });
});

app.get("/id", (req, res) => {
  res.json(ADMIN_IDS);
});

// ----------------------
// ChatWork 未読チャット既読機能
// ----------------------
const cwJobs = {};

app.post("/cw-read/start", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "APIキー必須" });

  const jobId = uuidv4();
  cwJobs[jobId] = { 
    total: 0, 
    done: 0, 
    finished: false, 
    unreadRooms: [],
    processedRooms: [],
    errors: []
  };

  (async () => {
    try {
      console.log("ChatWork ルーム一覧を取得中...");

      // ルーム一覧を取得
      const roomsRes = await axios.get("https://api.chatwork.com/v2/rooms", {
        headers: { "X-ChatWorkToken": apiKey },
      });
      const allRooms = roomsRes.data;
      console.log(`全ルーム数: ${allRooms.length}`);

      // 未読メッセージがあるルームのみをフィルタリング
      const unreadRooms = allRooms.filter(room => {
        // unread_numが存在し、0より大きい場合は未読メッセージがある
        return room.unread_num && room.unread_num > 0;
      });

      console.log(`未読メッセージがあるルーム数: ${unreadRooms.length}`);

      cwJobs[jobId].total = unreadRooms.length;
      cwJobs[jobId].unreadRooms = unreadRooms.map(room => ({
        room_id: room.room_id,
        name: room.name,
        unread_num: room.unread_num
      }));

      // 未読ルームがない場合は即座に終了
      if (unreadRooms.length === 0) {
        cwJobs[jobId].finished = true;
        console.log("未読メッセージのあるルームはありません");
        return;
      }

      let index = 0;
      const interval = setInterval(async () => {
        if (index >= unreadRooms.length) { 
          clearInterval(interval); 
          cwJobs[jobId].finished = true; 
          console.log(`既読処理完了: ${cwJobs[jobId].done}/${cwJobs[jobId].total} ルーム`);
          return; 
        }

        const room = unreadRooms[index];
        try {
          console.log(`既読処理中: ${room.name} (未読数: ${room.unread_num})`);

          await axios.put(`https://api.chatwork.com/v2/rooms/${room.room_id}/messages/read`, {}, {
            headers: { "X-ChatWorkToken": apiKey }
          });

          cwJobs[jobId].done++;
          cwJobs[jobId].processedRooms.push({
            room_id: room.room_id,
            name: room.name,
            unread_num: room.unread_num,
            status: "success"
          });

          console.log(`既読完了: ${room.name}`);
        } catch (err) { 
          const errorMsg = err.response?.data?.errors?.[0] || err.response?.data || err.message;
          console.error(`既読失敗: ${room.name} - ${errorMsg}`);

          cwJobs[jobId].errors.push({
            room_id: room.room_id,
            name: room.name,
            error: errorMsg
          });
        }
        index++;
      }, 1500); // API制限を考慮して1.5秒間隔

    } catch (err) { 
      const errorMsg = err.response?.data?.errors?.[0] || err.response?.data || err.message;
      console.error("ルーム一覧取得失敗:", errorMsg); 
      cwJobs[jobId].finished = true;
      cwJobs[jobId].errors.push({
        type: "api_error",
        error: errorMsg
      });
    }
  })();

  res.json({ jobId });
});

app.get("/cw-read/progress", (req, res) => {
  const { jobId } = req.query;
  if (!jobId || !cwJobs[jobId]) return res.status(404).json({ error: "ジョブ見つからず" });
  res.json(cwJobs[jobId]);
});

// 未読ルーム一覧を取得するエンドポイント（既読処理前の確認用）
app.post("/cw-read/check", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "APIキー必須" });

  try {
    const roomsRes = await axios.get("https://api.chatwork.com/v2/rooms", {
      headers: { "X-ChatWorkToken": apiKey },
    });
    const allRooms = roomsRes.data;

    const unreadRooms = allRooms.filter(room => room.unread_num && room.unread_num > 0);

    res.json({
      totalRooms: allRooms.length,
      unreadRooms: unreadRooms.map(room => ({
        room_id: room.room_id,
        name: room.name,
        unread_num: room.unread_num
      }))
    });
  } catch (err) {
    const errorMsg = err.response?.data?.errors?.[0] || err.response?.data || err.message;
    res.status(500).json({ error: errorMsg });
  }
});

// ----------------------
// ChatWork Web クライアント用API
// ----------------------

// ルーム一覧取得
app.post("/cw-rooms", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "APIキー必須" });

  try {
    const response = await axios.get("https://api.chatwork.com/v2/rooms", {
      headers: { "X-ChatWorkToken": apiKey },
    });
    const rooms = response.data.map(r => ({
      room_id: r.room_id,
      name: r.name,
      type: r.type,
      unread_num: r.unread_num
    }));
    res.json({ rooms });
  } catch (err) {
    const msg = err.response?.data || err.message;
    res.status(500).json({ error: msg });
  }
});

// メッセージ一覧取得
app.post("/cw-messages", async (req, res) => {
  const { apiKey, roomId } = req.body;
  if (!apiKey || !roomId) return res.status(400).json({ error: "APIキーとルームID必須" });

  try {
    const response = await axios.get(`https://api.chatwork.com/v2/rooms/${roomId}/messages`, {
      headers: { "X-ChatWorkToken": apiKey },
    });
    res.json({ messages: response.data });
  } catch (err) {
    const msg = err.response?.data || err.message;
    res.status(500).json({ error: msg });
  }
});

// メッセージ送信
app.post("/cw-send", async (req, res) => {
  const { apiKey, roomId, message } = req.body;
  if (!apiKey || !roomId || !message) return res.status(400).json({ error: "必須データ不足" });

  try {
    await axios.post(
      `https://api.chatwork.com/v2/rooms/${roomId}/messages`,
      new URLSearchParams({ body: message }),
      { headers: { "X-ChatWorkToken": apiKey } }
    );
    res.json({ success: true, message: "送信完了" });
  } catch (err) {
    const msg = err.response?.data || err.message;
    res.status(500).json({ error: msg });
  }
});


// ----------------------
// サーバー起動
// ----------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});
