const gameBoard = document.querySelector("[data-game-board]");
const playGameBtn = document.getElementById("play-game-btn");
const gameInsectOptions = document.getElementById("game-insect-options");
const gameElapsedTime = document.getElementById("game-elapsed-time-value");
const gameScoreValue = document.getElementById("game-score-value");
const gameBackBtn = document.getElementById("game-back-btn");
const gameResultValue = document.getElementById("game-result-value");
const gameResultModalOverlay = document.getElementById(
  "game-result-modal-overlay"
);
const retryGameBtn = document.getElementById("retry-game-btn");
const smashBugSound = document.getElementById("smash-bug-sound");

const screens = {
  MAIN: "main",
  CHOOSE: "choose",
  GAME: "game",
};

const state = {
  insect: null,
  score: 0,
};

function getTime({ format } = { format: 12 }) {
  const date = new Date();
  let hours = date.getHours();
  let zone = hours > 11 ? "PM" : "AM";

  if (format === 12 && hours > 11) {
    hours -= 12;
    zone = "PM";
  }

  if (hours === 0 && format === 12) {
    hours = 1;
    zone = "AM";
  }

  return {
    hours,
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    zone,
  };
}

function timer({ durationMs, callback, intervalMs = 100, onComplete }) {
  let totalMs = 0;
  const interval = setInterval(() => {
    callback?.();
    totalMs += intervalMs;
    if (totalMs >= durationMs) {
      clearInterval(interval);
      callback?.();
      onComplete?.();
    }
  }, intervalMs);
  return interval;
}

function getScreen(name) {
  return document.querySelector(`[data-screen="${name}"]`);
}

function showScreen(name) {
  getScreen(name).classList.add("show");
  getScreen(name).classList.remove("hide");
}

function hideScreen(name) {
  getScreen(name).classList.add("hide");
  getScreen(name).classList.remove("show");
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

function getRandomRotation() {
  return getRandomNumber(360);
}

function getRandomPosition(board) {
  const { width, height } = board.getBoundingClientRect();
  const x = Math.floor((getRandomNumber(width) * 90) / width);
  const y = Math.floor((getRandomNumber(height) * 90) / height);
  return [x, y];
}

function createInsect(insect, board) {
  const rotation = getRandomRotation();
  const [x, y] = getRandomPosition(board);

  board.innerHTML += `
    <button data-insect="${insect}" style="rotate: ${rotation}deg; top: ${y}%; left: ${x}%" class="game-board-insect">
      <img src="./assets/${insect}.png" alt="${insect}" />
    </button>
  `;
}

function updateGameScore(value) {
  state.score = value;
  gameScoreValue.textContent = value;
}

function startGame(insect) {
  state.insect = insect;

  const duration = 60;
  let seconds = duration;

  createInsect(state.insect, gameBoard);

  timer({
    durationMs: duration * 1000,
    intervalMs: 1000,
    callback: function () {
      if (seconds > 0) seconds -= 1;
      const secontdsStr = String(seconds).padStart("2", "0");
      gameElapsedTime.textContent = `00:${secontdsStr}`;
    },

    onComplete: function () {
      gameResultValue.textContent = state.score;
      gameResultModalOverlay.style.display = "flex";
      gameBoard.innerHTML = "";
      updateGameScore(0);
    },
  });
}

function catchBoardInsect(target) {
  smashBugSound.currentTime = 0.2;
  smashBugSound.play();

  const img = target.querySelector("img");
  img.src = "./assets/cracked-screen.png";
  target.style.pointerEvents = "none";

  setTimeout(() => {
    target.classList.add("catched");

    setTimeout(() => {
      createInsect(state.insect, gameBoard);
      target.remove();
    }, 300);
  }, 300);

  updateGameScore(state.score + 1);
}

playGameBtn.addEventListener("click", () => {
  hideScreen(screens.MAIN);
  showScreen(screens.CHOOSE);
});

gameBackBtn.addEventListener("click", () => {
  showScreen(screens.MAIN);
  hideScreen(screens.CHOOSE);
});

retryGameBtn.addEventListener("click", function () {
  gameResultModalOverlay.style.display = "none";
  startGame(state.insect);
});

gameInsectOptions.addEventListener("click", function ({ target }) {
  if (!target.dataset.option) return;
  hideScreen(screens.CHOOSE);
  showScreen(screens.GAME);
  startGame(target.dataset.option);
});

gameBoard.addEventListener("click", function ({ target }) {
  if (target.dataset.insect) catchBoardInsect(target);
});

showScreen(screens.MAIN);
