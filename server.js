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
const ID_FILE = path.join(__dirname, "ID.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 投稿制限用
const requestTimestamps = {};

// 初期データ作成
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ topic: "初見さんいらっしゃい", posts: [] }, null, 2));
}
if (!fs.existsSync(ID_FILE)) {
  fs.writeFileSync(ID_FILE, JSON.stringify({ example4: "defaultID" }, null, 2));
}

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
  const { name, pass, content } = req.query;
  if (!name || !pass || !content) return res.status(400).json({ error: "全フィールド必須" });

  const now = Date.now();
  if (requestTimestamps[pass] && now - requestTimestamps[pass] < 1000)
    return res.status(429).json({ error: "同じパスワードで1秒に1回まで" });

  const hashedId = "@" + crypto.createHash("sha256").update(pass).digest("hex").substr(0, 7);
  const newPost = { name, content, id: hashedId, time: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) };

  try {
    let jsonData = JSON.parse(await fs.promises.readFile(DATA_FILE, "utf8"));

    if (content === "/clear") {
      const idJsonData = JSON.parse(await fs.promises.readFile(ID_FILE, "utf8"));
      const isAdminId = Object.values(idJsonData).includes(hashedId);
      if (isAdminId) {
        await prunePosts(jsonData);
        return res.status(200).json({ message: "掲示板クリアされました" });
      }
    }

    jsonData.posts.unshift(newPost);
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
  fs.readFile(ID_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "ID読み込み失敗" });
    res.json(JSON.parse(data));
  });
});

// ----------------------
// ChatWork 全ルーム既読機能
// ----------------------
const cwJobs = {};

app.post("/cw-read/start", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "APIキー必須" });

  const jobId = uuidv4();
  cwJobs[jobId] = { total: 0, done: 0, finished: false };

  (async () => {
    try {
      const roomsRes = await axios.get("https://api.chatwork.com/v2/rooms", {
        headers: { "X-ChatWorkToken": apiKey },
      });
      const rooms = roomsRes.data;
      cwJobs[jobId].total = rooms.length;

      let index = 0;
      const interval = setInterval(async () => {
        if (index >= rooms.length) { clearInterval(interval); cwJobs[jobId].finished = true; return; }
        const room = rooms[index];
        try {
          await axios.put(`https://api.chatwork.com/v2/rooms/${room.room_id}/messages/read`, {}, {
            headers: { "X-ChatWorkToken": apiKey }
          });
          cwJobs[jobId].done++;
        } catch (err) { console.error(`既読失敗: ${room.name}`, err.response?.data || err.message); }
        index++;
      }, 1000);
    } catch (err) { console.error("ルーム一覧取得失敗:", err.message); cwJobs[jobId].finished = true; }
  })();

  res.json({ jobId });
});

app.get("/cw-read/progress", (req, res) => {
  const { jobId } = req.query;
  if (!jobId || !cwJobs[jobId]) return res.status(404).json({ error: "ジョブ見つからず" });
  res.json(cwJobs[jobId]);
});

// ----------------------
// サーバー起動
// ----------------------
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});
