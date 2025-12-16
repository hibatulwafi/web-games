/* ============================================================
   LEADERBOARD (FIREBASE ONLINE VERSION)
   ============================================================ */

/* ---------- DOM ---------- */
const nameModal = document.getElementById("nameModal");
const playerNameInput = document.getElementById("playerNameInput");
const saveNameBtn = document.getElementById("saveNameBtn");

const listDesktop = document.getElementById("leaderboardList");
const listMobile = document.getElementById("leaderboardListMobile");

/* ---------- FIRESTORE ---------- */
const leaderboardRef = window.db.collection("leaderboard");

/* ============================================================
   MODAL CONTROL
   ============================================================ */

window.showNameModal = function () {
  nameModal.classList.remove("hidden");
  playerNameInput.value = "";
  setSaveButtonLoading(false); // ⬅️ reset state
  setTimeout(() => playerNameInput.focus(), 150);
};

window.hideNameModal = function () {
  nameModal.classList.add("hidden");
};

/* ============================================================
   LOAD LEADERBOARD (TOP 10)
   ============================================================ */

window.loadLeaderboard = async function () {
  try {
    const snapshot = await leaderboardRef
      .orderBy("score", "desc")
      .limit(10)
      .get();

    const data = snapshot.docs.map((doc) => doc.data());
    renderLeaderboard(data);
  } catch (err) {
    console.error("Load leaderboard failed:", err);
  }
};

function renderLeaderboard(data) {
  const render = (el) => {
    if (!el) return;

    el.innerHTML =
      data.length === 0
        ? `<li class="text-gray-400 text-sm">Belum ada skor</li>`
        : data
            .map(
              (e, i) => `
                <li class="flex justify-between bg-white rounded px-3 py-1 text-sm shadow">
                  <span>${i + 1}. <b>${e.name}</b></span>
                  <span>${e.score}</span>
                </li>
              `
            )
            .join("");
  };

  render(listDesktop);
  render(listMobile);
}

/* Load leaderboard saat page siap */
document.addEventListener("DOMContentLoaded", loadLeaderboard);

/* ============================================================
   SAVE SCORE
   ============================================================ */

window.saveScore = async function (name, score) {
  await leaderboardRef.add({
    name,
    score,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  await loadLeaderboard();
};

/* ============================================================
   SAVE BUTTON (MODAL)
   ============================================================ */

saveNameBtn.addEventListener("click", async () => {
  if (saveNameBtn.disabled) return; // 🛑 extra safety

  let name = playerNameInput.value.trim();
  if (!name) name = "Guest";

  try {
    setSaveButtonLoading(true); // 🔒 lock button

    await window.saveScore(name, window.lastScore);

    hideNameModal();
  } catch (err) {
    console.error("Save score failed:", err);
    alert("Gagal menyimpan skor. Coba lagi.");
  } finally {
    setSaveButtonLoading(false); // 🔓 unlock
  }
});

function setSaveButtonLoading(isLoading) {
  saveNameBtn.disabled = isLoading;

  if (isLoading) {
    saveNameBtn.textContent = "Menyimpan...";
    saveNameBtn.classList.add("opacity-60", "cursor-not-allowed");
  } else {
    saveNameBtn.textContent = "Simpan Skor";
    saveNameBtn.classList.remove("opacity-60", "cursor-not-allowed");
  }
}
