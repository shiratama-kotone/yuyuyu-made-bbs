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

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    await client.query(`CREATE TABLE IF NOT EXISTS admin   (id TEXT PRIMARY KEY)`);
    await client.query(`CREATE TABLE IF NOT EXISTS summit  (id TEXT PRIMARY KEY)`);
    await client.query(`CREATE TABLE IF NOT EXISTS manager (id TEXT PRIMARY KEY)`);
    await client.query(`CREATE TABLE IF NOT EXISTS speaker (id TEXT PRIMARY KEY)`);
    await client.query(`CREATE TABLE IF NOT EXISTS color   (id TEXT PRIMARY KEY, color_code TEXT NOT NULL)`);
    await client.query(`CREATE TABLE IF NOT EXISTS "add"   (id TEXT PRIMARY KEY, suffix TEXT NOT NULL)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    await client.query(`
      INSERT INTO settings (key, value) VALUES
        ('topic',          '掲示板'),
        ('prevent',        'false'),
        ('restrict',       'false'),
        ('stop_until',     '0'),
        ('prohibit_until', '0')
      ON CONFLICT (key) DO NOTHING
    `);
    await client.query(`CREATE TABLE IF NOT EXISTS ng_words  (word TEXT PRIMARY KEY)`);
    await client.query(`CREATE TABLE IF NOT EXISTS ban       (id TEXT PRIMARY KEY)`);
    await client.query(`CREATE TABLE IF NOT EXISTS kill_list (id TEXT PRIMARY KEY)`);

    // シード投稿（no=0,1,2）が存在しない場合のみ挿入
    await client.query(`
      INSERT INTO posts (no, name, id, content, time) VALUES
        (0, 'さーばー', '( ᐛ )', 'ぜんけしー',  '0001/01/01 00:00'),
        (1, '学生',     '',        'どかーん',    '2011/7/3 0:0'),
        (2, 'ゆゆゆ',   '@42d3e89', '(think)',    '2011/12/26 0:0')
      ON CONFLICT (no) DO NOTHING
    `);
    // SERIALシーケンスをno=3以降から始まるよう調整
    await client.query(`SELECT setval(pg_get_serial_sequence('posts','no'), GREATEST(2, (SELECT MAX(no) FROM posts)), true)`);

    console.log("DBを初期化しました");
  } finally {
    client.release();
  }
}
initDB().catch(console.error);

// ----------------------
// 権限ヘルパー
// ----------------------
// 0=青ID, 1=speaker, 2=manager, 3=summit, 4=admin
async function getRole(hashedId) {
  const { rows: a } = await pool.query(`SELECT 1 FROM admin   WHERE id=$1`, [hashedId]);
  if (a.length > 0) return 4;
  const { rows: s } = await pool.query(`SELECT 1 FROM summit  WHERE id=$1`, [hashedId]);
  if (s.length > 0) return 3;
  const { rows: m } = await pool.query(`SELECT 1 FROM manager WHERE id=$1`, [hashedId]);
  if (m.length > 0) return 2;
  const { rows: sp } = await pool.query(`SELECT 1 FROM speaker WHERE id=$1`, [hashedId]);
  if (sp.length > 0) return 1;
  return 0;
}

async function getSetting(key) {
  const { rows } = await pool.query(`SELECT value FROM settings WHERE key=$1`, [key]);
  return rows[0]?.value ?? null;
}
async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value=$2`,
    [key, value]
  );
}

async function prunePostsIfNeeded() {
  const { rows } = await pool.query(`SELECT COUNT(*) AS cnt FROM posts`);
  if (parseInt(rows[0].cnt) >= 1000) {
    await pool.query(`DELETE FROM posts WHERE no > 3`);
    console.log("1000件到達: no=1〜3以外をリセット");
  }
}

// ----------------------
// ヘルスチェック
// ----------------------
app.get("/", (req, res) => res.send("掲示板サーバーが正常に動作しています"));
app.get("/health", (req, res) => res.status(200).json({ status: "OK", timestamp: new Date().toISOString() }));

// ----------------------
// 掲示板API
// ----------------------
app.get("/api", async (req, res) => {
  try {
    const topic = await getSetting("topic");
    const { rows: posts } = await pool.query(`SELECT * FROM posts ORDER BY no DESC`);
    const enriched = await Promise.all(posts.map(async (p) => {
      const role = await getRole(p.id);
      const { rows: colorRows } = await pool.query(`SELECT color_code FROM color WHERE id=$1`, [p.id]);
      const { rows: addRows }   = await pool.query(`SELECT suffix FROM "add" WHERE id=$1`, [p.id]);
      return {
        ...p,
        role,
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
    // コマンド処理（実行後も投稿する）
    // =====================
    let commandMessage = null;

    // /clear
    if (content.trim() === "/clear") {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      // no=0,1,2以外を削除
      await pool.query(`DELETE FROM posts WHERE no > 2`);
      // no=0,1,2が存在しない場合はシードを復元
      await pool.query(`
        INSERT INTO posts (no, name, id, content, time) VALUES
          (0, 'さーばー', '( ᐛ )', 'ぜんけしー',  '0001/01/01 00:00'),
          (1, '学生',     '',        'どかーん',    '2011/7/3 0:0'),
          (2, 'ゆゆゆ',   '@42d3e89', '(think)',    '2011/12/26 0:0')
        ON CONFLICT (no) DO NOTHING
      `);
      // シーケンスをリセット
      await pool.query(`SELECT setval(pg_get_serial_sequence('posts','no'), 2, true)`);
      commandMessage = "掲示板をクリアしました";
    }

    // /del 番号 [番号...]
    const delMatch = !commandMessage && content.match(/^\/del\s+([\d\s]+)$/);
    if (delMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const nos = delMatch[1].trim().split(/\s+/).map(Number);
      for (const no of nos) {
        await pool.query(
          `UPDATE posts SET name='削除されました', content='削除されました', id='', deleted=TRUE WHERE no=$1`,
          [no]
        );
      }
      commandMessage = `投稿 ${nos.join(", ")} を削除しました`;
    }

    // /destroy 文字列/color [...]
    const destroyMatch = !commandMessage && content.match(/^\/destroy\s+(.+)$/);
    if (destroyMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const targets = destroyMatch[1].trim().split(/\s+/);
      const colorMap = { blue: 0, darkorange: 1, red: 2, darkcyan: 3 };
      for (const target of targets) {
        if (colorMap[target] !== undefined) {
          const targetRole = colorMap[target];
          const tableMap = { 1: "speaker", 2: "manager", 3: "summit" };
          let ids = [];
          if (targetRole === 0) {
            const { rows: allIds } = await pool.query(`SELECT DISTINCT id FROM posts WHERE id != ''`);
            for (const row of allIds) {
              const r = await getRole(row.id);
              if (r === 0) ids.push(row.id);
            }
          } else {
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
          await pool.query(
            `UPDATE posts SET name='削除されました', content='削除されました', id='', deleted=TRUE WHERE content LIKE $1 OR id=$2`,
            [`%${target}%`, target]
          );
        }
      }
      commandMessage = "/destroy 実行完了";
    }

    // /topic
    const topicMatch = !commandMessage && content.match(/^\/topic\s+(.+)$/);
    if (topicMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await setSetting("topic", topicMatch[1].trim());
      commandMessage = `トピックを「${topicMatch[1].trim()}」に変更しました`;
    }

    // /NG 言葉 [...]
    const ngMatch = !commandMessage && content.match(/^\/NG\s+(.+)$/);
    if (ngMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const words = ngMatch[1].trim().split(/\s+/);
      for (const word of words) {
        await pool.query(`INSERT INTO ng_words (word) VALUES ($1) ON CONFLICT DO NOTHING`, [word]);
      }
      commandMessage = `NG登録: ${words.join(", ")}`;
    }

    // /OK 言葉 [...]
    const okMatch = !commandMessage && content.match(/^\/OK\s+(.+)$/);
    if (okMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const words = okMatch[1].trim().split(/\s+/);
      for (const word of words) {
        await pool.query(`DELETE FROM ng_words WHERE word=$1`, [word]);
      }
      commandMessage = `NG解除: ${words.join(", ")}`;
    }

    // /prevent
    if (!commandMessage && content.trim() === "/prevent") {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      await setSetting("prevent", "true");
      commandMessage = "青IDの投稿を禁止しました";
    }

    // /permit
    if (!commandMessage && content.trim() === "/permit") {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await setSetting("prevent", "false");
      commandMessage = "/prevent を解除しました";
    }

    // /restrict
    if (!commandMessage && content.trim() === "/restrict") {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      await setSetting("restrict", "true");
      commandMessage = "青IDのban制限を有効にしました";
    }

    // /stop
    if (!commandMessage && content.trim() === "/stop") {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      await setSetting("stop_until", String(Date.now() + 3 * 60 * 1000));
      commandMessage = "3分間青IDの投稿を禁止しました";
    }

    // /prohibit 分
    const prohibitMatch = !commandMessage && content.match(/^\/prohibit\s+(\d+)$/);
    if (prohibitMatch) {
      if (role < 4) return res.status(403).json({ error: "権限不足 (運営のみ)" });
      const minutes = parseInt(prohibitMatch[1]);
      await setSetting("prohibit_until", String(Date.now() + minutes * 60 * 1000));
      commandMessage = `${minutes}分間青IDの投稿を禁止しました`;
    }

    // /release
    if (!commandMessage && content.trim() === "/release") {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await setSetting("restrict",       "false");
      await setSetting("stop_until",     "0");
      await setSetting("prohibit_until", "0");
      commandMessage = "/restrict /stop /prohibit を解除しました";
    }

    // /speaker /manager /summit
    const promoteMatch = !commandMessage && content.match(/^\/(speaker|manager|summit)\s+(.+)$/i);
    if (promoteMatch) {
      const cmd = promoteMatch[1].toLowerCase();
      const targets = promoteMatch[2].trim().split(/\s+/);
      const grantLevel = { speaker: 1, manager: 2, summit: 3 }[cmd];
      const maxGrant   = role === 4 ? 3 : role === 3 ? 2 : role === 2 ? 1 : 0;
      if (role < 2 || grantLevel > maxGrant) return res.status(403).json({ error: "権限不足" });
      const tableMap = { 1: "speaker", 2: "manager", 3: "summit" };
      for (const targetId of targets) {
        const tid = targetId.startsWith("@") ? targetId : "@" + targetId;
        await pool.query(`INSERT INTO ${tableMap[grantLevel]} (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
        for (let l = 1; l < grantLevel; l++) {
          await pool.query(`DELETE FROM ${tableMap[l]} WHERE id=$1`, [tid]);
        }
      }
      commandMessage = `${targets.join(", ")} を ${cmd} に昇格しました`;
    }

    // /disspeaker /dismanager /dissummit /disself
    const demoteMatch = !commandMessage && content.match(/^\/(dis(?:speaker|manager|summit)|disself)\s*(.*)$/i);
    if (demoteMatch) {
      const cmd = demoteMatch[1].toLowerCase();
      if (cmd === "disself") {
        await pool.query(`DELETE FROM speaker WHERE id=$1`, [hashedId]);
        await pool.query(`DELETE FROM manager WHERE id=$1`, [hashedId]);
        await pool.query(`DELETE FROM summit  WHERE id=$1`, [hashedId]);
        commandMessage = "自分の権限を青IDにしました";
      } else {
        const targets = demoteMatch[2].trim().split(/\s+/).filter(Boolean);
        if (targets.length === 0) return res.status(400).json({ error: "ID指定必須" });
        const demoteCmd  = cmd.replace("dis", "");
        const demoteTo   = { speaker: 0, manager: 1, summit: 2 }[demoteCmd];
        const demoteFrom = { speaker: 1, manager: 2, summit: 3 }[demoteCmd];
        const maxDemote  = role === 4 ? 3 : role === 3 ? 2 : role === 2 ? 1 : 0;
        if (role < 2 || demoteFrom > maxDemote) return res.status(403).json({ error: "権限不足" });
        const tableMap = { 1: "speaker", 2: "manager", 3: "summit" };
        for (const targetId of targets) {
          const tid = targetId.startsWith("@") ? targetId : "@" + targetId;
          await pool.query(`DELETE FROM speaker WHERE id=$1`, [tid]);
          await pool.query(`DELETE FROM manager WHERE id=$1`, [tid]);
          await pool.query(`DELETE FROM summit  WHERE id=$1`, [tid]);
          if (demoteTo === 1) await pool.query(`INSERT INTO speaker (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
          if (demoteTo === 2) await pool.query(`INSERT INTO manager (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
        }
        commandMessage = `${targets.join(", ")} を降格しました`;
      }
    }

    // /kill ID [...]
    const killMatch = !commandMessage && content.match(/^\/kill\s+(.+)$/);
    if (killMatch) {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      const targets = killMatch[1].trim().split(/\s+/);
      for (const t of targets) {
        const tid = t.startsWith("@") ? t : "@" + t;
        await pool.query(`INSERT INTO kill_list (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
      }
      commandMessage = `${targets.join(", ")} をkillしました`;
    }

    // /ban ID/投稿番号 [...]
    const banMatch = !commandMessage && content.match(/^\/ban\s+(.+)$/);
    if (banMatch) {
      if (role < 3) return res.status(403).json({ error: "権限不足 (サミット以上必要)" });
      const targets = banMatch[1].trim().split(/\s+/);
      for (const t of targets) {
        if (/^\d+$/.test(t)) {
          const { rows } = await pool.query(`SELECT id FROM posts WHERE no=$1`, [parseInt(t)]);
          if (rows[0]?.id) await pool.query(`INSERT INTO ban (id) VALUES ($1) ON CONFLICT DO NOTHING`, [rows[0].id]);
        } else {
          const tid = t.startsWith("@") ? t : "@" + t;
          await pool.query(`INSERT INTO ban (id) VALUES ($1) ON CONFLICT DO NOTHING`, [tid]);
        }
      }
      commandMessage = "ban完了";
    }

    // /revive
    if (!commandMessage && content.trim() === "/revive") {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await pool.query(`DELETE FROM kill_list`);
      await pool.query(`DELETE FROM ban`);
      commandMessage = "kill/ban をすべて解除しました";
    }

    // /add ID サフィックス
    const addMatch = !commandMessage && content.match(/^\/add\s+(\S+)\s+(.+)$/);
    if (addMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const tid    = addMatch[1].startsWith("@") ? addMatch[1] : "@" + addMatch[1];
      const suffix = addMatch[2].trim();
      await pool.query(
        `INSERT INTO "add" (id, suffix) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET suffix=$2`,
        [tid, suffix]
      );
      commandMessage = `${tid} のsuffixを「${suffix}」に設定しました`;
    }

    // /color #カラーコード ID
    const colorMatch = !commandMessage && content.match(/^\/color\s+(#[0-9a-fA-F]{3,6})\s+(\S+)$/);
    if (colorMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const colorCode = colorMatch[1];
      const tid = colorMatch[2].startsWith("@") ? colorMatch[2] : "@" + colorMatch[2];
      await pool.query(
        `INSERT INTO color (id, color_code) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET color_code=$2`,
        [tid, colorCode]
      );
      commandMessage = `${tid} の色を ${colorCode} に設定しました`;
    }

    // /instances
    if (!commandMessage && content.trim() === "/instances") {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      const { rows } = await pool.query(`SELECT value FROM settings WHERE key='instances'`);
      commandMessage = `インスタンス: ${rows[0]?.value ?? "未登録"}`;
    }
    const instancesMatch = !commandMessage && content.match(/^\/instances\s+(.+)$/);
    if (instancesMatch) {
      if (role < 2) return res.status(403).json({ error: "権限不足 (マネージャー以上必要)" });
      await setSetting("instances", instancesMatch[1].trim());
      commandMessage = "インスタンスを登録しました";
    }

    // =====================
    // 通常投稿（コマンドの場合も投稿する）
    // =====================

    // 青IDの制限チェック（コマンドでない場合のみ）
    if (!commandMessage && role === 0) {
      if (await getSetting("prevent") === "true")
        return res.status(403).json({ error: "現在青IDは投稿できません (/prevent中)" });

      if (Date.now() < parseInt(await getSetting("stop_until") ?? "0"))
        return res.status(403).json({ error: "現在青IDは投稿できません (/stop中)" });

      if (Date.now() < parseInt(await getSetting("prohibit_until") ?? "0"))
        return res.status(403).json({ error: "現在青IDは投稿できません (/prohibit中)" });

      if (await getSetting("restrict") === "true") {
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

    await prunePostsIfNeeded();

    const time = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const postContent = commandMessage ? `[${commandMessage}] ${content}` : content;
    const { rows: inserted } = await pool.query(
      `INSERT INTO posts (name, content, id, time) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, postContent, hashedId, time]
    );

    requestTimestamps[pass] = now;
    res.status(200).json({
      message: commandMessage ? commandMessage : "投稿成功",
      post: inserted[0]
    });

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
  cwJobs[jobId] = { total: 0, done: 0, finished: false, unreadRooms: [], processedRooms: [], errors: [] };
  (async () => {
    try {
      const roomsRes = await axios.get("https://api.chatwork.com/v2/rooms", { headers: { "X-ChatWorkToken": apiKey } });
      const allRooms = roomsRes.data;
      const unreadRooms = allRooms.filter(r => r.unread_num && r.unread_num > 0);
      cwJobs[jobId].total = unreadRooms.length;
      cwJobs[jobId].unreadRooms = unreadRooms.map(r => ({ room_id: r.room_id, name: r.name, unread_num: r.unread_num }));
      if (unreadRooms.length === 0) { cwJobs[jobId].finished = true; return; }
      let index = 0;
      const interval = setInterval(async () => {
        if (index >= unreadRooms.length) { clearInterval(interval); cwJobs[jobId].finished = true; return; }
        const room = unreadRooms[index];
        try {
          await axios.put(`https://api.chatwork.com/v2/rooms/${room.room_id}/messages/read`, {}, { headers: { "X-ChatWorkToken": apiKey } });
          cwJobs[jobId].done++;
          cwJobs[jobId].processedRooms.push({ ...room, status: "success" });
        } catch (err) {
          const msg = err.response?.data?.errors?.[0] || err.message;
          cwJobs[jobId].errors.push({ room_id: room.room_id, name: room.name, error: msg });
        }
        index++;
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.errors?.[0] || err.message;
      cwJobs[jobId].finished = true;
      cwJobs[jobId].errors.push({ type: "api_error", error: msg });
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
    const roomsRes = await axios.get("https://api.chatwork.com/v2/rooms", { headers: { "X-ChatWorkToken": apiKey } });
    const allRooms = roomsRes.data;
    const unreadRooms = allRooms.filter(r => r.unread_num && r.unread_num > 0);
    res.json({ totalRooms: allRooms.length, unreadRooms: unreadRooms.map(r => ({ room_id: r.room_id, name: r.name, unread_num: r.unread_num })) });
  } catch (err) {
    const msg = err.response?.data?.errors?.[0] || err.message;
    res.status(500).json({ error: msg });
  }
});

// ----------------------
// サーバー起動
// ----------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`サーバーがポート ${PORT} で起動しました。`);
});
