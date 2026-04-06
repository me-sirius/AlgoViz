import React, { useState, useEffect, useRef } from "react";
import {
    Panel,
    PanelGroup,
    PanelResizeHandle,
} from "react-resizable-panels";
import {
    Play, Pause, SkipForward, RotateCcw, Settings, BarChart3, Code2,
    Activity, Target, Clock, Maximize2, ArrowLeft, ArrowLeftRight,
    Plus, GitBranch, Rewind, ChevronDown, Sparkles, AlertTriangle,
    Shuffle, TreePine, TrendingDown, TrendingUp, List, Layers,
    ArrowDown, ArrowUp, ArrowRight, Zap, Info, X as XIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import cytoscape from "../../../core/utils/cytoscapeSetup.js";
import Alert from "../../../components/Alert.jsx";
import BasicCodeDisplay from "../../../components/BasicCodeDisplay.jsx";
import { useTheme } from "../../../core/context/ThemeContext";
import { treeTraversal } from "../../../core/constants/codeExamples.js";

// ============================================================================
// TREE NODE & BINARY TREE CLASS
// ============================================================================

class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
    }
}

class BinaryTree {
    constructor() {
        this.root = null;
    }

    // Clone tree for step snapshots
    cloneTree(node) {
        if (!node) return null;
        const cloned = new TreeNode(node.value);
        cloned.x = node.x;
        cloned.y = node.y;
        cloned.left = this.cloneTree(node.left);
        cloned.right = this.cloneTree(node.right);
        return cloned;
    }

    // Calculate positions for visualization
    calculatePositions(node, x = 0, y = 50, offset = 180) {
        if (!node) return;
        node.x = x;
        node.y = y;
        const nextOffset = offset / 1.8;
        if (node.left) {
            this.calculatePositions(node.left, x - offset, y + 100, nextOffset);
        }
        if (node.right) {
            this.calculatePositions(node.right, x + offset, y + 100, nextOffset);
        }
    }

    // Insert value (BST style for building tree)
    insert(value) {
        this.root = this.insertNode(this.root, value);
    }

    insertNode(node, value) {
        if (!node) return new TreeNode(value);
        if (value < node.value) {
            node.left = this.insertNode(node.left, value);
        } else if (value > node.value) {
            node.right = this.insertNode(node.right, value);
        }
        return node;
    }

    // Silent insert (no steps)
    insertSilent(node, value) {
        if (!node) return new TreeNode(value);
        if (value < node.value) node.left = this.insertSilent(node.left, value);
        else if (value > node.value) node.right = this.insertSilent(node.right, value);
        return node;
    }

    // Build from array
    buildFromArray(values) {
        this.root = null;
        for (const val of values) {
            this.root = this.insertSilent(this.root, val);
        }
    }

    // Check if value exists
    contains(value, node = this.root) {
        if (!node) return false;
        if (value === node.value) return true;
        if (value < node.value) return this.contains(value, node.left);
        return this.contains(value, node.right);
    }

    // Get node count
    getNodeCount(node = this.root) {
        if (!node) return 0;
        return 1 + this.getNodeCount(node.left) + this.getNodeCount(node.right);
    }

    // Get tree height
    getHeight(node = this.root) {
        if (!node) return 0;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    // Get in-order traversal result
    getInOrder(node = this.root, result = []) {
        if (!node) return result;
        this.getInOrder(node.left, result);
        result.push(node.value);
        this.getInOrder(node.right, result);
        return result;
    }

    // ========== TRAVERSAL ALGORITHMS WITH STEP GENERATION ==========

    // In-Order Traversal (Left -> Root -> Right)
    inorderTraversal() {
        const steps = [];
        const result = [];
        const callStack = []; // Tracking recursion stack for visualization

        steps.push({
            type: 'start',
            traversalType: 'inorder',
            description: 'Starting In-Order Traversal (Left → Root → Right)',
            currentNode: null,
            visitedNodes: [],
            result: [],
            callStack: [],
            action: 'initialize',
            lineNumber: 1,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });

        this.inorderHelper(this.root, steps, result, callStack);

        steps.push({
            type: 'complete',
            traversalType: 'inorder',
            description: `In-Order Traversal Complete! Result: [${result.join(', ')}]`,
            currentNode: null,
            visitedNodes: [...result],
            result: [...result],
            callStack: [],
            action: 'complete',
            lineNumber: 7,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });

        return steps;
    }

    inorderHelper(node, steps, result, callStack) {
        if (!node) {
            steps.push({
                type: 'base_case',
                traversalType: 'inorder',
                description: 'Reached null node, returning...',
                currentNode: null,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'null_check',
                lineNumber: 2,
                tree: this.cloneTree(this.root),
                nextDirection: null,
                highlightEdge: null
            });
            return;
        }

        // Push to call stack
        callStack.push(node.value);

        steps.push({
            type: 'visit',
            traversalType: 'inorder',
            description: `Visiting node ${node.value}, will traverse left subtree first`,
            currentNode: node.value,
            visitedNodes: [...result],
            result: [...result],
            callStack: [...callStack],
            action: 'enter',
            lineNumber: 1,
            tree: this.cloneTree(this.root),
            nextDirection: 'left',
            highlightEdge: null
        });

        // Go left
        if (node.left) {
            steps.push({
                type: 'traverse',
                traversalType: 'inorder',
                description: `Going LEFT from ${node.value} to ${node.left.value}`,
                currentNode: node.value,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'go_left',
                lineNumber: 4,
                tree: this.cloneTree(this.root),
                nextDirection: 'left',
                highlightEdge: { from: node.value, to: node.left.value, direction: 'left' }
            });
        }

        this.inorderHelper(node.left, steps, result, callStack);

        // Process current node (add to result)
        result.push(node.value);

        steps.push({
            type: 'process',
            traversalType: 'inorder',
            description: `Processing node ${node.value} - Added to result!`,
            currentNode: node.value,
            visitedNodes: [...result],
            result: [...result],
            callStack: [...callStack],
            action: 'process',
            lineNumber: 5,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null,
            justProcessed: node.value
        });

        // Go right
        if (node.right) {
            steps.push({
                type: 'traverse',
                traversalType: 'inorder',
                description: `Going RIGHT from ${node.value} to ${node.right.value}`,
                currentNode: node.value,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'go_right',
                lineNumber: 6,
                tree: this.cloneTree(this.root),
                nextDirection: 'right',
                highlightEdge: { from: node.value, to: node.right.value, direction: 'right' }
            });
        }

        this.inorderHelper(node.right, steps, result, callStack);

        // Pop from call stack
        callStack.pop();

        steps.push({
            type: 'return',
            traversalType: 'inorder',
            description: `Finished processing subtree rooted at ${node.value}, returning...`,
            currentNode: node.value,
            visitedNodes: [...result],
            result: [...result],
            callStack: [...callStack],
            action: 'return',
            lineNumber: 7,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });
    }

    // Pre-Order Traversal (Root -> Left -> Right)
    preorderTraversal() {
        const steps = [];
        const result = [];
        const callStack = [];

        steps.push({
            type: 'start',
            traversalType: 'preorder',
            description: 'Starting Pre-Order Traversal (Root → Left → Right)',
            currentNode: null,
            visitedNodes: [],
            result: [],
            callStack: [],
            action: 'initialize',
            lineNumber: 1,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });

        this.preorderHelper(this.root, steps, result, callStack);

        steps.push({
            type: 'complete',
            traversalType: 'preorder',
            description: `Pre-Order Traversal Complete! Result: [${result.join(', ')}]`,
            currentNode: null,
            visitedNodes: [...result],
            result: [...result],
            callStack: [],
            action: 'complete',
            lineNumber: 7,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });

        return steps;
    }

    preorderHelper(node, steps, result, callStack) {
        if (!node) {
            steps.push({
                type: 'base_case',
                traversalType: 'preorder',
                description: 'Reached null node, returning...',
                currentNode: null,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'null_check',
                lineNumber: 2,
                tree: this.cloneTree(this.root),
                nextDirection: null,
                highlightEdge: null
            });
            return;
        }

        // Push to call stack
        callStack.push(node.value);

        // Process current node FIRST (pre-order)
        result.push(node.value);

        steps.push({
            type: 'process',
            traversalType: 'preorder',
            description: `Processing node ${node.value} FIRST - Added to result!`,
            currentNode: node.value,
            visitedNodes: [...result],
            result: [...result],
            callStack: [...callStack],
            action: 'process',
            lineNumber: 4,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null,
            justProcessed: node.value
        });

        // Go left
        if (node.left) {
            steps.push({
                type: 'traverse',
                traversalType: 'preorder',
                description: `Going LEFT from ${node.value} to ${node.left.value}`,
                currentNode: node.value,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'go_left',
                lineNumber: 5,
                tree: this.cloneTree(this.root),
                nextDirection: 'left',
                highlightEdge: { from: node.value, to: node.left.value, direction: 'left' }
            });
        }

        this.preorderHelper(node.left, steps, result, callStack);

        // Go right
        if (node.right) {
            steps.push({
                type: 'traverse',
                traversalType: 'preorder',
                description: `Going RIGHT from ${node.value} to ${node.right.value}`,
                currentNode: node.value,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'go_right',
                lineNumber: 6,
                tree: this.cloneTree(this.root),
                nextDirection: 'right',
                highlightEdge: { from: node.value, to: node.right.value, direction: 'right' }
            });
        }

        this.preorderHelper(node.right, steps, result, callStack);

        // Pop from call stack
        callStack.pop();

        steps.push({
            type: 'return',
            traversalType: 'preorder',
            description: `Finished subtree rooted at ${node.value}, returning...`,
            currentNode: node.value,
            visitedNodes: [...result],
            result: [...result],
            callStack: [...callStack],
            action: 'return',
            lineNumber: 7,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });
    }

    // Post-Order Traversal (Left -> Right -> Root)
    postorderTraversal() {
        const steps = [];
        const result = [];
        const callStack = [];

        steps.push({
            type: 'start',
            traversalType: 'postorder',
            description: 'Starting Post-Order Traversal (Left → Right → Root)',
            currentNode: null,
            visitedNodes: [],
            result: [],
            callStack: [],
            action: 'initialize',
            lineNumber: 1,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });

        this.postorderHelper(this.root, steps, result, callStack);

        steps.push({
            type: 'complete',
            traversalType: 'postorder',
            description: `Post-Order Traversal Complete! Result: [${result.join(', ')}]`,
            currentNode: null,
            visitedNodes: [...result],
            result: [...result],
            callStack: [],
            action: 'complete',
            lineNumber: 7,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });

        return steps;
    }

    postorderHelper(node, steps, result, callStack) {
        if (!node) {
            steps.push({
                type: 'base_case',
                traversalType: 'postorder',
                description: 'Reached null node, returning...',
                currentNode: null,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'null_check',
                lineNumber: 2,
                tree: this.cloneTree(this.root),
                nextDirection: null,
                highlightEdge: null
            });
            return;
        }

        // Push to call stack
        callStack.push(node.value);

        steps.push({
            type: 'visit',
            traversalType: 'postorder',
            description: `Visiting node ${node.value}, will process AFTER both subtrees`,
            currentNode: node.value,
            visitedNodes: [...result],
            result: [...result],
            callStack: [...callStack],
            action: 'enter',
            lineNumber: 1,
            tree: this.cloneTree(this.root),
            nextDirection: 'left',
            highlightEdge: null
        });

        // Go left
        if (node.left) {
            steps.push({
                type: 'traverse',
                traversalType: 'postorder',
                description: `Going LEFT from ${node.value} to ${node.left.value}`,
                currentNode: node.value,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'go_left',
                lineNumber: 4,
                tree: this.cloneTree(this.root),
                nextDirection: 'left',
                highlightEdge: { from: node.value, to: node.left.value, direction: 'left' }
            });
        }

        this.postorderHelper(node.left, steps, result, callStack);

        // Go right
        if (node.right) {
            steps.push({
                type: 'traverse',
                traversalType: 'postorder',
                description: `Going RIGHT from ${node.value} to ${node.right.value}`,
                currentNode: node.value,
                visitedNodes: [...result],
                result: [...result],
                callStack: [...callStack],
                action: 'go_right',
                lineNumber: 5,
                tree: this.cloneTree(this.root),
                nextDirection: 'right',
                highlightEdge: { from: node.value, to: node.right.value, direction: 'right' }
            });
        }

        this.postorderHelper(node.right, steps, result, callStack);

        // Process current node LAST (post-order)
        result.push(node.value);

        steps.push({
            type: 'process',
            traversalType: 'postorder',
            description: `Processing node ${node.value} LAST - Added to result!`,
            currentNode: node.value,
            visitedNodes: [...result],
            result: [...result],
            callStack: [...callStack],
            action: 'process',
            lineNumber: 6,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null,
            justProcessed: node.value
        });

        // Pop from call stack
        callStack.pop();

        steps.push({
            type: 'return',
            traversalType: 'postorder',
            description: `Finished processing ${node.value}, returning...`,
            currentNode: node.value,
            visitedNodes: [...result],
            result: [...result],
            callStack: [...callStack],
            action: 'return',
            lineNumber: 7,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });
    }

    // Level-Order Traversal (BFS)
    levelorderTraversal() {
        const steps = [];
        const result = [];
        const queue = [];

        if (!this.root) {
            steps.push({
                type: 'complete',
                traversalType: 'levelorder',
                description: 'Tree is empty!',
                currentNode: null,
                visitedNodes: [],
                result: [],
                queue: [],
                action: 'complete',
                lineNumber: 2,
                tree: null,
                nextDirection: null,
                highlightEdge: null
            });
            return steps;
        }

        queue.push(this.root);

        steps.push({
            type: 'start',
            traversalType: 'levelorder',
            description: 'Starting Level-Order Traversal (BFS)',
            currentNode: this.root.value,
            visitedNodes: [],
            result: [],
            queue: [this.root.value],
            action: 'initialize',
            lineNumber: 3,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });

        while (queue.length > 0) {
            const node = queue.shift();

            steps.push({
                type: 'process',
                traversalType: 'levelorder',
                description: `Processing node ${node.value} from queue`,
                currentNode: node.value,
                visitedNodes: [...result],
                result: [...result, node.value],
                queue: queue.map(n => n.value),
                action: 'process',
                lineNumber: 6,
                tree: this.cloneTree(this.root),
                nextDirection: null,
                highlightEdge: null,
                justProcessed: node.value
            });

            result.push(node.value);

            if (node.left) {
                queue.push(node.left);
                steps.push({
                    type: 'traverse',
                    traversalType: 'levelorder',
                    description: `Adding left child ${node.left.value} to queue`,
                    currentNode: node.value,
                    visitedNodes: [...result],
                    result: [...result],
                    queue: queue.map(n => n.value),
                    action: 'push_left',
                    lineNumber: 9,
                    tree: this.cloneTree(this.root),
                    nextDirection: 'left',
                    highlightEdge: { from: node.value, to: node.left.value, direction: 'left' }
                });
            }

            if (node.right) {
                queue.push(node.right);
                steps.push({
                    type: 'enqueue',
                    traversalType: 'levelorder',
                    description: `Enqueued right child ${node.right.value}`,
                    currentNode: node.value,
                    visitedNodes: [...result],
                    result: [...result],
                    queue: queue.map(n => n.value),
                    action: 'enqueue_right',
                    lineNumber: 10,
                    tree: this.cloneTree(this.root),
                    nextDirection: 'right',
                    highlightEdge: { from: node.value, to: node.right.value, direction: 'right' }
                });
            }
        }

        steps.push({
            type: 'complete',
            traversalType: 'levelorder',
            description: `Level-Order Traversal Complete! Result: [${result.join(', ')}]`,
            currentNode: null,
            visitedNodes: [...result],
            result: [...result],
            queue: [],
            action: 'complete',
            lineNumber: 12,
            tree: this.cloneTree(this.root),
            nextDirection: null,
            highlightEdge: null
        });

        return steps;
    }
}

// ============================================================================
// CONSTANTS & PRESETS
// ============================================================================

const TREE_PRESETS = {
    balanced: {
        name: "Balanced Tree",
        icon: TreePine,
        generate: () => [50, 25, 75, 12, 37, 62, 87],
    },
    random: {
        name: "Random Tree",
        icon: Shuffle,
        generate: () => {
            const size = Math.floor(Math.random() * 5) + 5;
            const values = new Set();
            while (values.size < size) values.add(Math.floor(Math.random() * 99) + 1);
            return Array.from(values);
        },
    },
    leftSkewed: {
        name: "Left Skewed",
        icon: TrendingDown,
        generate: () => [70, 60, 50, 40, 30, 20, 10],
    },
    rightSkewed: {
        name: "Right Skewed",
        icon: TrendingUp,
        generate: () => [10, 20, 30, 40, 50, 60, 70],
    },
};

const TRAVERSAL_TYPES = [
    { id: 'inorder', name: 'In-Order', shortName: 'LNR', icon: ArrowRight, color: 'cyan', description: 'Left → Node → Right' },
    { id: 'preorder', name: 'Pre-Order', shortName: 'NLR', icon: ArrowDown, color: 'green', description: 'Node → Left → Right' },
    { id: 'postorder', name: 'Post-Order', shortName: 'LRN', icon: ArrowUp, color: 'purple', description: 'Left → Right → Node' },
    { id: 'levelorder', name: 'Level-Order', shortName: 'BFS', icon: Layers, color: 'amber', description: 'Level by Level (BFS)' },
];

// Map all traversal types to the imported code example file
const TRAVERSAL_CODES = {
    inorder: treeTraversal,
    preorder: treeTraversal,
    postorder: treeTraversal,
    levelorder: treeTraversal
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

const TabButton = ({ id, icon: Icon, label, activeTab, setActiveTab, theme }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all duration-300 ${activeTab === id
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105"
            : theme === "dark"
                ? "bg-white/5 text-slate-300 hover:bg-white/10"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
    >
        <Icon size={16} />
        <span>{label}</span>
    </button>
);

const StatCard = ({ icon: Icon, value, label, color, theme }) => {
    const colorClasses = {
        green: theme === "dark"
            ? "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400"
            : "from-green-50 to-emerald-50 border-green-200 text-green-600",
        cyan: theme === "dark"
            ? "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400"
            : "from-cyan-50 to-blue-50 border-cyan-200 text-cyan-600",
        amber: theme === "dark"
            ? "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400"
            : "from-amber-50 to-yellow-50 border-amber-200 text-amber-600",
        purple: theme === "dark"
            ? "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400"
            : "from-purple-50 to-fuchsia-50 border-purple-200 text-purple-600",
    };

    return (
        <div className={`rounded-xl p-4 border bg-gradient-to-br ${colorClasses[color] || colorClasses.cyan}`}>
            <div className="flex items-center justify-between">
                <Icon size={20} className="opacity-70" />
                <div className="text-right">
                    <div className="text-2xl font-black">{value}</div>
                    <div className={`text-xs font-bold uppercase ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                        {label}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ControlButton = ({ onClick, disabled, icon: Icon, label, variant = "primary", theme, className = "" }) => {
    const variantClasses = {
        success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
        primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600",
        danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
        purple: "bg-gradient-to-r from-purple-500 to-fuchsia-500 hover: from-purple-600 hover:to-fuchsia-600",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 ${disabled
                ? theme === "dark"
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                : `${variantClasses[variant]} cursor-pointer hover:scale-105`
                } ${className}`}
        >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};

const TraversalTypeButton = ({ type, isActive, onClick, theme, disabled }) => {
    const colorClasses = {
        cyan: isActive
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg border-transparent"
            : theme === "dark"
                ? "bg-white/5 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                : "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100",
        green: isActive
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border-transparent"
            : theme === "dark"
                ? "bg-white/5 text-green-400 border-green-500/30 hover:bg-green-500/10"
                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        purple: isActive
            ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg border-transparent"
            : theme === "dark"
                ? "bg-white/5 text-purple-400 border-purple-500/30 hover: bg-purple-500/10"
                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        amber: isActive
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg border-transparent"
            : theme === "dark"
                ? "bg-white/5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    };

    const Icon = type.icon;

    return (
        <button
            onClick={() => onClick(type.id)}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-300 ${disabled
                ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed border-gray-600" : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                : `cursor-pointer ${colorClasses[type.color]} ${isActive ? "scale-105" : "hover: scale-102"}`
                }`}
        >
            <Icon size={18} />
            <span className="text-xs font-bold">{type.shortName}</span>
            <span className="text-[10px] opacity-70">{type.name}</span>
        </button>
    );
};

const CallStackDisplay = ({ callStack, theme }) => (
    <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
        <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <Layers size={16} />
            Call Stack
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>
                Depth: {callStack.length}
            </span>
        </h4>
        <div className={`flex flex-col-reverse gap-2 max-h-40 overflow-y-auto custom-scrollbar p-2 rounded-lg ${theme === "dark" ? "bg-white/5" : "bg-white"}`}>
            {callStack.length === 0 ? (
                <div className={`text-center py-4 text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    Stack is empty
                </div>
            ) : (
                callStack.map((value, index) => {
                    const isTop = index === callStack.length - 1;
                    return (
                        <div
                            key={index}
                            className={`px-3 py-2 rounded-lg border transition-all duration-300 ${isTop
                                ? theme === "dark" ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-red-100 border-red-300 text-red-700"
                                : theme === "dark" ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-blue-100 border-blue-300 text-blue-700"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-sm">Node {value}</span>
                                <span className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                                    {isTop ? "← TOP" : `#${index + 1}`}
                                </span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    </div>
);

const QueueDisplay = ({ queue, theme }) => (
    <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
        <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <List size={16} />
            Queue (FIFO)
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
                Size: {queue.length}
            </span>
        </h4>
        <div className={`flex gap-2 overflow-x-auto custom-scrollbar p-2 rounded-lg ${theme === "dark" ? "bg-white/5" : "bg-white"}`}>
            {queue.length === 0 ? (
                <div className={`text-center py-4 text-sm w-full ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    Queue is empty
                </div>
            ) : (
                queue.map((value, index) => (
                    <div
                        key={index}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg border font-mono font-bold text-sm ${index === 0
                            ? theme === "dark" ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-green-100 border-green-300 text-green-700"
                            : theme === "dark" ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : "bg-amber-100 border-amber-300 text-amber-700"
                            }`}
                    >
                        {value}
                        {index === 0 && <span className="ml-2 text-xs opacity-70">← Front</span>}
                    </div>
                ))
            )}
        </div>
    </div>
);

const ResultDisplay = ({ result, justProcessed, theme }) => (
    <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20" : "bg-green-50 border-green-200"}`}>
        <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            <Target size={16} className={theme === "dark" ? "text-green-400" : "text-green-600"} />
            Traversal Result
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"}`}>
                {result.length} nodes
            </span>
        </h4>
        <div className="flex gap-2 flex-wrap">
            {result.length === 0 ? (
                <span className={`text-sm italic ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    No nodes processed yet...
                </span>
            ) : (
                result.map((value, index) => (
                    <div
                        key={index}
                        className={`px-3 py-1. 5 rounded-lg font-mono font-bold text-sm transition-all duration-300 ${value === justProcessed
                            ? "bg-green-500 text-white scale-110 shadow-lg animate-pulse"
                            : theme === "dark" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-green-100 text-green-700 border border-green-200"
                            }`}
                    >
                        <span className="text-xs opacity-60 mr-1">{index + 1}. </span>
                        {value}
                    </div>
                ))
            )}
        </div>
    </div>
);
// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TreeTraversal = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Cytoscape refs
    const cyRef = useRef(null);
    const mobileCyRef = useRef(null);
    const cyInstance = useRef(null);

    // Helper to extract specific traversal code
    const getTraversalCode = (fullCode, type) => {
        if (!fullCode) return '';
        // Map traversal types to their function names in codeExamples.js
        const typeMap = {
            inorder: 'Inorder',
            preorder: 'Preorder',
            postorder: 'Postorder',
            levelorder: 'Level Order',
        };

        const parsingName = typeMap[type];
        if (!parsingName) return fullCode;

        // Regex to find the block: // ===... or # ===... 
        // Matches both C++/JS (//) and Python (#) comment styles
        const regex = new RegExp(`(?:\\/\\/|#) =+\\s*\\n\\s*(?:\\/\\/|#) ${parsingName} Traversal\\s*\\n\\s*(?:\\/\\/|#) =+\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:\\/\\/|#) =+|$)`, 'i');
        const match = fullCode.match(regex);
        return match ? match[1].trim() : `// Code for ${type} not found`;
    };

    // Tree state
    const [tree, setTree] = useState(() => new BinaryTree()); // Start empty
    const [traversalType, setTraversalType] = useState('inorder');
    const [inputValue, setInputValue] = useState('');
    const [randomNodeCount, setRandomNodeCount] = useState(7);
    const [hasNodes, setHasNodes] = useState(false);

    // Animation state
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const [speed, setSpeed] = useState(800);

    // UI state
    const [activeRightTab, setActiveRightTab] = useState('stats');
    const [currentHighlightedLine, setCurrentHighlightedLine] = useState(null);
    const [showCodeDrawer, setShowCodeDrawer] = useState(false);
    const [inputError, setInputError] = useState('');
    const [mobileAccordions, setMobileAccordions] = useState({
        settings: false,
        stats: true,
        result: true,
    });

    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        message: '',
        type: 'error',
        customButtons: null,
    });

    // Viewport tracking
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            if (mobile !== isMobile) {
                setIsMobile(mobile);
                if (cyInstance.current) {
                    cyInstance.current.destroy();
                    cyInstance.current = null;
                }
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    // Current step data
    const currentStepData = steps[currentStep] || {
        tree: tree.root,
        currentNode: null,
        visitedNodes: [],
        result: [],
        callStack: [],
        queue: [],
        description: 'Select a traversal type and click Start! ',
        action: 'ready',
        highlightEdge: null,
        justProcessed: null,
    };

    const getProgressPercentage = () => {
        if (steps.length <= 1) return 0;
        return Math.round((currentStep / (steps.length - 1)) * 100);
    };

    // Handlers
    const handleBack = () => {
        setAlertConfig({
            isOpen: true,
            message: 'Are you sure you want to leave?  Your progress will be lost.',
            type: 'warning',
            customButtons: (
                <div className="flex space-x-4 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:scale-105 shadow-lg transition-all duration-300 cursor-pointer"
                    >
                        Leave
                    </button>
                    <button
                        onClick={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:scale-105 shadow-lg transition-all duration-300 cursor-pointer"
                    >
                        Stay
                    </button>
                </div>
            ),
        });
    };

    const handleStartTraversal = () => {
        if (!tree.root) {
            setInputError('Tree is empty!  Add some nodes first.');
            return;
        }

        let newSteps = [];
        switch (traversalType) {
            case 'inorder':
                newSteps = tree.inorderTraversal();
                break;
            case 'preorder':
                newSteps = tree.preorderTraversal();
                break;
            case 'postorder':
                newSteps = tree.postorderTraversal();
                break;
            case 'levelorder':
                newSteps = tree.levelorderTraversal();
                break;
            default:
                return;
        }

        setSteps(newSteps);
        setCurrentStep(0);
        setStarted(true);
        setPlaying(true);
    };

    const handleRandomTree = () => {
        const size = Math.max(1, Math.min(20, randomNodeCount)); // Clamp between 1 and 20
        const values = new Set();
        while (values.size < size) values.add(Math.floor(Math.random() * 99) + 1);

        const newTree = new BinaryTree();
        newTree.buildFromArray(Array.from(values));
        setTree(newTree);
        setHasNodes(true);
        setSteps([]);
        setCurrentStep(0);
        setStarted(false);
        setPlaying(false);

        if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
    };

    const handleInsertNode = () => {
        const value = parseInt(inputValue);
        if (isNaN(value)) {
            setInputError('Please enter a valid number');
            return;
        }
        if (tree.contains(value)) {
            setInputError(`Value ${value} already exists in tree`);
            return;
        }

        tree.insert(value);
        setInputValue('');
        setInputError('');
        setHasNodes(true);

        // Reset visualization
        setSteps([]);
        setCurrentStep(0);
        setStarted(false);
        setPlaying(false);

        if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
    };

    const handlePresetSelect = (preset) => {
        if (playing) return;
        const values = preset.generate();
        tree.buildFromArray(values);

        setSteps([]);
        setCurrentStep(0);
        setStarted(false);
        setPlaying(false);
        setHasNodes(true);

        if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
    };

    const handleReset = () => {
        tree.buildFromArray([50, 25, 75, 12, 37, 62, 87]);
        setSteps([]);
        setCurrentStep(0);
        setStarted(false);
        setPlaying(false);
        setHasNodes(true);

        if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
    };

    const handleClearTree = () => {
        tree.root = null;
        setSteps([]);
        setCurrentStep(0);
        setStarted(false);
        setPlaying(false);
        setHasNodes(false);

        if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
    };

    // Animation loop
    useEffect(() => {
        if (!playing || currentStep >= steps.length - 1) {
            if (playing && currentStep >= steps.length - 1) setPlaying(false);
            return;
        }
        const timer = setTimeout(() => setCurrentStep((prev) => prev + 1), speed);
        return () => clearTimeout(timer);
    }, [playing, currentStep, steps.length, speed]);

    // Update highlighted line
    useEffect(() => {
        if (steps[currentStep]?.lineNumber) {
            setCurrentHighlightedLine(steps[currentStep].lineNumber);
        }
    }, [currentStep, steps]);

    // ============================================================================
    // CYTOSCAPE VISUALIZATION
    // ============================================================================

    // ============================================================================
    // CYTOSCAPE VISUALIZATION
    // ============================================================================

    useEffect(() => {
        const container = isMobile ? mobileCyRef.current : cyRef.current;
        if (!container) return;

        const generateElements = (node, elements = []) => {
            if (!node) return elements;

            const isCurrentNode = currentStepData.currentNode === node.value;
            const isVisited = currentStepData.visitedNodes?.includes(node.value);
            const isInStack = currentStepData.callStack?.includes(node.value);
            const isInQueue = currentStepData.queue?.includes(node.value);
            const isJustProcessed = currentStepData.justProcessed === node.value;

            // Determine node class
            let nodeClass = '';
            if (isJustProcessed) nodeClass = 'just_processed';
            else if (isCurrentNode) nodeClass = 'current';
            else if (isVisited) nodeClass = 'visited';
            else if (isInStack) nodeClass = 'in_stack';
            else if (isInQueue) nodeClass = 'in_queue';

            elements.push({
                data: { id: `node-${node.value}`, label: String(node.value) },
                position: { x: node.x, y: node.y },
                classes: nodeClass,
            });

            // Check if edge should be highlighted
            const highlightEdge = currentStepData.highlightEdge;

            if (node.left) {
                const isEdgeHighlighted = highlightEdge &&
                    highlightEdge.from === node.value &&
                    highlightEdge.to === node.left.value;

                elements.push({
                    data: { source: `node-${node.value}`, target: `node-${node.left.value}` },
                    classes: isEdgeHighlighted ? 'left-edge highlighted' : 'left-edge',
                });
                generateElements(node.left, elements);
            }

            if (node.right) {
                const isEdgeHighlighted = highlightEdge &&
                    highlightEdge.from === node.value &&
                    highlightEdge.to === node.right.value;

                elements.push({
                    data: { source: `node-${node.value}`, target: `node-${node.right.value}` },
                    classes: isEdgeHighlighted ? 'right-edge highlighted' : 'right-edge',
                });
                generateElements(node.right, elements);
            }

            return elements;
        };

        const calculateTreePositions = (node, x, y, offset) => {
            if (!node) return;
            node.x = x;
            node.y = y;
            const nextOffset = offset / 1.8;
            if (node.left) calculateTreePositions(node.left, x - offset, y + 80, nextOffset);
            if (node.right) calculateTreePositions(node.right, x + offset, y + 80, nextOffset);
        };

        const getStylesheet = () => [
            {
                selector: 'node',
                style: {
                    'background-color': theme === 'dark' ? '#1e293b' : '#f8fafc',
                    'border-color': theme === 'dark' ? '#64748b' : '#94a3b8',
                    'border-width': 3,
                    label: 'data(label)',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    'font-weight': 'bold',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    width: 50,
                    height: 50,
                    'font-size': 16,
                    'transition-property': 'background-color, border-color, width, height',
                    'transition-duration': '300ms',
                },
            },
            {
                selector: 'node.current',
                style: {
                    'background-color': '#f59e0b',
                    'border-color': '#fbbf24',
                    'border-width': 4,
                    width: 58,
                    height: 58,
                    color: '#ffffff',
                },
            },
            {
                selector: 'node.just_processed',
                style: {
                    'background-color': '#22c55e',
                    'border-color': '#4ade80',
                    'border-width': 5,
                    width: 62,
                    height: 62,
                    color: '#ffffff',
                },
            },
            {
                selector: 'node.visited',
                style: {
                    'background-color': '#10b981',
                    'border-color': '#34d399',
                    color: '#ffffff',
                },
            },
            {
                selector: 'node.in_stack',
                style: {
                    'background-color': '#3b82f6',
                    'border-color': '#60a5fa',
                    color: '#ffffff',
                },
            },
            {
                selector: 'node.in_queue',
                style: {
                    'background-color': '#f59e0b',
                    'border-color': '#fbbf24',
                    color: '#ffffff',
                },
            },
            {
                selector: 'edge',
                style: {
                    width: 2,
                    'line-color': theme === 'dark' ? '#475569' : '#cbd5e1',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': theme === 'dark' ? '#475569' : '#cbd5e1',
                    'curve-style': 'bezier',
                    'transition-property': 'line-color, width',
                    'transition-duration': '300ms',
                },
            },
            {
                selector: '.left-edge',
                style: {
                    'line-color': theme === 'dark' ? '#3b82f6' : '#60a5fa',
                    'target-arrow-color': theme === 'dark' ? '#3b82f6' : '#60a5fa',
                },
            },
            {
                selector: '.right-edge',
                style: {
                    'line-color': theme === 'dark' ? '#a855f7' : '#c084fc',
                    'target-arrow-color': theme === 'dark' ? '#a855f7' : '#c084fc',
                },
            },
            {
                selector: 'edge.highlighted',
                style: {
                    width: 5,
                    'line-color': '#22d3ee',
                    'target-arrow-color': '#22d3ee',
                },
            },
        ];

        const treeRoot = currentStepData.tree || tree.root;

        // Use a ResizeObserver to update positions when container resizes
        const updateGraph = () => {
            // Use a fixed virtual width for position parsing to ensure consistent tree geometry (shape)
            // regardless of the actual container size. cy.fit() will then scale this shape to the view.
            const virtualWidth = 1200;
            if (treeRoot) {
                calculateTreePositions(treeRoot, virtualWidth / 2, 60, virtualWidth / 4);
            }

            const elements = treeRoot ? generateElements(treeRoot, []) : [];

            if (!cyInstance.current) {
                cyInstance.current = cytoscape({
                    container: container,
                    elements: elements,
                    style: getStylesheet(),
                    layout: { name: 'preset' },
                    minZoom: 0.5,
                    maxZoom: 2.0,
                    userZoomingEnabled: true,
                    userPanningEnabled: true,
                    wheelSensitivity: 0.3,
                });
            } else {
                cyInstance.current.batch(() => {
                    cyInstance.current.elements().remove();
                    if (elements.length > 0) {
                        cyInstance.current.add(elements);
                    }
                });
                cyInstance.current.style(getStylesheet());
            }

            if (elements.length > 0) {
                cyInstance.current.layout({ name: 'preset', animate: false }).run();
                // Delay fit slightly to ensure layout is applied and container dimensions are valid
                requestAnimationFrame(() => {
                    cyInstance.current.fit(undefined, 50);
                });
            }
        };

        // Initial render
        updateGraph();

        const resizeObserver = new ResizeObserver(() => {
            updateGraph();
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [currentStepData, theme, steps, isMobile, tree]);

    // Get current traversal type info
    const currentTraversalInfo = TRAVERSAL_TYPES.find((t) => t.id === traversalType);

    // Mobile stats (continued)
    const mobileStats = [
        { value: tree.getNodeCount(), label: 'Nodes', colorClass: theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600' },
        { value: tree.getHeight(), label: 'Height', colorClass: theme === 'dark' ? 'text-purple-400' : 'text-purple-600' },
        { value: currentStepData.result?.length || 0, label: 'Processed', colorClass: theme === 'dark' ? 'text-green-400' : 'text-green-600' },
        { value: `${getProgressPercentage()}%`, label: 'Progress', colorClass: theme === 'dark' ? 'text-amber-400' : 'text-amber-600' },
    ];

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div className={`h-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <header className={`flex-shrink-0 z-40 border-b backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={handleBack}
                            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 cursor-pointer ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                <GitBranch size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-black">Tree Traversal</h1>
                                <p className={`text-xs sm:text-sm font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                                    In-Order • Pre-Order • Post-Order • Level-Order
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Current Traversal Badge */}
                        {currentTraversalInfo && (
                            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
                                }`}>
                                <currentTraversalInfo.icon size={16} className={theme === 'dark' ? `text-${currentTraversalInfo.color}-400` : `text-${currentTraversalInfo.color}-600`} />
                                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                    {currentTraversalInfo.name}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => setShowCodeDrawer(true)}
                            className="lg:hidden p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg cursor-pointer"
                        >
                            <Code2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Mobile Stats Bar */}
                <div className="lg:hidden px-4 pb-3">
                    <div className="grid grid-cols-4 gap-2">
                        {mobileStats.map((stat, idx) => (
                            <div key={idx} className={`text-center rounded-lg p-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <div className={`text-lg font-black ${stat.colorClass}`}>{stat.value}</div>
                                <div className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Desktop 3-Panel Layout */}
            <div className="hidden lg:flex flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    {/* Left Panel - Configuration */}
                    <Panel defaultSize={22} minSize={18} maxSize={35}>
                        <div className={`h-full border-r flex flex-col ${theme === 'dark' ? 'bg-slate-900/50 backdrop-blur-xl border-white/10' : 'bg-white border-gray-200'}`}>
                            <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                                <h2 className={`text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    <Settings size={16} />
                                    Configuration
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                                {/* Traversal Type Selection */}
                                <div>
                                    <label className={`block text-xs font-bold mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
                                        Traversal Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {TRAVERSAL_TYPES.map((type) => (
                                            <TraversalTypeButton
                                                key={type.id}
                                                type={type}
                                                isActive={traversalType === type.id}
                                                onClick={setTraversalType}
                                                theme={theme}
                                                disabled={playing}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Random Tree Generation */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
                                        Random Tree
                                    </label>
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={randomNodeCount}
                                            onChange={(e) => setRandomNodeCount(parseInt(e.target.value) || 5)}
                                            disabled={playing}
                                            className={`w-20 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 focus:ring-2 ${theme === 'dark'
                                                ? 'bg-white/10 border border-white/20 text-white focus:ring-cyan-500/40 focus:border-cyan-500'
                                                : 'bg-gray-100 border border-gray-200 text-gray-900 focus:ring-cyan-500 focus:border-cyan-500'
                                                }`}
                                            placeholder="N"
                                        />
                                        <button
                                            onClick={handleRandomTree}
                                            disabled={playing}
                                            className={`flex-1 py-2 rounded-xl font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${theme === 'dark'
                                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                                                : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                                                }`}
                                        >
                                            <Shuffle size={16} />
                                            Generate Random
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions - Tree Presets */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
                                        Presets
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.values(TREE_PRESETS)
                                            .filter(p => p.name !== 'Random Tree') // Exclude generic random since we have specific UI
                                            .map((preset) => {
                                                const Icon = preset.icon;
                                                return (
                                                    <button
                                                        key={preset.name}
                                                        onClick={() => handlePresetSelect(preset)}
                                                        disabled={playing}
                                                        className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${playing
                                                            ? theme === 'dark' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            : theme === 'dark'
                                                                ? 'bg-white/5 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-cyan-50 hover: text-cyan-700 border border-gray-200 hover:border-cyan-300'
                                                            }`}
                                                    >
                                                        <Icon size={12} />
                                                        {preset.name}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Insert Node */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
                                        Insert Node
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={inputValue}
                                            onChange={(e) => { setInputValue(e.target.value); setInputError(''); }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleInsertNode()}
                                            placeholder="Value..."
                                            disabled={playing}
                                            className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 focus:ring-2 ${inputError
                                                ? theme === 'dark'
                                                    ? 'bg-red-500/10 border border-red-500/50 text-white focus:ring-red-500/40'
                                                    : 'bg-red-50 border border-red-300 text-gray-900 focus:ring-red-500'
                                                : theme === 'dark'
                                                    ? 'bg-white/10 border border-white/20 text-white focus:ring-cyan-500/40 focus:border-cyan-500'
                                                    : 'bg-gray-100 border border-gray-200 text-gray-900 focus:ring-cyan-500 focus:border-cyan-500'
                                                }`}
                                        />
                                        <button
                                            onClick={handleInsertNode}
                                            disabled={!inputValue || playing}
                                            className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 cursor-pointer ${!inputValue || playing
                                                ? theme === 'dark' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 text-white shadow-lg'
                                                }`}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    {inputError && (
                                        <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                                            <AlertTriangle size={14} />
                                            <span>{inputError}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Start Traversal Button */}
                                <button
                                    onClick={handleStartTraversal}
                                    disabled={!hasNodes || playing}
                                    className={`w-full py-3 rounded-xl font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${!hasNodes || playing
                                        ? theme === 'dark' ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover: from-green-600 hover:to-emerald-600 hover:scale-105 text-white cursor-pointer'
                                        }`}
                                >
                                    <Sparkles size={18} />
                                    Start {currentTraversalInfo?.name} Traversal
                                </button>

                                {/* Playback Controls */}
                                <div className={`pt-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                                    <h3 className={`text-xs font-bold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        <Play size={14} />
                                        Playback Controls
                                    </h3>

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <ControlButton
                                            onClick={() => {
                                                if (!steps.length) return;
                                                setStarted(true);
                                                setPlaying(!playing);
                                            }}
                                            disabled={steps.length === 0}
                                            icon={playing ? Pause : Play}
                                            label={playing ? 'Pause' : 'Play'}
                                            variant="success"
                                            theme={theme}
                                        />
                                        <ControlButton
                                            onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
                                            disabled={currentStep >= steps.length - 1}
                                            icon={SkipForward}
                                            label="Step"
                                            variant="primary"
                                            theme={theme}
                                        />
                                        <ControlButton
                                            onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                                            disabled={currentStep <= 0}
                                            icon={Rewind}
                                            label="Back"
                                            variant="primary"
                                            theme={theme}
                                        />
                                        <ControlButton
                                            onClick={handleReset}
                                            icon={RotateCcw}
                                            label="Reset"
                                            variant="danger"
                                            theme={theme}
                                        />
                                    </div>

                                    {/* Speed Slider */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
                                                Speed
                                            </label>
                                            <span className={`text-xs font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                                {speed}ms
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={100}
                                            max={2000}
                                            step={100}
                                            value={speed}
                                            onChange={(e) => setSpeed(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                        />
                                        <div className={`flex justify-between text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                                            <span>Fast</span>
                                            <span>Slow</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-white/5 backdrop-blur-sm border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                    <h4 className={`text-xs font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Legend
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { color: 'bg-amber-500', label: 'Current Node' },
                                            { color: 'bg-green-500', label: 'Just Processed' },
                                            { color: 'bg-emerald-500', label: 'Visited/In Result' },
                                            { color: 'bg-blue-500', label: 'In Call Stack' },
                                            { color: 'bg-cyan-400', label: 'Active Edge', isEdge: true },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={`${item.isEdge ? 'w-4 h-0.5' : 'w-3 h-3 rounded-full'} ${item.color} shadow-md`}></div>
                                                <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Traversal Order Info */}
                                <div className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                                    <h4 className={`text-xs font-bold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        <Info size={14} />
                                        Traversal Orders
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded font-bold ${theme === 'dark' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'}`}>LNR</span>
                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>In-Order:  Left → Node → Right</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded font-bold ${theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>NLR</span>
                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Pre-Order: Node → Left → Right</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded font-bold ${theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>LRN</span>
                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Post-Order: Left → Right → Node</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded font-bold ${theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>BFS</span>
                                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Level-Order: Level by Level</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle
                        className={`w-0.5 transition-all duration-200 cursor-col-resize flex items-center justify-center group relative ${theme === 'dark' ? 'bg-white/10 hover:bg-cyan-500/70 hover:w-2' : 'bg-gray-300 hover:bg-cyan-500 hover:w-2'
                            }`}
                    >
                        <div className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800 border-cyan-500' : 'bg-white border-cyan-500'
                            }`}>
                            <ArrowLeftRight size={14} className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} />
                        </div>
                    </PanelResizeHandle>

                    {/* Center Panel - Visualization */}
                    <Panel minSize={40} maxSize={70}>
                        <div className="h-full flex flex-col p-4">
                            {/* Progress Bar & Action Display */}
                            <div className={`mb-4 p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 backdrop-blur-sm border-white/10' : 'bg-white/80 border-gray-200'}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <Activity className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                                                Step {currentStep + 1} of {steps.length || 1}
                                            </div>
                                            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                                                <div
                                                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${getProgressPercentage()}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {steps[currentStep] && (
                                        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 max-w-md ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'
                                            }`}>
                                            <Zap className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                                            <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                                {currentStepData.description}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cytoscape Canvas */}
                            <div className="flex-1 overflow-hidden relative rounded-2xl border-2 border-gray-200 bg-white shadow-lg">
                                <div
                                    ref={cyRef}
                                    className={`absolute inset-0 w-full h-full bg-transparent border-0 shadow-none`}
                                />
                                {!tree.root && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <p className={`text-lg font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                                            Tree is empty - Insert values or select a preset!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Result Display */}
                            <div className="mt-4">
                                <ResultDisplay
                                    result={currentStepData.result || []}
                                    justProcessed={currentStepData.justProcessed}
                                    theme={theme}
                                />
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle
                        className={`w-0.5 transition-all duration-200 cursor-col-resize flex items-center justify-center group relative ${theme === 'dark' ? 'bg-white/10 hover:bg-cyan-500/70 hover:w-2' : 'bg-gray-300 hover:bg-cyan-500 hover:w-2'
                            }`}
                    >
                        <div className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800 border-cyan-500' : 'bg-white border-cyan-500'
                            }`}>
                            <ArrowLeftRight size={14} className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} />
                        </div>
                    </PanelResizeHandle>

                    {/* Right Panel - Stats & Code */}
                    <Panel defaultSize={26} minSize={20} maxSize={40}>
                        <div className={`h-full border-l flex flex-col ${theme === 'dark' ? 'bg-slate-900/50 backdrop-blur-xl border-white/10' : 'bg-white/80 border-gray-200'}`}>
                            <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                                <div className="grid grid-cols-2 gap-2">
                                    <TabButton id="stats" icon={BarChart3} label="Stats" activeTab={activeRightTab} setActiveTab={setActiveRightTab} theme={theme} />
                                    <TabButton id="algorithm" icon={Code2} label="Code" activeTab={activeRightTab} setActiveTab={setActiveRightTab} theme={theme} />
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col">
                                {activeRightTab === 'stats' && (
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <StatCard icon={Target} value={tree.getNodeCount()} label="Nodes" color="cyan" theme={theme} />
                                            <StatCard icon={Activity} value={tree.getHeight()} label="Height" color="purple" theme={theme} />
                                            <StatCard icon={Maximize2} value={currentStepData.result?.length || 0} label="Processed" color="green" theme={theme} />
                                            <StatCard icon={Clock} value={`${getProgressPercentage()}%`} label="Progress" color="amber" theme={theme} />
                                        </div>

                                        {/* Call Stack or Queue Display */}
                                        {traversalType === 'levelorder' ? (
                                            <QueueDisplay queue={currentStepData.queue || []} theme={theme} />
                                        ) : (
                                            <CallStackDisplay callStack={currentStepData.callStack || []} theme={theme} />
                                        )}

                                        {/* Complexity Info */}
                                        <div className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                                            <h4 className={`text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                Time & Space Complexity
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Time</span>
                                                    <span className="font-mono font-bold text-green-500">O(n)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Space (Recursion)</span>
                                                    <span className="font-mono font-bold text-blue-500">O(h)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Space (Level-Order)</span>
                                                    <span className="font-mono font-bold text-amber-500">O(w)</span>
                                                </div>
                                            </div>
                                            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                                n = nodes, h = height, w = max width
                                            </p>
                                        </div>

                                        {/* Use Cases */}
                                        <div className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                            <h4 className={`text-sm font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                Use Cases
                                            </h4>
                                            <div className={`space-y-2 text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                                                <div><strong className="text-cyan-500">In-Order: </strong> BST sorting, expression trees</div>
                                                <div><strong className="text-green-500">Pre-Order:</strong> Tree copying, prefix notation</div>
                                                <div><strong className="text-purple-500">Post-Order:</strong> Tree deletion, postfix notation</div>
                                                <div><strong className="text-amber-500">Level-Order:</strong> BFS, shortest path, level-wise processing</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeRightTab === 'algorithm' && (
                                    <div className="flex-1 overflow-hidden p-4">
                                        <div className={`h-full rounded-xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-800/50 border-white/10' : 'bg-white border-gray-200'}`}>
                                            <div className={`p-3 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                                                <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {currentTraversalInfo?.name} Implementation
                                                </h3>
                                            </div>
                                            <div className="h-[calc(100%-3rem)] overflow-auto">
                                                <BasicCodeDisplay
                                                    cppCode={getTraversalCode(TRAVERSAL_CODES[traversalType]?.cpp, traversalType)}
                                                    pythonCode={getTraversalCode(TRAVERSAL_CODES[traversalType]?.python, traversalType)}
                                                    jsCode={getTraversalCode(TRAVERSAL_CODES[traversalType]?.javascript, traversalType)}
                                                    highlightedLine={currentHighlightedLine}
                                                    theme={theme}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
            {/* Mobile Layout */}
            <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                {/* Current Action Display */}
                {steps[currentStep] && (
                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
                        <div className="flex items-center gap-2">
                            <Zap className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                {currentStepData.description}
                            </span>
                        </div>
                    </div>
                )}

                {/* Visualization */}
                <div className="relative w-full h-[350px] rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-lg">
                    <div
                        ref={mobileCyRef}
                        className={`absolute inset-0 w-full h-full bg-transparent`}
                    />
                    {!tree.root && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                                Tree is empty - Insert values!
                            </p>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {started && steps.length > 0 && (
                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800/50 border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between text-sm mb-2">
                            <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Progress</span>
                            <span className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}>{currentStep + 1} / {steps.length}</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <div
                                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage()}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Playback Controls */}
                <div className={`rounded-xl p-3 border flex gap-2 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <ControlButton
                        onClick={() => {
                            if (!steps.length) return;
                            setStarted(true);
                            setPlaying(!playing);
                        }}
                        disabled={steps.length === 0}
                        icon={playing ? Pause : Play}
                        label={playing ? 'Pause' : 'Play'}
                        variant="success"
                        theme={theme}
                    />
                    <ControlButton
                        onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                        disabled={currentStep <= 0}
                        icon={Rewind}
                        label="Back"
                        variant="primary"
                        theme={theme}
                    />
                    <ControlButton
                        onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
                        disabled={currentStep >= steps.length - 1}
                        icon={SkipForward}
                        label="Step"
                        variant="primary"
                        theme={theme}
                    />
                    <ControlButton
                        onClick={handleReset}
                        icon={RotateCcw}
                        label="Reset"
                        variant="danger"
                        theme={theme}
                    />
                </div>

                {/* Result Display - Mobile */}
                <ResultDisplay
                    result={currentStepData.result || []}
                    justProcessed={currentStepData.justProcessed}
                    theme={theme}
                />

                {/* Settings Accordion */}
                <div className={`border rounded-xl overflow-hidden ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
                    <button
                        onClick={() => setMobileAccordions((prev) => ({ ...prev, settings: !prev.settings }))}
                        className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                        <span className="flex items-center gap-2">
                            <Settings size={16} />
                            Configuration
                        </span>
                        <ChevronDown className={`transition-transform ${mobileAccordions.settings ? 'rotate-180' : ''}`} size={18} />
                    </button>
                    {mobileAccordions.settings && (
                        <div className="p-4 pt-0 space-y-4">
                            {/* Traversal Type Selection - Mobile */}
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                                    Traversal Type
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {TRAVERSAL_TYPES.map((type) => (
                                        <TraversalTypeButton
                                            key={type.id}
                                            type={type}
                                            isActive={traversalType === type.id}
                                            onClick={setTraversalType}
                                            theme={theme}
                                            disabled={playing}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions - Mobile */}
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                                    Quick Actions
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.values(TREE_PRESETS).map((preset) => {
                                        const Icon = preset.icon;
                                        return (
                                            <button
                                                key={preset.name}
                                                onClick={() => handlePresetSelect(preset)}
                                                disabled={playing}
                                                className={`flex items-center gap-1. 5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${playing
                                                    ? theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                                                    : theme === 'dark'
                                                        ? 'bg-white/5 text-slate-300 border border-white/10'
                                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                    }`}
                                            >
                                                <Icon size={12} />
                                                {preset.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Insert Node - Mobile */}
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                                    Insert Node
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => { setInputValue(e.target.value); setInputError(''); }}
                                        placeholder="Value..."
                                        disabled={playing}
                                        className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm ${inputError
                                            ? theme === 'dark' ? 'bg-red-500/10 border border-red-500/50 text-white' : 'bg-red-50 border border-red-300 text-gray-900'
                                            : theme === 'dark' ? 'bg-white/10 border border-white/20 text-white' : 'bg-gray-100 border border-gray-200 text-gray-900'
                                            }`}
                                    />
                                    <button
                                        onClick={handleInsertNode}
                                        disabled={!inputValue || playing}
                                        className={`px-4 py-2 rounded-xl font-bold ${!inputValue || playing
                                            ? theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                            }`}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {inputError && (
                                    <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                                        <AlertTriangle size={14} />
                                        <span>{inputError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Start Button - Mobile */}
                            <button
                                onClick={handleStartTraversal}
                                disabled={!hasNodes || playing}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${!hasNodes || playing
                                    ? theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                    }`}
                            >
                                <Sparkles size={16} />
                                Start Traversal
                            </button>

                            {/* Speed Slider - Mobile */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>Speed</label>
                                    <span className={`text-xs font-bold ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>{speed}ms</span>
                                </div>
                                <input
                                    type="range"
                                    min={100}
                                    max={2000}
                                    step={100}
                                    value={speed}
                                    onChange={(e) => setSpeed(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Accordion - Mobile */}
                <div className={`border rounded-xl overflow-hidden ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
                    <button
                        onClick={() => setMobileAccordions((prev) => ({ ...prev, stats: !prev.stats }))}
                        className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                        <span className="flex items-center gap-2">
                            <BarChart3 size={16} />
                            Statistics & Data
                        </span>
                        <ChevronDown className={`transition-transform ${mobileAccordions.stats ? 'rotate-180' : ''}`} size={18} />
                    </button>
                    {mobileAccordions.stats && (
                        <div className="p-4 pt-0 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard icon={Target} value={tree.getNodeCount()} label="Nodes" color="cyan" theme={theme} />
                                <StatCard icon={Activity} value={tree.getHeight()} label="Height" color="purple" theme={theme} />
                            </div>

                            {/* Call Stack or Queue - Mobile */}
                            {traversalType === 'levelorder' ? (
                                <QueueDisplay queue={currentStepData.queue || []} theme={theme} />
                            ) : (
                                <CallStackDisplay callStack={currentStepData.callStack || []} theme={theme} />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Code Drawer - Mobile */}
            {showCodeDrawer && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCodeDrawer(false)} />
                    <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {currentTraversalInfo?.name} Implementation
                            </h3>
                            <button
                                onClick={() => setShowCodeDrawer(false)}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                            >
                                <XIcon size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <BasicCodeDisplay
                                cppCode={TRAVERSAL_CODES[traversalType]?.cpp}
                                pythonCode={TRAVERSAL_CODES[traversalType]?.python}
                                jsCode={TRAVERSAL_CODES[traversalType]?.javascript}
                                highlightedLine={currentHighlightedLine}
                                theme={theme}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Component */}
            <Alert
                isOpen={alertConfig.isOpen}
                message={alertConfig.message}
                type={alertConfig.type}
                customButtons={alertConfig.customButtons}
                onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
            />

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background:  ${theme === 'dark' ? 'rgba(6, 182, 212, 0.5)' : 'rgba(6, 182, 212, 0.6)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(6, 182, 212, 0.7)' : 'rgba(6, 182, 212, 0.8)'};
        }
      `}</style>
        </div>
    );
};

export default TreeTraversal;