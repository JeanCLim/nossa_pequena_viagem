const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
const btn = document.getElementById("start-btn");
const overlay = document.getElementById("ui-overlay");
const music = document.getElementById("bg-music");
const finishBtn = document.getElementById("finish-btn");
const finalOverlay = document.getElementById("final-overlay");
const hint = document.getElementById("controls-hint");

let stars = [];
let isMoving = false;
let isExploding = false;

let speed = 0;
let warp = 0.7;
let speedTarget = 0;
let warpTarget = 0.7;
let keys = {};

// Gerenciamento de Áudio
let audioCtx = null;
let turboOscillator = null;
let turboGain = null;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// 2.400 estrelas
for (let i = 0; i < 20000; i++) {
  stars.push({
    x: Math.random() * canvas.width - canvas.width / 2,
    y: Math.random() * canvas.height - canvas.height / 2,
    z: Math.random() * canvas.width,
  });
}

// SOM DO TURBO (SHIFT)
function startTurboSound() {
  if (turboOscillator) return;
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  turboOscillator = audioCtx.createOscillator();
  turboGain = audioCtx.createGain();

  turboOscillator.type = "sine";
  turboOscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
  turboOscillator.frequency.exponentialRampToValueAtTime(
    250,
    audioCtx.currentTime + 2,
  );

  turboGain.gain.setValueAtTime(0.01, audioCtx.currentTime); // Volume bem suave
  turboGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.5);

  turboOscillator.connect(turboGain);
  turboGain.connect(audioCtx.destination);
  turboOscillator.start();
}

function stopTurboSound() {
  if (turboOscillator) {
    turboGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    turboOscillator.stop(audioCtx.currentTime + 0.3);
    turboOscillator = null;
  }
}

// SOM DA SUPERNOVA (O QUE VOCÊ GOSTOU)
function playWarpSound(duracao) {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
  stopTurboSound(); // Garante que o som do turbo pare se estiver ativo

  if (finishBtn) finishBtn.style.display = "none";
  if (hint) hint.style.display = "none";

  const duracaoWarp = 4.0;
  playWarpSound(duracaoWarp);

  warpTarget = 45;
  speedTarget = 95;

  setTimeout(() => {
    if (music) music.pause();
    finalOverlay.style.display = "flex";
    isMoving = false;
    isExploding = false;
  }, duracaoWarp * 1000);
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isMoving) {
    if (isExploding) {
      speed += (speedTarget - speed) * 0.02;
      warp += (warpTarget - warp) * 0.02;
    } else {
      let currentMaxSpeed = 3;
      if (keys["Shift"]) {
        currentMaxSpeed = 16;
        warpTarget = 5;
      } else if (keys["w"] || keys["W"] || keys["ArrowUp"]) {
        currentMaxSpeed = 8;
        warpTarget = 2;
      } else {
        currentMaxSpeed = 3;
        warpTarget = 0.7;
      }
      speedTarget = currentMaxSpeed;
      speed += (speedTarget - speed) * 0.05;
      warp += (warpTarget - warp) * 0.05;
    }
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
    const r = (1 - star.z / canvas.width) * 1.5;

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

if (btn) {
  btn.onclick = function () {
    // DESPERTA O ÁUDIO (Adicione esta linha aqui)
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    isMoving = true;
    speed = 0.5;
    speedTarget = 3;
    overlay.style.display = "none";
    if (hint) hint.style.display = "block";
    if (music) music.play();

    setTimeout(() => {
      if (finishBtn && !isExploding) finishBtn.style.display = "block";
    }, 60000);
  };
}

window.addEventListener("keydown", (e) => {
  if (keys[e.key]) return;
  keys[e.key] = true;

  if (e.key === "Shift" && isMoving && !isExploding) {
    startTurboSound();
  }

  if (e.key === "Escape" && isMoving && !isExploding) {
    if (finishBtn) finishBtn.style.display = "block";
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  if (e.key === "Shift") {
    stopTurboSound();
  }
});

if (finishBtn) {
  finishBtn.onclick = finalizarViagem;
}

draw();
