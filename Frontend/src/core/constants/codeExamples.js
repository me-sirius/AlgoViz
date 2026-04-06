// Algorithm implementations in different programming languages

// Bubble Sort
export const bubbleSort = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

pair<vector<int>, pair<int, int>> bubbleSort(vector<int> arr) {
  int n = arr.size();
  int comparisons = 0;
  int swaps = 0;
  
  for (int i = 0; i < n - 1; i++) {           // Line 6
    bool swapped = false;                      // Line 7
    
    for (int j = 0; j < n - i - 1; j++) {     // Line 9
      comparisons++;                           // Line 10
      
      if (arr[j] > arr[j + 1]) {              // Line 12
        // Swap elements
        swap(arr[j], arr[j + 1]);             // Line 14
        swapped = true;                        // Line 15
        swaps++;                               // Line 16
      }
    }
    
    if (!swapped) break;                       // Line 20
  }
  
  return {arr, {comparisons, swaps}};          // Line 23
}`,

  python: `def bubble_sort(arr):
    n = len(arr)
    comparisons = 0
    swaps = 0
    
    for i in range(n - 1):                # Line 6
        swapped = False                   # Line 7
        
        for j in range(n - i - 1):        # Line 9
            comparisons += 1              # Line 10
            
            if arr[j] > arr[j + 1]:      # Line 12
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]  # Line 14
                swapped = True            # Line 15
                swaps += 1                # Line 16
            
        if not swapped:                   # Line 20
            break
    
    return arr, comparisons, swaps        # Line 23`,

  javascript: `function bubbleSort(arr) {
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {           // Line 6
    let swapped = false;                      // Line 7
    
    for (let j = 0; j < n - i - 1; j++) {    // Line 9
      comparisons++;                          // Line 10
      
      if (arr[j] > arr[j + 1]) {             // Line 12
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; // Line 14
        swapped = true;                       // Line 15
        swaps++;                              // Line 16
      }
    }
    
    if (!swapped) break;                      // Line 20
  }
  
  return { sortedArray: arr, comparisons, swaps }; // Line 23
}`
};

// Quick Sort
export const quickSort = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int partition(vector<int>& arr, int low, int high, int& comparisons, int& swaps) {
  int pivot = arr[high];                   // Line 5
  int i = (low - 1);                       // Line 6
  
  for (int j = low; j <= high - 1; j++) {  // Line 8
    comparisons++;                          // Line 9
    if (arr[j] < pivot) {                  // Line 10
      i++;                                 // Line 11
      swap(arr[i], arr[j]);                // Line 12
      swaps++;                             // Line 13
    }
  }
  swap(arr[i + 1], arr[high]);             // Line 16
  swaps++;                                 // Line 17
  return (i + 1);                          // Line 18
}

void quickSortHelper(vector<int>& arr, int low, int high, int& comparisons, int& swaps) {
  if (low < high) {                        // Line 22
    int pi = partition(arr, low, high, comparisons, swaps); // Line 23
    
    quickSortHelper(arr, low, pi - 1, comparisons, swaps);  // Line 25
    quickSortHelper(arr, pi + 1, high, comparisons, swaps); // Line 26
  }
}

pair<vector<int>, pair<int, int>> quickSort(vector<int> arr) {
  int comparisons = 0;
  int swaps = 0;
  
  quickSortHelper(arr, 0, arr.size() - 1, comparisons, swaps);
  
  return {arr, {comparisons, swaps}};
}`,

  python: `def quick_sort(arr):
    comparisons = 0
    swaps = 0
    
    def partition(arr, low, high):
        nonlocal comparisons, swaps
        pivot = arr[high]                   # Line 5
        i = low - 1                         # Line 6
        
        for j in range(low, high):          # Line 8
            comparisons += 1                # Line 9
            if arr[j] < pivot:              # Line 10
                i += 1                      # Line 11
                arr[i], arr[j] = arr[j], arr[i]  # Line 12
                swaps += 1                  # Line 13
                
        arr[i + 1], arr[high] = arr[high], arr[i + 1]  # Line 16
        swaps += 1                          # Line 17
        return i + 1                        # Line 18
    
    def quick_sort_helper(arr, low, high):
        if low < high:                      # Line 22
            pi = partition(arr, low, high)  # Line 23
            
            quick_sort_helper(arr, low, pi - 1)  # Line 25
            quick_sort_helper(arr, pi + 1, high) # Line 26
    
    # Create a copy of the array to avoid modifying the original
    arr_copy = arr.copy()
    quick_sort_helper(arr_copy, 0, len(arr_copy) - 1)
    
    return arr_copy, comparisons, swaps`,

  javascript: `function quickSort(arr) {
  let comparisons = 0;
  let swaps = 0;
  
  function partition(arr, low, high) {
    const pivot = arr[high];                  // Line 5
    let i = low - 1;                          // Line 6
    
    for (let j = low; j < high; j++) {        // Line 8
      comparisons++;                          // Line 9
      if (arr[j] < pivot) {                   // Line 10
        i++;                                  // Line 11
        [arr[i], arr[j]] = [arr[j], arr[i]];  // Line 12
        swaps++;                              // Line 13
      }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; // Line 16
    swaps++;                                  // Line 17
    return i + 1;                             // Line 18
  }
  
  function quickSortHelper(arr, low, high) {
    if (low < high) {                         // Line 22
      const pi = partition(arr, low, high);   // Line 23
      
      quickSortHelper(arr, low, pi - 1);      // Line 25
      quickSortHelper(arr, pi + 1, high);     // Line 26
    }
  }
  
  // Create a copy of the array to avoid modifying the original
  const arrCopy = [...arr];
  quickSortHelper(arrCopy, 0, arrCopy.length - 1);
  
  return { sortedArray: arrCopy, comparisons, swaps };
}`
};

// Merge Sort
export const mergeSort = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right, int& comparisons, int& merges) {
  int n1 = mid - left + 1;
  int n2 = right - mid;
  
  // Create temporary arrays
  vector<int> L(n1), R(n2);
  
  // Copy data to temporary arrays
  for (int i = 0; i < n1; i++)
    L[i] = arr[left + i];
  for (int j = 0; j < n2; j++)
    R[j] = arr[mid + 1 + j];
  
  // Merge the temporary arrays back
  int i = 0, j = 0, k = left;
  
  while (i < n1 && j < n2) {
    comparisons++;
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    } else {
      arr[k] = R[j];
      j++;
    }
    k++;
    merges++;
  }
  
  // Copy remaining elements
  while (i < n1) {
    arr[k] = L[i];
    i++;
    k++;
    merges++;
  }
  
  while (j < n2) {
    arr[k] = R[j];
    j++;
    k++;
    merges++;
  }
}

void mergeSortHelper(vector<int>& arr, int left, int right, int& comparisons, int& merges) {
  if (left < right) {
    int mid = left + (right - left) / 2;
    
    // Sort first and second halves
    mergeSortHelper(arr, left, mid, comparisons, merges);
    mergeSortHelper(arr, mid + 1, right, comparisons, merges);
    
    // Merge the sorted halves
    merge(arr, left, mid, right, comparisons, merges);
  }
}

pair<vector<int>, pair<int, int>> mergeSort(vector<int> arr) {
  int comparisons = 0;
  int merges = 0;
  
  mergeSortHelper(arr, 0, arr.size() - 1, comparisons, merges);
  
  return {arr, {comparisons, merges}};
}`,

  python: `def merge_sort(arr):
    comparisons = 0
    merges = 0
    
    def merge(arr, left, mid, right):
        nonlocal comparisons, merges
        n1 = mid - left + 1
        n2 = right - mid
        
        # Create temporary arrays
        L = [0] * n1
        R = [0] * n2
        
        # Copy data to temporary arrays
        for i in range(n1):
            L[i] = arr[left + i]
        for j in range(n2):
            R[j] = arr[mid + 1 + j]
        
        # Merge the temporary arrays back
        i = 0
        j = 0
        k = left
        
        while i < n1 and j < n2:
            comparisons += 1
            if L[i] <= R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1
            merges += 1
        
        # Copy remaining elements
        while i < n1:
            arr[k] = L[i]
            i += 1
            k += 1
            merges += 1
        
        while j < n2:
            arr[k] = R[j]
            j += 1
            k += 1
            merges += 1
    
    def merge_sort_helper(arr, left, right):
        if left < right:
            mid = left + (right - left) // 2
            
            # Sort first and second halves
            merge_sort_helper(arr, left, mid)
            merge_sort_helper(arr, mid + 1, right)
            
            # Merge the sorted halves
            merge(arr, left, mid, right)
    
    # Create a copy of the array to avoid modifying the original
    arr_copy = arr.copy()
    merge_sort_helper(arr_copy, 0, len(arr_copy) - 1)
    
    return arr_copy, comparisons, merges`,

  javascript: `function mergeSort(arr) {
  let comparisons = 0;
  let merges = 0;
  
  function merge(arr, left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;
    
    // Create temporary arrays
    const L = new Array(n1);
    const R = new Array(n2);
    
    // Copy data to temporary arrays
    for (let i = 0; i < n1; i++)
      L[i] = arr[left + i];
    for (let j = 0; j < n2; j++)
      R[j] = arr[mid + 1 + j];
    
    // Merge the temporary arrays back
    let i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
      comparisons++;
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        i++;
      } else {
        arr[k] = R[j];
        j++;
      }
      k++;
      merges++;
    }
    
    // Copy remaining elements
    while (i < n1) {
      arr[k] = L[i];
      i++;
      k++;
      merges++;
    }
    
    while (j < n2) {
      arr[k] = R[j];
      j++;
      k++;
      merges++;
    }
  }
  
  function mergeSortHelper(arr, left, right) {
    if (left < right) {
      const mid = Math.floor(left + (right - left) / 2);
      
      // Sort first and second halves
      mergeSortHelper(arr, left, mid);
      mergeSortHelper(arr, mid + 1, right);
      
      // Merge the sorted halves
      merge(arr, left, mid, right);
    }
  }
  
  // Create a copy of the array to avoid modifying the original
  const arrCopy = [...arr];
  mergeSortHelper(arrCopy, 0, arrCopy.length - 1);
  
  return { sortedArray: arrCopy, comparisons, merges };
}`
};

// BFS
export const bfs = {
  cpp: `void bfs(int start, vector<vector<int>> &adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    
    visited[start] = true;
    q.push(start);
    
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";
        
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`,

  python: `def bfs(graph, start):
    visited = set()
    queue = [start]
    distances = {start: 0}

    while queue:                            # Line 6
        current = queue.pop(0)              # Line 6
        
        if current not in visited:          # Line 8
            visited.add(current)            # Line 9
            
            for neighbor in graph[current]: # Line 11
                if neighbor not in visited and neighbor not in queue:  # Line 13
                    queue.append(neighbor)  # Line 14
                    distances[neighbor] = distances[current] + 1  # Line 15
    
    return distances                        # Line 21`,

  javascript: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const distances = { [start]: 0 };

  while (queue.length > 0) {
    const current = queue.shift();             // Line 6
    
    if (!visited.has(current)) {               // Line 8
      visited.add(current);                    // Line 9
      
      for (const neighbor of graph[current]) { // Line 11
        if (!visited.has(neighbor) &&
            !queue.includes(neighbor)) {       // Line 13
          queue.push(neighbor);                // Line 14
          distances[neighbor] = distances[current] + 1; // Line 15
        }
      }
    }
  }
  
  return distances;                            // Line 21
}`
};

// Binary Search
export const binarySearch = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int binarySearch(vector<int> arr, int target) {
  int left = 0;                             // Line 1
  int right = arr.size() - 1;               // Line 2
  
  while (left <= right) {                   // Line 3
    int mid = left + (right - left) / 2;    // Line 4
    
    if (arr[mid] == target) {               // Line 5
      return mid;                           // Line 6
    } else if (arr[mid] < target) {         // Line 7
      left = mid + 1;                       // Line 8
    } else {                                // Line 9
      right = mid - 1;                      // Line 10
    }
  }
  
  return -1;                                // Line 11
}`,

  python: `def binary_search(arr, target):
    left = 0                                # Line 1
    right = len(arr) - 1                    # Line 2
    
    while left <= right:                    # Line 3
        mid = left + (right - left) // 2    # Line 4
        
        if arr[mid] == target:              # Line 5
            return mid                      # Line 6
        elif arr[mid] < target:             # Line 7
            left = mid + 1                  # Line 8
        else:                               # Line 9
            right = mid - 1                 # Line 10
    
    return -1                               # Line 11`,

  javascript: `function binarySearch(arr, target) {
  let left = 0;                             // Line 1
  let right = arr.length - 1;               // Line 2
  
  while (left <= right) {                   // Line 3
    const mid = Math.floor(left + (right - left) / 2);  // Line 4
    
    if (arr[mid] === target) {              // Line 5
      return mid;                           // Line 6
    } else if (arr[mid] < target) {         // Line 7
      left = mid + 1;                       // Line 8
    } else {                                // Line 9
      right = mid - 1;                      // Line 10
    }
  }
  
  return -1;                                // Line 11
}`
};

// Linear Search
export const linearSearch = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int linearSearch(vector<int> arr, int target) {
  for (int i = 0; i < arr.size(); i++) {    // Line 1
    if (arr[i] == target) {                 // Line 3
      return i;                             // Line 4
    }                                       // Line 6
  }
  return -1;                                // Line 7
}`,

  python: `def linear_search(arr, target):
    for i in range(len(arr)):               # Line 1
        if arr[i] == target:                # Line 3
            return i                        # Line 4
                                            # Line 6
    return -1                               # Line 7`,

  javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {   // Line 1
    if (arr[i] === target) {                // Line 3
      return i;                             // Line 4
    }                                       // Line 6
  }
  return -1;                                // Line 7
}`
};

// Heap Sort
export const heapSort = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

void heapify(vector<int>& arr, int n, int i) {
  int largest = i;                          // Line 1
  int left = 2 * i + 1;                     // Line 2
  int right = 2 * i + 2;                    // Line 3
  
  if (left < n && arr[left] > arr[largest]) // Line 7
    largest = left;                         // Line 8
    
  if (right < n && arr[right] > arr[largest]) // Line 11
    largest = right;                        // Line 12
    
  if (largest != i) {                       // Line 15
    swap(arr[i], arr[largest]);             // Line 16
    heapify(arr, n, largest);               // Line 17
  }
}

void heapSort(vector<int>& arr) {
  int n = arr.size();
  
  // Build heap                             // Line 3
  for (int i = n / 2 - 1; i >= 0; i--)     // Line 4
    heapify(arr, n, i);
    
  // Extract elements from heap            // Line 6
  for (int i = n - 1; i > 0; i--) {        // Line 7
    swap(arr[0], arr[i]);                   // Line 8
    heapify(arr, i, 0);                     // Line 9
  }
}`,

  python: `def heapify(arr, n, i):
    largest = i                             # Line 1
    left = 2 * i + 1                        # Line 2
    right = 2 * i + 2                       # Line 3
    
    if left < n and arr[left] > arr[largest]:  # Line 7
        largest = left                      # Line 8
        
    if right < n and arr[right] > arr[largest]:  # Line 11
        largest = right                     # Line 12
        
    if largest != i:                        # Line 15
        arr[i], arr[largest] = arr[largest], arr[i]  # Line 16
        heapify(arr, n, largest)            # Line 17

def heap_sort(arr):
    n = len(arr)
    
    # Build heap                           # Line 3
    for i in range(n // 2 - 1, -1, -1):    # Line 4
        heapify(arr, n, i)
        
    # Extract elements from heap          # Line 6
    for i in range(n - 1, 0, -1):          # Line 7
        arr[0], arr[i] = arr[i], arr[0]     # Line 8
        heapify(arr, i, 0)                  # Line 9`,

  javascript: `function heapify(arr, n, i) {
  let largest = i;                          // Line 1
  let left = 2 * i + 1;                     // Line 2
  let right = 2 * i + 2;                    // Line 3
  
  if (left < n && arr[left] > arr[largest]) // Line 7
    largest = left;                         // Line 8
    
  if (right < n && arr[right] > arr[largest]) // Line 11
    largest = right;                        // Line 12
    
  if (largest !== i) {                      // Line 15
    [arr[i], arr[largest]] = [arr[largest], arr[i]]; // Line 16
    heapify(arr, n, largest);               // Line 17
  }
}

function heapSort(arr) {
  const n = arr.length;
  
  // Build heap                            // Line 3
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) // Line 4
    heapify(arr, n, i);
    
  // Extract elements from heap           // Line 6
  for (let i = n - 1; i > 0; i--) {        // Line 7
    [arr[0], arr[i]] = [arr[i], arr[0]];    // Line 8
    heapify(arr, i, 0);                     // Line 9
  }
}`
};

// Tree Traversal
export const treeTraversal = {
  cpp: `struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// ==========================================
// Inorder Traversal
// ==========================================
void inorderTraversal(TreeNode* root) {
    if (root == nullptr) return;

    inorderTraversal(root->left);
    cout << root->val << " ";
    inorderTraversal(root->right);
}

// ==========================================
// Preorder Traversal
// ==========================================
void preorderTraversal(TreeNode* root) {
    if (root == nullptr) return;

    cout << root->val << " ";
    preorderTraversal(root->left);
    preorderTraversal(root->right);
}

// ==========================================
// Postorder Traversal
// ==========================================
void postorderTraversal(TreeNode* root) {
    if (root == nullptr) return;

    postorderTraversal(root->left);
    postorderTraversal(root->right);
    cout << root->val << " ";
}

// ==========================================
// Level Order Traversal
// ==========================================
void levelOrderTraversal(TreeNode* root) {
    if (root == nullptr) return;
    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        cout << node->val << " ";

        if (node->left) q.push(node->left);
        if (node->right) q.push(node->right);
    }
}`,

  python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# ==========================================
# Inorder Traversal
# ==========================================
def inorder_traversal(root):
    if not root:
        return

    inorder_traversal(root.left)
    print(root.val, end=" ")
    inorder_traversal(root.right)

# ==========================================
# Preorder Traversal
# ==========================================
def preorder_traversal(root):
    if not root:
        return

    print(root.val, end=" ")
    preorder_traversal(root.left)
    preorder_traversal(root.right)

# ==========================================
# Postorder Traversal
# ==========================================
def postorder_traversal(root):
    if not root:
        return

    postorder_traversal(root.left)
    postorder_traversal(root.right)
    print(root.val, end=" ")

# ==========================================
# Level Order Traversal
# ==========================================
def level_order_traversal(root):
    if not root:
        return
    queue = [root]

    while queue:
        node = queue.pop(0)
        print(node.val, end=" ")

        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)`,

  javascript: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// ==========================================
// Inorder Traversal
// ==========================================
function inorderTraversal(root) {
  if (!root) return;

  inorderTraversal(root.left);
  console.log(root.val);
  inorderTraversal(root.right);
}

// ==========================================
// Preorder Traversal
// ==========================================
function preorderTraversal(root) {
  if (!root) return;

  console.log(root.val);
  preorderTraversal(root.left);
  preorderTraversal(root.right);
}

// ==========================================
// Postorder Traversal
// ==========================================
function postorderTraversal(root) {
  if (!root) return;

  postorderTraversal(root.left);
  postorderTraversal(root.right);
  console.log(root.val);
}

// ==========================================
// Level Order Traversal
// ==========================================
function levelOrderTraversal(root) {
  if (!root) return;
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    console.log(node.val);

    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}`
};

// Fibonacci Sequence
export const fibonacci = {
  cpp: `// Iterative Approach - O(n) time, O(1) space
int fibonacciIterative(int n) {
    if (n <= 1) return n;                   // Line 1
    
    int a = 0, b = 1;                       // Line 2
    for (int i = 2; i <= n; i++) {          // Line 3
        int temp = a + b;                   // Line 4
        a = b;                              // Line 5
        b = temp;                           // Line 6
    }
    return b;                               // Line 7
}

// Recursive Approach - O(2^n) time, O(n) space
int fibonacciRecursive(int n) {
    if (n <= 1) return n;                   // Line 2
    return fibonacciRecursive(n-1) + fibonacciRecursive(n-2); // Line 4
}

// Dynamic Programming - O(n) time, O(n) space
int fibonacciDP(int n) {
    if (n <= 1) return n;                   // Line 1
    
    vector<int> dp(n + 1);                  // Line 2
    dp[0] = 0;                              // Line 2
    dp[1] = 1;                              // Line 3
    
    for (int i = 2; i <= n; i++) {          // Line 5
        dp[i] = dp[i-1] + dp[i-2];          // Line 5
    }
    return dp[n];                           // Line 6
}`,

  python: `# Iterative Approach - O(n) time, O(1) space
def fibonacci_iterative(n):
    if n <= 1:
        return n                            # Line 1
    
    a, b = 0, 1                             # Line 2
    for i in range(2, n + 1):               # Line 3
        temp = a + b                        # Line 4
        a = b                               # Line 5
        b = temp                            # Line 6
    return b                                # Line 7

# Recursive Approach - O(2^n) time, O(n) space
def fibonacci_recursive(n):
    if n <= 1:
        return n                            # Line 2
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)  # Line 4

# Dynamic Programming - O(n) time, O(n) space
def fibonacci_dp(n):
    if n <= 1:
        return n                            # Line 1
    
    dp = [0] * (n + 1)                      # Line 2
    dp[0] = 0                               # Line 2
    dp[1] = 1                               # Line 3
    
    for i in range(2, n + 1):               # Line 5
        dp[i] = dp[i-1] + dp[i-2]           # Line 5
    return dp[n]                            # Line 6`,

  javascript: `// Iterative Approach - O(n) time, O(1) space
function fibonacciIterative(n) {
  if (n <= 1) return n;                     // Line 1
  
  let a = 0, b = 1;                         // Line 2
  for (let i = 2; i <= n; i++) {            // Line 3
    const temp = a + b;                     // Line 4
    a = b;                                  // Line 5
    b = temp;                               // Line 6
  }
  return b;                                 // Line 7
}

// Recursive Approach - O(2^n) time, O(n) space
function fibonacciRecursive(n) {
  if (n <= 1) return n;                     // Line 2
  return fibonacciRecursive(n-1) + fibonacciRecursive(n-2); // Line 4
}

// Dynamic Programming - O(n) time, O(n) space
function fibonacciDP(n) {
  if (n <= 1) return n;                     // Line 1
  
  const dp = new Array(n + 1);             // Line 2
  dp[0] = 0;                                // Line 2
  dp[1] = 1;                                // Line 3
  
  for (let i = 2; i <= n; i++) {            // Line 5
    dp[i] = dp[i-1] + dp[i-2];              // Line 5
  }
  return dp[n];                             // Line 6
}`
};

// Binary Search Tree
export const bst = {
  cpp: `struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// Insert operation
TreeNode* insert(TreeNode* root, int val) {
    if (root == nullptr) {                  // Line 2
        return new TreeNode(val);
    }
    
    if (val < root->val) {                  // Line 4
        root->left = insert(root->left, val);
    } else if (val > root->val) {           // Line 6
        root->right = insert(root->right, val);
    }
    return root;                            // Line 8
}

// Search operation
bool search(TreeNode* root, int val) {
    if (root == nullptr) return false;      // Line 2
    if (val == root->val) return true;      // Line 3
    
    if (val < root->val) {                  // Line 5
        return search(root->left, val);
    } else {                                // Line 7
        return search(root->right, val);
    }
}

// Delete operation (with inorder successor)
TreeNode* findMin(TreeNode* node) {
    while (node->left) node = node->left;
    return node;
}

TreeNode* deleteNode(TreeNode* root, int val) {
    if (root == nullptr) return nullptr;    // Line 2
    
    if (val < root->val) {                  // Line 4
        root->left = deleteNode(root->left, val);
    } else if (val > root->val) {           // Line 5
        root->right = deleteNode(root->right, val);
    } else {
        // Node found - handle 3 cases
        if (!root->left) return root->right;  // Line 6
        if (!root->right) return root->left;  // Line 7
        
        // Two children: find inorder successor
        TreeNode* successor = findMin(root->right);
        root->val = successor->val;           // Line 8
        root->right = deleteNode(root->right, successor->val);
    }
    return root;                              // Line 9
}`,

  python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Insert operation
def insert(root, val):
    if not root:                            # Line 2
        return TreeNode(val)
    
    if val < root.val:                      # Line 4
        root.left = insert(root.left, val)
    elif val > root.val:                    # Line 6
        root.right = insert(root.right, val)
    return root                             # Line 8

# Search operation  
def search(root, val):
    if not root:                            # Line 2
        return False
    if val == root.val:                     # Line 3
        return True
        
    if val < root.val:                      # Line 5
        return search(root.left, val)
    else:                                   # Line 7
        return search(root.right, val)

# Delete operation (with inorder successor)
def find_min(node):
    while node.left:
        node = node.left
    return node

def delete_node(root, val):
    if not root:                            # Line 2
        return None
    
    if val < root.val:                      # Line 4
        root.left = delete_node(root.left, val)
    elif val > root.val:                    # Line 5
        root.right = delete_node(root.right, val)
    else:
        # Node found - handle 3 cases
        if not root.left:                   # Line 6
            return root.right
        if not root.right:                  # Line 7
            return root.left
        
        # Two children: find inorder successor
        successor = find_min(root.right)
        root.val = successor.val            # Line 8
        root.right = delete_node(root.right, successor.val)
    return root                             # Line 9`,

  javascript: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

// Insert operation
function insert(root, val) {
  if (!root) {                              // Line 2
    return new TreeNode(val);
  }
  
  if (val < root.val) {                     // Line 4
    root.left = insert(root.left, val);
  } else if (val > root.val) {              // Line 6
    root.right = insert(root.right, val);
  }
  return root;                              // Line 8
}

// Search operation
function search(root, val) {
  if (!root) return false;                  // Line 2
  if (val === root.val) return true;        // Line 3
  
  if (val < root.val) {                     // Line 5
    return search(root.left, val);
  } else {                                  // Line 7
    return search(root.right, val);
  }
}

// Delete operation (with inorder successor)
function findMin(node) {
  while (node.left) node = node.left;
  return node;
}

function deleteNode(root, val) {
  if (!root) return null;                   // Line 2
  
  if (val < root.val) {                     // Line 4
    root.left = deleteNode(root.left, val);
  } else if (val > root.val) {              // Line 5
    root.right = deleteNode(root.right, val);
  } else {
    // Node found - handle 3 cases
    if (!root.left) return root.right;      // Line 6
    if (!root.right) return root.left;      // Line 7
    
    // Two children: find inorder successor
    const successor = findMin(root.right);
    root.val = successor.val;               // Line 8
    root.right = deleteNode(root.right, successor.val);
  }
  return root;                              // Line 9
}`
};

// AVL Tree  
export const avlTree = {
  cpp: `struct AVLNode {
    int val, height;
    AVLNode* left;
    AVLNode* right;
    AVLNode(int x) : val(x), height(1), left(nullptr), right(nullptr) {}
};

int getHeight(AVLNode* node) {              // Line 2
    return node ? node->height : 0;
}

int getBalance(AVLNode* node) {             // Line 5
    return node ? getHeight(node->left) - getHeight(node->right) : 0;
}

AVLNode* rotateRight(AVLNode* y) {          // Line 8
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;
    x->right = y;                           // Line 11
    y->left = T2;                           // Line 12
    y->height = 1 + max(getHeight(y->left), getHeight(y->right));
    x->height = 1 + max(getHeight(x->left), getHeight(x->right));
    return x;                               // Line 15
}

AVLNode* rotateLeft(AVLNode* x) {           // Line 17
    AVLNode* y = x->right;
    AVLNode* T2 = y->left;
    y->left = x;                            // Line 20
    x->right = T2;                          // Line 21
    x->height = 1 + max(getHeight(x->left), getHeight(x->right));
    y->height = 1 + max(getHeight(y->left), getHeight(y->right));
    return y;                               // Line 24
}

AVLNode* insert(AVLNode* node, int val) {   // Line 26
    if (!node) return new AVLNode(val);     // Line 27
    
    if (val < node->val)                    // Line 29
        node->left = insert(node->left, val);
    else if (val > node->val)               // Line 31
        node->right = insert(node->right, val);
    else return node;                       // Line 33
    
    node->height = 1 + max(getHeight(node->left), getHeight(node->right)); // Line 35
    int balance = getBalance(node);         // Line 36
    
    // Left-Left Case
    if (balance > 1 && val < node->left->val)        // Line 38
        return rotateRight(node);           // Line 39
    
    // Right-Right Case
    if (balance < -1 && val > node->right->val)      // Line 42
        return rotateLeft(node);            // Line 43
    
    // Left-Right Case
    if (balance > 1 && val > node->left->val) {      // Line 46
        node->left = rotateLeft(node->left);         // Line 47
        return rotateRight(node);           // Line 48
    }
    
    // Right-Left Case
    if (balance < -1 && val < node->right->val) {    // Line 51
        node->right = rotateRight(node->right);      // Line 52
        return rotateLeft(node);            // Line 53
    }
    
    return node;                            // Line 55
}`,

  python: `class AVLNode:
    def __init__(self, val):
        self.val = val
        self.height = 1
        self.left = None
        self.right = None

def get_height(node):                       # Line 2
    return node.height if node else 0

def get_balance(node):                      # Line 5
    return get_height(node.left) - get_height(node.right) if node else 0

def rotate_right(y):                        # Line 8
    x = y.left
    T2 = x.right
    x.right = y                             # Line 11
    y.left = T2                             # Line 12
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    return x                                # Line 15

def rotate_left(x):                         # Line 17
    y = x.right
    T2 = y.left
    y.left = x                              # Line 20
    x.right = T2                            # Line 21
    x.height = 1 + max(get_height(x.left), get_height(x.right))
    y.height = 1 + max(get_height(y.left), get_height(y.right))
    return y                                # Line 24

def insert(node, val):                      # Line 26
    if not node:                            # Line 27
        return AVLNode(val)
    
    if val < node.val:                      # Line 29
        node.left = insert(node.left, val)
    elif val > node.val:                    # Line 31
        node.right = insert(node.right, val)
    else:
        return node                         # Line 33
    
    node.height = 1 + max(get_height(node.left), get_height(node.right))  # Line 35
    balance = get_balance(node)             # Line 36
    
    # Left-Left Case
    if balance > 1 and val < node.left.val:          # Line 38
        return rotate_right(node)           # Line 39
    
    # Right-Right Case
    if balance < -1 and val > node.right.val:        # Line 42
        return rotate_left(node)            # Line 43
    
    # Left-Right Case
    if balance > 1 and val > node.left.val:          # Line 46
        node.left = rotate_left(node.left)           # Line 47
        return rotate_right(node)           # Line 48
    
    # Right-Left Case
    if balance < -1 and val < node.right.val:        # Line 51
        node.right = rotate_right(node.right)        # Line 52
        return rotate_left(node)            # Line 53
    
    return node                             # Line 55`,

  javascript: `class AVLNode {
  constructor(val) {
    this.val = val;
    this.height = 1;
    this.left = null;
    this.right = null;
  }
}

function getHeight(node) {                  // Line 2
  return node ? node.height : 0;
}

function getBalance(node) {                 // Line 5
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function rotateRight(y) {                   // Line 8
  const x = y.left;
  const T2 = x.right;
  x.right = y;                              // Line 11
  y.left = T2;                              // Line 12
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
  x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
  return x;                                 // Line 15
}

function rotateLeft(x) {                    // Line 17
  const y = x.right;
  const T2 = y.left;
  y.left = x;                               // Line 20
  x.right = T2;                             // Line 21
  x.height = 1 + Math.max(getHeight(x.left), getHeight(x.right));
  y.height = 1 + Math.max(getHeight(y.left), getHeight(y.right));
  return y;                                 // Line 24
}

function insert(node, val) {                // Line 26
  if (!node) return new AVLNode(val);       // Line 27
  
  if (val < node.val)                       // Line 29
    node.left = insert(node.left, val);
  else if (val > node.val)                  // Line 31
    node.right = insert(node.right, val);
  else return node;                         // Line 33
  
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right)); // Line 35
  const balance = getBalance(node);         // Line 36
  
  // Left-Left Case
  if (balance > 1 && val < node.left.val)            // Line 38
    return rotateRight(node);               // Line 39
  
  // Right-Right Case
  if (balance < -1 && val > node.right.val)          // Line 42
    return rotateLeft(node);                // Line 43
  
  // Left-Right Case
  if (balance > 1 && val > node.left.val) {          // Line 46
    node.left = rotateLeft(node.left);               // Line 47
    return rotateRight(node);               // Line 48
  }
  
  // Right-Left Case
  if (balance < -1 && val < node.right.val) {        // Line 51
    node.right = rotateRight(node.right);            // Line 52
    return rotateLeft(node);                // Line 53
  }
  
  return node;                              // Line 55
}`
};

// Knapsack Problem
export const knapsack = {
  cpp: `int knapsack(int W, vector<int>& weights, vector<int>& values, int n) {
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    
    for (int i = 1; i <= n; i++) {            // Line 3
        for (int w = 1; w <= W; w++) {        // Line 4
            if (weights[i-1] <= w) {          // Line 5
                dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]], 
                              dp[i-1][w]);    // Line 6
            } else {                          // Line 7
                dp[i][w] = dp[i-1][w];        // Line 8
            }
        }
    }
    
    return dp[n][W];                          // Line 12
}`,

  python: `def knapsack(W, weights, values, n):
    dp = [[0 for _ in range(W + 1)] for _ in range(n + 1)]
    
    for i in range(1, n + 1):                 # Line 3
        for w in range(1, W + 1):             # Line 4
            if weights[i-1] <= w:             # Line 5
                dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]], 
                              dp[i-1][w])     # Line 6
            else:                             # Line 7
                dp[i][w] = dp[i-1][w]         # Line 8
    
    return dp[n][W]                           # Line 11`,

  javascript: `function knapsack(W, weights, values, n) {
  const dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {              // Line 3
    for (let w = 1; w <= W; w++) {            // Line 4
      if (weights[i-1] <= w) {                // Line 5
        dp[i][w] = Math.max(values[i-1] + dp[i-1][w-weights[i-1]], 
                           dp[i-1][w]);       // Line 6
      } else {                                // Line 7
        dp[i][w] = dp[i-1][w];                // Line 8
      }
    }
  }
  
  return dp[n][W];                            // Line 12
}`
};

// Longest Common Subsequence
export const lcs = {
  cpp: `int longestCommonSubsequence(string text1, string text2) {
    int m = text1.length();
    int n = text2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    
    for (int i = 1; i <= m; i++) {            // Line 5
        for (int j = 1; j <= n; j++) {        // Line 6
            if (text1[i-1] == text2[j-1]) {   // Line 7
                dp[i][j] = dp[i-1][j-1] + 1;  // Line 8
            } else {                          // Line 9
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]); // Line 10
            }
        }
    }
    
    return dp[m][n];                          // Line 14
}`,

  python: `def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):                 # Line 5
        for j in range(1, n + 1):             # Line 6
            if text1[i-1] == text2[j-1]:      # Line 7
                dp[i][j] = dp[i-1][j-1] + 1   # Line 8
            else:                             # Line 9
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]) # Line 10
    
    return dp[m][n]                           # Line 12`,

  javascript: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {              // Line 5
    for (let j = 1; j <= n; j++) {            // Line 6
      if (text1[i-1] === text2[j-1]) {        // Line 7
        dp[i][j] = dp[i-1][j-1] + 1;          // Line 8
      } else {                                // Line 9
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]); // Line 10
      }
    }
  }
  
  return dp[m][n];                            // Line 14
}`
};

// DFS
export const dfs = {
  cpp: `void dfsRec(vector<vector<int>> &adj, 
            vector<bool> &visited, int s) {
    visited[s] = true;              // Line 6
    cout << s << " ";                // Line 7
    
    for (int i : adj[s])             // Line 9
        if (visited[i] == false)     // Line 10
            dfsRec(adj, visited, i); // Line 11
}

void dfs(int start, vector<vector<int>> &adj) {
    vector<bool> visited(adj.size(), false);
    dfsRec(adj, visited, start);
}`,

  python: `def dfs(node, graph, visited):
    \"\"\"
    Depth-First Search traversal
    \"\"\"
    visited.add(node)                   # Line 6
    print(node, end=" ")                # Line 7
    
    for neighbor in graph[node]:        # Line 9
        if neighbor not in visited:     # Line 10
            dfs(neighbor, graph, visited)  # Line 11

def perform_dfs(graph, start_node):
    \"\"\"
    Perform DFS starting from the given node
    \"\"\"
    visited = set()
    dfs(start_node, graph, visited)`,

  javascript: `function dfs(node, graph, visited) {
  /**
   * Depth-First Search traversal
   */
  visited.add(node);                    // Line 6
  console.log(node);                    // Line 7
  
  for (const neighbor of graph[node]) { // Line 9
    if (!visited.has(neighbor)) {       // Line 10
      dfs(neighbor, graph, visited);    // Line 11
    }
  }
}

function performDFS(graph, startNode) {
  /**
   * Perform DFS starting from the given node
   */
  const visited = new Set();
  dfs(startNode, graph, visited);
}`
};


// Dijkstra's Algorithm
export const dijkstra = {
  cpp: `vector<int> dijkstra(int start, vector<vector<pair<int, int>>> &adj) {
    int n = adj.size();
    vector<int> dist(n, INT_MAX);
    priority_queue<pair<int, int>, 
                   vector<pair<int, int>>, 
                   greater<pair<int, int>>> pq;
    
    dist[start] = 0;
    pq.push({0, start});
    
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        
        if (d > dist[u]) continue;
        
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    
    return dist;
}`,

  python: `import heapq

def dijkstra(graph, start):
    \"\"\"
    Find shortest paths from start node to all other nodes
    \"\"\"
    # Initialize distances
    distances = {vertex: float('inf') for vertex in graph}
    distances[start] = 0
    
    # Min-heap priority queue: (distance, vertex)
    pq = [(0, start)]
    
    while pq:
        current_dist, u = heapq.heappop(pq)
        
        # Skip if we found a better path already
        if current_dist > distances[u]:
            continue
        
        for v, weight in graph[u]:
            new_dist = distances[u] + weight
            if new_dist < distances[v]:
                distances[v] = new_dist
                heapq.heappush(pq, (new_dist, v))
    
    return distances`,

  javascript: `function dijkstra(graph, start) {
  /**
   * Find shortest paths from start node to all other nodes
   */
  // Initialize distances
  const distances = {};
  for (const vertex in graph) {
    distances[vertex] = Infinity;
  }
  distances[start] = 0;
  
  // Min-heap priority queue: [distance, vertex]
  const pq = [[0, start]];
  
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [currentDist, u] = pq.shift();
    
    // Skip if we found a better path already
    if (currentDist > distances[u]) {
      continue;
    }
    
    for (const [v, weight] of graph[u]) {
      const newDist = distances[u] + weight;
      if (newDist < distances[v]) {
        distances[v] = newDist;
        pq.push([newDist, v]);
      }
    }
  }
  
  return distances;
}`
};

// Insertion Sort
export const insertionSort = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

pair<vector<int>, pair<int, int>> insertionSort(vector<int> arr) {
  int n = arr.size();
  int comparisons = 0;
  int shifts = 0;
  
  for (int i = 1; i < n; i++) {              // Line 4
    int key = arr[i];                         // Line 5
    int j = i - 1;                            // Line 6
    
    while (j >= 0 && arr[j] > key) {          // Line 8
      comparisons++;                          // Line 9
      arr[j + 1] = arr[j];                    // Line 10
      shifts++;                               // Line 11
      j--;                                    // Line 12
    }
    if (j >= 0) comparisons++;                // Count final comparison
    
    arr[j + 1] = key;                         // Line 15
  }
  
  return {arr, {comparisons, shifts}};        // Line 18
}`,

  python: `def insertion_sort(arr):
    n = len(arr)
    comparisons = 0
    shifts = 0
    
    for i in range(1, n):                   # Line 4
        key = arr[i]                        # Line 5
        j = i - 1                           # Line 6
        
        while j >= 0 and arr[j] > key:      # Line 8
            comparisons += 1                # Line 9
            arr[j + 1] = arr[j]             # Line 10
            shifts += 1                     # Line 11
            j -= 1                          # Line 12
        if j >= 0:
            comparisons += 1                # Count final comparison
        
        arr[j + 1] = key                    # Line 15
    
    return arr, comparisons, shifts         # Line 18`,

  javascript: `function insertionSort(arr) {
  const n = arr.length;
  let comparisons = 0;
  let shifts = 0;

  for (let i = 1; i < n; i++) {              // Line 4
    const key = arr[i];                       // Line 5
    let j = i - 1;                            // Line 6
    
    while (j >= 0 && arr[j] > key) {          // Line 8
      comparisons++;                          // Line 9
      arr[j + 1] = arr[j];                    // Line 10
      shifts++;                               // Line 11
      j--;                                    // Line 12
    }
    if (j >= 0) comparisons++;                // Count final comparison
    
    arr[j + 1] = key;                         // Line 15
  }
  
  return { sortedArray: arr, comparisons, shifts }; // Line 18
}`
};

// Selection Sort
export const selectionSort = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

pair<vector<int>, pair<int, int>> selectionSort(vector<int> arr) {
  int n = arr.size();
  int comparisons = 0;
  int swaps = 0;
  
  for (int i = 0; i < n - 1; i++) {           // Line 4
    int minIdx = i;                           // Line 5
    
    for (int j = i + 1; j < n; j++) {         // Line 7
      comparisons++;                          // Line 8
      if (arr[j] < arr[minIdx]) {             // Line 9
        minIdx = j;                           // Line 10
      }
    }
    
    if (minIdx != i) {                        // Line 14
      swap(arr[i], arr[minIdx]);              // Line 15
      swaps++;                                // Line 16
    }
  }
  
  return {arr, {comparisons, swaps}};         // Line 20
}`,

  python: `def selection_sort(arr):
    n = len(arr)
    comparisons = 0
    swaps = 0
    
    for i in range(n - 1):                  # Line 4
        min_idx = i                         # Line 5
        
        for j in range(i + 1, n):           # Line 7
            comparisons += 1                # Line 8
            if arr[j] < arr[min_idx]:       # Line 9
                min_idx = j                 # Line 10
        
        if min_idx != i:                    # Line 14
            arr[i], arr[min_idx] = arr[min_idx], arr[i]  # Line 15
            swaps += 1                      # Line 16
    
    return arr, comparisons, swaps          # Line 20`,

  javascript: `function selectionSort(arr) {
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {           // Line 4
    let minIdx = i;                           // Line 5
    
    for (let j = i + 1; j < n; j++) {         // Line 7
      comparisons++;                          // Line 8
      if (arr[j] < arr[minIdx]) {             // Line 9
        minIdx = j;                           // Line 10
      }
    }
    
    if (minIdx !== i) {                       // Line 14
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; // Line 15
      swaps++;                                // Line 16
    }
  }
  
  return { sortedArray: arr, comparisons, swaps }; // Line 20
}`
};

// N-Queens
export const nQueens = {
  cpp: `#include <vector>
using namespace std;

class NQueens {
    vector<vector<string>> solutions;
    
    bool isSafe(vector<string>& board, int row, int col, int n) {
        for (int i = 0; i < row; i++)
            if (board[i][col] == 'Q') return false;
        for (int i = row-1, j = col-1; i >= 0 && j >= 0; i--, j--)
            if (board[i][j] == 'Q') return false;
        for (int i = row-1, j = col+1; i >= 0 && j < n; i--, j++)
            if (board[i][j] == 'Q') return false;
        return true;
    }
    
    void solve(vector<string>& board, int row, int n) {
        if (row == n) { solutions.push_back(board); return; }
        for (int col = 0; col < n; col++) {
            if (isSafe(board, row, col, n)) {
                board[row][col] = 'Q';
                solve(board, row + 1, n);
                board[row][col] = '.';
            }
        }
    }
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<string> board(n, string(n, '.'));
        solve(board, 0, n);
        return solutions;
    }
};`,
  python: `def solveNQueens(n):
    solutions = []
    board = [['.'] * n for _ in range(n)]
    
    def isSafe(row, col):
        for i in range(row):
            if board[i][col] == 'Q': return False
        for i, j in zip(range(row-1, -1, -1), range(col-1, -1, -1)):
            if board[i][j] == 'Q': return False
        for i, j in zip(range(row-1, -1, -1), range(col+1, n)):
            if board[i][j] == 'Q': return False
        return True
    
    def solve(row):
        if row == n:
            solutions.append([''.join(r) for r in board])
            return
        for col in range(n):
            if isSafe(row, col):
                board[row][col] = 'Q'
                solve(row + 1)
                board[row][col] = '.'
    
    solve(0)
    return solutions`,
  javascript: `function solveNQueens(n) {
  const solutions = [];
  const board = Array(n).fill().map(() => Array(n).fill('.'));
  
  function isSafe(row, col) {
    for (let i = 0; i < row; i++)
      if (board[i][col] === 'Q') return false;
    for (let i = row-1, j = col-1; i >= 0 && j >= 0; i--, j--)
      if (board[i][j] === 'Q') return false;
    for (let i = row-1, j = col+1; i >= 0 && j < n; i--, j++)
      if (board[i][j] === 'Q') return false;
    return true;
  }
  
  function solve(row) {
    if (row === n) { solutions.push(board.map(r => r.join(''))); return; }
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row][col] = 'Q';
        solve(row + 1);
        board[row][col] = '.';
      }
    }
  }
  solve(0);
  return solutions;
}`
};

// Climbing Stairs
export const climbingStairs = {
  cpp: `int climbStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
  python: `def climbStairs(n):
    if n <= 2: return n
    prev2, prev1 = 1, 2
    for i in range(3, n + 1):
        curr = prev1 + prev2
        prev2, prev1 = prev1, curr
    return prev1`,
  javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`
};

// Coin Change
export const coinChange = {
  cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) dp[i] = min(dp[i], dp[i - coin] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
  python: `def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
  javascript: `function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`
};

// Jump Search
export const jumpSearch = {
  cpp: `int jumpSearch(vector<int>& arr, int target) {
    int n = arr.size();
    int step = sqrt(n);
    int prev = 0;
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += sqrt(n);
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == min(step, n)) return -1;
    }
    return arr[prev] == target ? prev : -1;
}`,
  python: `import math
def jumpSearch(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n: return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n): return -1
    return prev if arr[prev] == target else -1`,
  javascript: `function jumpSearch(arr, target) {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }
  return arr[prev] === target ? prev : -1;
}`
};

// Edit Distance
export const editDistance = {
  cpp: `int minDistance(string word1, string word2) {
    int m = word1.size(), n = word2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i-1] == word2[j-1]) dp[i][j] = dp[i-1][j-1];
            else dp[i][j] = 1 + min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]});
        }
    }
    return dp[m][n];
}`,
  python: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1]
            else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]`,
  javascript: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array(m+1).fill().map(() => Array(n+1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i-1] === word2[j-1]) dp[i][j] = dp[i-1][j-1];
      else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}`
};

// Exponential Search
export const exponentialSearch = {
  cpp: `int exponentialSearch(vector<int>& arr, int target) {
    int n = arr.size();
    if (arr[0] == target) return 0;
    int i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    int lo = i / 2, hi = min(i, n - 1);
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
  python: `def exponentialSearch(arr, target):
    n = len(arr)
    if arr[0] == target: return 0
    i = 1
    while i < n and arr[i] <= target: i *= 2
    lo, hi = i // 2, min(i, n - 1)
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1`,
  javascript: `function exponentialSearch(arr, target) {
  const n = arr.length;
  if (arr[0] === target) return 0;
  let i = 1;
  while (i < n && arr[i] <= target) i *= 2;
  let lo = Math.floor(i / 2), hi = Math.min(i, n - 1);
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`
};

// Interpolation Search
export const interpolationSearch = {
  cpp: `int interpolationSearch(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        if (lo == hi) return arr[lo] == target ? lo : -1;
        int pos = lo + ((double)(hi - lo) / (arr[hi] - arr[lo])) * (target - arr[lo]);
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) lo = pos + 1;
        else hi = pos - 1;
    }
    return -1;
}`,
  python: `def interpolationSearch(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi and target >= arr[lo] and target <= arr[hi]:
        if lo == hi: return lo if arr[lo] == target else -1
        pos = lo + int(((hi - lo) / (arr[hi] - arr[lo])) * (target - arr[lo]))
        if arr[pos] == target: return pos
        if arr[pos] < target: lo = pos + 1
        else: hi = pos - 1
    return -1`,
  javascript: `function interpolationSearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (lo === hi) return arr[lo] === target ? lo : -1;
    const pos = lo + Math.floor(((hi - lo) / (arr[hi] - arr[lo])) * (target - arr[lo]));
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  return -1;
}`
};

// Topological Sort
export const topologicalSort = {
  cpp: `vector<int> topologicalSort(int V, vector<vector<int>>& adj) {
    vector<int> inDegree(V, 0);
    for (int u = 0; u < V; u++)
        for (int v : adj[u]) inDegree[v]++;
    queue<int> q;
    for (int i = 0; i < V; i++)
        if (inDegree[i] == 0) q.push(i);
    vector<int> result;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        result.push_back(u);
        for (int v : adj[u])
            if (--inDegree[v] == 0) q.push(v);
    }
    return result;
}`,
  python: `from collections import deque
def topologicalSort(V, adj):
    inDegree = [0] * V
    for u in range(V):
        for v in adj[u]: inDegree[v] += 1
    q = deque([i for i in range(V) if inDegree[i] == 0])
    result = []
    while q:
        u = q.popleft()
        result.append(u)
        for v in adj[u]:
            inDegree[v] -= 1
            if inDegree[v] == 0: q.append(v)
    return result`,
  javascript: `function topologicalSort(V, adj) {
  const inDegree = Array(V).fill(0);
  for (let u = 0; u < V; u++)
    for (const v of adj[u]) inDegree[v]++;
  const queue = [];
  for (let i = 0; i < V; i++)
    if (inDegree[i] === 0) queue.push(i);
  const result = [];
  while (queue.length) {
    const u = queue.shift();
    result.push(u);
    for (const v of adj[u])
      if (--inDegree[v] === 0) queue.push(v);
  }
  return result;
}`
};

// A* Search
export const aStar = {
  cpp: `struct Node { int x, y, g, h; };
int heuristic(int x1, int y1, int x2, int y2) {
    return abs(x1 - x2) + abs(y1 - y2);
}
vector<pair<int,int>> aStar(vector<vector<int>>& grid, pair<int,int> start, pair<int,int> end) {
    int rows = grid.size(), cols = grid[0].size();
    auto cmp = [](Node& a, Node& b) { return a.g + a.h > b.g + b.h; };
    priority_queue<Node, vector<Node>, decltype(cmp)> pq(cmp);
    map<pair<int,int>, pair<int,int>> parent;
    set<pair<int,int>> visited;
    pq.push({start.first, start.second, 0, heuristic(start.first, start.second, end.first, end.second)});
    int dx[] = {0, 0, 1, -1}, dy[] = {1, -1, 0, 0};
    while (!pq.empty()) {
        auto [x, y, g, h] = pq.top(); pq.pop();
        if (x == end.first && y == end.second) break;
        if (visited.count({x, y})) continue;
        visited.insert({x, y});
        for (int i = 0; i < 4; i++) {
            int nx = x + dx[i], ny = y + dy[i];
            if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && !grid[nx][ny] && !visited.count({nx, ny})) {
                parent[{nx, ny}] = {x, y};
                pq.push({nx, ny, g + 1, heuristic(nx, ny, end.first, end.second)});
            }
        }
    }
    return {}; // Reconstruct path from parent
}`,
  python: `import heapq
def aStar(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    def heuristic(x, y): return abs(x - end[0]) + abs(y - end[1])
    pq = [(heuristic(start[0], start[1]), 0, start[0], start[1])]
    visited = set()
    parent = {}
    while pq:
        f, g, x, y = heapq.heappop(pq)
        if (x, y) == end: break
        if (x, y) in visited: continue
        visited.add((x, y))
        for dx, dy in [(0,1), (0,-1), (1,0), (-1,0)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < rows and 0 <= ny < cols and not grid[nx][ny] and (nx, ny) not in visited:
                parent[(nx, ny)] = (x, y)
                heapq.heappush(pq, (g + 1 + heuristic(nx, ny), g + 1, nx, ny))
    return parent`,
  javascript: `function aStar(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const heuristic = (x, y) => Math.abs(x - end[0]) + Math.abs(y - end[1]);
  const pq = [[heuristic(start[0], start[1]), 0, start[0], start[1]]];
  const visited = new Set();
  const parent = new Map();
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [f, g, x, y] = pq.shift();
    if (x === end[0] && y === end[1]) break;
    const key = x + ',' + y;
    if (visited.has(key)) continue;
    visited.add(key);
    for (const [dx, dy] of [[0,1], [0,-1], [1,0], [-1,0]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && !grid[nx][ny] && !visited.has(nx + ',' + ny)) {
        parent.set(nx + ',' + ny, [x, y]);
        pq.push([g + 1 + heuristic(nx, ny), g + 1, nx, ny]);
      }
    }
  }
  return parent;
}`
};

// Union Find (Disjoint Set)
export const unionFind = {
  cpp: `class UnionFind {
    vector<int> parent, rank;
public:
    UnionFind(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    void unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return;
        if (rank[px] < rank[py]) swap(px, py);
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
    }
    bool connected(int x, int y) { return find(x) == find(y); }
};`,
  python: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    def unite(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return False
        if self.rank[px] < self.rank[py]: px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]: self.rank[px] += 1
        return True
    def connected(self, x, y): return self.find(x) == self.find(y)`,
  javascript: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({length: n}, (_, i) => i);
    this.rank = Array(n).fill(0);
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  unite(x, y) {
    let px = this.find(x), py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) [px, py] = [py, px];
    this.parent[py] = px;
    if (this.rank[px] === this.rank[py]) this.rank[px]++;
    return true;
  }
  connected(x, y) { return this.find(x) === this.find(y); }
}`
};

// Kruskal's MST
export const kruskalMST = {
  cpp: `int kruskalMST(int V, vector<tuple<int, int, int>>& edges) {
    sort(edges.begin(), edges.end());
    UnionFind uf(V);
    int mstWeight = 0, edgesUsed = 0;
    for (auto& [w, u, v] : edges) {
        if (!uf.connected(u, v)) {
            uf.unite(u, v);
            mstWeight += w;
            if (++edgesUsed == V - 1) break;
        }
    }
    return mstWeight;
}`,
  python: `def kruskalMST(V, edges):
    edges.sort()
    uf = UnionFind(V)
    mst_weight, edges_used = 0, 0
    for w, u, v in edges:
        if not uf.connected(u, v):
            uf.unite(u, v)
            mst_weight += w
            edges_used += 1
            if edges_used == V - 1: break
    return mst_weight`,
  javascript: `function kruskalMST(V, edges) {
  edges.sort((a, b) => a[0] - b[0]);
  const uf = new UnionFind(V);
  let mstWeight = 0, edgesUsed = 0;
  for (const [w, u, v] of edges) {
    if (!uf.connected(u, v)) {
      uf.unite(u, v);
      mstWeight += w;
      if (++edgesUsed === V - 1) break;
    }
  }
  return mstWeight;
}`
};

// Prim's MST
export const primMST = {
  cpp: `int primMST(int V, vector<vector<pair<int, int>>>& adj) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
    vector<bool> inMST(V, false);
    pq.push({0, 0});
    int mstWeight = 0;
    while (!pq.empty()) {
        auto [w, u] = pq.top(); pq.pop();
        if (inMST[u]) continue;
        inMST[u] = true;
        mstWeight += w;
        for (auto& [v, weight] : adj[u])
            if (!inMST[v]) pq.push({weight, v});
    }
    return mstWeight;
}`,
  python: `import heapq
def primMST(V, adj):
    pq = [(0, 0)]
    inMST = [False] * V
    mst_weight = 0
    while pq:
        w, u = heapq.heappop(pq)
        if inMST[u]: continue
        inMST[u] = True
        mst_weight += w
        for v, weight in adj[u]:
            if not inMST[v]: heapq.heappush(pq, (weight, v))
    return mst_weight`,
  javascript: `function primMST(V, adj) {
  const pq = [[0, 0]];
  const inMST = Array(V).fill(false);
  let mstWeight = 0;
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [w, u] = pq.shift();
    if (inMST[u]) continue;
    inMST[u] = true;
    mstWeight += w;
    for (const [v, weight] of adj[u])
      if (!inMST[v]) pq.push([weight, v]);
  }
  return mstWeight;
}`
};


// Sudoku Solver
export const sudokuSolver = {
  cpp: `bool isValid(vector<vector<char>>& board, int row, int col, char c) {
    for (int i = 0; i < 9; i++) {
        if (board[row][i] == c || board[i][col] == c) return false;
        if (board[3*(row/3)+i/3][3*(col/3)+i%3] == c) return false;
    }
    return true;
}
bool solveSudoku(vector<vector<char>>& board) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (board[i][j] == '.') {
                for (char c = '1'; c <= '9'; c++) {
                    if (isValid(board, i, j, c)) {
                        board[i][j] = c;
                        if (solveSudoku(board)) return true;
                        board[i][j] = '.';
                    }
                }
                return false;
            }
        }
    }
    return true;
}`,
  python: `def isValid(board, row, col, c):
    for i in range(9):
        if board[row][i] == c or board[i][col] == c: return False
        if board[3*(row//3)+i//3][3*(col//3)+i%3] == c: return False
    return True

def solveSudoku(board):
    for i in range(9):
        for j in range(9):
            if board[i][j] == '.':
                for c in '123456789':
                    if isValid(board, i, j, c):
                        board[i][j] = c
                        if solveSudoku(board): return True
                        board[i][j] = '.'
                return False
    return True`,
  javascript: `function isValid(board, row, col, c) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === c || board[i][col] === c) return false;
    const r = 3 * Math.floor(row/3) + Math.floor(i/3);
    const cl = 3 * Math.floor(col/3) + i % 3;
    if (board[r][cl] === c) return false;
  }
  return true;
}
function solveSudoku(board) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === '.') {
        for (let c = 1; c <= 9; c++) {
          if (isValid(board, i, j, String(c))) {
            board[i][j] = String(c);
            if (solveSudoku(board)) return true;
            board[i][j] = '.';
          }
        }
        return false;
      }
    }
  }
  return true;
}`
};

// Word Search
export const wordSearch = {
  cpp: `bool dfs(vector<vector<char>>& board, string& word, int i, int j, int k) {
    if (k == word.size()) return true;
    if (i < 0 || i >= board.size() || j < 0 || j >= board[0].size()) return false;
    if (board[i][j] != word[k]) return false;
    char temp = board[i][j];
    board[i][j] = '#';
    bool found = dfs(board, word, i+1, j, k+1) || dfs(board, word, i-1, j, k+1) ||
                 dfs(board, word, i, j+1, k+1) || dfs(board, word, i, j-1, k+1);
    board[i][j] = temp;
    return found;
}
bool exist(vector<vector<char>>& board, string word) {
    for (int i = 0; i < board.size(); i++)
        for (int j = 0; j < board[0].size(); j++)
            if (dfs(board, word, i, j, 0)) return true;
    return false;
}`,
  python: `def exist(board, word):
    def dfs(i, j, k):
        if k == len(word): return True
        if i < 0 or i >= len(board) or j < 0 or j >= len(board[0]): return False
        if board[i][j] != word[k]: return False
        temp, board[i][j] = board[i][j], '#'
        found = dfs(i+1,j,k+1) or dfs(i-1,j,k+1) or dfs(i,j+1,k+1) or dfs(i,j-1,k+1)
        board[i][j] = temp
        return found
    for i in range(len(board)):
        for j in range(len(board[0])):
            if dfs(i, j, 0): return True
    return False`,
  javascript: `function exist(board, word) {
  function dfs(i, j, k) {
    if (k === word.length) return true;
    if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return false;
    if (board[i][j] !== word[k]) return false;
    const temp = board[i][j];
    board[i][j] = '#';
    const found = dfs(i+1,j,k+1) || dfs(i-1,j,k+1) || dfs(i,j+1,k+1) || dfs(i,j-1,k+1);
    board[i][j] = temp;
    return found;
  }
  for (let i = 0; i < board.length; i++)
    for (let j = 0; j < board[0].length; j++)
      if (dfs(i, j, 0)) return true;
  return false;
}`
};

// Subset Sum
export const subsetSum = {
  cpp: `bool subsetSum(vector<int>& nums, int target) {
    int n = nums.size();
    vector<vector<bool>> dp(n + 1, vector<bool>(target + 1, false));
    for (int i = 0; i <= n; i++) dp[i][0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= target; j++) {
            dp[i][j] = dp[i-1][j];
            if (j >= nums[i-1]) dp[i][j] = dp[i][j] || dp[i-1][j - nums[i-1]];
        }
    }
    return dp[n][target];
}`,
  python: `def subsetSum(nums, target):
    n = len(nums)
    dp = [[False] * (target + 1) for _ in range(n + 1)]
    for i in range(n + 1): dp[i][0] = True
    for i in range(1, n + 1):
        for j in range(1, target + 1):
            dp[i][j] = dp[i-1][j]
            if j >= nums[i-1]:
                dp[i][j] = dp[i][j] or dp[i-1][j - nums[i-1]]
    return dp[n][target]`,
  javascript: `function subsetSum(nums, target) {
  const n = nums.length;
  const dp = Array(n + 1).fill().map(() => Array(target + 1).fill(false));
  for (let i = 0; i <= n; i++) dp[i][0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= target; j++) {
      dp[i][j] = dp[i-1][j];
      if (j >= nums[i-1]) dp[i][j] = dp[i][j] || dp[i-1][j - nums[i-1]];
    }
  }
  return dp[n][target];
}`
};


// Maze Solver DFS (Backtracking)
export const mazeSolverDFS = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

class MazeSolver {
private:
    vector<vector<int>> maze;
    vector<vector<bool>> visited;
    int rows, cols;
    
    // Direction vectors: Top, Right, Bottom, Left
    int dr[4] = {-1, 0, 1, 0};                    // Line 9
    int dc[4] = {0, 1, 0, -1};                    // Line 10
    
public:
    bool isValid(int r, int c) {                  // Line 13
        return r >= 0 && r < rows && 
               c >= 0 && c < cols && 
               maze[r][c] == 0 &&                 // Not a wall
               !visited[r][c];                    // Not visited
    }
    
    bool solveDFS(int r, int c, vector<pair<int,int>>& path) {  // Line 20
        // Base case: reached the end                            // Line 21
        if (r == rows - 1 && c == cols - 1) {                   // Line 22
            path.push_back({r, c});                              // Line 23
            return true;                                         // Line 24
        }
        
        // Mark current cell as visited                          // Line 27
        visited[r][c] = true;                                    // Line 28
        path.push_back({r, c});                                  // Line 29
        
        // Try all 4 directions                                  // Line 31
        for (int i = 0; i < 4; i++) {                           // Line 32
            int newR = r + dr[i];                                // Line 33
            int newC = c + dc[i];                                // Line 34
            
            if (isValid(newR, newC)) {                          // Line 36
                if (solveDFS(newR, newC, path)) {               // Line 37
                    return true;                                 // Line 38
                }
            }
        }
        
        // Backtrack: no valid path found                        // Line 43
        path.pop_back();                                         // Line 44
        return false;                                            // Line 45
    }
};`,

  python: `class MazeSolver:
    def __init__(self, maze):
        self.maze = maze
        self.rows = len(maze)
        self.cols = len(maze[0])
        self.visited = [[False] * self.cols for _ in range(self.rows)]
        
        # Direction vectors: Top, Right, Bottom, Left
        self.dr = [-1, 0, 1, 0]                    # Line 9
        self.dc = [0, 1, 0, -1]                    # Line 10
    
    def is_valid(self, r, c):                      # Line 12
        return (0 <= r < self.rows and 
                0 <= c < self.cols and 
                self.maze[r][c] == 0 and           # Not a wall
                not self.visited[r][c])            # Not visited
    
    def solve_dfs(self, r, c, path):               # Line 18
        # Base case: reached the end                # Line 19
        if r == self.rows - 1 and c == self.cols - 1:  # Line 20
            path.append((r, c))                     # Line 21
            return True                             # Line 22
        
        # Mark current cell as visited              # Line 24
        self.visited[r][c] = True                   # Line 25
        path.append((r, c))                         # Line 26
        
        # Try all 4 directions                      # Line 28
        for i in range(4):                          # Line 29
            new_r = r + self.dr[i]                  # Line 30
            new_c = c + self.dc[i]                  # Line 31
            
            if self.is_valid(new_r, new_c):        # Line 33
                if self.solve_dfs(new_r, new_c, path):  # Line 34
                    return True                     # Line 35
        
        # Backtrack: no valid path found            # Line 37
        path.pop()                                  # Line 38
        return False                                # Line 39`,

  javascript: `class MazeSolver {
  constructor(maze) {
    this.maze = maze;
    this.rows = maze.length;
    this.cols = maze[0].length;
    this.visited = Array(this.rows).fill().map(() => 
      Array(this.cols).fill(false)
    );
    
    // Direction vectors: Top, Right, Bottom, Left
    this.dr = [-1, 0, 1, 0];                      // Line 11
    this.dc = [0, 1, 0, -1];                      // Line 12
  }
  
  isValid(r, c) {                                 // Line 15
    return r >= 0 && r < this.rows && 
           c >= 0 && c < this.cols && 
           this.maze[r][c] === 0 &&               // Not a wall
           !this.visited[r][c];                   // Not visited
  }
  
  solveDFS(r, c, path) {                          // Line 22
    // Base case: reached the end                  // Line 23
    if (r === this.rows - 1 && c === this.cols - 1) {  // Line 24
      path.push([r, c]);                          // Line 25
      return true;                                // Line 26
    }
    
    // Mark current cell as visited                // Line 29
    this.visited[r][c] = true;                    // Line 30
    path.push([r, c]);                            // Line 31
    
    // Try all 4 directions                        // Line 33
    for (let i = 0; i < 4; i++) {                 // Line 34
      const newR = r + this.dr[i];                // Line 35
      const newC = c + this.dc[i];                // Line 36
      
      if (this.isValid(newR, newC)) {             // Line 38
        if (this.solveDFS(newR, newC, path)) {    // Line 39
          return true;                            // Line 40
        }
      }
    }
    
    // Backtrack: no valid path found              // Line 45
    path.pop();                                   // Line 46
    return false;                                 // Line 47
  }
}`
};

// Maze Solver BFS (Shortest Path)
export const mazeSolverBFS = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

class MazeSolver {
private:
    vector<vector<int>> maze;
    int rows, cols;
    int dr[4] = {-1, 0, 1, 0};                    // Line 7
    int dc[4] = {0, 1, 0, -1};                    // Line 8
    
public:
    vector<pair<int,int>> solveBFS(int startR, int startC, int endR, int endC) {
        vector<vector<bool>> visited(rows, vector<bool>(cols, false));
        map<pair<int,int>, pair<int,int>> parent;        // Line 13
        queue<pair<int,int>> q;                          // Line 14
        
        q.push({startR, startC});                        // Line 16
        visited[startR][startC] = true;                  // Line 17
        
        while (!q.empty()) {                             // Line 19
            auto [r, c] = q.front();                     // Line 20
            q.pop();                                     // Line 21
            
            // Found the end - reconstruct path          // Line 23
            if (r == endR && c == endC) {                // Line 24
                vector<pair<int,int>> path;              // Line 25
                pair<int,int> curr = {r, c};             // Line 26
                while (curr != make_pair(startR, startC)) {
                    path.push_back(curr);                // Line 28
                    curr = parent[curr];                 // Line 29
                }
                path.push_back({startR, startC});        // Line 31
                reverse(path.begin(), path.end());       // Line 32
                return path;                             // Line 33
            }
            
            // Explore all 4 neighbors                   // Line 36
            for (int i = 0; i < 4; i++) {                // Line 37
                int newR = r + dr[i];                    // Line 38
                int newC = c + dc[i];                    // Line 39
                
                if (newR >= 0 && newR < rows &&          // Line 41
                    newC >= 0 && newC < cols &&
                    maze[newR][newC] == 0 &&
                    !visited[newR][newC]) {
                    visited[newR][newC] = true;          // Line 45
                    parent[{newR, newC}] = {r, c};       // Line 46
                    q.push({newR, newC});                // Line 47
                }
            }
        }
        return {};  // No path found                     // Line 51
    }
};`,

  python: `from collections import deque

class MazeSolver:
    def __init__(self, maze):
        self.maze = maze
        self.rows = len(maze)
        self.cols = len(maze[0])
        self.dr = [-1, 0, 1, 0]                    # Line 8
        self.dc = [0, 1, 0, -1]                    # Line 9
    
    def solve_bfs(self, start_r, start_c, end_r, end_c):
        visited = [[False] * self.cols for _ in range(self.rows)]
        parent = {}                                 # Line 13
        queue = deque([(start_r, start_c)])        # Line 14
        
        visited[start_r][start_c] = True           # Line 16
        
        while queue:                                # Line 18
            r, c = queue.popleft()                  # Line 19
            
            # Found the end - reconstruct path      # Line 21
            if r == end_r and c == end_c:          # Line 22
                path = []                           # Line 23
                curr = (r, c)                       # Line 24
                while curr != (start_r, start_c):
                    path.append(curr)               # Line 26
                    curr = parent[curr]             # Line 27
                path.append((start_r, start_c))    # Line 29
                return path[::-1]                   # Line 30
            
            # Explore all 4 neighbors               # Line 32
            for i in range(4):                      # Line 33
                new_r = r + self.dr[i]              # Line 34
                new_c = c + self.dc[i]              # Line 35
                
                if (0 <= new_r < self.rows and      # Line 37
                    0 <= new_c < self.cols and
                    self.maze[new_r][new_c] == 0 and
                    not visited[new_r][new_c]):
                    visited[new_r][new_c] = True    # Line 41
                    parent[(new_r, new_c)] = (r, c) # Line 42
                    queue.append((new_r, new_c))    # Line 43
        
        return []  # No path found                  # Line 46`,

  javascript: `class MazeSolver {
  constructor(maze) {
    this.maze = maze;
    this.rows = maze.length;
    this.cols = maze[0].length;
    this.dr = [-1, 0, 1, 0];                      // Line 6
    this.dc = [0, 1, 0, -1];                      // Line 7
  }
  
  solveBFS(startR, startC, endR, endC) {
    const visited = Array(this.rows).fill().map(() => 
      Array(this.cols).fill(false)
    );
    const parent = new Map();                      // Line 13
    const queue = [[startR, startC]];              // Line 14
    
    visited[startR][startC] = true;                // Line 16
    
    while (queue.length > 0) {                     // Line 18
      const [r, c] = queue.shift();                // Line 19
      
      // Found the end - reconstruct path          // Line 21
      if (r === endR && c === endC) {              // Line 22
        const path = [];                           // Line 23
        let curr = \`\${r}-\${c}\`;                    // Line 24
        while (curr !== \`\${startR}-\${startC}\`) {
          const [cr, cc] = curr.split('-').map(Number);
          path.push([cr, cc]);                     // Line 27
          curr = parent.get(curr);                 // Line 28
        }
        path.push([startR, startC]);               // Line 30
        return path.reverse();                     // Line 31
      }
      
      // Explore all 4 neighbors                   // Line 34
      for (let i = 0; i < 4; i++) {                // Line 35
        const newR = r + this.dr[i];               // Line 36
        const newC = c + this.dc[i];               // Line 37
        
        if (newR >= 0 && newR < this.rows &&       // Line 39
            newC >= 0 && newC < this.cols &&
            this.maze[newR][newC] === 0 &&
            !visited[newR][newC]) {
          visited[newR][newC] = true;              // Line 43
          parent.set(\`\${newR}-\${newC}\`, \`\${r}-\${c}\`);  // Line 44
          queue.push([newR, newC]);                // Line 45
        }
      }
    }
    return [];  // No path found                   // Line 49
  }
}`
};

// Activity Selection (Greedy Algorithm)
export const activitySelection = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

// Activity Selection - Greedy Algorithm
// Select maximum non-overlapping activities

struct Activity {
    int start, end;
    char id;
};

vector<Activity> activitySelection(vector<Activity>& activities) {
    // Step 1: Sort by END TIME (Greedy Choice)   // Line 3
    sort(activities.begin(), activities.end(), 
         [](Activity& a, Activity& b) {
             return a.end < b.end;
         });
    
    vector<Activity> selected;
    selected.push_back(activities[0]);             // Line 6
    int lastEndTime = activities[0].end;
    
    // Step 2: Process remaining activities        // Line 9
    for (int i = 1; i < activities.size(); i++) {
        if (activities[i].start >= lastEndTime) {  // Line 10
            // No conflict - select this activity
            selected.push_back(activities[i]);
            lastEndTime = activities[i].end;       // Line 12
        }
        // Else: Skip (overlaps with selected)
    }
    
    return selected;                               // Line 15
}

// Time Complexity: O(n log n) - sorting
// Space Complexity: O(n) - storing selected`,

  python: `from typing import List, Tuple

# Activity Selection - Greedy Algorithm
# Select maximum non-overlapping activities

def activity_selection(activities: List[Tuple[int, int, str]]):
    # Step 1: Sort by END TIME (Greedy Choice)    # Line 3
    activities.sort(key=lambda x: x[1])
    
    # Step 2: Select first activity               # Line 6
    selected = [activities[0]]
    last_end_time = activities[0][1]
    
    # Step 3: Process remaining activities        # Line 9
    for i in range(1, len(activities)):
        start, end, activity_id = activities[i]
        if start >= last_end_time:                 # Line 10
            # No conflict - select this activity
            selected.append(activities[i])
            last_end_time = end                    # Line 12
        # Else: Skip (overlaps with selected)
    
    return selected                                # Line 15

# Time Complexity: O(n log n) - sorting
# Space Complexity: O(n) - storing selected`,

  javascript: `// Activity Selection - Greedy Algorithm
// Select maximum non-overlapping activities

function activitySelection(activities) {
  // Step 1: Sort by END TIME (Greedy Choice)     // Line 3
  activities.sort((a, b) => a.end - b.end);
  
  // Step 2: Select first activity                // Line 6
  const selected = [activities[0]];
  let lastEndTime = activities[0].end;
  
  // Step 3: Process remaining activities         // Line 9
  for (let i = 1; i < activities.length; i++) {
    if (activities[i].start >= lastEndTime) {     // Line 10
      // No conflict - select this activity
      selected.push(activities[i]);
      lastEndTime = activities[i].end;            // Line 12
    }
    // Else: Skip (overlaps with selected)
  }
  
  return selected;                                // Line 15
}

// Time Complexity: O(n log n) - sorting
// Space Complexity: O(n) - storing selected`
};

// Huffman Coding (Greedy Algorithm)
export const huffmanCoding = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

// Huffman Coding - Greedy Compression Algorithm

struct HuffmanNode {
    char ch;
    int freq;
    HuffmanNode *left, *right;
    
    HuffmanNode(char c, int f) : ch(c), freq(f), 
                                  left(nullptr), right(nullptr) {}
};

struct Compare {
    bool operator()(HuffmanNode* a, HuffmanNode* b) {
        return a->freq > b->freq;  // Min-heap       // Line 9
    }
};

void generateCodes(HuffmanNode* root, string code,
                   map<char, string>& codes) {
    if (!root) return;
    
    if (!root->left && !root->right) {
        codes[root->ch] = code.empty() ? "0" : code;
        return;
    }
    
    generateCodes(root->left, code + "0", codes);   // Line 16
    generateCodes(root->right, code + "1", codes);  // Line 17
}

map<char, string> huffmanCoding(string text) {
    // Step 1: Count frequencies                    // Line 2
    map<char, int> freq;
    for (char c : text) freq[c]++;
    
    // Step 2: Create leaf nodes in min-heap        // Line 5
    priority_queue<HuffmanNode*, vector<HuffmanNode*>, Compare> pq;
    for (auto& p : freq)
        pq.push(new HuffmanNode(p.first, p.second));
    
    // Step 3: Build tree (greedy merging)          // Line 9
    while (pq.size() > 1) {
        HuffmanNode* left = pq.top(); pq.pop();
        HuffmanNode* right = pq.top(); pq.pop();    // Line 12
        
        HuffmanNode* parent = new HuffmanNode('\\0', 
                              left->freq + right->freq);
        parent->left = left;
        parent->right = right;
        pq.push(parent);
    }
    
    // Step 4: Generate codes                        // Line 20
    map<char, string> codes;
    generateCodes(pq.top(), "", codes);
    return codes;
}

// Time: O(n log n) | Space: O(n)`,

  python: `import heapq
from collections import Counter
from typing import Dict

# Huffman Coding - Greedy Compression Algorithm

class HuffmanNode:
    def __init__(self, char, freq):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None
    
    def __lt__(self, other):
        return self.freq < other.freq              # Line 9

def generate_codes(node, code, codes):
    if not node:
        return
    
    if not node.left and not node.right:
        codes[node.char] = code if code else "0"
        return
    
    generate_codes(node.left, code + "0", codes)   # Line 16
    generate_codes(node.right, code + "1", codes)  # Line 17

def huffman_coding(text: str) -> Dict[str, str]:
    # Step 1: Count frequencies                    # Line 2
    freq = Counter(text)
    
    # Step 2: Create leaf nodes in min-heap        # Line 5
    heap = [HuffmanNode(char, f) for char, f in freq.items()]
    heapq.heapify(heap)
    
    # Step 3: Build tree (greedy merging)          # Line 9
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)                # Line 12
        
        parent = HuffmanNode(None, left.freq + right.freq)
        parent.left = left
        parent.right = right
        heapq.heappush(heap, parent)
    
    # Step 4: Generate codes                       # Line 20
    codes = {}
    generate_codes(heap[0], "", codes)
    return codes

# Time: O(n log n) | Space: O(n)`,

  javascript: `// Huffman Coding - Greedy Compression Algorithm

class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

function generateCodes(node, code, codes) {
  if (!node) return;
  
  if (!node.left && !node.right) {
    codes[node.char] = code || "0";
    return;
  }
  
  generateCodes(node.left, code + "0", codes);    // Line 16
  generateCodes(node.right, code + "1", codes);   // Line 17
}

function huffmanCoding(text) {
  // Step 1: Count frequencies                     // Line 2
  const freq = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  // Step 2: Create leaf nodes, add to heap        // Line 5
  let heap = Object.entries(freq)
    .map(([char, f]) => new HuffmanNode(char, f));
  
  // Step 3: Build tree (greedy merging)           // Line 9
  while (heap.length > 1) {
    heap.sort((a, b) => a.freq - b.freq);
    
    const left = heap.shift();
    const right = heap.shift();                    // Line 12
    
    const parent = new HuffmanNode(null, 
                        left.freq + right.freq);
    parent.left = left;
    parent.right = right;
    heap.push(parent);
  }
  
  // Step 4: Generate codes                        // Line 20
  const codes = {};
  generateCodes(heap[0], "", codes);
  return codes;
}

// Time: O(n log n) | Space: O(n)`
};