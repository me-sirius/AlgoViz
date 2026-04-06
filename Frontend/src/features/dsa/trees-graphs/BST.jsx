import React, { useState, useEffect, useRef } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
    Play, Pause, SkipForward, RotateCcw, Settings, BarChart3, Code2,
    Activity, Target, Clock, Maximize2, ArrowLeft, ArrowLeftRight,
    Plus, GitBranch, Rewind, ChevronDown, Search, Sparkles, Trash2,
    Shuffle, TreePine, TrendingDown, TrendingUp, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import cytoscape from "../../../core/utils/cytoscapeSetup.js";
import Alert from "../../../components/Alert.jsx";
import BasicCodeDisplay from "../../../components/BasicCodeDisplay.jsx";
import { useTheme } from "../../../core/context/ThemeContext";
import { bst as bstCode } from "../../../core/constants/codeExamples.js";

// BST Node class
class BSTNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
    }
}

// BST class with visualization support
class BSTClass {
    constructor() {
        this.root = null;
    }

    cloneTree(node) {
        if (!node) return null;
        const cloned = new BSTNode(node.value);
        cloned.left = this.cloneTree(node.left);
        cloned.right = this.cloneTree(node.right);
        return cloned;
    }

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

    insert(node, value, steps) {
        if (!node) {
            const newNode = new BSTNode(value);
            steps.push({
                type: "insert",
                value,
                description: `Created new node with value ${value}`,
                tree: this.cloneTree(this.root),
                highlighting: [value],
                action: "create",
                lineNumber: 2,
            });
            return newNode;
        }

        steps.push({
            type: "insert",
            value,
            description: `Comparing ${value} with ${node.value}`,
            tree: this.cloneTree(this.root),
            highlighting: [node.value],
            action: "compare",
            lineNumber: 4,
        });

        if (value < node.value) {
            steps.push({
                type: "insert",
                value,
                description: `${value} < ${node.value}, going left`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value],
                action: "go_left",
                lineNumber: 5,
            });
            node.left = this.insert(node.left, value, steps);
        } else if (value > node.value) {
            steps.push({
                type: "insert",
                value,
                description: `${value} > ${node.value}, going right`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value],
                action: "go_right",
                lineNumber: 7,
            });
            node.right = this.insert(node.right, value, steps);
        } else {
            steps.push({
                type: "insert",
                value,
                description: `${value} already exists in tree`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value],
                action: "duplicate",
                lineNumber: 8,
            });
        }

        return node;
    }

    insertValue(value) {
        const steps = [];
        steps.push({
            type: "insert",
            value,
            description: `Starting insertion of ${value}`,
            tree: this.cloneTree(this.root),
            highlighting: [],
            action: "start",
            lineNumber: 1,
        });

        this.root = this.insert(this.root, value, steps);

        steps.push({
            type: "insert",
            value,
            description: `Successfully inserted ${value}`,
            tree: this.cloneTree(this.root),
            highlighting: [value],
            action: "complete",
            lineNumber: 8,
        });

        return steps;
    }

    search(node, value, steps, path = []) {
        if (!node) {
            steps.push({
                type: "search",
                value,
                description: `${value} not found in tree`,
                tree: this.cloneTree(this.root),
                highlighting: [],
                path: [...path],
                action: "not_found",
                lineNumber: 2,
                found: false,
            });
            return false;
        }

        path.push(node.value);

        steps.push({
            type: "search",
            value,
            description: `Comparing ${value} with ${node.value}`,
            tree: this.cloneTree(this.root),
            highlighting: [node.value],
            path: [...path],
            action: "compare",
            lineNumber: 3,
        });

        if (value === node.value) {
            steps.push({
                type: "search",
                value,
                description: `Found ${value}!`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value],
                path: [...path],
                action: "found",
                lineNumber: 4,
                found: true,
            });
            return true;
        } else if (value < node.value) {
            steps.push({
                type: "search",
                value,
                description: `${value} < ${node.value}, searching left subtree`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value],
                path: [...path],
                action: "go_left",
                lineNumber: 5,
            });
            return this.search(node.left, value, steps, path);
        } else {
            steps.push({
                type: "search",
                value,
                description: `${value} > ${node.value}, searching right subtree`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value],
                path: [...path],
                action: "go_right",
                lineNumber: 7,
            });
            return this.search(node.right, value, steps, path);
        }
    }

    searchValue(value) {
        const steps = [];
        steps.push({
            type: "search",
            value,
            description: `Starting search for ${value}`,
            tree: this.cloneTree(this.root),
            highlighting: [],
            path: [],
            action: "start",
            lineNumber: 1,
        });

        this.search(this.root, value, steps);
        return steps;
    }

    getInOrder(node = this.root, result = []) {
        if (!node) return result;
        this.getInOrder(node.left, result);
        result.push(node.value);
        this.getInOrder(node.right, result);
        return result;
    }

    getNodeCount(node = this.root) {
        if (!node) return 0;
        return 1 + this.getNodeCount(node.left) + this.getNodeCount(node.right);
    }

    getHeight(node = this.root) {
        if (!node) return 0;
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    contains(value, node = this.root) {
        if (!node) return false;
        if (value === node.value) return true;
        if (value < node.value) return this.contains(value, node.left);
        return this.contains(value, node.right);
    }

    findMin(node) {
        while (node.left) node = node.left;
        return node;
    }

    delete(node, value, steps, path = []) {
        if (!node) {
            steps.push({
                type: "delete",
                value,
                description: `Value ${value} not found in tree`,
                tree: this.cloneTree(this.root),
                highlighting: [],
                path: [...path],
                action: "not_found",
                lineNumber: 2,
            });
            return null;
        }

        path.push(node.value);

        steps.push({
            type: "delete",
            value,
            description: `Comparing ${value} with ${node.value}`,
            tree: this.cloneTree(this.root),
            highlighting: [node.value],
            path: [...path],
            action: "compare",
            lineNumber: 3,
        });

        if (value < node.value) {
            steps.push({
                type: "delete",
                value,
                description: `${value} < ${node.value}, searching left subtree`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value],
                path: [...path],
                action: "go_left",
                lineNumber: 4,
            });
            node.left = this.delete(node.left, value, steps, path);
        } else if (value > node.value) {
            steps.push({
                type: "delete",
                value,
                description: `${value} > ${node.value}, searching right subtree`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value],
                path: [...path],
                action: "go_right",
                lineNumber: 5,
            });
            node.right = this.delete(node.right, value, steps, path);
        } else {
            // Node found - handle deletion cases
            if (!node.left) {
                steps.push({
                    type: "delete",
                    value,
                    description: `Found ${value}! No left child, replacing with right child`,
                    tree: this.cloneTree(this.root),
                    highlighting: [node.value],
                    path: [...path],
                    action: "delete_case_1",
                    lineNumber: 6,
                });
                return node.right;
            } else if (!node.right) {
                steps.push({
                    type: "delete",
                    value,
                    description: `Found ${value}! No right child, replacing with left child`,
                    tree: this.cloneTree(this.root),
                    highlighting: [node.value],
                    path: [...path],
                    action: "delete_case_2",
                    lineNumber: 7,
                });
                return node.left;
            }

            // Two children - find inorder successor
            const successor = this.findMin(node.right);
            steps.push({
                type: "delete",
                value,
                description: `Found ${value}! Two children, replacing with inorder successor ${successor.value}`,
                tree: this.cloneTree(this.root),
                highlighting: [node.value, successor.value],
                path: [...path],
                action: "delete_case_3",
                lineNumber: 8,
            });
            node.value = successor.value;
            node.right = this.delete(node.right, successor.value, steps, [...path]);
        }
        return node;
    }

    deleteValue(value) {
        const steps = [];

        // Check if value exists first
        const exists = this.contains(value);

        steps.push({
            type: "delete",
            value,
            description: `Starting deletion of ${value}`,
            tree: this.cloneTree(this.root),
            highlighting: [],
            path: [],
            action: "start",
            lineNumber: 1,
        });

        if (!exists) {
            // If not found, just use search visualization to show it's missing
            // We pass 'steps' so search steps are appended
            this.search(this.root, value, steps, []);
            return steps;
        }

        // If found, proceed with actual delete traversal and operation
        this.root = this.delete(this.root, value, steps, []);

        steps.push({
            type: "delete",
            value,
            description: `Deletion of ${value} complete`,
            tree: this.cloneTree(this.root),
            highlighting: [],
            path: [],
            action: "complete",
            lineNumber: 9,
        });

        return steps;
    }

    buildFromArray(values) {
        this.root = null;
        for (const val of values) {
            this.root = this.insertSilent(this.root, val);
        }
    }

    insertSilent(node, value) {
        if (!node) return new BSTNode(value);
        if (value < node.value) node.left = this.insertSilent(node.left, value);
        else if (value > node.value) node.right = this.insertSilent(node.right, value);
        return node;
    }
}

// Tree Presets
const TREE_PRESETS = {
    random: {
        name: "Random Tree",
        icon: Shuffle,
        generate: () => {
            const size = Math.floor(Math.random() * 6) + 5;
            const values = new Set();
            while (values.size < size) values.add(Math.floor(Math.random() * 99) + 1);
            return Array.from(values);
        },
    },
    balanced: {
        name: "Perfect Balanced",
        icon: TreePine,
        generate: () => [50, 25, 75, 12, 37, 62, 87],
    },
    leftSkewed: {
        name: "Left Skewed",
        icon: TrendingDown,
        generate: () => [80, 70, 60, 50, 40, 30, 20],
    },
    rightSkewed: {
        name: "Right Skewed",
        icon: TrendingUp,
        generate: () => [20, 30, 40, 50, 60, 70, 80],
    },
};

const BST = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Cytoscape refs
    const cyRef = useRef(null);
    const mobileCyRef = useRef(null);
    const cyInstance = useRef(null);

    // Tree state
    const [bst] = useState(() => new BSTClass());
    const [inputValue, setInputValue] = useState("");
    const [operationMode, setOperationMode] = useState("insert");
    const [rootValue, setRootValue] = useState("50"); // Default root value
    const [searchResult, setSearchResult] = useState(null); // { found: boolean, value: number } | null

    // Quick Insert values
    const generateQuickValues = () => {
        const values = [];
        while (values.length < 6) {
            const num = Math.floor(Math.random() * 90) + 10;
            if (!values.includes(num)) values.push(num);
        }
        return values.sort((a, b) => a - b);
    };
    const [quickInsertValues, setQuickInsertValues] = useState(() => generateQuickValues());
    const [insertedValues, setInsertedValues] = useState(new Set());

    // Animation state
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const [speed, setSpeed] = useState(800);

    // UI state
    const [activeRightTab, setActiveRightTab] = useState("stats");
    const [currentHighlightedLine, setCurrentHighlightedLine] = useState(null);
    const [showCodeDrawer, setShowCodeDrawer] = useState(false);
    const [mobileAccordions, setMobileAccordions] = useState({
        settings: false,
        stats: true,
        info: false,
    });
    const [inputError, setInputError] = useState("");
    const [hasNodes, setHasNodes] = useState(false); // Track if tree has nodes

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

    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        message: "",
        type: "error",
        customButtons: null,
    });

    // Current step data
    const currentStepData = steps[currentStep] || { tree: bst.root, highlighting: [], description: "", path: [] };

    const getProgressPercentage = () => {
        if (steps.length <= 1) return 0;
        return Math.round((currentStep / (steps.length - 1)) * 100);
    };

    // Handlers
    const handleBack = () => {
        setAlertConfig({
            isOpen: true,
            message: "Are you sure you want to leave? Your progress will be lost.",
            type: "warning",
            customButtons: (
                <div className="flex space-x-4 justify-center">
                    <button
                        onClick={() => navigate("/")}
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

    const handleOperation = () => {
        const value = parseInt(inputValue);
        if (isNaN(value)) return;

        // Validation
        if (operationMode === "insert" && bst.contains(value)) {
            setInputError(`Value ${value} already exists in tree`);
            return;
        }
        if ((operationMode === "search" || operationMode === "delete") && !bst.root) {
            setInputError("Tree is empty");
            return;
        }
        setInputError("");
        setSearchResult(null); // Clear previous search result

        let newSteps;
        if (operationMode === "insert") {
            newSteps = bst.insertValue(value);
        } else if (operationMode === "search") {
            newSteps = bst.searchValue(value);
            // Check if value was found in last step
            const lastStep = newSteps[newSteps.length - 1];
            const found = lastStep?.action === "found";
            setSearchResult({ found, value });
        } else {
            newSteps = bst.deleteValue(value);
            // Check if value was found/deleted
            const lastStep = newSteps[newSteps.length - 1];
            // If the last action was "not_found", show the not found alert
            if (lastStep?.action === "not_found") {
                setSearchResult({ found: false, value, operation: "delete" });
            } else {
                setSearchResult({ found: true, value, operation: "delete" });
            }
        }

        const startingIndex = steps.length;
        setSteps(prev => [...prev, ...newSteps]);
        setCurrentStep(startingIndex);
        setStarted(true);
        setPlaying(true);
        setInputValue("");
        // Update hasNodes after operation
        if (operationMode === "insert") setHasNodes(true);
        else if (operationMode === "delete") setHasNodes(!!bst.root);
    };

    // Create tree with specified root value
    const handleCreateTree = () => {
        const value = parseInt(rootValue);
        if (isNaN(value) || value < 1 || value > 999) {
            setInputError("Root must be 1-999");
            return;
        }

        // Collect all existing values
        let existingValues = [];
        if (bst.root) {
            existingValues = bst.getInOrder();
        }

        // Prepare unique values set including new root
        const uniqueValues = new Set(existingValues);
        uniqueValues.add(value);

        // Prepare insertion order: New Root FIRST, then others
        const valuesToInsert = [value];
        uniqueValues.delete(value); // Remove root from set to avoid dupe in loop
        valuesToInsert.push(...Array.from(uniqueValues));

        // Rebuild tree
        bst.buildFromArray(valuesToInsert);

        // Update State
        setInputError("");
        setInsertedValues(new Set(valuesToInsert));
        setHasNodes(true);
        setSearchResult(null);
        setSteps([]);
        setCurrentStep(0);
        setStarted(false);

        if (cyInstance.current) {
            // Force refresh if needed, though state updates usually trigger it
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
    };

    const handlePresetSelect = (preset) => {
        if (playing) return;
        const values = preset.generate();
        bst.buildFromArray(values);
        setSteps([]);
        setCurrentStep(0);
        setStarted(false);
        setInsertedValues(new Set());
        setSearchResult(null);
        if (cyInstance.current) {
            cyInstance.current.destroy();
            cyInstance.current = null;
        }
        setHasNodes(true); // Preset creates tree with nodes
    };

    const handleQuickInsert = (value) => {
        if (playing) return;

        const newSteps = bst.insertValue(value);
        const startingIndex = steps.length;

        setSteps(prev => [...prev, ...newSteps]);
        setCurrentStep(startingIndex);
        setStarted(true);
        setPlaying(true);
        setHasNodes(true);

        const newInserted = new Set(insertedValues);
        newInserted.add(value);
        setInsertedValues(newInserted);

        if (newInserted.size >= quickInsertValues.length) {
            setTimeout(() => {
                setQuickInsertValues(generateQuickValues());
                setInsertedValues(new Set());
            }, 500);
        }
    };

    const handleReset = () => {
        setPlaying(false);
        bst.root = null;
        setSteps([]);
        setCurrentStep(0);
        setStarted(false);
        setInsertedValues(new Set());
        setQuickInsertValues(generateQuickValues());
        setHasNodes(false);
        setSearchResult(null);
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
        const timer = setTimeout(() => setCurrentStep(prev => prev + 1), speed);
        return () => clearTimeout(timer);
    }, [playing, currentStep, steps.length, speed]);

    // Update highlighted line
    useEffect(() => {
        if (steps[currentStep]?.lineNumber) {
            setCurrentHighlightedLine(steps[currentStep].lineNumber);
        }
    }, [currentStep, steps]);

    // Cytoscape visualization
    useEffect(() => {
        const container = isMobile ? mobileCyRef.current : cyRef.current;
        if (!container) return;

        const generateElements = (node, elements = []) => {
            if (!node) return elements;

            const isHighlighted = currentStepData.highlighting?.includes(node.value);
            const isInPath = currentStepData.path?.includes(node.value);
            const isFound = currentStepData.action === "found" && currentStepData.highlighting?.includes(node.value);
            const isNotFound = currentStepData.action === "not_found" && isHighlighted;
            const isDeleted = currentStepData.action?.startsWith("delete_case");

            // Determine node class based on state priority
            let nodeClass = "";
            if (isFound) nodeClass = "found";
            else if (isNotFound) nodeClass = "not_found";
            else if (isDeleted && isHighlighted) nodeClass = "deleted";
            else if (isHighlighted) nodeClass = "highlighted";
            else if (isInPath) nodeClass = "inpath";

            elements.push({
                data: { id: `node-${node.value}`, label: String(node.value) },
                position: { x: node.x, y: node.y },
                classes: nodeClass
            });

            // Check if edge is in traversed path
            const isEdgeTraversed = (parentVal, childVal) => {
                const path = currentStepData.path || [];
                const parentIdx = path.indexOf(parentVal);
                const childIdx = path.indexOf(childVal);
                return parentIdx !== -1 && childIdx !== -1 && childIdx === parentIdx + 1;
            };

            if (node.left) {
                const edgeInPath = isEdgeTraversed(node.value, node.left.value);
                elements.push({
                    data: { source: `node-${node.value}`, target: `node-${node.left.value}` },
                    classes: edgeInPath ? "left-edge traversed" : "left-edge"
                });
                generateElements(node.left, elements);
            }
            if (node.right) {
                const edgeInPath = isEdgeTraversed(node.value, node.right.value);
                elements.push({
                    data: { source: `node-${node.value}`, target: `node-${node.right.value}` },
                    classes: edgeInPath ? "right-edge traversed" : "right-edge"
                });
                generateElements(node.right, elements);
            }
            return elements;
        };

        // Helper to calculate positions on a cloned tree
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
                selector: "node",
                style: {
                    "background-color": theme === "dark" ? "#1e293b" : "#f8fafc",
                    "border-color": theme === "dark" ? "#64748b" : "#94a3b8",
                    "border-width": 3,
                    label: "data(label)",
                    color: theme === "dark" ? "#f8fafc" : "#0f172a",
                    "font-weight": "bold",
                    "text-valign": "center",
                    "text-halign": "center",
                    width: 50,
                    height: 50,
                    "font-size": 16,
                    "transition-property": "background-color, border-color",
                    "transition-duration": "300ms"
                }
            },
            {
                selector: "node.highlighted",
                style: {
                    "background-color": "#eab308",
                    "border-color": "#facc15",
                    color: "#ffffff"
                }
            },
            {
                selector: "node.found",
                style: {
                    "background-color": "#22c55e",
                    "border-color": "#4ade80",
                    "border-width": 5,
                    color: "#ffffff",
                    width: 60,
                    height: 60,
                    "font-size": 18
                }
            },
            {
                selector: "node.not_found",
                style: {
                    "background-color": "#f97316",
                    "border-color": "#fb923c",
                    "border-width": 5,
                    color: "#ffffff",
                    width: 55,
                    height: 55
                }
            },
            {
                selector: "node.deleted",
                style: {
                    "background-color": "#ef4444",
                    "border-color": "#f87171",
                    color: "#ffffff"
                }
            },
            {
                selector: "node.inpath",
                style: {
                    "background-color": "#3b82f6",
                    "border-color": "#60a5fa",
                    color: "#ffffff"
                }
            },
            {
                selector: "edge",
                style: {
                    width: 2,
                    "line-color": theme === "dark" ? "#475569" : "#cbd5e1",
                    "target-arrow-shape": "triangle",
                    "target-arrow-color": theme === "dark" ? "#475569" : "#cbd5e1",
                    "curve-style": "bezier",
                    "transition-property": "line-color, width",
                    "transition-duration": "300ms"
                }
            },
            {
                selector: ".left-edge",
                style: {
                    "line-color": theme === "dark" ? "#3b82f6" : "#60a5fa",
                    "target-arrow-color": theme === "dark" ? "#3b82f6" : "#60a5fa"
                }
            },
            {
                selector: ".right-edge",
                style: {
                    "line-color": theme === "dark" ? "#a855f7" : "#c084fc",
                    "target-arrow-color": theme === "dark" ? "#a855f7" : "#c084fc"
                }
            },
            {
                selector: "edge.traversed",
                style: {
                    width: 4,
                    "line-color": "#22d3ee",
                    "target-arrow-color": "#22d3ee"
                }
            }
        ];

        const treeRoot = currentStepData.tree || bst.root;

        // Calculate positions BEFORE generating elements
        if (treeRoot) {
            const canvasWidth = container.clientWidth || 600;
            calculateTreePositions(treeRoot, canvasWidth / 2, 60, canvasWidth / 4);
        }

        const elements = treeRoot ? generateElements(treeRoot, []) : [];

        if (cyInstance.current) {
            cyInstance.current.batch(() => {
                cyInstance.current.elements().remove();
                if (elements.length > 0) {
                    cyInstance.current.add(elements);
                }
            });
            cyInstance.current.style(getStylesheet());
            if (elements.length > 0) {
                cyInstance.current.layout({ name: 'preset', animate: false }).run();
                cyInstance.current.fit(undefined, 50);
            }
        } else {
            cyInstance.current = cytoscape({
                container: container,
                elements: elements,
                style: getStylesheet(),
                layout: { name: "preset" },
                minZoom: 0.5,
                maxZoom: 2.0,
                userZoomingEnabled: true,
                userPanningEnabled: true,
                wheelSensitivity: 0.3
            });
            if (elements.length > 0) {
                cyInstance.current.fit(undefined, 50);
            }
        }
    }, [currentStepData, theme, steps, isMobile, bst]);

    // Get in-order traversal for display
    const inOrderValues = currentStepData.tree ? bst.getInOrder(currentStepData.tree) : bst.getInOrder();

    // Mobile stats
    const mobileStats = [
        { value: bst.getNodeCount(), label: "Nodes", colorClass: theme === "dark" ? "text-cyan-400" : "text-cyan-600" },
        { value: bst.getHeight(), label: "Height", colorClass: theme === "dark" ? "text-purple-400" : "text-purple-600" },
        { value: steps.length, label: "Steps", colorClass: theme === "dark" ? "text-amber-400" : "text-amber-600" },
        { value: `${getProgressPercentage()}%`, label: "Progress", colorClass: theme === "dark" ? "text-green-400" : "text-green-600" },
    ];

    // Inline UI Components
    const TabButton = ({ id, icon: Icon, label, activeTab, setActiveTab }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm cursor-pointer transition-all duration-300 ${activeTab === id
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

    const StatCard = ({ icon: Icon, value, label, color }) => {
        const colorClasses = {
            green: theme === "dark" ? "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400" : "from-green-50 to-emerald-50 border-green-200 text-green-600",
            cyan: theme === "dark" ? "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400" : "from-cyan-50 to-blue-50 border-cyan-200 text-cyan-600",
            amber: theme === "dark" ? "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400" : "from-amber-50 to-yellow-50 border-amber-200 text-amber-600",
            purple: theme === "dark" ? "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400" : "from-purple-50 to-fuchsia-50 border-purple-200 text-purple-600",
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

    const ControlButton = ({ onClick, disabled, icon: Icon, label, variant = "primary" }) => {
        const variantClasses = {
            success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
            primary: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600",
            danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600",
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
                    }`}
            >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
            </button>
        );
    };

    // RENDER
    return (
        <div className={`h-screen flex flex-col overflow-hidden ${theme === "dark" ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            {/* Header */}
            <div className={`flex-shrink-0 z-40 border-b backdrop-blur-xl ${theme === "dark" ? "bg-slate-900/80 border-white/10" : "bg-white/80 border-gray-200"}`}>
                <div className="flex items-center justify-between px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            onClick={handleBack}
                            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 cursor-pointer ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
                                <GitBranch size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-black">Binary Search Tree</h1>
                                <p className={`text-xs sm:text-sm font-semibold ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                                    Insert • Search • Delete • O(log n)
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCodeDrawer(true)}
                        className="lg:hidden p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg cursor-pointer"
                    >
                        <Code2 size={18} />
                    </button>
                </div>

                {/* Mobile Stats Bar */}
                <div className="lg:hidden px-4 pb-3">
                    <div className="grid grid-cols-4 gap-2">
                        {mobileStats.map((stat, idx) => (
                            <div key={idx} className={`text-center rounded-lg p-2 ${theme === "dark" ? "bg-white/5" : "bg-gray-100"}`}>
                                <div className={`text-lg font-black ${stat.colorClass}`}>{stat.value}</div>
                                <div className={`text-[10px] font-bold uppercase ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop 3-Panel Layout */}
            <div className="hidden lg:flex flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    {/* Left Panel - Configuration */}
                    <Panel defaultSize={22} minSize={18} maxSize={35}>
                        <div className={`h-full border-r flex flex-col ${theme === "dark" ? "bg-slate-900/50 backdrop-blur-xl border-white/10" : "bg-white border-gray-200"}`}>
                            <div className={`p-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                                <h2 className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                    <Settings size={16} />
                                    Configuration
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                {/* Operation Mode Toggle */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                                        Operation Mode
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => { setOperationMode("insert"); setInputError(""); }}
                                            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${operationMode === "insert"
                                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                                : theme === "dark" ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            <Plus size={14} className="inline mr-1" /> Insert
                                        </button>
                                        <button
                                            onClick={() => { setOperationMode("search"); setInputError(""); }}
                                            disabled={!hasNodes}
                                            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${!hasNodes
                                                ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : operationMode === "search"
                                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg cursor-pointer"
                                                    : theme === "dark" ? "bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer" : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                                                }`}
                                        >
                                            <Search size={14} className="inline mr-1" /> Search
                                        </button>
                                        <button
                                            onClick={() => { setOperationMode("delete"); setInputError(""); }}
                                            disabled={!hasNodes}
                                            className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${!hasNodes
                                                ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : operationMode === "delete"
                                                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg cursor-pointer"
                                                    : theme === "dark" ? "bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer" : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                                                }`}
                                        >
                                            <Trash2 size={14} className="inline mr-1" /> Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions - Tree Presets */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
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
                                                    className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${playing
                                                        ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                        : theme === "dark"
                                                            ? "bg-white/5 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30"
                                                            : "bg-gray-100 text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 border border-gray-200 hover:border-cyan-300"
                                                        }`}
                                                >
                                                    <Icon size={12} />
                                                    {preset.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Create Tree with Custom Root */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                                        {hasNodes ? "Change Root (Keep Nodes)" : "Create Tree with Root"}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={rootValue}
                                            onChange={(e) => setRootValue(e.target.value)}
                                            placeholder="Root value..."
                                            className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${theme === "dark"
                                                ? "bg-white/10 border border-white/20 text-white"
                                                : "bg-gray-100 border border-gray-200 text-gray-900"
                                                }`}
                                        />
                                        <button
                                            onClick={handleCreateTree}
                                            disabled={playing || !rootValue}
                                            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${playing || !rootValue
                                                ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 text-white shadow-lg"
                                                }`}
                                        >
                                            <GitBranch size={18} />
                                        </button>
                                    </div>
                                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                                        {hasNodes ? "Rebuilds tree with new root." : "Default: 50. First node becomes root."}
                                    </p>
                                </div>

                                {/* Search Result Feedback */}
                                {searchResult && !playing && (
                                    <div className={`rounded-xl p-4 border animate-pulse ${searchResult.found
                                        ? searchResult.operation === "delete"
                                            ? theme === "dark" ? "bg-red-500/10 border-red-500/50" : "bg-red-50 border-red-300" // Deleted
                                            : theme === "dark" ? "bg-green-500/10 border-green-500/50" : "bg-green-50 border-green-300" // Found
                                        : theme === "dark" ? "bg-orange-500/10 border-orange-500/50" : "bg-orange-50 border-orange-300" // Not Found
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            {searchResult.found ? (
                                                searchResult.operation === "delete" ? (
                                                    <>
                                                        <Trash2 size={20} className="text-red-500" />
                                                        <span className={`font-bold ${theme === "dark" ? "text-red-400" : "text-red-700"}`}>
                                                            Successful Deletion! Value {searchResult.value} removed
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Target size={20} className="text-green-500" />
                                                        <span className={`font-bold ${theme === "dark" ? "text-green-400" : "text-green-700"}`}>
                                                            Found! Value {searchResult.value} exists in tree
                                                        </span>
                                                    </>
                                                )
                                            ) : (
                                                <>
                                                    <AlertTriangle size={20} className="text-orange-500" />
                                                    <span className={`font-bold ${theme === "dark" ? "text-orange-400" : "text-orange-700"}`}>
                                                        Not Found! Value {searchResult.value} doesn't exist
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setSearchResult(null)}
                                            className="text-xs mt-2 underline opacity-70 hover:opacity-100 cursor-pointer transition-all duration-200"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}

                                {/* Value Input */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                                        {operationMode === "insert" ? "Insert Value" : operationMode === "search" ? "Search Value" : "Delete Value"}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={inputValue}
                                            onChange={(e) => { setInputValue(e.target.value); setInputError(""); }}
                                            onKeyDown={(e) => e.key === "Enter" && handleOperation()}
                                            placeholder="Number..."
                                            className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 focus:ring-2 ${inputError
                                                ? theme === "dark"
                                                    ? "bg-red-500/10 border border-red-500/50 text-white focus:ring-red-500/40 focus:border-red-500"
                                                    : "bg-red-50 border border-red-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                                                : theme === "dark"
                                                    ? "bg-white/10 border border-white/20 text-white focus:ring-cyan-500/40 focus:border-cyan-500"
                                                    : "bg-gray-100 border border-gray-200 text-gray-900 focus:ring-cyan-500 focus:border-cyan-500"
                                                }`}
                                        />
                                        <button
                                            onClick={handleOperation}
                                            disabled={!inputValue || playing}
                                            className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 cursor-pointer ${!inputValue || playing
                                                ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : operationMode === "insert"
                                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 text-white shadow-lg"
                                                    : operationMode === "search"
                                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 text-white shadow-lg"
                                                        : "bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105 text-white shadow-lg"
                                                }`}
                                        >
                                            {operationMode === "insert" ? <Plus size={18} /> : operationMode === "search" ? <Search size={18} /> : <Trash2 size={18} />}
                                        </button>
                                    </div>
                                    {/* Inline Error Message */}
                                    {inputError && (
                                        <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                                            <AlertTriangle size={14} />
                                            <span>{inputError}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Insert */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                                        Quick Insert
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {quickInsertValues.map((value) => {
                                            const isUsed = insertedValues.has(value);
                                            return (
                                                <button
                                                    key={value}
                                                    onClick={() => handleQuickInsert(value)}
                                                    disabled={playing || isUsed}
                                                    className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isUsed
                                                        ? theme === "dark" ? "bg-green-500/20 text-green-400 cursor-default" : "bg-green-100 text-green-600 cursor-default"
                                                        : playing
                                                            ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                            : theme === "dark" ? "bg-white/5 text-slate-200 hover:bg-white/10 hover:scale-105 cursor-pointer" : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 cursor-pointer"
                                                        }`}
                                                >
                                                    {isUsed ? `✓ ${value}` : value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Playback Controls */}
                                <div className={`pt-4 border-t ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                                    <h3 className={`text-xs font-bold mb-3 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
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
                                            label={playing ? "Pause" : "Play"}
                                            variant="success"
                                        />
                                        <ControlButton
                                            onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
                                            disabled={currentStep >= steps.length - 1}
                                            icon={SkipForward}
                                            label="Step"
                                            variant="primary"
                                        />
                                        <ControlButton
                                            onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                                            disabled={currentStep <= 0}
                                            icon={Rewind}
                                            label="Back"
                                            variant="primary"
                                        />
                                        <ControlButton
                                            onClick={handleReset}
                                            icon={RotateCcw}
                                            label="Reset"
                                            variant="danger"
                                        />
                                    </div>

                                    {/* Speed Slider */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className={`text-xs font-bold ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>
                                                Speed
                                            </label>
                                            <span className={`text-xs font-bold ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
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
                                            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 backdrop-blur-sm border-white/10" : "bg-gray-50 border-gray-200"}`}>
                                    <h4 className={`text-xs font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                        Legend
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { color: "bg-yellow-500", label: "Current Node" },
                                            { color: "bg-blue-500", label: "Traversed Path" },
                                            { color: "bg-green-500", label: "Found/Inserted" },
                                            { color: "bg-orange-500", label: "Not Found" },
                                            { color: "bg-red-500", label: "Deleted Node" },
                                            { color: "bg-cyan-400", label: "Active Edge", isEdge: true },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className={`${item.isEdge ? "w-4 h-0.5" : "w-3 h-3 rounded-full"} ${item.color} shadow-md`}></div>
                                                <span className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-gray-700"}`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle
                        className={`w-0.5 transition-all duration-200 cursor-col-resize flex items-center justify-center group relative ${theme === "dark" ? "bg-white/10 hover:bg-cyan-500/70 hover:w-2" : "bg-gray-300 hover:bg-cyan-500 hover:w-2"
                            }`}
                    >
                        <div className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-cyan-500"
                            }`}>
                            <ArrowLeftRight size={14} className={theme === "dark" ? "text-cyan-400" : "text-cyan-600"} />
                        </div>
                    </PanelResizeHandle>

                    {/* Center Panel - Visualization */}
                    <Panel minSize={40} maxSize={70}>
                        <div className="h-full flex flex-col p-4">
                            {/* Progress Bar */}
                            <div className={`mb-4 p-3 rounded-xl border ${theme === "dark" ? "bg-slate-800/50 backdrop-blur-sm border-white/10" : "bg-white/80 border-gray-200"}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <Activity className={`w-5 h-5 flex-shrink-0 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                                                Step {currentStep + 1} of {steps.length || 1}
                                            </div>
                                            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}>
                                                <div
                                                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${getProgressPercentage()}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {steps[currentStep] && (
                                        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${theme === "dark" ? "bg-cyan-500/10 border-cyan-500/30" : "bg-cyan-50 border-cyan-200"}`}>
                                            <Sparkles className={`w-4 h-4 ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`} />
                                            <span className={`text-sm font-bold truncate max-w-xs ${theme === "dark" ? "text-cyan-400" : "text-cyan-700"}`}>
                                                {currentStepData.description}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cytoscape Canvas */}
                            <div className="flex-1 overflow-hidden relative flex flex-col rounded-2xl border-2 border-gray-200 bg-white shadow-lg">
                                <div className="flex-1 relative">
                                    <div
                                        ref={cyRef}
                                        className={`absolute inset-0 w-full h-full bg-transparent border-0 shadow-none`}
                                    />
                                    {!currentStepData.tree && !hasNodes && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <p className={`text-lg font-medium ${theme === "dark" ? "text-slate-500" : "text-gray-400"}`}>
                                                Tree is empty - Insert values to start!
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* In-Order Traversal */}
                                <div className={`flex-shrink-0 p-3 rounded-b-2xl border-x border-b ${theme === "dark" ? "bg-slate-900/80 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold uppercase ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                                            In-Order Traversal (Sorted)
                                        </span>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                        {inOrderValues.length > 0 ? inOrderValues.map((val, idx) => (
                                            <div key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${currentStepData.highlighting?.includes(val)
                                                ? theme === "dark" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50" : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                : theme === "dark" ? "bg-white/5 text-slate-300" : "bg-white text-gray-700 border border-gray-200"
                                                }`}>
                                                {val}
                                            </div>
                                        )) : (
                                            <span className="text-xs italic text-gray-500">Empty</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle
                        className={`w-0.5 transition-all duration-200 cursor-col-resize flex items-center justify-center group relative ${theme === "dark" ? "bg-white/10 hover:bg-cyan-500/70 hover:w-2" : "bg-gray-300 hover:bg-cyan-500 hover:w-2"
                            }`}
                    >
                        <div className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ${theme === "dark" ? "bg-gray-800 border-cyan-500" : "bg-white border-cyan-500"
                            }`}>
                            <ArrowLeftRight size={14} className={theme === "dark" ? "text-cyan-400" : "text-cyan-600"} />
                        </div>
                    </PanelResizeHandle>

                    {/* Right Panel - Stats & Code */}
                    <Panel defaultSize={26} minSize={20} maxSize={40}>
                        <div className={`h-full border-l flex flex-col ${theme === "dark" ? "bg-slate-900/50 backdrop-blur-xl border-white/10" : "bg-white/80 border-gray-200"}`}>
                            <div className={`p-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                                <div className="grid grid-cols-2 gap-2">
                                    <TabButton id="stats" icon={BarChart3} label="Stats" activeTab={activeRightTab} setActiveTab={setActiveRightTab} />
                                    <TabButton id="algorithm" icon={Code2} label="Code" activeTab={activeRightTab} setActiveTab={setActiveRightTab} />
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col">
                                {activeRightTab === "stats" && (
                                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <StatCard icon={Target} value={bst.getNodeCount()} label="Nodes" color="cyan" />
                                            <StatCard icon={Activity} value={bst.getHeight()} label="Height" color="purple" />
                                            <StatCard icon={Maximize2} value={steps.length} label="Steps" color="amber" />
                                            <StatCard icon={Clock} value={`${getProgressPercentage()}%`} label="Progress" color="green" />
                                        </div>

                                        {/* BST Properties */}
                                        <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 backdrop-blur-sm border-white/10" : "bg-gray-50 border-gray-200"}`}>
                                            <h4 className={`text-sm font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                                BST Properties
                                            </h4>
                                            <div className={`space-y-1 text-xs ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                                                <div>• Left subtree values &lt; root</div>
                                                <div>• Right subtree values &gt; root</div>
                                                <div>• In-order gives sorted sequence</div>
                                                <div>• Efficient search, insert, delete</div>
                                            </div>
                                        </div>

                                        {/* Complexity */}
                                        <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"}`}>
                                            <h4 className={`text-sm font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                                Time Complexity
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className={theme === "dark" ? "text-slate-400" : "text-gray-600"}>Average</span>
                                                    <span className="font-mono font-bold text-green-500">O(log n)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={theme === "dark" ? "text-slate-400" : "text-gray-600"}>Worst (skewed)</span>
                                                    <span className="font-mono font-bold text-red-500">O(n)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeRightTab === "algorithm" && (
                                    <div className="flex-1 overflow-hidden p-4">
                                        <div className={`h-full rounded-xl border overflow-hidden ${theme === "dark" ? "bg-slate-800/50 border-white/10" : "bg-white border-gray-200"}`}>
                                            <div className={`p-3 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                                                <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                                    BST Implementation
                                                </h3>
                                            </div>
                                            <div className="h-[calc(100%-3rem)] overflow-auto">
                                                <BasicCodeDisplay
                                                    cppCode={bstCode.cpp}
                                                    pythonCode={bstCode.python}
                                                    jsCode={bstCode.javascript}
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
            <div className="lg:hidden flex-1 overflow-y-auto p-4 space-y-4">
                {/* Visualization */}
                <div>
                    <h3 className={`font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        BST Visualization
                    </h3>
                    <p className={`text-sm mb-4 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                        {currentStepData.description || "Insert values to build the tree"}
                    </p>

                    <div className="relative w-full h-[400px] rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-lg">
                        <div
                            ref={mobileCyRef}
                            className={`absolute inset-0 w-full h-full bg-transparent`}
                        />
                        {!currentStepData.tree && !hasNodes && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <p className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-gray-400"}`}>
                                    Tree is empty - Insert values!
                                </p>
                            </div>
                        )}
                    </div>

                    {started && steps.length > 0 && (
                        <div className="mt-4">
                            <div className={`flex justify-between text-sm mb-2 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                                <span>Progress</span>
                                <span>{currentStep + 1} / {steps.length}</span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-200"}`}>
                                <div
                                    className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${getProgressPercentage()}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Playback Controls */}
                <div className={`rounded-xl p-3 border flex gap-2 ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}>
                    <ControlButton
                        onClick={() => {
                            if (!steps.length) return;
                            setStarted(true);
                            setPlaying(!playing);
                        }}
                        disabled={steps.length === 0}
                        icon={playing ? Pause : Play}
                        label={playing ? "Pause" : "Play"}
                        variant="success"
                    />
                    <ControlButton
                        onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
                        disabled={currentStep <= 0}
                        icon={Rewind}
                        label="Back"
                        variant="primary"
                    />
                    <ControlButton
                        onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
                        disabled={currentStep >= steps.length - 1}
                        icon={SkipForward}
                        label="Step"
                        variant="primary"
                    />
                    <ControlButton
                        onClick={handleReset}
                        icon={RotateCcw}
                        label="Reset"
                        variant="danger"
                    />
                </div>

                {/* Settings Accordion */}
                <div className={`border rounded-xl overflow-hidden ${theme === "dark" ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}>
                    <button
                        onClick={() => setMobileAccordions((prev) => ({ ...prev, settings: !prev.settings }))}
                        className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm cursor-pointer ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                        <span className="flex items-center gap-2">
                            <Settings size={16} />
                            Configuration
                        </span>
                        <ChevronDown className={`transition-transform ${mobileAccordions.settings ? "rotate-180" : ""}`} size={18} />
                    </button>
                    {mobileAccordions.settings && (
                        <div className="p-4 pt-0 space-y-4">
                            {/* Operation Mode */}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => { setOperationMode("insert"); setInputError(""); }}
                                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${operationMode === "insert"
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                        : theme === "dark" ? "bg-white/5 text-slate-300" : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    <Plus size={14} className="inline mr-1" /> Insert
                                </button>
                                <button
                                    onClick={() => { setOperationMode("search"); setInputError(""); }}
                                    disabled={!hasNodes}
                                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${!hasNodes
                                        ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : operationMode === "search"
                                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg cursor-pointer"
                                            : theme === "dark" ? "bg-white/5 text-slate-300 cursor-pointer" : "bg-gray-100 text-gray-700 cursor-pointer"
                                        }`}
                                >
                                    <Search size={14} className="inline mr-1" /> Search
                                </button>
                                <button
                                    onClick={() => { setOperationMode("delete"); setInputError(""); }}
                                    disabled={!hasNodes}
                                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all ${!hasNodes
                                        ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : operationMode === "delete"
                                            ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg cursor-pointer"
                                            : theme === "dark" ? "bg-white/5 text-slate-300 cursor-pointer" : "bg-gray-100 text-gray-700 cursor-pointer"
                                        }`}
                                >
                                    <Trash2 size={14} className="inline mr-1" /> Delete
                                </button>
                            </div>

                            {/* Quick Actions - Tree Presets */}
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
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
                                                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${playing
                                                    ? theme === "dark" ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"
                                                    : theme === "dark"
                                                        ? "bg-white/5 text-slate-300 border border-white/10"
                                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                                    }`}
                                            >
                                                <Icon size={12} />
                                                {preset.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Create Tree with Custom Root - Mobile */}
                            <div>
                                <label className={`block text-xs font-bold mb-2 ${theme === "dark" ? "text-slate-300" : "text-gray-600"}`}>
                                    {hasNodes ? "Change Root (Keep Nodes)" : "Create Tree with Root"}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={rootValue}
                                        onChange={(e) => setRootValue(e.target.value)}
                                        placeholder="Root..."
                                        className={`flex-1 px-3 py-2 rounded-xl font-semibold text-sm ${theme === "dark"
                                            ? "bg-white/10 border border-white/20 text-white"
                                            : "bg-gray-100 border border-gray-200 text-gray-900"
                                            }`}
                                    />
                                    <button
                                        onClick={handleCreateTree}
                                        disabled={playing || !rootValue}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${playing || !rootValue
                                            ? theme === "dark" ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"
                                            : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                                            }`}
                                    >
                                        <GitBranch size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Search Result Feedback - Mobile */}
                            {searchResult && !playing && (
                                <div className={`rounded-xl p-3 border ${searchResult.found
                                    ? searchResult.operation === "delete"
                                        ? theme === "dark" ? "bg-red-500/10 border-red-500/50" : "bg-red-50 border-red-300" // Deleted
                                        : theme === "dark" ? "bg-green-500/10 border-green-500/50" : "bg-green-50 border-green-300" // Found
                                    : theme === "dark" ? "bg-orange-500/10 border-orange-500/50" : "bg-orange-50 border-orange-300" // Not Found
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        {searchResult.found ? (
                                            searchResult.operation === "delete" ? (
                                                <>
                                                    <Trash2 size={16} className="text-red-500" />
                                                    <span className={`text-sm font-bold ${theme === "dark" ? "text-red-400" : "text-red-700"}`}>
                                                        Deleted {searchResult.value}!
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Target size={16} className="text-green-500" />
                                                    <span className={`text-sm font-bold ${theme === "dark" ? "text-green-400" : "text-green-700"}`}>
                                                        Found! {searchResult.value} exists
                                                    </span>
                                                </>
                                            )
                                        ) : (
                                            <>
                                                <AlertTriangle size={16} className="text-orange-500" />
                                                <span className={`text-sm font-bold ${theme === "dark" ? "text-orange-400" : "text-orange-700"}`}>
                                                    Not Found! {searchResult.value}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            <div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => { setInputValue(e.target.value); setInputError(""); }}
                                        placeholder="Enter number..."
                                        className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 focus:ring-2 ${inputError
                                            ? theme === "dark" ? "bg-red-500/10 border border-red-500/50 text-white" : "bg-red-50 border border-red-300 text-gray-900"
                                            : theme === "dark" ? "bg-white/10 border border-white/20 text-white" : "bg-gray-100 border border-gray-200 text-gray-900"
                                            }`}
                                    />
                                    <button
                                        onClick={handleOperation}
                                        disabled={!inputValue || playing}
                                        className={`px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${!inputValue || playing
                                            ? theme === "dark" ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"
                                            : operationMode === "insert"
                                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                                : operationMode === "search"
                                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                                    : "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                            }`}
                                    >
                                        {operationMode === "insert" ? <Plus size={18} /> : operationMode === "search" ? <Search size={18} /> : <Trash2 size={18} />}
                                    </button>
                                </div>
                                {inputError && (
                                    <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                                        <AlertTriangle size={14} />
                                        <span>{inputError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Quick Insert */}
                            <div className="grid grid-cols-3 gap-2">
                                {quickInsertValues.map((value) => {
                                    const isUsed = insertedValues.has(value);
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => handleQuickInsert(value)}
                                            disabled={playing || isUsed}
                                            className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isUsed
                                                ? theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                                                : playing
                                                    ? theme === "dark" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                    : theme === "dark" ? "bg-white/5 text-slate-200 hover:bg-white/10 cursor-pointer" : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                                                }`}
                                        >
                                            {isUsed ? `✓ ${value}` : value}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Speed */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className={`text-sm font-bold ${theme === "dark" ? "text-slate-200" : "text-gray-700"}`}>Speed</label>
                                    <span className={`text-sm font-bold ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>{speed}ms</span>
                                </div>
                                <input
                                    type="range"
                                    min={100}
                                    max={2000}
                                    step={100}
                                    value={speed}
                                    onChange={(e) => setSpeed(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Accordion */}
                <div className={`border rounded-xl overflow-hidden ${theme === "dark" ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}>
                    <button
                        onClick={() => setMobileAccordions((prev) => ({ ...prev, stats: !prev.stats }))}
                        className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm cursor-pointer ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                        <span className="flex items-center gap-2">
                            <BarChart3 size={16} />
                            Statistics
                        </span>
                        <ChevronDown className={`transition-transform ${mobileAccordions.stats ? "rotate-180" : ""}`} size={18} />
                    </button>
                    {mobileAccordions.stats && (
                        <div className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard icon={Target} value={bst.getNodeCount()} label="Nodes" color="cyan" />
                                <StatCard icon={Activity} value={bst.getHeight()} label="Height" color="purple" />
                                <StatCard icon={Maximize2} value={steps.length} label="Steps" color="amber" />
                                <StatCard icon={Clock} value={`${getProgressPercentage()}%`} label="Progress" color="green" />
                            </div>
                        </div>
                    )}
                </div>

                {/* In-Order Traversal */}
                <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                    <h4 className={`text-xs font-bold uppercase mb-2 ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                        In-Order Traversal
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                        {inOrderValues.length > 0 ? inOrderValues.map((val, idx) => (
                            <div key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${currentStepData.highlighting?.includes(val)
                                ? theme === "dark" ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                                : theme === "dark" ? "bg-white/5 text-slate-300" : "bg-white text-gray-700 border border-gray-200"
                                }`}>
                                {val}
                            </div>
                        )) : (
                            <span className="text-xs italic text-gray-500">Empty</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Code Drawer */}
            {showCodeDrawer && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCodeDrawer(false)} />
                    <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}>
                        <div className={`flex items-center justify-between p-4 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                            <h3 className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>BST Implementation</h3>
                            <button
                                onClick={() => setShowCodeDrawer(false)}
                                className={`p-2 rounded-xl transition-colors cursor-pointer ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                            >
                                <ArrowLeft size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <BasicCodeDisplay
                                cppCode={bstCode.cpp}
                                pythonCode={bstCode.python}
                                jsCode={bstCode.javascript}
                                highlightedLine={currentHighlightedLine}
                                theme={theme}
                            />
                        </div>
                    </div>
                </div>
            )}

            <Alert
                isOpen={alertConfig.isOpen}
                message={alertConfig.message}
                type={alertConfig.type}
                customButtons={alertConfig.customButtons}
            />
        </div>
    );
};

export default BST;