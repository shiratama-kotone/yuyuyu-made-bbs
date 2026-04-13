// =====================
// サーバー設定（同一サーバー、エンドポイント分離）
// =====================
var SERVER_URL = 'https://yuyuyu-made-bbs-server.onrender.com';
var ENDPOINTS = {
  chat:   '/api',
  battle: '/api/battle'
};
var currentServer = 'chat';

function switchServer(key) {
  currentServer = key;
  document.getElementById('tab-chat').classList.toggle('active', key === 'chat');
  document.getElementById('tab-battle').classList.toggle('active', key === 'battle');
  var tbody = document.querySelector('#postsTable tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="3">読み込み中...</td></tr>';
  var topicEl = document.getElementById('currentTopic');
  if (topicEl) topicEl.textContent = '今の話題：';
  var banner = document.getElementById('restrictionBanner');
  if (banner) { banner.textContent = ''; banner.style.display = 'none'; }
  updatePostsList();
}

function apiEndpoint() { return SERVER_URL + ENDPOINTS[currentServer]; }

// =====================
// 絵文字定義
// =====================
var BASE = 'https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/';
var EMOJI_MAP = {
  ':)':         { url: BASE + 'emo_smile.gif' },
  ':(':         { url: BASE + 'emo_sad.gif' },
  ':D':         { url: BASE + 'emo_grin.gif' },
  '8-)':        { url: BASE + 'emo_ikemen.gif' },
  ':o':         { url: BASE + 'emo_surprise.gif' },
  ';)':         { url: BASE + 'emo_wink.gif' },
  ';(':         { url: BASE + 'emo_tears.gif' },
  '(sweat)':    { url: BASE + 'emo_sweat.gif' },
  ':|':         { url: BASE + 'emo_mumu.gif' },
  ':*':         { url: BASE + 'emo_kiss.gif' },
  ':p':         { url: BASE + 'emo_tongueout.gif' },
  '(blush)':    { url: BASE + 'emo_blush.gif' },
  ':^)':        { url: BASE + 'emo_wry_smile.gif' },
  '|-)':        { url: BASE + 'emo_snooze.gif' },
  '(inlove)':   { url: BASE + 'emo_love.gif' },
  ']:)':        { url: BASE + 'emo_devil.gif' },
  '(talk)':     { url: BASE + 'emo_talk.gif' },
  '(yawn)':     { url: BASE + 'emo_yawn.gif' },
  '(puke)':     { url: BASE + 'emo_puke.gif' },
  '(emo)':      { url: BASE + 'emo_sad.gif' },
  '8-|':        { url: BASE + 'emo_more_smile.gif' },
  ':#)':        { url: BASE + 'emo_otaku.gif' },
  '(nod)':      { url: BASE + 'emo_nod.gif' },
  '(shake)':    { url: BASE + 'emo_shake.gif' },
  '(^^;)':      { url: BASE + 'emo_sweat.gif' },
  '(whew)':     { url: BASE + 'emo_whew.gif' },
  '(clap)':     { url: BASE + 'emo_clap.gif' },
  '(bow)':      { url: BASE + 'emo_bow.gif' },
  '(roger)':    { url: BASE + 'emo_roger.gif' },
  '(flex)':     { url: BASE + 'emo_muscle.gif' },
  '(dance)':    { url: BASE + 'emo_dance.gif' },
  '(:/)':       { url: BASE + 'emo_wonder.gif' },
  '(gogo)':     { url: BASE + 'emo_gogo.gif' },
  '(think)':    { url: BASE + 'emo_think.gif' },
  '(please)':   { url: BASE + 'emo_please.gif' },
  '(quick)':    { url: BASE + 'emo_quick.gif' },
  '(anger)':    { url: BASE + 'emo_anger.gif' },
  '(devil)':    { url: BASE + 'emo_devil.gif' },
  '(lightbulb)':{ url: BASE + 'emo_lightbulb.gif' },
  '(*)':        { url: BASE + 'emo_star.gif' },
  '(h)':        { url: BASE + 'emo_heart.gif' },
  '(F)':        { url: BASE + 'emo_flower.gif' },
  '(cracker)':  { url: BASE + 'emo_cracker.gif' },
  '(eat)':      { url: BASE + 'emo_eat.gif' },
  '(^)':        { url: BASE + 'emo_lucky.gif' },
  '(coffee)':   { url: BASE + 'emo_coffee.gif' },
  '(beer)':     { url: BASE + 'emo_beer.gif' },
  '(handshake)':{ url: BASE + 'emo_handshake.gif' },
  '(y)':        { url: BASE + 'emo_yes.gif' }
};

// =====================
// ユーティリティ
// =====================
var inverted = false;

function updateClock() {
  var el = document.getElementById('clock');
  if (!el) return;
  var now = new Date();
  el.textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');
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
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function autoLinkUrls(text) {
  if (!text) return '';
  return text.replace(/(https?:\/\/[^\s<>"'））]+|(?:www\.)?[A-Za-z0-9][A-Za-z0-9-]*(?:\.[A-Za-z]{2,})(?:\/[^\s<>"']*)?)([.,;!?））]*)/gi, function(full, url, trail) {
    var clean = url.replace(/[.,;!?]+$/,'');
    var href = clean.match(/^https?:\/\//i) ? clean : 'https://' + clean;
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(clean) + '</a>' + (trail || '');
  });
}

function autoLinkAnchors(text) {
  if (!text) return '';
  return text.replace(/>>(\d+)/g, '<a href="#$1" class="anchor-link">&gt;&gt;$1</a>');
}

function escapeForRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

function convertEmojis(text) {
  if (!text) return '';
  var codes = Object.keys(EMOJI_MAP).sort(function(a,b){ return b.length - a.length; });
  codes.forEach(function(code) {
    text = text.replace(
      new RegExp(escapeForRegex(code),'g'),
      '<img src="' + EMOJI_MAP[code].url + '" alt="' + escapeHtml(code) + '" class="emoji">'
    );
  });
  return text;
}

// 画像URLを<img>に変換（縦最大100px）
function convertImageUrls(text) {
  var imageExts = /\.(jpe?g|png|gif|webp|bmp|svg)(\?[^\s<>"]*)?$/i;
  return text.replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, function(tag, href, label) {
    if (imageExts.test(href)) {
      return '<a href="#" class="img-link" data-src="' + escapeHtml(href) + '">' +
        '<img src="' + escapeHtml(href) + '" alt="画像" class="post-img" style="max-height:100px;max-width:100%;vertical-align:middle;cursor:zoom-in;border-radius:4px;">' +
        '</a>';
    }
    return tag;
  });
}

function processContent(content) {
  var s = escapeHtml(content || '');
  s = s.replace(/\n/g, '<br>');
  s = autoLinkUrls(s);
  s = convertImageUrls(s);
  s = autoLinkAnchors(s);
  s = convertEmojis(s);
  return s;
}

// 画像モーダル
function initImageModal() {
  var modal = document.createElement('div');
  modal.id = 'img-modal';
  modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:20000;align-items:center;justify-content:center;cursor:zoom-out;';
  var img = document.createElement('img');
  img.id = 'img-modal-img';
  img.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 4px 32px rgba(0,0,0,0.6);';
  var closeBtn = document.createElement('button');
  closeBtn.id = 'img-modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = 'position:absolute;top:16px;right:20px;background:rgba(0,0,0,0.5);color:#fff;border:none;font-size:32px;width:44px;height:44px;border-radius:50%;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center;';
  modal.appendChild(img);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);

  function closeModal() { modal.style.display = 'none'; }
  closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeModal(); });
  modal.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

  document.addEventListener('click', function(e) {
    var link = e.target.closest('.img-link');
    if (!link) return;
    e.preventDefault();
    img.src = link.dataset.src;
    modal.style.display = 'flex';
  });
}

// =====================
// 規制バナー表示
// =====================
function updateRestrictionBanner(rs) {
  var el = document.getElementById('restrictionBanner');
  if (!el) return;
  var msgs = [];

  if (rs.stopActive || rs.prohibitActive) {
    var until = rs.stopActive ? rs.stopUntil : rs.prohibitUntil;
    var d = new Date(until);
    var h = d.getHours(), m = String(d.getMinutes()).padStart(2,'0');
    msgs.push(h + '時' + m + '分まで青IDの投稿を禁止中');
  }
  if (rs.restrict) {
    msgs.push('青ID一部規制中');
  }
  if (rs.prevent && currentServer === 'chat') {
    msgs.push('雑談での青IDの発言制限中');
  }

  if (msgs.length) {
    el.textContent = msgs.join('　／　');
    el.style.display = 'block';
  } else {
    el.textContent = '';
    el.style.display = 'none';
  }
}

// =====================
// 通知
// =====================
var NotificationManager = {
  notifications: [], container: null,
  init: function() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;pointer-events:none;';
    document.body.appendChild(this.container);
  },
  show: function(text, type) {
    this.init();
    var el = document.createElement('div');
    el.className = 'notification ' + (type === 'error' ? 'notification-error' : 'notification-success');
    var span = document.createElement('span');
    span.textContent = text;
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'notification-close';
    el.appendChild(span); el.appendChild(closeBtn);
    this.container.appendChild(el);
    var id = Date.now() + Math.random();
    var item = { id: id, el: el, timer: null };
    this.notifications.push(item);
    requestAnimationFrame(function() { el.classList.add('notification-show'); });
    item.timer = setTimeout(function() { NotificationManager.hide(id); }, 8000);
    closeBtn.addEventListener('click', function() { NotificationManager.hide(id); });
  },
  hide: function(id) {
    for (var i = 0; i < this.notifications.length; i++) {
      if (this.notifications[i].id === id) {
        var n = this.notifications[i]; var self = this; var idx = i;
        clearTimeout(n.timer);
        n.el.classList.remove('notification-show');
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
    var resp = await fetch(endpoint, Object.assign({ headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal }, options || {}));
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
  var d = await apiRequest(apiEndpoint());
  return { posts: d.posts || [], topic: d.topic || '', restriction: d.restriction || {} };
}

async function createPost(postData) {
  return await apiRequest(apiEndpoint(), {
    method: 'POST',
    body: JSON.stringify({ name: postData.name, pass: postData.password, content: postData.content })
  });
}

// =====================
// 投稿表示
// =====================
function updateTopic(t) {
  var el = document.getElementById('currentTopic');
  if (!el) return;
  var s = escapeHtml(decodeHtml(t || '')).replace(/\n/g, '<br>');
  s = convertEmojis(s);
  el.innerHTML = '今の話題：' + s;
}

function getIdClass(post) {
  if (post.role !== undefined) {
    return ['role-blue','role-speaker','role-manager','role-summit','role-admin'][post.role] || 'role-blue';
  }
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
  var idClass = getIdClass(post);
  var nameStyle = color ? ' style="color:' + escapeHtml(color) + ';"' : '';

  tr.innerHTML =
    '<td><a href="#' + no + '" class="post-no-link">' + no + '</a></td>' +
    '<td>' +
      '<div class="info-name"' + nameStyle + '>' + name + '</div>' +
      (id ? '<div class="info-id ' + idClass + '">' + id + (add ? ' <span class="info-add">' + add + '</span>' : '') + '</div>' : '') +
    '</td>' +
    '<td class="post-content">' + content + '</td>';
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
    updateRestrictionBanner(data.restriction);
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
  var codes = Object.keys(EMOJI_MAP).sort(function(a,b){ return b.length - a.length; });
  codes.forEach(function(code) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '<img src="' + EMOJI_MAP[code].url + '" alt="' + escapeHtml(code) + '" style="width:22px;height:22px;">';
    btn.title = code;
    btn.addEventListener('click', function() {
      var inp = document.getElementById('content');
      if (!inp) return;
      var s = inp.selectionStart || inp.value.length;
      var e2 = inp.selectionEnd || s;
      inp.value = inp.value.substring(0,s) + code + inp.value.substring(e2);
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
  initImageModal();

  var emojiPanel = createEmojiPanel();
  if (emojiBtn) {
    emojiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var showing = emojiPanel.style.display === 'grid';
      emojiPanel.style.display = showing ? 'none' : 'grid';
      if (!showing) {
        var rect = emojiBtn.getBoundingClientRect();
        emojiPanel.style.left = Math.min(rect.left, window.innerWidth - 280) + 'px';
        emojiPanel.style.top  = (rect.bottom + 6) + 'px';
      }
    });
  }
  document.addEventListener('click', function(e) {
    if (emojiPanel && !emojiPanel.contains(e.target) && e.target !== emojiBtn) {
      emojiPanel.style.display = 'none';
    }
  });

  // ダークモード（システム設定に追従）
  function applyDark(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (overlay) overlay.style.display = 'none'; // overlay不要
    if (toggleBtn) {
      toggleBtn.textContent = dark ? '☀️' : '🌙';
    }
    inverted = dark;
    setCookie('darkmode', dark ? 'true' : 'false', 365);
  }

  // システムのダークモードを監視
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  var savedDark = getCookie('darkmode');
  if (savedDark === '') {
    applyDark(prefersDark.matches);
  } else {
    applyDark(savedDark === 'true');
  }
  prefersDark.addEventListener('change', function(e) {
    if (getCookie('darkmode') === '') applyDark(e.matches);
  });
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      applyDark(!inverted);
    });
  }

  updateClock();
  setInterval(updateClock, 1000);

  var savedName = getCookie('bbsUserName');
  var savedPass = getCookie('bbsUserPassword');
  if (savedName) { var ne = document.getElementById('name');     if (ne) ne.value = savedName; }
  if (savedPass) { var pe = document.getElementById('password'); if (pe) pe.value = savedPass; }

  if (postForm) {
    postForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var content  = (contentInput ? contentInput.value : '').trim();
      var name     = (document.getElementById('name')     ? document.getElementById('name').value     : '').trim();
      var password = (document.getElementById('password') ? document.getElementById('password').value : '');
      if (!content || !name || !password) { showMessage('全ての項目を入力してください','error'); return; }
      if (content.length > 1000) { showMessage('内容は1000文字以内で','error'); return; }
      if (name.length > 50)      { showMessage('名前は50文字以内で','error'); return; }
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
        showMessage(msg,'error');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '送信'; }
      }
    });
  }

  updatePostsList();
  setInterval(updatePostsList, 3000);
  document.addEventListener('visibilitychange', function() { if (!document.hidden) updatePostsList(); });

  window.addEventListener('error', function(e) { console.error(e.error || e); });
  window.addEventListener('unhandledrejection', function(e) { console.error(e.reason || e); });
});
