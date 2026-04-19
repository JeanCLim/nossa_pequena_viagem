const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
const btn = document.getElementById("start-btn");
const overlay = document.getElementById("ui-overlay");
const music = document.getElementById("bg-music");
const finishBtn = document.getElementById("finish-btn");
const finalOverlay = document.getElementById("final-overlay");

let stars = [];
let isMoving = false;
let isExploding = false;

// Variáveis de controle de movimento
let speed = 0;
let warp = 0.7;
let speedTarget = 0;
let warpTarget = 0.7;
let keys = {}; // Objeto para rastrear teclas pressionadas

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// 1. TRIPPLICADA A QUANTIDADE: 2400 estrelas
for (let i = 0; i < 10000; i++) {
  stars.push({
    x: Math.random() * canvas.width - canvas.width / 2,
    y: Math.random() * canvas.height - canvas.height / 2,
    z: Math.random() * canvas.width,
  });
}

function finalizarViagem() {
  if (isExploding) return;
  isExploding = true;
  if (finishBtn) finishBtn.style.display = "none";

  const duracaoWarp = 4.0;

  const acelerarIntervalo = setInterval(() => {
    if (warpTarget < 35) warpTarget += 1.5;
    if (speedTarget < 85) speedTarget += 3;
  }, 100);

  setTimeout(() => {
    clearInterval(acelerarIntervalo);
    if (music) music.pause();
    finalOverlay.style.display = "flex";
    isMoving = false;
  }, duracaoWarp * 1000);
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isMoving && !isExploding) {
    // Lógica dos controles manuais
    let currentMaxSpeed = 5;

    if (keys["Shift"]) {
      currentMaxSpeed = 15; // TURBO
      warpTarget = 4;
    } else if (keys["w"] || keys["W"] || keys["ArrowUp"]) {
      currentMaxSpeed = 8; // ACELERAÇÃO
      warpTarget = 2;
    } else {
      currentMaxSpeed = 3; // CRUZEIRO
      warpTarget = 0.7;
    }

    speedTarget = currentMaxSpeed;

    // Transição suave
    speed += (speedTarget - speed) * 0.05;
    warp += (warpTarget - warp) * 0.05;
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  stars.forEach((star) => {
    star.z -= speed;
    if (star.z <= 0) {
      star.z = canvas.width;
      star.x = Math.random() * canvas.width - canvas.width / 2;
      star.y = Math.random() * canvas.height - canvas.height / 2;
    }

    const x = star.x / (star.z / canvas.width);
    const y = star.y / (star.z / canvas.width);
    const r = (1 - star.z / canvas.width) * 1.5; // Estrelas levemente menores para não poluir

    const xPrev = star.x / ((star.z + speed * warp) / canvas.width);
    const yPrev = star.y / ((star.z + speed * warp) / canvas.width);

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = r > 0 ? r : 0.1;
    ctx.moveTo(x, y);
    ctx.lineTo(xPrev, yPrev);
    ctx.stroke();
  });

  ctx.restore();
  requestAnimationFrame(draw);
}

// BOTÃO INICIAR
if (btn) {
  btn.onclick = function () {
    isMoving = true;
    speed = 0.5;
    speedTarget = 3;
    overlay.style.display = "none";
    if (music) music.play().catch((e) => console.log("Som bloqueado"));

    setTimeout(() => {
      if (finishBtn && !isExploding) finishBtn.style.display = "block";
    }, 60000);
    const hint = document.getElementById("controls-hint");
    if (hint) hint.style.display = "block"; // Isso faz a mensagem aparecer no canto
  };
}

// EVENTOS DE TECLADO
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Atalho ESC
  if (e.key === "Escape" && isMoving && !isExploding) {
    if (finishBtn) finishBtn.style.display = "block";
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

if (finishBtn) {
  finishBtn.onclick = finalizarViagem;
}

draw();
