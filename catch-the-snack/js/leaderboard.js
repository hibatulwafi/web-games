/* ============================================================
   LEADERBOARD & NAME MODAL HANDLER (FINAL REFACTORED)
   ============================================================ */

/* ---------- DOM CACHE ---------- */
const nameModal = document.getElementById("nameModal");
const playerNameInput = document.getElementById("playerNameInput");
const saveNameBtn = document.getElementById("saveNameBtn");

const listDesktop = document.getElementById("leaderboardList");
const listMobile = document.getElementById("leaderboardListMobile");

/* ============================================================
   MODAL CONTROL
   ============================================================ */

window.showNameModal = function () {
    nameModal.classList.remove("hidden");
    playerNameInput.value = "";
    setTimeout(() => playerNameInput.focus(), 150);
};

window.hideNameModal = function () {
    nameModal.classList.add("hidden");
};

/* ============================================================
   LOAD LEADERBOARD
   ============================================================ */

window.loadLeaderboard = function () {
    const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    const render = (el) => {
        if (!el) return;

        el.innerHTML =
            data.length === 0
                ? `<li class="text-gray-400 text-sm">Belum ada skor</li>`
                : data
                    .slice(0, 10)
                    .map(
                        (e, i) =>
                            `<li class="flex justify-between bg-white rounded px-3 py-1 text-sm shadow">
                                 <span>${i + 1}. <b>${e.name}</b></span>
                                 <span>${e.score}</span>
                               </li>`
                    )
                    .join("");
    };

    render(listDesktop);
    render(listMobile);
};

/* Load once on boot */
document.addEventListener("DOMContentLoaded", loadLeaderboard);

/* ============================================================
   SAVE SCORE
   ============================================================ */

window.saveScore = function (name, score) {
    const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");

    data.push({ name, score });
    data.sort((a, b) => b.score - a.score);

    localStorage.setItem("leaderboard", JSON.stringify(data));
    loadLeaderboard();
};

/* ============================================================
   SAVE BUTTON (MODAL)
   ============================================================ */

saveNameBtn.addEventListener("click", () => {
    let name = playerNameInput.value.trim();
    if (name === "") name = "Guest";

    window.saveScore(name, window.lastScore);
    hideNameModal();
});
