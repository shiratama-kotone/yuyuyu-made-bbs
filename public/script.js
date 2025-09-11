// API設定
const API_BASE_URL = 'https://yuyuyu-made-bbs-server.onrender.com';

// 絵文字定義
const EMOJI_MAP = {
  "(anger)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_anger.gif", alt: "(anger)", },
  "(beer)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_beer.gif", alt: "(beer)", },
  "(blush)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_blush.gif", alt: "(blush)", },
  "(bow)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_bow.gif", alt: "(bow)", },
  "(cake)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_cake.gif", alt: "(cake)", },
  "(clap)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_clap.gif", alt: "(clap)", },
  "(coffee)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_coffee.gif", alt: "(coffee)", },
  "(cracker)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_cracker.gif", alt: "(cracker)", },
  "(dance)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_dance.gif", alt: "(dance)", },
  "(devil)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_devil.gif", alt: "(devil)", },
  "(eat)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_eat.gif", alt: "(eat)", },
  "(flower)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_flower.gif", alt: "(flower)", },
  "(gogo)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_gogo.gif", alt: "(gogo)", },
  "(grin)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_grin.gif", alt: "(grin)", },
  "(handshake)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_handshake.gif", alt: "(handshake)", },
  "(heart)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_heart.gif", alt: "(heart)", },
  "(ikemen)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_ikemen.gif", alt: "(ikemen)", },
  "(kiss)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_kiss.gif", alt: "(kiss)", },
  "(komanechi)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_komanechi.gif", alt: "(komanechi)", },
  "(lightbulb)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_lightbulb.gif", alt: "(lightbulb)", },
  "(love)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_love.gif", alt: "(love)", },
  "(lucky)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_lucky.gif", alt: "(lucky)", },
  "(more_smile)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_more_smile.gif", alt: "(more_smile)", },
  "(mumu)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_mumu.gif", alt: "(mumu)", },
  "(muscle)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_muscle.gif", alt: "(muscle)", },
  "(ninmari)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_ninmari.gif", alt: "(ninmari)", },
  "(nod)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_nod.gif", alt: "(nod)", },
  "(otaku)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_otaku.gif", alt: "(otaku)", },
  "(please)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_please.gif", alt: "(please)", },
  "(puke)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_puke.gif", alt: "(puke)", },
  "(quick)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_quick.gif", alt: "(quick)", },
  "(roger)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_roger.gif", alt: "(roger)", },
  "(sad)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_sad.gif", alt: "(sad)", },
  "(shake)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_shake.gif", alt: "(shake)", },
  "(smile)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_smile.gif", alt: "(smile)", },
  "(snooze)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_snooze.gif", alt: "(snooze)", },
  "(star)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_star.gif", alt: "(star)", },
  "(surprise)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_surprise.gif", alt: "(surprise)", },
  "(sweat)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_sweat.gif", alt: "(sweat)", },
  "(talk)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_talk.gif", alt: "(talk)", },
  "(tears)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_tears.gif", alt: "(tears)", },
  "(think)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_think.gif", alt: "(think)", },
  "(tongueout)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_tongueout.gif", alt: "(tongueout)", },
  "(whew)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_whew.gif", alt: "(whew)", },
  "(wink)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wink.gif", alt: "(wink)", },
  "(wonder)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wonder.gif", alt: "(wonder)", },
  "(wry_smile)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wry_smile.gif", alt: "(wry_smile)", },
  "(yawn)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_yawn.gif", alt: "(yawn)", },
  "(yes)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_yes.gif", alt: "(yes)", },
};

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

// 危険なHTMLタグをサニタイズする関数
function sanitizeHtml(html) {
  // 危険なタグを除外
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link', 'style'];
  let sanitized = html;
  
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // javascript: プロトコルを除去
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // on* イベントハンドラーを除去
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^>]*/gi, '');
  
  return sanitized;
}

// 絵文字を画像に変換する関数
function convertEmojis(text) {
  let result = text;
  
  Object.entries(EMOJI_MAP).forEach(([emojiCode, emojiData]) => {
    const regex = new RegExp(emojiCode.replace(/[()]/g, '\\$&'), 'g');
    result = result.replace(regex, `<img src="${emojiData.url}" alt="${emojiData.alt}" class="emoji" style="width: 20px; height: 20px; vertical-align: middle;">`);
  });
  
  return result;
}

// URLを自動的にリンク化する関数
function autoLinkUrls(text) {
  // URL正規表現（http/https対応）
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  
  return text.replace(urlRegex, (url) => {
    // URLの末尾の句読点を除外
    const cleanUrl = url.replace(/[.,;!?]+$/, '');
    const punctuation = url.slice(cleanUrl.length);
    
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${cleanUrl}</a>${punctuation}`;
  });
}

// コンテンツを処理する関数（HTML許可 + 絵文字変換 + URL自動リンク化）
function processContent(content) {
  // まずURLを自動リンク化
  let processed = autoLinkUrls(content);
  
  // 次に絵文字を変換
  processed = convertEmojis(processed);
  
  // HTMLはそのまま通す（サニタイズしない）
  processed = sanitizeHtml(processed);
  
  return processed;
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

// 投稿を表示する関数（HTML対応版）
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
  
  // コンテンツを処理（絵文字変換 + HTMLサニタイズ）
  const processedContent = processContent(content);
  
  tr.innerHTML = `
    <td>${postNumber}</td>
    <td>${name}</td>
    <td style="color: ${isAdmin ? 'red' : 'black'}">${displayId}</td>
    <td>${processedContent}</td>
    <td>${timestamp}</td>
  `;
  return tr;
}

// 絵文字入力パネルの作成
function createEmojiPanel() {
  const panel = document.createElement('div');
  panel.id = 'emoji-panel';
  panel.style.cssText = `
    display: none;
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    max-width: 400px;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
    gap: 5px;
  `;
  
  // 絵文字ボタンを作成
  Object.entries(EMOJI_MAP).forEach(([emojiCode, emojiData]) => {
    const emojiBtn = document.createElement('button');
    emojiBtn.innerHTML = `<img src="${emojiData.url}" alt="${emojiData.alt}" style="width: 20px; height: 20px;">`;
    emojiBtn.title = emojiCode;
    emojiBtn.style.cssText = `
      border: none;
      background: none;
      padding: 5px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    `;
    
    emojiBtn.addEventListener('mouseenter', () => {
      emojiBtn.style.backgroundColor = '#f0f0f0';
    });
    
    emojiBtn.addEventListener('mouseleave', () => {
      emojiBtn.style.backgroundColor = 'transparent';
    });
    
    emojiBtn.addEventListener('click', () => {
      const contentInput = document.getElementById('content');
      const cursorPos = contentInput.selectionStart;
      const textBefore = contentInput.value.substring(0, cursorPos);
      const textAfter = contentInput.value.substring(contentInput.selectionEnd);
      
      contentInput.value = textBefore + emojiCode + textAfter;
      contentInput.focus();
      contentInput.setSelectionRange(cursorPos + emojiCode.length, cursorPos + emojiCode.length);
      
      panel.style.display = 'none';
    });
    
    panel.appendChild(emojiBtn);
  });
  
  return panel;
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
  
  // 絵文字パネルの追加
  const emojiPanel = createEmojiPanel();
  document.body.appendChild(emojiPanel);
  
  // 絵文字ボタンの追加
  const emojiButton = document.createElement('button');
  emojiButton.type = 'button';
  emojiButton.innerHTML = '😊';
  emojiButton.style.cssText = `
    margin-left: 10px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 16px;
  `;
  emojiButton.title = '絵文字を選択';
  
  // フォームの内容入力欄の後に絵文字ボタンを追加
  const contentInput = document.getElementById('content');
  contentInput.parentNode.insertBefore(emojiButton, contentInput.nextSibling);
  
  emojiButton.addEventListener('click', (e) => {
    e.preventDefault();
    const rect = emojiButton.getBoundingClientRect();
    emojiPanel.style.display = emojiPanel.style.display === 'grid' ? 'none' : 'grid';
    emojiPanel.style.left = rect.left + 'px';
    emojiPanel.style.top = (rect.bottom + 5) + 'px';
  });
  
  // パネル外クリックで閉じる
  document.addEventListener('click', (e) => {
    if (!emojiPanel.contains(e.target) && e.target !== emojiButton) {
      emojiPanel.style.display = 'none';
    }
  });
  
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

// 絵文字一覧を表示する関数（デバッグ用）
function showAvailableEmojis() {
  console.log('利用可能な絵文字:');
  Object.keys(EMOJI_MAP).forEach(emoji => {
    console.log(emoji);
  });
}

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
