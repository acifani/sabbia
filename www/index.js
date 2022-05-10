import { Grid, pack_hsl } from 'wasm-sand-simulator';
import { memory } from 'wasm-sand-simulator/wasm_sand_simulator_bg.wasm';

const WIDTH = 128;
const HEIGHT = 64;
const CELL_SIZE = 8;
const GRID_COLOR = '#222';
const INPUT_RADIUS = 2;
const INPUT_PROBABILITY = 0.5;

const grid = Grid.new(WIDTH, HEIGHT);

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
canvas.height = CELL_SIZE * HEIGHT + 2;
canvas.width = CELL_SIZE * WIDTH + 2;
const ctx = canvas.getContext('2d');

renderLoop();

function renderLoop() {
  grid.tick();

  drawGrid();
  drawPixels();

  requestAnimationFrame(renderLoop);
}

function drawGrid() {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  ctx.moveTo(0, 0);
  ctx.lineTo(WIDTH * CELL_SIZE + 2, 0);
  ctx.lineTo(WIDTH * CELL_SIZE + 2, HEIGHT * CELL_SIZE + 2);
  ctx.lineTo(0, HEIGHT * CELL_SIZE + 2);
  ctx.lineTo(0, 0);

  ctx.stroke();
}

function drawPixels() {
  const gridPtr = grid.grid();
  const cells = new Uint32Array(memory.buffer, gridPtr, WIDTH * HEIGHT);

  ctx.beginPath();

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const idx = getIndex(row, col);

      const [h, s, l] = unpackHSL(cells[idx]);
      ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;

      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  ctx.stroke();
}

function getIndex(row, column) {
  return row * WIDTH + column;
}

canvas.addEventListener('click', (event) => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / CELL_SIZE), HEIGHT - 1);
  const col = Math.min(Math.floor(canvasLeft / CELL_SIZE), WIDTH - 1);

  for (let rowDiff = -INPUT_RADIUS; rowDiff <= INPUT_RADIUS; rowDiff++) {
    for (let colDiff = -INPUT_RADIUS; colDiff <= INPUT_RADIUS; colDiff++) {
      const inputRow = row + rowDiff;
      const inputCol = col + colDiff;
      if (Math.random() < INPUT_PROBABILITY) {
        grid.set(
          inputCol % WIDTH,
          inputRow % HEIGHT,
          pack_hsl(...slightlyAlterColor(45, 35, 63))
        );
      }
    }
  }
});

function slightlyAlterColor(hue, saturation, lightness) {
  saturation += Math.random() * 20 - 10;
  lightness += Math.random() * 20 - 10;
  return [hue, saturation, lightness];
}

function unpackHSL(hsl) {
  const h = hsl >> 16;
  const s = (hsl >> 8) & 0xff;
  const l = hsl & 0xff;
  return [h, s, l];
}
