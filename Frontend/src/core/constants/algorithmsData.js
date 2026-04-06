import {
    Search,
    Layers,
    Route,
    ArrowUpDown,
    Zap,
    Grid3X3,
    Workflow,
    Boxes,
    ArrowRight,
    Lightbulb,
    Binary,
    MousePointer2,
    ChartBar,
    Target,
    GitBranch,
    Hash,
    List,
    Repeat,
    Network,
    Cpu,
    Check,
    X,
    Filter,
    Hexagon,
    TrendingUp,
    RotateCw,
    Calculator,
    Flag,
    Link,
    Merge,
    Trash,
    ArrowRightLeft,
} from "lucide-react";

const rawAlgorithms = [
    {
        id: "binary-search",
        name: "Binary Search",
        category: "searching",
        icon: Search,
        difficulty: "Easy",
        description: "Efficient search algorithm for sorted arrays by repeatedly dividing search space in half",
        detailedDescription: "Binary search works on sorted arrays by comparing the target with the middle element.  If not equal, it eliminates half of the remaining elements.  This gives O(log n) time complexity.",
        timeComplexity: { avg: "O(log n)", worst: "O(log n)", best: "O(1)" },
        spaceComplexity: { iterative: "O(1)", recursive: "O(log n)" },
        prerequisites: ["Sorted array"],
        steps: [
            "Initialize left = 0, right = n - 1",
            "While left <= right:",
            "  Calculate mid = left + (right - left) / 2",
            "  If arr[mid] == target, return mid",
            "  If arr[mid] < target, left = mid + 1",
            "  Else right = mid - 1",
            "Return -1 (not found)",
        ],
        codeExample: {
            javascript: `// Iterative Binary Search
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// Find first occurrence
function lowerBound(arr, target) {
  let left = 0, right = arr.length;
  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

// Find last occurrence
function upperBound(arr, target) {
  let left = 0, right = arr.length;
  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (arr[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left - 1;
}`,
        },
        variations: [
            { name: "Lower Bound", desc: "First element >= target" },
            { name: "Upper Bound", desc: "First element > target" },
            { name: "Search in Rotated Array", desc: "Modified binary search" },
            { name: "Binary Search on Answer", desc: "Search for optimal value" },
        ],
        interviewQuestions: [
            "Search in Rotated Sorted Array",
            "Find First and Last Position",
            "Search a 2D Matrix",
            "Find Minimum in Rotated Sorted Array",
            "Peak Element",
            "Koko Eating Bananas",
        ],
        tips: [
            "Use left + (right - left) / 2 to avoid overflow",
            "Pay attention to left <= right vs left < right",
            "Consider boundary conditions carefully",
            "Binary search on answer for optimization problems",
        ],
    },
    {
        id: "linear-search",
        name: "Linear Search",
        category: "searching",
        icon: Search,
        difficulty: "Easy",
        description: "Simple search algorithm that checks every element in the list sequentially",
        detailedDescription: "Linear Search iterates through the entire list from the beginning, checking each element until the target is found or the list ends. It works on both sorted and unsorted lists.",
        timeComplexity: { avg: "O(n)", worst: "O(n)", best: "O(1)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Arrays"],
        steps: [
            "Start from the first element (index 0)",
            "Compare current element with target",
            "If match found, return index",
            "If not match, move to next element",
            "If end of array reached, return -1"
        ],
        codeExample: {
            javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`
        },
        variations: [
            { name: "Sentinel Search", desc: "Reduces number of comparisons" },
            { name: "Recursive Linear Search", desc: "Using recursion instead of loop" }
        ],
        interviewQuestions: ["Find the First Repeating Element", "Find Missing Number in Array"],
        tips: ["Use for small or unsorted arrays", "Don't use on large sorted arrays"]
    },
    {
        id: "jump-search",
        name: "Jump Search",
        category: "searching",
        icon: Search,
        difficulty: "Easy",
        description: "Search algorithm for sorted arrays that jumps ahead by fewer steps",
        detailedDescription: "Jump Search works on sorted arrays. It jumps ahead by a fixed block size (sqrt(n)) and if it passes the target, does a linear search in the previous block.",
        timeComplexity: { avg: "O(√n)", worst: "O(√n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Sorted Array"],
        steps: [
            "Determine block size m = sqrt(n)",
            "Jump forward by m until current element > target",
            "Perform linear search in the previous block",
            "Return index if found, else -1"
        ],
        codeExample: {
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
  
  if (arr[prev] === target) return prev;
  return -1;
}`
        },
        variations: [
            { name: "Variable Step Size", desc: "Adjusting step based on distribution" }
        ],
        interviewQuestions: ["Implement Jump Search", "Compare with Binary Search"],
        tips: ["Optimal step size is sqrt(n)", "Faster than linear but slower than binary search", "Good when jumping back is expensive"]
    },
    {
        id: "interpolation-search",
        name: "Interpolation Search",
        category: "searching",
        icon: Search,
        difficulty: "Medium",
        description: "Improved variant of Binary Search for uniformly distributed data",
        detailedDescription: "Interpolation Search estimates the position of the target values based on the value of the key being searched. It works best on uniformly distributed sorted arrays.",
        timeComplexity: { avg: "O(log log n)", worst: "O(n)", best: "O(1)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Sorted Array", "Uniform Distribution"],
        steps: [
            "Calculate pos using interpolation formula",
            "If arr[pos] == target, return pos",
            "If arr[pos] < target, search right sub-array",
            "If arr[pos] > target, search left sub-array"
        ],
        codeExample: {
            javascript: `function interpolationSearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      if (arr[low] === target) return low;
      return -1;
    }
    
    // Interpolation formula
    let pos = low + Math.floor(
      ((high - low) / (arr[high] - arr[low])) * 
      (target - arr[low])
    );
    
    if (arr[pos] === target) return pos;
    
    if (arr[pos] < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }
  return -1;
}`
        },
        variations: [
            { name: "Quadratic Interpolation", desc: "Using quadratic equation for estimation" }
        ],
        interviewQuestions: ["When to use Interpolation vs Binary Search?", "Worst case scenario"],
        tips: ["Only efficient for uniformly distributed data", "Worst case O(n) if distribution is skewed"]
    },
    {
        id: "exponential-search",
        name: "Exponential Search",
        category: "searching",
        icon: Search,
        difficulty: "Medium",
        description: "Finds range where element is present, then does Binary Search",
        detailedDescription: "Exponential Search is useful for unbounded or infinite arrays. It finds a range [i/2, i] where the target might be present and then performs a binary search within that range.",
        timeComplexity: { avg: "O(log n)", worst: "O(log n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Sorted Array", "Binary Search"],
        steps: [
            "If arr[0] == target, return 0",
            "Find range: i = 1, while arr[i] < target, i *= 2",
            "Perform binary search in range [i/2, min(i, n-1)]"
        ],
        codeExample: {
            javascript: `function exponentialSearch(arr, target) {
  const n = arr.length;
  if (arr[0] === target) return 0;
  
  let i = 1;
  while (i < n && arr[i] <= target) {
    i = i * 2;
  }
  
  return binarySearch(arr, target, i / 2, Math.min(i, n - 1));
}

function binarySearch(arr, target, left, right) {
  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`
        },
        variations: [
            { name: "Unbounded Binary Search", desc: "Searching in infinite array" }
        ],
        interviewQuestions: ["Search in Infinite Array", "Find position of element in infinite sorted array"],
        tips: ["Useful when array size is unknown", "Combination of bounding and binary search"]
    },
    {
        id: "bubble-sort",
        name: "Bubble Sort",
        category: "sorting",
        icon: ArrowUpDown,
        difficulty: "Easy",
        description: "Simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if in wrong order",
        detailedDescription: "Bubble Sort works by repeatedly swapping the adjacent elements if they are in the wrong order. This process is repeated until no swaps are needed, which indicates that the list is sorted.",
        timeComplexity: { avg: "O(n²)", worst: "O(n²)", best: "O(n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Loops", "Swapping"],
        steps: [
            "Loop through the array from 0 to n",
            "Inner loop from 0 to n-i-1",
            "If arr[j] > arr[j+1], swap them",
            "If no swaps in a pass, break (optimization)"
        ],
        codeExample: {
            javascript: `function bubbleSort(arr) {
  let n = arr.length;
  let swapped;
  for (let i = 0; i < n; i++) {
    swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}`
        },
        variations: [
            { name: "Cocktail Shaker Sort", desc: "Bidirectional bubble sort" },
            { name: "Odd-Even Sort", desc: "Parallelizable variant" }
        ],
        interviewQuestions: [
            "Implement Bubble Sort",
            "Bubble Sort Optimization",
            "Why is Bubble Sort not efficient?"
        ],
        tips: [
            "Only useful for small datasets or nearly sorted arrays",
            "Detect if array is sorted to end early"
        ]
    },
    {
        id: "insertion-sort",
        name: "Insertion Sort",
        category: "sorting",
        icon: List,
        difficulty: "Easy",
        description: "Builds the final sorted array one item at a time",
        detailedDescription: "Insertion sort iterates, consuming one input element each repetition, and growing a sorted output list. It effectively takes each element and inserts it into its correct position.",
        timeComplexity: { avg: "O(n²)", worst: "O(n²)", best: "O(n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Loops"],
        steps: [
            "Start from second element",
            "Compare with elements before it",
            "Shift elements greater than key to the right",
            "Insert key at correct position"
        ],
        codeExample: {
            javascript: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
  return arr;
}`
        },
        variations: [
            { name: "Binary Insertion Sort", desc: "Use binary search to find position" },
            { name: "Shell Sort", desc: "Generalization using gaps" }
        ],
        interviewQuestions: ["Sort a Linked List using Insertion Sort", "Online Sorting"],
        tips: ["Efficient for small data sets", "Stable sort", "Adaptive (fast for sorted)"]
    },
    {
        id: "selection-sort",
        name: "Selection Sort",
        category: "sorting",
        icon: Check,
        difficulty: "Easy",
        description: "Repeatedly finds the minimum element and moves it to the beginning",
        detailedDescription: "Selection sort divides the input list into two parts: a sorted sublist of items which is built up from left to right and an unsorted sublist. It finds the smallest element in the unsorted sublist and swaps it with the leftmost unsorted element.",
        timeComplexity: { avg: "O(n²)", worst: "O(n²)", best: "O(n²)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Loops", "Min Finding"],
        steps: [
            "Find minimum element in unsorted array",
            "Swap it with element at beginning of unsorted part",
            "Move boundary of unsorted array one step right"
        ],
        codeExample: {
            javascript: `function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`
        },
        variations: [
            { name: "Bingo Sort", desc: "Scans for value first" },
            { name: "Cycle Sort", desc: "Minimizes writes" }
        ],
        interviewQuestions: ["Implement Selection Sort", "Minimizing Swaps"],
        tips: ["O(n) swaps - useful when writes are expensive", "Unstable sort usually"]
    },
    {
        id: "cyclic-sort",
        name: "Cyclic Sort",
        category: "sorting",
        icon: RotateCw,
        difficulty: "Easy",
        description: "Sorts an array of numbers in range 1 to n in O(n)",
        detailedDescription: "Cyclic sort is an in-place, unstable sorting algorithm. It is optimal for situations where the index of the object is specified by value (range 1 to N).",
        timeComplexity: { avg: "O(n)", worst: "O(n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Arrays", "Range 1 to N"],
        steps: [
            "Iterate through array",
            "If arr[i] is not at correct index (arr[i]-1), swap",
            "Repeat swap until correct element is at i",
            "Move to next index"
        ],
        codeExample: {
            javascript: `function cyclicSort(nums) {
  let i = 0;
  while (i < nums.length) {
    const correctIdx = nums[i] - 1;
    if (nums[i] !== nums[correctIdx]) {
      [nums[i], nums[correctIdx]] = [nums[correctIdx], nums[i]];
    } else {
      i++;
    }
  }
  return nums;
}`
        },
        variations: [
            { name: "Find Duplicates", desc: "Find all duplicates in O(n)" },
            { name: "Find Missing Number", desc: "Find missing number in 1 to N" }
        ],
        interviewQuestions: ["First Missing Positive", "Find All Numbers Disappeared in Array"],
        tips: ["Values must be in specific range (usually 1 to N or 0 to N)", "One pass O(n)"]
    },
    {
        id: "merge-sort",
        name: "Merge Sort",
        category: "sorting",
        icon: ArrowUpDown,
        difficulty: "Medium",
        description: "Divide and conquer sorting algorithm with guaranteed O(n log n) time complexity",
        detailedDescription: "Merge Sort divides the array into halves, recursively sorts them, and merges the sorted halves. It's stable, has consistent O(n log n) performance, but requires O(n) extra space.",
        timeComplexity: { avg: "O(n log n)", worst: "O(n log n)", best: "O(n log n)" },
        spaceComplexity: { auxiliary: "O(n)" },
        prerequisites: ["Recursion", "Divide and Conquer"],
        steps: [
            "If array has 0 or 1 element, return",
            "Divide array into two halves",
            "Recursively sort left half",
            "Recursively sort right half",
            "Merge the two sorted halves",
        ],
        codeExample: {
            javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

// In-place merge sort (more complex)
function mergeSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;
  
  const mid = Math.floor((left + right) / 2);
  mergeSortInPlace(arr, left, mid);
  mergeSortInPlace(arr, mid + 1, right);
  mergeInPlace(arr, left, mid, right);
}

function mergeInPlace(arr, left, mid, right) {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  
  let i = 0, j = 0, k = left;
  
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr[k++] = leftArr[i++];
    } else {
      arr[k++] = rightArr[j++];
    }
  }
  
  while (i < leftArr.length) arr[k++] = leftArr[i++];
  while (j < rightArr.length) arr[k++] = rightArr[j++];
}`,
        },
        variations: [
            { name: "Bottom-up Merge Sort", desc: "Iterative version" },
            { name: "Natural Merge Sort", desc: "Uses existing runs" },
            { name: "Tim Sort", desc: "Hybrid used in practice" },
        ],
        interviewQuestions: [
            "Sort an Array",
            "Merge Sorted Array",
            "Sort List (Linked List)",
            "Count Inversions",
            "Merge K Sorted Lists",
        ],
        tips: [
            "Stable sort - maintains relative order",
            "Good for linked lists (no random access needed)",
            "Use for external sorting (large files)",
            "Count inversions during merge",
        ],
    },
    {
        id: "quick-sort",
        name: "Quick Sort",
        category: "sorting",
        icon: Zap,
        difficulty: "Medium",
        description: "Efficient divide and conquer sorting using pivot partitioning",
        detailedDescription: "Quick Sort selects a pivot element and partitions the array around it. Elements smaller than pivot go left, larger go right. In-place sorting with average O(n log n) time.",
        timeComplexity: { avg: "O(n log n)", worst: "O(n²)", best: "O(n log n)" },
        spaceComplexity: { inPlace: "O(log n)" },
        prerequisites: ["Recursion", "Partitioning"],
        steps: [
            "Choose a pivot element",
            "Partition array:  elements < pivot | pivot | elements > pivot",
            "Recursively sort left partition",
            "Recursively sort right partition",
        ],
        codeExample: {
            javascript: `function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    const pivotIndex = partition(arr, left, right);
    quickSort(arr, left, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, right);
  }
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right]; // Choose rightmost as pivot
  let i = left - 1;
  
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
  return i + 1;
}

// Quick Select (Find kth smallest)
function quickSelect(arr, k, left = 0, right = arr.length - 1) {
  if (left === right) return arr[left];
  
  const pivotIndex = partition(arr, left, right);
  
  if (k === pivotIndex) {
    return arr[k];
  } else if (k < pivotIndex) {
    return quickSelect(arr, k, left, pivotIndex - 1);
  } else {
    return quickSelect(arr, k, pivotIndex + 1, right);
  }
}

// 3-way partition (for duplicates)
function quickSort3Way(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;
  
  let lt = left, gt = right, i = left + 1;
  const pivot = arr[left];
  
  while (i <= gt) {
    if (arr[i] < pivot) {
      [arr[lt++], arr[i++]] = [arr[i], arr[lt]];
    } else if (arr[i] > pivot) {
      [arr[i], arr[gt--]] = [arr[gt], arr[i]];
    } else {
      i++;
    }
  }
  
  quickSort3Way(arr, left, lt - 1);
  quickSort3Way(arr, gt + 1, right);
}`,
        },
        variations: [
            { name: "3-Way Quick Sort", desc: "Handles duplicates efficiently" },
            { name: "Quick Select", desc: "Find kth element in O(n) avg" },
            { name: "Randomized Quick Sort", desc: "Random pivot selection" },
        ],
        interviewQuestions: [
            "Sort an Array",
            "Kth Largest Element",
            "Sort Colors (Dutch Flag)",
            "Wiggle Sort",
            "Top K Frequent Elements",
        ],
        tips: [
            "Choose pivot wisely (median-of-3, random)",
            "Use 3-way partition for many duplicates",
            "Quick Select for finding kth element",
            "Worst case when array is sorted",
        ],
    },
    {
        id: "heap-sort",
        name: "Heap Sort",
        category: "sorting",
        icon: Layers,
        difficulty: "Medium",
        description: "Comparison-based sorting technique based on Binary Heap data structure",
        detailedDescription: "Heap Sort processes elements by creating the Min or Max Heap of the input array, then repeatedly removing the root element (min/max) and placing it at the end of the sorted array.",
        timeComplexity: { avg: "O(n log n)", worst: "O(n log n)", best: "O(n log n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Binary Heap", "Recursion"],
        steps: [
            "Build a max heap from the input data",
            "Swap the root with the last item of the heap",
            "Reduce heap size by 1",
            "Heapify the root",
            "Repeat until heap size > 1"
        ],
        codeExample: {
            javascript: `function heapSort(arr) {
  const n = arr.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;

  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`
        },
        variations: [
            { name: "IntroSort", desc: "Hybrid of Quick, Heap, and Insertion" },
            { name: "Smoothsort", desc: "Variation of Heapsort optimized for sorted arrays" },
            { name: "Ternary Heapsort", desc: "Uses 3 children per node instead of 2" }
        ],
        interviewQuestions: ["Kth Largest Element", "Sort a nearly sorted array"],
        tips: ["Not stable", "Good worst-case performance"]
    },
    {
        id: "dutch-national-flag",
        name: "Dutch National Flag",
        category: "sorting",
        icon: Flag,
        difficulty: "Medium",
        description: "Sorts an array of 0s, 1s, and 2s in one pass",
        detailedDescription: "The Dutch National Flag problem (Sort Colors) involves sorting an array containing three distinct values (like 0, 1, 2) in linear time O(n) and constant space O(1) using three pointers.",
        timeComplexity: { avg: "O(n)", worst: "O(n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Two Pointers", "Swapping"],
        steps: [
            "Initialize low = 0, mid = 0, high = n-1",
            "While mid <= high:",
            "  If arr[mid] == 0: swap(low, mid), low++, mid++",
            "  If arr[mid] == 1: mid++",
            "  If arr[mid] == 2: swap(mid, high), high--"
        ],
        codeExample: {
            javascript: `function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
  return nums;
}`
        },
        variations: [
            { name: "Sort 0s and 1s", desc: "Simpler 2-way partition" },
            { name: "Wiggle Sort", desc: "Interleaving order" }
        ],
        interviewQuestions: ["Sort Colors", "Wiggle Sort II"],
        tips: ["One pass solution", "Think of it as partitioning array into 3 regions"]
    },
    {
        id: "bfs",
        name: "Breadth-First Search",
        category: "graph",
        icon: Layers,
        difficulty: "Medium",
        description: "Graph traversal exploring all neighbors at current depth before moving to next level",
        detailedDescription: "BFS explores a graph level by level using a queue. It visits all neighbors of a node before moving to the next level.  Ideal for finding shortest path in unweighted graphs.",
        timeComplexity: { avg: "O(V + E)", worst: "O(V + E)" },
        spaceComplexity: { queue: "O(V)", visited: "O(V)" },
        prerequisites: ["Graph representation", "Queue"],
        steps: [
            "Initialize queue with starting node",
            "Mark starting node as visited",
            "While queue is not empty:",
            "  Dequeue a node",
            "  Process the node",
            "  Enqueue all unvisited neighbors",
            "  Mark them as visited",
        ],
        codeExample: {
            javascript: `// BFS for Graph
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];
  
  visited.add(start);
  
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);
    
    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return result;
}

// BFS for Shortest Path (Unweighted)
function shortestPath(graph, start, end) {
  const visited = new Set();
  const queue = [[start, 0]]; // [node, distance]
  const parent = new Map();
  
  visited.add(start);
  
  while (queue.length > 0) {
    const [node, dist] = queue.shift();
    
    if (node === end) {
      // Reconstruct path
      const path = [];
      let current = end;
      while (current !== undefined) {
        path.unshift(current);
        current = parent.get(current);
      }
      return { distance: dist, path };
    }
    
    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, node);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  
  return { distance: -1, path: [] };
}

// BFS for Level Order Tree Traversal
function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node. val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(level);
  }
  
  return result;
}`,
        },
        variations: [
            { name: "Multi-source BFS", desc: "Start from multiple nodes" },
            { name: "0-1 BFS", desc: "For graphs with 0 and 1 weights" },
            { name: "Bidirectional BFS", desc: "Search from both ends" },
        ],
        interviewQuestions: [
            "Number of Islands",
            "Word Ladder",
            "Rotting Oranges",
            "Shortest Path in Binary Matrix",
            "Open the Lock",
            "Minimum Knight Moves",
        ],
        tips: [
            "BFS guarantees shortest path in unweighted graphs",
            "Use for level-order problems",
            "Multi-source BFS:  add all sources to queue initially",
            "Track distance by storing it with node or using level count",
        ],
    },
    {
        id: "dfs",
        name: "Depth-First Search",
        category: "graph",
        icon: Route,
        difficulty: "Medium",
        description: "Graph traversal exploring as deep as possible before backtracking",
        detailedDescription: "DFS explores a graph by going as deep as possible along each branch before backtracking. It uses a stack (or recursion). Great for cycle detection, topological sort, and connected components.",
        timeComplexity: { avg: "O(V + E)", worst: "O(V + E)" },
        spaceComplexity: { recursive: "O(V)", iterative: "O(V)" },
        prerequisites: ["Graph representation", "Recursion/Stack"],
        steps: [
            "Mark current node as visited",
            "Process the current node",
            "For each unvisited neighbor:",
            "  Recursively call DFS",
            "Backtrack when all neighbors visited",
        ],
        codeExample: {
            javascript: `// DFS Recursive
function dfs(graph, node, visited = new Set()) {
  visited.add(node);
  console.log(node); // Process node
  
  for (let neighbor of graph[node]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}

// DFS Iterative
function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];
  const result = [];
  
  while (stack.length > 0) {
    const node = stack.pop();
    
    if (! visited.has(node)) {
      visited.add(node);
      result.push(node);
      
      // Add neighbors in reverse for correct order
      for (let i = graph[node].length - 1; i >= 0; i--) {
        if (!visited.has(graph[node][i])) {
          stack.push(graph[node][i]);
        }
      }
    }
  }
  
  return result;
}

// Cycle Detection (Directed Graph)
function hasCycle(graph, n) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Array(n).fill(WHITE);
  
  function dfs(node) {
    color[node] = GRAY;
    
    for (let neighbor of graph[node]) {
      if (color[neighbor] === GRAY) return true; // Back edge
      if (color[neighbor] === WHITE && dfs(neighbor)) return true;
    }
    
    color[node] = BLACK;
    return false;
  }
  
  for (let i = 0; i < n; i++) {
    if (color[i] === WHITE && dfs(i)) return true;
  }
  
  return false;
}

// Topological Sort
function topologicalSort(graph, n) {
  const visited = new Set();
  const result = [];
  
  function dfs(node) {
    visited.add(node);
    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
    result.unshift(node); // Add after processing children
  }
  
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      dfs(i);
    }
  }
  
  return result;
}`,
        },
        variations: [
            { name: "Topological Sort", desc: "Linear ordering of DAG vertices" },
            { name: "Cycle Detection", desc: "Find cycles using colors" },
            { name: "Connected Components", desc: "Find all components" },
            { name: "Path Finding", desc: "Find if path exists" },
        ],
        interviewQuestions: [
            "Clone Graph",
            "Course Schedule",
            "Number of Provinces",
            "All Paths From Source to Target",
            "Surrounded Regions",
            "Pacific Atlantic Water Flow",
        ],
        tips: [
            "Use colors (white/gray/black) for cycle detection",
            "Topological sort: add to result after exploring children",
            "For backtracking, undo changes after recursive call",
            "Consider iterative for very deep graphs (stack overflow)",
        ],
    },
    {
        id: "dijkstra",
        name: "Dijkstra's Algorithm",
        category: "graph",
        icon: Route,
        difficulty: "Medium",
        description: "Finding shortest path from source to all vertices in weighted graph with non-negative edges",
        detailedDescription: "Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices.  It uses a priority queue to always process the vertex with the smallest known distance. Only works with non-negative edge weights.",
        timeComplexity: {
            avg: "O((V + E) log V)",
            worst: "O(V²)",
            "with heap": "O((V + E) log V)",
            "with array": "O(V²)"
        },
        spaceComplexity: { "dist + heap": "O(V)" },
        prerequisites: ["Weighted Graph", "Priority Queue/Min-Heap"],
        steps: [
            "Initialize distances:  dist[source] = 0, others = ∞",
            "Add source to min-heap",
            "While heap is not empty:",
            "  Extract node with minimum distance",
            "  For each neighbor:",
            "    If dist[curr] + weight < dist[neighbor]:",
            "      Update dist[neighbor]",
            "      Add neighbor to heap",
        ],
        codeExample: {
            javascript: `// Dijkstra's Algorithm
function dijkstra(graph, start, n) {
  const dist = new Array(n).fill(Infinity);
  const visited = new Set();
  const pq = new MinPriorityQueue(); // or use array
  
  dist[start] = 0;
  pq.enqueue(start, 0);
  
  while (!pq.isEmpty()) {
    const { element:  node } = pq.dequeue();
    
    if (visited.has(node)) continue;
    visited.add(node);
    
    for (let [neighbor, weight] of graph[node]) {
      const newDist = dist[node] + weight;
      
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        pq.enqueue(neighbor, newDist);
      }
    }
  }
  
  return dist;
}

// Simple implementation with array
function dijkstraSimple(graph, start, n) {
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  
  dist[start] = 0;
  
  for (let i = 0; i < n; i++) {
    // Find unvisited node with minimum distance
    let minDist = Infinity, u = -1;
    for (let j = 0; j < n; j++) {
            if (! visited[j] && dist[j] < minDist) {
        minDist = dist[j];
        u = j;
      }
    }
    
    if (u === -1) break;
    visited[u] = true;
    
    for (let [v, weight] of graph[u]) {
      if (!visited[v] && dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
      }
    }
  }
  
  return dist;
}

// With path reconstruction
function dijkstraWithPath(graph, start, end, n) {
  const dist = new Array(n).fill(Infinity);
  const parent = new Array(n).fill(-1);
  const pq = [[0, start]]; // [distance, node]
  
  dist[start] = 0;
  
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, node] = pq.shift();
    
    if (d > dist[node]) continue;
    
    for (let [neighbor, weight] of graph[node]) {
      const newDist = dist[node] + weight;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        parent[neighbor] = node;
        pq.push([newDist, neighbor]);
      }
    }
  }
  
  // Reconstruct path
  const path = [];
  let current = end;
  while (current !== -1) {
    path.unshift(current);
    current = parent[current];
  }
  
  return { distance: dist[end], path };
}`,
        },
        variations: [
            { name: "Bellman-Ford", desc: "Handles negative weights" },
            { name: "Floyd-Warshall", desc: "All pairs shortest path" },
            { name: "A* Algorithm", desc: "Uses heuristic for optimization" },
        ],
        interviewQuestions: [
            "Network Delay Time",
            "Cheapest Flights Within K Stops",
            "Path with Maximum Probability",
            "Minimum Cost to Reach Destination",
            "Shortest Path in Weighted Graph",
        ],
        tips: [
            "Doesn't work with negative weights",
            "Use Bellman-Ford for negative weights",
            "Priority queue gives O((V+E) log V)",
            "Can early terminate when destination is found",
        ],
    },
    {
        id: "bellman-ford",
        name: "Bellman-Ford",
        category: "graph",
        icon: Route,
        difficulty: "Medium",
        description: "Shortest path algorithm handling negative edge weights",
        detailedDescription: "Bellman-Ford computes shortest paths from a single source vertex to all other vertices. It is slower than Dijkstra's algorithm but can handle graphs with negative edge weights and detect negative cycles.",
        timeComplexity: { avg: "O(VE)", worst: "O(VE)" },
        spaceComplexity: { auxiliary: "O(V)" },
        prerequisites: ["Graph", "Edge List"],
        steps: [
            "Initialize distance to source = 0, others = infinity",
            "Relax all edges V-1 times",
            "Check for negative cycles by relaxing one more time"
        ],
        codeExample: {
            javascript: `function bellmanFord(graph, V, start) {
  const dist = new Array(V).fill(Infinity);
  dist[start] = 0;

  // Relax all edges V-1 times
  for (let i = 0; i < V - 1; i++) {
    for (const {u, v, weight} of graph) {
      if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
      }
    }
  }

  // Check for negative weight cycles
  for (const {u, v, weight} of graph) {
    if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
      return "Negative Cycle Detected";
    }
  }

  return dist;
}`
        },
        variations: [
            { name: "SPFA Algorithm", desc: "Optimized Bellman-Ford using queue" }
        ],
        interviewQuestions: ["Detect Negative Cycle", "Cheapest Flights with K Stops"],
        tips: ["Use when negative weights exist", "Slower than Dijkstra"]
    },
    {
        id: "kruskal",
        name: "Kruskal's MST",
        category: "graph",
        icon: Network,
        difficulty: "Medium",
        description: "Greedy algorithm to find Minimum Spanning Tree using Union-Find",
        detailedDescription: "Kruskal's algorithm sorts all edges by weight and then adds them one by one to the growing forest, provided they don't form a cycle. It constructs an MST.",
        timeComplexity: { avg: "O(E log E)", worst: "O(E log E)" },
        spaceComplexity: { auxiliary: "O(V)" },
        prerequisites: ["Union-Find", "Sorting"],
        steps: [
            "Sort all edges by weight",
            "Initialize Union-Find",
            "Iterate through sorted edges",
            "If edge (u, v) connects different sets, union them and add to MST"
        ],
        codeExample: {
            javascript: `function kruskal(n, edges) {
  edges.sort((a, b) => a.w - b.w);
  const parent = Array.from({length: n}, (_, i) => i);
  
  function find(i) {
    if (parent[i] === i) return i;
    return parent[i] = find(parent[i]);
  }
  
  function union(i, j) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
      return true; // Merged
    }
    return false; // Cycle
  }
  
  const mst = [];
  let cost = 0;
  
  for (const {u, v, w} of edges) {
    if (union(u, v)) {
      mst.push({u, v, w});
      cost += w;
    }
  }
  return { mst, cost };
}`
        },
        variations: [
            { name: "Maximum Spanning Tree", desc: "Find spanning tree with max weight" },
            { name: "Boruvka's Algorithm", desc: "Another greedy MST algorithm" }
        ],
        interviewQuestions: ["Min Cost to Connect All Points", "Redundant Connection"],
        tips: ["Use Union-Find for cycle detection", "Good for sparse graphs"]
    },
    {
        id: "prim",
        name: "Prim's MST",
        category: "graph",
        icon: Network,
        difficulty: "Medium",
        description: "Greedy algorithm to grow MST from a starting vertex",
        detailedDescription: "Prim's algorithm builds the MST one vertex at a time, always adding the cheapest edge connecting a vertex in the MST to one outside it.",
        timeComplexity: { avg: "O(E log V)", worst: "O(E log V)" },
        spaceComplexity: { auxiliary: "O(V)" },
        prerequisites: ["Priority Queue"],
        steps: [
            "Initialize keys/dist to infinity, 0 for start",
            "Use Priority Queue to pick min key vertex",
            "For neighbors, if edge weight < key, update key and parent"
        ],
        codeExample: {
            javascript: `function prim(n, graph) {
  const key = new Array(n).fill(Infinity);
  const parent = new Array(n).fill(-1);
  const inMST = new Array(n).fill(false);
  
  key[0] = 0;
  // Use MinPriorityQueue in real implementation
  
  for (let count = 0; count < n - 1; count++) {
    let u = -1, min = Infinity;
    
    // Find min key vertex not in MST
    for (let v = 0; v < n; v++) {
      if (!inMST[v] && key[v] < min) {
        min = key[v];
        u = v;
      }
    }
    
    if (u === -1) break;
    inMST[u] = true;
    
    for (let v = 0; v < n; v++) {
      if (graph[u][v] && !inMST[v] && graph[u][v] < key[v]) {
        parent[v] = u;
        key[v] = graph[u][v];
      }
    }
  }
  return parent; // Represents MST edges
}`
        },
        variations: [
            { name: "Dense Graph Optimization", desc: "Use array instead of heap for O(V²)" },
            { name: "Jarnik's Algorithm", desc: "Original name for Prim's" }
        ],
        interviewQuestions: ["Min Cost to Connect All Points"],
        tips: ["Similar structure to Dijkstra", "Good for dense graphs"]
    },
    {
        id: "topological-sort",
        name: "Topological Sort",
        category: "graph",
        icon: List,
        difficulty: "Medium",
        description: "Linear ordering of vertices in a Directed Acyclic Graph (DAG)",
        detailedDescription: "Topological sort orders vertices such that for every directed edge u -> v, vertex u comes before v. It's used for scheduling tasks, resolving dependencies, and more.",
        timeComplexity: { avg: "O(V + E)", worst: "O(V + E)" },
        spaceComplexity: { auxiliary: "O(V)" },
        prerequisites: ["DFS or BFS (Kahn's Algo)", "DAG"],
        steps: [
            "Calculate in-degree for all vertices",
            "Queue all vertices with in-degree 0",
            "While queue is not empty, dequeue u, add to result",
            "Reduce in-degree of neighbors; if 0, enqueue"
        ],
        codeExample: {
            javascript: `function topologicalSort(numCourses, prerequisites) {
  const inDegree = new Array(numCourses).fill(0);
  const graph = Array.from({length: numCourses}, () => []);
  
  for (const [course, pre] of prerequisites) {
    graph[pre].push(course);
    inDegree[course]++;
  }
  
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    
    for (const v of graph[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    }
  }
  
  return order.length === numCourses ? order : []; // Cycle detected if not equal
}`
        },
        variations: [
            { name: "Kahn's Algorithm", desc: "BFS based approach using indegrees" },
            { name: "DFS Approach", desc: "Using recursion stack and finish times" }
        ],
        interviewQuestions: ["Course Schedule", "Alien Dictionary", "Build Order"],
        tips: ["Only works on DAGs", "Detects cycles if result length < V"]
    },
    {
        id: "floyd-warshall",
        name: "Floyd-Warshall",
        category: "graph",
        icon: Grid3X3,
        difficulty: "Hard",
        description: "All-pairs shortest path algorithm",
        detailedDescription: "Floyd-Warshall checks every possible path between every pair of vertices. It uses dynamic programming to find the shortest path between all pairs of vertices in a weighted graph.",
        timeComplexity: { avg: "O(V³)", worst: "O(V³)" },
        spaceComplexity: { auxiliary: "O(V²)" },
        prerequisites: ["Adjacency Matrix", "DP"],
        steps: [
            "Initialize dist matrix with direct edge weights",
            "For each vertex k (intermediate)",
            "For each vertex i (source)",
            "For each vertex j (destination)",
            "Update dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])"
        ],
        codeExample: {
            javascript: `function floydWarshall(graph, V) {
  const dist = Array.from({ length: V }, (_, i) => 
    Array.from({ length: V }, (_, j) => 
      i === j ? 0 : (graph[i][j] || Infinity)
    )
  );

  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  return dist;
}`
        },
        variations: [
            { name: "Transitive Closure", desc: "Reachability check between all pairs" },
            { name: "Minimax Path", desc: "Path with minimum max edge weight" }
        ],
        interviewQuestions: ["Find the City With the Smallest Number of Neighbors at a Threshold Distance"],
        tips: ["O(V³) is expensive, use for small V (< 400)", "Easy to implement"]
    },
    {
        id: "a-star",
        name: "A* Search",
        category: "graph",
        icon: Target,
        difficulty: "Hard",
        description: "Informed search algorithm for pathfinding using heuristics",
        detailedDescription: "A* is a best-first search algorithm that finds the least-cost path from a given initial node to one goal node. It uses a heuristic function h(n) to estimate the cost to reach the goal.",
        timeComplexity: { avg: "O(E)", worst: "O(b^d)" },
        spaceComplexity: { auxiliary: "O(V)" },
        prerequisites: ["Dijkstra", "Heuristics"],
        steps: [
            "Initialize open set with start node",
            "f(n) = g(n) + h(n) (cost + heuristic)",
            "Pick node with lowest f(n) from open set",
            "If goal, reconstruct path"
        ],
        codeExample: {
            javascript: `// Pseudo-code for A* structure
function aStar(start, goal) {
  const openSet = new MinPriorityQueue();
  openSet.enqueue(start, 0);
  
  const gScore = new Map(); // Cost from start
  gScore.set(start, 0);
  
  const fScore = new Map(); // Estimated total cost
  fScore.set(start, heuristic(start, goal));
  
  while (!openSet.isEmpty()) {
    const current = openSet.dequeue().element;
    if (current === goal) return reconstructPath(cameFrom, current);
    
    for (const neighbor of getNeighbors(current)) {
      const tentativeG = gScore.get(current) + dist(current, neighbor);
      if (tentativeG < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goal));
        
        if (!openSet.contains(neighbor)) {
          openSet.enqueue(neighbor, fScore.get(neighbor));
        }
      }
    }
  }
  return failure;
}`
        },
        variations: [
            { name: "IDA*", desc: "Iterative Deepening A*" },
            { name: "D*", desc: "Dynamic A* for changing environments" }
        ],
        interviewQuestions: ["Shortest Path in Grid with Obstacles", "8 Puzzle Problem"],
        tips: ["Heuristic consistency (monotonicity) guarantees optimality", "Manhattan distance for grids"]
    },
    {
        id: "network-flow",
        name: "Network Flow",
        category: "graph",
        icon: TrendingUp,
        difficulty: "Hard",
        description: "Finds the maximum flow in a flow network",
        detailedDescription: "Max Flow algorithms (Ford-Fulkerson, Edmonds-Karp) determine the greatest amount of flow possible from a source to a sink in a network with capacity constraints.",
        timeComplexity: { avg: "O(VE²)", worst: "O(E * max_flow)" },
        spaceComplexity: { auxiliary: "O(V + E)" },
        prerequisites: ["BFS/DFS", "Residual Graph"],
        steps: [
            "Initialize flow to 0",
            "While there is an augmenting path in residual graph (BFS)",
            "  Find bottleneck capacity",
            "  Augment flow along path",
            "  Update residual graph"
        ],
        codeExample: {
            javascript: `// Edmonds-Karp Algorithm
function maxFlow(graph, source, sink) {
  let maxFlow = 0;
  let parent = new Map();
  
  while (bfs(graph, source, sink, parent)) {
    let pathFlow = Infinity;
    let s = sink;
    
    // Find bottleneck
    while (s !== source) {
      pathFlow = Math.min(pathFlow, graph[parent.get(s)][s]);
      s = parent.get(s);
    }
    
    maxFlow += pathFlow;
    
    // Update residual capacities
    let v = sink;
    while (v !== source) {
      let u = parent.get(v);
      graph[u][v] -= pathFlow;
      graph[v][u] += pathFlow;
      v = u;
    }
  }
  return maxFlow;
}`
        },
        variations: [
            { name: "Dinic's Algorithm", desc: "Uses level graphs and blocking flows" },
            { name: "Push-Relabel", desc: "Preflow push method O(V²E)" }
        ],
        interviewQuestions: ["Maximum Bipartite Matching", "Min-Cut Max-Flow Theorem"],
        tips: ["Edmonds-Karp uses BFS (shortest path in unweighted residual)", "Dinic is faster O(V²E)"]
    },
    {
        id: "two-pointers",
        name: "Two Pointers",
        category: "technique",
        icon: ArrowRight,
        difficulty: "Easy",
        description: "Technique using two pointers to solve array/string problems efficiently",
        detailedDescription: "Two pointers technique uses two indices to traverse a data structure, often from different directions or at different speeds. It reduces time complexity from O(n²) to O(n) for many problems.",
        timeComplexity: { typical: "O(n)" },
        spaceComplexity: { inPlace: "O(1)" },
        prerequisites: ["Arrays", "Sorted Arrays (often)"],
        steps: [
            "Initialize two pointers (start/end, slow/fast)",
            "Move pointers based on condition",
            "Process elements at pointer positions",
            "Continue until pointers meet or cross",
        ],
        codeExample: {
            javascript: `// Two Pointer Patterns

// 1. Two Sum (Sorted Array)
function twoSumSorted(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return [];
}

// 2. Remove Duplicates from Sorted Array
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  
  let slow = 0;
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1;
}

// 3. Container With Most Water
function maxArea(height) {
  let left = 0, right = height.length - 1;
  let maxWater = 0;
  
  while (left < right) {
    const width = right - left;
    const h = Math.min(height[left], height[right]);
    maxWater = Math.max(maxWater, width * h);
    
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  return maxWater;
}

// 4. Three Sum
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) continue;
    
    let left = i + 1, right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left+1]) left++;
        while (left < right && nums[right] === nums[right-1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}

// 5. Valid Palindrome
function isPalindrome(s) {
  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = s.length - 1;
  
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

// 6. Linked List Cycle (Fast & Slow)
function hasCycle(head) {
  let slow = head, fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
        },
        variations: [
            { name: "Opposite Ends", examples: "Two Sum, Container With Most Water" },
            { name: "Fast & Slow", examples: "Cycle Detection, Middle Element" },
            { name: "Sliding Window", examples: "Max Sum Subarray, Longest Substring" },
            { name: "Same Direction", examples: "Remove Duplicates, Merge Arrays" },
        ],
        interviewQuestions: [
            "Two Sum II",
            "Three Sum",
            "Container With Most Water",
            "Trapping Rain Water",
            "Valid Palindrome",
            "Linked List Cycle",
            "Remove Duplicates",
        ],
        tips: [
            "Consider sorting first for unordered arrays",
            "Think about what moves each pointer",
            "Fast/slow for cycle detection",
            "Opposite ends for sum problems",
        ],
    },
    {
        id: "backtracking",
        name: "Backtracking",
        category: "technique",
        icon: Workflow,
        difficulty: "Medium",
        description: "Algorithmic technique for finding solutions by exploring and abandoning paths",
        detailedDescription: "Backtracking builds solutions incrementally, abandoning paths that fail to satisfy constraints. It systematically explores all possibilities using recursion and is used for constraint satisfaction problems.",
        timeComplexity: { worst: "O(k^n) or exponential" },
        spaceComplexity: { recursive: "O(n)" },
        prerequisites: ["Recursion", "State Management"],
        steps: [
            "Choose:  Select a candidate",
            "Explore: Recursively explore with candidate",
            "Check: If solution found or constraints violated",
            "Unchoose: Remove candidate and try next",
        ],
        codeExample: {
            javascript: `// Backtracking Template
function backtrack(state, choices, result) {
  if (isSolution(state)) {
    result.push([...state]);
    return;
  }
  
  for (let choice of choices) {
    if (isValid(choice, state)) {
      state.push(choice);           // Make choice
      backtrack(state, choices, result);  // Explore
      state.pop();                  // Undo choice
    }
  }
}

// 1. Subsets
function subsets(nums) {
  const result = [];
  
  function backtrack(start, current) {
    result.push([...current]);
    
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}

// 2. Permutations
function permute(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);
  
  function backtrack(current) {
    if (current.length === nums.length) {
      result.push([... current]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      
      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }
  
  backtrack([]);
  return result;
}

// 3. Combinations
function combine(n, k) {
  const result = [];
  
  function backtrack(start, current) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    
    for (let i = start; i <= n; i++) {
      current.push(i);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(1, []);
  return result;
}

// 4. N-Queens
function solveNQueens(n) {
  const result = [];
  const board = Array(n).fill(null).map(() => Array(n).fill('. '));
  
  function isValid(row, col) {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false;
    }
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false;
    }
    return true;
  }
  
  function backtrack(row) {
    if (row === n) {
      result.push(board.map(r => r.join('')));
      return;
    }
    
    for (let col = 0; col < n; col++) {
      if (isValid(row, col)) {
        board[row][col] = 'Q';
        backtrack(row + 1);
        board[row][col] = '.';
      }
    }
  }
  
  backtrack(0);
  return result;
}

// 5. Word Search
function exist(board, word) {
  const rows = board.length, cols = board[0].length;
  
  function backtrack(r, c, index) {
    if (index === word.length) return true;
    
    if (r < 0 || r >= rows || c < 0 || c >= cols || 
        board[r][c] !== word[index]) {
      return false;
    }
    
    const temp = board[r][c];
    board[r][c] = '#'; // Mark visited
    
    const found = backtrack(r + 1, c, index + 1) ||
                  backtrack(r - 1, c, index + 1) ||
                  backtrack(r, c + 1, index + 1) ||
                  backtrack(r, c - 1, index + 1);
    
    board[r][c] = temp; // Restore
    return found;
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (backtrack(r, c, 0)) return true;
    }
  }
  return false;
}`,
        },
        variations: [
            { name: "Subsets", examples: "All subsets, subset sum" },
            { name: "Permutations", examples: "All permutations, next permutation" },
            { name: "Combinations", examples: "Combinations, combination sum" },
            { name: "Grid Search", examples: "Word search, N-Queens, Sudoku" },
        ],
        interviewQuestions: [
            "Subsets",
            "Permutations",
            "Combination Sum",
            "N-Queens",
            "Word Search",
            "Sudoku Solver",
            "Generate Parentheses",
            "Letter Combinations of Phone Number",
        ],
        tips: [
            "Think of it as DFS with constraints",
            "Always undo the choice after exploring",
            "Prune early when constraints are violated",
            "Use index to avoid duplicates in combinations",
        ],
    },
    {
        id: "sliding-window",
        name: "Sliding Window",
        category: "technique",
        icon: Boxes,
        difficulty: "Medium",
        description: "Technique for processing contiguous subarrays or substrings efficiently",
        detailedDescription: "Sliding window maintains a window of elements and slides it across the data structure. It's optimal for problems involving contiguous sequences, reducing O(n²) to O(n).",
        timeComplexity: { typical: "O(n)" },
        spaceComplexity: { typical: "O(k) or O(1)" },
        prerequisites: ["Arrays/Strings", "Hash Map (often)"],
        steps: [
            "Initialize window boundaries (left, right)",
            "Expand window by moving right pointer",
            "When constraint violated, shrink by moving left",
            "Track the answer at each valid window",
        ],
        codeExample: {
            javascript: `// Sliding Window Patterns

// 1. Maximum Sum Subarray of Size K (Fixed Window)
function maxSumSubarray(arr, k) {
  let windowSum = 0;
  let maxSum = -Infinity;
  
  for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i];
    
    if (i >= k - 1) {
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= arr[i - k + 1];
    }
  }
  return maxSum;
}

// 2. Longest Substring Without Repeating Characters (Variable Window)
function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let maxLen = 0;
  let left = 0;
  
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right]) && seen.get(s[right]) >= left) {
      left = seen.get(s[right]) + 1;
    }
    seen.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

// 3. Minimum Window Substring
function minWindow(s, t) {
  const need = new Map();
  for (let c of t) need.set(c, (need.get(c) || 0) + 1);
  
  let have = 0, required = need.size;
  let left = 0, minLen = Infinity, result = "";
  const window = new Map();
  
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c) || 0) + 1);
    
    if (need.has(c) && window.get(c) === need.get(c)) {
      have++;
    }
    
    while (have === required) {
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        result = s.substring(left, right + 1);
      }
      
      const leftChar = s[left];
      window.set(leftChar, window.get(leftChar) - 1);
      
      if (need.has(leftChar) && window.get(leftChar) < need.get(leftChar)) {
        have--;
      }
      left++;
    }
  }
  return result;
}

// 4. Longest Repeating Character Replacement
function characterReplacement(s, k) {
  const count = {};
  let maxCount = 0, maxLen = 0, left = 0;
  
  for (let right = 0; right < s.length; right++) {
    count[s[right]] = (count[s[right]] || 0) + 1;
    maxCount = Math.max(maxCount, count[s[right]]);
    
    while (right - left + 1 - maxCount > k) {
      count[s[left]]--;
      left++;
    }
    
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

// 5. Fruit Into Baskets (Max subarray with at most 2 distinct)
function totalFruit(fruits) {
  const basket = new Map();
  let left = 0, maxFruits = 0;
  
  for (let right = 0; right < fruits.length; right++) {
    basket.set(fruits[right], (basket.get(fruits[right]) || 0) + 1);
    
    while (basket.size > 2) {
      const leftFruit = fruits[left];
      basket.set(leftFruit, basket.get(leftFruit) - 1);
      if (basket.get(leftFruit) === 0) basket.delete(leftFruit);
      left++;
    }
    
    maxFruits = Math.max(maxFruits, right - left + 1);
  }
  return maxFruits;
}`,
        },
        variations: [
            { name: "Fixed Size Window", examples: "Max Sum Subarray K" },
            { name: "Variable Size Window", examples: "Longest Substring Without Repeat" },
            { name: "String Matching", examples: "Minimum Window Substring, Anagrams" },
            { name: "K Distinct Elements", examples: "Fruits Into Baskets" },
        ],
        interviewQuestions: [
            "Longest Substring Without Repeating Characters",
            "Minimum Window Substring",
            "Sliding Window Maximum",
            "Permutation in String",
            "Longest Repeating Character Replacement",
            "Find All Anagrams in String",
        ],
        tips: [
            "Fixed window:  slide when window size reached",
            "Variable window: expand right, shrink left when invalid",
            "Use hash map to track window contents",
            "Think about what makes window valid/invalid",
        ],
    },
    {
        id: "kadanes-algo",
        name: "Kadane's Algorithm",
        category: "dynamic-programming",
        icon: TrendingUp,
        difficulty: "Medium",
        description: "Finds the contiguous subarray with the largest sum",
        detailedDescription: "Kadane's Algorithm is an iterative dynamic programming algorithm that looks for a maximum sum contiguous subarray within a one-dimensional numeric array.",
        timeComplexity: { avg: "O(n)", worst: "O(n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Arrays", "Maximum Subarray Problem"],
        steps: [
            "Initialize current_max = 0, global_max = -Infinity",
            "Iterate through each number in array",
            "current_max = max(num, current_max + num)",
            "global_max = max(global_max, current_max)",
            "Return global_max"
        ],
        codeExample: {
            javascript: `function maxSubArray(nums) {
  let globalMax = -Infinity;
  let currentMax = 0;
  
  for (let num of nums) {
    currentMax = Math.max(num, currentMax + num);
    globalMax = Math.max(globalMax, currentMax);
  }
  
  return globalMax;
}`
        },
        variations: [
            { name: "Maximum Circular Subarray Sum", desc: "Wrap around array" },
            { name: "Maximum Product Subarray", desc: "Using min and max products" }
        ],
        interviewQuestions: ["Maximum Subarray", "Best Time to Buy and Sell Stock"],
        tips: ["If all numbers are negative, result is the max number involved (handled by init to -Infinity)", "Can track start/end indices for the subarray"]
    },
    {
        id: "tree-traversal",
        name: "Tree Traversals",
        category: "tree",
        icon: GitBranch,
        difficulty: "Easy",
        description: "Different ways to visit every node in a tree",
        detailedDescription: "Tree traversal algorithms visit each node in the tree exactly once. The order depends on whether you visit the root before (pre), after (post), or between (in) subtrees.",
        timeComplexity: { avg: "O(n)", worst: "O(n)" },
        spaceComplexity: { auxiliary: "O(h)" },
        prerequisites: ["Recursion", "Tree Structure"],
        steps: [
            "Preorder: Root, Left, Right",
            "Inorder: Left, Root, Right",
            "Postorder: Left, Right, Root"
        ],
        codeExample: {
            javascript: `// Definition for a binary tree node
function TreeNode(val, left, right) {
  this.val = (val===undefined ? 0 : val)
  this.left = (left===undefined ? null : left)
  this.right = (right===undefined ? null : right)
}

function inorder(root) {
  if (!root) return;
  inorder(root.left);
  console.log(root.val);
  inorder(root.right);
}

function preorder(root) {
  if (!root) return;
  console.log(root.val);
  preorder(root.left);
  preorder(root.right);
}

function postorder(root) {
  if (!root) return;
  postorder(root.left);
  postorder(root.right);
  console.log(root.val);
}`
        },
        variations: [
            { name: "Level Order", desc: "BFS traversal" },
            { name: "Morris Traversal", desc: "O(1) space traversal" }
        ],
        interviewQuestions: ["Binary Tree Inorder Traversal", "Construct Binary Tree from Preorder and Inorder"],
        tips: ["Inorder on BST gives sorted values", "Postorder useful for deleting tree"]
    },
    {
        id: "kmp",
        name: "KMP Algorithm",
        category: "string",
        icon: Search,
        difficulty: "Hard",
        description: "Efficient string matching algorithm using prefix function",
        detailedDescription: "Knuth-Morris-Pratt (KMP) searches for occurrences of a 'word' within a main 'text' by employing the observation that when a mismatch occurs, the word itself embodies sufficient information to determine where the next match could begin.",
        timeComplexity: { avg: "O(N + M)", worst: "O(N + M)" },
        spaceComplexity: { auxiliary: "O(M)" },
        prerequisites: ["String Matching", "LPS Array"],
        steps: [
            "Precompute LPS (Longest Prefix Suffix) array",
            "Iterate through text and pattern",
            "On mismatch, use LPS to skip comparisons",
            "Continue until match found or text exhausted"
        ],
        codeExample: {
            javascript: `function kmpSearch(text, pattern) {
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return 0;
  
  const lps = computeLPS(pattern);
  let i = 0, j = 0;
  const matches = [];
  
  while (i < n) {
    if (text[i] === pattern[j]) {
      i++; j++;
    }
    if (j === m) {
      matches.push(i - j);
      j = lps[j - 1];
    } else if (i < n && text[i] !== pattern[j]) {
      if (j !== 0) j = lps[j - 1];
      else i++;
    }
  }
  return matches;
}

function computeLPS(pattern) {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0, i = 1;
  
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) len = lps[len - 1];
      else {
        lps[i] = 0;
        i++;
      }
    }
  }
  return lps;
}`
        },
        variations: [
            { name: "Rabin-Karp", desc: "Rolling hash based matching" },
            { name: "Boyer-Moore", desc: "Skipping characters using bad character rule" }
        ],
        interviewQuestions: ["Implement strStr()", "Repeated Substring Pattern"],
        tips: ["LPS array stores length of longest proper prefix which is also suffix", "Avoids backtracking in text"]
    },
    {
        id: "convex-hull",
        name: "Convex Hull",
        category: "geometry",
        icon: Hexagon,
        difficulty: "Hard",
        description: "Finds the smallest convex polygon containing all points",
        detailedDescription: "The convex hull of a set of points is the smallest convex polygon that encloses all points. Graham Scan fits this in O(N log N) time.",
        timeComplexity: { avg: "O(N log N)", worst: "O(N log N)" },
        spaceComplexity: { auxiliary: "O(N)" },
        prerequisites: ["Geometry Basics", "Sorting"],
        steps: [
            "Find bottom-left point (start)",
            "Sort other points by polar angle",
            "Iterate sorted points, maintain stack",
            "Remove points that create non-left turns (cross product)"
        ],
        codeExample: {
            javascript: `function convexHull(points) {
  // Graham Scan
  if (points.length < 3) return points;
  
  // 1. Find bottom-most point (or left-most)
  let start = points[0];
  for (let p of points) {
    if (p.y < start.y || (p.y === start.y && p.x < start.x)) start = p;
  }
  
  // 2. Sort by polar angle
  points.sort((a, b) => {
    const cp = crossProduct(start, a, b);
    if (cp === 0) return dist(start, a) - dist(start, b);
    return -cp;
  });
  
  // 3. Build Hull
  const stack = [start];
  for (let i = 1; i < points.length; i++) {
    while (stack.length > 1 && 
           crossProduct(stack[stack.length-2], stack[stack.length-1], points[i]) <= 0) {
      stack.pop();
    }
    stack.push(points[i]);
  }
  return stack;
}

function crossProduct(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}`
        },
        variations: [
            { name: "Jarvis March", desc: "Gift wrapping algorithm O(nH)" },
            { name: "Monotone Chain", desc: "Sorts points and builds upper/lower hulls" }
        ],
        interviewQuestions: ["Erect the Fence", "Outer Trees"],
        tips: ["Use cross product to determine turn direction", "Handle collinear points carefully"]
    },
    {
        id: "sieve",
        name: "Sieve of Eratosthenes",
        category: "math",
        icon: Calculator,
        difficulty: "Medium",
        description: "Efficient algorithm to find all prime numbers up to n",
        detailedDescription: "The Sieve of Eratosthenes efficiently generates all primes smaller than n by iteratively marking the multiples of each prime starting from 2.",
        timeComplexity: { avg: "O(n log log n)", worst: "O(n log log n)" },
        spaceComplexity: { auxiliary: "O(n)" },
        prerequisites: ["Arrays", "Basic Math"],
        steps: [
            "Create boolean array isPrime[0..n], init true",
            "Set isPrime[0] = isPrime[1] = false",
            "Loop p from 2 to sqrt(n)",
            "If isPrime[p] is true, mark all multiples of p as false"
        ],
        codeExample: {
            javascript: `function sieve(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  
  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) {
      for (let i = p * p; i <= n; i += p) {
        isPrime[i] = false;
      }
    }
  }
  
  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i);
  }
  return primes;
}`
        },
        variations: [
            { name: "Segmented Sieve", desc: "Process range in segments for large N" },
            { name: "Linear Sieve", desc: "Euler's Sieve finds primes in O(n)" }
        ],
        interviewQuestions: ["Count Primes", "Prime Factorization"],
        tips: ["Start marking from p*p to avoid redundancy", "Optimization: only check odd numbers"]
    },
    {
        id: "floyd-cycle",
        name: "Floyd's Cycle Detection",
        category: "linked-list",
        icon: Repeat,
        difficulty: "Medium",
        description: "Detects a cycle in a linked list using two pointers",
        detailedDescription: "Floyd's Cycle-Finding Algorithm (Tortoise and Hare) uses two pointers moving at different speeds. If there is a cycle, they will eventually meet. It can also find the start of the cycle.",
        timeComplexity: { avg: "O(n)", worst: "O(n)" },
        spaceComplexity: { auxiliary: "O(1)" },
        prerequisites: ["Linked List", "Two Pointers"],
        steps: [
            "Initialize slow and fast pointers to head",
            "While fast and fast.next are not null:",
            "  Move slow by 1 step, fast by 2 steps",
            "  If slow == fast, cycle detected",
            "Return false if fast reaches null"
        ],
        codeExample: {
            javascript: `// Definition for sorted linked list.
function ListNode(val) {
    this.val = val;
    this.next = null;
}

function hasCycle(head) {
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      return true;
    }
  }
  return false;
}

// Find start of cycle
function detectCycle(head) {
  let slow = head, fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      let slow2 = head;
      while (slow2 !== slow) {
        slow = slow.next;
        slow2 = slow2.next;
      }
      return slow; // Start of cycle
    }
  }
  return null;
}`
        },
        variations: [
            { name: "Brent's Algorithm", desc: "Often faster than Floyd's" },
            { name: "Find Cycle Length", desc: "Continue fast/slow after meeting" }
        ],
        interviewQuestions: ["Linked List Cycle", "Linked List Cycle II", "Find the Duplicate Number"],
        tips: ["Safe to check fast.next to avoid null pointer exception", "Can be applied to array duplicates (values as pointers)"]
    },

    {
        id: "fibonacci",
        name: "Fibonacci Sequence",
        category: "dynamic-programming",
        icon: Repeat,
        difficulty: "Easy",
        description: "Calculates the nth Fibonacci number efficiently",
        detailedDescription: "The Fibonacci sequence is a series of numbers where each number is the sum of the two preceding ones. DP optimizations (Memoization/Tabulation) reduce complexity from exponential to linear.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(n) or O(1)",
        },
        prerequisites: ["Recursion"],
        steps: [
            "Base cases: F(0)=0, F(1)=1",
            "Initialize memoization array or DP table",
            "Iterate from 2 to n (Tabulation) or recurse with check (Memoization)",
            "Return F(n)",
        ],
        codeExample: {
            javascript: `// Tabulation (Space Optimized)
function fibonacci(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  
  for (let i = 2; i <= n; i++) {
    let curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`
        },
        variations: [
            { name: "Matrix Exponentiation", desc: "O(log n) calculation" },
            { name: "Binet's Formula", desc: "O(1) approximation" },
        ],
        interviewQuestions: ["Climbing Stairs", "Tiling Problem", "Decode Ways"],
        tips: ["Use tabulation to save recursion stack space", "Can optimize space to O(1)"],
    },
    {
        id: "0-1-knapsack",
        name: "0/1 Knapsack",
        category: "dynamic-programming",
        icon: Boxes,
        difficulty: "Medium",
        description: "Max value items in knapsack without exceeding weight",
        detailedDescription: "Given a set of items with weights and values, determine which items to include in a collection so that the total weight is less than or equal to a given limit and the total value is as large as possible.",
        timeComplexity: {
            avg: "O(N*W)",
            worst: "O(N*W)",
        },
        spaceComplexity: {
            auxiliary: "O(N*W)",
        },
        prerequisites: ["Recursion", "2D Arrays"],
        steps: [
            "Initialize DP table[N+1][W+1]",
            "Loop through items and weights",
            "Decide to include or exclude item based on weight capacity",
        ],
        codeExample: {
            javascript: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(
          values[i-1] + dp[i-1][w-weights[i-1]], 
          dp[i-1][w]
        );
      } else {
        dp[i][w] = dp[i-1][w];
      }
    }
  }
  return dp[n][capacity];
}`
        },
        variations: [
            { name: "Unbounded Knapsack", desc: "Multiple items allowed" },
            { name: "Fractional Knapsack", desc: "Items can be broken" },
        ],
        interviewQuestions: ["Partition Equal Subset Sum", "Target Sum"],
        tips: ["Visualize the 2D grid", "Space can be optimized to 1D"],
    },
    {
        id: "lcs",
        name: "Longest Common Subsequence",
        category: "dynamic-programming",
        icon: List,
        difficulty: "Medium",
        description: "Finds longest subsequence present in both strings",
        detailedDescription: "Finds the longest subsequence common to all sequences. Unlike substrings, subsequences are not required to occupy consecutive positions.",
        timeComplexity: {
            avg: "O(N*M)",
            worst: "O(N*M)",
        },
        spaceComplexity: {
            auxiliary: "O(N*M)",
        },
        prerequisites: ["Strings", "2D DP"],
        steps: [
            "Initialize DP table",
            "Check char match",
            "Take diagonal if match, else max of top/left",
        ],
        codeExample: {
            javascript: `function lcs(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i-1] === text2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }
  }
  return dp[m][n];
}`
        },
        variations: [{ name: "Longest Common Substring", desc: "Contiguous only" }],
        interviewQuestions: ["Delete Operation for Two Strings", "Longest Palindromic Subsequence"],
        tips: ["Common pattern for string comparison"],
    },
    {
        id: "lis",
        name: "Longest Increasing Subsequence",
        category: "dynamic-programming",
        icon: TrendingUp,
        difficulty: "Medium",
        description: "Finds length of longest subsequence with strictly increasing elements",
        detailedDescription: "Finds the length of the longest subsequence such that all elements are sorted in increasing order.",
        timeComplexity: {
            avg: "O(n^2)",
            worst: "O(n^2)",
        },
        spaceComplexity: {
            auxiliary: "O(n)",
        },
        prerequisites: ["Arrays", "DP"],
        steps: [
            "Initialize dp array with 1s",
            "Double loop to check previous smaller elements",
        ],
        codeExample: {
            javascript: `function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  const dp = new Array(nums.length).fill(1);
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  return Math.max(...dp);
}`
        },
        variations: [{ name: "Patience Sorting", desc: "O(n log n) solution" }],
        interviewQuestions: ["Russian Doll Envelopes", "Maximum Length of Pair Chain"],
        tips: ["Can be optimized to O(n log n)"],
    },
    {
        id: "coin-change",
        name: "Coin Change",
        category: "dynamic-programming",
        icon: Calculator,
        difficulty: "Medium",
        description: "Fewest coins to make up a given amount",
        detailedDescription: "Given coins of different denominations and a total amount, calculate the fewest number of coins needed.",
        timeComplexity: {
            avg: "O(S*n)",
            worst: "O(S*n)",
        },
        spaceComplexity: {
            auxiliary: "O(S)",
        },
        prerequisites: ["Knapsack"],
        steps: [
            "Initialize DP array",
            "Iterate through amounts and coins",
            "Update min coins needed",
        ],
        codeExample: {
            javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`
        },
        variations: [{ name: "Coin Change 2", desc: "Number of ways" }],
        interviewQuestions: ["Perfect Squares"],
        tips: ["Similar to Unbounded Knapsack"],
    },
    {
        id: "matrix-chain",
        name: "Matrix Chain Multiplication",
        category: "dynamic-programming",
        icon: Grid3X3,
        difficulty: "Hard",
        description: "Most efficient way to multiply a sequence of matrices",
        detailedDescription: "Find the most efficient way to multiply matrices together by deciding the order of multiplications.",
        timeComplexity: {
            avg: "O(n^3)",
            worst: "O(n^3)",
        },
        spaceComplexity: {
            auxiliary: "O(n^2)",
        },
        prerequisites: ["Interval DP"],
        steps: [
            "Initialize DP table",
            "Iterate chain lengths",
            "Iterate split points",
        ],
        codeExample: {
            javascript: `function matrixChainOrder(p) {
  const n = p.length - 1;
  const dp = Array(n + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let l = 2; l <= n; l++) {
    for (let i = 1; i <= n - l + 1; i++) {
      let j = i + l - 1;
      dp[i][j] = Infinity;
      for (let k = i; k <= j - 1; k++) {
        let q = dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j];
        if (q < dp[i][j]) dp[i][j] = q;
      }
    }
  }
  return dp[1][n];
}`
        },
        variations: [{ name: "Burst Balloons", desc: "Similar interval DP" }],
        interviewQuestions: ["Minimum Score Triangulation"],
        tips: ["Classic Interval DP"],
    },
    {
        id: "edit-distance",
        name: "Edit Distance",
        category: "dynamic-programming",
        icon: List,
        difficulty: "Hard",
        description: "Minimum operations to convert one string to another",
        detailedDescription: "Levenshtein distance - minimum number of edits (insert, delete, substitute) to change one word into another.",
        timeComplexity: {
            avg: "O(N*M)",
            worst: "O(N*M)",
        },
        spaceComplexity: {
            auxiliary: "O(N*M)",
        },
        prerequisites: ["Strings", "2D DP"],
        steps: [
            "Initialize DP table",
            "If matching, copy diagonal",
            "Else min of insert/delete/replace + 1",
        ],
        codeExample: {
            javascript: `function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i-1] === word2[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i-1][j],    // delete
          dp[i][j-1],    // insert
          dp[i-1][j-1]   // replace
        );
      }
    }
  }
  return dp[m][n];
}`
        },
        variations: [{ name: "One Edit Distance", desc: "Distance exactly 1" }],
        interviewQuestions: ["Wildcard Matching"],
        tips: ["Base cases are transforming to empty string"],
    },
    {
        id: "subset-sum",
        name: "Subset Sum",
        category: "dynamic-programming",
        icon: Check,
        difficulty: "Medium",
        description: "Determine if any subset sums to a target value",
        detailedDescription: "Decision problem to find if a subset exists with a given sum.",
        timeComplexity: {
            avg: "O(N*Sum)",
            worst: "O(N*Sum)",
        },
        spaceComplexity: {
            auxiliary: "O(Sum)",
        },
        prerequisites: ["Knapsack"],
        steps: [
            "Initialize DP table",
            "Iterate items and sums",
            "Include or exclude item",
        ],
        codeExample: {
            javascript: `function isSubsetSum(arr, sum) {
  const n = arr.length;
  const dp = Array(sum + 1).fill(false);
  dp[0] = true;
  
  for (const num of arr) {
    for (let j = sum; j >= num; j--) {
      dp[j] = dp[j] || dp[j - num];
    }
  }
  return dp[sum];
}`
        },
        variations: [{ name: "Partition Equal Subset Sum", desc: "Split array in two" }],
        interviewQuestions: ["Target Sum"],
        tips: ["Pseudo-polynomial time"],
    },

    {
        id: "level-order-traversal",
        name: "Level Order Traversal",
        category: "tree",
        icon: Layers,
        difficulty: "Medium",
        description: "Visit nodes level by level",
        detailedDescription: "Breadth-First Search traversal visiting nodes depth by depth using a queue.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(w)",
        },
        prerequisites: ["Queue", "BFS"],
        steps: [
            "Push root to queue",
            "While queue not empty",
            "Pop node, process",
            "Push children to queue",
        ],
        codeExample: {
            javascript: `function levelOrder(root) {
  if (!root) return [];
  const res = [], q = [root];
  
  while (q.length) {
    const levelSize = q.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = q.shift();
      level.push(node.val);
      if (node.left) q.push(node.left);
      if (node.right) q.push(node.right);
    }
    res.push(level);
  }
  return res;
}`
        },
        variations: [{ name: "Zigzag Level Order", desc: "Reverse direction on alternate levels" }],
        interviewQuestions: ["Binary Tree Level Order Traversal", "Binary Tree Zigzag Level Order Traversal"],
        tips: ["Use queue size to separate levels", "Can use DFS with depth tracking"],
    },
    {
        id: "bst-operations",
        name: "BST Operations",
        category: "tree",
        icon: GitBranch,
        difficulty: "Medium",
        description: "Search and insert operations in Binary Search Tree",
        detailedDescription: "BST operations exploit the property that left child < root < right child for efficient searching and insertion.",
        timeComplexity: {
            avg: "O(log n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(h)",
        },
        prerequisites: ["Binary Tree", "Recursion"],
        steps: [
            "Compare value with root",
            "Go left if smaller, right if larger",
            "Recursively search/insert",
        ],
        codeExample: {
            javascript: `function searchBST(root, val) {
  if (!root || root.val === val) return root;
  return val < root.val ? searchBST(root.left, val) : searchBST(root.right, val);
}

function insertIntoBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) {
    root.left = insertIntoBST(root.left, val);
  } else {
    root.right = insertIntoBST(root.right, val);
  }
  return root;
}`
        },
        variations: [{ name: "Delete Node", desc: "Handle 3 cases: no child, one child, two children" }],
        interviewQuestions: ["Search in a Binary Search Tree", "Insert into a Binary Search Tree", "Delete Node in a BST"],
        tips: ["BST property allows O(log n) average time", "Worst case O(n) for skewed tree"],
    },
    {
        id: "lca",
        name: "Lowest Common Ancestor",
        category: "tree",
        icon: GitBranch,
        difficulty: "Medium",
        description: "Find lowest common ancestor of two nodes",
        detailedDescription: "LCA of nodes p and q is the lowest node that has both p and q as descendants.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(h)",
        },
        prerequisites: ["DFS", "Recursion"],
        steps: [
            "If root is p or q, return root",
            "Recurse on left and right",
            "If both return non-null, root is LCA",
            "Otherwise return the non-null result",
        ],
        codeExample: {
            javascript: `function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  
  if (left && right) return root;
  return left ? left : right;
}`
        },
        variations: [{ name: "LCA in BST", desc: "Use BST property for O(log n)" }],
        interviewQuestions: ["Lowest Common Ancestor of a Binary Tree", "LCA of BST"],
        tips: ["For BST, LCA is the split point", "Can use parent pointers for O(1) space"],
    },
    {
        id: "tree-properties",
        name: "Tree Height & Diameter",
        category: "tree",
        icon: GitBranch,
        difficulty: "Medium",
        description: "Calculate height and diameter of a tree",
        detailedDescription: "Height is the maximum depth from root. Diameter is the longest path between any two nodes.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(h)",
        },
        prerequisites: ["DFS", "Recursion"],
        steps: [
            "Height: 1 + max(left height, right height)",
            "Diameter: track max of (left height + right height)",
        ],
        codeExample: {
            javascript: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

let maxDiameter = 0;
function diameter(root) {
  if (!root) return 0;
  const leftH = diameter(root.left);
  const rightH = diameter(root.right);
  maxDiameter = Math.max(maxDiameter, leftH + rightH);
  return 1 + Math.max(leftH, rightH);
}`
        },
        variations: [{ name: "Width of tree", desc: "Maximum number of nodes at any level" }],
        interviewQuestions: ["Maximum Depth of Binary Tree", "Diameter of Binary Tree"],
        tips: ["Diameter might not pass through root", "Can compute both in single traversal"],
    },
    {
        id: "check-balanced",
        name: "Check Balanced Binary Tree",
        category: "tree",
        icon: GitBranch,
        difficulty: "Easy",
        description: "Determine if a binary tree is height-balanced",
        detailedDescription: "A tree is balanced if the depth of two subtrees of every node never differs by more than one.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(h)",
        },
        prerequisites: ["Tree Height"],
        steps: [
            "Calculate height of left and right subtrees",
            "If height difference > 1, return -1 (unbalanced)",
            "Otherwise return height",
        ],
        codeExample: {
            javascript: `function isBalanced(root) {
  return checkHeight(root) !== -1;
}

function checkHeight(node) {
  if (!node) return 0;
  
  const leftH = checkHeight(node.left);
  if (leftH === -1) return -1;
  
  const rightH = checkHeight(node.right);
  if (rightH === -1) return -1;
  
  if (Math.abs(leftH - rightH) > 1) return -1;
  return Math.max(leftH, rightH) + 1;
}`
        },
        variations: [{ name: "AVL Tree", desc: "Self-balancing BST" }],
        interviewQuestions: ["Balanced Binary Tree"],
        tips: ["Bottom-up approach is O(n)", "Top-down would be O(n^2)"],
    },
    {
        id: "serialize-deserialize-tree",
        name: "Serialize & Deserialize Tree",
        category: "tree",
        icon: GitBranch,
        difficulty: "Hard",
        description: "Convert tree to string and back",
        detailedDescription: "Serialization converts a tree to a string representation. Deserialization rebuilds the tree from the string.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(n)",
        },
        prerequisites: ["Preorder/Level Order Traversal"],
        steps: [
            "Serialize: Preorder traversal with null markers",
            "Deserialize: Use queue/recursion to rebuild",
        ],
        codeExample: {
            javascript: `function serialize(root) {
  if (!root) return "X,";
  return root.val + "," + serialize(root.left) + serialize(root.right);
}

function deserialize(data) {
  const queue = data.split(",");
  
  function build() {
    const val = queue.shift();
    if (val === "X") return null;
    const node = new TreeNode(parseInt(val));
    node.left = build();
    node.right = build();
    return node;
  }
  
  return build();
}`
        },
        variations: [{ name: "Level Order Serialization", desc: "BFS approach" }],
        interviewQuestions: ["Serialize and Deserialize Binary Tree", "Serialize and Deserialize BST"],
        tips: ["Use special marker for null nodes", "Preorder makes deserialization easier"],
    },

    {
        id: "naive-string-search",
        name: "String Matching (Naive)",
        category: "string",
        icon: Search,
        difficulty: "Easy",
        description: "Find pattern in text using nested loops",
        detailedDescription: "Slides the pattern over text one by one and checks for a match at each position.",
        timeComplexity: {
            avg: "O(N*M)",
            worst: "O(N*M)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Strings"],
        steps: [
            "Loop through text from 0 to N-M",
            "For each position, check if pattern matches",
            "Return index if match found",
        ],
        codeExample: {
            javascript: `function naiveSearch(text, pattern) {
  const n = text.length, m = pattern.length;
  
  for (let i = 0; i <= n - m; i++) {
    let j;
    for (j = 0; j < m; j++) {
      if (text[i + j] !== pattern[j]) break;
    }
    if (j === m) return i; // match found
  }
  return -1;
}`
        },
        variations: [{ name: "Find all occurrences", desc: "Continue searching after match" }],
        interviewQuestions: ["Implement strStr()", "Find the Index of the First Occurrence"],
        tips: ["Simple but inefficient for large texts", "Good for small patterns"],
    },
    {
        id: "rabin-karp",
        name: "Rabin-Karp Algorithm",
        category: "string",
        icon: Hash,
        difficulty: "Medium",
        description: "Pattern matching using rolling hash",
        detailedDescription: "Uses hashing to find pattern in text. Compares hash values first, then verifies with character comparison.",
        timeComplexity: {
            avg: "O(N+M)",
            worst: "O(N*M)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Hashing", "Rolling Hash"],
        steps: [
            "Calculate hash of pattern and first window",
            "Slide window, update hash using rolling hash",
            "If hashes match, verify character by character",
        ],
        codeExample: {
            javascript: `function rabinKarp(text, pattern) {
  const d = 256, q = 101; // d: alphabet size, q: prime number
  const n = text.length, m = pattern.length;
  let p = 0, t = 0, h = 1;
  
  // Calculate h = d^(m-1) % q
  for (let i = 0; i < m - 1; i++) {
    h = (h * d) % q;
  }
  
  // Calculate initial hash values
  for (let i = 0; i < m; i++) {
    p = (d * p + pattern.charCodeAt(i)) % q;
    t = (d * t + text.charCodeAt(i)) % q;
  }
  
  // Slide pattern over text
  for (let i = 0; i <= n - m; i++) {
    if (p === t) {
      // Hash match, verify characters
      if (text.substring(i, i + m) === pattern) return i;
    }
    if (i < n - m) {
      // Calculate hash for next window
      t = (d * (t - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
      if (t < 0) t += q;
    }
  }
  return -1;
}`
        },
        variations: [{ name: "Multiple Pattern Search", desc: "Search for multiple patterns" }],
        interviewQuestions: ["Repeated DNA Sequences", "Longest Duplicate Substring"],
        tips: ["Good for multiple pattern search", "Watch out for hash collisions"],
    },
    {
        id: "z-algorithm",
        name: "Z Algorithm",
        category: "string",
        icon: Search,
        difficulty: "Hard",
        description: "Pattern matching using Z-array",
        detailedDescription: "Constructs Z-array where Z[i] is the length of longest substring starting from i which is also a prefix of the string.",
        timeComplexity: {
            avg: "O(N+M)",
            worst: "O(N+M)",
        },
        spaceComplexity: {
            auxiliary: "O(N+M)",
        },
        prerequisites: ["String Processing"],
        steps: [
            "Concatenate pattern + '$' + text",
            "Build Z-array",
            "Check if Z[i] equals pattern length",
        ],
        codeExample: {
            javascript: `function zAlgorithm(str) {
  const n = str.length;
  const Z = Array(n).fill(0);
  let L = 0, R = 0;
  
  for (let i = 1; i < n; i++) {
    if (i > R) {
      L = R = i;
      while (R < n && str[R - L] === str[R]) R++;
      Z[i] = R - L;
      R--;
    } else {
      let k = i - L;
      if (Z[k] < R - i + 1) {
        Z[i] = Z[k];
      } else {
        L = i;
        while (R < n && str[R - L] === str[R]) R++;
        Z[i] = R - L;
        R--;
      }
    }
  }
  return Z;
}`
        },
        variations: [{ name: "Pattern matching", desc: "Use Z-array to find pattern occurrences" }],
        interviewQuestions: ["String Matching", "Longest Happy Prefix"],
        tips: ["Linear time pattern matching", "Maintains [L, R] interval"],
    },
    {
        id: "longest-palindromic-substring",
        name: "Longest Palindromic Substring",
        category: "string",
        icon: Repeat,
        difficulty: "Medium",
        description: "Find the longest palindrome substring",
        detailedDescription: "A palindrome reads the same forward and backward. Find the longest such substring.",
        timeComplexity: {
            avg: "O(n^2)",
            worst: "O(n^2)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Strings", "Two Pointers"],
        steps: [
            "Expand around center for each character",
            "Handle both odd and even length palindromes",
            "Track the longest palindrome found",
        ],
        codeExample: {
            javascript: `function longestPalindrome(s) {
  let result = "";
  
  for (let i = 0; i < s.length; i++) {
    // Odd length palindrome
    let odd = expandAroundCenter(s, i, i);
    if (odd.length > result.length) result = odd;
    
    // Even length palindrome
    let even = expandAroundCenter(s, i, i + 1);
    if (even.length > result.length) result = even;
  }
  return result;
}

function expandAroundCenter(s, left, right) {
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--;
    right++;
  }
  return s.substring(left + 1, right);
}`
        },
        variations: [{ name: "Manacher's Algorithm", desc: "O(n) time solution" }],
        interviewQuestions: ["Longest Palindromic Substring", "Palindromic Substrings"],
        tips: ["Expand around center is space efficient", "Can use DP for O(n^2) time and space"],
    },
    {
        id: "anagram-check",
        name: "Anagram Checking",
        category: "string",
        icon: List,
        difficulty: "Easy",
        description: "Check if two strings are anagrams",
        detailedDescription: "Two strings are anagrams if they contain the same characters with the same frequencies.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Hash Map"],
        steps: [
            "Check if lengths are equal",
            "Count character frequencies in first string",
            "Decrement frequencies for second string",
            "Verify all frequencies are zero",
        ],
        codeExample: {
            javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  
  const count = {};
  for (let char of s) {
    count[char] = (count[char] || 0) + 1;
  }
  
  for (let char of t) {
    if (!count[char]) return false;
    count[char]--;
  }
  
  return true;
}`
        },
        variations: [{ name: "Group Anagrams", desc: "Group list of anagrams together" }],
        interviewQuestions: ["Valid Anagram", "Group Anagrams", "Find All Anagrams in a String"],
        tips: ["Use array of size 26 for lowercase letters", "Sorting is O(n log n) alternative"],
    },
    {
        id: "string-reverse-rotate",
        name: "String Reversal & Rotation",
        category: "string",
        icon: RotateCw,
        difficulty: "Easy",
        description: "Basic string manipulation operations",
        detailedDescription: "Common string operations: reversing reverses character order, rotating shifts characters.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(n)",
        },
        prerequisites: ["Arrays", "Strings"],
        steps: [
            "Reverse: Use two pointers or built-in methods",
            "Rotate: Use string slicing or three reversals",
        ],
        codeExample: {
            javascript: `function reverseString(s) {
  return s.split('').reverse().join('');
  // Or using two pointers for in-place on array
}

function rotateString(s, k) {
  k = k % s.length; // Handle k > length
  // Right rotate by k
  return s.slice(s.length - k) + s.slice(0, s.length - k);
}

// Check if s2 is rotation of s1
function isRotation(s1, s2) {
  return s1.length === s2.length && (s1 + s1).includes(s2);
}`
        },
        variations: [{ name: "Reverse Words", desc: "Reverse word order in sentence" }],
        interviewQuestions: ["Rotate String", "Reverse String", "Reverse Words in a String"],
        tips: ["Strings immutable in JS, need new string", "Three reversals: reverse(reverse(0,k-1) + reverse(k,n-1))"],
    },

    {
        id: "orientation-of-points",
        name: "Orientation of Points",
        category: "geometry",
        icon: Target,
        difficulty: "Medium",
        description: "Determine orientation of ordered triplet of points",
        detailedDescription: "Find if three points are clockwise, counterclockwise, or collinear. Used in many geometric algorithms.",
        timeComplexity: {
            avg: "O(1)",
            worst: "O(1)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Basic Math"],
        steps: [
            "Calculate cross product of vectors",
            "If positive: counterclockwise",
            "If negative: clockwise",
            "If zero: collinear",
        ],
        codeExample: {
            javascript: `function orientation(p1, p2, p3) {
  // Calculate (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y)
  const val = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
  
  if (val === 0) return 0; // Collinear
  return (val > 0) ? 1 : 2; // 1: Clockwise, 2: Counterclockwise
}`
        },
        variations: [{ name: "3D orientation", desc: "Extend to 3D space" }],
        interviewQuestions: ["Convex Hull", "Line Intersection"],
        tips: ["Foundation for many geometric algorithms", "Watch for floating point precision"],
    },
    {
        id: "line-intersection",
        name: "Line Intersection",
        category: "geometry",
        icon: Target,
        difficulty: "Hard",
        description: "Check if two line segments intersect",
        detailedDescription: "Determine if two line segments intersect using orientation and boundary checks.",
        timeComplexity: {
            avg: "O(1)",
            worst: "O(1)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Orientation of Points"],
        steps: [
            "Find orientations of all 4 combinations",
            "Check general and special cases",
            "Handle collinear points on segment",
        ],
        codeExample: {
            javascript: `function doSegmentsIntersect(p1, q1, p2, q2) {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);
  
  // General case
  if (o1 !== o2 && o3 !== o4) return true;
  
  // Special cases (collinear points on segment)
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  
  return false;
}

function onSegment(p, q, r) {
  return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
         q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}`
        },
        variations: [{ name: "Ray intersection", desc: "Intersection with infinite rays" }],
        interviewQuestions: ["Valid Square", "Rectangle Overlap"],
        tips: ["Handle edge cases carefully", "Consider floating point precision"],
    },
    {
        id: "convex-hull-graham",
        name: "Convex Hull (Graham Scan)",
        category: "geometry",
        icon: Hexagon,
        difficulty: "Hard",
        description: "Find convex hull using Graham Scan algorithm",
        detailedDescription: "Finds the convex hull by sorting points by polar angle and using a stack to maintain the hull.",
        timeComplexity: {
            avg: "O(n log n)",
            worst: "O(n log n)",
        },
        spaceComplexity: {
            auxiliary: "O(n)",
        },
        prerequisites: ["Orientation of Points", "Sorting"],
        steps: [
            "Find bottom-most point (or leftmost if tie)",
            "Sort points by polar angle with respect to first point",
            "Process points using stack",
            "Keep only left turns (counterclockwise)",
        ],
        codeExample: {
            javascript: `function grahamScan(points) {
  if (points.length < 3) return points;
  
  // Find bottom-most point
  let bottom = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[bottom].y || 
        (points[i].y === points[bottom].y && points[i].x < points[bottom].x)) {
      bottom = i;
    }
  }
  [points[0], points[bottom]] = [points[bottom], points[0]];
  
  const p0 = points[0];
  // Sort by polar angle
  points.slice(1).sort((a, b) => {
    const orient = orientation(p0, a, b);
    if (orient === 0) {
      return dist(p0, a) - dist(p0, b);
    }
    return orient === 2 ? -1 : 1;
  });
  
  const stack = [points[0], points[1], points[2]];
  for (let i = 3; i < points.length; i++) {
    while (stack.length > 1 && 
           orientation(stack[stack.length-2], stack[stack.length-1], points[i]) !== 2) {
      stack.pop();
    }
    stack.push(points[i]);
  }
  return stack;
}`
        },
        variations: [{ name: "Monotone Chain", desc: "Alternative O(n log n) algorithm" }],
        interviewQuestions: ["Erect the Fence"],
        tips: ["Sort by angle is key step", "Stack maintains convex property"],
    },
    {
        id: "convex-hull-jarvis",
        name: "Convex Hull (Jarvis March)",
        category: "geometry",
        icon: Hexagon,
        difficulty: "Hard",
        description: "Find convex hull using Jarvis March (Gift Wrapping)",
        detailedDescription: "Finds convex hull by wrapping around the points, selecting the most counterclockwise point at each step.",
        timeComplexity: {
            avg: "O(n*h)",
            worst: "O(n^2)",
        },
        spaceComplexity: {
            auxiliary: "O(h)",
        },
        prerequisites: ["Orientation of Points"],
        steps: [
            "Start with leftmost point",
            "Find most counterclockwise point from current",
            "Add to hull and repeat",
            "Stop when back at start",
        ],
        codeExample: {
            javascript: `function jarvisMarch(points) {
  const n = points.length;
  if (n < 3) return points;
  
  const hull = [];
  
  // Find leftmost point
  let l = 0;
  for (let i = 1; i < n; i++) {
    if (points[i].x < points[l].x) l = i;
  }
  
  let p = l, q;
  do {
    hull.push(points[p]);
    q = (p + 1) % n;
    
    for (let i = 0; i < n; i++) {
      if (orientation(points[p], points[i], points[q]) === 2) {
        q = i;
      }
    }
    p = q;
  } while (p !== l);
  
  return hull;
}`
        },
        variations: [{ name: "Chan's Algorithm", desc: "Combines Graham and Jarvis" }],
        interviewQuestions: ["Erect the Fence"],
        tips: ["Output sensitive: better when h is small", "Simpler to implement than Graham"],
    },
    {
        id: "point-in-polygon",
        name: "Point Inside Polygon",
        category: "geometry",
        icon: Target,
        difficulty: "Medium",
        description: "Check if a point lies inside a polygon",
        detailedDescription: "Uses ray casting algorithm: draw a ray from point to infinity and count intersections with polygon edges.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Line Intersection"],
        steps: [
            "Draw horizontal ray from point to infinity",
            "Count intersections with polygon edges",
            "If odd: inside, if even: outside",
        ],
        codeExample: {
            javascript: `function isPointInPolygon(point, polygon) {
  const n = polygon.length;
  if (n < 3) return false;
  
  let count = 0;
  const extreme = { x: Infinity, y: point.y };
  
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    if (doSegmentsIntersect(polygon[i], polygon[next], point, extreme)) {
      if (orientation(polygon[i], point, polygon[next]) === 0) {
        return onSegment(polygon[i], point, polygon[next]);
      }
      count++;
    }
  }
  
  return count % 2 === 1;
}`
        },
        variations: [{ name: "Winding Number", desc: "Alternative algorithm" }],
        interviewQuestions: ["Valid Boomerang"],
        tips: ["Handle edge cases: point on edge", "Ray casting is most common method"],
    },
    {
        id: "distance-two-points",
        name: "Distance Between Two Points",
        category: "geometry",
        icon: Target,
        difficulty: "Easy",
        description: "Calculate Euclidean distance between two points",
        detailedDescription: "Uses the Pythagorean theorem to find straight-line distance in 2D or 3D space.",
        timeComplexity: {
            avg: "O(1)",
            worst: "O(1)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Basic Math"],
        steps: [
            "Calculate difference in x coordinates",
            "Calculate difference in y coordinates",
            "Apply Pythagorean theorem: sqrt(dx^2 + dy^2)",
        ],
        codeExample: {
            javascript: `function distance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// For 3D points
function distance3D(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Squared distance (avoid sqrt for comparisons)
function distanceSquared(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}`
        },
        variations: [{ name: "Manhattan Distance", desc: "|x1-x2| + |y1-y2|" }],
        interviewQuestions: ["K Closest Points to Origin", "Valid Square"],
        tips: ["Use squared distance for comparisons", "Avoid sqrt when possible"],
    },

    {
        id: "euclidean-gcd",
        name: "Euclidean Algorithm (GCD)",
        category: "math",
        icon: Calculator,
        difficulty: "Easy",
        description: "Find Greatest Common Divisor of two numbers",
        detailedDescription: "Efficient algorithm to find GCD using repeated division. Forms basis for many number theory algorithms.",
        timeComplexity: {
            avg: "O(log min(a,b))",
            worst: "O(log min(a,b))",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Basic Math"],
        steps: [
            "If b = 0, return a",
            "Otherwise, gcd(a,b) = gcd(b, a mod b)",
            "Repeat until b = 0",
        ],
        codeExample: {
            javascript: `function gcd(a, b) {
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Recursive version
function gcdRecursive(a, b) {
  return b === 0 ? a : gcdRecursive(b, a % b);
}

// LCM using GCD
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}`
        },
        variations: [{ name: "Extended Euclidean", desc: "Find coefficients for Bezout's identity" }],
        interviewQuestions: ["Greatest Common Divisor of Strings", "Valid Square"],
        tips: ["Foundation for modular arithmetic", "Can find LCM from GCD"],
    },
    {
        id: "fast-exponentiation",
        name: "Fast Exponentiation",
        category: "math",
        icon: Zap,
        difficulty: "Medium",
        description: "Calculate power efficiently using binary exponentiation",
        detailedDescription: "Computes a^n in O(log n) time by repeatedly squaring and using binary representation of exponent.",
        timeComplexity: {
            avg: "O(log n)",
            worst: "O(log n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Binary Numbers"],
        steps: [
            "If exponent is 0, return 1",
            "If exponent is even: result = (base^(n/2))^2",
            "If exponent is odd: result = base * base^(n-1)",
        ],
        codeExample: {
            javascript: `function power(base, exp) {
  let result = 1;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result *= base;
    }
    base *= base;
    exp = Math.floor(exp / 2);
  }
  return result;
}

// With modulo (for large numbers)
function powerMod(base, exp, mod) {
  let result = 1;
  base %= mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    base = (base * base) % mod;
    exp = Math.floor(exp / 2);
  }
  return result;
}`
        },
        variations: [{ name: "Matrix Exponentiation", desc: "Fast Fibonacci computation" }],
        interviewQuestions: ["Pow(x, n)", "Super Pow"],
        tips: ["Key for modular exponentiation", "Handles large exponents efficiently"],
    },
    {
        id: "modular-arithmetic",
        name: "Modular Arithmetic",
        category: "math",
        icon: Calculator,
        difficulty: "Medium",
        description: "Operations with modulo to handle large numbers",
        detailedDescription: "Techniques for addition, multiplication, and exponentiation under modulo to prevent overflow.",
        timeComplexity: {
            avg: "O(1) per operation",
            worst: "O(1) per operation",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Basic Math"],
        steps: [
            "Addition: (a + b) % m",
            "Multiplication: ((a % m) * (b % m)) % m",
            "Subtraction: ((a - b) % m + m) % m",
        ],
        codeExample: {
            javascript: `const MOD = 1e9 + 7;

function addMod(a, b) {
  return ((a % MOD) + (b % MOD)) % MOD;
}

function mulMod(a, b) {
  return ((a % MOD) * (b % MOD)) % MOD;
}

function subMod(a, b) {
  return ((a % MOD) - (b % MOD) + MOD) % MOD;
}

// Modular inverse using Fermat's little theorem
function modInverse(a, m = MOD) {
  return powerMod(a, m - 2, m);
}

function divMod(a, b) {
  return mulMod(a, modInverse(b));
}`
        },
        variations: [{ name: "Modular Inverse", desc: "Division in modular arithmetic" }],
        interviewQuestions: ["Count Good Numbers", "Number of Ways to Arrive at Destination"],
        tips: ["Essential for competitive programming", "Watch for negative numbers in subtraction"],
    },
    {
        id: "prime-factorization",
        name: "Prime Factorization",
        category: "math",
        icon: Calculator,
        difficulty: "Medium",
        description: "Find all prime factors of a number",
        detailedDescription: "Decomposes a number into its prime factors using trial division up to sqrt(n).",
        timeComplexity: {
            avg: "O(sqrt(n))",
            worst: "O(sqrt(n))",
        },
        spaceComplexity: {
            auxiliary: "O(log n)",
        },
        prerequisites: ["Prime Numbers"],
        steps: [
            "Divide by 2 until odd",
            "Try odd numbers from 3 to sqrt(n)",
            "If number > 1 remains, it's prime",
        ],
        codeExample: {
            javascript: `function primeFactorization(n) {
  const factors = [];
  
  // Handle 2s
  while (n % 2 === 0) {
    factors.push(2);
    n = Math.floor(n / 2);
  }
  
  // Try odd factors
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    while (n % i === 0) {
      factors.push(i);
      n = Math.floor(n / i);
    }
  }
  
  // If n is prime > 2
  if (n > 2) factors.push(n);
  
  return factors;
}

// Count of each prime factor
function primeFactorsCount(n) {
  const count = {};
  // ... similar logic but track counts
  return count;
}`
        },
        variations: [{ name: "Sieve of Eratosthenes", desc: "Precompute primes" }],
        interviewQuestions: ["Count Primes", "Ugly Number"],
        tips: ["Only check up to sqrt(n)", "Optimize by checking 2 separately"],
    },
    {
        id: "counting-digits-factors",
        name: "Counting Digits & Factors",
        category: "math",
        icon: ChartBar,
        difficulty: "Easy",
        description: "Count digits and factors of a number",
        detailedDescription: "Basic mathematical operations to count properties of numbers.",
        timeComplexity: {
            avg: "O(log n) or O(sqrt n)",
            worst: "O(log n) or O(sqrt n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Basic Math"],
        steps: [
            "Digits: Divide by 10 repeatedly",
            "Factors: Check divisibility up to sqrt(n)",
        ],
        codeExample: {
            javascript: `function countDigits(n) {
  if (n === 0) return 1;
  return Math.floor(Math.log10(Math.abs(n))) + 1;
  // Or: n.toString().length
}

function countFactors(n) {
  let count = 0;
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      count += (i * i === n) ? 1 : 2;
    }
  }
  return count;
}

function sumOfDigits(n) {
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}`
        },
        variations: [{ name: "Digit DP", desc: "Count numbers with digit constraints" }],
        interviewQuestions: ["Add Digits", "Happy Number", "Self Dividing Numbers"],
        tips: ["Log10 gives digit count quickly", "Pair factors to optimize"],
    },
    {
        id: "fibonacci-math",
        name: "Fibonacci (Math-based)",
        category: "math",
        icon: Calculator,
        difficulty: "Hard",
        description: "Mathematical approaches to Fibonacci numbers",
        detailedDescription: "Advanced Fibonacci computation using matrix exponentiation or Binet's formula.",
        timeComplexity: {
            avg: "O(log n)",
            worst: "O(log n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Matrix Multiplication", "Fast Exponentiation"],
        steps: [
            "Matrix method: Use [[1,1],[1,0]]^n",
            "Binet's formula: Use golden ratio",
        ],
        codeExample: {
            javascript: `// Matrix exponentiation method
function fibMatrix(n) {
  if (n <= 1) return n;
  
  function multiply(A, B) {
    return [
      [A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
      [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]
    ];
  }
  
  function matPower(M, n) {
    if (n === 1) return M;
    if (n % 2 === 0) {
      const half = matPower(M, n / 2);
      return multiply(half, half);
    }
    return multiply(M, matPower(M, n - 1));
  }
  
  const base = [[1, 1], [1, 0]];
  const result = matPower(base, n);
  return result[0][1];
}

// Binet's formula (approximate for large n)
function fibBinet(n) {
  const phi = (1 + Math.sqrt(5)) / 2;
  return Math.round(Math.pow(phi, n) / Math.sqrt(5));
}`
        },
        variations: [{ name: "DP approach", desc: "O(n) time with memoization" }],
        interviewQuestions: ["Climbing Stairs", "Fibonacci Number"],
        tips: ["Matrix method is exact", "Binet's has rounding errors for large n"],
    },
    {
        id: "power-of-two-check",
        name: "Power of Two Check",
        category: "math",
        icon: Binary,
        difficulty: "Easy",
        description: "Check if a number is a power of two",
        detailedDescription: "Uses bit manipulation trick: power of 2 has exactly one bit set in binary.",
        timeComplexity: {
            avg: "O(1)",
            worst: "O(1)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Bit Manipulation"],
        steps: [
            "Check if n > 0",
            "Check if (n & (n-1)) == 0",
        ],
        codeExample: {
            javascript: `function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

// Alternative: count set bits
function isPowerOfTwoCount(n) {
  if (n <= 0) return false;
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n >>= 1;
  }
  return count === 1;
}

// Check power of any number k
function isPowerOfK(n, k) {
  if (n <= 0) return false;
  while (n % k === 0) {
    n /= k;
  }
  return n === 1;
}`
        },
        variations: [{ name: "Power of Three", desc: "Check n % 3 repeatedly" }],
        interviewQuestions: ["Power of Two", "Power of Three", "Power of Four"],
        tips: ["Bit trick: n & (n-1) clears lowest bit", "Works because powers of 2 have single bit"],
    },

    {
        id: "linked-list-traversal",
        name: "Linked List Traversal",
        category: "linked-list",
        icon: Link,
        difficulty: "Easy",
        description: "Iterate through a linked list",
        detailedDescription: "Basic operation to visit each node in a linked list sequentially.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Linked List basics"],
        steps: [
            "Start at head node",
            "Process current node",
            "Move to next node",
            "Repeat until null",
        ],
        codeExample: {
            javascript: `function traverse(head) {
  let current = head;
  while (current !== null) {
    console.log(current.val); // Process node
    current = current.next;
  }
}

// Recursive traversal
function traverseRecursive(node) {
  if (node === null) return;
  console.log(node.val);
  traverseRecursive(node.next);
}

// Count nodes
function countNodes(head) {
  let count = 0;
  let current = head;
  while (current !== null) {
    count++;
    current = current.next;
  }
  return count;
}`
        },
        variations: [{ name: "Backward traversal", desc: "Requires recursion or stack" }],
        interviewQuestions: ["Print Linked List", "Linked List Length"],
        tips: ["Always check for null before accessing node", "Can use recursion but watch stack overflow"],
    },
    {
        id: "linked-list-insert-delete",
        name: "Insertion & Deletion",
        category: "linked-list",
        icon: Link,
        difficulty: "Medium",
        description: "Insert and delete nodes in linked list",
        detailedDescription: "Basic operations to modify linked list structure by adding or removing nodes.",
        timeComplexity: {
            avg: "O(1) at position, O(n) search",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Linked List Traversal"],
        steps: [
            "Insert: Update pointers to include new node",
            "Delete: Update pointers to skip node",
            "Handle edge cases: head, tail, single node",
        ],
        codeExample: {
            javascript: `// Insert at beginning
function insertAtHead(head, val) {
  const newNode = new ListNode(val);
  newNode.next = head;
  return newNode;
}

// Insert at position
function insertAtPosition(head, val, pos) {
  if (pos === 0) return insertAtHead(head, val);
  
  let current = head;
  for (let i = 0; i < pos - 1 && current; i++) {
    current = current.next;
  }
  if (!current) return head; // Invalid position
  
  const newNode = new ListNode(val);
  newNode.next = current.next;
  current.next = newNode;
  return head;
}

// Delete node with value
function deleteNode(head, val) {
  if (!head) return null;
  if (head.val === val) return head.next;
  
  let current = head;
  while (current.next && current.next.val !== val) {
    current = current.next;
  }
  if (current.next) {
    current.next = current.next.next;
  }
  return head;
}`
        },
        variations: [{ name: "Doubly Linked List", desc: "Update prev pointers too" }],
        interviewQuestions: ["Delete Node in a Linked List", "Insert into a Sorted Circular Linked List"],
        tips: ["Use dummy node to simplify edge cases", "Always update pointers in correct order"],
    },
    {
        id: "reverse-linked-list",
        name: "Reverse Linked List",
        category: "linked-list",
        icon: ArrowRightLeft,
        difficulty: "Medium",
        description: "Reverse the direction of a linked list",
        detailedDescription: "Classic problem to reverse pointers so list flows in opposite direction.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(1) iterative, O(n) recursive",
        },
        prerequisites: ["Linked List basics"],
        steps: [
            "Track previous, current, next nodes",
            "Reverse current.next to point to previous",
            "Move all pointers forward",
            "Return new head",
        ],
        codeExample: {
            javascript: `// Iterative approach
function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current !== null) {
    let next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}

// Recursive approach
function reverseListRecursive(head) {
  if (!head || !head.next) return head;
  
  const newHead = reverseListRecursive(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}

// Reverse between positions
function reverseBetween(head, left, right) {
  // ... implementation
}`
        },
        variations: [{ name: "Reverse in groups", desc: "Reverse k nodes at a time" }],
        interviewQuestions: ["Reverse Linked List", "Reverse Linked List II", "Reverse Nodes in k-Group"],
        tips: ["Draw diagram for pointer manipulation", "Iterative uses O(1) space"],
    },
    {
        id: "find-middle-linked-list",
        name: "Find Middle of Linked List",
        category: "linked-list",
        icon: Target,
        difficulty: "Easy",
        description: "Find the middle node using slow/fast pointers",
        detailedDescription: "Uses two-pointer technique: slow moves 1 step, fast moves 2 steps. When fast reaches end, slow is at middle.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Two Pointers"],
        steps: [
            "Initialize slow and fast to head",
            "Move slow by 1, fast by 2",
            "When fast reaches end, slow is at middle",
        ],
        codeExample: {
            javascript: `function findMiddle(head) {
  if (!head) return null;
  
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  
  return slow; // For odd length, returns middle. For even, returns second middle
}

// To get first middle in even-length list
function findFirstMiddle(head) {
  if (!head || !head.next) return head;
  
  let slow = head;
  let fast = head.next;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`
        },
        variations: [{ name: "Delete middle", desc: "Find and remove middle node" }],
        interviewQuestions: ["Middle of the Linked List", "Delete the Middle Node of a Linked List"],
        tips: ["Tortoise and hare technique", "Useful for palindrome check"],
    },
    {
        id: "merge-sorted-lists",
        name: "Merge Two Sorted Lists",
        category: "linked-list",
        icon: Merge,
        difficulty: "Easy",
        description: "Merge two sorted linked lists into one",
        detailedDescription: "Combine two sorted lists by comparing nodes and linking them in sorted order.",
        timeComplexity: {
            avg: "O(n + m)",
            worst: "O(n + m)",
        },
        spaceComplexity: {
            auxiliary: "O(1) iterative, O(n+m) recursive",
        },
        prerequisites: ["Linked List basics"],
        steps: [
            "Use dummy node to simplify",
            "Compare heads of both lists",
            "Attach smaller node to result",
            "Move pointer in that list",
        ],
        codeExample: {
            javascript: `function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let current = dummy;
  
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }
  
  // Attach remaining nodes
  current.next = l1 || l2;
  return dummy.next;
}

// Recursive approach
function mergeTwoListsRecursive(l1, l2) {
  if (!l1) return l2;
  if (!l2) return l1;
  
  if (l1.val <= l2.val) {
    l1.next = mergeTwoListsRecursive(l1.next, l2);
    return l1;
  } else {
    l2.next = mergeTwoListsRecursive(l1, l2.next);
    return l2;
  }
}`
        },
        variations: [{ name: "Merge k lists", desc: "Use min heap or divide & conquer" }],
        interviewQuestions: ["Merge Two Sorted Lists", "Merge k Sorted Lists"],
        tips: ["Dummy node simplifies edge cases", "Don't create new nodes, reuse existing"],
    },
    {
        id: "remove-nth-from-end",
        name: "Remove Nth Node from End",
        category: "linked-list",
        icon: Trash,
        difficulty: "Medium",
        description: "Remove the nth node from the end in one pass",
        detailedDescription: "Uses two-pointer technique with n-gap between pointers to find and remove node.",
        timeComplexity: {
            avg: "O(n)",
            worst: "O(n)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Two Pointers"],
        steps: [
            "Move fast pointer n steps ahead",
            "Move both pointers until fast reaches end",
            "Slow will be at node before target",
            "Skip the target node",
        ],
        codeExample: {
            javascript: `function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0);
  dummy.next = head;
  let fast = dummy;
  let slow = dummy;
  
  // Move fast n+1 steps ahead
  for (let i = 0; i <= n; i++) {
    fast = fast.next;
  }
  
  // Move both until fast reaches end
  while (fast) {
    fast = fast.next;
    slow = slow.next;
  }
  
  // Remove nth node
  slow.next = slow.next.next;
  return dummy.next;
}`
        },
        variations: [{ name: "Remove from beginning", desc: "Standard deletion" }],
        interviewQuestions: ["Remove Nth Node From End of List"],
        tips: ["Dummy node handles removing head", "Maintain n+1 gap for deletion"],
    },
    {
        id: "intersection-two-lists",
        name: "Intersection of Two Linked Lists",
        category: "linked-list",
        icon: Link,
        difficulty: "Medium",
        description: "Find the node where two linked lists intersect",
        detailedDescription: "Uses two-pointer technique where pointers traverse both lists to find intersection point.",
        timeComplexity: {
            avg: "O(n + m)",
            worst: "O(n + m)",
        },
        spaceComplexity: {
            auxiliary: "O(1)",
        },
        prerequisites: ["Two Pointers"],
        steps: [
            "Use two pointers, one for each list",
            "When pointer reaches end, move to other list's head",
            "They'll meet at intersection or null",
        ],
        codeExample: {
            javascript: `function getIntersectionNode(headA, headB) {
  if (!headA || !headB) return null;
  
  let pA = headA;
  let pB = headB;
  
  // When pA reaches end, switch to headB
  // When pB reaches end, switch to headA
  // They will meet at intersection or both become null
  while (pA !== pB) {
    pA = pA ? pA.next : headB;
    pB = pB ? pB.next : headA;
  }
  
  return pA;
}

// Alternative: using lengths
function getIntersectionByLength(headA, headB) {
  let lenA = getLength(headA);
  let lenB = getLength(headB);
  
  // Align starting points
  while (lenA > lenB) {
    headA = headA.next;
    lenA--;
  }
  while (lenB > lenA) {
    headB = headB.next;
    lenB--;
  }
  
  // Find intersection
  while (headA !== headB) {
    headA = headA.next;
    headB = headB.next;
  }
  return headA;
}`
        },
        variations: [{ name: "Using hash set", desc: "O(n) space solution" }],
        interviewQuestions: ["Intersection of Two Linked Lists"],
        tips: ["Clever pointer switching equalizes path lengths", "Works even if no intersection exists"],
    },
];

const CATEGORY_ORDER = [
  "searching",
  "sorting",
  "graph",
  "technique",
  "dynamic-programming",
  "tree",
  "string",
  "geometry",
  "math",
  "linked-list",
];

const DIFFICULTY_RANK = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
};

const sortAlgorithms = (list) => {
  return list
    .map((algo, originalIndex) => ({ algo, originalIndex }))
    .sort((a, b) => {
      const aCat = a.algo.category;
      const bCat = b.algo.category;

      const aCatRank =
        CATEGORY_ORDER.indexOf(aCat) === -1
          ? CATEGORY_ORDER.length + 99
          : CATEGORY_ORDER.indexOf(aCat);
      const bCatRank =
        CATEGORY_ORDER.indexOf(bCat) === -1
          ? CATEGORY_ORDER.length + 99
          : CATEGORY_ORDER.indexOf(bCat);

      if (aCatRank !== bCatRank) return aCatRank - bCatRank;

      const aDiffRank =
        DIFFICULTY_RANK[a.algo.difficulty] ?? 99;
      const bDiffRank =
        DIFFICULTY_RANK[b.algo.difficulty] ?? 99;
      if (aDiffRank !== bDiffRank) return aDiffRank - bDiffRank;

      const byName = (a.algo.name || "").localeCompare(b.algo.name || "");
      if (byName !== 0) return byName;

      return a.originalIndex - b.originalIndex;
    })
    .map(({ algo }) => algo);
};

export const algorithms = sortAlgorithms(rawAlgorithms);
