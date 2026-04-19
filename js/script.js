// 1. Pegar os elementos
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const btn = document.getElementById("start-btn");
const overlay = document.getElementById("overlay");
const music = document.getElementById("music");
const finishBtn = document.getElementById("finish-btn");
const finalOverlay = document.getElementById("final-overlay");

// 2. Variáveis de estado
let stars = [];
let isMoving = false;
let isExploding = false;
let speed = 0;
let warp = 0.7;
let speedTarget = 0;
let warpTarget = 0.7;

// 3. Ajustar tamanho do Canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// 4. Criar as estrelas
for (let i = 0; i < 800; i++) {
  stars.push({
    x: Math.random() * canvas.width - canvas.width / 2,
    y: Math.random() * canvas.height - canvas.height / 2,
    z: Math.random() * canvas.width,
  });
}

// 5. Função de Desenho (Loop)
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isMoving) {
    speed += (speedTarget - speed) * 0.05;
    warp += (warpTarget - warp) * 0.05;
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  stars.forEach((star) => {
    star.z -= speed;
    if (star.z <= 0) {
      star.z = canvas.width;
    }

    const x = star.x / (star.z / canvas.width);
    const y = star.y / (star.z / canvas.width);
    const r = (1 - star.z / canvas.width) * 2;

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

// 6. LOGICA DO BOTÃO INICIAR (O CORAÇÃO DO PROBLEMA)
if (btn) {
  btn.onclick = function () {
    console.log("Clique detectado!");

    // Inicia movimento
    isMoving = true;
    speed = 1;
    speedTarget = 5;

    // Esconde a tela inicial
    overlay.style.display = "none";

    // Tenta tocar a música
    if (music) {
      music.play().catch((e) => console.log("Erro no play:", e));
    }

    // Mostra o botão de finalizar após 1 minuto
    setTimeout(() => {
      if (finishBtn) finishBtn.style.display = "block";
    }, 60000);
  };
}

// 7. FINALIZAR VIAGEM
function finalizarViagem() {
  if (isExploding) return;
  isExploding = true;
  if (finishBtn) finishBtn.style.display = "none";

  // Aceleração da supernova
  warpTarget = 30;
  speedTarget = 60;

  setTimeout(() => {
    if (music) music.pause();
    finalOverlay.style.display = "flex";
    isMoving = false;
  }, 3000);
}

if (finishBtn) {
  finishBtn.onclick = finalizarViagem;
}

// Atalho ESC
window.onkeydown = function (e) {
  if (e.key === "Escape" && isMoving) {
    if (finishBtn) finishBtn.style.display = "block";
  }
};

// Iniciar o loop de desenho
draw();
