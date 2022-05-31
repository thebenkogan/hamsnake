import { Cycle, createCycle, findNextSquare, getIndexMap } from "./hamcycle";

const div = document.getElementById("snake") as HTMLDivElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", {
  alpha: false,
}) as CanvasRenderingContext2D;
const slider = document.getElementById("slider") as HTMLInputElement;
const hamcycleCheckbox = document.getElementById(
  "showPath"
) as HTMLInputElement;

const width = div.clientWidth;
const height = div.clientHeight;
canvas.width = width;
canvas.height = height;

const snakeColor = "#5591f2";
const headColor = "#0f5cd9";
const blankColor = "#181818";
const foodColor = "#4bf542";
const hamcyclePathColor = "#797a79";

let speed = +slider.value; // ms delay between each snake movement

let interval = setInterval(move, speed);

slider.oninput = () => {
  speed = 100 - +slider.value;
};

/** We do not want to clear the game interval on slider input because
 the slider interrupts way too much, causing the snake to pause while
 the user is adjusting. In order to have smooth speed changes, we run
 this update job every 100 ms to grab the new speed value and set the
 interval. This way, we are only clearing the interval every 100ms, while
 still grabbing the most recent speed value and not impacting smoothness. */
const speedUpdateJob = setInterval(() => {
  clearInterval(interval);
  interval = setInterval(move, speed);
}, 100);

const foodLen = 5; // length gained by eating food

// get grid and border dimensions; rows & cols must be even
let rows = 20; // row count
let vb = 10; // vertical border width
const step = (height - 2 * vb) / rows; // grid step size
let hb = width / 2; // set horizontal border according to new step
let cols = 0; // column count, will get expanded out

// expand out the columns while we can place 4 additional columns
// this ensures that we never go below the vertical border width
while (step * 4 + cols * step < width - vb * 2) {
  cols += 2;
  hb -= step;
}

const shortcutsThreshold = rows * cols * 1; // never turned off for now
const lastNodeIndex = rows * cols - 1;

// draw border and fill blank color
ctx.fillStyle = "red";
ctx.fillRect(0, 0, hb, height);
ctx.fillRect(width - hb, 0, hb, height);
ctx.fillRect(0, 0, width, vb);
ctx.fillRect(0, height - vb, width, vb);
ctx.fillStyle = blankColor;
ctx.fillRect(hb, vb, width - 2 * hb, height - 2 * vb);
ctx.strokeStyle = blankColor;

// Snake node: (x, y) = position on grid, next = next node towards head
interface Snake {
  x: number;
  y: number;
  next: Snake;
}

const body: Array<Array<boolean>> = Array.from(Array(cols), (_) =>
  Array(rows).fill(false)
);
let head: Snake; // head node
let tail: Snake; // tail node

let state: boolean; // false = growing, true = steady
let growLen: number; // target length of snake
let len: number; // current length of snake
let foodX: number; // food X position
let foodY: number; // food Y position

let cycle: Cycle; // Hamiltonian cycle
let cycleIndexMap: number[][]; // Maps (x, y) position to hamcycle index
const separation = Math.floor((rows * cols) / 4);

/** When 'show hamcycle' is unchecked, we need to clear the path while
 *  preserving the snake body. We do not draw the snake body on every
 *  iteration, thus we have to iterate across the body matrix and redraw
 *  every node. We also have to redraw the food. */
hamcycleCheckbox.onchange = () => {
  if (!hamcycleCheckbox.checked) {
    ctx.fillStyle = blankColor;
    ctx.fillRect(hb, vb, width - 2 * hb, height - 2 * vb);
    body.forEach((arr, x) => {
      arr.forEach((filled, y) => {
        if (filled) {
          drawSnake(
            { x: x, y: y, next: null },
            head.x == x && head.y == y ? headColor : snakeColor
          );
        }
      });
    });
    drawFood(foodX, foodY);
  }
};

function setup() {
  ctx.fillStyle = blankColor;
  ctx.fillRect(hb, vb, width - 2 * hb, height - 2 * vb);

  Array.from(body, (sub) => sub.fill(false));

  cycle = createCycle(rows, cols);
  cycleIndexMap = getIndexMap(cycle, rows, cols);

  head = {
    x: cycle.x,
    y: cycle.y,
    next: null,
  };
  tail = head;
  body[head.x][head.y] = true;
  growLen = foodLen;
  len = 1;

  drawSnake(head, headColor);
  state = false;

  foodX = 0;
  foodY = 0;
  genFood();
}

setup();

function move() {
  if (state) {
    body[tail.x][tail.y] = false;
    drawSnake(tail, snakeColor, true);
    tail = tail.next;
  } else {
    if (len == growLen) {
      state = true;
    }
    len++;
  }

  if (len > shortcutsThreshold) {
    cycle = cycle.next;
  } else {
    cycle = findNextSquare(
      cycle,
      cycleIndexMap[foodX][foodY],
      cycleIndexMap[tail.x][tail.y],
      separation,
      lastNodeIndex
    );
  }
  const nextX = cycle.x;
  const nextY = cycle.y;

  // game over if hits snake body
  if (body[nextX][nextY]) {
    setup();
    return;
  }

  drawSnake(head, snakeColor); // move old head color to body color

  if (len == rows * cols) {
    setup();
    return;
  }

  const next: Snake = { x: nextX, y: nextY, next: null };
  head.next = next;
  head = next;
  body[head.x][head.y] = true;

  if (nextX == foodX && nextY == foodY) {
    genFood();
    state = false;
    growLen += foodLen - 1;
  }

  drawSnake(head, headColor); // draw head after tail for tail following

  if (hamcycleCheckbox.checked) drawHamcycle(cycle);
}

// draws new random food and clears old one
function genFood() {
  ctx.fillStyle = blankColor;
  ctx.fillRect(hb + foodX * step, vb + foodY * step, step, step);

  let nextX;
  let nextY;
  let valid = false;
  while (!valid) {
    nextX = Math.floor(Math.random() * cols);
    nextY = Math.floor(Math.random() * rows);
    valid = !body[nextX][nextY];
  }

  drawFood(nextX, nextY);

  foodX = nextX;
  foodY = nextY;
}

// draws snake square with fill color, blank square if c == true
function drawSnake(s: Snake, fill: string, c = false) {
  ctx.fillStyle = !c ? fill : blankColor;
  if (c) {
    ctx.fillRect(hb + s.x * step, vb + s.y * step, step, step);
  } else {
    ctx.fillRect(hb + s.x * step + 1, vb + s.y * step + 1, step - 2, step - 2);
  }
}

function drawFood(x: number, y: number) {
  ctx.fillStyle = foodColor;
  ctx.beginPath();
  ctx.arc(
    hb + x * step + step / 2,
    vb + y * step + step / 2,
    step / 2 - 3,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

function drawHamcycle(cycle: Cycle) {
  const endIndex = cycle.next.index;
  ctx.strokeStyle = hamcyclePathColor;
  ctx.lineWidth = 2;
  let [lastX, lastY] = [cycle.x, cycle.y];
  cycle = cycle.next;
  do {
    ctx.beginPath();
    ctx.moveTo(hb + lastX * step + step / 2, vb + lastY * step + step / 2);
    ctx.lineTo(hb + cycle.x * step + step / 2, vb + cycle.y * step + step / 2);
    ctx.stroke();
    [lastX, lastY] = [cycle.x, cycle.y];
    cycle = cycle.next;
  } while (cycle.index != endIndex);
}
