const character = document.getElementById("character");

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

const gravity = 0.6;       // how fast character falls
const friction = 0.95;     // sliding (lower means slippery)
const jumpStrength = randBetween(5, 20);
const moveStrength = 4;

// Character size
const charWidth = 150;
const charHeight = 150;

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
    character.style.backgroundImage = `url(${pickUp})`
    vy = 0;
  }
  else if (vx > 1) {
    character.style.backgroundImage = `url(${moveRightSprite})`;
  } else if (vx < -1) {
    character.style.backgroundImage = `url(${moveLeftSprite})`;
  } else {
    character.style.backgroundImage = `url(${idleSprite})`;
  }

  // Update character's CSS position
  character.style.left = x + "px";
  character.style.bottom = y + "px";

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

    character.style.backgroundImage = `url(${pickUp})`;

    grabOffsetX = clientX - x;
    grabOffsetY = window.innerHeight - clientY - y;

    lastMouseX = clientX;
    grabOffsetY = window.innerHeight - clientY - y;

    lastMouseX = clientX;
    lastMouseY = clientY;
}

character.addEventListener("mousedown", e =>{
    startGrab(e.clientX, e.clientY);
});

character.addEventListener("touchstart", () => {
    const touch = e.touches[0];
    startGrab(touch.clientX, touch.clientY);
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


update();  // start animation