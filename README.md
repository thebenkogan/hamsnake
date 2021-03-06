# HAMSNAKE

http://hamsnake.benkogan.io/

An AI that plays the game Snake by following a Hamiltonian Cycle and taking shortcuts. Includes a slider to control the speed and a toggle for visualizing the underlying Hamiltonian cycle. Built with Typescript and Webpack.

Build with `npm run build`

Name inspired by the NP-Complete problems HAMPATH and HAMCYCLE, although this implementation is in polynomial time :)

## Hamiltonian Cycle Generation

To create a Hamiltonian cycle on a grid-graph, I followed the ideas outlined in this article: https://medium.com/@pascal.sommer.ch/generating-hamiltonian-cycles-in-rectangular-grid-graphs-316c94ecefe0. The general outline is to first generate a random minimum spanning tree (MST) on a half resolution grid-graph, then trace the outline to obtain the Hamiltonian cycle on the original grid-graph. I first assign random edge weights to the grid-graph, then use Prim's algorithm to find the MST. Note that the spanning tree is not required to be of minimum weight, but I think it is a pretty straightforward algorithm for generating a spanning tree and ensuring the (pseudo)randomness. After creating the MST, I trace the outline by following the right-hand rule (i.e. walking around the MST and always turning right). Note that the original grid-graph must have an even number of rows and columns, since the first step is to find an MST on a half-resolution grid-graph by cutting the original dimensions in half.

## Hamiltonian Cycle Following

With just following the Hamiltonian cycle, the snake will never lose. Covering every square ensures that it will eventually reach the food, and visiting each node once per cycle ensures that it will never hit its body (until the snake is the size of the grid, which is exactly when it wins). However, this approach is very inefficient and slow. Often times, the snake will traverse the entire cycle when it could easily follow some shortcuts to grab the next food. Thus, the next steps were to create rules for when the snake could take shortcuts.

## Shortcuts

I was inspired by some of the ideas in this article by John Tapsell: https://johnflux.com/category/nokia-6110-snake-project/. The basic idea is to view the Hamiltonian cycle as a one-dimensional path that is infinitely long. On this path, we have empty squares outside of the snake, the tail, the body, and the head. If we enforce this order with the shortcuts, then we will have a high probability of not losing. The intuition behind this is that the head will always have empty squares along the cycle to fall back on if it ever gets too close to the tail. Note that the snake does not have to be contiguous along the one-dimensional path by way of the shortcuts. To implement this policy, I first assign an index to each position along the cycle in increasing order. In any instance of the ordering mentioned above, the tail and head cover a range of indices, and the head is not allowed to take a shortcut to a square indexed within that range. This way, each shortcut will only take the head to one of the empty squares, ensuring the order is preserved. Note that we will always be able to follow this policy, since at any point, the head can always go to the next index along the cycle and stay out of the range.

The next policy I created was to enforce a separation distance between the head and tail along the Hamiltonian cycle. We can define this distance with the indices mentioned above: it is the number of squares along the cycle from the head index to the tail index. I define a constant separation value of 1/4 of the screen and enforce that the snake can only take a shortcut if the resulting separation distance will be greater than this value. This policy ensures that there are a sufficient number of squares between the head and tail such that if there are a lot of food generations in between, the snake will be able to survive and not hit the tail. This is the reason I said "we will have a high probability of not losing", since it could always be the case that every subsequent step of the snake is a food and it will not have enough space to grow before hitting the tail. However such a case is highly unlikely, and ensuring this separation makes it nearly impossible.

The last shortcuts policy is that the snake cannot take a shortcut passed the food. More specifically, if the snake is at index i and takes a shortcut to index j with the food located at index f, it must be that i < j <= f (comparisons are relative to the cycle). This ensures that the snake never skips the food, since the whole point of taking these shortcuts is to get to the food faster.

Originally, I planned to turn off the shortcuts when the snake takes up 1/2 of the screen. However, due to the strictness of my policies, particularly the separation distance, this was unneeded. The snake faces little chance of growing long enough to hit the tail since the separation is usually 1/4 of the screen, and moreover, towards the late game, this separation reduces to Hamiltonian cycle following since every shortcut is invalidated.
