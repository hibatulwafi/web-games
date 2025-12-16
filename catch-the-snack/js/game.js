/* ============================================================
   CATCH THE SNACKS — GAME.JS (FULL REFACTOR)
   ============================================================ */

/* ================================
   CONFIG
================================ */

const CONFIG = {
  BASE_WIDTH: 480,
  BASE_HEIGHT: 720,

  GAME_TIME: 10,

  SPAWN_START: 900,
  SPAWN_MIN: 450,

  FALL_SPEED_MIN: 2,
  FALL_SPEED_MAX: 4,
};

const ASSETS = {
  background: "assets/background.jpg",
  player: "assets/quby_bowl.png",
  dimsum: "assets/dimsum.png",
  cilok: "assets/cilok.png",
  trash: "assets/trash.png",
};

const SOUNDS = {
  good: "assets/sfx_ting.mp3",
  bad: "assets/sfx_boom.mp3",
  gameOver: "assets/sfx_gameover.mp3",
};

const MUSIC = {
  bgm: "assets/bgm.mp3",
};

/* ================================
   CANVAS
================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = CONFIG.BASE_WIDTH;
canvas.height = CONFIG.BASE_HEIGHT;

/* ================================
   DOM
================================ */

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const restartOverlayBtn = document.getElementById("restartOverlayBtn");
const gameLogo = document.getElementById("gameLogo");

/* ================================
   STATE
================================ */

const STATE = {
  IDLE: "idle",
  RUNNING: "running",
  ENDING: "ending",
  OVER: "over",
};

let state = STATE.IDLE;

let images = {};
let sounds = {};

let score = 0;
let timeLeft = CONFIG.GAME_TIME;

let items = [];
let particles = [];

let lastSpawn = 0;
let lastFrame = 0;

let bgm = null;
let isMusicEnabled = true;
let countdownValue = null;

/* ================================
   PLAYER
================================ */

const player = {
  x: CONFIG.BASE_WIDTH / 2,
  y: CONFIG.BASE_HEIGHT - 130,
  width: 140,
  height: 160,
  targetX: null,
};

/* ================================
   ASSET LOADING
================================ */

function loadImages() {
  return Promise.all(
    Object.entries(ASSETS).map(([key, src]) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          images[key] = img;
          resolve();
        };
      });
    })
  );
}

function loadSounds() {
  sounds.good = new Audio(SOUNDS.good);
  sounds.bad = new Audio(SOUNDS.bad);
  sounds.gameOver = new Audio(SOUNDS.gameOver);
}

function playSound(type) {
  const sfx = sounds[type];
  if (!sfx) return;

  const audio = sfx.cloneNode();
  audio.volume = type === "gameOver" ? 0.7 : 0.9;
  audio.play().catch(() => {});
}

/* ================================
   CANVAS SCALE (HP-FIRST)
================================ */

function resizeCanvas() {
  const vw = window.visualViewport
    ? window.visualViewport.width
    : window.innerWidth;

  const vh = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  const scale = Math.min(vw / CONFIG.BASE_WIDTH, vh / CONFIG.BASE_HEIGHT);

  canvas.style.width = CONFIG.BASE_WIDTH * scale + "px";
  canvas.style.height = CONFIG.BASE_HEIGHT * scale + "px";
}

window.addEventListener("resize", resizeCanvas);

/* ================================
   GAME FLOW
================================ */

function resetGame() {
  score = 0;
  timeLeft = CONFIG.GAME_TIME;

  items.length = 0;
  particles.length = 0;

  lastSpawn = 0;
  player.x = CONFIG.BASE_WIDTH / 2;

  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
}

function startGame() {
  resetGame();
  state = STATE.RUNNING;

  startBtn.classList.add("hidden");
  restartOverlayBtn.classList.add("hidden");
  gameLogo.style.display = "none";

  if (window.hideNameModal) hideNameModal();
  initBGM();
  playBGM();
}

function endGame() {
  state = STATE.OVER;
  window.lastScore = score;
  playSound("gameOver");

  restartOverlayBtn.classList.remove("hidden");
  gameLogo.style.display = "block";

  if (window.showNameModal) showNameModal();
  pauseBGM();
}

/* ================================
   SPAWN & PARTICLES
================================ */

function spawnItem() {
  const roll = Math.random();
  const type = roll < 0.4 ? "dimsum" : roll < 0.8 ? "cilok" : "trash";

  items.push({
    type,
    x: 40 + Math.random() * (CONFIG.BASE_WIDTH - 80),
    y: -60,
    size: 70,
    speed:
      CONFIG.FALL_SPEED_MIN +
      Math.random() * (CONFIG.FALL_SPEED_MAX - CONFIG.FALL_SPEED_MIN),
    angle: 0,
    spin: (Math.random() - 0.5) * 0.015,
  });
}

/* ================================
   UPDATE
================================ */

function update(delta) {
  if (state !== STATE.RUNNING) return;

  const dt = delta / 1000;
  timeLeft -= dt;

  // ⏱ COUNTDOWN ZONE
  if (timeLeft <= 3 && timeLeft > 0) {
    countdownValue = Math.ceil(timeLeft);
  } else {
    countdownValue = null;
  }

  // ⏹ GAME OVER
  if (timeLeft <= 0) {
    timeLeft = 0;
    endGame();
    return;
  }

  timeEl.textContent = Math.ceil(timeLeft);

  lastSpawn += delta;

  const spawnInterval =
    CONFIG.SPAWN_START -
    (1 - timeLeft / CONFIG.GAME_TIME) * (CONFIG.SPAWN_START - CONFIG.SPAWN_MIN);

  if (lastSpawn >= spawnInterval) {
    spawnItem();
    lastSpawn = 0;
  }

  if (player.targetX !== null) {
    player.x += (player.targetX - player.x) * 0.22;
  }

  const half = player.width / 2;
  player.x = Math.max(half, Math.min(CONFIG.BASE_WIDTH - half, player.x));

  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.y += it.speed;
    it.angle += it.spin * delta;

    const hit =
      it.x + it.size / 2 > player.x - player.width / 2 &&
      it.x - it.size / 2 < player.x + player.width / 2 &&
      it.y + it.size / 2 > player.y - player.height / 2 &&
      it.y - it.size / 2 < player.y + player.height / 2;

    if (hit) {
      if (it.type === "trash") {
        score -= 2;
        playSound("bad");
      } else {
        score += 1;
        playSound("good");
      }

      scoreEl.textContent = score;
      items.splice(i, 1);
    } else if (it.y > CONFIG.BASE_HEIGHT + 100) {
      items.splice(i, 1);
    }
  }
}

/* ================================
   DRAW
================================ */

function draw() {
  ctx.drawImage(images.background, 0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);

  items.forEach((it) => {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.angle);
    ctx.drawImage(
      images[it.type],
      -it.size / 2,
      -it.size / 2,
      it.size,
      it.size
    );
    ctx.restore();
  });

  ctx.drawImage(
    images.player,
    player.x - player.width / 2,
    player.y - player.height / 2,
    player.width,
    player.height
  );
}

function drawCountdown() {
  if (countdownValue === null) return;

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 96px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(countdownValue, CONFIG.BASE_WIDTH / 2, CONFIG.BASE_HEIGHT / 2);

  ctx.restore();
}

/* ================================
   LOOP
================================ */

function loop(t) {
  if (!lastFrame) lastFrame = t;
  const delta = t - lastFrame;
  lastFrame = t;

  update(delta);
  draw();
  drawCountdown();

  requestAnimationFrame(loop);
}

/* ================================
   INPUT
================================ */

canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  player.targetX = ((e.clientX - r.left) / r.width) * CONFIG.BASE_WIDTH;
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  player.targetX =
    ((e.touches[0].clientX - r.left) / r.width) * CONFIG.BASE_WIDTH;
});

/* ================================
   BUTTONS
================================ */

startBtn.onclick = () => {
  loadSounds();
  startGame();
};

restartBtn.onclick = startGame;
restartOverlayBtn.onclick = startGame;

/* ================================
   INIT
================================ */

loadImages().then(() => {
  resizeCanvas();
  requestAnimationFrame(loop);
});

/* =================================
  BGM CONTROL
================================= */
function initBGM() {
  if (bgm) return;

  bgm = new Audio(MUSIC.bgm);
  bgm.loop = true;
  bgm.volume = 0.4;
}

function playBGM() {
  if (!isMusicEnabled || !bgm) return;

  bgm.play().catch(() => {});
}

function pauseBGM() {
  if (!bgm) return;
  bgm.pause();
}
