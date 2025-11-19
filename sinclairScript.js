const sinclair = document.getElementById("sinclair");

//random
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Sprites
const idleSprite = "sinclair_idle.png";
const moveRightSprite = "sinclair_move_right.png";
const moveLeftSprite = "sinclair_move_left.png";
const pickUp = "sinclair_guard.png";

// Physics variables
let x = window.innerWidth / 2;
let y = 0;

let vx = 0;  // horizontal velocity
let vy = 0;  // vertical velocity

let audioUnlocked = false;
let soundEnabled = false; // starts muted

const soundButton = document.getElementById("soundToggle");

function unlockAudio() {
  if (!audioUnlocked) {
    const a = new Audio();
    a.play().catch(() => {});
    audioUnlocked = true;
  }
}

function toggleSound() {
  unlockAudio();
  soundEnabled = !soundEnabled;
  soundButton.textContent = soundEnabled ? "🔊" : "🔇";
}

soundButton.addEventListener("click", toggleSound);

window.addEventListener("mousedown", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });


const gravity = 0.6;       // how fast character falls
const friction = 0.95;     // sliding (lower means slippery)
const jumpStrength = randBetween(5, 20);
const moveStrength = 4;

// Character size
const charWidth = 150;
const charHeight = 150;

const sinclairSoundFiles = [
  'chickensinclairnoise1.mp3',
  'chickensinclairnoise2.mp3',
  'chickensinclairnoise3.mp3'
];

const sinclairAudio = new Audio();
sinclairAudio.preload = 'auto';

function getRandomSoundFile() {
  return sinclairSoundFiles[
    Math.floor(Math.random() * sinclairSoundFiles.length)
  ];
}

function playSinclairAudio() {
  try {
    const src = getRandomSoundFile();
    console.log("Playing:", src);

    // Prevent cache locking the sound
    sinclairAudio.src = src + '?v=' + Math.random();

    sinclairAudio.currentTime = 0;

    const p = sinclairAudio.play();
    if (p && p.catch) p.catch(err => {
      console.debug("Audio play blocked or failed:", err);
    });

  } catch (err) {
    console.debug("Audio play error", err);
  }
}


function randomAction() {
  const actions = ["left", "right", "jump", "jumpLeft", "jumpRight", "idle"];
  const choice = actions[Math.floor(Math.random() * actions.length)];

  switch (choice) {
    case "left":
      vx -= moveStrength;
      break;
    case "right":
      vx += moveStrength;
      break;
    case "jump":
      if (!isGrabbed && y === 0) {
        vy = jumpStrength;
      }
      break;
    case "jumpLeft":
      if (!isGrabbed && y === 0) {
        vy = jumpStrength;
        vx -= moveStrength;
      }
      break;
    case "jumpRight":
      if (!isGrabbed && y === 0) {
        vy = jumpStrength;
        vx += moveStrength;
      }
      break;
    case "idle":
      // no action
      break;
  }
}

// Run every 1–2 seconds
setInterval(randomAction, 1000 + Math.random() * 1000);

// Smooth movement loop
function update() {
  // Apply gravity
  vy -= gravity;

  // Apply velocities
  x += vx;
  y += vy;

  if (x < 0) {
    x = 0;
    vx = -vx * 1.0;
  }

  if (x > window.innerWidth - charWidth){
    x = window.innerWidth - charWidth;
    vx = -vx * 1.0;
  }
  //bounce off floor
  if (y < 0) {
    y = 0;
    vy = -vy * 0.6;
  }

  // Floor collision
  if (y < 0) {
    y = 0;
    vy = 0;
  }

  if (y > window.innerHeight - charHeight) {
    y = window.innerHeight - charHeight;
    vy = -vy * 1.0;
  }

  // Screen boundaries
  x = Math.max(0, Math.min(x, window.innerWidth - charWidth));

  // Friction (slipperiness)
  vx *= friction;

  // Set sprite depending on movement
  if (isGrabbed) {
    sinclair.style.backgroundImage = `url(${pickUp})`
    vy = 0;
  }
  else if (vx > 1) {
    sinclair.style.backgroundImage = `url(${moveRightSprite})`;
  } else if (vx < -1) {
    sinclair.style.backgroundImage = `url(${moveLeftSprite})`;
  } else {
    sinclair.style.backgroundImage = `url(${idleSprite})`;
  }

  // Update character's CSS position
  sinclair.style.left = x + "px";
  sinclair.style.bottom = y + "px";

  requestAnimationFrame(update);
}
let isGrabbed = false;
let grabOffsetX = 0;
let grabOffsetY = 0;

let lastMouseX = null;
let lastMouseY = null;

let mouseVX = 0;
let mouseVY = 0;

function startGrab(clientX, clientY) {
    isGrabbed = true;

    sinclair.style.backgroundImage = `url(${pickUp})`;

    grabOffsetX = clientX - x;
    grabOffsetY = window.innerHeight - clientY - y;

    lastMouseX = clientX;
    grabOffsetY = window.innerHeight - clientY - y;

    lastMouseX = clientX;
    lastMouseY = clientY;
}

sinclair.addEventListener("mousedown", e =>{
    startGrab(e.clientX, e.clientY);
});

// Play sound on mouse clicks as well
sinclair.addEventListener("click", () => {
  playSinclairAudio();
});

sinclair.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  startGrab(touch.clientX, touch.clientY);
  playSinclairAudio();
});

function moveGrab(clientX, clientY) {
    if(isGrabbed) {
        x = clientX - grabOffsetX;
        y = window.innerHeight - clientY - grabOffsetY;

        mouseVX = clientX - lastMouseX;
        mouseVY = clientY - lastMouseY;

        lastMouseX = clientX;
        lastMouseY = clientY;
    }
}

window.addEventListener("mousemove", e => {
  moveGrab(e.clientX, e.clientY);
});

window.addEventListener("touchmove", e => {
  const t = e.touches[0];
  moveGrab(t.clientX, t.clientY);
});

function endGrab() {
  if (isGrabbed) {
    isGrabbed = false;
  

  vx = mouseVX * 0.6;
  vy = mouseVY * 0.6;
  }
}

if (!isGrabbed) { 
  vy -= gravity;
  vx *= friction;
} else {
  vy = 0;
}

window.addEventListener("mouseup", endGrab);

window.addEventListener("touchend", endGrab);

function startSinclairNoiseLoop() {
  function loop() {
    // Only play sound if allowed
    if (audioUnlocked && soundEnabled) {
      playSinclairAudio();
    }

    // Random delay between 3s and 10s (customize these!)
    const next = 3000 + Math.random() * 7000;
    setTimeout(loop, next);
  }

  // Start first loop
  loop();
}

startSinclairNoiseLoop();

update();  // start animation