var API = "https://yuyuyu-made-bbs-server.onrender.com/api";
var WS = "wss://yuyuyu-made-bbs-server.onrender.com";

var postsDiv = document.getElementById("posts");

// 初期読み込み
async function loadPosts() {
  var res = await fetch(API);
  var data = await res.json();

  postsDiv.innerHTML = "";
  data.posts.forEach(addPost);
}

// 投稿追加描画
function addPost(post, prepend) {
  var div = document.createElement("div");
  div.className = "post";

  var content = escapeHtml(post.content);
  content = autoLink(content);

  div.innerHTML = `
    <div class="name">${post.name || "名無し"}</div>
    <div>${content}</div>
    <div class="time">${new Date(post.created_at).toLocaleString()}</div>
  `;

  if (prepend) {
    postsDiv.prepend(div);
  } else {
    postsDiv.appendChild(div);
  }
}

// 投稿送信
async function sendPost() {
  var name = document.getElementById("name").value;
  var pass = document.getElementById("pass").value;
  var content = document.getElementById("contentInput").value;

  if (!content) return;

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      pass: pass,
      content: content
    })
  });

  localStorage.setItem("name", name);
  localStorage.setItem("pass", pass);

  document.getElementById("contentInput").value = "";
}

// WebSocket
var ws = new WebSocket(WS);

ws.onmessage = function(e) {
  var data = JSON.parse(e.data);

  if (data.channel === "chat" && data.type === "post") {
    addPost(data.post, true);
  }
};

// HTMLエスケープ
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m];
  });
}

// URL自動リンク
function autoLink(text) {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  );
}

// 保存データ復元
window.onload = function() {
  document.getElementById("name").value = localStorage.getItem("name") || "";
  document.getElementById("pass").value = localStorage.getItem("pass") || "";
  loadPosts();
};
