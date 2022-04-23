import { MinQueue } from "heapify";

/** Finds a random minimum spanning tree for a grid-graph with r rows
 *  and c columns. Returns an adjacency matrix of the graph formed by the MST,
 *  indexed using number representation. */
export function MST(r: number, c: number): number[][] {
  const graph = createRandomGridGraph(r, c);
  const frontier = new MinQueue(r * c);
  const mst: Array<Array<number>> = Array.from(Array(r * c), (_) =>
    Array(r * c).fill(0)
  );
  const selected: Array<Array<number>> = Array.from(Array(c), (_) =>
    Array(r).fill(0)
  );

  const start = [Math.floor(Math.random() * c), Math.floor(Math.random() * r)];
  frontier.push(coordToNum(c, start), 0);

  while (frontier.size > 0) {
    const weight = frontier.peekPriority();
    const [nextX, nextY] = numToCoord(c, frontier.pop());
    if (selected[nextX][nextY] == 1) continue;
    selected[nextX][nextY] = 1;
    graph[nextX][nextY].neighbors.forEach((w, i) => {
      if (w > 0) {
        const neighbor = neighborPos(nextX, nextY, i);
        if (selected[neighbor[0]][neighbor[1]] == 0) {
          frontier.push(coordToNum(c, neighbor), w);
        } else if (w == weight) {
          mst[coordToNum(c, neighbor)][coordToNum(c, [nextX, nextY])] = 1;
          mst[coordToNum(c, [nextX, nextY])][coordToNum(c, neighbor)] = 1;
        }
      }
    });
  }

  return mst;
}

/** Converts number representation on grid-graph to (x,y) coordinate. */
function numToCoord(c: number, n: number): number[] {
  return [n % c, Math.floor(n / c)];
}

/** Converts coordinate on grid-graph with c columns to number representation.
 *  Goes row by row and counts up (i.e. 2x3 = [[0, 1], [2, 3], [4, 5]]) */
function coordToNum(c: number, [x, y]: number[]): number {
  return y * c + x;
}

interface Node {
  neighbors: number[];
}

/** Creates a r x c grid-graph with unique random edge weights in the range
 *  [1, r x c]. Represented with a 2D Node array with edge weights defined in
 *  neighbors. */
function createRandomGridGraph(r: number, c: number): Node[][] {
  const graph: Array<Array<Node>> = Array.from(Array(c), (_) =>
    Array(r)
      .fill(0)
      .map(() => ({ neighbors: [0, 0, 0, 0] }))
  );

  // r x c grid-graph has 2rc - r - c edges, define values for all
  const weights = Array(2 * r * c - r - c).fill(0);
  weights.forEach((_, i, arr) => {
    arr[i] = i + 1;
  });

  for (let i = 0; i < c; i++) {
    for (let j = 0; j < r; j++) {
      for (let k = 0; k < 4; k++) {
        if (graph[i][j].neighbors[k] == 0 && !invalidEdge(r, c, i, j, k)) {
          const [weight] = weights.splice(
            Math.floor(Math.random() * weights.length),
            1
          );
          graph[i][j].neighbors[k] = weight;
          const [nx, ny] = neighborPos(i, j, k);
          const relativeNeighbor = k > 1 ? k - 2 : k + 2;
          graph[nx][ny].neighbors[relativeNeighbor] = weight;
        }
      }
    }
  }

  return graph;
}

/** Returns the coordinate of the neighbor of the node at (x, y) in dir(ection). */
function neighborPos(x: number, y: number, dir: number): number[] {
  const dirx = dir == 1 ? 1 : dir == 3 ? -1 : 0;
  const diry = dir == 0 ? -1 : dir == 2 ? 1 : 0;
  return [x + dirx, y + diry];
}

/** Returns true if the r x c grid-graph with node (x, y) does not have an edge
 *  in direction k, where k: 0 = up, 1 = right, 2 = bottom, 3 = left. */
function invalidEdge(
  r: number,
  c: number,
  x: number,
  y: number,
  k: number
): boolean {
  const top: boolean = y == 0 && k == 0;
  const bottom: boolean = y == r - 1 && k == 2;
  const left: boolean = x == 0 && k == 3;
  const right: boolean = x == c - 1 && k == 1;
  return top || bottom || left || right;
}
