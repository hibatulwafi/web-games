/* ============================================================
   UI FEATURES - FINAL STABLE VERSION (HP-FIRST)
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
  if (!hudBar) return;

  hudBar.classList.remove("opacity-0");
  hudBar.classList.add("opacity-100");

  setTimeout(() => {
    hudBar.classList.add("transition-opacity", "duration-700");
    hudBar.classList.remove("opacity-100");
    hudBar.classList.add("opacity-0");
  }, 2000);
};

/* ============================================================
   FULLSCREEN MODE (HP-FIRST)
   ============================================================ */
window.enableFullscreen = function () {
  if (!canvas) return;

  const requestFS =
    document.documentElement.requestFullscreen ||
    document.documentElement.webkitRequestFullscreen ||
    null;

  if (!requestFS) return;

  canvas.addEventListener("click", () => {
    requestFS.call(document.documentElement).catch(() => {});
  });
};

/* Sinkron resize setelah fullscreen */
document.addEventListener("fullscreenchange", () => {
  window.dispatchEvent(new Event("resize"));
});

/* ============================================================
   ORIENTATION LOCK (portrait only)
   ============================================================ */
function checkOrientation() {
  if (!rotateWarning) return;

  const vw = window.visualViewport
    ? window.visualViewport.width
    : window.innerWidth;

  const vh = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  const isLandscape = vw > vh;

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

/* ============================================================
   MOBILE DRAWER DRAG / SWIPE
   ============================================================ */
if (drawer) {
  let touchStartY = null;
  const SWIPE_THRESHOLD = 35;

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
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  checkOrientation();
  enableFullscreen();
});
