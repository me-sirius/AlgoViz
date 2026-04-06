import {
  Grid3X3,
  GitBranch,
  Layers,
  Search,
  TrendingUp,
  Shuffle,
} from 'lucide-react';

/**
 * Algorithm route map — replaces the 60+ line if-else chain.
 * If an algorithm ID is here, navigate to the route. Otherwise, show "Coming Soon".
 */
export const algorithmRoutes = {
  // Sorting
  'bubble-sort': '/bubble-sort',
  'selection-sort': '/selection-sort',
  'insertion-sort': '/insertion-sort',
  'quick-sort': '/quick-sort',
  'merge-sort': '/merge-sort',
  'heap-sort': '/heap-sort',
  // Search
  'binary-search': '/binary-search',
  'linear-search': '/linear-search',
  'exponential-search': '/exponential-search',
  'interpolation-search': '/interpolation-search',
  'jump-search': '/jump-search',
  // Trees & Graphs
  'bfs': '/bfs-visualizer',
  'dfs': '/dfs-visualizer',
  'dijkstra': '/dijkstra-visualizer',
  'astar': '/astar-visualizer',
  'tree-traversal': '/tree-traversal',
  'bst': '/bst',
  'avl-tree': '/avl-tree',
  'topological-sort': '/topological-sort',
  // Dynamic Programming
  'fibonacci': '/fibonacci',
  'climbing-stairs': '/climbing-stairs',
  'knapsack': '/knapsack',
  'lcs': '/lcs',
  'edit-distance': '/edit-distance',
  'coin-change': '/coin-change',
  // Greedy
  'activity-selection': '/activity-selection',
  'huffman-coding': '/huffman-coding',
  'prim-mst': '/prim-mst',
  'kruskal-mst': '/kruskal-mst',
  'union-find': '/union-find',
  // Backtracking
  'n-queens': '/n-queens',
  'sudoku-solver': '/sudoku-solver',
  'maze-solver': '/maze-solver',
  'subset-sum': '/subset-sum',
  'word-search': '/word-search',
};

/**
 * Navigate to an algorithm's visualizer page.
 * Returns the route string, or null if the algorithm doesn't have one yet.
 */
export const getAlgorithmRoute = (algorithmId) => {
  return algorithmRoutes[algorithmId] || null;
};

/**
 * Algorithm topic categories and their algorithms.
 * Icons are returned as component references (not JSX) so they can be rendered with props.
 */
export const topics = [
  {
    id: 'arrays',
    title: 'Arrays & Sorting',
    IconComponent: Grid3X3,
    description: 'Explore fundamental array operations and sorting algorithms with interactive demonstrations',
    algorithms: [
      { name: 'Bubble Sort', difficulty: 'Easy', time: 'O(n²)', id: 'bubble-sort' },
      { name: 'Selection Sort', difficulty: 'Easy', time: 'O(n²)', id: 'selection-sort' },
      { name: 'Insertion Sort', difficulty: 'Easy', time: 'O(n²)', id: 'insertion-sort' },
      { name: 'Quick Sort', difficulty: 'Medium', time: 'O(n log n)', id: 'quick-sort' },
      { name: 'Merge Sort', difficulty: 'Medium', time: 'O(n log n)', id: 'merge-sort' },
      { name: 'Heap Sort', difficulty: 'Hard', time: 'O(n log n)', id: 'heap-sort' },
    ],
    accent: 'teal-400',
  },
  {
    id: 'trees',
    title: 'Trees & Graphs',
    IconComponent: GitBranch,
    description: 'Visualize complex tree structures and graph traversal algorithms in real-time',
    algorithms: [
      { name: 'Binary Search Tree', difficulty: 'Medium', time: 'O(log n)', id: 'bst' },
      { name: 'AVL Tree', difficulty: 'Hard', time: 'O(log n)', id: 'avl-tree' },
      { name: 'Tree Traversals', difficulty: 'Easy', time: 'O(n)', id: 'tree-traversal' },
      { name: 'Depth First Search (DFS)', difficulty: 'Medium', time: 'O(V*E)', id: 'dfs' },
      { name: 'Breadth First Search (BFS)', difficulty: 'Medium', time: 'O(V + E)', id: 'bfs' },
      { name: "Dijkstra's Algorithm", difficulty: 'Hard', time: 'O(V²)', id: 'dijkstra' },
      { name: 'A* Algorithm', difficulty: 'Hard', time: 'O(E)', id: 'astar' },
      { name: 'Topological Sort', difficulty: 'Medium', time: 'O(V + E)', id: 'topological-sort' },
    ],
    accent: 'emerald-400',
  },
  {
    id: 'dynamic',
    title: 'Dynamic Programming',
    IconComponent: Layers,
    description: 'Master optimization problems with elegant dynamic programming solutions',
    algorithms: [
      { name: 'Fibonacci Sequence', difficulty: 'Easy', time: 'O(n)', id: 'fibonacci' },
      { name: 'Climbing Stairs', difficulty: 'Easy', time: 'O(n)', id: 'climbing-stairs' },
      { name: 'Knapsack Problem', difficulty: 'Hard', time: 'O(nW)', id: 'knapsack' },
      { name: 'Longest Common Subsequence', difficulty: 'Medium', time: 'O(nm)', id: 'lcs' },
      { name: 'Edit Distance', difficulty: 'Medium', time: 'O(nm)', id: 'edit-distance' },
      { name: 'Coin Change', difficulty: 'Medium', time: 'O(nW)', id: 'coin-change' },
    ],
    accent: 'indigo-400',
  },
  {
    id: 'searching',
    title: 'Search Algorithms',
    IconComponent: Search,
    description: 'Discover efficient searching techniques with visual complexity analysis',
    algorithms: [
      { name: 'Linear Search', difficulty: 'Easy', time: 'O(n)', id: 'linear-search' },
      { name: 'Binary Search', difficulty: 'Easy', time: 'O(log n)', id: 'binary-search' },
      { name: 'Jump Search', difficulty: 'Easy', time: 'O(√n)', id: 'jump-search' },
      { name: 'Interpolation Search', difficulty: 'Medium', time: 'O(log log n)', id: 'interpolation-search' },
      { name: 'Exponential Search', difficulty: 'Medium', time: 'O(log n)', id: 'exponential-search' },
    ],
    accent: 'amber-400',
  },
  {
    id: 'greedy',
    title: 'Greedy Algorithms',
    IconComponent: TrendingUp,
    description: 'Understand greedy strategies for solving optimization challenges',
    algorithms: [
      { name: 'Activity Selection', difficulty: 'Medium', time: 'O(n log n)', id: 'activity-selection' },
      { name: 'Huffman Coding', difficulty: 'Hard', time: 'O(n log n)', id: 'huffman-coding' },
      { name: "Prim's MST", difficulty: 'Hard', time: 'O(E log V)', id: 'prim-mst' },
      { name: "Kruskal's MST", difficulty: 'Hard', time: 'O(E log V)', id: 'kruskal-mst' },
      { name: 'Union Find', difficulty: 'Medium', time: 'O(α(n))', id: 'union-find' },
    ],
    accent: 'rose-400',
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    IconComponent: Shuffle,
    description: 'Solve complex constraint problems using intelligent backtracking',
    algorithms: [
      { name: 'N-Queens Problem', difficulty: 'Hard', time: 'O(N!)', id: 'n-queens' },
      { name: 'Sudoku Solver', difficulty: 'Hard', time: 'O(9^(n*n))', id: 'sudoku-solver' },
      { name: 'Maze Solver', difficulty: 'Medium', time: 'O(4^(n*m))', id: 'maze-solver' },
      { name: 'Subset Sum', difficulty: 'Medium', time: 'O(2^n)', id: 'subset-sum' },
      { name: 'Word Search', difficulty: 'Medium', time: 'O(N*3^L)', id: 'word-search' },
    ],
    accent: 'violet-400',
  },
];

/**
 * Gradient mapping for topic card backgrounds (Tailwind classes).
 */
export const gradientClassMap = {
  arrays: 'from-teal-600 via-cyan-600 to-blue-600',
  trees: 'from-emerald-600 via-green-600 to-lime-600',
  dynamic: 'from-indigo-600 via-purple-600 to-violet-600',
  searching: 'from-amber-600 via-orange-600 to-red-600',
  greedy: 'from-rose-600 via-pink-600 to-fuchsia-600',
  backtracking: 'from-violet-600 via-purple-600 to-indigo-600',
};

/**
 * Footer navigation links.
 */
export const footerLinks = {
  resources: [
    { label: 'Documentation', href: '/view-documentation' },
    { label: 'Tutorials', href: '#', disabled: true },
    { label: 'Blog', href: '/blogs' },
    { label: 'Support', href: '/support' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '#', disabled: true },
    { label: 'Contact', href: '/contact' },
    { label: 'Partners', href: '#', disabled: true },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '/legal/terms' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Refund Policy', href: '/legal/refunds' },
    { label: 'Shipping Policy', href: '/legal/shipping' },
  ],
};
