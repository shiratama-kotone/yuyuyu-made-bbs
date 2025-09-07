// API設定
const SERVERS = {
  'chat': {
    name: '雑談',
    url: 'https://yuyuyu-made-bbs-server.onrender.com'
  },
  'lawless': {
    name: '無法地帯', 
    url: 'https://yuyuyu-made-bbs.onrender.com'
  }
};

let currentServer = 'chat';

// ダークモード
const btn = document.getElementById('toggleBtn');
const overlay = document.getElementById('overlay');
let inverted = false;

const enableDarkMode = () => {
  overlay.style.clipPath = 'circle(150% at 100% 100%)';
  btn.classList.add('white');
  btn.classList.remove('black');
  inverted = true;
  document.cookie = "darkmode=true; path=/";
};

const disableDarkMode = () => {
  overlay.style.clipPath = 'circle(0 at 100% 100%)';
  btn.classList.add('black');
  btn.classList.remove('white');
  inverted = false;
  document.cookie = "darkmode=false; path=/";
};

// 時計
const clock = document.getElementById('clock');
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  clock.textContent = `${h}:${m}:${s}`;
}

// HTMLデコード関数
function decodeHtml(encoded) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = encoded;
  return textArea.value;
}

// XSS対策のためのHTMLエスケープ関数（表示用）
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 現在のサーバーURLを取得
function getCurrentServerUrl() {
  return SERVERS[currentServer].url;
}

// API通信関数
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${getCurrentServerUrl()}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// サーバー切り替え関数
function switchServer(serverId) {
  if (SERVERS[serverId]) {
    currentServer = serverId;
    const serverSelect = document.getElementById('serverSelect');
    serverSelect.value = serverId;
    showMessage(`${SERVERS[serverId].name}に切り替えました`);
    updatePostsList(); // 新しいサーバーの投稿を読み込み
    // サーバー選択をCookieに保存
    document.cookie = `selectedServer=${serverId}; path=/`;
  }
}

// 投稿データとトピックを取得
async function loadData() {
  try {
    const data = await apiRequest('/api');
    return {
      posts: data.posts || [],
      topic: data.topic || 'フリートーク',
      nextPostNumber: data.nextPostNumber || 1
    };
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    throw error;
  }
}

// 新規投稿を送信（既存サーバーAPI対応）
async function createPost(postData) {
  try {
    const response = await apiRequest('/api', {
      method: 'POST',
      body: JSON.stringify({
        name: postData.name,
        pass: postData.password,  // サーバーは'pass'を期待
        content: postData.content
      })
    });
    return response;
  } catch (error) {
    console.error('投稿の送信に失敗しました:', error);
    throw error;
  }
}

// トピックを更新
function updateTopic(topicHtml) {
  const currentTopic = document.getElementById('currentTopic');
  // サーバーからのHTMLをデコードして表示
  const decodedTopic = decodeHtml(topicHtml);
  currentTopic.innerHTML = `今の話題：${decodedTopic}`;
}

// 投稿を表示する関数
function displayPost(post) {
  const tr = document.createElement('tr');
  
  // サーバーのデータ構造に対応
  const postNumber = post.no;
  const name = post.name; // 既にHTMLエスケープ済みの場合はそのまま使用
  const displayId = post.id;
  const content = post.content;
  const timestamp = post.time;
  
  // 管理者IDリストに基づく判定
  const ADMIN_IDS = [
    "@42d3e89",
    "@9b0919e", 
    "ざーこざーこばーかばーか",
    "@9303157",
    "@07fcc1a"
  ];
  const isAdmin = ADMIN_IDS.includes(displayId) || name.includes('class="summit"');
  
  tr.innerHTML = `
    <td>${postNumber}</td>
    <td>${name}</td>
    <td style="color: ${isAdmin ? 'red' : 'black'}">${displayId}</td>
    <td>${escapeHtml(content)}</td>
    <td>${timestamp}</td>
  `;
  return tr;
}

// 投稿一覧を更新する関数
async function updatePostsList() {
  const postsTableBody = document.querySelector("#postsTable tbody");
  
  try {
    // ローディング表示
    postsTableBody.innerHTML = '<tr><td colspan="5">読み込み中...</td></tr>';
    
    const data = await loadData();
    postsTableBody.innerHTML = '';
    
    // トピックも更新
    updateTopic(data.topic);
    
    if (data.posts.length === 0) {
      postsTableBody.innerHTML = '<tr><td colspan="5">投稿がありません</td></tr>';
      return;
    }
    
    // 投稿を表示（サーバーから既に適切な順序で返される）
    data.posts.forEach(post => {
      postsTableBody.appendChild(displayPost(post));
    });
      
  } catch (error) {
    postsTableBody.innerHTML = '<tr><td colspan="5">投稿の読み込みに失敗しました</td></tr>';
    showMessage('投稿の読み込みに失敗しました', 'error');
  }
}

// メッセージ表示関数
function showMessage(text, type = 'success') {
  const message = document.createElement('div');
  message.textContent = text;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 15px;
    border-radius: 5px;
    color: white;
    z-index: 1000;
    font-weight: bold;
    ${type === 'error' ? 'background: #f44336;' : 'background: #4CAF50;'}
  `;
  document.body.appendChild(message);
  setTimeout(() => message.remove(), 3000);
}

// サーバー選択UIの初期化
function initializeServerSelect() {
  const serverSelect = document.getElementById('serverSelect');
  if (serverSelect) {
    // セレクトボックスのオプションを生成
    Object.entries(SERVERS).forEach(([id, server]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = server.name;
      serverSelect.appendChild(option);
    });
    
    // 変更イベントリスナーを追加
    serverSelect.addEventListener('change', (e) => {
      switchServer(e.target.value);
    });
  }
}

// 投稿フォーム
const postForm = document.getElementById('postForm');

window.addEventListener('DOMContentLoaded', async () => {
  // 通知システムの初期化
  NotificationManager.init();
  
  // サーバー選択の初期化
  initializeServerSelect();
  
  // 保存されたサーバー設定を読み込み
  const serverCookie = document.cookie.split("; ").find(row => row.startsWith("selectedServer="));
  if (serverCookie) {
    const savedServer = serverCookie.split("=")[1];
    if (SERVERS[savedServer]) {
      currentServer = savedServer;
      document.getElementById('serverSelect').value = savedServer;
    }
  }
  
  // ダークモード設定の読み込み
  const darkModeCookie = document.cookie.split("; ").find(row => row.startsWith("darkmode="));
  if (darkModeCookie) {
    const darkModeValue = darkModeCookie.split("=")[1];
    if (darkModeValue === "true") enableDarkMode();
    else disableDarkMode();
  }
  
  // 時計の開始
  setInterval(updateClock, 1000);
  updateClock();
  
  // 投稿一覧とトピックの読み込み
  await updatePostsList();
  
  // 定期的に投稿一覧を更新（1秒ごと）
  setInterval(updatePostsList, 1000);
});

btn.addEventListener('click', () => {
  if (!inverted) enableDarkMode();
  else disableDarkMode();
});

postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('content').value.trim();
  const name = document.getElementById('name').value.trim();
  const password = document.getElementById('password').value;
  
  // 入力値検証
  if (!content || !name || !password) {
    showMessage('全ての項目を入力してください', 'error');
    return;
  }
  
  if (content.length > 1000) {
    showMessage('内容は1000文字以内で入力してください', 'error');
    return;
  }
  
  if (name.length > 50) {
    showMessage('名前は50文字以内で入力してください', 'error');
    return;
  }
  
  try {
    // 送信ボタンを無効化
    const submitBtn = postForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';
    
    // 既存サーバーのAPI形式に合わせて投稿データを作成
    const postData = {
      name: name,
      content: content,
      password: password
    };
    
    const response = await createPost(postData);
    
    // レスポンスに応じて処理
    if (response.message) {
      postForm.reset();
      showMessage(response.message);
      
      // 少し待ってから投稿一覧を更新（サーバー処理時間を考慮）
      setTimeout(updatePostsList, 500);
    } else {
      showMessage('投稿が完了しました');
      postForm.reset();
      setTimeout(updatePostsList, 500);
    }
    
  } catch (error) {
    // エラーメッセージの詳細表示
    let errorMsg = '投稿の送信に失敗しました';
    
    if (error.message.includes('429')) {
      errorMsg = '投稿間隔が短すぎます。少し待ってから再度お試しください';
    } else if (error.message.includes('400')) {
      errorMsg = '入力内容に問題があります';
    }
    
    showMessage(errorMsg, 'error');
    console.error('投稿エラー:', error);
  } finally {
    // 送信ボタンを復元
    const submitBtn = postForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = '送信';
  }
});

// ページの可視性が変わった時に更新（タブがアクティブになった時など）
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updatePostsList();
  }
});

// エラーハンドリング
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});
