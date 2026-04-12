// =====================
// サーバー設定
// =====================
var SERVERS = {
  chat:   { name: '雑談',            url: 'https://yuyuyu-made-bbs-server.onrender.com' },
  battle: { name: 'バトルスタジアム', url: 'https://yuyuyu-made-bbs.onrender.com' }
};
var currentServer = 'chat';

function switchServer(key) {
  currentServer = key;
  document.getElementById('tab-chat').classList.toggle('active', key === 'chat');
  document.getElementById('tab-battle').classList.toggle('active', key === 'battle');
  var tbody = document.querySelector('#postsTable tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="3">読み込み中...</td></tr>';
  updatePostsList();
}

function apiUrl() { return SERVERS[currentServer].url; }

// =====================
// 絵文字定義
// =====================
var EMOJI_MAP = {
  "(anger)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_anger.gif",      alt: "(anger)" },
  "(beer)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_beer.gif",       alt: "(beer)" },
  "(blush)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_blush.gif",      alt: "(blush)" },
  "(bow)":        { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_bow.gif",        alt: "(bow)" },
  "(cake)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_cake.gif",       alt: "(cake)" },
  "(clap)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_clap.gif",       alt: "(clap)" },
  "(coffee)":     { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_coffee.gif",     alt: "(coffee)" },
  "(cracker)":    { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_cracker.gif",    alt: "(cracker)" },
  "(dance)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_dance.gif",      alt: "(dance)" },
  "(devil)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_devil.gif",      alt: "(devil)" },
  "(eat)":        { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_eat.gif",        alt: "(eat)" },
  "(flower)":     { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_flower.gif",     alt: "(flower)" },
  "(gogo)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_gogo.gif",       alt: "(gogo)" },
  "(grin)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_grin.gif",       alt: "(grin)" },
  "(handshake)":  { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_handshake.gif",  alt: "(handshake)" },
  "(heart)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_heart.gif",      alt: "(heart)" },
  "(ikemen)":     { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_ikemen.gif",     alt: "(ikemen)" },
  "(kiss)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_kiss.gif",       alt: "(kiss)" },
  "(komanechi)":  { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_komanechi.gif",  alt: "(komanechi)" },
  "(lightbulb)":  { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_lightbulb.gif",  alt: "(lightbulb)" },
  "(love)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_love.gif",       alt: "(love)" },
  "(lucky)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_lucky.gif",      alt: "(lucky)" },
  "(more_smile)": { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_more_smile.gif", alt: "(more_smile)" },
  "(mumu)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_mumu.gif",       alt: "(mumu)" },
  "(muscle)":     { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_muscle.gif",     alt: "(muscle)" },
  "(ninmari)":    { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_ninmari.gif",    alt: "(ninmari)" },
  "(nod)":        { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_nod.gif",        alt: "(nod)" },
  "(otaku)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_otaku.gif",      alt: "(otaku)" },
  "(please)":     { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_please.gif",     alt: "(please)" },
  "(puke)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_puke.gif",       alt: "(puke)" },
  "(quick)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_quick.gif",      alt: "(quick)" },
  "(roger)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_roger.gif",      alt: "(roger)" },
  "(sad)":        { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_sad.gif",        alt: "(sad)" },
  "(shake)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_shake.gif",      alt: "(shake)" },
  "(smile)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_smile.gif",      alt: "(smile)" },
  "(snooze)":     { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_snooze.gif",     alt: "(snooze)" },
  "(star)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_star.gif",       alt: "(star)" },
  "(surprise)":   { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_surprise.gif",   alt: "(surprise)" },
  "(sweat)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_sweat.gif",      alt: "(sweat)" },
  "(talk)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_talk.gif",       alt: "(talk)" },
  "(tears)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_tears.gif",      alt: "(tears)" },
  "(think)":      { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_think.gif",      alt: "(think)" },
  "(tongueout)":  { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_tongueout.gif",  alt: "(tongueout)" },
  "(whew)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_whew.gif",       alt: "(whew)" },
  "(wink)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wink.gif",       alt: "(wink)" },
  "(wonder)":     { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wonder.gif",     alt: "(wonder)" },
  "(wry_smile)":  { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_wry_smile.gif",  alt: "(wry_smile)" },
  "(yawn)":       { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_yawn.gif",       alt: "(yawn)" },
  "(yes)":        { url: "https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/emo_yes.gif",        alt: "(yes)" }
};

// =====================
// ユーティリティ
// =====================
var inverted = false;

function updateClock() {
  var el = document.getElementById('clock');
  if (!el) return;
  var now = new Date();
  el.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
}

function setCookie(name, value, days) {
  days = typeof days === 'number' ? days : 30;
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + new Date(Date.now() + days * 86400000).toUTCString() + '; path=/';
}
function getCookie(name) {
  var parts = ('; ' + document.cookie).split('; ' + name + '=');
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return '';
}

function decodeHtml(s) {
  var ta = document.createElement('textarea');
  ta.innerHTML = s;
  return ta.value;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function autoLinkUrls(text) {
  if (!text) return '';
  return text.replace(/(https?:\/\/[^\s<>"'））]+|(?:www\.)?[A-Za-z0-9][A-Za-z0-9-]*(?:\.[A-Za-z]{2,})(?:\/[^\s<>"']*)?)([.,;!?））]*)/gi, function(full, url, trail) {
    var clean = url.replace(/[.,;!?]+$/, '');
    var href = clean.match(/^https?:\/\//i) ? clean : 'https://' + clean;
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer" style="color:#0066cc;text-decoration:underline;">' + escapeHtml(clean) + '</a>' + (trail || '');
  });
}

function autoLinkAnchors(text) {
  if (!text) return '';
  return text.replace(/>>(\d+)/g, '<a href="#$1" style="color:#789922;text-decoration:none;font-weight:bold;">&gt;&gt;$1</a>');
}

function escapeForRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function convertEmojis(text) {
  if (!text) return '';
  Object.keys(EMOJI_MAP).forEach(function(code) {
    var d = EMOJI_MAP[code];
    text = text.replace(new RegExp(escapeForRegex(code), 'g'), '<img src="' + d.url + '" alt="' + d.alt + '" class="emoji">');
  });
  return text;
}

function processContent(content) {
  var s = content || '';
  s = autoLinkUrls(s);
  s = autoLinkAnchors(s);
  s = convertEmojis(s);
  return s;
}

// =====================
// 通知
// =====================
var NotificationManager = {
  notifications: [],
  container: null,
  init: function() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;pointer-events:none;';
    document.body.appendChild(this.container);
  },
  show: function(text, type) {
    this.init();
    var el = document.createElement('div');
    el.style.cssText = [
      'background:' + (type === 'error' ? '#f44336' : '#4CAF50'),
      'color:#fff',
      'padding:12px 36px 12px 16px',
      'border-radius:8px',
      'margin-bottom:10px',
      'min-width:260px',
      'max-width:380px',
      'box-shadow:0 4px 12px rgba(0,0,0,0.25)',
      'font-size:14px',
      'position:relative',
      'transform:translateX(120%)',
      'opacity:0',
      'transition:all 0.3s',
      'pointer-events:auto',
      'word-wrap:break-word',
      "font-family:'M PLUS 1p',sans-serif"
    ].join(';');
    var span = document.createElement('span');
    span.textContent = text;
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = 'position:absolute;top:8px;right:8px;background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:0;line-height:1;';
    el.appendChild(span);
    el.appendChild(closeBtn);
    this.container.appendChild(el);
    var id = Date.now() + Math.random();
    var item = { id: id, el: el, timer: null };
    this.notifications.push(item);
    requestAnimationFrame(function() { el.style.transform = 'translateX(0)'; el.style.opacity = '1'; });
    item.timer = setTimeout(function() { NotificationManager.hide(id); }, 8000);
    closeBtn.addEventListener('click', function() { NotificationManager.hide(id); });
  },
  hide: function(id) {
    for (var i = 0; i < this.notifications.length; i++) {
      if (this.notifications[i].id === id) {
        var n = this.notifications[i];
        clearTimeout(n.timer);
        n.el.style.transform = 'translateX(120%)';
        n.el.style.opacity = '0';
        var self = this; var idx = i;
        setTimeout(function() { if (n.el.parentNode) n.el.remove(); self.notifications.splice(idx, 1); }, 300);
        break;
      }
    }
  }
};

function showMessage(text, type) { NotificationManager.show(text || '', type || 'success'); }

// =====================
// API通信
// =====================
async function apiRequest(endpoint, options) {
  var ctrl = new AbortController();
  var tid = setTimeout(function() { ctrl.abort(); }, 5000);
  try {
    var resp = await fetch(apiUrl() + endpoint, Object.assign({ headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal }, options || {}));
    clearTimeout(tid);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return await resp.json();
  } catch(e) {
    clearTimeout(tid);
    if (e.name === 'AbortError') throw new Error('タイムアウト');
    throw e;
  }
}

async function loadData() {
  var d = await apiRequest('/api');
  return { posts: d.posts || [], topic: d.topic || '' };
}

async function createPost(postData) {
  return await apiRequest('/api', {
    method: 'POST',
    body: JSON.stringify({ name: postData.name, pass: postData.password, content: postData.content })
  });
}

// =====================
// 投稿表示
// =====================
function updateTopic(t) {
  var el = document.getElementById('currentTopic');
  if (el) el.innerHTML = '今の話題：' + decodeHtml(t || '');
}

var ADMIN_IDS = ["@42d3e89", "@9b0919e", "ざーこざーこばーかばーか", "@9303157", "@07fcc1a"];

function getIdClass(post) {
  if (post.role !== undefined) {
    return ['role-blue', 'role-speaker', 'role-manager', 'role-summit', 'role-admin'][post.role] || 'role-blue';
  }
  if (ADMIN_IDS.indexOf(post.id) !== -1) return 'role-admin';
  return 'role-blue';
}

function displayPost(post) {
  var tr = document.createElement('tr');
  tr.id = String(post.no);

  var no      = post.no || '';
  var name    = escapeHtml(post.name      || '');
  var id      = escapeHtml(post.id        || '');
  var add     = escapeHtml(post.addSuffix || '');
  var color   = post.colorCode || null;
  var content = processContent(post.content || '');

  var idClass   = getIdClass(post);
  var nameStyle = color ? 'style="color:' + escapeHtml(color) + ';"' : '';

  var tdNo = '<td><a href="#' + no + '" class="post-no-link">' + no + '</a></td>';

  var tdInfo = '<td>'
    + '<div class="info-name" ' + nameStyle + '>' + name + '</div>'
    + (id ? '<div class="info-id ' + idClass + '">' + id + (add ? ' <span class="info-add">' + add + '</span>' : '') + '</div>' : '')
    + '</td>';

  var tdContent = '<td>' + content + '</td>';

  tr.innerHTML = tdNo + tdInfo + tdContent;
  return tr;
}

var isUpdating = false;
async function updatePostsList() {
  if (isUpdating) return;
  var tbody = document.querySelector('#postsTable tbody');
  if (!tbody) return;
  try {
    isUpdating = true;
    if (tbody.children.length === 0) tbody.innerHTML = '<tr><td colspan="3">読み込み中...</td></tr>';
    var data = await loadData();
    updateTopic(data.topic);
    tbody.innerHTML = '';
    if (!data.posts || data.posts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">投稿がありません</td></tr>';
      return;
    }
    data.posts.forEach(function(p) { tbody.appendChild(displayPost(p)); });
  } catch(e) {
    console.error(e);
    if (tbody.children.length === 0 || tbody.innerHTML.indexOf('読み込み中') !== -1) {
      tbody.innerHTML = '<tr><td colspan="3" style="color:red;">読み込み失敗</td></tr>';
    }
  } finally {
    isUpdating = false;
  }
}

// =====================
// 絵文字パネル
// =====================
function createEmojiPanel() {
  var panel = document.createElement('div');
  panel.id = 'emoji-panel';
  document.body.appendChild(panel);
  Object.keys(EMOJI_MAP).forEach(function(code) {
    var d = EMOJI_MAP[code];
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '<img src="' + d.url + '" alt="' + d.alt + '" style="width:22px;height:22px;">';
    btn.title = code;
    btn.addEventListener('click', function() {
      var inp = document.getElementById('content');
      if (!inp) return;
      var s = inp.selectionStart || inp.value.length;
      var e2 = inp.selectionEnd || s;
      inp.value = inp.value.substring(0, s) + code + inp.value.substring(e2);
      inp.focus();
      inp.setSelectionRange(s + code.length, s + code.length);
      panel.style.display = 'none';
    });
    panel.appendChild(btn);
  });
  return panel;
}

// =====================
// 初期化
// =====================
document.addEventListener('DOMContentLoaded', function() {
  var toggleBtn    = document.getElementById('toggleBtn');
  var overlay      = document.getElementById('overlay');
  var postForm     = document.getElementById('postForm');
  var contentInput = document.getElementById('content');
  var emojiBtn     = document.getElementById('emojiBtn');
  var submitBtn    = document.getElementById('submitBtn');

  NotificationManager.init();

  // 絵文字パネル
  var emojiPanel = createEmojiPanel();
  if (emojiBtn) {
    emojiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var showing = emojiPanel.style.display === 'grid';
      emojiPanel.style.display = showing ? 'none' : 'grid';
      if (!showing) {
        var rect = emojiBtn.getBoundingClientRect();
        emojiPanel.style.left = rect.left + 'px';
        emojiPanel.style.top  = (rect.bottom + 6) + 'px';
      }
    });
  }
  document.addEventListener('click', function(e) {
    if (emojiPanel && !emojiPanel.contains(e.target) && e.target !== emojiBtn) {
      emojiPanel.style.display = 'none';
    }
  });

  // ダークモード
  function enableDark() {
    if (overlay)    overlay.style.clipPath = 'circle(150% at 100% 100%)';
    if (toggleBtn)  { toggleBtn.classList.add('white'); toggleBtn.classList.remove('black'); }
    inverted = true;
    setCookie('darkmode', 'true', 365);
  }
  function disableDark() {
    if (overlay)    overlay.style.clipPath = 'circle(0 at 100% 100%)';
    if (toggleBtn)  { toggleBtn.classList.add('black'); toggleBtn.classList.remove('white'); }
    inverted = false;
    setCookie('darkmode', 'false', 365);
  }
  if (getCookie('darkmode') === 'true') enableDark(); else disableDark();
  if (toggleBtn) toggleBtn.addEventListener('click', function() { inverted ? disableDark() : enableDark(); });

  // 時計
  updateClock();
  setInterval(updateClock, 1000);

  // 名前・パスワード復元
  var savedName = getCookie('bbsUserName');
  var savedPass = getCookie('bbsUserPassword');
  if (savedName) { var ne = document.getElementById('name');     if (ne) ne.value = savedName; }
  if (savedPass) { var pe = document.getElementById('password'); if (pe) pe.value = savedPass; }

  // 投稿フォーム
  if (postForm) {
    postForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var content  = (contentInput ? contentInput.value : '').trim();
      var name     = (document.getElementById('name')     ? document.getElementById('name').value     : '').trim();
      var password = (document.getElementById('password') ? document.getElementById('password').value : '');
      if (!content || !name || !password) { showMessage('全ての項目を入力してください', 'error'); return; }
      if (content.length > 1000) { showMessage('内容は1000文字以内で', 'error'); return; }
      if (name.length > 50)      { showMessage('名前は50文字以内で', 'error'); return; }
      try {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '送信中...'; }
        var resp = await createPost({ name: name, content: content, password: password });
        setCookie('bbsUserName', name);
        setCookie('bbsUserPassword', password);
        if (contentInput) contentInput.value = '';
        showMessage(resp && resp.message ? resp.message : '投稿しました');
        setTimeout(updatePostsList, 500);
      } catch(err) {
        var msg = '送信失敗';
        if (err.message && err.message.indexOf('429') !== -1) msg = '投稿が速すぎます';
        else if (err.message && err.message.indexOf('403') !== -1) msg = '投稿が禁止されています';
        showMessage(msg, 'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '送信'; }
      }
    });
  }

  // 初回・定期更新
  updatePostsList();
  setInterval(updatePostsList, 3000);
  document.addEventListener('visibilitychange', function() { if (!document.hidden) updatePostsList(); });

  window.addEventListener('error', function(e) { console.error(e.error || e); });
  window.addEventListener('unhandledrejection', function(e) { console.error(e.reason || e); });
});
