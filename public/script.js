document.addEventListener("DOMContentLoaded", () => {
  const postsTableBody = document.querySelector("#postsTable tbody");
  const postForm = document.querySelector("#postForm");
  let idList = []; // ID.jsonから読み込んだIDリスト

  const statusMessage = document.createElement("span");
  statusMessage.id = "statusMessage";
  statusMessage.style.marginLeft = "10px";
  postForm.querySelector("button[type='submit']").after(statusMessage);

  // 時間を12時間表示＆午前午後表記、日付も付ける関数
  function formatTo12HourWithDate(timeString) {
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "午後" : "午前";
    hours = hours % 12 || 12; // 0時は12に

    return `${year}/${month}/${day} ${ampm} ${hours}:${minutes}`;
  }

  // ID.jsonを読み込む
  function loadIds() {
    return fetch("/ID.json")
      .then((res) => {
        if (!res.ok) throw new Error("ID.jsonの読み込みに失敗しました");
        return res.json();
      })
      .then((data) => {
        idList = data; // IDリストを保存
      })
      .catch((e) => {
        console.error("IDリストの読み込みに失敗:", e);
      });
  }

  // 投稿取得＆表示
  function fetchPosts() {
    fetch("/api")
      .then((res) => {
        if (!res.ok) throw new Error("サーバーエラー");
        return res.json();
      })
      .then((data) => {
        renderPosts(data.posts);
        document.getElementById("currentTopic").textContent = data.topic;
      })
      .catch((e) => {
        console.error("投稿の取得に失敗しました:", e);
      });
  }

  // 投稿表示（新しい順かつ番号は一番上が最大番号）
  function renderPosts(posts) {
    postsTableBody.innerHTML = "";
    const total = posts.length;
    posts.forEach((post, index) => {
      const displayNum = total - index - 1;
      const row = document.createElement("tr");

      // IDがID.jsonに含まれているか確認し、クラスを追加
      const idClass = idList.includes(post.id) ? 'class="admin"' : "";

      // 時間を12時間表示＋日付＋午前午後に変換
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

  // 送信処理
  postForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const pass = document.getElementById("password").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!name || !pass || !content) {
      statusMessage.style.color = "red";
      statusMessage.textContent = "すべてのフィールドを入力してください！";
      setTimeout(() => (statusMessage.textContent = ""), 2000);
      return;
    }

    fetch(`/api?name=${encodeURIComponent(name)}&pass=${encodeURIComponent(pass)}&content=${encodeURIComponent(content)}`, {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) throw new Error("投稿に失敗しました");
        return res.json();
      })
      .then(() => {
        fetchPosts(); // 成功したら更新
        document.getElementById("content").value = ""; // コンテンツ欄のみリセット
        statusMessage.style.color = "green";
        statusMessage.textContent = "送信成功！";
        setTimeout(() => (statusMessage.textContent = ""), 2000);
      })
      .catch((e) => {
        statusMessage.style.color = "red";
        statusMessage.textContent = "送信失敗！";
        setTimeout(() => (statusMessage.textContent = ""), 2000);
        console.error(e);
      });
  });

  // 初期化処理
  loadIds().then(() => {
    fetchPosts(); // 初回読み込み
    setInterval(fetchPosts, 1000); // 1秒ごとに更新
  });
});

function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var ampm = hours >= 12 ? '午後' : '午前';

    hours = hours % 12 || 12; // 12時間形式
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    var timeString = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    document.getElementById('clock').textContent = timeString;
}

// 毎秒更新
setInterval(updateClock, 1000);

// 初回実行
updateClock();

// DOM要素の取得
var $seconds = $('.seconds .time');
var $minutes = $('.minutes .time');
var $hour = $('.hour .time');
var $humanTime = $('#human-time');
var clockHeight = $('#bar-clock .hour').height();

// 現在の時刻を返す関数
function getTime() {
  var dateTime = new Date();

  return {
    hour: dateTime.getHours(),
    minutes: dateTime.getMinutes(),
    seconds: dateTime.getSeconds()
  };
}

// 時間に基づいてカラムの高さを設定
function renderTime($el, time, duration) {
  var percentage = (clockHeight * time) / duration;
  $el.height(percentage);
  $el.css('background-color', "hsl(" + percentage + ", 50%, 50%)");
}

// 時間を2桁形式にフォーマット
function formatTime(time) {
  return time < 10 ? "0" + time : time;
}

// マスター関数
function updateTime(time) {
  renderTime($seconds, time.seconds, 59);
  renderTime($minutes, time.minutes, 59);
  renderTime($hour, time.hour, 23);

  // 読みやすい時間を設定
  $humanTime.text(function() {
    var separator = ' ';
    return formatTime(time.hour) + separator +
           formatTime(time.minutes) + separator +
           formatTime(time.seconds);
  });
}

// インターバルで更新
var t = setInterval(function() {
  updateTime(getTime());
}, 1000);
