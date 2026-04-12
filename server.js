// server.js
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// NeonDB接続
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

// 管理者IDリスト（admin権限保持者）
const ADMIN_IDS = [
  "@42d3e89",
  "@9b0919e",
  "ざーこざーこばーかばーか",
  "@9303157",
  "@07fcc1a",
];

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 投稿制限用
const requestTimestamps = {};

// ----------------------
// DB初期化
// ----------------------
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        no SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        id TEXT NOT NULL,
        time TEXT NOT NULL,
        deleted BOOLEAN DEFAULT FALSE
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id TEXT PRIMARY KEY
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS summit (
        id TEXT PRIMARY KEY
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS manager (
        id TEXT PRIMARY KEY
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS speaker (
        id TEXT PRIMARY KEY
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS color (
        id TEXT PRIMARY KEY,
        color_code TEXT NOT NULL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "add" (
        id TEXT PRIMARY KEY,
        suffix TEXT NOT NULL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    // 初期設定
    await client.query(`
      INSERT INTO settings (key, value) VALUES
        ('topic', '掲示板'),
        ('prevent', 'false'),
        ('restrict', 'false'),
        ('stop_until', '0'),
        ('prohibit_until', '0')
      ON CONFLICT (key) DO NOTHING
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ng_words (
        word TEXT PRIMARY KEY
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ban (
        id TEXT PRIMARY KEY
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS kill_list (
        id TEXT PRIMARY KEY
      )
    `);

    // 既存のADMIN_IDSをDBに登録
    for (const aid of ADMIN_IDS) {
      await client.query(`INSERT INTO admin (id) VALUES ($1) ON CONFLICT DO NOTHING`, [aid]);
    }

    console.log("DBを初期化しました");
  } finally {
    client.release();
  }
}

initDB().catch(console.error);

// ----------------------
// 権限ヘルパー
// ----------------------

// 権限レベル: 0=青ID, 1=speaker, 2=manager, 3=summit, 4=admin
async function getRole(hashedId) {
  const { rows: adminRows } = await pool.query(`SELECT 1 FROM admin WHERE id=$1`, [hashedId]);
  if (adminRows.length > 0) return 4;
  const { rows: summitRows } = await pool.query(`SELECT 1 FROM summit WHERE id=$1`, [hashedId]);
  if (summitRows.length > 0) return 3;
  const { rows: managerRows } = await pool.query(`SELECT 1 FROM manager WHERE id=$1`, [hashedId]);
  if (managerRows.length > 0) return 2;
  const { rows: speakerRows } = await pool.query(`SELECT 1 FROM speaker WHERE id=$1`, [hashedId]);
  if (speakerRows.length > 0) return 1;
  return 0;
}

function roleName(level) {
  return ["blue", "darkorange", "red", "darkcyan", "admin"][level] ?? "blue";
}

async function getSetting(key) {
  const { rows } = await pool.query(`SELECT value FROM settings WHERE key=$1`, [key]);
  return rows[0]?.value ?? null;
}

async function setSetting(key, value) {
  await pool.query(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value=$2`, [key, value]);
}

// 投稿1000件到達時にno=1,2,3以外をリセット
async function prunePostsIfNeeded() {
  const { rows } = await pool.query(`SELECT COUNT(*) AS cnt FROM posts`);
  const cnt = parseInt(rows[0].cnt);
  if (cnt >= 1000) {
    // no=1,2,3は残す
    await pool.query(`DELETE FROM posts WHERE no > 3`);
    console.log("投稿が1000件に達したためno=1〜3以外をリセットしました");
  }
}

// ----------------------
// ヘルスチェック
// ----------------------
app.get("/", (req, res) => {
  res.send("掲示板サーバーが正常に動作しています");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ----------------------
// 掲示板API
// ----------------------
app.get("/api", async (req, res) => {
  try {
    const topic = await getSetting("topic");
    const { rows: posts } = await pool.query(`SELECT * FROM posts ORDER BY no DESC`);
    // add/colorを付与
    const enriched = await Promise.all(posts.map(async (p) => {
      const { rows: colorRows } = await pool.query(`SELECT color_code FROM color WHERE id=$1`, [p.id]);
      const { rows: addRows } = await pool.query(`SELECT suffix FROM "add" WHERE id=$1`, [p.id]);
      return {
        ...p,
        colorCode: colorRows[0]?.color_code ?? null,
        addSuffix: addRows[0]?.suffix ?? null,
      };
    }));
    res.json({ topic, posts: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ読み込み失敗" });
  }
});

app.post("/api", async (req, res) => {
  const { name, pass, content } = req.query.name ? req.query : req.body;

  if (!name || !pass || !content)
    return res.status(400).json({ error: "全フィールド必須" });

  const now = Date.now();
  if (requestTimestamps[pass] && now - requestTimestamps[pass] < 1000)
    return res.status(429).json({ error: "同じパスワードで1秒に1回まで" });

  const hashedId = "@" + crypto.createHash("sha256").update(pass).digest("hex").substr(0, 7);

  try {
    const role = await getRole(hashedId);

    // kill確認
    const { rows: killRows } = await pool.query(`SELECT 1 FROM kill_list WHERE id=$1`, [hashedId]);
    if (killRows.length > 0)
      return res.status(403).json({ error: "このアカウントは使用停止中です" });

    // =====================
    // コマンド処理
    // =====================

    // /clear
    if (content.trim() === "/clear") {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      await pool.query(`DELETE FROM posts`);
      return res.status(200).json({ message: "掲示板をクリアしました" });
    }

    // /del 番号 [番号...] (一括対応)
    const delMatch = content.match(/^\/del\s+([\d\s]+)$/);
    if (delMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const nos = delMatch[1].trim().split(/\s+/).map(Number);
      for (const no of nos) {
        await pool.query(
          `UPDATE posts SET name='削除されました', content='削除されました', id='', deleted=TRUE WHERE no=$1`,
          [no]
        );
      }
      return res.status(200).json({ message: `投稿 ${nos.join(", ")} を削除しました` });
    }

    // /destroy [文字列/color] (一括対応)
    const destroyMatch = content.match(/^\/destroy\s+(.+)$/);
    if (destroyMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const targets = destroyMatch[1].trim().split(/\s+/);
      const colorMap = {
        blue: 0, darkorange: 1, red: 2, darkcyan: 3
      };
      for (const target of targets) {
        if (colorMap[target] !== undefined) {
          const targetRole = colorMap[target];
          // 対象権限のIDを取得
          let ids = [];
          if (targetRole === 0) {
            // 青ID: 他テーブルに存在しないID
            const { rows: allIds } = await pool.query(`SELECT DISTINCT id FROM posts WHERE id != ''`);
            for (const row of allIds) {
              const r = await getRole(row.id);
              if (r === 0) ids.push(row.id);
            }
          } else {
            const tableMap = { 1: "speaker", 2: "manager", 3: "summit" };
            const { rows } = await pool.query(`SELECT id FROM ${tableMap[targetRole]}`);
            ids = rows.map(r => r.id);
          }
          for (const id of ids) {
            await pool.query(
              `UPDATE posts SET name='削除されました', content='削除されました', id='', deleted=TRUE WHERE id=$1`,
              [id]
            );
          }
        } else {
          // 文字列として削除
          await pool.query(
            `UPDATE posts SET name='削除されました', content='削除されました', id='', deleted=TRUE
             WHERE content LIKE $1 OR id=$2`,
            [`%${target}%`, target]
          );
        }
      }
      return res.status(200).json({ message: `/destroy 実行完了` });
    }

    // /topic 話題
    const topicMatch = content.match(/^\/topic\s+(.+)$/);
    if (topicMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await setSetting("topic", topicMatch[1].trim());
      return res.status(200).json({ message: `トピックを「${topicMatch[1].trim()}」に変更しました` });
    }

    // /NG 言葉 [言葉...] (一括対応)
    const ngMatch = content.match(/^\/NG\s+(.+)$/);
    if (ngMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const words = ngMatch[1].trim().split(/\s+/);
      for (const word of words) {
        await pool.query(`INSERT INTO ng_words (word) VALUES ($1) ON CONFLICT DO NOTHING`, [word]);
      }
      return res.status(200).json({ message: `NG登録: ${words.join(", ")}` });
    }

    // /OK 言葉 [言葉...] (一括対応)
    const okMatch = content.match(/^\/OK\s+(.+)$/);
    if (okMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const words = okMatch[1].trim().split(/\s+/);
      for (const word of words) {
        await pool.query(`DELETE FROM ng_words WHERE word=$1`, [word]);
      }
      return res.status(200).json({ message: `NG解除: ${words.join(", ")}` });
    }

    // /prevent
    if (content.trim() === "/prevent") {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      await setSetting("prevent", "true");
      return res.status(200).json({ message: "青IDの投稿を禁止しました" });
    }

    // /permit
    if (content.trim() === "/permit") {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await setSetting("prevent", "false");
      return res.status(200).json({ message: "/prevent を解除しました" });
    }

    // /restrict
    if (content.trim() === "/restrict") {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      await setSetting("restrict", "true");
      return res.status(200).json({ message: "青IDのban制限を有効にしました" });
    }

    // /stop (3分間)
    if (content.trim() === "/stop") {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      const until = Date.now() + 3 * 60 * 1000;
      await setSetting("stop_until", String(until));
      return res.status(200).json({ message: "3分間青IDの投稿を禁止しました" });
    }

    // /prohibit 時間(分)
    const prohibitMatch = content.match(/^\/prohibit\s+(\d+)$/);
    if (prohibitMatch) {
      if (role < 4) return res.status(403).json({ error: "権限不足 (運営のみ)" });
      const minutes = parseInt(prohibitMatch[1]);
      const until = Date.now() + minutes * 60 * 1000;
      await setSetting("prohibit_until", String(until));
      return res.status(200).json({ message: `${minutes}分間青IDの投稿を禁止しました` });
    }

    // /release
    if (content.trim() === "/release") {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await setSetting("restrict", "false");
      await setSetting("stop_until", "0");
      await setSetting("prohibit_until", "0");
      return res.status(200).json({ message: "/restrict /stop /prohibit を解除しました" });
    }

    // 権限昇格: /speaker /manager /summit (一括対応)
    const promoteMatch = content.match(/^\/(speaker|manager|summit)\s+(.+)$/i);
    if (promoteMatch) {
      const cmd = promoteMatch[1].toLowerCase();
      const targets = promoteMatch[2].trim().split(/\s+/);
      const grantLevel = { speaker: 1, manager: 2, summit: 3 }[cmd];
      const maxGrant = role === 4 ? 3 : role === 3 ? 2 : role === 2 ? 1 : 0;
      if (role < 2 || grantLevel > maxGrant)
        return res.status(403).json({ error: "権限不足" });
      for (const targetId of targets) {
        const tid = targetId.startsWith("@") ? targetId : "@" + targetId;
        const tableMap = { 1: "speaker", 2: "manager", 3: "summit" };
        await pool.query(`INSERT INTO ${tableMap[grantLevel]} (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
        // 昇格したら下位テーブルから削除
        for (let l = 1; l < grantLevel; l++) {
          await pool.query(`DELETE FROM ${tableMap[l]} WHERE id=$1`, [tid]);
        }
      }
      return res.status(200).json({ message: `${targets.join(", ")} を ${cmd} に昇格しました` });
    }

    // 権限降格: /disspeaker /dismanager /dissummit (一括対応)
    const demoteMatch = content.match(/^\/(dis(?:speaker|manager|summit)|disself)\s*(.*)$/i);
    if (demoteMatch) {
      const cmd = demoteMatch[1].toLowerCase();
      if (cmd === "disself") {
        // 自分の権限を青IDに
        await pool.query(`DELETE FROM speaker WHERE id=$1`, [hashedId]);
        await pool.query(`DELETE FROM manager WHERE id=$1`, [hashedId]);
        await pool.query(`DELETE FROM summit WHERE id=$1`, [hashedId]);
        return res.status(200).json({ message: "自分の権限を青IDにしました" });
      }
      const targets = demoteMatch[2].trim().split(/\s+/).filter(Boolean);
      if (targets.length === 0) return res.status(400).json({ error: "ID指定必須" });
      const demoteCmd = cmd.replace("dis", "");
      // disspeaker → 青ID, dismanager → speaker, dissummit → manager
      const demoteTo = { speaker: 0, manager: 1, summit: 2 }[demoteCmd];
      if (demoteTo === undefined) return res.status(400).json({ error: "不明なコマンド" });
      // 降格できる権限チェック
      const demoteFrom = { speaker: 1, manager: 2, summit: 3 }[demoteCmd];
      const maxDemote = role === 4 ? 3 : role === 3 ? 2 : role === 2 ? 1 : 0;
      if (role < 2 || demoteFrom > maxDemote)
        return res.status(403).json({ error: "権限不足" });
      for (const targetId of targets) {
        const tid = targetId.startsWith("@") ? targetId : "@" + targetId;
        await pool.query(`DELETE FROM speaker WHERE id=$1`, [tid]);
        await pool.query(`DELETE FROM manager WHERE id=$1`, [tid]);
        await pool.query(`DELETE FROM summit WHERE id=$1`, [tid]);
        if (demoteTo === 1) {
          await pool.query(`INSERT INTO speaker (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
        } else if (demoteTo === 2) {
          await pool.query(`INSERT INTO manager (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
        }
        // demoteTo=0は何も付与しない（青ID）
      }
      return res.status(200).json({ message: `${targets.join(", ")} を降格しました` });
    }

    // /kill ID [ID...] (一括対応)
    const killMatch = content.match(/^\/kill\s+(.+)$/);
    if (killMatch) {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      const targets = killMatch[1].trim().split(/\s+/);
      for (const t of targets) {
        const tid = t.startsWith("@") ? t : "@" + t;
        await pool.query(`INSERT INTO kill_list (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
      }
      return res.status(200).json({ message: `${targets.join(", ")} をkillしました` });
    }

    // /ban ID/投稿番号 (一括対応)
    const banMatch = content.match(/^\/ban\s+(.+)$/);
    if (banMatch) {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      const targets = banMatch[1].trim().split(/\s+/);
      for (const t of targets) {
        if (/^\d+$/.test(t)) {
          // 投稿番号でban
          const { rows } = await pool.query(`SELECT id FROM posts WHERE no=$1`, [parseInt(t)]);
          if (rows[0]?.id) {
            await pool.query(`INSERT INTO ban (id) VALUES ($1) ON CONFLICT DO NOTHING`, [rows[0].id]);
          }
        } else {
          const tid = t.startsWith("@") ? t : "@" + t;
          await pool.query(`INSERT INTO ban (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
        }
      }
      return res.status(200).json({ message: `ban完了` });
    }

    // /revive (killとbanを解除)
    if (content.trim() === "/revive") {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await pool.query(`DELETE FROM kill_list`);
      await pool.query(`DELETE FROM ban`);
      return res.status(200).json({ message: "kill/ban をすべて解除しました" });
    }

    // /add ID サフィックス
    const addMatch = content.match(/^\/add\s+(\S+)\s+(.+)$/);
    if (addMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const tid = addMatch[1].startsWith("@") ? addMatch[1] : "@" + addMatch[1];
      const suffix = addMatch[2].trim();
      await pool.query(
        `INSERT INTO "add" (id, suffix) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET suffix=$2`,
        [tid, suffix]
      );
      return res.status(200).json({ message: `${tid} のsuffixを「${suffix}」に設定しました` });
    }

    // /color カラーコード ID
    const colorMatch = content.match(/^\/color\s+(#[0-9a-fA-F]{3,6})\s+(\S+)$/);
    if (colorMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const colorCode = colorMatch[1];
      const tid = colorMatch[2].startsWith("@") ? colorMatch[2] : "@" + colorMatch[2];
      await pool.query(
        `INSERT INTO color (id, color_code) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET color_code=$2`,
        [tid, colorCode]
      );
      return res.status(200).json({ message: `${tid} の色を ${colorCode} に設定しました` });
    }

    // /instances
    if (content.trim() === "/instances") {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const { rows } = await pool.query(`SELECT value FROM settings WHERE key='instances'`);
      return res.status(200).json({ instances: rows[0]?.value ?? "未登録" });
    }
    const instancesMatch = content.match(/^\/instances\s+(.+)$/);
    if (instancesMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await setSetting("instances", instancesMatch[1].trim());
      return res.status(200).json({ message: `インスタンスを登録しました` });
    }

    // =====================
    // 通常投稿
    // =====================

    // 青IDの各種制限チェック
    if (role === 0) {
      const prevent = await getSetting("prevent");
      if (prevent === "true")
        return res.status(403).json({ error: "現在青IDは投稿できません (/prevent中)" });

      const stopUntil = parseInt(await getSetting("stop_until") ?? "0");
      if (Date.now() < stopUntil)
        return res.status(403).json({ error: "現在青IDは投稿できません (/stop中)" });

      const prohibitUntil = parseInt(await getSetting("prohibit_until") ?? "0");
      if (Date.now() < prohibitUntil)
        return res.status(403).json({ error: "現在青IDは投稿できません (/prohibit中)" });

      const restrict = await getSetting("restrict");
      if (restrict === "true") {
        const { rows: banRows } = await pool.query(`SELECT 1 FROM ban WHERE id=$1`, [hashedId]);
        if (banRows.length > 0)
          return res.status(403).json({ error: "投稿が禁止されています" });
      }

      // NGワードチェック
      const { rows: ngWords } = await pool.query(`SELECT word FROM ng_words`);
      for (const { word } of ngWords) {
        if (content.includes(word))
          return res.status(403).json({ error: `NGワード「${word}」が含まれています` });
      }
    }

    // 投稿件数チェック→1000件でリセット
    await prunePostsIfNeeded();

    const time = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const { rows: inserted } = await pool.query(
      `INSERT INTO posts (name, content, id, time) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, content, hashedId, time]
    );

    requestTimestamps[pass] = now;
    res.status(200).json({ message: "投稿成功", post: inserted[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ処理失敗" });
  }
});

// トピック変更（管理者パスワード経由）
app.post("/topic", async (req, res) => {
  const { topic, adminPassword } = req.body;
  if (!topic) return res.status(400).json({ error: "トピック入力必須" });
  if (adminPassword !== ADMIN_PASSWORD) return res.status(403).json({ error: "パスワード不正" });
  await setSetting("topic", topic);
  res.status(200).json({ message: "トピック更新完了" });
});

// 投稿削除（管理者パスワード経由）
app.post("/delete", async (req, res) => {
  const { postNumber, adminPassword } = req.body;
  if (!postNumber || adminPassword !== ADMIN_PASSWORD)
    return res.status(403).json({ error: "パスワード不正か投稿番号未指定" });
  await pool.query(
    `UPDATE posts SET name='削除されました', content='削除されました', id='', deleted=TRUE WHERE no=$1`,
    [parseInt(postNumber)]
  );
  res.status(200).json({ message: "投稿削除完了" });
});

// ID一覧（adminのみ）
app.get("/id", async (req, res) => {
  const { rows } = await pool.query(`SELECT id FROM admin`);
  res.json(rows.map(r => r.id));
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
    errors: [],
  };

  (async () => {
    try {
      const roomsRes = await axios.get("https://api.chatwork.com/v2/rooms", {
        headers: { "X-ChatWorkToken": apiKey },
      });
      const allRooms = roomsRes.data;
      const unreadRooms = allRooms.filter(r => r.unread_num && r.unread_num > 0);

      cwJobs[jobId].total = unreadRooms.length;
      cwJobs[jobId].unreadRooms = unreadRooms.map(r => ({
        room_id: r.room_id,
        name: r.name,
        unread_num: r.unread_num,
      }));

      if (unreadRooms.length === 0) {
        cwJobs[jobId].finished = true;
        return;
      }

      let index = 0;
      const interval = setInterval(async () => {
        if (index >= unreadRooms.length) {
          clearInterval(interval);
          cwJobs[jobId].finished = true;
          return;
        }
        const room = unreadRooms[index];
        try {
          await axios.put(
            `https://api.chatwork.com/v2/rooms/${room.room_id}/messages/read`,
            {},
            { headers: { "X-ChatWorkToken": apiKey } }
          );
          cwJobs[jobId].done++;
          cwJobs[jobId].processedRooms.push({ ...room, status: "success" });
        } catch (err) {
          const errorMsg = err.response?.data?.errors?.[0] || err.message;
          cwJobs[jobId].errors.push({ room_id: room.room_id, name: room.name, error: errorMsg });
        }
        index++;
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0] || err.message;
      cwJobs[jobId].finished = true;
      cwJobs[jobId].errors.push({ type: "api_error", error: errorMsg });
    }
  })();

  res.json({ jobId });
});

app.get("/cw-read/progress", (req, res) => {
  const { jobId } = req.query;
  if (!jobId || !cwJobs[jobId]) return res.status(404).json({ error: "ジョブ見つからず" });
  res.json(cwJobs[jobId]);
});

app.post("/cw-read/check", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "APIキー必須" });
  try {
    const roomsRes = await axios.get("https://api.chatwork.com/v2/rooms", {
      headers: { "X-ChatWorkToken": apiKey },
    });
    const allRooms = roomsRes.data;
    const unreadRooms = allRooms.filter(r => r.unread_num && r.unread_num > 0);
    res.json({
      totalRooms: allRooms.length,
      unreadRooms: unreadRooms.map(r => ({
        room_id: r.room_id,
        name: r.name,
        unread_num: r.unread_num,
      })),
    });
  } catch (err) {
    const errorMsg = err.response?.data?.errors?.[0] || err.message;
    res.status(500).json({ error: errorMsg });
  }
});

// ----------------------
// サーバー起動
// ----------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});
