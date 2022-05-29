import { MST, coordToNum, neighborPos, invalidEdge } from "./mst";

/** Node in Hamiltonian cycle at (x, y), with next position at next. The next
 *  node must be exactly 1 space from this node. The next of the last node
 *  is the first node in the cycle. */
export interface Cycle {
  index: number;
  x: number;
  y: number;
  next: Cycle;
}

/** Creates a Hamiltonian cycle for a grid-graph with r rows and c columns.
 *  r and c must both be even. */
export function createCycle(r: number, c: number): Cycle {
  const [mr, mc] = [r / 2, c / 2];
  const mst = MST(mr, mc); // find random MST on half resolution grid-graph

  // current position in MST; pick random MST node and start at top right corner
  let [px, py] = [
    Math.floor(Math.random() * (c / 2)),
    Math.floor(Math.random() * (r / 2)),
  ];

  // [vertical, horizontal] -> true = up/right, false = down/left
  let [up, right] = [true, true];

  // initialize cycle at top right of random MST node
  const startPos = mstPosToCyclePos([px, py], [up, right]);
  const start: Cycle = { index: 0, x: startPos[0], y: startPos[1], next: null };
  let cycle: Cycle = start; // current position in cycle

  // true if neighbor in 4 directions from MST node
  const neighbors = [false, false, false, false];

  // add cycle nodes until fills entire grid-graph
  let length = 1;
  while (length < r * c) {
    // check if neighboring node in all four directions in MST
    const mstNum = coordToNum(mc, [px, py]);
    for (let i = 0; i < 4; i++) {
      neighbors[i] = !invalidEdge(mr, mc, px, py, i)
        ? mst[mstNum][coordToNum(mc, neighborPos(px, py, i))]
        : false;
    }
    const [neighborUp, neighborRight, neighborDown, neighborLeft] = neighbors;

    // this has the same behavior as tracing the outline of the MST using
    // the right hand rule; first checks if can go right or left, otherwise
    // it must either go up or down, which is determined by corner position

    const [currX, currY] = mstPosToCyclePos([px, py], [up, right]);
    const nextNode = length == r * c - 1 ? start : null;
    const nextIndex = cycle.index + 1;
    if (up && ((!right && !neighborUp) || (right && neighborRight))) {
      // move right
      cycle.next = { index: nextIndex, x: currX + 1, y: currY, next: nextNode };
      if (right) px += 1;
      right = !right;
    } else if (!up && ((right && !neighborDown) || (!right && neighborLeft))) {
      // move left
      cycle.next = { index: nextIndex, x: currX - 1, y: currY, next: nextNode };
      if (!right) px -= 1;
      right = !right;
    } else if (right) {
      // move down
      cycle.next = { index: nextIndex, x: currX, y: currY + 1, next: nextNode };
      if (!up) py += 1;
      up = !up;
    } else {
      // move up
      cycle.next = { index: nextIndex, x: currX, y: currY - 1, next: nextNode };
      if (up) py -= 1;
      up = !up;
    }
    cycle = cycle.next;

    length++;
  }

  return start;
}

/** Return coordinate on double-resolution grid-graph with [up, right]
 *  determining the corner of the MST coordinate to return. */
function mstPosToCyclePos([x, y]: number[], [up, right]: boolean[]): number[] {
  return [right ? 2 * x + 1 : 2 * x, up ? 2 * y : 2 * y + 1];
}

function isInRange(
  index: number,
  head: number,
  tail: number,
  last: number
): boolean {
  return head > tail
    ? index > tail && index < head
    : (index > tail && index <= last) || index < head;
}

function distance(head: number, tail: number, last: number): number {
  return head > tail ? last - head + tail : tail - head - 1;
}

export function findNextSquare(
  cycle: Cycle,
  foodIndex: number,
  tailIndex: number,
  separation: number,
  maxIndex: number
): Cycle {
  let curr: Cycle = cycle;
  let next: Cycle = null;
  let routes = 0;
  while (curr.index != foodIndex && curr.index != tailIndex) {
    if (
      Math.abs(curr.x - cycle.x) + Math.abs(curr.y - cycle.y) == 1 &&
      !isInRange(curr.index, cycle.index, tailIndex, maxIndex) &&
      distance(curr.index, tailIndex, maxIndex) > separation
    ) {
      next = curr;
      routes++;
    }
    curr = curr.next;
    if (routes == 3) break; // checked all paths out of current position
  }

  return next || cycle.next;
}

/** Returns map of grid-graph (x, y) position to index on cycle.
 *  Requires the head of 'cycle' is index 0. */
export function getIndexMap(
  cycle: Cycle,
  rows: number,
  cols: number
): number[][] {
  const indexMap: Array<Array<number>> = Array.from(Array(cols), (_) =>
    Array(rows).fill(0)
  );

  do {
    indexMap[cycle.x][cycle.y] = cycle.index;
    cycle = cycle.next;
  } while (cycle.index != 0);

  return indexMap;
}
