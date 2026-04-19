// 1. Pegar os elementos (CORRIGIDO PARA BATER COM SEU HTML)
const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
const btn = document.getElementById("start-btn");
const overlay = document.getElementById("ui-overlay");
const music = document.getElementById("bg-music");
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
      star.x = Math.random() * canvas.width - canvas.width / 2;
      star.y = Math.random() * canvas.height - canvas.height / 2;
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

// Som de aceleração (Supernova)
function playWarpSound(duracao) {
  try {
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
  } catch (e) {
    console.log("Som sintético não suportado");
  }
}

// 6. LOGICA DO BOTÃO INICIAR
if (btn) {
  btn.onclick = function () {
    // Inicia movimento
    isMoving = true;
    speed = 0.5;
    speedTarget = 5;

    // Esconde a tela inicial
    overlay.style.display = "none";

    // Toca a música
    if (music) {
      music
        .play()
        .catch((e) => console.log("Clique na tela para liberar a música"));
    }

    // Mostra o botão de finalizar após 1 minuto (60000ms)
    setTimeout(() => {
      if (finishBtn && !isExploding) finishBtn.style.display = "block";
    }, 60000);
  };
}

// 7. FINALIZAR VIAGEM
function finalizarViagem() {
  if (isExploding) return;
  isExploding = true;
  if (finishBtn) finishBtn.style.display = "none";

  // Som do pulo espacial e aceleração
  const duracaoWarp = 4.0;
  playWarpSound(duracaoWarp);

  const acelerarIntervalo = setInterval(() => {
    if (warpTarget < 30) warpTarget += 1.5;
    if (speedTarget < 80) speedTarget += 3;
  }, 100);

  setTimeout(() => {
    clearInterval(acelerarIntervalo);
    if (music) music.pause();
    finalOverlay.style.display = "flex";
    isMoving = false;
  }, duracaoWarp * 1000);
}

if (finishBtn) {
  finishBtn.onclick = finalizarViagem;
}

// Atalho ESC para mostrar botão antes de 1 minuto
window.onkeydown = function (e) {
  if (e.key === "Escape" && isMoving && !isExploding) {
    if (finishBtn) finishBtn.style.display = "block";
  }
};

// Iniciar o loop de desenho
draw();
