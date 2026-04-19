const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const btn = document.getElementById("start-btn");
const overlay = document.getElementById("overlay");
const hint = document.getElementById("hint");
const music = document.getElementById("music");
const finishBtn = document.getElementById("finish-btn");
const finalOverlay = document.getElementById("final-overlay");

let stars = [];
let isMoving = false;
let isExploding = false;

// Variáveis de controle de movimento e efeito
let speed = 0;
let warp = 0.7;
let speedTarget = 5;
let warpTarget = 0.7;

// Configuração inicial do Canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Criar estrelas
for (let i = 0; i < 1000; i++) {
  stars.push({
    x: Math.random() * canvas.width - canvas.width / 2,
    y: Math.random() * canvas.height - canvas.height / 2,
    z: Math.random() * canvas.width,
  });
}

function playWarpSound(duracao) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(60, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    1200,
    audioCtx.currentTime + duracao,
  );
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duracao);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duracao);
}

function finalizarViagem() {
  if (isExploding) return;
  isExploding = true;
  if (finishBtn) finishBtn.style.display = "none";

  const duracaoWarp = 4.0;
  playWarpSound(duracaoWarp);

  // Inicia a aceleração gradual
  const acelerarIntervalo = setInterval(() => {
    if (warpTarget < 30) warpTarget += 1;
    if (speedTarget < 80) speedTarget += 2;
  }, 100);

  setTimeout(() => {
    clearInterval(acelerarIntervalo);
    music.pause();
    finalOverlay.style.display = "flex";
    isMoving = false;
    isExploding = false;
    // Reseta valores para um possível reinício
    speed = 0;
    speedTarget = 5;
    warp = 0.7;
    warpTarget = 0.7;
  }, duracaoWarp * 1000);
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Suavização do movimento (Interpolação)
  if (isMoving) {
    speed += (speedTarget - speed) * 0.05;
    warp += (warpTarget - warp) * 0.05;
  }

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
    const r = (1 - star.z / canvas.width) * 2;

    ctx.beginPath();
    ctx.fillStyle = "white";
    // O efeito de rastro (warp)
    const xPrev = star.x / ((star.z + speed * warp) / canvas.width);
    const yPrev = star.y / ((star.z + speed * warp) / canvas.width);

    ctx.moveTo(x, y);
    ctx.lineTo(xPrev, yPrev);
    ctx.lineWidth = r;
    ctx.strokeStyle = "white";
    ctx.stroke();
  });

  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  requestAnimationFrame(draw);
}

// Eventos
btn.addEventListener("click", () => {
  overlay.style.opacity = "0";
  music.play();
  setTimeout(() => {
    overlay.style.display = "none";
    hint.style.display = "block";
  }, 1000);

  setTimeout(() => {
    if (finishBtn && !isExploding) finishBtn.style.display = "block";
  }, 60000);

  isMoving = true;
});

if (finishBtn) {
  finishBtn.addEventListener("click", finalizarViagem);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isMoving && !isExploding) {
    if (finishBtn) finishBtn.style.display = "block";
  }
});

draw();
