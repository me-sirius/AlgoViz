import {
    List,
    GitBranch,
    Layers,
    ArrowRight,
    Hash,
    TreePine,
    TrendingUp,
    Network,
    Binary,
} from "lucide-react";

export const dataStructures = [
    {
        id: "array",
        name: "Array",
        category: "linear",
        icon: List,
        difficulty: "Easy",
        description: "Contiguous memory locations storing elements of the same type with index-based access",
        detailedDescription: "Arrays are the most fundamental data structure.  Elements are stored in contiguous memory locations, allowing O(1) access using indices. They form the basis for many other data structures.",
        timeComplexity: {
            access: { avg: "O(1)", worst: "O(1)" },
            search: { avg: "O(n)", worst: "O(n)" },
            insertion: { avg: "O(n)", worst: "O(n)" },
            deletion: { avg: "O(n)", worst: "O(n)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Storing sequential data",
            "Random access requirements",
            "Matrix operations",
            "Buffer implementation",
            "Lookup tables",
        ],
        pros: [
            "O(1) random access",
            "Cache friendly (locality)",
            "Memory efficient",
            "Simple implementation",
        ],
        cons: [
            "Fixed size (static arrays)",
            "Expensive insertion/deletion",
            "Wasted space if not full",
            "Shifting elements overhead",
        ],
        operations: [
            { name: "Access by index", complexity: "O(1)", code: "arr[i]" },
            { name: "Update element", complexity: "O(1)", code: "arr[i] = x" },
            { name: "Insert at end", complexity: "O(1)*", code: "arr.push(x)" },
            { name: "Insert at position", complexity: "O(n)", code: "arr.splice(i, 0, x)" },
            { name: "Delete at position", complexity: "O(n)", code: "arr.splice(i, 1)" },
            { name: "Search element", complexity: "O(n)", code: "arr.indexOf(x)" },
        ],
        codeExample: {
            cpp: `// Array Operations
#include <vector>
#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    vector<int> arr = {1, 2, 3, 4, 5};

    // Access - O(1)
    cout << arr[2] << endl; // 3

    // Insert at end - O(1) amortized
    arr.push_back(6);

    // Insert at index - O(n)
    arr.insert(arr.begin() + 2, 10);

    // Delete - O(n)
    arr.erase(arr.begin() + 2);

    // Search - O(n)
    auto it = find(arr.begin(), arr.end(), 4);
    if (it != arr.end()) {
        cout << "Found at index: " << distance(arr.begin(), it) << endl;
    }
    return 0;
}`,
            python: `# Array Operations (List in Python)
arr = [1, 2, 3, 4, 5]

# Access - O(1)
print(arr[2])  # 3

# Insert at end - O(1) amortized
arr.append(6)  # [1,2,3,4,5,6]

# Insert at index - O(n)
arr.insert(2, 10)  # [1,2,10,3,4,5,6]

# Delete - O(n)
arr.pop(2)  # [1,2,3,4,5,6]

# Search - O(n)
try:
    index = arr.index(4)  # 3
    print(index)
except ValueError:
    print("Not found")`,
            javascript: `// Array Operations
const arr = [1, 2, 3, 4, 5];

// Access - O(1)
console.log(arr[2]); // 3

// Insert at end - O(1) amortized
arr.push(6); // [1,2,3,4,5,6]

// Insert at index - O(n)
arr.splice(2, 0, 10); // [1,2,10,3,4,5,6]

// Delete - O(n)
arr.splice(2, 1); // [1,2,3,4,5,6]

// Search - O(n)
const index = arr.indexOf(4); // 3`,
        },
        interviewQuestions: [
            "Find the maximum subarray sum (Kadane's Algorithm)",
            "Rotate array by k positions",
            "Find missing number in array 1 to n",
            "Merge two sorted arrays",
            "Find duplicate in array",
            "Two Sum problem",
        ],
        tips: [
            "Use two-pointer technique for sorted arrays",
            "Consider sliding window for subarray problems",
            "Prefix sum for range queries",
            "Sort first if order doesn't matter",
        ],
        relatedStructures: ["Dynamic Array", "Matrix", "String"],
    },
    {
        id: "linked-list",
        name: "Linked List",
        category: "linear",
        icon: GitBranch,
        difficulty: "Easy",
        description: "Linear collection where each element points to the next element in sequence",
        detailedDescription: "A linked list consists of nodes where each node contains data and a reference to the next node. Unlike arrays, elements are not stored contiguously, allowing efficient insertion and deletion.",
        timeComplexity: {
            access: { avg: "O(n)", worst: "O(n)" },
            search: { avg: "O(n)", worst: "O(n)" },
            insertion: { avg: "O(1)*", worst: "O(1)*" },
            deletion: { avg: "O(1)*", worst: "O(1)*" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Dynamic memory allocation",
            "Implementation of stacks/queues",
            "Undo functionality",
            "Hash table chaining",
            "Polynomial representation",
        ],
        pros: [
            "Dynamic size",
            "Efficient insertion/deletion at known position",
            "No memory waste",
            "Easy to implement stacks/queues",
        ],
        cons: [
            "No random access",
            "Extra memory for pointers",
            "Not cache friendly",
            "Reverse traversal difficult (singly linked)",
        ],
        operations: [
            { name: "Insert at head", complexity: "O(1)", code: "list.prepend(x)" },
            { name: "Insert at tail", complexity: "O(1)*", code: "list.append(x)" },
            { name: "Delete head", complexity: "O(1)", code: "list.removeFirst()" },
            { name: "Search element", complexity: "O(n)", code: "list.find(x)" },
            { name: "Access by index", complexity: "O(n)", code: "list. get(i)" },
        ],
        codeExample: {
            cpp: `struct Node {
    int val;
    Node* next;
    Node(int x) : val(x), next(nullptr) {}
};

class LinkedList {
public:
    Node* head;
    
    LinkedList() : head(nullptr) {}
    
    // Insert at head - O(1)
    void prepend(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }
    
    // Delete head - O(1)
    void removeFirst() {
        if (!head) return;
        Node* temp = head;
        head = head->next;
        delete temp;
    }
};`,
            python: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    # Insert at head - O(1)
    def prepend(self, val):
        node = Node(val)
        node.next = self.head
        self.head = node
    
    # Delete head - O(1)
    def remove_first(self):
        if not self.head:
            return None
        val = self.head.val
        self.head = self.head.next
        return val`,
            javascript: `class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }
  
  // Insert at head - O(1)
  prepend(val) {
    const node = new Node(val);
    node.next = this.head;
    this.head = node;
    if (!this.tail) this.tail = node;
  }
  
  // Insert at tail - O(1)
  append(val) {
    const node = new Node(val);
    if (this.tail) {
      this.tail.next = node;
      this.tail = node;
    } else {
      this.head = this.tail = node;
    }
  }
  
  // Delete head - O(1)
  removeFirst() {
    if (!this.head) return null;
    const val = this.head.val;
    this.head = this.head.next;
    return val;
  }
}`,
        },
        interviewQuestions: [
            "Reverse a linked list",
            "Detect cycle in linked list (Floyd's)",
            "Find middle element",
            "Merge two sorted linked lists",
            "Remove nth node from end",
            "Check if palindrome",
        ],
        tips: [
            "Use dummy head for easier edge cases",
            "Fast and slow pointer for cycle detection",
            "Reverse in-place to save space",
            "Draw diagrams to visualize pointer changes",
        ],
        relatedStructures: ["Doubly Linked List", "Circular Linked List", "Skip List"],
    },
    {
        id: "stack",
        name: "Stack",
        category: "linear",
        icon: Layers,
        difficulty: "Easy",
        description: "LIFO (Last In First Out) data structure - elements added and removed from the same end",
        detailedDescription: "A stack follows the Last In First Out principle.  Think of a stack of plates - you can only add or remove from the top. It's fundamental for function calls, expression evaluation, and backtracking.",
        timeComplexity: {
            push: { avg: "O(1)", worst: "O(1)" },
            pop: { avg: "O(1)", worst: "O(1)" },
            peek: { avg: "O(1)", worst: "O(1)" },
            search: { avg: "O(n)", worst: "O(n)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Function call stack",
            "Expression evaluation",
            "Undo/Redo operations",
            "Backtracking algorithms",
            "Parenthesis matching",
            "Browser history",
        ],
        pros: [
            "Simple and intuitive",
            "O(1) push and pop",
            "Memory efficient",
            "Easy to implement",
        ],
        cons: [
            "Limited access (only top)",
            "No random access",
            "Stack overflow risk",
            "Not suitable for searching",
        ],
        operations: [
            { name: "Push", complexity: "O(1)", code: "stack.push(x)" },
            { name: "Pop", complexity: "O(1)", code: "stack.pop()" },
            { name: "Peek/Top", complexity: "O(1)", code: "stack.peek()" },
            { name: "isEmpty", complexity: "O(1)", code: "stack.isEmpty()" },
            { name: "Size", complexity: "O(1)", code: "stack.size()" },
        ],
        codeExample: {
            cpp: `#include <stack>
#include <string>
#include <unordered_map>
using namespace std;

// Valid Parentheses
bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};
    
    for (char c : s) {
        if (mapping.count(c)) {
            if (st.empty() || st.top() != mapping[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}`,
            python: `def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}

    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)

    return not stack`,
            javascript: `class Stack {
  constructor() {
    this.items = [];
  }
  
  push(element) {
    this.items.push(element);
  }
  
  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }
  
  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// Valid Parentheses Problem
function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  
  for (let char of s) {
    if (!map[char]) {
      stack.push(char);
    } else if (stack.pop() !== map[char]) {
      return false;
    }
  }
  return stack.length === 0;
}`,
        },
        interviewQuestions: [
            "Valid parentheses",
            "Implement queue using stacks",
            "Min stack (O(1) getMin)",
            "Evaluate postfix expression",
            "Next greater element",
            "Daily temperatures",
        ],
        tips: [
            "Use monotonic stack for next greater/smaller problems",
            "Consider two stacks for special operations",
            "Stack is ideal for matching problems",
            "Think recursion = implicit stack",
        ],
        relatedStructures: ["Queue", "Deque", "Call Stack"],
    },
    {
        id: "queue",
        name: "Queue",
        category: "linear",
        icon: ArrowRight,
        difficulty: "Easy",
        description: "FIFO (First In First Out) data structure - elements added at rear, removed from front",
        detailedDescription: "A queue follows the First In First Out principle. Like a line at a store - first person in line is served first. Essential for BFS, scheduling, and buffering.",
        timeComplexity: {
            enqueue: { avg: "O(1)", worst: "O(1)" },
            dequeue: { avg: "O(1)", worst: "O(1)" },
            front: { avg: "O(1)", worst: "O(1)" },
            search: { avg: "O(n)", worst: "O(n)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "BFS traversal",
            "Process scheduling",
            "Print queue",
            "Message queues",
            "Buffer management",
            "Handling requests",
        ],
        pros: [
            "Fair ordering (FIFO)",
            "O(1) enqueue and dequeue",
            "Natural for sequential processing",
            "Simple implementation",
        ],
        cons: [
            "No random access",
            "Limited access points",
            "Fixed size issues (array implementation)",
        ],
        operations: [
            { name: "Enqueue", complexity: "O(1)", code: "queue.enqueue(x)" },
            { name: "Dequeue", complexity: "O(1)", code: "queue.dequeue()" },
            { name: "Front", complexity: "O(1)", code: "queue.front()" },
            { name: "isEmpty", complexity: "O(1)", code: "queue. isEmpty()" },
            { name: "Size", complexity: "O(1)", code: "queue.size()" },
        ],
        codeExample: {
            cpp: `#include <queue>
using namespace std;

class Queue {
private:
    queue<int> q;
public:
    void enqueue(int x) {
        q.push(x);
    }
    
    int dequeue() {
        if (q.empty()) return -1;
        int val = q.front();
        q.pop();
        return val;
    }
    
    int front() {
        return q.empty() ? -1 : q.front();
    }
    
    bool isEmpty() {
        return q.empty();
    }
};`,
            python: `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        return self.items.popleft() if self.items else None

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)`,
            javascript: `class Queue {
  constructor() {
    this.items = [];
    this.front = 0;
  }
  
  enqueue(element) {
    this.items.push(element);
  }
  
  dequeue() {
    if (this.isEmpty()) return null;
    const item = this.items[this.front];
    this.front++;
    // Clean up periodically
    if (this.front > this.items.length / 2) {
      this.items = this.items.slice(this.front);
      this.front = 0;
    }
    return item;
  }
  
  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.front];
  }
  
  isEmpty() {
    return this.front >= this.items.length;
  }
  
  size() {
    return this.items.length - this.front;
  }
}`,
        },
        interviewQuestions: [
            "Implement stack using queues",
            "Circular queue implementation",
            "First non-repeating character in stream",
            "Sliding window maximum",
            "Rotting oranges (BFS)",
            "Number of islands (BFS approach)",
        ],
        tips: [
            "Use deque for efficient operations at both ends",
            "Consider circular queue for fixed-size scenarios",
            "BFS = Queue, DFS = Stack",
            "Priority queue for weighted scenarios",
        ],
        relatedStructures: ["Deque", "Priority Queue", "Circular Queue"],
    },
    {
        id: "hash-table",
        name: "Hash Map (Hash Table)",
        category: "hash",
        icon: Hash,
        difficulty: "Medium",
        description: "Key-value pairs using hash function for O(1) average access, insertion, and deletion",
        detailedDescription: "Hash tables use a hash function to compute an index into an array of buckets. They provide average O(1) time for search, insert, and delete operations.  Collision handling (chaining or open addressing) is crucial.",
        timeComplexity: {
            search: { avg: "O(1)", worst: "O(n)" },
            insertion: { avg: "O(1)", worst: "O(n)" },
            deletion: { avg: "O(1)", worst: "O(n)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Database indexing",
            "Caching",
            "Symbol tables",
            "Counting frequencies",
            "Finding duplicates",
            "Two sum type problems",
        ],
        pros: [
            "O(1) average operations",
            "Flexible keys",
            "Great for lookups",
            "Counting and grouping",
        ],
        cons: [
            "No ordering",
            "Hash collisions",
            "Memory overhead",
            "Worst case O(n)",
            "Not cache friendly",
        ],
        operations: [
            { name: "Insert", complexity: "O(1)*", code: "map.set(key, value)" },
            { name: "Search", complexity: "O(1)*", code: "map.get(key)" },
            { name: "Delete", complexity: "O(1)*", code: "map.delete(key)" },
            { name: "Contains", complexity: "O(1)*", code: "map.has(key)" },
        ],
        codeExample: {
            cpp: `#include <unordered_map>
#include <vector>
using namespace std;

// Two Sum
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.count(complement)) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}`,
            python: `def twoSum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`,
            javascript: `// JavaScript Map/Object
const map = new Map();

// Insert - O(1)
map.set('name', 'John');
map.set('age', 30);

// Search - O(1)
console.log(map.get('name')); // John

// Check existence - O(1)
console.log(map.has('age')); // true

// Delete - O(1)
map.delete('age');

// Two Sum using Hash Map
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Frequency Counter
function charFrequency(str) {
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}`,
        },
        interviewQuestions: [
            "Two Sum",
            "Group Anagrams",
            "Longest Substring Without Repeating Characters",
            "First Unique Character",
            "Valid Anagram",
            "LRU Cache implementation",
        ],
        tips: [
            "Always consider hash map for O(1) lookup needs",
            "Use for counting/frequency problems",
            "Combine with other structures (hash + heap)",
            "Consider load factor for performance",
        ],
        relatedStructures: ["Hash Set", "LRU Cache", "Bloom Filter"],
    },
    {
        id: "binary-tree",
        name: "Binary Tree",
        category: "tree",
        icon: TreePine,
        difficulty: "Medium",
        description: "Hierarchical structure where each node has at most two children (left and right)",
        detailedDescription: "A binary tree is a tree data structure where each node has at most two children. It's the foundation for BST, heaps, and many other tree structures.  Traversals (inorder, preorder, postorder) are fundamental operations.",
        timeComplexity: {
            access: { avg: "O(n)", worst: "O(n)" },
            search: { avg: "O(n)", worst: "O(n)" },
            insertion: { avg: "O(n)", worst: "O(n)" },
            deletion: { avg: "O(n)", worst: "O(n)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Expression trees",
            "Hierarchical data",
            "Decision trees",
            "File systems",
            "HTML DOM",
        ],
        pros: [
            "Hierarchical representation",
            "Foundation for advanced trees",
            "Natural recursive structure",
            "Efficient for certain queries",
        ],
        cons: [
            "Can become unbalanced",
            "O(n) worst case operations",
            "More complex than linear structures",
        ],
        operations: [
            { name: "Inorder Traversal", complexity: "O(n)", code: "left → root → right" },
            { name: "Preorder Traversal", complexity: "O(n)", code: "root → left → right" },
            { name: "Postorder Traversal", complexity: "O(n)", code: "left → right → root" },
            { name: "Level Order (BFS)", complexity: "O(n)", code: "level by level" },
            { name: "Height", complexity: "O(n)", code: "1 + max(left, right)" },
        ],
        codeExample: {
            cpp: `struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

// DFS Inorder
void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}`,
            python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)`,
            javascript: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// Inorder Traversal (Left, Root, Right)
function inorder(root, result = []) {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val);
  inorder(root.right, result);
  return result;
}

// Preorder Traversal (Root, Left, Right)
function preorder(root, result = []) {
  if (!root) return result;
  result.push(root.val);
  preorder(root.left, result);
  preorder(root.right, result);
  return result;
}

// Level Order Traversal (BFS)
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const level = [];
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

// Tree Height
function height(root) {
  if (!root) return 0;
  return 1 + Math.max(height(root.left), height(root.right));
}`,
        },
        interviewQuestions: [
            "Maximum depth of binary tree",
            "Invert binary tree",
            "Same tree",
            "Symmetric tree",
            "Path sum",
            "Serialize and deserialize binary tree",
        ],
        tips: [
            "Most tree problems are recursive",
            "Think about base case first",
            "Consider traversal order for the problem",
            "Use BFS for level-related problems",
        ],
        relatedStructures: ["BST", "AVL Tree", "Heap", "Trie"],
    },
    {
        id: "bst",
        name: "Binary Search Tree",
        category: "tree",
        icon: TreePine,
        difficulty: "Medium",
        description: "Binary tree with ordering property:  left < root < right, enabling efficient search",
        detailedDescription: "A BST maintains the property that all nodes in the left subtree are smaller than the root, and all nodes in the right subtree are greater.  This enables O(log n) search, insert, and delete on average.",
        timeComplexity: {
            access: { avg: "O(log n)", worst: "O(n)" },
            search: { avg: "O(log n)", worst: "O(n)" },
            insertion: { avg: "O(log n)", worst: "O(n)" },
            deletion: { avg: "O(log n)", worst: "O(n)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Sorted data maintenance",
            "Range queries",
            "Finding kth element",
            "Database indexing",
            "Auto-complete",
        ],
        pros: [
            "O(log n) average operations",
            "Ordered traversal",
            "Range queries",
            "Dynamic size",
        ],
        cons: [
            "Can degrade to O(n)",
            "No guarantee of balance",
            "More complex than hash table",
        ],
        operations: [
            { name: "Search", complexity: "O(log n)*", code: "compare and traverse" },
            { name: "Insert", complexity: "O(log n)*", code: "find position, insert" },
            { name: "Delete", complexity: "O(log n)*", code: "3 cases handling" },
            { name: "Inorder (sorted)", complexity: "O(n)", code: "left → root → right" },
            { name: "Find Min/Max", complexity: "O(log n)*", code: "leftmost/rightmost" },
        ],
        codeExample: {
            cpp: `struct BSTNode {
    int val;
    BSTNode *left;
    BSTNode *right;
    BSTNode(int x) : val(x), left(NULL), right(NULL) {}
};

class BST {
public:
    BSTNode* root;
    BST() : root(NULL) {}

    BSTNode* insert(BSTNode* node, int val) {
        if (!node) return new BSTNode(val);
        if (val < node->val) node->left = insert(node->left, val);
        else node->right = insert(node->right, val);
        return node;
    }

    BSTNode* search(BSTNode* node, int val) {
        if (!node || node->val == val) return node;
        if (val < node->val) return search(node->left, val);
        return search(node->right, val);
    }
};`,
            python: `class BSTNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, root, val):
        if not root:
            return BSTNode(val)
        if val < root.val:
            root.left = self.insert(root.left, val)
        else:
            root.right = self.insert(root.right, val)
        return root

    def search(self, root, val):
        if not root or root.val == val:
            return root
        if val < root.val:
            return self.search(root.left, val)
        return self.search(root.right, val)`,
            javascript: `class BSTNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }
  
  // Insert - O(log n) average
  insert(val) {
    this.root = this._insertRec(this.root, val);
  }
  
  _insertRec(node, val) {
    if (!node) return new BSTNode(val);
    
    if (val < node.val) {
      node.left = this._insertRec(node.left, val);
    } else if (val > node. val) {
      node.right = this._insertRec(node.right, val);
    }
    return node;
  }
  
  // Search - O(log n) average
  search(val) {
    return this._searchRec(this.root, val);
  }
  
  _searchRec(node, val) {
    if (!node || node.val === val) return node;
    
    if (val < node.val) {
      return this._searchRec(node.left, val);
    }
    return this._searchRec(node.right, val);
  }
  
  // Find minimum
  findMin(node = this.root) {
    while (node && node.left) {
      node = node.left;
    }
    return node;
  }
  
  // Validate BST
  isValidBST(node = this.root, min = -Infinity, max = Infinity) {
    if (!node) return true;
    if (node.val <= min || node.val >= max) return false;
    return this. isValidBST(node.left, min, node.val) && 
           this.isValidBST(node.right, node.val, max);
  }
}`,
        },
        interviewQuestions: [
            "Validate Binary Search Tree",
            "Kth Smallest Element in BST",
            "Lowest Common Ancestor of BST",
            "Convert Sorted Array to BST",
            "Delete Node in BST",
            "Inorder Successor in BST",
        ],
        tips: [
            "Inorder traversal gives sorted order",
            "Use BST property for efficient search",
            "Consider self-balancing trees for guaranteed O(log n)",
            "Handle three cases for deletion carefully",
        ],
        relatedStructures: ["AVL Tree", "Red-Black Tree", "B-Tree"],
    },
    {
        id: "heap",
        name: "Heap / Priority Queue",
        category: "tree",
        icon: TrendingUp,
        difficulty: "Medium",
        description: "Complete binary tree satisfying heap property - parent is always greater (max) or smaller (min) than children",
        detailedDescription: "A heap is a complete binary tree where parent nodes satisfy the heap property. Min-heap:  parent ≤ children.  Max-heap: parent ≥ children.  Commonly used to implement priority queues.",
        timeComplexity: {
            "find-min/max": { avg: "O(1)", worst: "O(1)" },
            insertion: { avg: "O(log n)", worst: "O(log n)" },
            "delete-min/max": { avg: "O(log n)", worst: "O(log n)" },
            heapify: { avg: "O(n)", worst: "O(n)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Priority queues",
            "Heap sort",
            "Kth largest/smallest",
            "Merge K sorted lists",
            "Dijkstra's algorithm",
            "Median finding",
        ],
        pros: [
            "O(1) access to min/max",
            "O(log n) insert/delete",
            "Complete tree (array-friendly)",
            "In-place sorting possible",
        ],
        cons: [
            "O(n) search",
            "Not stable",
            "Slower than hash for lookups",
        ],
        operations: [
            { name: "Get Min/Max", complexity: "O(1)", code: "heap[0]" },
            { name: "Insert", complexity: "O(log n)", code: "push + heapify up" },
            { name: "Extract Min/Max", complexity: "O(log n)", code: "pop + heapify down" },
            { name: "Build Heap", complexity: "O(n)", code: "heapify from n/2 to 0" },
            { name: "Heap Sort", complexity: "O(n log n)", code: "build + extract all" },
        ],
        codeExample: {
            cpp: `#include <vector>
#include <queue>
using namespace std;

// Min Heap using priority_queue (default is Max Heap, use greater for Min)
// priority_queue<int, vector<int>, greater<int>> minHeap;

class MinHeap {
    vector<int> heap;
    int parent(int i) { return (i - 1) / 2; }
    int left(int i) { return 2 * i + 1; }
    int right(int i) { return 2 * i + 2; }

public:
    void insert(int val) {
        heap.push_back(val);
        int i = heap.size() - 1;
        while (i > 0 && heap[parent(i)] > heap[i]) {
            swap(heap[i], heap[parent(i)]);
            i = parent(i);
        }
    }

    int extractMin() {
        if (heap.empty()) return -1;
        int root = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        // heapifyDown logic simplified
        return root;
    }
};`,
            python: `import heapq

# Python uses min-heap by default
min_heap = []

# Insert - O(log n)
heapq.heappush(min_heap, 10)
heapq.heappush(min_heap, 1)
heapq.heappush(min_heap, 5)

# Extract Min - O(log n)
smallest = heapq.heappop(min_heap) # 1

# Peek - O(1)
top = min_heap[0] # 5`,
            javascript: `class MinHeap {
  constructor() {
    this.heap = [];
  }
  
  parent(i) { return Math.floor((i - 1) / 2); }
  leftChild(i) { return 2 * i + 1; }
  rightChild(i) { return 2 * i + 2; }
  
  // Insert - O(log n)
  insert(val) {
    this.heap.push(val);
    this.heapifyUp(this.heap.length - 1);
  }
  
  heapifyUp(i) {
    while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
      [this.heap[this.parent(i)], this.heap[i]] = 
        [this.heap[i], this.heap[this.parent(i)]];
      i = this.parent(i);
    }
  }
  
  // Extract Min - O(log n)
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }
  
  heapifyDown(i) {
    let smallest = i;
    const left = this.leftChild(i);
    const right = this.rightChild(i);
    
    if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
      smallest = left;
    }
    if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
      smallest = right;
    }
    
    if (smallest !== i) {
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      this.heapifyDown(smallest);
    }
  }
  
  peek() { return this.heap[0]; }
  size() { return this.heap.length; }
}

// Find Kth Largest Element
function findKthLargest(nums, k) {
  const minHeap = new MinHeap();
  for (let num of nums) {
    minHeap.insert(num);
    if (minHeap.size() > k) {
      minHeap.extractMin();
    }
  }
  return minHeap.peek();
}`,
        },
        interviewQuestions: [
            "Kth Largest Element in Array",
            "Merge K Sorted Lists",
            "Find Median from Data Stream",
            "Top K Frequent Elements",
            "Task Scheduler",
            "Reorganize String",
        ],
        tips: [
            "Use min-heap for kth largest, max-heap for kth smallest",
            "Two heaps for median problems",
            "Heap is natural choice for 'top K' problems",
            "Array representation: parent = (i-1)/2, children = 2i+1, 2i+2",
        ],
        relatedStructures: ["Fibonacci Heap", "Binomial Heap", "Priority Queue"],
    },
    {
        id: "graph",
        name: "Graph",
        category: "graph",
        icon: Network,
        difficulty: "Hard",
        description: "Non-linear structure with vertices (nodes) connected by edges, can be directed or undirected",
        detailedDescription: "Graphs consist of vertices and edges connecting them. They can be directed/undirected, weighted/unweighted, cyclic/acyclic. Represented using adjacency list or matrix. Foundation for many algorithms.",
        timeComplexity: {
            "add vertex": { avg: "O(1)", worst: "O(1)" },
            "add edge": { avg: "O(1)", worst: "O(1)" },
            "remove vertex": { avg: "O(V + E)", worst: "O(V + E)" },
            "remove edge": { avg: "O(E)", worst: "O(E)" },
            "BFS/DFS": { avg: "O(V + E)", worst: "O(V + E)" },
        },
        spaceComplexity: "O(V + E) list, O(V²) matrix",
        useCases: [
            "Social networks",
            "Maps and navigation",
            "Web page linking",
            "Dependency resolution",
            "Network routing",
            "Recommendation systems",
        ],
        pros: [
            "Models relationships naturally",
            "Flexible structure",
            "Many powerful algorithms",
            "Real-world applications",
        ],
        cons: [
            "Complex implementation",
            "Space intensive",
            "Some algorithms are expensive",
        ],
        operations: [
            { name: "BFS", complexity: "O(V + E)", code: "queue-based traversal" },
            { name: "DFS", complexity: "O(V + E)", code: "stack/recursion traversal" },
            { name: "Dijkstra", complexity: "O((V+E) log V)", code: "shortest path" },
            { name: "Topological Sort", complexity: "O(V + E)", code: "DAG ordering" },
            { name: "Detect Cycle", complexity: "O(V + E)", code: "DFS coloring" },
        ],
        codeExample: {
            cpp: `#include <vector>
#include <queue>
using namespace std;

class Graph {
    int V;
    vector<vector<int>> adj;

public:
    Graph(int V) : V(V), adj(V) {}

    void addEdge(int v, int w) {
        adj[v].push_back(w);
    }

    void BFS(int s) {
        vector<bool> visited(V, false);
        queue<int> q;
        visited[s] = true;
        q.push(s);

        while(!q.empty()) {
            s = q.front();
            q.pop();
            // Process s
            for(auto i : adj[s]) {
                if(!visited[i]) {
                    visited[i] = true;
                    q.push(i);
                }
            }
        }
    }
};`,
            python: `from collections import defaultdict, deque

class Graph:
    def __init__(self):
        self.graph = defaultdict(list)

    def add_edge(self, u, v):
        self.graph[u].append(v)

    def bfs(self, s):
        visited = set()
        queue = deque([s])
        visited.add(s)

        while queue:
            s = queue.popleft()
            # Process s
            for i in self.graph[s]:
                if i not in visited:
                    queue.append(i)
                    visited.add(i)`,
            javascript: `class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }
  
  addVertex(v) {
    if (!this.adjacencyList.has(v)) {
      this.adjacencyList.set(v, []);
    }
  }
  
  addEdge(v1, v2, weight = 1) {
    this.adjacencyList.get(v1).push({ node: v2, weight });
    this.adjacencyList.get(v2).push({ node: v1, weight }); // undirected
  }
  
  // BFS - O(V + E)
  bfs(start) {
    const visited = new Set();
    const queue = [start];
    const result = [];
    
    visited.add(start);
    
    while (queue.length > 0) {
      const vertex = queue.shift();
      result.push(vertex);
      
      for (let neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          queue.push(neighbor.node);
        }
      }
    }
    return result;
  }
  
  // DFS - O(V + E)
  dfs(start) {
    const visited = new Set();
    const result = [];
    
    const dfsHelper = (vertex) => {
      visited.add(vertex);
      result.push(vertex);
      
      for (let neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor.node)) {
          dfsHelper(neighbor.node);
        }
      }
    };
    
    dfsHelper(start);
    return result;
  }
  
  // Detect Cycle (undirected)
  hasCycle() {
    const visited = new Set();
    
    const dfs = (vertex, parent) => {
      visited.add(vertex);
      
      for (let neighbor of this.adjacencyList.get(vertex)) {
        if (!visited.has(neighbor.node)) {
          if (dfs(neighbor.node, vertex)) return true;
        } else if (neighbor.node !== parent) {
          return true;
        }
      }
      return false;
    };
    
    for (let vertex of this.adjacencyList.keys()) {
      if (!visited.has(vertex)) {
        if (dfs(vertex, null)) return true;
      }
    }
    return false;
  }
}`,
        },
        interviewQuestions: [
            "Number of Islands",
            "Clone Graph",
            "Course Schedule (cycle detection)",
            "Word Ladder",
            "Network Delay Time (Dijkstra)",
            "Shortest Path in Binary Matrix",
        ],
        tips: [
            "Adjacency list for sparse graphs, matrix for dense",
            "BFS for shortest path (unweighted)",
            "DFS for connectivity and cycle detection",
            "Topological sort for dependencies",
        ],
        relatedStructures: ["Directed Graph", "Weighted Graph", "Tree", "DAG"],
    },
    {
        id: "trie",
        name: "Trie (Prefix Tree)",
        category: "tree",
        icon: Binary,
        difficulty: "Medium",
        description: "Tree structure for efficient string prefix operations and autocomplete functionality",
        detailedDescription: "A Trie is a tree-like structure where each node represents a character.  Paths from root to nodes form prefixes. Extremely efficient for prefix-based operations, autocomplete, and dictionary implementations.",
        timeComplexity: {
            insert: { avg: "O(m)", worst: "O(m)" },
            search: { avg: "O(m)", worst: "O(m)" },
            "prefix search": { avg: "O(m)", worst: "O(m)" },
            delete: { avg: "O(m)", worst: "O(m)" },
        },
        spaceComplexity: "O(alphabet × m × n)",
        useCases: [
            "Autocomplete",
            "Spell checker",
            "IP routing",
            "Word games",
            "Dictionary lookup",
            "Prefix matching",
        ],
        pros: [
            "O(m) operations (m = word length)",
            "Prefix operations",
            "Alphabetical ordering",
            "No hash collisions",
        ],
        cons: [
            "High space usage",
            "Complex implementation",
            "Not ideal for non-string keys",
        ],
        operations: [
            { name: "Insert word", complexity: "O(m)", code: "traverse/create nodes" },
            { name: "Search word", complexity: "O(m)", code: "traverse and check" },
            { name: "Starts with prefix", complexity: "O(m)", code: "traverse prefix" },
            { name: "Delete word", complexity: "O(m)", code: "traverse and mark" },
        ],
        codeExample: {
            cpp: `struct TrieNode {
    TrieNode *children[26];
    bool isEndOfWord;
    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++) children[i] = NULL;
    }
};

class Trie {
    TrieNode* root;
public:
    Trie() { root = new TrieNode(); }
    
    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            if (!node->children[c - 'a'])
                node->children[c - 'a'] = new TrieNode();
            node = node->children[c - 'a'];
        }
        node->isEndOfWord = true;
    }
    
    bool search(string word) {
        TrieNode* node = root;
        for (char c : word) {
            if (!node->children[c - 'a']) return false;
            node = node->children[c - 'a'];
        }
        return node->isEndOfWord;
    }
};`,
            python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True

    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end_of_word`,
            javascript: `class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }
  
  // Insert - O(m)
  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEndOfWord = true;
  }
  
  // Search - O(m)
  search(word) {
    let node = this.root;
    for (let char of word) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char);
    }
    return node.isEndOfWord;
  }
  
  // Starts With - O(m)
  startsWith(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char);
    }
    return true;
  }
  
  // Get all words with prefix
  getWordsWithPrefix(prefix) {
    const result = [];
    let node = this.root;
    
    for (let char of prefix) {
      if (!node.children.has(char)) return result;
      node = node.children.get(char);
    }
    
    const dfs = (node, path) => {
      if (node.isEndOfWord) result.push(path);
      for (let [char, child] of node.children) {
        dfs(child, path + char);
      }
    };
    
    dfs(node, prefix);
    return result;
  }
}`,
        },
        interviewQuestions: [
            "Implement Trie",
            "Word Search II",
            "Design Add and Search Words",
            "Replace Words",
            "Longest Word in Dictionary",
            "Search Suggestions System",
        ],
        tips: [
            "Use array of size 26 for lowercase English letters",
            "Consider compressed tries for space optimization",
            "Combine with DFS for word problems",
            "Track additional metadata at nodes if needed",
        ],
        relatedStructures: ["Suffix Tree", "Radix Tree", "Suffix Array"],
    },
    {
        id: "disjoint-set",
        name: "Disjoint Set (Union-Find)",
        category: "tree",
        icon: Network,
        difficulty: "Hard",
        description: "Data structure that tracks a set of elements partitioned into a number of disjoint (non-overlapping) subsets",
        detailedDescription: "Union-Find data structure provides near-constant time operations to add new sets, merge existing sets, and determine whether elements are in the same set. Essential for Kruskal's algorithm and finding connected components.",
        timeComplexity: {
            union: { avg: "O(α(n))", worst: "O(α(n))" },
            find: { avg: "O(α(n))", worst: "O(α(n))" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Kruskal's Algorithm (MST)",
            "Cycle detection in undirected graphs",
            "Connected components",
            "Percolation problems",
            "Image processing (labeling)",
        ],
        pros: [
            "Extremely fast operations (amortized)",
            "Simple to implement",
            "Memory efficient",
        ],
        cons: [
            "Supports only specific operations (union, find)",
            "Path compression needed for efficiency",
        ],
        operations: [
            { name: "Find", complexity: "O(α(n))", code: "find(x)" },
            { name: "Union", complexity: "O(α(n))", code: "union(x, y)" },
        ],
        codeExample: {
            cpp: `#include <vector>
#include <numeric>
using namespace std;

class UnionFind {
    vector<int> parent;
    vector<int> rank;
public:
    UnionFind(int n) {
        parent.resize(n);
        iota(parent.begin(), parent.end(), 0); // 0, 1, 2...
        rank.resize(n, 0);
    }
    
    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // Path compression
        }
        return parent[x];
    }
    
    bool unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        
        if (rootX != rootY) {
            if (rank[rootX] < rank[rootY]) parent[rootX] = rootY;
            else if (rank[rootX] > rank[rootY]) parent[rootY] = rootX;
            else {
                parent[rootY] = rootX;
                rank[rootX]++;
            }
            return true;
        }
        return false;
    }
};`,
            python: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x]) # Path compression
        return self.parent[x]

    def union(self, x, y):
        rootX = self.find(x)
        rootY = self.find(y)

        if rootX != rootY:
            if self.rank[rootX] < self.rank[rootY]:
                self.parent[rootX] = rootY
            elif self.rank[rootX] > self.rank[rootY]:
                self.parent[rootY] = rootX
            else:
                self.parent[rootY] = rootX
                self.rank[rootX] += 1
            return True
        return False`,
            javascript: `class UnionFind {
  constructor(n) {
    this.parent = Array(n).fill(0).map((_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    let rootX = this.find(x);
    let rootY = this.find(y);

    if (rootX !== rootY) {
      if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY;
      } else if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX;
      } else {
        this.parent[rootY] = rootX;
        this.rank[rootX]++;
      }
      return true;
    }
    return false;
  }
}`,
        },
        interviewQuestions: [
            "Number of Provinces",
            "Redundant Connection",
            "Accounts Merge",
            "Longest Consecutive Sequence",
            "Most Stones Removed with Same Row or Column",
        ],
        tips: [
            "Use path compression and union by rank/size",
            "α(n) is Inverse Ackermann function (≤ 4 for all practical n)",
            "Great for dynamic connectivity problems",
        ],
        relatedStructures: ["Graph", "Tree"],
    },
    {
        id: "deque",
        name: "Deque (Double-Ended Queue)",
        category: "linear",
        icon: ArrowRight,
        difficulty: "Medium",
        description: "Generalized queue that supports insertion and deletion from both the front and the rear",
        detailedDescription: "A Deque (Double-Ended Queue) allows operations at both ends. It can function as both a queue and a stack. Efficient for sliding window problems.",
        timeComplexity: {
            access: { avg: "O(n)", worst: "O(n)" },
            search: { avg: "O(n)", worst: "O(n)" },
            insertion: { avg: "O(1)", worst: "O(1)" },
            deletion: { avg: "O(1)", worst: "O(1)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Sliding window maximum",
            "Palindrome checking",
            "Undo/Redo functionality",
            "Job scheduling (stealing work)",
        ],
        pros: [
            "O(1) operations at both ends",
            "Versatile (Stack + Queue)",
        ],
        cons: [
            "No random access (usually)",
            "More complex than Stack/Queue",
        ],
        operations: [
            { name: "Push Front", complexity: "O(1)", code: "unshift(x)" },
            { name: "Push Back", complexity: "O(1)", code: "push(x)" },
            { name: "Pop Front", complexity: "O(1)", code: "shift()" },
            { name: "Pop Back", complexity: "O(1)", code: "pop()" },
        ],
        codeExample: {
            cpp: `#include <deque>
#include <vector>
using namespace std;

// Sliding Window Maximum
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> result;
    
    for (int i = 0; i < nums.size(); i++) {
        if (!dq.empty() && dq.front() == i - k) 
            dq.pop_front();
            
        while (!dq.empty() && nums[dq.back()] < nums[i])
            dq.pop_back();
            
        dq.push_back(i);
        
        if (i >= k - 1)
            result.push_back(nums[dq.front()]);
    }
    return result;
}`,
            python: `from collections import deque

# Sliding Window Maximum
def maxSlidingWindow(nums, k):
    dq = deque()
    result = []
    
    for i in range(len(nums)):
        if dq and dq[0] == i - k:
            dq.popleft()
            
        while dq and nums[dq[-1]] < nums[i]:
            dq.pop()
            
        dq.append(i)
        
        if i >= k - 1:
            result.append(nums[dq[0]])
            
    return result`,
            javascript: `// Using Array as Deque (not optimal for large inputs in JS)
const deque = [];

// Add to rear
deque.push(1);
// Add to front
deque.unshift(2);

// Remove from rear
deque.pop(); 
// Remove from front
deque.shift();

// Sliding Window Max using Deque
function maxSlidingWindow(nums, k) {
  const deque = []; // Stores indices
  const result = [];
  
  for (let i = 0; i < nums.length; i++) {
    // Remove indices out of window
    while (deque.length && deque[0] < i - k + 1) {
      deque.shift();
    }
    // Remove smaller elements
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }
    deque.push(i);
    
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }
  return result;
}`,
        },
        interviewQuestions: [
            "Sliding Window Maximum",
            "Shortest Subarray with Sum at Least K",
            "Design Circular Deque",
            "Zigzag Iterator",
        ],
        tips: [
            "Critical for O(n) sliding window solutions",
            "In JS, shift/unshift are O(n), for performance use a linked list or custom implementation",
        ],
        relatedStructures: ["Queue", "Stack", "Doubly Linked List"],
    },
    {
        id: "segment-tree",
        name: "Segment Tree",
        category: "tree",
        icon: TreePine,
        difficulty: "Hard",
        description: "Tree data structure used for storing information about intervals or segments",
        detailedDescription: "A Segment Tree allows querying which of the stored segments contain a given point. It is principally used for range query problems (e.g., sum, min, max over a range) where updates are also frequent.",
        timeComplexity: {
            "build": { avg: "O(n)", worst: "O(n)" },
            "query": { avg: "O(log n)", worst: "O(log n)" },
            "update": { avg: "O(log n)", worst: "O(log n)" },
        },
        spaceComplexity: "O(4n)",
        useCases: [
            "Range Sum/Min/Max Queries",
            "Range Updates (Lazy Propagation)",
            "Computational Geometry",
            "Counting inversions (variant)",
        ],
        pros: [
            "Efficient range queries and updates",
            "Flexible for various operations (sum, gcd, min)",
        ],
        cons: [
            "High memory usage (4n)",
            "Complex implementation (esp. with Lazy Propagation)",
        ],
        operations: [
            { name: "Build", complexity: "O(n)", code: "build(1, 0, n-1)" },
            { name: "Query", complexity: "O(log n)", code: "query(1, 0, n-1, l, r)" },
            { name: "Update", complexity: "O(log n)", code: "update(1, 0, n-1, idx, val)" },
        ],
        codeExample: {
            cpp: `#include <vector>
using namespace std;

class SegmentTree {
    vector<int> tree;
    int n;
public:
    SegmentTree(vector<int>& arr) {
        n = arr.size();
        tree.resize(4 * n);
        build(arr, 1, 0, n - 1);
    }

    void build(vector<int>& arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
        } else {
            int mid = (start + end) / 2;
            build(arr, 2 * node, start, mid);
            build(arr, 2 * node + 1, mid + 1, end);
            tree[node] = tree[2 * node] + tree[2 * node + 1];
        }
    }

    int query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = (start + end) / 2;
        return query(2 * node, start, mid, l, r) + query(2 * node + 1, mid + 1, end, l, r);
    }
};`,
            python: `class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.build(arr, 1, 0, self.n - 1)

    def build(self, arr, node, start, end):
        if start == end:
            self.tree[node] = arr[start]
        else:
            mid = (start + end) // 2
            self.build(arr, 2 * node, start, mid)
            self.build(arr, 2 * node + 1, mid + 1, end)
            self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, node, start, end, l, r):
        if r < start or end < l:
            return 0
        if l <= start and end <= r:
            return self.tree[node]
        mid = (start + end) // 2
        return self.query(2 * node, start, mid, l, r) + \\
               self.query(2 * node + 1, mid + 1, end, l, r)`,
            javascript: `class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.build(arr, 1, 0, this.n - 1);
  }

  build(arr, node, start, end) {
    if (start === end) {
      this.tree[node] = arr[start];
    } else {
      let mid = Math.floor((start + end) / 2);
      this.build(arr, 2 * node, start, mid);
      this.build(arr, 2 * node + 1, mid + 1, end);
      this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
    }
  }

  query(node, start, end, l, r) {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return this.tree[node];
    
    let mid = Math.floor((start + end) / 2);
    let p1 = this.query(2 * node, start, mid, l, r);
    let p2 = this.query(2 * node + 1, mid + 1, end, l, r);
    return p1 + p2;
  }
}`,
        },
        interviewQuestions: [
            "Range Sum Query - Mutable",
            "Count of Range Sum",
            "Skyline Problem",
            "Rectangle Area II",
        ],
        tips: [
            "Array size should be 4*n",
            "Use Lazy Propagation for range updates",
            "Binary Index Tree is simpler for prefix sums",
        ],
        relatedStructures: ["Fenwick Tree", "Binary Tree", "Interval Tree"],
    },
    {
        id: "fenwick-tree",
        name: "Fenwick Tree (Binary Indexed Tree)",
        category: "tree",
        icon: GitBranch,
        difficulty: "Hard",
        description: "Data structure that can efficiently update elements and calculate prefix sums in a table of numbers",
        detailedDescription: "A Fenwick Tree (or BIT) is used to perform range sum queries and point updates efficiently. It is easier to implement and uses less space than a Segment Tree, but is generally less flexible.",
        timeComplexity: {
            "build": { avg: "O(n log n)", worst: "O(n log n)" },
            "query": { avg: "O(log n)", worst: "O(log n)" },
            "update": { avg: "O(log n)", worst: "O(log n)" },
        },
        spaceComplexity: "O(n)",
        useCases: [
            "Range Sum Queries",
            "Counting Inversions",
            "Cumulative frequencies",
        ],
        pros: [
            "Space efficient (O(n))",
            "Easier to implement than Segment Tree",
            "Fast constant factors",
        ],
        cons: [
            "Less flexible than Segment Tree (mostly prefix sums)",
            "Cannot do range updates efficiently without modifications",
        ],
        operations: [
            { name: "Update", complexity: "O(log n)", code: "update(i, delta)" },
            { name: "Query (Prefix Sum)", complexity: "O(log n)", code: "query(i)" },
        ],
        codeExample: {
            cpp: `#include <vector>
using namespace std;

class FenwickTree {
    vector<int> tree;
    int n;
public:
    FenwickTree(int n) : n(n) {
        tree.assign(n + 1, 0);
    }

    void update(int i, int delta) {
        i++; // 1-based
        while(i <= n) {
            tree[i] += delta;
            i += i & (-i);
        }
    }

    int query(int i) {
        i++; // 1-based
        int sum = 0;
        while(i > 0) {
            sum += tree[i];
            i -= i & (-i);
        }
        return sum;
    }
};`,
            python: `class FenwickTree:
    def __init__(self, size):
        self.tree = [0] * (size + 1)

    def update(self, i, delta):
        i += 1  # 1-based indexing
        while i < len(self.tree):
            self.tree[i] += delta
            i += i & (-i)

    def query(self, i):
        i += 1  # 1-based indexing
        sum_val = 0
        while i > 0:
            sum_val += self.tree[i]
            i -= i & (-i)
        return sum_val`,
            javascript: `class FenwickTree {
  constructor(size) {
    this.tree = new Array(size + 1).fill(0);
  }

  update(i, delta) {
    i++; // 1-based indexing
    while (i < this.tree.length) {
      this.tree[i] += delta;
      i += i & (-i);
    }
  }

  query(i) {
    i++; // 1-based indexing
    let sum = 0;
    while (i > 0) {
      sum += this.tree[i];
      i -= i & (-i);
    }
    return sum;
  }
}`,
        },
        interviewQuestions: [
            "Range Sum Query - Mutable",
            "Count Smaller Numbers After Self",
            "Reverse Pairs",
        ],
        tips: [
            "Uses 1-based indexing heavily",
            "Extracting last set bit: i & (-i)",
            "Can calculate range sum [L, R] as query(R) - query(L-1)",
        ],
        relatedStructures: ["Segment Tree", "Array"],
    },
];
