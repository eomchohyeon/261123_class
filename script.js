// JS가 켜져 있다는 표시 (style.css의 '나타나는 효과'가 이걸 보고 작동해요)
document.documentElement.classList.add('js');


// 0. 모바일 햄버거 메뉴 열고 닫기
const menuToggle = document.querySelector('.menu-toggle');

function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
}

menuToggle.addEventListener('click', function () {
  setMenu(!document.body.classList.contains('menu-open'));
});

// Esc 키를 누르면 닫기
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') setMenu(false);
});

// 화면이 PC 크기로 넓어지면 닫기
window.matchMedia('(min-width: 769px)').addEventListener('change', function () {
  setMenu(false);
});


// 1. 링크를 누르면 (메뉴를 닫고) 해당 Section으로 부드럽게 이동
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (event) {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: 'smooth' });
  });
});


// 2. 스크롤할 때마다: Header 모양 바꾸기, 진행 막대 늘리기, 매장 사진 움직이기
const header = document.querySelector('.header');
const progress = document.querySelector('.progress');
const parallaxImage = document.querySelector('.parallax');

function onScroll() {
  const scrollTop = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;

  // Header: 조금이라도 내려가면 .scrolled 추가
  header.classList.toggle('scrolled', scrollTop > 40);

  // 진행 막대: 0(맨 위) ~ 1(맨 아래)
  progress.style.transform = 'scaleX(' + scrollTop / maxScroll + ')';

  // 매장 사진: 사진 위치에 따라 액자 안에서 위아래로 천천히 이동
  //   (사진 높이가 액자의 120%라서 0% ~ -16% 사이에서만 움직여야 빈틈이 안 생겨요)
  const box = parallaxImage.parentElement.getBoundingClientRect();
  let move = (box.top / window.innerHeight - 1) * 8;
  move = Math.min(0, Math.max(-16, move));
  parallaxImage.style.transform = 'translateY(' + move + '%)';
}

window.addEventListener('scroll', onScroll);
onScroll();


// 3. 화면에 들어오면 나타나기 (data-reveal이 붙은 요소)
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // 한 번만 실행
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-reveal]').forEach(function (el) {
  observer.observe(el);
});


// 4. 첫 화면: 마우스를 따라 사진과 동그라미가 살짝 움직이기
const hero = document.querySelector('.hero');
const heroVisual = document.querySelector('.hero-visual');

hero.addEventListener('mousemove', function (event) {
  // 화면 가운데를 0으로, 양 끝을 -1 ~ 1로 바꾸기
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = (event.clientY / window.innerHeight) * 2 - 1;
  heroVisual.style.setProperty('--mx', x);
  heroVisual.style.setProperty('--my', y);
});


// ========== 추가 페이지 ==========

// 작은 화면이거나 '움직임 줄이기'를 켰으면 단순한 모드 (style.css와 같은 조건)
const simpleMode = window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// 어떤 구역을 얼마나 지나왔는지 0 ~ 1로 알려주는 도구
function getProgress(element) {
  const box = element.getBoundingClientRect();
  const p = -box.top / (box.height - window.innerHeight);
  return Math.min(1, Math.max(0, p));
}


// 5. 커지는 사진: 스크롤 진행도(0~1)를 CSS 변수 --p 로 넘겨줘요
const zoomTrack = document.querySelector('.zoom-track');

function updateZoom() {
  const p = reduceMotion.matches ? 1 : getProgress(zoomTrack);
  zoomTrack.style.setProperty('--p', p);
}


// 6. 가로로 흐르는 시그니처: 세로 스크롤만큼 카드 줄을 옆으로 밀어요
const signature = document.querySelector('.signature');
const signatureTrack = document.querySelector('.signature-track');
const signatureBar = document.querySelector('.signature-bar span');

function setupSignature() {
  if (simpleMode.matches) {
    signature.style.height = '';
    signatureTrack.style.transform = '';
    return;
  }
  // 카드 줄이 옆으로 다 지나갈 만큼 구역 높이를 늘려요
  const distance = signatureTrack.scrollWidth - window.innerWidth;
  signature.style.height = (distance + window.innerHeight) + 'px';
}

function updateSignature() {
  if (simpleMode.matches) return;
  const p = getProgress(signature);
  const distance = signatureTrack.scrollWidth - window.innerWidth;
  signatureTrack.style.transform = 'translateX(' + (-p * distance) + 'px)';
  signatureBar.style.transform = 'scaleX(' + p + ')';
}

// 8. 하단 내비: 지금 보고 있는 섹션의 버튼에 .active 붙이기
//    (화면 위에서 40% 지점을 지난 섹션 중 가장 아래 것이 '지금 섹션')
const bottomLinks = document.querySelectorAll('.bottom-nav a');

function updateBottomNav() {
  let current = null;
  bottomLinks.forEach(function (link) {
    const section = document.querySelector(link.getAttribute('href'));
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.4) {
      current = link;
    }
  });
  bottomLinks.forEach(function (link) {
    link.classList.toggle('active', link === current);
  });
}

// 9. 맨 위로 버튼: 화면 절반 이상 내려가면 나타나고, 테두리 원이 스크롤 진행만큼 채워져요
const toTop = document.querySelector('.to-top');

function updateToTop() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  toTop.classList.toggle('show', window.scrollY > window.innerHeight * 0.5);
  toTop.style.setProperty('--progress', window.scrollY / maxScroll);
}

toTop.addEventListener('click', function () {
  setMenu(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', function () {
  updateZoom();
  updateSignature();
  updateBottomNav();
  updateToTop();
});
updateBottomNav();
updateToTop();

window.addEventListener('resize', function () {
  setupSignature();
  updateSignature();
});

// 사진이 다 불러와진 뒤 카드 길이를 다시 재요
window.addEventListener('load', setupSignature);
setupSignature();
updateZoom();
updateSignature();


// 7. 숫자가 0부터 목표 숫자까지 올라가기
function countUp(el) {
  const target = Number(el.dataset.to);
  const duration = 1500; // 1.5초
  const start = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // 처음엔 빠르게, 끝에서 천천히
    el.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(tick);
  }

  if (reduceMotion.matches) {
    el.textContent = target;
  } else {
    requestAnimationFrame(tick);
  }
}

const countObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      countUp(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count').forEach(function (el) {
  countObserver.observe(el);
});
