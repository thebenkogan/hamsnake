import { MST } from "./mst";

/** Node in Hamiltonian cycle at (x, y), with next position at next. The next
 *  node must be exactly 1 space from this node. The next of the last node
 *  is the first node in the cycle. */
interface Cycle {
  x: number;
  y: number;
  next: Cycle;
}

/** Creates a Hamiltonian cycle for a grid-graph with r rows and c columns.
 *  r and c must both be even. */
export function createCycle(r: number, c: number): Cycle {
  return null;
}
