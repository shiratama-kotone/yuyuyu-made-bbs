// ダークモード
const btn = document.getElementById('toggleBtn');
const overlay = document.getElementById('overlay');
let inverted = false;

const enableDarkMode = () => {
  overlay.style.clipPath = 'circle(150% at 100% 100%)';
  btn.classList.add('white');
  btn.classList.remove('black');
  inverted = true;
  document.cookie = "darkmode=true; path=/";
};

const disableDarkMode = () => {
  overlay.style.clipPath = 'circle(0 at 100% 100%)';
  btn.classList.add('black');
  btn.classList.remove('white');
  inverted = false;
  document.cookie = "darkmode=false; path=/";
};

window.addEventListener('DOMContentLoaded', () => {
  const darkModeCookie = document.cookie.split("; ").find(row => row.startsWith("darkmode="));
  if (darkModeCookie) {
    const darkModeValue = darkModeCookie.split("=")[1];
    if (darkModeValue === "true") enableDarkMode();
    else disableDarkMode();
  }
});

btn.addEventListener('click', () => {
  if (!inverted) enableDarkMode();
  else disableDarkMode();
});

// 時計
const clock = document.getElementById('clock');
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  clock.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// 投稿フォーム
const postForm = document.getElementById('postForm');
const postsTableBody = document.querySelector("#postsTable tbody");
let postCount = 0;

postForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = document.getElementById('content').value;
  const name = document.getElementById('name').value;
  const password = document.getElementById('password').value;

  const tr = document.createElement('tr');
  postCount++;

  const date = new Date();
  const timeStr = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  tr.innerHTML = `
    <td>${postCount}</td>
    <td>${name}</td>
    <td>${password}</td>
    <td>${content}</td>
    <td>${timeStr}</td>
  `;
  postsTableBody.appendChild(tr);

  postForm.reset();
});
