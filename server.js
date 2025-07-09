const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");
const ID_FILE = path.join(__dirname, "ID.json");

// 環境変数から運営用パスワードを取得
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(cors()); // どこからでもアクセスOKにする
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 投稿制限のための変数
const requestTimestamps = {};

// 初期データ作成
if (!fs.existsSync(DATA_FILE)) {
  const defaultData = {
    topic: "初見さんいらっしゃい　",
    posts: [],
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

if (!fs.existsSync(ID_FILE)) {
  const defaultIdData = {
    example4: "defaultID",
  };
  fs.writeFileSync(ID_FILE, JSON.stringify(defaultIdData, null, 2));
}

/**
 * 投稿配列を整理し、最後の3件のみを残します。
 * この関数は、実際のデータ変更とファイルへの書き込みを処理します。
 * @param {object} jsonData - DATA_FILEからパースされたJSONデータ。
 * @returns {Promise<object>} - 更新されたjsonDataで解決されるPromise。
 */
function prunePosts(jsonData) {
  return new Promise((resolve, reject) => {
    // 最後の3件の投稿のみを保持 (最も古い3件)
    jsonData.posts = jsonData.posts.slice(-3); // ここを修正しました

    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error("投稿の整理に失敗しました:", err);
        return reject(new Error("整理されたデータの保存に失敗しました。"));
      }
      console.log("投稿は正常に整理され、最後の3件のみが保持されました。");
      resolve(jsonData);
    });
  });
}

// GET /api 投稿一覧返す
app.get("/api", (req, res) => {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "データの読み込みに失敗しました。" });
    }
    res.json(JSON.parse(data));
  });
});

// POST /api?name=&pass=&content= 新規投稿
app.post("/api", async (req, res) => {
  const { name, pass, content } = req.query;

  if (!name || !pass || !content) {
    return res.status(400).json({ error: "すべてのフィールドを入力してください。" });
  }

  // 投稿制限チェック
  const now = Date.now();
  if (requestTimestamps[pass] && now - requestTimestamps[pass] < 1000) {
    return res.status(429).json({ error: "同じパスワードでの投稿は1秒に1回までです。" });
  }

  // pass を SHA-256でハッシュ化して7文字切り出し + 先頭に @
  const hashedId =
    "@" +
    crypto
      .createHash("sha256")
      .update(pass)
      .digest("hex")
      .substr(0, 7);

  const newPost = {
    name,
    content,
    id: hashedId,
    time: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }), // JST固定
  };

  try {
    let data = await fs.promises.readFile(DATA_FILE, "utf8");
    let jsonData = JSON.parse(data);

    // Manual clear command check
    if (content === "/clear") {
      // ID.jsonを読み込み、投稿者のIDが管理者IDリストに含まれるか確認
      const idDataRaw = await fs.promises.readFile(ID_FILE, "utf8");
      const idJsonData = JSON.parse(idDataRaw);

      // idJsonData の値（管理者ID）が hashedId と一致するかを確認
      const isAdminId = Object.values(idJsonData).includes(hashedId);

      if (isAdminId) {
        await prunePosts(jsonData);
        return res.status(200).json({ message: "掲示板がクリアされました。" });
      } else {
        // ID.jsonに含まれない場合は、通常の投稿として処理を続行
        // このelseブロックに入ったということは、/clearを通常のメッセージとして扱うため、
        // 下記の「jsonData.posts.unshift(newPost);」以降の処理に流します。
        // ここではreturnせずに、そのまま下の通常の投稿処理へ進ませます。
        console.log("'/clear'が投稿されましたが、投稿者のIDがID.jsonに含まれていません。通常の投稿として扱います。");
      }
    }

    jsonData.posts.unshift(newPost); // 新しい投稿は上に

    // Automatic pruning if post count exceeds 200
    if (jsonData.posts.length > 200) {
      console.log("Post count exceeded 200. Pruning posts.");
      await prunePosts(jsonData); // This will update jsonData.posts and save the file
    } else {
      // If no pruning, just save the new post
      await fs.promises.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2));
    }

    // タイムスタンプを記録
    requestTimestamps[pass] = now;

    res.status(200).json({ message: "投稿が成功しました。", post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データの処理に失敗しました。" });
  }
});

// POST /topic トピック変更API
app.post("/topic", (req, res) => {
  const { topic, adminPassword } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "トピックを入力してください。" });
  }

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "パスワードが正しくありません。" });
  }

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "データの読み込みに失敗しました。" });
    }

    const jsonData = JSON.parse(data);
    jsonData.topic = topic;

    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "トピックの更新に失敗しました。" });
      }
      res.status(200).json({ message: "トピックが更新されました。" });
    });
  });
});


app.post("/delete", (req, res) => {
  const { postNumber, adminPassword } = req.body;

  if (!postNumber || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "パスワードが正しくないか、投稿番号が指定されていません。" });
  }

  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "データの読み込みに失敗しました。" });
    }

    const jsonData = JSON.parse(data);

    // 投稿番号に対応するインデックスを正しく計算
    // `postNumber` 1 corresponds to the most recent post (index 0 after unshift)
    // So, `postNumber` 1 is `jsonData.posts[0]`, `postNumber` 2 is `jsonData.posts[1]`, etc.
    const indexToDelete = postNumber - 1;

    if (indexToDelete < 0 || indexToDelete >= jsonData.posts.length) {
      return res.status(404).json({ error: "該当する投稿が見つかりません。" });
    }

    // 削除処理 → 内容・名前を「削除されました」にして、IDは空にする
    jsonData.posts[indexToDelete].name = "削除されました";
    jsonData.posts[indexToDelete].content = "削除されました";
    jsonData.posts[indexToDelete].id = "";

    fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "データの保存に失敗しました。" });
      }
      res.status(200).json({ message: "投稿が削除されました。" });
    });
  });
});


// GET /id ID取得API
app.get("/id", (req, res) => {
  fs.readFile(ID_FILE, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "IDデータの読み込みに失敗しました。" });
    }
    res.json(JSON.parse(data));
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});
