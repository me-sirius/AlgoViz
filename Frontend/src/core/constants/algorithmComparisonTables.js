// Auto-generated comparison tables (filled).
export const algorithmComparisonTables = {
  "searching": [
    {
      "name": "Binary Search",
      "best": "O(1)",
      "avg": "O(log n)",
      "worst": "O(log n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Jump Search",
      "best": "_",
      "avg": "O(√n)",
      "worst": "O(√n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Linear Search",
      "best": "O(1)",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Exponential Search",
      "best": "_",
      "avg": "O(log n)",
      "worst": "O(log n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Interpolation Search",
      "best": "O(1)",
      "avg": "O(log log n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    }
  ],
  "sorting": [
    {
      "name": "Bubble Sort",
      "best": "O(n)",
      "avg": "O(n²)",
      "worst": "O(n²)",
      "space": "O(1)",
      "stable": "Yes"
    },
    {
      "name": "Cyclic Sort",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "No"
    },
    {
      "name": "Insertion Sort",
      "best": "O(n)",
      "avg": "O(n²)",
      "worst": "O(n²)",
      "space": "O(1)",
      "stable": "Yes"
    },
    {
      "name": "Selection Sort",
      "best": "O(n²)",
      "avg": "O(n²)",
      "worst": "O(n²)",
      "space": "O(1)",
      "stable": "No"
    },
    {
      "name": "Dutch National Flag",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Heap Sort",
      "best": "O(n log n)",
      "avg": "O(n log n)",
      "worst": "O(n log n)",
      "space": "O(1)",
      "stable": "No"
    },
    {
      "name": "Merge Sort",
      "best": "O(n log n)",
      "avg": "O(n log n)",
      "worst": "O(n log n)",
      "space": "O(n)",
      "stable": "Yes"
    },
    {
      "name": "Quick Sort",
      "best": "O(n log n)",
      "avg": "O(n log n)",
      "worst": "O(n²)",
      "space": "_",
      "stable": "No"
    }
  ],
  "graph": [
    {
      "name": "Bellman-Ford",
      "best": "_",
      "avg": "O(VE)",
      "worst": "O(VE)",
      "space": "O(V)",
      "stable": "_"
    },
    {
      "name": "Breadth-First Search",
      "best": "_",
      "avg": "O(V + E)",
      "worst": "O(V + E)",
      "space": "_",
      "stable": "_"
    },
    {
      "name": "Depth-First Search",
      "best": "_",
      "avg": "O(V + E)",
      "worst": "O(V + E)",
      "space": "O(V)",
      "stable": "_"
    },
    {
      "name": "Dijkstra's Algorithm",
      "best": "_",
      "avg": "O((V + E) log V)",
      "worst": "O(V²)",
      "space": "_",
      "stable": "_"
    },
    {
      "name": "Kruskal's MST",
      "best": "_",
      "avg": "O(E log E)",
      "worst": "O(E log E)",
      "space": "O(V)",
      "stable": "_"
    },
    {
      "name": "Prim's MST",
      "best": "_",
      "avg": "O(E log V)",
      "worst": "O(E log V)",
      "space": "O(V)",
      "stable": "_"
    },
    {
      "name": "Topological Sort",
      "best": "_",
      "avg": "O(V + E)",
      "worst": "O(V + E)",
      "space": "O(V)",
      "stable": "_"
    },
    {
      "name": "A* Search",
      "best": "_",
      "avg": "O(E)",
      "worst": "O(b^d)",
      "space": "O(V)",
      "stable": "_"
    },
    {
      "name": "Floyd-Warshall",
      "best": "_",
      "avg": "O(V³)",
      "worst": "O(V³)",
      "space": "O(V²)",
      "stable": "_"
    },
    {
      "name": "Network Flow",
      "best": "_",
      "avg": "O(VE²)",
      "worst": "O(E * max_flow)",
      "space": "O(V + E)",
      "stable": "_"
    }
  ],
  "technique": [
    {
      "name": "Two Pointers",
      "best": "_",
      "avg": "_",
      "worst": "_",
      "space": "_",
      "stable": "_"
    },
    {
      "name": "Backtracking",
      "best": "_",
      "avg": "_",
      "worst": "O(k^n) or exponential",
      "space": "O(n)",
      "stable": "_"
    },
    {
      "name": "Sliding Window",
      "best": "_",
      "avg": "_",
      "worst": "_",
      "space": "_",
      "stable": "_"
    }
  ],
  "dynamic-programming": [
    {
      "name": "Fibonacci Sequence",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(n) or O(1)",
      "stable": "_"
    },
    {
      "name": "0/1 Knapsack",
      "best": "_",
      "avg": "O(N*W)",
      "worst": "O(N*W)",
      "space": "O(N*W)",
      "stable": "_"
    },
    {
      "name": "Coin Change",
      "best": "_",
      "avg": "O(S*n)",
      "worst": "O(S*n)",
      "space": "O(S)",
      "stable": "_"
    },
    {
      "name": "Kadane's Algorithm",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Longest Common Subsequence",
      "best": "_",
      "avg": "O(N*M)",
      "worst": "O(N*M)",
      "space": "O(N*M)",
      "stable": "_"
    },
    {
      "name": "Longest Increasing Subsequence",
      "best": "_",
      "avg": "O(n^2)",
      "worst": "O(n^2)",
      "space": "O(n)",
      "stable": "_"
    },
    {
      "name": "Subset Sum",
      "best": "_",
      "avg": "O(N*Sum)",
      "worst": "O(N*Sum)",
      "space": "O(Sum)",
      "stable": "_"
    },
    {
      "name": "Edit Distance",
      "best": "_",
      "avg": "O(N*M)",
      "worst": "O(N*M)",
      "space": "O(N*M)",
      "stable": "_"
    },
    {
      "name": "Matrix Chain Multiplication",
      "best": "_",
      "avg": "O(n^3)",
      "worst": "O(n^3)",
      "space": "O(n^2)",
      "stable": "_"
    }
  ],
  "tree": [
    {
      "name": "Check Balanced Binary Tree",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(h)",
      "stable": "_"
    },
    {
      "name": "Tree Traversals",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(h)",
      "stable": "_"
    },
    {
      "name": "BST Operations",
      "best": "_",
      "avg": "O(log n)",
      "worst": "O(n)",
      "space": "O(h)",
      "stable": "_"
    },
    {
      "name": "Level Order Traversal",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(w)",
      "stable": "_"
    },
    {
      "name": "Lowest Common Ancestor",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(h)",
      "stable": "_"
    },
    {
      "name": "Tree Height & Diameter",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(h)",
      "stable": "_"
    },
    {
      "name": "Serialize & Deserialize Tree",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(n)",
      "stable": "_"
    }
  ],
  "string": [
    {
      "name": "Anagram Checking",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "String Matching (Naive)",
      "best": "_",
      "avg": "O(N*M)",
      "worst": "O(N*M)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "String Reversal & Rotation",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(n)",
      "stable": "_"
    },
    {
      "name": "Longest Palindromic Substring",
      "best": "_",
      "avg": "O(n^2)",
      "worst": "O(n^2)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Rabin-Karp Algorithm",
      "best": "_",
      "avg": "O(N+M)",
      "worst": "O(N*M)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "KMP Algorithm",
      "best": "_",
      "avg": "O(N + M)",
      "worst": "O(N + M)",
      "space": "O(M)",
      "stable": "_"
    },
    {
      "name": "Z Algorithm",
      "best": "_",
      "avg": "O(N+M)",
      "worst": "O(N+M)",
      "space": "O(N+M)",
      "stable": "_"
    }
  ],
  "geometry": [
    {
      "name": "Distance Between Two Points",
      "best": "_",
      "avg": "O(1)",
      "worst": "O(1)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Orientation of Points",
      "best": "_",
      "avg": "O(1)",
      "worst": "O(1)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Point Inside Polygon",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Convex Hull",
      "best": "_",
      "avg": "O(N log N)",
      "worst": "O(N log N)",
      "space": "O(N)",
      "stable": "_"
    },
    {
      "name": "Convex Hull (Graham Scan)",
      "best": "_",
      "avg": "O(n log n)",
      "worst": "O(n log n)",
      "space": "O(n)",
      "stable": "_"
    },
    {
      "name": "Convex Hull (Jarvis March)",
      "best": "_",
      "avg": "O(n*h)",
      "worst": "O(n^2)",
      "space": "O(h)",
      "stable": "_"
    },
    {
      "name": "Line Intersection",
      "best": "_",
      "avg": "O(1)",
      "worst": "O(1)",
      "space": "O(1)",
      "stable": "_"
    }
  ],
  "math": [
    {
      "name": "Counting Digits & Factors",
      "best": "_",
      "avg": "O(log n) or O(sqrt n)",
      "worst": "O(log n) or O(sqrt n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Euclidean Algorithm (GCD)",
      "best": "_",
      "avg": "O(log min(a,b))",
      "worst": "O(log min(a,b))",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Power of Two Check",
      "best": "_",
      "avg": "O(1)",
      "worst": "O(1)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Fast Exponentiation",
      "best": "_",
      "avg": "O(log n)",
      "worst": "O(log n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Modular Arithmetic",
      "best": "_",
      "avg": "O(1) per operation",
      "worst": "O(1) per operation",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Prime Factorization",
      "best": "_",
      "avg": "O(sqrt(n))",
      "worst": "O(sqrt(n))",
      "space": "O(log n)",
      "stable": "_"
    },
    {
      "name": "Sieve of Eratosthenes",
      "best": "_",
      "avg": "O(n log log n)",
      "worst": "O(n log log n)",
      "space": "O(n)",
      "stable": "_"
    },
    {
      "name": "Fibonacci (Math-based)",
      "best": "_",
      "avg": "O(log n)",
      "worst": "O(log n)",
      "space": "O(1)",
      "stable": "_"
    }
  ],
  "linked-list": [
    {
      "name": "Find Middle of Linked List",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Linked List Traversal",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Merge Two Sorted Lists",
      "best": "_",
      "avg": "O(n + m)",
      "worst": "O(n + m)",
      "space": "O(1) iterative, O(n+m) recursive",
      "stable": "_"
    },
    {
      "name": "Floyd's Cycle Detection",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Insertion & Deletion",
      "best": "_",
      "avg": "O(1) at position, O(n) search",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Intersection of Two Linked Lists",
      "best": "_",
      "avg": "O(n + m)",
      "worst": "O(n + m)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Remove Nth Node from End",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1)",
      "stable": "_"
    },
    {
      "name": "Reverse Linked List",
      "best": "_",
      "avg": "O(n)",
      "worst": "O(n)",
      "space": "O(1) iterative, O(n) recursive",
      "stable": "_"
    }
  ]
};
