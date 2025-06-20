document.addEventListener("DOMContentLoaded", () => {
  const postsTableBody = document.querySelector("#postsTable tbody");
  const postForm = document.querySelector("#postForm");
  let idList = []; // ID.jsonから読み込んだIDリスト

  const statusMessage = document.createElement("span");
  statusMessage.id = "statusMessage";
  statusMessage.style.marginLeft = "10px";
  postForm.querySelector("button[type='submit']").after(statusMessage);

  /**
   * 時間を12時間表示（午前/午後表記）、日付も付けてフォーマットする関数。
   * 午前0時を正しく表示するように修正しました。
   * @param {string} timeString - フォーマットする時間文字列。
   * @returns {string} フォーマットされた時間文字列。
   */
  function formatTo12HourWithDate(timeString) {
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "午後" : "午前";

    // 0時を午前0時として表示し、それ以外は12時間形式に変換
    hours = hours % 12; // 0-11
    if (hours === 0) { // 午前0時または午後0時
        if (ampm === "午前") {
            hours = 0; // 午前0時
        } else {
            hours = 12; // 午後0時 (正午)
        }
    }


    return `${year}/${month}/${day} ${ampm} ${hours}:${minutes}`;
  }

  /**
   * ID.jsonを読み込み、IDリストを初期化する。
   * @returns {Promise<void>} ID読み込みのPromise。
   */
  function loadIds() {
    return fetch("../ID.json")
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

  /**
   * サーバーから投稿を取得し、表示を更新する。
   */
  function fetchPosts() {
    fetch("/api")
      .then((res) => {
        if (!res.ok) throw new Error("サーバーエラー");
        return res.json();
      })
      .then((data) => {
        renderPosts(data.posts);
        // topic内の<br>をそのまま改行にして表示
        document.getElementById("currentTopic").innerHTML = data.topic.replace(/<br\s*\/?>/gi, "<br>");
      })
      .catch((e) => {
        console.error("投稿の取得に失敗しました:", e);
      });
  }

  /**
   * 取得した投稿データをテーブルに表示する。
   * 新しい投稿が上に来るように並べ替え、[toall]を画像に置換する。
   * @param {Array<Object>} posts - 投稿データの配列。
   */
  function renderPosts(posts) {
    postsTableBody.innerHTML = "";
    const total = posts.length;
    
    // カスタム絵文字のマップを定義
    // ここにChatwork絵文字のテキスト表現と、対応する画像のURLを追加してください。
    // 例: "(happy)": "https://example.com/happy_emoji.png"
    const emojiMap = {
      "[toall]": "https://github.com/shiratama-kotone/yuyuyu-made-bbs/blob/main/public/TO%20ALL.png?raw=true",
      ":)": "https://assets.chatwork.com/images/emoticon2x/emo_smile.gif",
      ":(": "https://assets.chatwork.com/images/emoticon2x/emo_sad.gif",
      ":D": "https://assets.chatwork.com/images/emoticon2x/emo_more_smile.gif",
      "8-)": "https://assets.chatwork.com/images/emoticon2x/emo_lucky.gif",
      ":o": "https://assets.chatwork.com/images/emoticon2x/emo_surprise.gif",
      ";)": "https://assets.chatwork.com/images/emoticon2x/emo_wink.gif",
      ";(": "https://assets.chatwork.com/images/emoticon2x/emo_tears.gif",
    "(sweat)": "https://assets.chatwork.com/images/emoticon2x/emo_sweat.gif",
      ":|": "https://assets.chatwork.com/images/emoticon2x/emo_mumu.gif",
      ":*": "https://assets.chatwork.com/images/emoticon2x/emo_kiss.gif",
      ":p": "https://assets.chatwork.com/images/emoticon2x/emo_tongueout.gif",
      "(blush)": "https://assets.chatwork.com/images/emoticon2x/emo_blush.gif",
      ":^)": "https://assets.chatwork.com/images/emoticon2x/emo_wonder.gif",
      "|-)": "https://assets.chatwork.com/images/emoticon2x/emo_snooze.gif",
      "(inlove)": "https://assets.chatwork.com/images/emoticon2x/emo_love.gif",
      
    };

    // 絵文字マップのキーから正規表現を生成
    // 正規表現で特別な意味を持つ文字をエスケープし、全てのキーをORで結合
    const emojiPatterns = Object.keys(emojiMap)
      .map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const emojiRegex = new RegExp(emojiPatterns, 'g');

    posts.forEach((post, index) => {
      // 表示番号を計算 (一番上が最大番号)
      const displayNum = total - index - 1;
      const row = document.createElement("tr");

      // IDがID.jsonに含まれているか確認し、クラスを追加
      const idClass = idList.includes(post.id) ? 'class="admin"' : "";

      // 時間を12時間表示＋日付＋午前午前に変換
      const formattedTime = formatTo12HourWithDate(post.time);

      // 投稿内容に含まれる絵文字パターンを画像に変換
      // `replace()`の第二引数に変換関数を渡し、マッチしたテキストに応じて適切な画像URLを使用
      const formattedContent = post.content.replace(emojiRegex, (match) => {
        const imageUrl = emojiMap[match];
        if (imageUrl) {
          // 画像のURLとスタイルを設定して、テキストと同じ高さで中央に配置
          return `<img src="${imageUrl}" alt="${match}" style="height: 1em; vertical-align: middle;">`;
        }
        return match; // マップにない場合は元のテキストを返す (通常は発生しない)
      });

      row.innerHTML = `
        <td>${displayNum}</td>
        <td>${post.name}</td>
        <td ${idClass}>${post.id}</td>
        <td>${formattedContent}</td>
        <td>${formattedTime}</td>
      `;
      postsTableBody.appendChild(row);
    });
  }

  /**
   * 投稿フォームの送信処理。
   * 入力チェックを行い、サーバーに投稿を送信する。
   */
  postForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const pass = document.getElementById("password").value.trim();
    // 改行コードを<br>タグに変換
    const content = document.getElementById("content").value.trim().replace(/\n/g, "<br>");

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
        fetchPosts(); // 成功したら投稿リストを更新
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

  // 初期化処理: IDを読み込み後、投稿を取得し、1秒ごとに更新を開始
  loadIds().then(() => {
    fetchPosts(); // 初回読み込み
    setInterval(fetchPosts, 1000); // 1秒ごとに更新
  });
});

/**
 * 現在時刻を更新し、HTML要素に表示する。
 * 午前0時を正しく表示するように修正しました。
 */
function updateClock() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();
  var ampm = hours >= 12 ? "午後" : "午前";

  // 0時を午前0時として表示し、それ以外は12時間形式に変換
  hours = hours % 12; // 0-11
  if (hours === 0) { // 午前0時または午後0時
    if (ampm === "午前") {
        hours = 0; // 午前0時
    } else {
        hours = 12; // 午後0時 (正午)
    }
  }


  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  var timeString = hours + ":" + minutes + ":" + seconds + " " + ampm;
  document.getElementById("clock").textContent = timeString;
}

// 毎秒時計を更新
setInterval(updateClock, 1000);

// 初回実行で時計を表示
updateClock();

// DOM要素の取得 (jQueryを使用しているため、CDNの読み込みが必要です)
// 例: <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
var $seconds = $(".seconds .time");
var $minutes = $(".minutes .time");
var $hour = $(".hour .time");
var $humanTime = $("#human-time");
var clockHeight = $("#bar-clock .hour").height();

/**
 * 現在の時刻（時、分、秒）をオブジェクトで返す。
 * @returns {Object} 現在の時刻情報。
 */
function getTime() {
  var dateTime = new Date();

  return {
    hour: dateTime.getHours(),
    minutes: dateTime.getMinutes(),
    seconds: dateTime.getSeconds(),
  };
}

/**
 * 時間に基づいてバークロックのカラムの高さを設定する。
 * @param {jQuery} $el - 設定するDOM要素のjQueryオブジェクト。
 * @param {number} time - 現在の時間（秒、分、時）。
 * @param {number} duration - 最大時間（59, 23など）。
 */
function renderTime($el, time, duration) {
  var percentage = (clockHeight * time) / duration;
  $el.height(percentage);
  // 高さに応じて背景色を調整
  $el.css("background-color", "hsl(" + percentage + ", 50%, 50%)");
}

/**
 * 時間を2桁形式にフォーマットする。
 * @param {number} time - フォーマットする時間。
 * @returns {string} 2桁にフォーマットされた時間文字列。
 */
function formatTime(time) {
  return time < 10 ? "0" + time : time;
}

/**
 * マスター関数: バークロックと読みやすい時刻表示を更新する。
 * @param {Object} time - 現在の時刻情報（時、分、秒）。
 */
function updateTime(time) {
  renderTime($seconds, time.seconds, 59);
  renderTime($minutes, time.minutes, 59);
  renderTime($hour, time.hour, 23);

  // 読みやすい時間を設定
  $humanTime.text(function () {
    var separator = " "; // 区切り文字
    return formatTime(time.hour) + separator + formatTime(time.minutes) + separator + formatTime(time.seconds);
  });
}

// インターバルでバークロックと時刻表示を更新
var t = setInterval(function () {
  updateTime(getTime());
}, 1000);
