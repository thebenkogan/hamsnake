import { Cycle, createCycle } from "./hamcycle";

const div = document.getElementById("snake") as HTMLDivElement;
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", {
  alpha: false,
}) as CanvasRenderingContext2D;
const select = document.getElementById("speed") as HTMLSelectElement;

const width = div.clientWidth;
const height = div.clientHeight;
canvas.width = width;
canvas.height = height;

const snakeColor = "#5591f2";
const headColor = "#0f5cd9";
const blankColor = "#181818";
const foodColor = "#4bf542";

let speed = +select.value; // ms delay between each snake movement

let interval = setInterval(move, speed);

select.onchange = () => {
  clearInterval(interval);
  interval = setInterval(move, +select.value);
  setup();
  select.blur();
};

const foodLen = 5; // length gained by eating food

// get grid and border dimensions; rows & cols must be even
let cols = 40; // temp column count, will get expanded out
let rows = 30; // row count
let vb = 10; // vertical border width
const step = (height - 2 * vb) / rows; // grid step size
let hb = (width - cols * step) / 2; // set horizontal border according to new step

// expand out the columns while we can place 4 additional columns
// this ensures that we never go below the vertical border width
while (step * 4 + cols * step < width - vb * 2) {
  cols += 2;
  hb -= step;
}

// draw border and fill blank color
ctx.fillStyle = "red";
ctx.fillRect(0, 0, hb, height);
ctx.fillRect(width - hb, 0, hb, height);
ctx.fillRect(0, 0, width, vb);
ctx.fillRect(0, height - vb, width, vb);
ctx.fillStyle = blankColor;
ctx.fillRect(hb, vb, width - 2 * hb, height - 2 * vb);
ctx.strokeStyle = blankColor;

// uncomment to draw underlying grid
// ctx.strokeStyle = "#000000";
// ctx.lineWidth = 1;
// for (let i = 0; i < rows; i++) {
//   ctx.beginPath();
//   ctx.moveTo(hb, vb + i * step);
//   ctx.lineTo(width - hb, vb + i * step);
//   ctx.stroke();
// }
// for (let i = 0; i < cols; i++) {
//   ctx.beginPath();
//   ctx.moveTo(hb + i * step, vb);
//   ctx.lineTo(hb + i * step, height - vb);
//   ctx.stroke();
// }

function posToString([x, y]: number[]): string {
  return `${x}_${y}`;
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

// Snake node: (x, y) = position on grid, next = next node towards head
interface Snake {
  x: number;
  y: number;
  next: Snake;
}

let body: Set<string> = new Set<string>(); // stores all snake node positions, O(1) lookup
let head: Snake; // head node
let tail: Snake; // tail node

let state: boolean; // false = growing, true = steady
let growLen: number; // target length of snake
let len: number; // current length of snake
let foodX: number; // food X position
let foodY: number; // food Y position

let cycle: Cycle; // Hamiltonian cycle

function setup() {
  ctx.fillStyle = blankColor;
  ctx.fillRect(hb, vb, width - 2 * hb, height - 2 * vb);

  body.clear();

  cycle = createCycle(rows, cols);

  head = {
    x: cycle.x,
    y: cycle.y,
    next: null,
  };
  tail = head;
  body.add(posToString([head.x, head.y]));
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
  cycle = cycle.next;
  const nextX = cycle.x;
  const nextY = cycle.y;

  if (state) {
    body.delete(posToString([tail.x, tail.y]));
    drawSnake(tail, snakeColor, true);
    tail = tail.next;
  } else {
    if (len == growLen) {
      state = true;
    }
    len++;
  }

  drawSnake(head, snakeColor); // move old head color to body color

  if (len == rows * cols) {
    setup();
    return;
  }

  const next: Snake = { x: nextX, y: nextY, next: null };
  head.next = next;
  head = next;
  body.add(posToString([head.x, head.y]));

  if (nextX == foodX && nextY == foodY) {
    genFood();
    state = false;
    growLen += foodLen - 1;
  }

  drawSnake(head, headColor); // draw head after tail for tail following
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
    valid = !body.has(posToString([nextX, nextY]));
  }

  ctx.fillStyle = foodColor;
  ctx.beginPath();
  ctx.arc(
    hb + nextX * step + step / 2,
    vb + nextY * step + step / 2,
    step / 2 - 3,
    0,
    2 * Math.PI
  );
  ctx.fill();

  foodX = nextX;
  foodY = nextY;
}
