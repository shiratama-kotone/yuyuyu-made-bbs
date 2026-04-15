const API = "https://yuyuyu-made-bbs-server.onrender.com";
const WS = "wss://yuyuyu-made-bbs-server.onrender.com";

var postsEl = document.getElementById("posts");

// 保存
name.value = localStorage.name || "";
pass.value = localStorage.pass || "";

name.oninput = () => localStorage.name = name.value;
pass.oninput = () => localStorage.pass = pass.value;

// URLリンク化
function linkify(text){
  return text
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-400 underline">$1</a>')
    .replace(/\n/g,"<br>");
}

// roleバッジ
function roleBadge(role){
  if(role>=4) return `<span class="badge bg-red-500">Admin</span>`;
  if(role>=3) return `<span class="badge bg-cyan-500">Summit</span>`;
  if(role>=2) return `<span class="badge bg-purple-500">Mgr</span>`;
  return "";
}

// 投稿描画
function render(post){
  if(post.deleted) return;

  var div = document.createElement("div");
  div.className = "post bg-slate-800 p-3 rounded shadow";
  div.id = "p"+post.no;

  div.innerHTML = `
    <div class="flex justify-between text-sm mb-1">
      <span style="color:${post.colorCode||'#fff'}">
        ${post.name}
      </span>
      ${roleBadge(post.role)}
    </div>

    <div class="text-xs text-gray-400 mb-1">
      No.${post.no} ${post.id} ${post.time}
    </div>

    <div class="text-sm">
      ${linkify(post.content)}
    </div>
  `;

  postsEl.prepend(div);
}

// 初期ロード
async function load(){
  var res = await fetch(API+"/api");
  var data = await res.json();

  topic.textContent = data.topic;

  postsEl.innerHTML = "";
  data.posts.forEach(render);
}
load();

// 投稿
async function send(){
  if(!name.value || !pass.value || !content.value) return;

  await fetch(API+"/api",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      name:name.value,
      pass:pass.value,
      content:content.value
    })
  });

  content.value="";
}

// WebSocket
var ws = new WebSocket(WS);

ws.onmessage = (msg)=>{
  var data = JSON.parse(msg.data);

  if(data.channel !== "chat") return;

  if(data.type==="post"){
    render(data.post);
  }

  if(data.type==="delete"){
    data.nos.forEach(n=>{
      var el = document.getElementById("p"+n);
      if(el) el.remove();
    });
  }

  if(data.type==="clear" || data.type==="destroy"){
    postsEl.innerHTML="";
  }
};
