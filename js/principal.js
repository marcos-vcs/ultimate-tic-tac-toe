// Configurações Iniciais
let isDarkMode = true;
let xColor = localStorage.getItem("xColor") || "#3b82f6";
let oColor = localStorage.getItem("oColor") || "#ef4444";
const themeToggle = document.getElementById("theme-toggle");
const settingsBtn = document.getElementById("settings-btn");

// Sistema de Tema
function toggleTheme() {
  isDarkMode = !isDarkMode;
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  applyTheme();
  setupBoard();
  initParticles();
}

function applyTheme() {
  document.body.classList.toggle("bg-gray-900", isDarkMode);
  document.body.classList.toggle("bg-gray-100", !isDarkMode);
  themeToggle.innerHTML = isDarkMode
    ? '<i class="fas fa-moon"></i>'
    : '<i class="fas fa-sun"></i>';
  themeToggle.classList.toggle("bg-gray-800", isDarkMode);
  themeToggle.classList.toggle("text-white", isDarkMode);
  themeToggle.classList.toggle("bg-gray-100", !isDarkMode);
  themeToggle.classList.toggle("text-gray-900", !isDarkMode);

  const scoreboard = document.getElementById("scoreboard");
  const status = document.getElementById("status");
  if (isDarkMode) {
    scoreboard.classList.add("text-white");
    scoreboard.classList.remove("text-gray-900");
    status.classList.add("text-white");
    status.classList.remove("text-gray-900");
  } else {
    scoreboard.classList.add("text-gray-900");
    scoreboard.classList.remove("text-white");
    status.classList.add("text-gray-900");
    status.classList.remove("text-white");
  }

  document.getElementById("x-color").value = xColor;
  document.getElementById("o-color").value = oColor;

  // Atualizar cores dos ícones
  document
    .querySelectorAll("#scoreboard .fa-xmark, #result-modal .fa-xmark")
    .forEach((icon) => {
      icon.style.color = xColor;
    });
  document
    .querySelectorAll("#scoreboard .fa-circle, #result-modal .fa-circle")
    .forEach((icon) => {
      icon.style.color = oColor;
    });
}

// Sistema de Partículas
function initParticles() {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class SymbolParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 25 + 15;
      this.speedX = Math.random() * 1.5 - 0.75;
      this.speedY = Math.random() * 1.5 - 0.75;
      this.angle = Math.random() * 360;
      this.rotation = Math.random() * 2 - 1;
      this.type = Math.random() > 0.5 ? "X" : "O";
      this.alpha = Math.random() * 0.3 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.angle += this.rotation;

      if (this.x > canvas.width + 100) this.reset();
      if (this.x < -100) this.reset();
      if (this.y > canvas.height + 100) this.reset();
      if (this.y < -100) this.reset();
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      ctx.globalAlpha = this.alpha;
      ctx.font = `${this.size}px Arial`;
      ctx.fillStyle = this.type === "X" ? xColor : oColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.type, 0, 0);
      ctx.restore();
    }
  }

  const particles = Array(100)
    .fill()
    .map(() => new SymbolParticle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Sistema de Customização
settingsBtn.addEventListener("click", () => {
  document.getElementById("customization-modal").classList.remove("hidden");
});

function closeCustomizationModal() {
  document.getElementById("customization-modal").classList.add("hidden");
}

document.getElementById("x-color").addEventListener("input", (e) => {
  xColor = e.target.value;
  localStorage.setItem("xColor", xColor);
  updateBoard();
  initParticles();
  document
    .querySelectorAll("#scoreboard .fa-xmark, #result-modal .fa-xmark")
    .forEach((icon) => {
      icon.style.color = xColor;
    });
});

document.getElementById("o-color").addEventListener("input", (e) => {
  oColor = e.target.value;
  localStorage.setItem("oColor", oColor);
  updateBoard();
  initParticles();
  document
    .querySelectorAll("#scoreboard .fa-circle, #result-modal .fa-circle")
    .forEach((icon) => {
      icon.style.color = oColor;
    });
});

// Lógica do Jogo
const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const gameState = {
  board: Array(9).fill(null),
  mode: "ai",
  difficulty: "easy",
  currentPlayer: "X",
  gameOver: false,
  scores: { X: 0, O: 0 },
  moves: 0,
  isAITurn: false,
  elements: {
    board: document.getElementById("board"),
    status: document.getElementById("status"),
    menu: document.getElementById("menu"),
    game: document.getElementById("game"),
    xScore: document.getElementById("x-score"),
    oScore: document.getElementById("o-score"),
    gameContainer: document.getElementById("game-container"),
  },
};

function getTemperatureColor() {
  return gameState.moves < 3
    ? "border-green-500"
    : gameState.moves < 6
    ? "border-yellow-500"
    : "border-red-500";
}

function updateGameBorder() {
  const gameContainer = gameState.elements.gameContainer;
  ["border-green-500", "border-yellow-500", "border-red-500"].forEach((c) =>
    gameContainer.classList.remove(c)
  );
  gameContainer.classList.add(getTemperatureColor());
}

function selectMode(mode) {
  if (mode === "ai") {
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("ai-difficulty").classList.remove("hidden");
  } else {
    startGame("multiplayer");
  }
}

function returnToMainMenu() {
  document.getElementById("ai-difficulty").classList.add("hidden");
  document.getElementById("main-menu").classList.remove("hidden");
}

function startGame(modeOrDifficulty) {
  gameState.mode = ["easy", "medium", "hard", "extreme"].includes(
    modeOrDifficulty
  )
    ? "ai"
    : "multiplayer";
  gameState.difficulty = modeOrDifficulty;
  gameState.elements.menu.classList.add("hidden");
  gameState.elements.game.classList.remove("hidden");
  setupBoard();
}

function setupBoard() {
  gameState.board.fill(null);
  gameState.gameOver = false;
  gameState.moves = 0;
  gameState.currentPlayer = "X";
  gameState.isAITurn = false;

  gameState.elements.board.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = `cell ${
      isDarkMode
        ? "bg-gray-800 border-gray-700 text-white"
        : "bg-white border-gray-300 text-gray-900"
    } border-2`;
    cell.dataset.index = i;
    cell.tabIndex = 0;
    cell.addEventListener("click", handleCellClick);
    cell.addEventListener("keydown", handleCellKeydown);
    gameState.elements.board.appendChild(cell);
  }

  updateStatus();
  document.getElementById("result-modal").classList.add("hidden");
  updateGameBorder();
  toggleBoardInteraction(true);
}

function handleCellClick(event) {
  const index = parseInt(event.target.dataset.index);
  if (!gameState.isAITurn) handleMove(index);
}

function handleCellKeydown(event) {
  if (event.key === "Enter" && !gameState.isAITurn) {
    const index = parseInt(event.target.dataset.index);
    handleMove(index);
  }
}

function toggleBoardInteraction(active) {
  gameState.elements.board.style.pointerEvents = active ? "auto" : "none";
}

function updateBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    const symbol = gameState.board[index];
    cell.innerHTML = symbol
      ? `<i class="${
          symbol === "X" ? "fas fa-xmark" : "far fa-circle"
        } text-4xl" 
             style="color: ${symbol === "X" ? xColor : oColor}"></i>`
      : "";
    cell.classList.toggle("taken", !!symbol);
  });
  updateGameBorder();
}

function handleMove(index) {
  if (gameState.board[index] || gameState.gameOver || gameState.isAITurn)
    return;

  gameState.board[index] = gameState.currentPlayer;
  gameState.moves++;

  updateBoard();
  if (checkGameState()) return;

  if (gameState.mode === "ai") {
    gameState.isAITurn = true;
    toggleBoardInteraction(false);
    setTimeout(aiMove, 800);
  } else {
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
    updateStatus();
  }
}

function aiMove() {
  if (gameState.gameOver) return;

  const available = gameState.board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index) => index !== null);

  if (available.length === 0) return;

  let move;
  switch (gameState.difficulty) {
    case "easy":
      move = available[Math.floor(Math.random() * available.length)];
      break;
    case "medium":
      move =
        findWinningMove("O") ||
        findWinningMove("X") ||
        available[Math.floor(Math.random() * available.length)];
      break;
    case "hard":
    case "extreme":
      move = minimaxBestMove();
      break;
    default:
      move = available[0];
  }

  gameState.board[move] = "O";
  gameState.moves++;
  gameState.isAITurn = false;
  updateBoard();
  checkGameState();
  toggleBoardInteraction(true);
}

function findWinningMove(symbol) {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const cells = [gameState.board[a], gameState.board[b], gameState.board[c]];
    if (
      cells.filter((c) => c === symbol).length === 2 &&
      cells.includes(null)
    ) {
      return pattern[cells.indexOf(null)];
    }
  }
  return null;
}

function minimaxBestMove() {
  let bestScore = -Infinity;
  let bestMove = null;

  for (let i = 0; i < 9; i++) {
    if (gameState.board[i] === null) {
      gameState.board[i] = "O";
      let score = minimax(gameState.board, 0, false);
      gameState.board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(board, depth, isMaximizing) {
  const winner = checkWinner();
  if (winner === "O") return 1;
  if (winner === "X") return -1;
  if (board.every((cell) => cell !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "O";
        let score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = "X";
        let score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkGameState() {
  const winner = checkWinner();
  if (winner) {
    handleWin(winner);
    return true;
  }

  if (gameState.board.every((cell) => cell !== null)) {
    showResultModal(null, "Empate!");
    gameState.gameOver = true;
    return true;
  }
  return false;
}

function checkWinner() {
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      gameState.board[a] &&
      gameState.board[a] === gameState.board[b] &&
      gameState.board[a] === gameState.board[c]
    ) {
      return gameState.board[a];
    }
  }
  return null;
}

function handleWin(winner) {
  gameState.scores[winner]++;
  gameState.elements[`${winner.toLowerCase()}Score`].textContent =
    gameState.scores[winner];
  showResultModal(winner, "venceu!");
  gameState.gameOver = true;
}

function updateStatus() {
  const statusText =
    gameState.mode === "multiplayer"
      ? `Vez do ${gameState.currentPlayer}`
      : gameState.currentPlayer === "X"
      ? "Sua vez!"
      : "Vez da IA...";

  gameState.elements.status.textContent = statusText;
}

function showResultModal(symbol, result) {
  const modal = document.getElementById("result-modal");
  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");

  icon.innerHTML =
    result === "venceu!"
      ? symbol === "X"
        ? '<i class="fas fa-trophy text-yellow-500 animate-bounce"></i>'
        : '<i class="fas fa-robot text-blue-500 animate-bounce"></i>'
      : '<i class="fas fa-handshake text-gray-500"></i>';

  title.textContent = result === "venceu!" ? `${symbol} ${result}` : "Empate!";

  document.getElementById("modal-x-score").textContent = gameState.scores.X;
  document.getElementById("modal-o-score").textContent = gameState.scores.O;

  modal.classList.remove("hidden");
}

function returnToMenu() {
  gameState.elements.game.classList.add("hidden");
  gameState.elements.menu.classList.remove("hidden");
  document.getElementById("result-modal").classList.add("hidden");
  gameState.scores = { X: 0, O: 0 };
  gameState.elements.xScore.textContent = "0";
  gameState.elements.oScore.textContent = "0";
}

// Inicialização
window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  isDarkMode = savedTheme !== "light";
  xColor = localStorage.getItem("xColor") || "#3b82f6";
  oColor = localStorage.getItem("oColor") || "#ef4444";
  applyTheme();
  initParticles();
});

themeToggle.addEventListener("click", toggleTheme);
