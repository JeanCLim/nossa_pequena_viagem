const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
const btn = document.getElementById("start-btn");
const overlay = document.getElementById("ui-overlay");
const music = document.getElementById("bg-music");
const hint = document.getElementById("controls-hint");

let stars = [];
let numStars = 3000;
let speed = 2;
let targetSpeed = 2;
let isMoving = false;
const keys = {};

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Star {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = (Math.random() - 0.5) * canvas.width * 2;
    this.y = (Math.random() - 0.5) * canvas.height * 2;
    this.z = Math.random() * canvas.width;
    this.pz = this.z;
  }

  update() {
    this.pz = this.z;
    this.z -= speed;
    if (this.z < 1) this.reset();
  }

  show() {
    let sx = (this.x / this.z) * (canvas.width / 2);
    let sy = (this.y / this.z) * (canvas.height / 2);

    // Lógica de desvanecimento na borda (O que faltava!)
    let dist = Math.max(
      Math.abs(sx) / (canvas.width / 2),
      Math.abs(sy) / (canvas.height / 2),
    );
    let edgeAlpha = Math.max(0, 1 - Math.pow(dist, 3));
    let depthAlpha = 1 - this.z / canvas.width;

    let alpha = edgeAlpha * depthAlpha;
    let r = depthAlpha * 4;

    if (alpha > 0.05) {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx + canvas.width / 2, sy + canvas.height / 2, r, 0, Math.PI * 2);
      ctx.fill();

      if (speed > 8) {
        let psx = (this.x / this.pz) * (canvas.width / 2);
        let psy = (this.y / this.pz) * (canvas.height / 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.lineWidth = r;
        ctx.beginPath();
        ctx.moveTo(psx + canvas.width / 2, psy + canvas.height / 2);
        ctx.lineTo(sx + canvas.width / 2, sy + canvas.height / 2);
        ctx.stroke();
      }
    }
  }
}

for (let i = 0; i < numStars; i++) stars.push(new Star());

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (keys["w"] || keys["ArrowUp"]) {
    targetSpeed = keys["Shift"] ? 50 : 15;
  } else {
    targetSpeed = 2;
  }
  speed += (targetSpeed - speed) * 0.05;

  stars.forEach((s) => {
    s.update();
    s.show();
  });
  requestAnimationFrame(draw);
}

window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// ... (resto do seu código acima)

// 1. Referências dos elementos (coloque isso fora das funções, no topo ou antes dos eventos)
const finishBtn = document.getElementById("finish-btn");
const finalOverlay = document.getElementById("final-overlay");

// 2. Função Única para Finalizar (para não dar erro)
let isExploding = false; // Variável para controlar o efeito supernova

function finalizarViagem() {
  if (isExploding) return;
  isExploding = true;

  // 1. SOME COM O BOTÃO NA HORA
  if (finishBtn) finishBtn.style.display = "none";

  // 2. TOCA O SOM DE ACELERAÇÃO
  // Se você tiver um arquivo, use: const warpSound = new Audio('vruum.mp3'); warpSound.play();
  // Abaixo, um som sintético de aceleração caso não tenha o arquivo:
  playWarpSound();

  // 3. EFEITO VISUAL DE ZOOM (SALTO ESPACIAL)
  warp = 25; // Estica as estrelas ao máximo
  speed = 100; // Velocidade extrema

  // 4. TRANSIÇÃO PARA A TELA FINAL
  setTimeout(() => {
    // Diminui o volume da música gradualmente antes de parar
    const fadeAudio = setInterval(() => {
      if (music.volume > 0.1) {
        music.volume -= 0.1;
      } else {
        clearInterval(fadeAudio);
        music.pause();
        music.volume = 1; // Reseta para a próxima vez
      }
    }, 100);

    finalOverlay.style.display = "flex";
    isMoving = false;
    isExploding = false;
    warp = 0.7; // Reseta o rastro para o padrão
  }, 1500);
}

// Função para criar o som de "Vruum" eletrônico (opcional)
function playWarpSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    800,
    audioCtx.currentTime + 1.5,
  );

  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1.5);
}

// 3. Evento do Botão Iniciar
btn.addEventListener("click", () => {
  overlay.style.opacity = "0";
  music.play();

  setTimeout(() => {
    overlay.style.display = "none";
    hint.style.display = "block";
  }, 1000);

  // Aparece o botão após 1 minuto
  setTimeout(() => {
    if (finishBtn) finishBtn.style.display = "block";
  }, 60000);

  if (!isMoving) {
    isMoving = true;
    draw();
  }
});

// 4. Evento de Clique no Botão Finalizar
if (finishBtn) {
  finishBtn.addEventListener("click", finalizarViagem);
}

// 5. Evento de Teclado (Apenas faz o botão aparecer)
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (finishBtn) {
      finishBtn.style.display = "block"; // Apenas mostra o botão amarelo pulsando
      console.log("Atalho Esc: Botão liberado!");
    }
  }
  // Lógica de movimentação das estrelas
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});
