import { MST, numToCoord, coordToNum, neighborPos } from "./mst";

/** Node in Hamiltonian cycle at (x, y), with next position at next. The next
 *  node must be exactly 1 space from this node. The next of the last node
 *  is the first node in the cycle. */
export interface Cycle {
  x: number;
  y: number;
  next: Cycle;
}

/** Creates a Hamiltonian cycle for a grid-graph with r rows and c columns.
 *  r and c must both be even. */
export function createCycle(r: number, c: number): Cycle {
  const [mr, mc] = [r / 2, c / 2];
  const mst = MST(mr, mc);

  let length = 1;
  let [px, py] = [
    Math.floor(Math.random() * (c / 2)),
    Math.floor(Math.random() * (r / 2)),
  ];
  let [up, right] = [true, true]; // [vertical, horizontal] -> true = up/right, false = down/left

  const startPos = mstPosToCyclePos([px, py], [up, right]);
  const start: Cycle = { x: startPos[0], y: startPos[1], next: null };
  let cycle: Cycle = start;

  while (length < r * c) {
    /*
      rules:
      1.) If above node, move right, else left
      2.) If can't move right/left, move down if right of node, else up
     */

    const mstNum = coordToNum(mc, [px, py]);

    const neighbors = [false, false, false, false];
    for (let i = 0; i < 4; i++) {
      const nPos = coordToNum(mc, neighborPos(px, py, i));
      if (mst[mstNum][nPos] == 1) {
        neighbors[i] = true;
      }
    }
    const [neighborUp, neighborRight, neighborDown, neighborLeft] = neighbors;

    const [currentX, currentY] = mstPosToCyclePos([px, py], [up, right]);
    const nextNode = length == r * c - 1 ? start : null;
    if (up && ((!right && !neighborUp) || (right && neighborRight))) {
      // move right
      cycle.next = { x: currentX + 1, y: currentY, next: nextNode };
      if (right) px += 1;
      right = !right;
    } else if (!up && ((right && !neighborDown) || (!right && neighborLeft))) {
      // move left
      cycle.next = { x: currentX - 1, y: currentY, next: nextNode };
      if (!right) px -= 1;
      right = !right;
    } else if (right) {
      // move down
      cycle.next = { x: currentX, y: currentY + 1, next: nextNode };
      if (!up) py += 1;
      up = !up;
    } else {
      // move up
      cycle.next = { x: currentX, y: currentY - 1, next: nextNode };
      if (up) py -= 1;
      up = !up;
    }
    cycle = cycle.next;

    length++;
  }

  return start;
}

function mstPosToCyclePos([x, y]: number[], [up, right]: boolean[]): number[] {
  return [right ? 2 * x + 1 : 2 * x, up ? 2 * y : 2 * y + 1];
}
