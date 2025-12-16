/* ============================================================
   CATCH THE SNACKS — GAME.JS (FINAL FULL REFACTOR)
   ============================================================ */

/* ================================
   CONFIG
================================ */

const CONFIG = {
  BASE_WIDTH: 480,
  BASE_HEIGHT: 720,
  GAME_TIME: 60,
  SPAWN_START: 900,
  SPAWN_MIN: 450,
  FALL_SPEED_MIN: 2,
  FALL_SPEED_MAX: 4,
};

const FEVER = {
  COMBO_TRIGGER: 5,
  DURATION: 5,
  SCORE_MULTIPLIER: 2,
  SPAWN_MULTIPLIER: 0.55,
};

/* ================================
   ASSETS
================================ */

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
  OVER: "over",
};

let state = STATE.IDLE;

let images = {};
let sounds = {};

let score = 0;
let timeLeft = CONFIG.GAME_TIME;
let countdownValue = null;

let items = [];
let particles = [];
let lastSpawn = 0;
let lastFrame = 0;

/* ================================
   FEVER STATE
================================ */

let feverActive = false;
let feverTimeLeft = 0;
let comboCount = 0;
let feverPulseTime = 0;

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
   AUDIO
================================ */

let bgm = null;

function loadSounds() {
  sounds.good = new Audio(SOUNDS.good);
  sounds.bad = new Audio(SOUNDS.bad);
  sounds.gameOver = new Audio(SOUNDS.gameOver);
}

function playSound(type) {
  const sfx = sounds[type];
  if (!sfx) return;
  const a = sfx.cloneNode();
  a.volume = type === "gameOver" ? 0.7 : 0.9;
  a.play().catch(() => {});
}

function initBGM() {
  if (bgm) return;
  bgm = new Audio(MUSIC.bgm);
  bgm.loop = true;
  bgm.volume = 0.4;
}

function playBGM() {
  if (bgm) bgm.play().catch(() => {});
}

function pauseBGM() {
  if (bgm) bgm.pause();
}

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

/* ================================
   CANVAS SCALE (MOBILE)
================================ */

function resizeCanvas() {
  const vw = window.visualViewport?.width || window.innerWidth;
  const vh = window.visualViewport?.height || window.innerHeight;
  const scale = Math.min(vw / CONFIG.BASE_WIDTH, vh / CONFIG.BASE_HEIGHT);

  canvas.style.width = CONFIG.BASE_WIDTH * scale + "px";
  canvas.style.height = CONFIG.BASE_HEIGHT * scale + "px";
}

window.addEventListener("resize", resizeCanvas);

/* ================================
   PARTICLES
================================ */

function spawnParticles(x, y, type) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.6,
      vy: -Math.random() * 2 - 1,
      radius: 4 + Math.random() * 3,
      life: 1,
      type,
    });
  }

  particles.push({
    x,
    y,
    vx: 0,
    vy: -1.5,
    radius: 0,
    life: 1.2,
    type: type === "good" ? "textGood" : "textBad",
  });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * 60 * dt;
    p.y += p.vy * 60 * dt;
  }
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);

    // ===============================
    // TEXT PARTICLE (+ SCORE)
    // ===============================
    if (p.type === "textGood" || p.type === "textBad") {
      let text = "+1";
      let color = "#4caf50";

      if (p.type === "textBad") {
        text = "-2";
        color = "#ff3b3b";
      }

      // 🔥 FEVER BONUS
      if (p.type === "textGood" && feverActive) {
        text = "+2";
        color = "#ffeb3b";
        ctx.shadowColor = "#ff9800";
        ctx.shadowBlur = 10;
      }

      ctx.fillStyle = color;
      ctx.font = "bold 20px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(text, p.x, p.y);
    }

    // ===============================
    // DOT PARTICLE (VISUAL ONLY)
    // ===============================
    else {
      ctx.fillStyle = p.type === "good" ? "#ffe082" : "#ff8a80";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

/* ================================
   GAME FLOW
================================ */

function resetGame() {
  score = 0;
  timeLeft = CONFIG.GAME_TIME;
  items = [];
  particles = [];
  lastSpawn = 0;

  feverActive = false;
  feverTimeLeft = 0;
  comboCount = 0;
  feverPulseTime = 0;

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
  pauseBGM();

  restartOverlayBtn.classList.remove("hidden");
  gameLogo.style.display = "block";

  if (window.showNameModal) showNameModal();
}

/* ================================
   FEVER CONTROL
================================ */

function startFever() {
  feverActive = true;
  feverTimeLeft = FEVER.DURATION;
  comboCount = 0;
}

function stopFever() {
  feverActive = false;
  feverTimeLeft = 0;
}

/* ================================
   SPAWN
================================ */

function spawnItem() {
  const r = Math.random();
  const type = r < 0.4 ? "dimsum" : r < 0.8 ? "cilok" : "trash";

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

  countdownValue = timeLeft > 0 && timeLeft <= 3 ? Math.ceil(timeLeft) : null;

  if (timeLeft <= 0) {
    timeLeft = 0;
    endGame();
    return;
  }

  timeEl.textContent = Math.ceil(timeLeft);

  if (feverActive) {
    feverTimeLeft -= dt;
    feverPulseTime += dt;
    if (feverTimeLeft <= 0) stopFever();
  }

  lastSpawn += delta;

  let spawnInterval =
    CONFIG.SPAWN_START -
    (1 - timeLeft / CONFIG.GAME_TIME) * (CONFIG.SPAWN_START - CONFIG.SPAWN_MIN);

  if (feverActive) spawnInterval *= FEVER.SPAWN_MULTIPLIER;

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
        comboCount = 0;
        spawnParticles(it.x, it.y, "bad");
        playSound("bad");
      } else {
        comboCount++;
        score += feverActive ? FEVER.SCORE_MULTIPLIER : 1;
        spawnParticles(it.x, it.y, "good");
        playSound("good");

        if (comboCount >= FEVER.COMBO_TRIGGER && !feverActive) {
          startFever();
        }
      }

      scoreEl.textContent = score;
      items.splice(i, 1);
    } else if (it.y > CONFIG.BASE_HEIGHT + 120) {
      items.splice(i, 1);
    }
  }

  updateParticles(dt);
}

/* ================================
   DRAW
================================ */

function draw() {
  ctx.drawImage(images.background, 0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);

  if (feverActive) {
    ctx.fillStyle = "rgba(255,193,7,0.12)";
    ctx.fillRect(0, 0, CONFIG.BASE_WIDTH, CONFIG.BASE_HEIGHT);
  }

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

  drawParticles();
  drawFeverText();
  drawCountdown();
}

function drawFeverText() {
  if (!feverActive) return;

  const pulse = 1 + Math.sin(feverPulseTime * 6) * 0.12;
  const alpha = 0.7 + Math.sin(feverPulseTime * 6) * 0.3;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffeb3b";
  ctx.shadowColor = "#ff9800";
  ctx.shadowBlur = 15;
  ctx.font = `bold ${28 * pulse}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(
    `🔥 FEVER x${FEVER.SCORE_MULTIPLIER}`,
    CONFIG.BASE_WIDTH / 2,
    70
  );
  ctx.restore();
}

function drawCountdown() {
  if (countdownValue === null) return;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.15)";
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
