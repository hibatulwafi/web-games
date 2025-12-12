/* ================================
   ASSETS & GAME CONFIG
================================ */

const ASSETS = {
    background: "assets/background.jpg",
    player: "assets/quby_bowl.png",
    dimsum: "assets/dimsum.png",
    cilok: "assets/cilok.png",
    trash: "assets/trash.png",
};

const BASE_WIDTH = 480;
const BASE_HEIGHT = 720;

const GAME_CONFIG = {
    gameTime: 45,
    spawnIntervalStart: 900,
    spawnIntervalMin: 450,
    fallSpeedMin: 2,
    fallSpeedMax: 4,
    playerSpeed: 9,
};

const SOUNDS = {
    good: "assets/sfx_ting.mp3",
    bad: "assets/sfx_boom.mp3",
};

let soundGood, soundBad;

/* ================================
   CANVAS SETUP
================================ */

const canvas = document.getElementById("gameCanvas");
canvas.width = BASE_WIDTH;
canvas.height = BASE_HEIGHT;

const ctx = canvas.getContext("2d");

/* ================================
   DOM ELEMENTS
================================ */

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const restartBtnMobile = document.getElementById("restartBtnMobile");
const leaderboardList = document.getElementById("leaderboardList");
const restartOverlayBtn = document.getElementById("restartOverlayBtn");


/* ================================
   GAME STATE
================================ */

let gameState = "idle"; // idle | running | over
let images = {};
let score = 0;
let timeLeft = GAME_CONFIG.gameTime;
let items = [];
let particles = [];
let lastSpawnTime = 0;
let lastTime = 0;

let player = {
    x: BASE_WIDTH / 2,
    y: BASE_HEIGHT - 130,
    width: 140,
    height: 160,
    targetX: null,
};

/* ================================
   LOAD ASSETS
================================ */

function loadImages(assets) {
    return Promise.all(
        Object.entries(assets).map(([key, src]) => {
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
    soundGood = new Audio(SOUNDS.good);
    soundBad = new Audio(SOUNDS.bad);
}

function playSound(sfx) {
    const audio = sfx.cloneNode();
    audio.volume = 0.9;
    audio.play().catch(() => { });
}

/* ================================
   PARTICLES EFFECT
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

function updateParticles(delta) {
    const dt = delta / 1000;

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

        if (p.type === "textGood" || p.type === "textBad") {
            ctx.fillStyle = p.type === "textGood" ? "#4caf50" : "#ff3b3b";
            ctx.font = "20px system-ui";
            ctx.textAlign = "center";
            ctx.fillText(p.type === "textGood" ? "+1" : "-2", p.x, p.y);
        } else {
            ctx.fillStyle = p.type === "good" ? "#ffe082" : "#ff8a80";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    });
}

/* ================================
   GAME LOGIC
================================ */

function resetGame() {
    score = 0;
    timeLeft = GAME_CONFIG.gameTime;
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;

    items = [];
    particles = [];
    lastSpawnTime = 0;
    player.x = BASE_WIDTH / 2;
}

function spawnItem() {
    const roll = Math.random();

    let type;
    if (roll < 0.30) type = "dimsum";
    else if (roll < 0.60) type = "cilok";
    else type = "trash"; // 40%

    items.push({
        type,
        x: Math.random() * BASE_WIDTH,
        y: -60,
        size: 70,
        speed: GAME_CONFIG.fallSpeedMin + Math.random() * (GAME_CONFIG.fallSpeedMax - GAME_CONFIG.fallSpeedMin),
        angle: 0,
        angleSpeed: (Math.random() - 0.5) * 0.015,
    });
}


function update(delta) {
    if (gameState !== "running") return;

    const dt = delta / 1000;
    timeLeft -= dt;

    if (timeLeft <= 0) {
        timeLeft = 0;
        gameState = "over";
        window.lastScore = score;
        showNameModal();
        restartOverlayBtn.classList.remove("hidden");
    }

    timeEl.textContent = Math.floor(timeLeft);

    lastSpawnTime += delta;

    const spawnInterval =
        GAME_CONFIG.spawnIntervalStart -
        (1 - timeLeft / GAME_CONFIG.gameTime) *
        (GAME_CONFIG.spawnIntervalStart - GAME_CONFIG.spawnIntervalMin);

    if (lastSpawnTime >= spawnInterval) {
        spawnItem();
        lastSpawnTime = 0;
    }

    if (player.targetX !== null) {
        player.x += (player.targetX - player.x) * 0.22;
    }

    const half = player.width / 2;
    player.x = Math.max(half, Math.min(BASE_WIDTH - half, player.x));

    for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.speed;
        it.angle += it.angleSpeed * delta;

        const hit =
            it.x + it.size / 2 > player.x - player.width / 2 &&
            it.x - it.size / 2 < player.x + player.width / 2 &&
            it.y + it.size / 2 > player.y - player.height / 2 &&
            it.y - it.size / 2 < player.y + player.height / 2;

        if (hit) {
            if (it.type === "trash") {
                score -= 2;
                spawnParticles(it.x, it.y, "bad");
                playSound(soundBad);
            } else {
                score += 1;
                spawnParticles(it.x, it.y, "good");
                playSound(soundGood);
            }

            scoreEl.textContent = score;
            items.splice(i, 1);
            continue;
        }

        if (it.y > BASE_HEIGHT + 150) items.splice(i, 1);
    }

    updateParticles(delta);
}

/* ================================
   DRAW
================================ */

function draw() {
    ctx.drawImage(images.background, 0, 0, BASE_WIDTH, BASE_HEIGHT);

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
}

function drawOverlay() {
    if (gameState === "idle" || gameState === "over") {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        ctx.fillStyle = "white";
        ctx.font = "26px system-ui";
        ctx.textAlign = "center";

        if (gameState === "idle") {
            ctx.fillText("Tekan Start untuk mulai!", BASE_WIDTH / 2, BASE_HEIGHT / 2);
        } else {
            ctx.fillText("Waktu habis!", BASE_WIDTH / 2, BASE_HEIGHT / 2 - 20);
            ctx.fillText("Skor kamu: " + score, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 20);
        }

        ctx.restore();
    }
}

/* ================================
   GAME LOOP
================================ */

function gameLoop(t) {
    if (!lastTime) lastTime = t;
    const delta = t - lastTime;
    lastTime = t;

    if (gameState === "running") update(delta);

    draw();
    drawOverlay();

    requestAnimationFrame(gameLoop);
}

/* ================================
   INPUT CONTROLS
================================ */

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    player.targetX =
        ((e.clientX - rect.left) / rect.width) * BASE_WIDTH;
});

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    player.targetX =
        ((e.touches[0].clientX - rect.left) / rect.width) * BASE_WIDTH;
});

/* ================================
   BUTTON HANDLERS
================================ */

startBtn.onclick = () => {
    loadSounds();
    resetGame();
    gameState = "running";
    startBtn.style.display = "none";
    restartBtn.style.display = "inline-block";
    document.getElementById("gameLogo").style.display = "none";
    restartOverlayBtn.classList.add("hidden");
};

restartBtn.onclick = () => {
    resetGame();
    gameState = "running";
};

restartOverlayBtn.onclick = () => {
    resetGame();
    gameState = "running";
    restartOverlayBtn.classList.add("hidden");
};


// restartBtnMobile.onclick = () => {
//     resetGame();
//     gameState = "running";
// };

/* ================================
   INIT GAME
================================ */

loadImages(ASSETS).then(() => {
    requestAnimationFrame(gameLoop);
});
