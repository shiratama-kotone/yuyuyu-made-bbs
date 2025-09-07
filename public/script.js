document.addEventListener("DOMContentLoaded", () => {
  const postsTableBody = document.querySelector("#postsTable tbody");
  const postForm = document.querySelector("#postForm");
  const boardSelect = document.getElementById("boardSelect");
  let idList = [];
  let notificationSentForToAll = false;

  const statusMessage = document.createElement("span");
  statusMessage.id = "statusMessage";
  statusMessage.style.marginLeft = "10px";
  postForm.querySelector("button[type='submit']").after(statusMessage);

  function formatTo12HourWithDate(timeString) {
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "午後" : "午前";

    hours = hours % 12;
    if (hours === 0) hours = ampm === "午前" ? 0 : 12;

    return `${year}/${month}/${day} ${ampm} ${hours}:${minutes}`;
  }

  function loadIds() {
    return fetch("../ID.json")
      .then(res => res.ok ? res.json() : Promise.reject("ID.json読み込み失敗"))
      .then(data => idList = data)
      .catch(console.error);
  }

  function getApiUrl() {
    return boardSelect.value === "muhouchitai"
      ? "https://yuyuyu-made-bbs.onrender.com/api"
      : "https://yuyuyu-made-bbs-server.onrender.com/api";
  }

  function fetchPosts() {
    fetch(getApiUrl())
      .then(res => res.ok ? res.json() : Promise.reject("サーバーエラー"))
      .then(data => {
        renderPosts(data.posts);
        document.getElementById("currentTopic").innerHTML = data.topic.replace(/<br\s*\/?>/gi, "<br>");
      })
      .catch(console.error);
  }

  function renderPosts(posts) {
    postsTableBody.innerHTML = "";
    const total = posts.length;

    posts.forEach((post, index) => {
      const displayNum = total - index - 1;
      const row = document.createElement("tr");
      const idClass = idList.includes(post.id) ? 'class="admin"' : "";
      const formattedTime = formatTo12HourWithDate(post.time);
      row.innerHTML = `
        <td>${displayNum}</td>
        <td>${post.name}</td>
        <td ${idClass}>${post.id}</td>
        <td>${post.content}</td>
        <td>${formattedTime}</td>
      `;
      postsTableBody.appendChild(row);
    });
  }

  postForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const pass = document.getElementById("password").value.trim();
    const content = document.getElementById("content").value.trim().replace(/\n/g, "<br>");

    if (!name || !pass || !content) {
      statusMessage.style.color = "red";
      statusMessage.textContent = "すべてのフィールドを入力してください！";
      setTimeout(() => statusMessage.textContent = "", 2000);
      return;
    }

    if (content.includes("[toall]") && !notificationSentForToAll) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") showToAllNotification(name, pass);
        });
      } else if (Notification.permission === "granted") {
        showToAllNotification(name, pass);
      }
      notificationSentForToAll = true;
    }

    fetch(`${getApiUrl()}?name=${encodeURIComponent(name)}&pass=${encodeURIComponent(pass)}&content=${encodeURIComponent(content)}`, { method: "POST" })
      .then(res => res.ok ? res.json() : Promise.reject("投稿失敗"))
      .then(() => {
        fetchPosts();
        document.getElementById("content").value = "";
        statusMessage.style.color = "green";
        statusMessage.textContent = "送信成功！";
        setTimeout(() => statusMessage.textContent = "", 2000);
      })
      .catch(e => {
        statusMessage.style.color = "red";
        statusMessage.textContent = "送信失敗！";
        setTimeout(() => statusMessage.textContent = "", 2000);
        console.error(e);
      });
  });

  function showToAllNotification(name, id) {
    new Notification("皆さんへのお知らせ", {
      body: `${name}@${id}さんがTO ALLで皆さんのことを呼んでいます`,
    });
  }

  loadIds().then(() => {
    fetchPosts();
    setInterval(fetchPosts, 1000);
  });

  // ダークモード
  const btn = document.getElementById('toggleBtn');
  const overlay = document.getElementById('overlay');
  let inverted = false;

  const enableDarkMode = () => {
    overlay.style.clipPath = 'circle(150% at 100% 100%)';
    btn.classList.add('white'); btn.classList.remove('black');
    inverted = true;
    document.cookie = "darkmode=true; path=/";
  };

  const disableDarkMode = () => {
    overlay.style.clipPath = 'circle(0 at 100% 100%)';
    btn.classList.add('black'); btn.classList.remove('white');
    inverted = false;
    document.cookie = "darkmode=false; path=/";
  };

  const darkModeCookie = document.cookie.split("; ").find(row => row.startsWith("darkmode="));
  if (darkModeCookie && darkModeCookie.split("=")[1]==="true") enableDarkMode();

  btn.addEventListener('click', () => inverted ? disableDarkMode() : enableDarkMode());

  // 時計
  function updateClock() {
    const now = new Date();
    let hours = now.getHours(), minutes = now.getMinutes(), seconds = now.getSeconds();
    const ampm = hours >= 12 ? "午後" : "午前";
    hours = hours % 12; if (hours === 0) hours = ampm === "午前" ? 0 : 12;
    minutes = minutes < 10 ? "0"+minutes : minutes;
    seconds = seconds < 10 ? "0"+seconds : seconds;
    document.getElementById("clock").textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

});
