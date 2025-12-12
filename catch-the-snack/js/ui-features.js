/* ============================================================
   UI FEATURES - CLEAN REFACTORED VERSION
   ============================================================ */

/* ---------- DOM CACHE ---------- */
const hudBar = document.getElementById("hudBar");
// const canvas = document.getElementById("gameCanvas");
const rotateWarning = document.getElementById("rotateWarning");
const drawer = document.getElementById("mobileDrawer");

/* ============================================================
   AUTO-HIDE HUD (fade-out setelah 2 detik)
   ============================================================ */
window.autoHideHUD = function () {
    hudBar.classList.add("opacity-100");

    setTimeout(() => {
        hudBar.classList.add("transition-opacity", "duration-700");
        hudBar.classList.remove("opacity-100");
        hudBar.classList.add("opacity-0");
    }, 2000);
};

/* ============================================================
   FULLSCREEN MODE (tap canvas to enter fullscreen)
   ============================================================ */
window.enableFullscreen = function () {
    const requestFS =
        document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        null;

    if (!requestFS) return; // Browser tidak support fullscreen

    canvas.addEventListener("click", () => {
        requestFS.call(document.documentElement).catch(() => { });
    });
};

/* ============================================================
   ORIENTATION LOCK (portrait required)
   ============================================================ */
function checkOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isLandscape) {
        rotateWarning.classList.remove("hidden", "opacity-0");
        rotateWarning.classList.add("flex");
    } else {
        rotateWarning.classList.add("opacity-0");
        setTimeout(() => rotateWarning.classList.add("hidden"), 300);
    }
}

window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);
checkOrientation();

/* ============================================================
   MOBILE DRAWER DRAG / SWIPE (smooth)
   ============================================================ */
let touchStartY = null;
const SWIPE_THRESHOLD = 35; // lebih smooth, tidak terlalu sensitif

drawer.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
});

drawer.addEventListener("touchmove", (e) => {
    if (touchStartY === null) return;

    const deltaY = touchStartY - e.touches[0].clientY;

    if (deltaY > SWIPE_THRESHOLD) {
        drawer.classList.add("drawer-open");
    } else if (deltaY < -SWIPE_THRESHOLD) {
        drawer.classList.remove("drawer-open");
    }
});

drawer.addEventListener("touchend", () => {
    touchStartY = null;
});

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    enableFullscreen();
});
