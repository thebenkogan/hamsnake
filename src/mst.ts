import { MinQueue } from "heapify";

/** Finds a random minimum spanning tree for a grid-graph with r rows
 *  and c columns. Returns an adjacency matrix of the graph formed by the MST,
 *  indexed using number representation. */
export function MST(r: number, c: number): boolean[][] {
  const graph = createRandomGridGraph(r, c);
  const frontier = new MinQueue(r * c); // Frontier nodes of Prim's algorithm

  // Adjacency matrix of MST, with mst[x][y] = 1 representing an (x, y) edge
  const mst: Array<Array<boolean>> = Array.from(Array(r * c), (_) =>
    Array(r * c).fill(false)
  );

  // Selected nodes in the MST; selected[x][y] = true if node at (x, y) in MST
  const selected: Array<Array<boolean>> = Array.from(Array(c), (_) =>
    Array(r).fill(false)
  );

  // Pick random node to start Prim's algorithm, add to frontier
  const start = [Math.floor(Math.random() * c), Math.floor(Math.random() * r)];
  frontier.push(coordToNum(c, start), 0);

  // Pick nodes to add to MST until frontier is empty
  while (frontier.size > 0) {
    const weight = frontier.peekPriority(); // weight of edge that added node
    const [nextX, nextY] = numToCoord(c, frontier.pop());
    if (selected[nextX][nextY]) continue; // skip if node already added by different neighbor
    selected[nextX][nextY] = true;
    graph[nextX][nextY].neighbors.forEach((w, i) => {
      if (w > 0) {
        const [nx, ny] = neighborPos(nextX, nextY, i);
        if (!selected[nx][ny]) {
          frontier.push(coordToNum(c, [nx, ny]), w);
        } else if (w == weight) {
          // selected neighbor with same weight edge must be one that added
          // this node, thus create the edge; this is why uniqueness is ensured
          const neighborNum = coordToNum(c, [nx, ny]);
          const currentNum = coordToNum(c, [nextX, nextY]);
          mst[neighborNum][currentNum] = true;
          mst[currentNum][neighborNum] = true;
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
export function coordToNum(c: number, [x, y]: number[]): number {
  return y * c + x;
}

/** Grid-graph node used to compute MST. */
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

  // r x c grid-graph has 2rc - r - c edges, define unique values for all
  const weights = Array(2 * r * c - r - c).fill(0);
  weights.forEach((_, i, arr) => {
    arr[i] = i + 1;
  });

  // iterate through all nodes and assign edge-weights to neighbors
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
export function neighborPos(x: number, y: number, dir: number): number[] {
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
