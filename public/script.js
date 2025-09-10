// API設定
const API_BASE_URL = 'https://yuyuyu-made-bbs-server.onrender.com';

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

// 通知システム
const NotificationManager = {
  notifications: [],
  container: null,
  
  init() {
    // 通知コンテナを作成
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  },
  
  show(text, type = 'success') {
    const notification = this.createNotification(text, type);
    this.notifications.push(notification);
    this.container.appendChild(notification.element);
    
    // 既存の通知を上に移動
    this.updatePositions();
    
    // アニメーション開始
    requestAnimationFrame(() => {
      notification.element.style.transform = 'translateX(0)';
      notification.element.style.opacity = '1';
    });
    
    // 10秒後に自動削除
    notification.autoHideTimer = setTimeout(() => {
      this.hide(notification);
    }, 10000);
  },
  
  createNotification(text, type) {
    const element = document.createElement('div');
    const id = Date.now() + Math.random();
    
    element.style.cssText = `
      background: ${type === 'error' ? '#f44336' : '#4CAF50'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 10px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: auto;
      word-wrap: break-word;
    `;
    
    // メッセージ部分
    const messageSpan = document.createElement('span');
    messageSpan.textContent = text;
    messageSpan.style.cssText = `
      display: block;
      padding-right: 20px;
    `;
    
    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.opacity = '1';
    });
    
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.opacity = '0.7';
    });
    
    element.appendChild(messageSpan);
    element.appendChild(closeButton);
    
    const notification = {
      id,
      element,
      autoHideTimer: null
    };
    
    closeButton.addEventListener('click', () => {
      this.hide(notification);
    });
    
    return notification;
  },
  
  hide(notification) {
    if (notification.autoHideTimer) {
      clearTimeout(notification.autoHideTimer);
    }
    
    // アニメーションで消去
    notification.element.style.transform = 'translateX(100%)';
    notification.element.style.opacity = '0';
    
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.remove();
      }
      
      // 配列から削除
      const index = this.notifications.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
      
      // 残りの通知の位置を更新
      this.updatePositions();
    }, 300);
  },
  
  updatePositions() {
    // 通知を下から上に向かって配置
    this.notifications.forEach((notification, index) => {
      const bottomOffset = index * 70; // 各通知の高さ + マージン
      notification.element.style.marginBottom = `${10 + bottomOffset}px`;
    });
  }
};

// メッセージ表示関数（新しい通知システムを使用）
function showMessage(text, type = 'success') {
  if (!NotificationManager.container) {
    NotificationManager.init();
  }
  NotificationManager.show(text, type);
}

// API通信関数（タイムアウト付き）
async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒でタイムアウト
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: controller.signal,
      ...options
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('リクエストがタイムアウトしました');
    }
    throw error;
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

// 投稿一覧を更新する関数（エラーハンドリング改善）
let isUpdating = false;
async function updatePostsList() {
  if (isUpdating) return; // 重複実行防止
  
  const postsTableBody = document.querySelector("#postsTable tbody");
  
  try {
    isUpdating = true;
    
    // 初回読み込み時のみローディング表示
    if (postsTableBody.children.length === 0) {
      postsTableBody.innerHTML = '<tr><td colspan="5">読み込み中...</td></tr>';
    }
    
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
    console.error('投稿取得エラー:', error);
    
    // 初回読み込み時のみエラー表示
    if (postsTableBody.children.length === 0 || postsTableBody.innerHTML.includes('読み込み中')) {
      postsTableBody.innerHTML = '<tr><td colspan="5" style="color: red;">投稿の読み込みに失敗しました</td></tr>';
    }
    
    // ネットワークエラーやタイムアウトの場合のみ通知
    if (error.message.includes('タイムアウト') || error.message.includes('Failed to fetch')) {
      showMessage('サーバーとの接続に失敗しました', 'error');
    }
  } finally {
    isUpdating = false;
  }
}

// 投稿フォーム
const postForm = document.getElementById('postForm');

window.addEventListener('DOMContentLoaded', async () => {
  // 通知システムの初期化
  NotificationManager.init();
  
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
  
  // 初回の投稿一覧読み込み
  await updatePostsList();
  
  // 定期的に投稿一覧を更新（3秒ごと）
  setInterval(updatePostsList, 3000);
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
