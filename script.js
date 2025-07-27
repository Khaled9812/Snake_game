// Snake game with wrap‑around walls. The snake moves on a grid and
// reappears on the opposite side when leaving the canvas. The game uses
// arrow keys on desktop and swipe gestures on touch devices.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restartButton');

// Board configuration
const boardSize = 20; // 20x20 grid
const cellSize = canvas.width / boardSize;

// Game state
let snake;
let direction;
let food;
let score;
let gameLoopInterval;
let lastFrameTime = 0;
let isGameOver;

/**
 * Initialize or reset game state.
 */
function initGame() {
  // Starting snake in the center moving right
  snake = [
    { x: Math.floor(boardSize / 2), y: Math.floor(boardSize / 2) },
    { x: Math.floor(boardSize / 2) - 1, y: Math.floor(boardSize / 2) },
    { x: Math.floor(boardSize / 2) - 2, y: Math.floor(boardSize / 2) }
  ];
  direction = { x: 1, y: 0 };
  food = getRandomFoodPosition();
  score = 0;
  isGameOver = false;
  scoreDisplay.textContent = `Score: ${score}`;
  restartButton.classList.add('hidden');
  // Reset lastFrameTime for animation frame timing
  lastFrameTime = 0;
  // Kick off the animation loop using requestAnimationFrame for smoother updates
  requestAnimationFrame(gameLoop);
}

/**
 * Generates a random food location that is not on the snake.
 */
function getRandomFoodPosition() {
  let newPos;
  while (true) {
    newPos = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize)
    };
    // Ensure food isn't spawned on snake
    const onSnake = snake.some(segment => segment.x === newPos.x && segment.y === newPos.y);
    if (!onSnake) {
      return newPos;
    }
  }
}

/**
 * The main game loop executed on an interval.
 */
/**
 * Main game loop triggered by requestAnimationFrame. Receives a timestamp
 * parameter from the browser and throttles updates to roughly every
 * 100 milliseconds (10 frames per second).
 *
 * @param {DOMHighResTimeStamp} timestamp – The current time supplied by
 *   requestAnimationFrame.
 */
function gameLoop(timestamp) {
  if (isGameOver) {
    return;
  }
  // Initialize the last frame time on the first call
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }
  const delta = timestamp - lastFrameTime;
  // Update and render when enough time has passed
  if (delta > 100) {
    update();
    draw();
    lastFrameTime = timestamp;
  }
  // Request the next animation frame
  requestAnimationFrame(gameLoop);
}

/**
 * Update snake position and check for collisions or food.
 */
function update() {
  // Create new head based on current direction and wrap around edges
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  // Wrap around horizontally
  head.x = (head.x + boardSize) % boardSize;
  // Wrap around vertically
  head.y = (head.y + boardSize) % boardSize;

  // Check for self‑collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  // Add new head to the front of the snake array
  snake.unshift(head);

  // Check if food is eaten
  if (head.x === food.x && head.y === food.y) {
    // Increase score and place new food
    score += 1;
    scoreDisplay.textContent = `Score: ${score}`;
    food = getRandomFoodPosition();
  } else {
    // Remove tail segment
    snake.pop();
  }
}

/**
 * Draw the board, snake, and food.
 */
function draw() {
  // Clear canvas
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#2ecc71' : '#27ae60';
    const segment = snake[i];
    ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
  }
}

/**
 * Handle game over: stop the loop and show restart button.
 */
function endGame() {
  isGameOver = true;
  restartButton.classList.remove('hidden');
}

/**
 * Update direction when arrow keys are pressed.
 */
function handleKey(event) {
  const { key } = event;
  // Prevent reversing onto itself by checking current direction
  if (key === 'ArrowUp' && direction.y !== 1) {
    direction = { x: 0, y: -1 };
  } else if (key === 'ArrowDown' && direction.y !== -1) {
    direction = { x: 0, y: 1 };
  } else if (key === 'ArrowLeft' && direction.x !== 1) {
    direction = { x: -1, y: 0 };
  } else if (key === 'ArrowRight' && direction.x !== -1) {
    direction = { x: 1, y: 0 };
  }
}

/**
 * Simple swipe detection for mobile devices.
 */
let touchStartX = null;
let touchStartY = null;

function handleTouchStart(event) {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(event) {
  if (touchStartX === null || touchStartY === null) return;
  const touch = event.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  // Determine the direction of the swipe
  if (Math.max(absX, absY) > 20) {
    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0 && direction.x !== -1) {
        direction = { x: 1, y: 0 };
      } else if (deltaX < 0 && direction.x !== 1) {
        direction = { x: -1, y: 0 };
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && direction.y !== -1) {
        direction = { x: 0, y: 1 };
      } else if (deltaY < 0 && direction.y !== 1) {
        direction = { x: 0, y: -1 };
      }
    }
    touchStartX = null;
    touchStartY = null;
  }
}

// Event listeners
document.addEventListener('keydown', handleKey);
canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
restartButton.addEventListener('click', initGame);

// Kick things off
initGame();