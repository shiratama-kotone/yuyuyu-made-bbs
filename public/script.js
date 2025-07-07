document.addEventListener("DOMContentLoaded", () => {
  const postsTableBody = document.querySelector("#postsTable tbody");
  const postForm = document.querySelector("#postForm");
  const boardSelect = document.querySelector("#boardSelect"); // 追加
  let idList = []; // ID.jsonから読み込んだIDリスト
  let notificationSentForToAll = false; // Add a flag to track if notification has been sent
  let currentBoard = boardSelect.value; // 現在選択されている掲示板

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
    if (hours === 0) {
      // 午前0時または午後0時
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
    let apiUrl = "";
    let isYuzuBoard = false;

    if (currentBoard === "yuyuyu") {
      apiUrl = "/api";
      isYuzuBoard = false;
    } else if (currentBoard === "yuzu") {
      apiUrl = "https://bbs-yuzu.onrender.com/get_posts";
      isYuzuBoard = true;
    }

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error("サーバーエラー");
        return res.json();
      })
      .then((data) => {
        let postsToRender = [];
        let topicToDisplay = "";

        if (isYuzuBoard) {
          postsToRender = data.posts.map(post => ({
            name: post.name,
            id: post.id,
            content: post.message,
            time: post.created_at,
            id_color: post.id_color,
            name_color: post.name_color
          }));
          topicToDisplay = data.current_topic;
        } else { // yuyuyu board
          postsToRender = data.posts;
          topicToDisplay = data.topic;
        }

        renderPosts(postsToRender, isYuzuBoard);
        // topic内の<br>をそのまま改行にして表示
        document.getElementById("currentTopic").innerHTML = topicToDisplay.replace(
          /<br\s*\/?>/gi,
          "<br>"
        );
      })
      .catch((e) => {
        console.error("投稿の取得に失敗しました:", e);
      });
  }

  /**
   * 取得した投稿データをテーブルに表示する。
   * 新しい投稿が上に来るように並べ替え、絵文字を画像に置換する。
   * @param {Array<Object>} posts - 投稿データの配列。
   * @param {boolean} isYuzuBoard - ゆず掲示板のデータかどうか。
   */
  function renderPosts(posts, isYuzuBoard) {
    postsTableBody.innerHTML = "";
    const total = posts.length;

    // カスタム絵文字のマップを定義
    const emojiMap = {
      "[toall]": {
        url: "https://github.com/shiratama-kotone/yuyuyu-made-bbs/blob/main/public/TO%20ALL.png?raw=true",
        alt: "[toall]",
      },
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

    emojiMap["(silent)"] = {
      url: "https://emoji-list.jp/images/emoji/chatwork/silent.png",
      alt: ":|",
    };

    const emojiPatterns = Object.keys(emojiMap)
      .sort((a, b) => b.length - a.length)
      .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    const emojiRegex = new RegExp(emojiPatterns, "g");

    posts.forEach((post, index) => {
      const displayNum = total - index - 1;
      const row = document.createElement("tr");

      // IDがID.jsonに含まれているか確認し、クラスを追加 (ゆゆゆ掲示板のみ)
      const idClass = !isYuzuBoard && idList.includes(post.id) ? 'class="admin"' : "";

      // 時間を12時間表示＋日付＋午前午前に変換
      const formattedTime = formatTo12HourWithDate(post.time);

      // 投稿内容に含まれる絵文字パターンを画像に変換
      const formattedContent = post.content.replace(emojiRegex, (match) => {
        const emojiData = emojiMap[match];
        if (emojiData && emojiData.url) {
          const altText = emojiData.alt !== undefined ? emojiData.alt : match;
          return `<img src="${emojiData.url}" alt="${altText}" style="height: 1em; vertical-align: middle;">`;
        }
        return match;
      });

      // IDと名前のスタイルを適用
      let idDisplay = post.id;
      let nameDisplay = post.name;

      // ゆず掲示板の場合、IDに@を付け、色を適用
      if (isYuzuBoard) {
        idDisplay = `<font color="${post.id_color || 'inherit'}">@${post.id}</font>`;
        nameDisplay = `<font color="${post.name_color || 'inherit'}">${post.name}</font>`;
      } else {
        // ゆゆゆ掲示板の場合のID表示はそのまま、色はadminクラスで対応
        idDisplay = post.id; // ゆゆゆ掲示板は@なし
      }

      row.innerHTML = `
        <td>${displayNum}</td>
        <td>${nameDisplay}</td>
        <td ${idClass}>${idDisplay}</td>
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

    // --- Notification Logic Starts Here ---
    // Check if "[toall]" is in the content and a notification hasn't been sent yet
    if (content.includes("[toall]") && !notificationSentForToAll) {
      // Request permission for notifications if not already granted
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            // ゆず掲示板の場合はIDはpost.idから取得されるため、ここではnameとpassをそのまま渡す
            showToAllNotification(name, pass);
            notificationSentForToAll = true; // Set the flag to true after sending
          }
        });
      } else if (Notification.permission === "granted") {
        showToAllNotification(name, pass);
        notificationSentForToAll = true; // Set the flag to true after sending
      }
      // If permission is denied, we don't show the notification
    }
    // --- Notification Logic Ends Here ---

    // 投稿先APIの決定
    let postApiUrl = "";
    if (currentBoard === "yuyuyu") {
      postApiUrl = `/api?name=${encodeURIComponent(name)}&pass=${encodeURIComponent(
        pass
      )}&content=${encodeURIComponent(content)}`;
    } else if (currentBoard === "yuzu") {
      // ゆず掲示板への投稿は実装されていないため、ここではエラーメッセージを出すか、投稿処理をスキップ
      statusMessage.style.color = "red";
      statusMessage.textContent = "ゆず掲示板への投稿は現在サポートされていません。";
      setTimeout(() => (statusMessage.textContent = ""), 3000);
      return; // 投稿処理を中断
    }


    fetch(postApiUrl, {
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

  /**
   * Displays a "TO ALL" notification.
   * @param {string} name - The name of the user who posted.
   * @param {string} id - The ID of the user who posted.
   */
  function showToAllNotification(name, id) {
    if ("Notification" in window) {
      new Notification("皆さんへのお知らせ", {
        body: `${name}@${id}さんがTO ALLで皆さんのことを呼んでいます`, // ゆず掲示板の場合を考慮し、@を追加
      });
    }
  }

  // 掲示板選択が変更された時のイベントリスナー
  boardSelect.addEventListener("change", () => {
    currentBoard = boardSelect.value;
    fetchPosts(); // 選択が変更されたら投稿を再取得
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
  if (hours === 0) {
    // 午前0時または午後0時
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
  if ($seconds.length && $minutes.length && $hour.length && $humanTime.length) { // 要素が存在するか確認
    renderTime($seconds, time.seconds, 59);
    renderTime($minutes, time.minutes, 59);
    renderTime($hour, time.hour, 23);

    // 読みやすい時間を設定
    $humanTime.text(function () {
      var separator = " "; // 区切り文字
      return (
        formatTime(time.hour) +
        separator +
        formatTime(time.minutes) +
        separator +
        formatTime(time.seconds)
      );
    });
  }
}

// インターバルでバークロックと時刻表示を更新
var t = setInterval(function () {
  updateTime(getTime());
}, 1000);

// 最初の時刻更新
updateTime(getTime());
