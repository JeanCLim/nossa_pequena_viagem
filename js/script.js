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
for (let i = 0; i < 2400; i++) {
  stars.push({
    x: Math.random() * canvas.width - canvas.width / 2,
    y: Math.random() * canvas.height - canvas.height / 2,
    z: Math.random() * canvas.width,
  });
}

// SOM DO TURBO (SHIFT)
function startTurboSound() {
    if (turboOscillator) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    turboOscillator = audioCtx.createOscillator();
    turboGain = audioCtx.createGain();

    turboOscillator.type = 'sine';
    turboOscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    turboOscillator.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 2);

    turboGain.gain.setValueAtTime(0.01, audioCtx.currentTime); // Volume bem suave
    turboGain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.5);

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
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(60, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + duracao);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duracao);
    oscillator.connect(gainNode);
    gainNode.connect(