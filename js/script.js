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

btn.addEventListener("click", () => {
  overlay.style.opacity = "0";
  music.play();

  setTimeout(() => {
    overlay.style.display = "none";
    hint.style.display = "block";
  }, 1000);

  // ALTERADO: O botão de finalizar agora aparece após 60 segundos (1 minuto)
  setTimeout(() => {
    const finishBtn = document.getElementById("finish-btn");
    if (finishBtn) {
      finishBtn.style.display = "block";
    }
  }, 60000); // 60000ms = 1 minuto

  if (!isMoving) {
    isMoving = true;
    draw();
  }
});

// NOVO: Atalho secreto para mostrar o botão ao apertar ESC
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const finishBtn = document.getElementById("finish-btn");
    if (finishBtn) {
      finishBtn.style.display = "block";
      console.log("Atalho Esc ativado: botão exibido.");
    }
  }
  // Mantém sua lógica de teclas anterior abaixo (W, Setas, etc)
  keys[e.key] = true;
});
