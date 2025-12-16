/* ============================================================
   REALTIME LEADERBOARD (READ-ONLY)
   ============================================================ */

const listEl = document.getElementById("realtimeLeaderboard");

const leaderboardRef = db
  .collection("leaderboard")
  .orderBy("score", "desc")
  .limit(10);

// 🔥 REALTIME LISTENER
leaderboardRef.onSnapshot(
  (snapshot) => {
    if (snapshot.empty) {
      listEl.innerHTML = `<li class="text-center text-gray-400">Belum ada skor</li>`;
      return;
    }

    const data = snapshot.docs.map((doc) => doc.data());

    listEl.innerHTML = data
      .map(
        (e, i) => `
          <li class="flex justify-between bg-gray-50 rounded px-3 py-2 shadow">
            <span>${i + 1}. <b>${e.name}</b></span>
            <span>${e.score}</span>
          </li>
        `
      )
      .join("");
  },
  (error) => {
    console.error("Realtime leaderboard error:", error);
    listEl.innerHTML = `<li class="text-center text-red-400">Gagal load leaderboard</li>`;
  }
);
