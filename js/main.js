// ===== 예식 정보 (여기만 바꾸면 달력/카운트다운이 함께 바뀝니다) =====
const WEDDING_DATE = new Date(2027, 3, 17, 13, 30); // 2027년 4월 17일 13:30 (월은 0부터 시작)

// ===== 토스트 메시지 =====
const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

// ===== 달력 생성 =====
function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("span"));
  }

  for (let d = 1; d <= lastDate; d++) {
    const cell = document.createElement("span");
    const dow = (firstDay + d - 1) % 7;
    cell.textContent = d;
    if (dow === 0) cell.classList.add("sun");
    if (dow === 6) cell.classList.add("sat");
    if (d === WEDDING_DATE.getDate()) cell.classList.add("day-wedding");
    grid.appendChild(cell);
  }

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  document.querySelector(".calendar__month").textContent = monthNames[month];
}

// ===== D-day 카운트다운 =====
function updateCountdown() {
  const diff = WEDDING_DATE - new Date();
  const msg = document.getElementById("countdownMsg");
  const units = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };

  if (diff <= 0) {
    Object.keys(units).forEach((k) => (units[k] = 0));
    msg.innerHTML = "민준 ♥ 서연의 결혼식이 <b>진행되었습니다</b>. 감사합니다.";
  } else {
    msg.innerHTML = `민준 ♥ 서연의 결혼식이 <b>${units.days + 1}일</b> 남았습니다.`;
  }

  document.querySelectorAll("#countdown strong").forEach((el) => {
    el.textContent = units[el.dataset.unit];
  });
}

// ===== 스크롤 등장 애니메이션 =====
function initFadeIn() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".fade").forEach((el) => observer.observe(el));
}

// ===== 갤러리 라이트박스 =====
function initGallery() {
  const items = [...document.querySelectorAll(".gallery__item")];
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  let current = 0;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    lbImg.style.background = getComputedStyle(item).backgroundImage;
    lbImg.textContent = item.textContent;
  }

  function open(index) {
    show(index);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  items.forEach((item, i) => item.addEventListener("click", () => open(i)));
  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", () => show(current - 1));
  document.getElementById("lbNext").addEventListener("click", () => show(current + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // 모바일 스와이프
  let startX = 0;
  lightbox.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX));
  lightbox.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });
}

// ===== 계좌 아코디언 =====
function initAccordion() {
  document.querySelectorAll(".accordion").forEach((acc) => {
    const head = acc.querySelector(".accordion__head");
    const body = acc.querySelector(".accordion__body");
    head.addEventListener("click", () => {
      const isOpen = acc.classList.toggle("open");
      head.setAttribute("aria-expanded", isOpen);
      body.style.maxHeight = isOpen ? body.scrollHeight + "px" : 0;
    });
  });
}

// ===== 복사 버튼 =====
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // file:// 등 clipboard API를 못 쓰는 환경 대비
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  showToast("복사되었습니다");
}

function initCopy() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => copyText(btn.dataset.copy));
  });
}

// ===== 방명록 (브라우저 localStorage에 저장) =====
const GB_KEY = "wedding-guestbook";

function loadGuestbook() {
  try {
    return JSON.parse(localStorage.getItem(GB_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestbook(list) {
  try {
    localStorage.setItem(GB_KEY, JSON.stringify(list));
  } catch {
    /* 저장 불가 환경은 무시 */
  }
}

function renderGuestbook() {
  const ul = document.getElementById("guestbookList");
  const list = loadGuestbook();
  ul.innerHTML = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.className = "gb-empty";
    li.textContent = "첫 번째 축하 메시지를 남겨주세요 :)";
    ul.appendChild(li);
    return;
  }

  list.forEach((entry) => {
    const li = document.createElement("li");
    const head = document.createElement("div");
    const name = document.createElement("b");
    const date = document.createElement("span");
    const text = document.createElement("p");

    head.className = "gb-head";
    name.textContent = entry.name;
    date.textContent = entry.date;
    text.textContent = entry.msg;

    head.append(name, date);
    li.append(head, text);
    ul.appendChild(li);
  });
}

function initGuestbook() {
  const form = document.getElementById("guestbookForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("gbName").value.trim();
    const msg = document.getElementById("gbMsg").value.trim();
    if (!name || !msg) return;

    const now = new Date();
    const list = loadGuestbook();
    list.unshift({
      name,
      msg,
      date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`,
    });
    saveGuestbook(list);
    renderGuestbook();
    form.reset();
    showToast("축하 메시지가 등록되었습니다");
  });
  renderGuestbook();
}

// ===== 공유하기 =====
function initShare() {
  document.getElementById("shareBtn").addEventListener("click", async () => {
    const data = {
      title: document.title,
      text: "저희 두 사람의 결혼식에 초대합니다.",
      url: location.href,
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* 사용자가 취소 */ }
    } else {
      copyText(location.href);
    }
  });
}

// ===== 움직임 줄이기 설정 확인 =====
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== 커버 사진 3D 기울기 (마우스 / 휴대폰 기울기) =====
function initTilt() {
  const card = document.getElementById("tiltCard");
  if (!card || reduceMotion) return;
  const MAX = 14; // 최대 기울기 각도

  function tilt(x, y) {
    // x, y: -1 ~ 1
    card.style.transform = `rotateY(${x * MAX}deg) rotateX(${-y * MAX}deg)`;
  }

  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    tilt(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
  });
  card.addEventListener("pointerleave", () => tilt(0, 0));

  // 휴대폰을 기울이면 따라 움직임 (지원 기기만)
  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma == null || e.beta == null) return;
    const x = Math.max(-1, Math.min(1, e.gamma / 30));
    const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    tilt(x, y);
  });
}

// ===== 배경에 떠다니는 3D 하트 =====
function initFloatingHearts() {
  if (reduceMotion) return;
  const box = document.getElementById("floating");
  const fills = ["url(#heartGloss)", "url(#heartGlossLilac)"];
  const COUNT = 14;

  for (let i = 0; i < COUNT; i++) {
    const size = 18 + Math.random() * 34;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#heart");
    use.setAttribute("fill", fills[i % 2]);
    svg.appendChild(use);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size * 0.9);
    svg.style.left = Math.random() * 100 + "%";
    svg.style.animationDuration = 10 + Math.random() * 12 + "s";
    svg.style.animationDelay = -Math.random() * 20 + "s";
    box.appendChild(svg);
  }
}

// ===== 실행 =====
document.addEventListener("DOMContentLoaded", () => {
  initTilt();
  initFloatingHearts();
  renderCalendar();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  initFadeIn();
  initGallery();
  initAccordion();
  initCopy();
  initGuestbook();
  initShare();
});
