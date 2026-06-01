// =====================
// サーバー・エンドポイント設定
// =====================
var SERVER_URL = 'https://yuyuyu-made-bbs-server.onrender.com';
var WS_URL     = SERVER_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');
var ENDPOINTS  = { chat: '/api', battle: '/api/battle' };
var currentServer = 'chat';
var ws = null;

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
  latestNo = 0;
  isFirstLoad = true;
  updatePostsList();
}

function apiEndpoint() { return SERVER_URL + ENDPOINTS[currentServer]; }

// =====================
// 設定（localStorageで保存・全ページ共有）
// =====================
var Settings = {
  defaults: {
    themeColor:    '#7c57c2',
    font:          'mplus',
    fontSize:      '14',
    contrast:      '100',
    brightness:    '100',
    autoImage:     'true',
    notifyAll:     'false',
    notifyAnchor:  'false',
    enterSend:     'false',
  },
  get: function(key) {
    var v = localStorage.getItem('bbs_' + key);
    return v !== null ? v : this.defaults[key];
  },
  set: function(key, value) {
    localStorage.setItem('bbs_' + key, value);
    // Cookieにも保存（後方互換）
    setCookie('bbs_' + key, value, 365);
  },
  apply: function() {
    var color      = this.get('themeColor');
    var font       = this.get('font');
    var fontSize   = this.get('fontSize');
    var contrast   = this.get('contrast');
    var brightness = this.get('brightness');

    // テーマカラー
    var r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
    var textColor = (r*0.299 + g*0.587 + b*0.114) < 128 ? '#ffffff' : '#222222';
    document.documentElement.style.setProperty('--accent',      color);
    document.documentElement.style.setProperty('--accent-dark', shadeColor(color, -20));
    document.documentElement.style.setProperty('--accent-pale', shadeColor(color, 80));
    document.documentElement.style.setProperty('--th-bg',       color);
    document.documentElement.style.setProperty('--th-text',     textColor);

    // フォント
    var fontMap = {
      mplus:      "'M PLUS 1p', sans-serif",
      kosugimaru: "'Kosugi Maru', sans-serif",
      roboto:     "'Roboto', sans-serif",
      sansserif:  "sans-serif",
      serif:      "serif",
      mono:       "monospace",
    };
    var customFont = localStorage.getItem('bbs_customFontName');
    if (font === 'custom' && customFont) {
      document.documentElement.style.setProperty('--font', "'" + customFont + "', sans-serif");
    } else {
      document.documentElement.style.setProperty('--font', fontMap[font] || fontMap.mplus);
    }

    document.documentElement.style.setProperty('--font-size', fontSize + 'px');
    // filterはbodyに当てるとposition:fixedが崩れるので#main-wrapに適用
    var wrap = document.getElementById('main-wrap');
    if (wrap) {
      wrap.style.filter = 'contrast(' + contrast + '%) brightness(' + brightness + '%)';
    }
  } // ← 修正箇所1: メソッドを閉じる
}; // ← 修正箇所2: オブジェクトを閉じる

function shadeColor(hex, pct) {
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  r = Math.min(255, Math.max(0, r + Math.round(255 * pct / 100)));
  g = Math.min(255, Math.max(0, g + Math.round(255 * pct / 100)));
  b = Math.min(255, Math.max(0, b + Math.round(255 * pct / 100)));
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}

// =====================
// 絵文字定義
// =====================
var BASE = 'https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/main/emoji/';
var EMOJI_MAP = {
  ':)':         BASE + 'emo_smile.gif',
  ':(':         BASE + 'emo_sad.gif',
  ':D':         BASE + 'emo_grin.gif',
  '8-)':        BASE + 'emo_ikemen.gif',
  ':o':         BASE + 'emo_surprise.gif',
  ';)':         BASE + 'emo_wink.gif',
  ';(':         BASE + 'emo_tears.gif',
  '(sweat)':    BASE + 'emo_sweat.gif',
  ':|':         BASE + 'emo_mumu.gif',
  ':*':         BASE + 'emo_kiss.gif',
  ':p':         BASE + 'emo_tongueout.gif',
  '(blush)':    BASE + 'emo_blush.gif',
  ':^)':        BASE + 'emo_wry_smile.gif',
  '|-)':        BASE + 'emo_snooze.gif',
  '(inlove)':   BASE + 'emo_love.gif',
  ']:)':        BASE + 'emo_devil.gif',
  '(talk)':     BASE + 'emo_talk.gif',
  '(yawn)':     BASE + 'emo_yawn.gif',
  '(puke)':     BASE + 'emo_puke.gif',
  '(emo)':      BASE + 'emo_sad.gif',
  '8-|':        BASE + 'emo_more_smile.gif',
  ':#)':        BASE + 'emo_otaku.gif',
  '(nod)':      BASE + 'emo_nod.gif',
  '(shake)':    BASE + 'emo_shake.gif',
  '(^^;)':      BASE + 'emo_sweat.gif',
  '(whew)':     BASE + 'emo_whew.gif',
  '(clap)':     BASE + 'emo_clap.gif',
  '(bow)':      BASE + 'emo_bow.gif',
  '(roger)':    BASE + 'emo_roger.gif',
  '(flex)':     BASE + 'emo_muscle.gif',
  '(dance)':    BASE + 'emo_dance.gif',
  '(:/)':       BASE + 'emo_wonder.gif',
  '(gogo)':     BASE + 'emo_gogo.gif',
  '(think)':    BASE + 'emo_think.gif',
  '(please)':   BASE + 'emo_please.gif',
  '(quick)':    BASE + 'emo_quick.gif',
  '(anger)':    BASE + 'emo_anger.gif',
  '(devil)':    BASE + 'emo_devil.gif',
  '(lightbulb)':BASE + 'emo_lightbulb.gif',
  '(*)':        BASE + 'emo_star.gif',
  '(h)':        BASE + 'emo_heart.gif',
  '(F)':        BASE + 'emo_flower.gif',
  '(cracker)':  BASE + 'emo_cracker.gif',
  '(eat)':      BASE + 'emo_eat.gif',
  '(^)':        BASE + 'emo_lucky.gif',
  '(coffee)':   BASE + 'emo_coffee.gif',
  '(beer)':     BASE + 'emo_beer.gif',
  '(handshake)':BASE + 'emo_handshake.gif',
  '(y)':        BASE + 'emo_yes.gif'
};

// =====================
// ユーティリティ
// =====================
var inverted = false;
var myId = null; // 自分のID（パスワードから計算）

function updateClock() {
  var el = document.getElementById('clock');
  if (!el) return;
  var now = new Date();
  el.textContent = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');
}

function setCookie(name, value, days) {
  days = typeof days === 'number' ? days : 30;
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + new Date(Date.now() + days*86400000).toUTCString() + '; path=/';
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
  return text.replace(/(https?:\/\/[^\s<>"'））\]]+)([.,;!?））\]]*)/gi, function(full, url, trail) {
    var clean = url.replace(/[.,;!?]+$/,'');
    return '<a href="' + clean + '" target="_blank" rel="noopener noreferrer">' + clean + '</a>' + (trail||'');
  });
}

// アンカー >>番号
function autoLinkAnchors(text) {
  if (!text) return '';
  return text.replace(/&gt;&gt;(\d+)/g, function(_, num) {
    return '<a href="#post-' + num + '" class="anchor-link" data-no="' + num + '">&gt;&gt;' + num + '</a>';
  });
}

function escapeForRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

// SHA-256 → Base64 → 英数字のみ → 7文字
function bufToBase64(buf) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));
}
function calcId(pass) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(pass)).then(function(buf) {
    return '@' + bufToBase64(buf).replace(/[^A-Za-z0-9]/g, '').slice(0, 7);
  });
}

function convertEmojis(text) {
  if (!text) return '';
  var codes = Object.keys(EMOJI_MAP).sort(function(a,b){ return b.length - a.length; });
  codes.forEach(function(code) {
    text = text.replace(new RegExp(escapeForRegex(code),'g'),
      '<img src="' + EMOJI_MAP[code] + '" alt="' + escapeHtml(code) + '" class="emoji">');
  });
  return text;
}

function convertImageUrls(text) {
  if (Settings.get('autoImage') !== 'true') return text;
  var imageExts = /\.(jpe?g|png|gif|webp|bmp|svg)(\?[^\s<>"]*)?$/i;
  var videoExts = /\.(mp4|webm|ogg|mov)(\?[^\s<>"]*)?$/i;
  return text.replace(/<a href="([^"]+)"[^>]*>[^<]+<\/a>/g, function(tag, href) {
    // YouTube（通常・Short）
    var ytMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      return '<div class="embed-wrap"><iframe src="https://www.youtube.com/embed/' + ytMatch[1] +
        '" frameborder="0" allowfullscreen loading="lazy" style="width:100%;max-width:480px;height:270px;border-radius:8px;"></iframe></div>';
    }
    // 画像
    if (imageExts.test(href)) {
      return '<a href="#" class="img-link" data-src="' + escapeHtml(href) + '">' +
        '<img src="' + escapeHtml(href) + '" alt="画像" class="post-img"></a>';
    }
    // 動画
    if (videoExts.test(href)) {
      return '<video src="' + escapeHtml(href) + '" controls style="max-width:100%;max-height:300px;border-radius:8px;display:block;margin:4px 0;"></video>';
    }
    return tag;
  });
}

function convertMarkdown(s) {
  // 複数行コードブロック（```...```）
  s = s.replace(/```([^`]*?)```/gs, function(_, code) {
    return '<pre style="background:var(--bg-sub);border:1px solid var(--border);border-radius:6px;padding:8px 10px;overflow-x:auto;font-family:monospace;font-size:13px;white-space:pre-wrap;margin:4px 0;">' + code.replace(/\n/g, '<br>') + '</pre>';
  });

  // インラインコード（`...`）
  s = s.replace(/`([^`]+?)`/g, function(_, code) {
    return '<code style="background:var(--bg-sub);border:1px solid var(--border);border-radius:3px;padding:1px 5px;font-family:monospace;font-size:13px;">' + code + '</code>';
  });

  // 複数行引用（>>> から空行まで）
  s = s.replace(/((?:^|<br>)&gt;&gt;&gt; )([\s\S]*?)(?=<br><br>|$)/g, function(_, _prefix, body) {
    var inner = body.replace(/^<br>/, '');
    return '<blockquote style="border-left:4px solid var(--border);margin:4px 0;padding:4px 10px;color:var(--text-sub);">' + inner + '</blockquote>';
  });

  // 1行引用（> ）
  s = s.replace(/(^|<br>)&gt; (.+?)(?=<br>|$)/g, function(_, br, body) {
    return br + '<blockquote style="border-left:4px solid var(--border);margin:4px 0;padding:4px 10px;color:var(--text-sub);">' + body + '</blockquote>';
  });

  // 見出し
  s = s.replace(/(^|<br>)### (.+?)(?=<br>|$)/g, function(_, br, body) {
    return br + '<h5 style="font-size:13px;font-weight:700;margin:4px 0;">' + body + '</h5>';
  });
  s = s.replace(/(^|<br>)## (.+?)(?=<br>|$)/g, function(_, br, body) {
    return br + '<h4 style="font-size:15px;font-weight:700;margin:4px 0;">' + body + '</h4>';
  });
  s = s.replace(/(^|<br>)# (.+?)(?=<br>|$)/g, function(_, br, body) {
    return br + '<h3 style="font-size:18px;font-weight:700;margin:4px 0;">' + body + '</h3>';
  });

  // サブテキスト
  s = s.replace(/(^|<br>)-# (.+?)(?=<br>|$)/g, function(_, br, body) {
    return br + '<span style="font-size:11px;color:var(--text-sub);">' + body + '</span>';
  });

  // リスト（インデント: 先頭2スペース）
  s = s.replace(/(^|<br>)(  )[*-] (.+?)(?=<br>|$)/g, function(_, br, _indent, body) {
    return br + '<ul style="margin:0 0 0 28px;padding:0;list-style:circle;"><li>' + body + '</li></ul>';
  });
  s = s.replace(/(^|<br>)[*-] (.+?)(?=<br>|$)/g, function(_, br, body) {
    return br + '<ul style="margin:0 0 0 14px;padding:0;"><li>' + body + '</li></ul>';
  });

  // []()リンク
  s = s.replace(/\[([^\]]+?)\]\((https?:\/\/[^\)]+?)\)/g, function(_, text, url) {
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
  });

  // スポイラー（||...||）
  s = s.replace(/\|\|(.+?)\|\|/g, function(_, inner) {
    return '<span class="spoiler" style="background:#2a2a2a;color:#2a2a2a;border-radius:3px;padding:0 3px;cursor:pointer;" onclick="this.style.color=\'#e8e8e8\';">' + inner + '</span>';
  });

  // 太字斜体（***...***）
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // 太字（**...**）
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // アンダーライン（__...__）
  s = s.replace(/__(.+?)__/g, '<u>$1</u>');

  // 斜体（*...* または _..._）
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  s = s.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');

  // 取り消し線（~~...~~）
  s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');

  return s;
}

function processContent(content) {
  var s = escapeHtml(content || '');
  s = s.replace(/\n/g, '<br>');
  s = autoLinkUrls(s);
  s = convertImageUrls(s);
  s = autoLinkAnchors(s);
  s = convertMarkdown(s); 
  s = convertEmojis(s);
  return s;
}

// =====================
// 規制バナー
// =====================
function updateRestrictionBanner(rs) {
  var el = document.getElementById('restrictionBanner');
  if (!el) return;
  var msgs = [];
  if (rs.stopActive || rs.prohibitActive) {
    var until = rs.stopActive ? rs.stopUntil : rs.prohibitUntil;
    var d = new Date(until);
    msgs.push(d.getHours() + '時' + String(d.getMinutes()).padStart(2,'0') + '分まで青IDの投稿を禁止中');
  }
  if (rs.restrict) msgs.push('青ID一部規制中');
  if (rs.prevent && currentServer === 'chat') msgs.push('雑談での青IDの発言制限中');
  if (msgs.length) { el.innerHTML = msgs.join('　／　'); el.style.display = 'block'; }
  else             { el.innerHTML = ''; el.style.display = 'none'; }
}

// =====================
// 通知
// =====================
var NotificationManager = {
  notifications: [], container: null,
  init: function() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'notif-container';
    document.body.appendChild(this.container);
  },
  show: function(text, type) {
    this.init();
    var el = document.createElement('div');
    el.className = 'notification ' + (type === 'error' ? 'notification-error' : 'notification-success');
    var span = document.createElement('span'); span.textContent = text;
    var btn = document.createElement('button'); btn.className = 'notification-close'; btn.innerHTML = '&times;';
    el.appendChild(span); el.appendChild(btn);
    this.container.appendChild(el);
    var id = Date.now() + Math.random();
    var item = { id:id, el:el, timer:null };
    this.notifications.push(item);
    requestAnimationFrame(function() { el.classList.add('notification-show'); });
    item.timer = setTimeout(function() { NotificationManager.hide(id); }, 8000);
    btn.addEventListener('click', function() { NotificationManager.hide(id); });
  },
  hide: function(id) {
    for (var i=0; i<this.notifications.length; i++) {
      if (this.notifications[i].id === id) {
        var n=this.notifications[i]; var self=this; var idx=i;
        clearTimeout(n.timer);
        n.el.classList.remove('notification-show');
        setTimeout(function(){ if(n.el.parentNode) n.el.remove(); self.notifications.splice(idx,1); },300);
        break;
      }
    }
  }
};
function showMessage(text, type) { NotificationManager.show(text||'', type||'success'); }

// ブラウザ通知
function sendBrowserNotif(title, body) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body: body, icon: '/favicon.ico' });
  }
}

// =====================
// WebSocket
// =====================
var wsReconnectTimer = null;
var lastPostNos = {}; // channel -> Set of known nos

function connectWS() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  ws = new WebSocket(WS_URL);

  ws.onopen = function() {
    clearTimeout(wsReconnectTimer);
  };

  ws.onmessage = function(e) {
    try {
      var data = JSON.parse(e.data);
      if (data.channel !== currentServer) return;

      if (data.type === 'post') {
        var post = data.post;
        // テーブルに追加
        var tbody = document.querySelector('#postsTable tbody');
        if (tbody) {
          var existing = document.getElementById('post-' + post.no);
          if (!existing) {
            var tr = displayPost(post);
            tbody.insertBefore(tr, tbody.firstChild);

            // ブラウザ通知
            if (Settings.get('notifyAll') === 'true') {
              sendBrowserNotif('新着投稿', post.name + ': ' + (post.content || '').slice(0, 50));
            }
            // アンカー通知
            if (Settings.get('notifyAnchor') === 'true' && myId && post.id !== myId) {
              var anchors = (post.content.match(/>>(\d+)/g) || []);
              anchors.forEach(function(a) {
                var no = parseInt(a.replace('>>',''));
                var targetRow = document.getElementById('post-' + no);
                if (targetRow && targetRow.dataset.id === myId) {
                  sendBrowserNotif('返信が来ました', post.name + ': ' + post.content.slice(0,50));
                }
              });
            }
          }
        }
      } else if (data.type === 'clear' || data.type === 'delete' || data.type === 'destroy') {
        latestNo = 0;
        isFirstLoad = true;
        updatePostsList();
      }
    } catch(err) { console.error(err); }
  };

  ws.onclose = function() {
    wsReconnectTimer = setTimeout(connectWS, 3000);
  };
  ws.onerror = function() { ws.close(); };
}

// =====================
// API通信
// =====================
async function apiRequest(endpoint, options) {
  var ctrl = new AbortController();
  var tid = setTimeout(function() { ctrl.abort(); }, 8000);
  try {
    var resp = await fetch(endpoint, Object.assign({ headers:{'Content-Type':'application/json'}, signal:ctrl.signal }, options||{}));
    clearTimeout(tid);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return await resp.json();
  } catch(e) {
    clearTimeout(tid);
    if (e.name==='AbortError') throw new Error('タイムアウト');
    throw e;
  }
}

async function loadData(params) {
  var qs = '';
  if (params) {
    var parts = [];
    if (params.after  !== undefined) parts.push('after='  + params.after);
    if (params.before !== undefined) parts.push('before=' + params.before);
    if (params.limit  !== undefined) parts.push('limit='  + params.limit);
    if (parts.length) qs = '?' + parts.join('&');
  }
  var d = await apiRequest(apiEndpoint() + qs);
  return { posts: d.posts||[], topic: d.topic||'', restriction: d.restriction||{}, total: d.total||0 };
}

async function createPost(postData) {
  return await apiRequest(apiEndpoint(), {
    method:'POST',
    body: JSON.stringify({ name:postData.name, pass:postData.password, content:postData.content })
  });
}

// =====================
// 投稿表示
// =====================
function updateTopic(t) {
  var el = document.getElementById('currentTopic');
  if (!el) return;
  var s = escapeHtml(decodeHtml(t||'')).replace(/\n/g,'<br>');
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
  tr.id = 'post-' + post.no;
  tr.dataset.id = post.id || '';

  var no      = post.no || '';
  var name    = escapeHtml(post.name      || '');
  var id      = escapeHtml(post.id        || '');
  var add     = escapeHtml(post.addSuffix || '');
  var color   = post.colorCode || null;
  var content = processContent(post.content || '');
  var idClass = getIdClass(post);
  var nameStyle = color ? ' style="color:' + escapeHtml(color) + ';"' : '';

  // verifiedバッジ
  var badge = post.verified
    ? '<img src="https://raw.githubusercontent.com/shiratama-kotone/yuyuyu-made-bbs/refs/heads/main/assets/Twitter_Verified_Badge.svg.png" alt="✓" style="width:1em;height:1em;vertical-align:middle;margin-left:3px;">'
    : '';

  // DMリンク（ログイン済みユーザー同士）
  var dmLink = '';
  if (post.verified && post.dm_id) {
    dmLink = ' <a href="dm.html#' + escapeHtml(post.dm_id) + '" class="dm-link" title="DMを送る">💬</a>';
  }

  tr.innerHTML =
    '<td><a href="#" class="post-no-link" data-no="' + no + '">' + no + '</a></td>' +
    '<td>' +
      '<div class="info-name"' + nameStyle + '>' + name + badge + '</div>' +
      (id ? '<div class="info-id ' + idClass + '">' + id + (add ? ' <span class="info-add">' + add + '</span>' : '') + dmLink + '</div>' : '') +
    '</td>' +
    '<td class="post-content">' + content + '</td>';
  return tr;
}

var isUpdating = false;
var latestNo = 0; // 現在表示中の最新投稿番号
var isFirstLoad = true;

async function updatePostsList() {
  if (isUpdating) return;
  var tbody = document.querySelector('#postsTable tbody');
  if (!tbody) return;
  try {
    isUpdating = true;

    if (isFirstLoad) {
      // 初回: 最新50件を取得
      tbody.innerHTML = '<tr><td colspan="3">読み込み中...</td></tr>';
      var data = await loadData({ limit: 50 });
      updateTopic(data.topic);
      updateRestrictionBanner(data.restriction);
      tbody.innerHTML = '';
      if (!data.posts || !data.posts.length) {
        tbody.innerHTML = '<tr><td colspan="3">投稿がありません</td></tr>';
      } else {
        data.posts.forEach(function(p) { tbody.appendChild(displayPost(p)); });
        latestNo = data.posts[0].no; // 先頭が最新
      }
      isFirstLoad = false;
    } else {
      // 差分取得: latestNoより新しいものだけ
      var data = await loadData({ after: latestNo });
      // topic・restriction は常に更新
      updateTopic(data.topic);
      updateRestrictionBanner(data.restriction);
      if (data.posts && data.posts.length > 0) {
        // 新着を先頭に追加
        data.posts.forEach(function(p) {
          var existing = document.getElementById('post-' + p.no);
          if (!existing) {
            tbody.insertBefore(displayPost(p), tbody.firstChild);
          }
        });
        latestNo = data.posts[0].no;
      }
    }
  } catch(e) {
    console.error(e);
    if (isFirstLoad && tbody.innerHTML.indexOf('読み込み中') !== -1) {
      tbody.innerHTML = '<tr><td colspan="3" style="color:red;">読み込み失敗</td></tr>';
    }
  } finally {
    isUpdating = false;
  }
}

// =====================
// アンカースクロール & ダブルタップアンカー挿入
// =====================
function initAnchorScroll() {
  // アンカーリンクのスクロール
  document.addEventListener('click', function(e) {
    var a = e.target.closest('.anchor-link');
    if (!a) return;
    e.preventDefault();
    var no = a.dataset.no;
    var target = document.getElementById('post-' + no);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('anchor-highlight');
      setTimeout(function() { target.classList.remove('anchor-highlight'); }, 1500);
    }
  });

  // 投稿番号のダブルタップ/ダブルクリックでアンカー挿入
  var lastTap = { no: null, time: 0 };
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.post-no-link');
    if (!link) return;
    e.preventDefault(); // URLにハッシュを付けない
    var no = link.dataset.no;
    var now = Date.now();
    if (lastTap.no === no && now - lastTap.time < 400) {
      var inp = document.getElementById('content');
      if (!inp) return;
      var insert = '>>' + no + ' ';
      var pos = inp.selectionStart || inp.value.length;
      inp.value = inp.value.substring(0, pos) + insert + inp.value.substring(pos);
      inp.focus();
      inp.setSelectionRange(pos + insert.length, pos + insert.length);
      lastTap = { no: null, time: 0 };
    } else {
      lastTap = { no: no, time: now };
    }
  });
}

// =====================
// 画像モーダル
// =====================
function initImageModal() {
  var modal = document.createElement('div');
  modal.id = 'img-modal';
  var img = document.createElement('img'); img.id = 'img-modal-img';
  var closeBtn = document.createElement('button'); closeBtn.id = 'img-modal-close'; closeBtn.innerHTML = '&times;';
  modal.appendChild(img); modal.appendChild(closeBtn);
  document.body.appendChild(modal);
  function close() { modal.classList.remove('open'); }
  closeBtn.addEventListener('click', function(e){ e.stopPropagation(); close(); });
  modal.addEventListener('click', close);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') close(); });
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.img-link');
    if (!link) return;
    e.preventDefault();
    img.src = link.dataset.src;
    modal.classList.add('open');
  });
}

// =====================
// 絵文字パネル
// =====================
function createEmojiPanel() {
  var panel = document.createElement('div'); panel.id = 'emoji-panel';
  document.body.appendChild(panel);
  var codes = Object.keys(EMOJI_MAP).sort(function(a,b){ return b.length-a.length; });
  codes.forEach(function(code) {
    var btn = document.createElement('button'); btn.type='button';
    btn.innerHTML = '<img src="' + EMOJI_MAP[code] + '" alt="' + escapeHtml(code) + '" style="width:22px;height:22px;">';
    btn.title = code;
    btn.addEventListener('click', function() {
      var inp = document.getElementById('content');
      if (!inp) return;
      var s = inp.selectionStart||inp.value.length, e2=inp.selectionEnd||s;
      inp.value = inp.value.substring(0,s)+code+inp.value.substring(e2);
      inp.focus(); inp.setSelectionRange(s+code.length, s+code.length);
      panel.style.display='none';
    });
    panel.appendChild(btn);
  });
  return panel;
}

// =====================
// 設定パネル
// =====================
function buildSettingsPanel() {
  var panel = document.createElement('div');
  panel.id = 'settings-panel';
  panel.innerHTML = `
    <div class="settings-header">
      <span>⚙ 設定</span>
      <button id="settings-close">&times;</button>
    </div>
    <div class="settings-body">

      <label class="settings-label">テーマカラー</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="color" id="s-color" value="${Settings.get('themeColor')}">
        <span id="s-color-val" style="font-size:12px;">${Settings.get('themeColor')}</span>
      </div>

      <label class="settings-label">フォント</label>
      <select id="s-font">
        <option value="mplus">M PLUS 1p（デフォルト）</option>
        <option value="kosugimaru">Kosugi Maru</option>
        <option value="roboto">Roboto</option>
        <option value="sansserif">Sans Serif</option>
        <option value="serif">Serif</option>
        <option value="mono">Monospace</option>
        <option value="custom">カスタム（アップロード）</option>
      </select>
      <div id="s-font-upload-wrap" style="display:none;margin-top:6px;">
        <input type="file" id="s-font-file" accept=".ttf,.otf,.woff,.woff2">
        <span id="s-font-file-name" style="font-size:11px;color:var(--text-sub);"></span>
      </div>

      <label class="settings-label">フォントサイズ: <span id="s-fontsize-val">${Settings.get('fontSize')}px</span></label>
      <input type="range" id="s-fontsize" min="10" max="24" value="${Settings.get('fontSize')}">

      <label class="settings-label">コントラスト: <span id="s-contrast-val">${Settings.get('contrast')}%</span></label>
      <input type="range" id="s-contrast" min="50" max="150" value="${Settings.get('contrast')}">

      <label class="settings-label">明るさ: <span id="s-brightness-val">${Settings.get('brightness')}%</span></label>
      <input type="range" id="s-brightness" min="30" max="150" value="${Settings.get('brightness')}">

      <div class="settings-row">
        <label>画像自動表示</label>
        <input type="checkbox" id="s-autoimage" ${Settings.get('autoImage')==='true'?'checked':''}>
      </div>
      <div class="settings-row">
        <label>投稿通知</label>
        <input type="checkbox" id="s-notify-all" ${Settings.get('notifyAll')==='true'?'checked':''}>
      </div>
      <div class="settings-row">
        <label>返信通知（アンカー）</label>
        <input type="checkbox" id="s-notify-anchor" ${Settings.get('notifyAnchor')==='true'?'checked':''}>
      </div>
      <div class="settings-row">
        <label>Enterで送信（通常はShift+Enter）</label>
        <input type="checkbox" id="s-enter-send" ${Settings.get('enterSend')==='true'?'checked':''}>
      </div>

      <button id="s-reset" style="margin-top:12px;width:100%;background:var(--bg-sub);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:7px;">設定をリセット</button>
    </div>
  `;
  document.body.appendChild(panel);

  // フォント選択
  var fontSel = document.getElementById('s-font');
  fontSel.value = Settings.get('font');
  var uploadWrap = document.getElementById('s-font-upload-wrap');
  fontSel.addEventListener('change', function() {
    uploadWrap.style.display = this.value === 'custom' ? 'block' : 'none';
    Settings.set('font', this.value);
    Settings.apply();
  });
  if (fontSel.value === 'custom') uploadWrap.style.display = 'block';

  // フォントアップロード
  document.getElementById('s-font-file').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var fontName = file.name.replace(/\.[^.]+$/, '');
      var style = document.createElement('style');
      style.textContent = "@font-face { font-family: '" + fontName + "'; src: url('" + ev.target.result + "'); }";
      document.head.appendChild(style);
      setCookie('bbs_customFontName', fontName, 365);
      document.getElementById('s-font-file-name').textContent = fontName;
      Settings.set('font', 'custom');
      Settings.apply();
    };
    reader.readAsDataURL(file);
  });

  // カラー
  document.getElementById('s-color').addEventListener('input', function() {
    document.getElementById('s-color-val').textContent = this.value;
    Settings.set('themeColor', this.value);
    Settings.apply();
  });

  // スライダー
  function bindSlider(id, key, valId) {
    var el = document.getElementById(id);
    el.addEventListener('input', function() {
      document.getElementById(valId).textContent = this.value + (key === 'fontSize' ? 'px' : '%');
      Settings.set(key, this.value);
      Settings.apply();
    });
  }
  bindSlider('s-fontsize',   'fontSize',   's-fontsize-val');
  bindSlider('s-contrast',   'contrast',   's-contrast-val');
  bindSlider('s-brightness', 'brightness', 's-brightness-val');

  // チェックボックス
  function bindCheck(id, key) {
    document.getElementById(id).addEventListener('change', function() {
      Settings.set(key, this.checked ? 'true' : 'false');
      if ((key === 'notifyAll' || key === 'notifyAnchor') && this.checked) {
        if (Notification.permission === 'default') Notification.requestPermission();
      }
    });
  }
  bindCheck('s-autoimage',     'autoImage');
  bindCheck('s-notify-all',    'notifyAll');
  bindCheck('s-notify-anchor', 'notifyAnchor');
  bindCheck('s-enter-send',    'enterSend');

  // リセット
  document.getElementById('s-reset').addEventListener('click', function() {
    Object.keys(Settings.defaults).forEach(function(k) {
      localStorage.removeItem('bbs_' + k);
    });
    location.reload();
  });

  // 閉じる
  document.getElementById('settings-close').addEventListener('click', function() {
    panel.classList.remove('open');
  });
}

// =====================
// 初期化
// =====================
document.addEventListener('DOMContentLoaded', function() {
  Settings.apply();

  var toggleBtn    = document.getElementById('toggleBtn');
  var postForm     = document.getElementById('postForm');
  var contentInput = document.getElementById('content');
  var emojiBtn     = document.getElementById('emojiBtn');
  var submitBtn    = document.getElementById('submitBtn');
  var settingsBtn  = document.getElementById('settingsBtn');

  NotificationManager.init();
  initAnchorScroll();
  initImageModal();
  buildSettingsPanel();

  var emojiPanel = createEmojiPanel();
  if (emojiBtn) {
    emojiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var showing = emojiPanel.style.display === 'grid';
      emojiPanel.style.display = showing ? 'none' : 'grid';
      if (!showing) {
        var rect = emojiBtn.getBoundingClientRect();
        emojiPanel.style.left = Math.min(rect.left, window.innerWidth-280) + 'px';
        emojiPanel.style.top  = (rect.bottom+6) + 'px';
      }
    });
  }
  document.addEventListener('click', function(e) {
    if (emojiPanel && !emojiPanel.contains(e.target) && e.target !== emojiBtn)
      emojiPanel.style.display = 'none';
  });

  // 設定ボタン
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
      document.getElementById('settings-panel').classList.toggle('open');
    });
  }

  // ダークモード（システム追従・localStorage保存）
  function applyDark(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (toggleBtn) toggleBtn.textContent = dark ? '☀️' : '🌙';
    inverted = dark;
    localStorage.setItem('darkmode', dark ? 'true' : 'false');
  }
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  var savedDark = localStorage.getItem('darkmode');
  applyDark(savedDark !== null ? savedDark === 'true' : prefersDark.matches);
  prefersDark.addEventListener('change', function(e) {
    if (localStorage.getItem('darkmode') === null) applyDark(e.matches);
  });
  if (toggleBtn) toggleBtn.addEventListener('click', function() { applyDark(!inverted); });

  // 名前・パスワード復元
  var savedName = getCookie('bbsUserName'), savedPass = getCookie('bbsUserPassword');
  if (savedName) { var ne=document.getElementById('name'); if(ne) ne.value=savedName; }
  if (savedPass) {
    var pe=document.getElementById('password'); if(pe) pe.value=savedPass;
    calcId(savedPass).then(function(id) { myId = id; });
  }

  // パスワード変更時にmyId更新
  var passEl = document.getElementById('password');
  if (passEl) {
    passEl.addEventListener('input', function() {
      if (!this.value) { myId = null; return; }
      calcId(this.value).then(function(id) { myId = id; });
    });
  }

  // 投稿フォーム
  if (postForm) {
    // Enterで送信 / Shift+Enterで改行
    if (contentInput) {
      contentInput.addEventListener('keydown', function(e) {
        var enterSend = Settings.get('enterSend') === 'true';
        if (e.key === 'Enter') {
          if (enterSend && !e.shiftKey) {
            e.preventDefault();
            postForm.dispatchEvent(new Event('submit'));
          } else if (!enterSend && e.shiftKey) {
            e.preventDefault();
            postForm.dispatchEvent(new Event('submit'));
          }
        }
      });
    }

    postForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var content  = (contentInput ? contentInput.value : '').trim();
      var name     = (document.getElementById('name')     ? document.getElementById('name').value     : '').trim();
      var password = (document.getElementById('password') ? document.getElementById('password').value : '');
      if (!content || !name || !password) { showMessage('全ての項目を入力してください','error'); return; }
      if (content.length > 1000) { showMessage('内容は1000文字以内で','error'); return; }
      if (name.length > 50)      { showMessage('名前は50文字以内で','error'); return; }
      try {
        if (submitBtn) { submitBtn.disabled=true; submitBtn.textContent='送信中...'; }
        var resp = await createPost({ name, content, password });
        setCookie('bbsUserName', name); setCookie('bbsUserPassword', password);
        if (contentInput) contentInput.value = '';
        showMessage(resp && resp.message ? resp.message : '投稿しました');
      } catch(err) {
        var msg = '送信失敗';
        if (err.message && err.message.indexOf('429')!==-1) msg='投稿が速すぎます';
        else if (err.message && err.message.indexOf('403')!==-1) msg='投稿が禁止されています';
        showMessage(msg,'error');
      } finally {
        if (submitBtn) { submitBtn.disabled=false; submitBtn.textContent='送信'; }
      }
    });
  }

  // 初回読み込み
  updatePostsList();

  // WebSocket接続（ポーリングは廃止）
  connectWS();

  // visibilitychange時に再接続＆更新
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) { connectWS(); updatePostsList(); }
  });

  window.addEventListener('error', function(e){ console.error(e.error||e); });
  window.addEventListener('unhandledrejection', function(e){ console.error(e.reason||e); });
});
