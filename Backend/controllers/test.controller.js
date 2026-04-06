const TestResult = require("../models/testResult.model");

// =========================================================
// MOCK DATA - 30 MCQ Questions
// =========================================================
const mockMCQs = [
  // Operating Systems (6 questions)
  {
    id: 1,
    question: "Which scheduling algorithm is best suited for time-sharing systems?",
    options: ["FCFS", "SJF", "Round Robin", "Priority Scheduling"],
    correctOption: 2,
    category: "Operating Systems",
    difficulty: "Easy",
  },
  {
    id: 2,
    question: "What is a deadlock?",
    options: [
      "A process waiting for I/O",
      "Circular wait among processes for resources",
      "A process in ready queue",
      "A terminated process",
    ],
    correctOption: 1,
    category: "Operating Systems",
    difficulty: "Easy",
  },
  {
    id: 3,
    question: "Which page replacement algorithm is known as the optimal algorithm?",
    options: ["FIFO", "LRU", "Belady's Algorithm", "Clock Algorithm"],
    correctOption: 2,
    category: "Operating Systems",
    difficulty: "Medium",
  },
  {
    id: 4,
    question: "What is thrashing in operating systems?",
    options: [
      "Excessive paging activity",
      "CPU overheating",
      "Memory overflow",
      "Disk failure",
    ],
    correctOption: 0,
    category: "Operating Systems",
    difficulty: "Medium",
  },
  {
    id: 5,
    question: "Which of the following is NOT a process state?",
    options: ["Ready", "Running", "Blocked", "Compiled"],
    correctOption: 3,
    category: "Operating Systems",
    difficulty: "Easy",
  },
  {
    id: 6,
    question: "Semaphores are used for?",
    options: [
      "Memory allocation",
      "Process synchronization",
      "File management",
      "Network routing",
    ],
    correctOption: 1,
    category: "Operating Systems",
    difficulty: "Medium",
  },

  // Database Management Systems (6 questions)
  {
    id: 7,
    question: "Which normal form eliminates transitive dependency?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctOption: 2,
    category: "DBMS",
    difficulty: "Medium",
  },
  {
    id: 8,
    question: "ACID properties ensure?",
    options: [
      "Fast queries",
      "Data integrity in transactions",
      "Network security",
      "File compression",
    ],
    correctOption: 1,
    category: "DBMS",
    difficulty: "Easy",
  },
  {
    id: 9,
    question: "Which SQL command is used to remove a table?",
    options: ["DELETE", "REMOVE", "DROP", "TRUNCATE"],
    correctOption: 2,
    category: "DBMS",
    difficulty: "Easy",
  },
  {
    id: 10,
    question: "A foreign key is used to?",
    options: [
      "Encrypt data",
      "Establish relationship between tables",
      "Create indexes",
      "Sort data",
    ],
    correctOption: 1,
    category: "DBMS",
    difficulty: "Easy",
  },
  {
    id: 11,
    question: "Which isolation level prevents dirty reads?",
    options: [
      "Read Uncommitted",
      "Read Committed",
      "Repeatable Read",
      "Serializable",
    ],
    correctOption: 1,
    category: "DBMS",
    difficulty: "Hard",
  },
  {
    id: 12,
    question: "B+ Tree is primarily used for?",
    options: ["Sorting", "Indexing", "Hashing", "Encryption"],
    correctOption: 1,
    category: "DBMS",
    difficulty: "Medium",
  },

  // Computer Networks (6 questions)
  {
    id: 13,
    question: "Which layer of OSI model handles routing?",
    options: ["Data Link", "Network", "Transport", "Session"],
    correctOption: 1,
    category: "Computer Networks",
    difficulty: "Easy",
  },
  {
    id: 14,
    question: "TCP is a _____ protocol.",
    options: [
      "Connectionless",
      "Connection-oriented",
      "Stateless",
      "Best-effort",
    ],
    correctOption: 1,
    category: "Computer Networks",
    difficulty: "Easy",
  },
  {
    id: 15,
    question: "What is the default port for HTTPS?",
    options: ["80", "443", "8080", "22"],
    correctOption: 1,
    category: "Computer Networks",
    difficulty: "Easy",
  },
  {
    id: 16,
    question: "ARP is used to map?",
    options: [
      "IP to MAC address",
      "MAC to IP address",
      "Domain to IP",
      "Port to Process",
    ],
    correctOption: 0,
    category: "Computer Networks",
    difficulty: "Medium",
  },
  {
    id: 17,
    question: "Which protocol is used for email retrieval?",
    options: ["SMTP", "POP3", "HTTP", "FTP"],
    correctOption: 1,
    category: "Computer Networks",
    difficulty: "Easy",
  },
  {
    id: 18,
    question: "Subnet mask 255.255.255.0 allows how many hosts?",
    options: ["254", "255", "256", "128"],
    correctOption: 0,
    category: "Computer Networks",
    difficulty: "Medium",
  },

  // Data Structures (6 questions)
  {
    id: 19,
    question: "Time complexity of binary search is?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctOption: 1,
    category: "Data Structures",
    difficulty: "Easy",
  },
  {
    id: 20,
    question: "Which data structure uses LIFO?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctOption: 1,
    category: "Data Structures",
    difficulty: "Easy",
  },
  {
    id: 21,
    question: "Worst case time complexity of Quick Sort is?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    correctOption: 2,
    category: "Data Structures",
    difficulty: "Medium",
  },
  {
    id: 22,
    question: "Which traversal gives sorted order in BST?",
    options: ["Preorder", "Postorder", "Inorder", "Level Order"],
    correctOption: 2,
    category: "Data Structures",
    difficulty: "Easy",
  },
  {
    id: 23,
    question: "Hash table average case lookup time is?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correctOption: 2,
    category: "Data Structures",
    difficulty: "Easy",
  },
  {
    id: 24,
    question: "Which algorithm is used to find shortest path in weighted graph?",
    options: ["DFS", "BFS", "Dijkstra", "Kruskal"],
    correctOption: 2,
    category: "Data Structures",
    difficulty: "Medium",
  },

  // Programming Concepts (6 questions)
  {
    id: 25,
    question: "What is polymorphism in OOP?",
    options: [
      "Single class with multiple objects",
      "Same method name with different implementations",
      "Hiding implementation details",
      "Inheriting properties",
    ],
    correctOption: 1,
    category: "OOP",
    difficulty: "Easy",
  },
  {
    id: 26,
    question: "What is the purpose of a constructor?",
    options: [
      "Destroy objects",
      "Initialize objects",
      "Copy objects",
      "Compare objects",
    ],
    correctOption: 1,
    category: "OOP",
    difficulty: "Easy",
  },
  {
    id: 27,
    question: "Which keyword is used for inheritance in Java?",
    options: ["inherits", "extends", "implements", "derives"],
    correctOption: 1,
    category: "OOP",
    difficulty: "Easy",
  },
  {
    id: 28,
    question: "What is encapsulation?",
    options: [
      "Wrapping data and methods together",
      "Creating multiple instances",
      "Method overloading",
      "Creating abstract classes",
    ],
    correctOption: 0,
    category: "OOP",
    difficulty: "Easy",
  },
  {
    id: 29,
    question: "What does API stand for?",
    options: [
      "Application Programming Interface",
      "Advanced Program Integration",
      "Automated Process Interface",
      "Application Process Integration",
    ],
    correctOption: 0,
    category: "General",
    difficulty: "Easy",
  },
  {
    id: 30,
    question: "Big O notation represents?",
    options: [
      "Exact running time",
      "Upper bound of algorithm complexity",
      "Memory usage",
      "Number of lines of code",
    ],
    correctOption: 1,
    category: "Algorithms",
    difficulty: "Easy",
  },
];

// =========================================================
// MOCK DATA - 2 DSA Questions
// =========================================================
const mockDSAQuestions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers **nums** and an integer **target**, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example 1:**
\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]
\`\`\`

**Constraints:**
- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- Only one valid answer exists.`,
    testCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]", isPublic: true },
      { input: "[3,2,4]\n6", output: "[1,2]", isPublic: true },
      { input: "[3,3]\n6", output: "[0,1]", isPublic: false },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your code here
  
}`,
      python: `def two_sum(nums, target):
    # Write your code here
    pass`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
    }
};`,
    },
    marks: 10,
  },
  {
    id: 2,
    title: "Reverse Linked List",
    difficulty: "Medium",
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

**Example 1:**
\`\`\`
Input: head = [1, 2, 3, 4, 5]
Output: [5, 4, 3, 2, 1]
\`\`\`

**Example 2:**
\`\`\`
Input: head = [1, 2]
Output: [2, 1]
\`\`\`

**Constraints:**
- The number of nodes is in range [0, 5000]
- -5000 ≤ Node.val ≤ 5000

**Follow up:** Can you solve it both iteratively and recursively?`,
    testCases: [
      { input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", isPublic: true },
      { input: "[1,2]", output: "[2,1]", isPublic: true },
      { input: "[]", output: "[]", isPublic: false },
    ],
    starterCode: {
      javascript: `// Definition for singly-linked list
function ListNode(val, next) {
  this.val = (val === undefined ? 0 : val);
  this.next = (next === undefined ? null : next);
}

function reverseList(head) {
  // Write your code here
  
}`,
      python: `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    # Write your code here
    pass`,
      cpp: `// Definition for singly-linked list.
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your code here
    }
};`,
    },
    marks: 10,
  },
];

// =========================================================
// CONTROLLER: Get Test Questions
// =========================================================
exports.getTestQuestions = async (req, res) => {
  try {
    // Shuffle MCQs to randomize order (Fisher-Yates shuffle)
    const shuffledMCQs = [...mockMCQs].sort(() => Math.random() - 0.5);

    // Return test configuration + questions
    res.status(200).json({
      success: true,
      data: {
        testInfo: {
          title: "Mock Assessment Test",
          duration: 90, // minutes
          totalMCQs: 30,
          totalDSA: 2,
          mcqMarks: 1,
          dsaMarks: 10,
          totalMarks: 50,
          negativeMarking: 0.25,
          instructions: [
            "This test contains 30 MCQ questions and 2 coding problems.",
            "Each MCQ carries 1 mark with 0.25 negative marking for wrong answers.",
            "Each coding problem carries 10 marks.",
            "You have 90 minutes to complete the test.",
            "You can navigate between questions freely.",
            "Make sure to save your answers before submitting.",
          ],
        },
        mcqs: shuffledMCQs.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty,
          // Don't send correctOption to frontend!
        })),
        dsaQuestions: mockDSAQuestions.map((q) => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          description: q.description,
          testCases: q.testCases.filter((tc) => tc.isPublic),
          starterCode: q.starterCode,
          marks: q.marks,
        })),
      },
    });
  } catch (error) {
    console.error("Get Test Questions Error:", error);
    res.status(500).json({ message: "Failed to fetch test questions" });
  }
};

// =========================================================
// CONTROLLER: Submit Test
// =========================================================
exports.submitTest = async (req, res) => {
  try {
    const { mcqAnswers, dsaAnswers, startTime, endTime } = req.body;
    const userId = req.user?._id;

    // Calculate MCQ Score
    let correctMCQs = 0;
    let wrongMCQs = 0;
    let skippedMCQs = 0;

    const mcqResponses = mcqAnswers.map((answer) => {
      const question = mockMCQs.find((q) => q.id === answer.questionId);
      if (!question) return null;

      const isCorrect =
        answer.selectedOption !== null &&
        answer.selectedOption === question.correctOption;

      if (answer.selectedOption === null || answer.selectedOption === -1) {
        skippedMCQs++;
      } else if (isCorrect) {
        correctMCQs++;
      } else {
        wrongMCQs++;
      }

      return {
        questionId: answer.questionId,
        questionText: question.question,
        selectedOption: answer.selectedOption,
        correctOption: question.correctOption,
        isCorrect,
      };
    });

    // MCQ Score with negative marking
    const mcqScore = correctMCQs * 1 - wrongMCQs * 0.25;

    // DSA Score (simplified - in real app, run test cases)
    let dsaScore = 0;
    const dsaResponses = dsaAnswers?.map((answer) => {
      const question = mockDSAQuestions.find((q) => q.id === answer.questionId);
      // For mock: give partial marks based on code length (placeholder logic)
      const partialScore = answer.code && answer.code.length > 50 ? 5 : 0;
      dsaScore += partialScore;

      return {
        questionId: answer.questionId,
        title: question?.title,
        code: answer.code,
        language: answer.language,
        testCasesPassed: partialScore > 0 ? 2 : 0,
        totalTestCases: 3,
        score: partialScore,
      };
    }) || [];

    const totalScore = Math.max(0, mcqScore) + dsaScore;
    const timeTaken = endTime && startTime 
      ? Math.floor((new Date(endTime) - new Date(startTime)) / 1000)
      : 0;

    // Save result if user is logged in
    let savedResult = null;
    if (userId) {
      savedResult = await TestResult.create({
        userId,
        testId: "mock-test-1",
        mcqResponses: mcqResponses.filter(Boolean),
        dsaResponses,
        mcqScore: Math.max(0, mcqScore),
        dsaScore,
        totalScore,
        maxScore: 50,
        correctMCQs,
        wrongMCQs,
        skippedMCQs,
        startTime,
        endTime,
        timeTaken,
        status: "Completed",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        mcqScore: Math.max(0, mcqScore).toFixed(2),
        dsaScore,
        totalScore: totalScore.toFixed(2),
        maxScore: 50,
        percentage: ((totalScore / 50) * 100).toFixed(1),
        stats: {
          correctMCQs,
          wrongMCQs,
          skippedMCQs,
          totalMCQs: 30,
        },
        timeTaken,
        resultId: savedResult?._id,
        // Detailed analysis
        mcqAnalysis: mcqResponses.filter(Boolean),
        dsaAnalysis: dsaResponses,
      },
    });
  } catch (error) {
    console.error("Submit Test Error:", error);
    res.status(500).json({ message: "Failed to submit test" });
  }
};

// =========================================================
// CONTROLLER: Get User's Test Results
// =========================================================
exports.getTestResults = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Login required to view results" });
    }

    const results = await TestResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Get Results Error:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};

// =========================================================
// CONTROLLER: Get Single Result Details
// =========================================================
exports.getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const result = await TestResult.findById(id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    // Check if result belongs to user
    if (result.userId.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get Result Error:", error);
    res.status(500).json({ message: "Failed to fetch result" });
  }
};
