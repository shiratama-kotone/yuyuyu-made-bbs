// API設定
var API_BASE_URL = 'https://yuyuyu-made-bbs-server.onrender.com';

// 絵文字定義
var EMOJI_MAP = {
  "(anger)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_anger.gif", alt: "(anger)" },
  "(beer)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_beer.gif", alt: "(beer)" },
  "(blush)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_blush.gif", alt: "(blush)" },
  "(bow)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_bow.gif", alt: "(bow)" },
  "(cake)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_cake.gif", alt: "(cake)" },
  "(clap)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_clap.gif", alt: "(clap)" },
  "(coffee)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_coffee.gif", alt: "(coffee)" },
  "(cracker)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_cracker.gif", alt: "(cracker)" },
  "(dance)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_dance.gif", alt: "(dance)" },
  "(devil)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_devil.gif", alt: "(devil)" },
  "(eat)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_eat.gif", alt: "(eat)" },
  "(flower)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_flower.gif", alt: "(flower)" },
  "(gogo)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_gogo.gif", alt: "(gogo)" },
  "(grin)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_grin.gif", alt: "(grin)" },
  "(handshake)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_handshake.gif", alt: "(handshake)" },
  "(heart)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_heart.gif", alt: "(heart)" },
  "(ikemen)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_ikemen.gif", alt: "(ikemen)" },
  "(kiss)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_kiss.gif", alt: "(kiss)" },
  "(komanechi)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_komanechi.gif", alt: "(komanechi)" },
  "(lightbulb)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_lightbulb.gif", alt: "(lightbulb)" },
  "(love)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_love.gif", alt: "(love)" },
  "(lucky)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_lucky.gif", alt: "(lucky)" },
  "(more_smile)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_more_smile.gif", alt: "(more_smile)" },
  "(mumu)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_mumu.gif", alt: "(mumu)" },
  "(muscle)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_muscle.gif", alt: "(muscle)" },
  "(ninmari)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_ninmari.gif", alt: "(ninmari)" },
  "(nod)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_nod.gif", alt: "(nod)" },
  "(otaku)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_otaku.gif", alt: "(otaku)" },
  "(please)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_please.gif", alt: "(please)" },
  "(puke)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_puke.gif", alt: "(puke)" },
  "(quick)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_quick.gif", alt: "(quick)" },
  "(roger)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_roger.gif", alt: "(roger)" },
  "(sad)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_sad.gif", alt: "(sad)" },
  "(shake)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_shake.gif", alt: "(shake)" },
  "(smile)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_smile.gif", alt: "(smile)" },
  "(snooze)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_snooze.gif", alt: "(snooze)" },
  "(star)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_star.gif", alt: "(star)" },
  "(surprise)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_surprise.gif", alt: "(surprise)" },
  "(sweat)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_sweat.gif", alt: "(sweat)" },
  "(talk)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_talk.gif", alt: "(talk)" },
  "(tears)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_tears.gif", alt: "(tears)" },
  "(think)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_think.gif", alt: "(think)" },
  "(tongueout)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_tongueout.gif", alt: "(tongueout)" },
  "(whew)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_whew.gif", alt: "(whew)" },
  "(wink)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wink.gif", alt: "(wink)" },
  "(wonder)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wonder.gif", alt: "(wonder)" },
  "(wry_smile)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wry_smile.gif", alt: "(wry_smile)" },
  "(yawn)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_yawn.gif", alt: "(yawn)" },
  "(yes)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_yes.gif", alt: "(yes)" }
};

// ダークモード管理（状態は cookie で保持）
var inverted = false;

// 時計アップデート関数
function updateClock(clockEl) {
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  var s = String(now.getSeconds()).padStart(2, '0');
  if (clockEl) clockEl.textContent = h + ':' + m + ':' + s;
}

// Cookieヘルパー
function setCookie(name, value, days) {
  days = typeof days === 'number' ? days : 30;
  var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}
function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return '';
}

// HTMLデコード
function decodeHtml(encoded) {
  var ta = document.createElement('textarea');
  ta.innerHTML = encoded;
  return ta.value;
}

// URL自動リンク化（末尾の句読点除く）
function autoLinkUrls(text) {
  if (!text) return '';
  // match url-like strings including protocol-less ones
  return text.replace(/(https?:\/\/[^\s<>"'））]+|(?:www\.)?[A-Za-z0-9][A-Za-z0-9-]*(?:\.[A-Za-z]{2,})(?:\/[^\s<>"']*)?)([.,;!?））]*)/gi, function(full, urlPart, trailing) {
    var clean = urlPart.replace(/[.,;!?]+$/, '');
    var punct = trailing || '';
    var href = clean.match(/^https?:\/\//i) ? clean : 'https://' + clean;
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">' + clean + '</a>' + punct;
  });
}

// >>番号をアンカー化
function autoLinkAnchors(text) {
  if (!text) return '';
  return text.replace(/>>(\d+)/g, function(_, num) {
    return '<a href="#' + num + '" style="color: #789922; text-decoration: none; font-weight: bold;">>>' + num + '</a>';
  });
}

// 絵文字変換（正規表現エスケープ済み）
function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function convertEmojis(text) {
  if (!text) return '';
  var result = text;
  Object.keys(EMOJI_MAP).forEach(function(code) {
    var emojiData = EMOJI_MAP[code];
    var regex = new RegExp(escapeForRegex(code), 'g');
    result = result.replace(regex, '<img src="' + emojiData.url + '" alt="' + emojiData.alt + '" class="emoji" style="width: 20px; height: 20px; vertical-align: middle;">');
  });
  return result;
}

// コンテンツ処理（URL→リンク、>>アンカー、絵文字変換）
// 注：HTMLはそのまま通す（既存の仕様に合わせる）
function processContent(content) {
  var processed = content || '';
  processed = autoLinkUrls(processed);
  processed = autoLinkAnchors(processed);
  processed = convertEmojis(processed);
  return processed;
}

// 通知マネージャー
var NotificationManager = {
  notifications: [],
  container: null,
  init: function() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000; pointer-events: none;';
    document.body.appendChild(this.container);
  },
  createNotificationElement: function(text, type) {
    var element = document.createElement('div');
    element.style.cssText = [
      'background:' + (type === 'error' ? '#f44336' : '#4CAF50'),
      'color: white',
      'padding: 12px 16px',
      'border-radius: 8px',
      'margin-bottom: 10px',
      'min-width: 300px',
      'max-width: 400px',
      'box-shadow: 0 4px 12px rgba(0,0,0,0.3)',
      "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      'font-size: 14px',
      'line-height: 1.4',
      'position: relative',
      'transform: translateX(100%)',
      'opacity: 0',
      'transition: all 0.3s cubic-bezier(0.4,0,0.2,1)',
      'pointer-events: auto',
      'word-wrap: break-word'
    ].join('; ');
    var messageSpan = document.createElement('span');
    messageSpan.textContent = text;
    messageSpan.style.cssText = 'display:block; padding-right:20px;';
    var closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = 'position:absolute; top:8px; right:8px; background:none; border:none; color:white; font-size:18px; font-weight:bold; cursor:pointer; padding:0; width:20px; height:20px; display:flex; align-items:center; justify-content:center; opacity:0.7; transition:opacity 0.2s;';
    closeButton.addEventListener('mouseenter', function(){ closeButton.style.opacity = '1'; });
    closeButton.addEventListener('mouseleave', function(){ closeButton.style.opacity = '0.7'; });
    element.appendChild(messageSpan);
    element.appendChild(closeButton);
    return { element: element, closeButton: closeButton };
  },
  show: function(text, type) {
    this.init();
    var obj = this.createNotificationElement(text, type);
    var id = Date.now() + Math.random();
    var item = { id: id, element: obj.element, autoHideTimer: null };
    this.notifications.push(item);
    this.container.appendChild(item.element);
    this.updatePositions();
    // アニメーションオン
    requestAnimationFrame(function() {
      item.element.style.transform = 'translateX(0)';
      item.element.style.opacity = '1';
    });
    // 自動削除
    item.autoHideTimer = setTimeout(function() { NotificationManager.hideById(id); }, 10000);
    // 閉じるボタン
    obj.closeButton.addEventListener('click', function() { NotificationManager.hideById(id); });
  },
  hideById: function(id) {
    var idx = -1;
    for (var i = 0; i < this.notifications.length; i++) {
      if (this.notifications[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return;
    var notification = this.notifications[idx];
    if (notification.autoHideTimer) clearTimeout(notification.autoHideTimer);
    notification.element.style.transform = 'translateX(100%)';
    notification.element.style.opacity = '0';
    setTimeout(function() {
      if (notification.element.parentNode) notification.element.remove();
      NotificationManager.notifications.splice(idx, 1);
      NotificationManager.updatePositions();
    }, 300);
  },
  updatePositions: function() {
    for (var i = 0; i < this.notifications.length; i++) {
      var bottomOffset = i * 70;
      this.notifications[i].element.style.marginBottom = (10 + bottomOffset) + 'px';
    }
  }
};

// showMessage 簡易ラッパー
function showMessage(text, type) {
  NotificationManager.show(text || '', type || 'success');
}

// API 通信（タイムアウト付き）
async function apiRequest(endpoint, options) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function() { controller.abort(); }, 5000);
  try {
    var resp = await fetch(API_BASE_URL + endpoint, Object.assign({
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    }, options || {}));
    clearTimeout(timeoutId);
    if (!resp.ok) throw new Error('HTTP error! status: ' + resp.status);
    return await resp.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('リクエストがタイムアウトしました');
    throw err;
  }
}

// サーバーからデータ取得
async function loadData() {
  var data = await apiRequest('/api');
  return { posts: data.posts || [], topic: data.topic || 'フリートーク', nextPostNumber: data.nextPostNumber || 1 };
}

// 投稿作成
async function createPost(postData) {
  return await apiRequest('/api', {
    method: 'POST',
    body: JSON.stringify({
      name: postData.name,
      pass: postData.password,
      content: postData.content
    })
  });
}

// トピック更新表示
function updateTopic(topicHtml) {
  var el = document.getElementById('currentTopic');
  if (!el) return;
  el.innerHTML = '今の話題：' + decodeHtml(topicHtml || '');
}

// 投稿表示（テーブルの行を返す）
function displayPost(post) {
  var tr = document.createElement('tr');
  var postNumber = post.no || '';
  var name = post.name || '';
  var displayId = post.id || '';
  var content = post.content || '';
  var timestamp = post.time || '';
  tr.id = postNumber;
  var ADMIN_IDS = ["@42d3e89", "@9b0919e", "ざーこざーこばーかばーか", "@9303157", "@07fcc1a"];
  var isAdmin = ADMIN_IDS.indexOf(displayId) !== -1 || (typeof name === 'string' && name.indexOf('class="summit"') !== -1);
  var processedContent = processContent(content);
  tr.innerHTML = ''
    + '<td><a href="#' + postNumber + '" style="color: #666; text-decoration: none;">' + postNumber + '</a></td>'
    + '<td>' + name + '</td>'
    + '<td style="color: ' + (isAdmin ? 'red' : 'black') + ';">' + displayId + '</td>'
    + '<td>' + processedContent + '</td>'
    + '<td>' + timestamp + '</td>';
  return tr;
}

// 絵文字パネル生成
function createEmojiPanel() {
  var panel = document.createElement('div');
  panel.id = 'emoji-panel';
  panel.style.cssText = [
    'display:none',
    'position:absolute',
    'background:white',
    'border:1px solid #ccc',
    'border-radius:8px',
    'padding:10px',
    'max-width:400px',
    'max-height:300px',
    'overflow-y:auto',
    'box-shadow:0 4px 12px rgba(0,0,0,0.2)',
    'z-index:1000',
    'display:grid',
    'grid-template-columns:repeat(auto-fit, minmax(30px, 1fr))',
    'gap:5px'
  ].join('; ');
  Object.keys(EMOJI_MAP).forEach(function(code) {
    var emojiData = EMOJI_MAP[code];
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '<img src="' + emojiData.url + '" alt="' + emojiData.alt + '" style="width:20px;height:20px;">';
    btn.title = code;
    btn.style.cssText = 'border:none; background:none; padding:5px; cursor:pointer; border-radius:4px; transition:background-color 0.2s;';
    btn.addEventListener('mouseenter', function() { btn.style.backgroundColor = '#f0f0f0'; });
    btn.addEventListener('mouseleave', function() { btn.style.backgroundColor = 'transparent'; });
    btn.addEventListener('click', function() {
      var contentInput = document.getElementById('content');
      if (!contentInput) return;
      var cursorPos = contentInput.selectionStart || contentInput.value.length;
      var textBefore = contentInput.value.substring(0, cursorPos);
      var textAfter = contentInput.value.substring(contentInput.selectionEnd || cursorPos);
      contentInput.value = textBefore + code + textAfter;
      contentInput.focus();
      var newPos = cursorPos + code.length;
      contentInput.setSelectionRange(newPos, newPos);
      panel.style.display = 'none';
    });
    panel.appendChild(btn);
  });
  document.body.appendChild(panel);
  return panel;
}

// 投稿一覧更新（重複実行防止）
var isUpdating = false;
async function updatePostsList() {
  if (isUpdating) return;
  var postsTableBody = document.querySelector('#postsTable tbody');
  if (!postsTableBody) return;
  try {
    isUpdating = true;
    if (postsTableBody.children.length === 0) {
      postsTableBody.innerHTML = '<tr><td colspan="5">読み込み中...</td></tr>';
    }
    var data = await loadData();
    postsTableBody.innerHTML = '';
    updateTopic(data.topic);
    if (!data.posts || data.posts.length === 0) {
      postsTableBody.innerHTML = '<tr><td colspan="5">投稿がありません</td></tr>';
      return;
    }
    data.posts.forEach(function(post) {
      postsTableBody.appendChild(displayPost(post));
    });
  } catch (err) {
    console.error('投稿取得エラー:', err);
    if (postsTableBody.children.length === 0 || postsTableBody.innerHTML.indexOf('読み込み中') !== -1) {
      postsTableBody.innerHTML = '<tr><td colspan="5" style="color:red;">投稿の読み込みに失敗しました</td></tr>';
    }
    if (err.message && (err.message.indexOf('タイムアウト') !== -1 || err.message.indexOf('Failed to fetch') !== -1)) {
      showMessage('サーバーとの接続に失敗しました', 'error');
    }
  } finally {
    isUpdating = false;
  }
}

// DOM ができてから初期化
document.addEventListener('DOMContentLoaded', function() {
  // 要素取得（存在チェック）
  var btn = document.getElementById('toggleBtn');
  var overlay = document.getElementById('overlay');
  var clockEl = document.getElementById('clock');
  var postForm = document.getElementById('postForm');
  var contentInput = document.getElementById('content');

  // 通知初期化
  NotificationManager.init();

  // 絵文字パネル作成＆ボタン
  var emojiPanel = createEmojiPanel();
  var emojiButton = document.createElement('button');
  emojiButton.type = 'button';
  emojiButton.innerHTML = '😊';
  emojiButton.title = '絵文字を選択';
  emojiButton.style.cssText = 'margin-left:10px; padding:8px 12px; border:1px solid #ddd; border-radius:4px; background:#f9f9f9; cursor:pointer; font-size:16px;';
  if (contentInput && contentInput.parentNode) contentInput.parentNode.insertBefore(emojiButton, contentInput.nextSibling);
  emojiButton.addEventListener('click', function(e) {
    e.preventDefault();
    var rect = emojiButton.getBoundingClientRect();
    emojiPanel.style.display = (emojiPanel.style.display === 'grid' ? 'none' : 'grid');
    emojiPanel.style.left = rect.left + 'px';
    emojiPanel.style.top = (rect.bottom + 5) + 'px';
  });
  // パネル外クリックで閉じる
  document.addEventListener('click', function(e) {
    if (!emojiPanel.contains(e.target) && e.target !== emojiButton) emojiPanel.style.display = 'none';
  });

  // ダークモードの読み込み/管理
  function enableDarkMode() {
    if (overlay) overlay.style.clipPath = 'circle(150% at 100% 100%)';
    if (btn) { btn.classList.add('white'); btn.classList.remove('black'); }
    inverted = true;
    setCookie('darkmode', 'true', 365);
  }
  function disableDarkMode() {
    if (overlay) overlay.style.clipPath = 'circle(0 at 100% 100%)';
    if (btn) { btn.classList.add('black'); btn.classList.remove('white'); }
    inverted = false;
    setCookie('darkmode', 'false', 365);
  }
  // cookieから読み込む
  var darkModeCookie = (document.cookie || '').split('; ').find(function(row){ return row.indexOf('darkmode=') === 0; });
  if (darkModeCookie) {
    var v = darkModeCookie.split('=')[1];
    if (v === 'true') enableDarkMode(); else disableDarkMode();
  } else {
    disableDarkMode();
  }
  if (btn) {
    btn.addEventListener('click', function() {
      if (!inverted) enableDarkMode(); else disableDarkMode();
    });
  }

  // 時計開始
  updateClock(clockEl);
  setInterval(function(){ updateClock(clockEl); }, 1000);

  // 名前・パスワード復元
  var savedName = getCookie('bbsUserName');
  var savedPassword = getCookie('bbsUserPassword');
  if (savedName) {
    var nameEl = document.getElementById('name');
    if (nameEl) nameEl.value = savedName;
  }
  if (savedPassword) {
    var passEl = document.getElementById('password');
    if (passEl) passEl.value = savedPassword;
  }

  // 初回投稿一覧読み込み
  updatePostsList();

  // 定期更新（3秒ごと）
  setInterval(updatePostsList, 3000);

  // visibilitychange 対応
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) updatePostsList();
  });

  // 投稿フォーム submit
  if (postForm) {
    postForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var content = (document.getElementById('content') && document.getElementById('content').value || '').trim();
      var name = (document.getElementById('name') && document.getElementById('name').value || '').trim();
      var password = (document.getElementById('password') && document.getElementById('password').value || '');
      if (!content || !name || !password) { showMessage('全ての項目を入力してください', 'error'); return; }
      if (content.length > 1000) { showMessage('内容は1000文字以内で入力してください', 'error'); return; }
      if (name.length > 50) { showMessage('名前は50文字以内で入力してください', 'error'); return; }
      var submitBtn = postForm.querySelector('button[type="submit"]');
      try {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '送信中...'; }
        var postData = { name: name, content: content, password: password };
        var response = await createPost(postData);
        // Cookie に保存（名前とパスワード）
        setCookie('bbsUserName', name);
        setCookie('bbsUserPassword', password);
        // 内容欄クリア
        var contentEl = document.getElementById('content');
        if (contentEl) contentEl.value = '';
        if (response && response.message) {
          showMessage(response.message);
        } else {
          showMessage('投稿が完了しました');
        }
        // 少し待って更新（サーバー処理を考慮）
        setTimeout(updatePostsList, 500);
      } catch (err) {
        var errorMsg = '投稿の送信に失敗しました';
        if (err && err.message && err.message.indexOf('429') !== -1) errorMsg = '投稿間隔が短すぎます。少し待ってから再度お試しください';
        else if (err && err.message && err.message.indexOf('400') !== -1) errorMsg = '入力内容に問題があります';
        showMessage(errorMsg, 'error');
        console.error('投稿エラー:', err);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '送信'; }
      }
    });
  }

  // グローバルなエラー監視
  window.addEventListener('error', function(e) { console.error('JavaScript Error:', e.error || e); });
  window.addEventListener('unhandledrejection', function(e) { console.error('Unhandled Promise Rejection:', e.reason || e); });
});
