const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const btnStart = document.getElementById("btn-start");
const level = document.getElementById("level");
const scoreboard = document.getElementById("scoreboard");
const playerNameInput = document.getElementById("player-name");
const muteBtn = document.getElementById("mute-btn");

let score = 0;
let missed = 0;
let fruits = [];
let gameStarted = false;
let kardusImg = new Image();
kardusImg.src = "assets/kardus1.png";
let kardus = { x: 350, y: 550, width: 100, height: 100, speed: 20 };
let gameInterval;
let gameOver = false;

const levelSpeed = { easy: 3000, medium: 2000, hard: 1000 };
const levelKardusSpeed = { easy: 20, medium: 30, hard: 40 };

const dropSound = new Audio("assets/backsound.mp3");
const gameOverSound = new Audio("assets/gameover.mp3");
const tuktuk = new Audio("assets/tuk.mp3");

let isMuted = false;

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  
  if (isMuted) {
    dropSound.muted = true;
    gameOverSound.muted = true;
  } else {
    dropSound.muted = false;
    gameOverSound.muted = false;
  }
  
  muteBtn.textContent = isMuted ? "Unmute" : "Mute";
  console.log("Mute status changed:", isMuted);
});

function loadLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.sort((a, b) => b.score - a.score);

  scoreboard.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index + 1}</td><td>${entry.name}</td><td>${entry.level}</td><td>${entry.score}</td>`;
    scoreboard.appendChild(row);
  });
}

btnStart.addEventListener("click", () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert("Please enter your name!");
    return;
  }

  if (!isMuted) {
    console.log("Playing background sound...");
    dropSound.volume = 0.1;
    dropSound.play();
  } else {
    console.log("Sound is muted.");
  }

  gameOver = false;
  gameStarted = true;
  score = 0;
  missed = 0;
  fruits = [];
  kardus = { x: 800, y: 650, width: 280, height: 280, speed: levelKardusSpeed[level.value.toLowerCase()] };
  canvas.style.display = "block";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gameInterval = setInterval(dropFruit, levelSpeed[level.value.toLowerCase()]);
  setInterval(gameLoop, 20);
  btnStart.disabled = true;
  document.querySelector(".home").style.display = "none";
  console.log("Game started!");
});

function saveScore(playerName) {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({
    name: playerName,
    level: level.value,
    score: score,
  });

  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  loadLeaderboard();
}

function endGame() {
  if (gameOver) return;
  
  gameOverSound.play();
  
  gameOver = true;
  setTimeout(() => {
    alert("Game Over!");
    document.querySelector(".home").style.display = "block";
  }, 200);
  
  dropSound.muted = true;
  clearInterval(gameInterval);
  canvas.style.display = "none";

  const playerName = playerNameInput.value.trim();
  saveScore(playerName);
  btnStart.disabled = false;
  playerNameInput.value = "";
}

document.addEventListener("keydown", (e) => {
  if (gameStarted) {
    if (e.key === "a" || e.key === "A") {
      kardus.x -= kardus.speed;
    } else if (e.key === "d" || e.key === "D") {
      kardus.x += kardus.speed;
    } else if (e.key === "s" || e.key === "S") {
      kardus.x = canvas.width / 2 - kardus.width / 2;
    }

    if (kardus.x < 0) kardus.x = 0;
    if (kardus.x + kardus.width > canvas.width)
      kardus.x = canvas.width - kardus.width;
  }
});

function dropFruit() {
  const fruitImages = [
    "assets/1.png",
    "assets/2.png",
    "assets/3.png",
    "assets/4.png",
    "assets/5.png",
    "assets/6.png",
    "assets/7.png",
  ];
  const img = new Image();
  const imgRandom = Math.floor(Math.random() * fruitImages.length);
  img.src = fruitImages[imgRandom];

  let fruit = { img, x: Math.random() * (canvas.width - 100), y: -50, speed: 5, size: 90 };
  fruits.push(fruit);
  console.log("New fruit dropped at x:", fruit.x, "y:", fruit.y);
}

function updateFruits() {
  fruits.forEach((fruit, index) => {
    fruit.y += fruit.speed;

    if (
      fruit.y + fruit.size >= kardus.y &&
      fruit.x < kardus.x + kardus.width &&
      fruit.x + fruit.size > kardus.x
    ) {
      score++;
      fruits.splice(index, 1); 
      tuktuk.volume = 1.0;
      tuktuk.play();

      if (score === 5) {
        kardusImg.src = "assets/kardus2.png";
      }
      if (score === 10) {
        kardusImg.src = "assets/kardus3.png";
      }
    }

    if (fruit.y > canvas.height) {
      missed++;
      fruits.splice(index, 1);
      if (missed >= 3) {
        endGame();
      }
    }
  });
}

function gameLoop() {
  updateFruits();
  drawGame();
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(kardusImg, kardus.x, kardus.y, kardus.width, kardus.height);

  fruits.forEach((fruit) => {
    ctx.drawImage(fruit.img, fruit.x, fruit.y, fruit.size, fruit.size);
  });

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Missed: " + missed, 20, 60);
}

loadLeaderboard();
