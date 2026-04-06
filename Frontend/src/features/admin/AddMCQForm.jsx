import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Alert from "../../components/Alert";
import {
  Trash2,
  Save,
  List,
  Plus,
  HelpCircle,
  Upload,
  X,
  Loader2,
  Sparkles,
  BookOpen,
  Settings2,
  Calendar,
  Building2,
  Tag,
  CheckCircle2,
  Image,
  Type,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  GitBranch,
  Copy,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// Helper Components moved outside to prevent re-renders
const SectionCard = ({
  children,
  className = "",
  icon: Icon,
  title,
  subtitle,
  headerAction,
}) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#30363d] rounded-2xl ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
    {title && (
      <div className="flex items-center gap-3 p-5 border-b border-[#30363d]">
        {Icon && (
          <div className="p-2.5 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/20">
            <Icon className="text-purple-400" size={18} />
          </div>
        )}
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerAction && <div className="ml-auto">{headerAction}</div>}
      </div>
    )}
    <div className="p-5 space-y-4 relative">{children}</div>
  </div>
);

const InputField = ({
  label,
  icon: Icon,
  children,
  accentColor = "purple",
}) => (
  <div className="space-y-2">
    <label
      className={`text-xs font-semibold text-${accentColor}-400 flex items-center gap-1.5`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </label>
    {children}
  </div>
);

const AddMCQForm = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "error",
    customButtons: null,
  });
  const initialFormState = {
    question: "",
    options: ["", "", "", ""],
    correctOptions: [], // Changed from correctOption: 0
    category: "Operating Systems",
    difficulty: "Medium",
    questionType: "Real",
    yearAsked: new Date().getFullYear(),
    explanation: "",
    tags: "",
    companies: "",
    questionSource: "Internship",
    contentBlocks: [], // For complex questions with intermixed text/images
  };

  const [formData, setFormData] = useState(() => {
    // Restore from sessionStorage on mount
    const saved = sessionStorage.getItem("mcq_form_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialFormState;
      }
    }
    return initialFormState;
  });
  const [isMultiSelect, setIsMultiSelect] = useState(() => {
    return sessionStorage.getItem("mcq_is_multi_select") === "true";
  });
  const [useContentBlocks, setUseContentBlocks] = useState(() => {
    return sessionStorage.getItem("mcq_use_content_blocks") === "true";
  });

  // Persist form data to sessionStorage on changes
  React.useEffect(() => {
    sessionStorage.setItem("mcq_form_data", JSON.stringify(formData));
  }, [formData]);

  React.useEffect(() => {
    sessionStorage.setItem("mcq_is_multi_select", isMultiSelect.toString());
  }, [isMultiSelect]);

  React.useEffect(() => {
    sessionStorage.setItem(
      "mcq_use_content_blocks",
      useContentBlocks.toString(),
    );
  }, [useContentBlocks]);

  // Image extraction states
  const [images, setImages] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const blockImageInputRef = useRef(null);
  const [uploadingBlockImage, setUploadingBlockImage] = useState(false);
  const [lastUploadedImage, setLastUploadedImage] = useState(null);
  const optionImageInputRef = useRef(null);
  const [uploadingOptionIndex, setUploadingOptionIndex] = useState(null);

  // Toggle for AI Section
  const [showAiExtractor, setShowAiExtractor] = useState(true);

  // Diagram Builder State
  const [diagramType, setDiagramType] = useState("pie");
  const [showDiagramPreview, setShowDiagramPreview] = useState(false);
  const [diagramCode, setDiagramCode] = useState("");
  const [showImageHelper, setShowImageHelper] = useState(false);
  const [showDiagramHelper, setShowDiagramHelper] = useState(false);

  // Diagram Templates
  const diagramTemplates = {
    pie: {
      name: "Pie Chart",
      description: "Market share, distribution questions",
      template: `pie title Distribution
    "Category A" : 25
    "Category B" : 20
    "Category C" : 15
    "Category D" : 30
    "Category E" : 10`,
    },
    bar: {
      name: "Bar Chart",
      description: "Comparison questions",
      template: `bar-chart title Comparisons
    "Category A" : 45
    "Category B" : 30
    "Category C" : 60`,
    },
    flowchart: {
      name: "Flowchart",
      description: "Algorithm flow, decision trees",
      template: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
    },
    sequence: {
      name: "Sequence Diagram",
      description: "Process flow, networking",
      template: `sequenceDiagram
    participant A as Client
    participant B as Server
    A->>B: Request
    B-->>A: Response`,
    },
    class: {
      name: "Class Diagram",
      description: "OOP, inheritance questions",
      template: `classDiagram
    class Animal {
        +String name
        +makeSound()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog`,
    },
    er: {
      name: "ER Diagram",
      description: "Database design questions",
      template: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : includes`,
    },
    state: {
      name: "State Diagram",
      description: "State machine questions",
      template: `stateDiagram-v2
    [*] --> Idle
    Idle --> Running : start
    Running --> Stopped : stop
    Stopped --> [*]`,
    },
    graph: {
      name: "Graph",
      description: "Nodes and edges (Weighted/Unweighted)",
      template: `flowchart TD
    A((1)) -- 4 --> B((2))
    A -- 2 --> C((3))
    B -- 5 --> C
    B -- 10 --> D((4))
    C -- 3 --> D`,
    },
    tree: {
      name: "Binary Tree",
      description: "Tree data structures",
      template: `flowchart TD
    A((10)) --> B((5))
    A --> C((15))
    B --> D((3))
    B --> E((7))
    C --> F((12))
    C --> G((20))`,
    },
    line: {
      name: "Line Chart",
      description: "Compare multiple data series",
      template: `line-chart title "Average Runs Scored"
y-axis-label: "Avg Runs"
x-axis: 10, 20, 30, 40, 50, 60, 70, 80
series "Amol": 100, 90, 68, 58, 58, 45, 55, 54
series "Brag": 40, 59, 58, 88, 78, 65, 64, 59
series "Chris": 30, 19, 18, 21, 36, 40, 34, 33`,
    },
  };
  // Content Block Management
  const addTextBlock = () => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, { type: "text", content: "" }],
    }));
  };

  const addImageBlock = () => {
    blockImageInputRef.current?.click();
  };

  const handleBlockImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadBlockImage(file);
    if (blockImageInputRef.current) blockImageInputRef.current.value = "";
  };

  const updateBlockContent = (index, content) => {
    setFormData((prev) => {
      const newBlocks = [...prev.contentBlocks];
      newBlocks[index] = { ...newBlocks[index], content };
      return { ...prev, contentBlocks: newBlocks };
    });
  };

  const removeBlock = (index) => {
    setFormData((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((_, i) => i !== index),
    }));
  };

  const moveBlockUp = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const newBlocks = [...prev.contentBlocks];
      [newBlocks[index - 1], newBlocks[index]] = [
        newBlocks[index],
        newBlocks[index - 1],
      ];
      return { ...prev, contentBlocks: newBlocks };
    });
  };

  const moveBlockDown = (index) => {
    setFormData((prev) => {
      if (index >= prev.contentBlocks.length - 1) return prev;
      const newBlocks = [...prev.contentBlocks];
      [newBlocks[index], newBlocks[index + 1]] = [
        newBlocks[index + 1],
        newBlocks[index],
      ];
      return { ...prev, contentBlocks: newBlocks };
    });
  };

  // Drag-to-reorder blocks
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(null);
  const [dragOverBlockIndex, setDragOverBlockIndex] = useState(null);

  const handleBlockReorderDragStart = (e, index) => {
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString()); // Required for Firefox
  };

  const handleBlockReorderDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedBlockIndex !== null && draggedBlockIndex !== index) {
      setDragOverBlockIndex(index);
    }
  };

  const handleBlockReorderDragLeave = (e) => {
    e.preventDefault();
    setDragOverBlockIndex(null);
  };

  const handleBlockReorderDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedBlockIndex !== null && draggedBlockIndex !== dropIndex) {
      setFormData((prev) => {
        const newBlocks = [...prev.contentBlocks];
        const [draggedBlock] = newBlocks.splice(draggedBlockIndex, 1);
        newBlocks.splice(dropIndex, 0, draggedBlock);
        return { ...prev, contentBlocks: newBlocks };
      });
    }

    setDraggedBlockIndex(null);
    setDragOverBlockIndex(null);
  };

  const handleBlockReorderDragEnd = () => {
    setDraggedBlockIndex(null);
    setDragOverBlockIndex(null);
  };

  // Drag and drop for content block images (external files)
  const [isBlockDragging, setIsBlockDragging] = useState(false);

  const handleBlockDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only show overlay for external file drags, not internal block reordering
    const hasFiles = e.dataTransfer.types.includes("Files");
    if (hasFiles && draggedBlockIndex === null) {
      setIsBlockDragging(true);
    }
  };

  const handleBlockDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsBlockDragging(false);
    }
  };

  const handleBlockDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only show overlay for external file drags
    const hasFiles = e.dataTransfer.types.includes("Files");
    if (hasFiles && draggedBlockIndex === null) {
      setIsBlockDragging(true);
    }
  };

  const handleBlockDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBlockDragging(false);

    // Skip if this is an internal block reorder (not external file drop)
    if (draggedBlockIndex !== null) {
      return;
    }

    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type === "image/svg+xml",
    );

    if (files.length === 0) {
      return; // Silently ignore - might be a failed block reorder
    }

    // Upload each dropped image
    for (const file of files) {
      await uploadBlockImage(file);
    }
  };

  const uploadBlockImage = async (file) => {
    setUploadingBlockImage(true);
    try {
      const secret = sessionStorage.getItem("admin_secret");
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      console.log("Uploading image:", file.name, file.type);

      const response = await axios.post(
        `${API_URL}/upload/mcq-image`,
        formDataUpload,
        {
          headers: {
            "x-admin-secret": secret,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Upload response:", response.data);

      if (response.data.success && response.data.url) {
        setLastUploadedImage(response.data.url);
        toast.success(`Image uploaded successfully!`);
      } else {
        console.error("Upload succeeded but no URL returned:", response.data);
        toast.error("Upload succeeded but no image URL returned");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(`Failed to upload: ${file.name}`);
    } finally {
      setUploadingBlockImage(false);
    }
  };

  // Option Image Upload Handler
  const handleOptionImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploadingOptionIndex === null) return;

    const toastId = toast.loading("Uploading option image...");
    try {
      const secret = sessionStorage.getItem("admin_secret");
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await axios.post(
        `${API_URL}/upload/mcq-image`,
        formDataUpload,
        {
          headers: {
            "x-admin-secret": secret,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success && response.data.url) {
        const markdown = `![Option Image](${response.data.url})`;

        setFormData((prev) => {
          const newOptions = [...prev.options];
          // Append to existing text or replace if empty? Append is safer.
          const currentText = newOptions[uploadingOptionIndex];
          newOptions[uploadingOptionIndex] = currentText
            ? `${currentText}\n\n${markdown}`
            : markdown;
          return { ...prev, options: newOptions };
        });

        toast.success("Image added to option!", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (error) {
      console.error("Option image upload error:", error);
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setUploadingOptionIndex(null);
      if (optionImageInputRef.current) optionImageInputRef.current.value = "";
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    processFiles(files);
  };

  // Process files to base64
  const processFiles = (files) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(",")[1];
        setImages((prev) => [
          ...prev,
          {
            data: base64,
            mimeType: file.type,
            preview: e.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Extract MCQ from images using AI
  const handleExtract = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setExtracting(true);
    setAiResponse(null);
    try {
      const secret = sessionStorage.getItem("admin_secret");
      const response = await axios.post(
        `${API_URL}/admin/extract-mcq`,
        {
          images: images.map((img) => ({
            data: img.data,
            mimeType: img.mimeType,
          })),
        },
        { headers: { "x-admin-secret": secret } },
      );

      if (response.data.success) {
        const extracted = response.data.data;
        setAiResponse(extracted);
        setFormData((prev) => ({
          ...prev,
          question: extracted.question || prev.question,
          options:
            extracted.options?.length > 0 ? extracted.options : prev.options,
          // If AI gives single index, wrap in array. If it gives array, use it.
          correctOptions: Array.isArray(extracted.correctOption)
            ? extracted.correctOption
            : extracted.correctOption >= 0
              ? [extracted.correctOption]
              : prev.correctOptions,
          category: extracted.category || prev.category,
          difficulty: extracted.difficulty || prev.difficulty,
          explanation: extracted.explanation || prev.explanation,
          tags: extracted.tags || prev.tags,
        }));

        // Auto-detect multi-select if AI suggests multiple answers
        if (
          Array.isArray(extracted.correctOption) &&
          extracted.correctOption.length > 1
        ) {
          setIsMultiSelect(true);
        }

        toast.success("Question extracted! Review the AI analysis below.");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      setAiResponse({
        error: error.response?.data?.message || "Extraction failed",
      });
      toast.error(
        error.response?.data?.message ||
        "Failed to extract. Try again or fill manually.",
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);

    // Update correctOptions indices
    const newCorrectOptions = formData.correctOptions
      .filter((optIdx) => optIdx !== index) // Remove if the deleted option was selected
      .map((optIdx) => (optIdx > index ? optIdx - 1 : optIdx)); // Shift indices for subsequent options

    setFormData({
      ...formData,
      options: newOptions,
      correctOptions: newCorrectOptions,
    });
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the form? All unsaved data will be lost.",
      )
    ) {
      setFormData(initialFormState);
      setImages([]);
      setAiResponse(null);
      setExtracting(false);
      setUseContentBlocks(false);
      setIsMultiSelect(false);
      setAlertConfig({
        isOpen: false,
        message: "",
        type: "error",
        customButtons: null,
      });
      // Clear sessionStorage
      sessionStorage.removeItem("mcq_form_data");
      sessionStorage.removeItem("mcq_is_multi_select");
      sessionStorage.removeItem("mcq_use_content_blocks");
      toast("Form cleared", { icon: "🧹" });
    }
  };

  const handleSubmit = async (e, mode = null) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const secret = sessionStorage.getItem("admin_secret");
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      let url = `${API_URL}/admin/mcq`;
      if (mode) url += `?mode=${mode}`;

      console.log("payload : ", payload);
      const response = await axios.post(url, payload, {
        headers: { "x-admin-secret": secret },
      });
      console.log("response : ", response.data);

      if (response.status === 200 || response.status === 201) {
        setAlertConfig({
          isOpen: true,
          message: response.data.message || "MCQ saved successfully!",
          type: "success",
          customButtons: (
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() =>
                  setAlertConfig((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-400 transition-all cursor-pointer"
              >
                Continue Adding
              </button>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error(error);

      if (error.response && error.response.status === 409) {
        // Duplicate Question Found
        setAlertConfig({
          isOpen: true,
          message: "Duplicate Question Detected!",
          type: "warning", // You might want to ensure your Alert component handles 'warning' style
          customButtons: (
            <div className="flex flex-col gap-3 sm:flex-row space-x-0 sm:space-x-4 justify-center mt-2">
              <button
                onClick={() => {
                  setAlertConfig((prev) => ({ ...prev, isOpen: false }));
                  handleSubmit(null, "overwrite");
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Overwrite Existing
              </button>
              <button
                onClick={() => {
                  setAlertConfig((prev) => ({ ...prev, isOpen: false }));
                  handleSubmit(null, "keep");
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Keep Both
              </button>
              <button
                onClick={() =>
                  setAlertConfig((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ),
        });
      } else {
        setAlertConfig({
          isOpen: true,
          message: error.response?.data?.message || "Something went wrong",
          type: "error",
          customButtons: (
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() =>
                  setAlertConfig((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-6 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-500 transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass =
    "w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder:text-gray-600";
  const selectBaseClass =
    "w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-white outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer appearance-none";

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl text-white shadow-lg shadow-purple-900/30">
            <List size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Add MCQ
            </h1>
            <p className="text-gray-500 mt-1">
              Create multiple choice questions for Core CS & Aptitude
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-[#161b22] hover:bg-[#1f242c] border border-[#30363d] text-gray-400 hover:text-white rounded-xl transition-all flex items-center gap-2 text-sm font-medium ml-auto cursor-pointer"
        >
          <Trash2 size={16} /> Clear Form
        </button>
      </div>

      <Alert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        customButtons={alertConfig.customButtons}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard
          icon={Sparkles}
          title="AI Image Extraction"
          subtitle="Upload question image(s) and let AI fill the form"
          className="border-purple-500/30"
          headerAction={
            <button
              type="button"
              onClick={() => setShowAiExtractor(!showAiExtractor)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {showAiExtractor ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          }
        >
          {showAiExtractor && (
            <div className="animate-fade-in-down">
              <div className="flex justify-end -mt-2 mb-2">
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={extracting || images.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20 cursor-pointer"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />{" "}
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Extract from Image
                    </>
                  )}
                </button>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging
                    ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
                    : "border-[#30363d] hover:border-purple-500/50 hover:bg-purple-500/5"
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <div
                  className={`transition-transform duration-300 pointer-events-none ${isDragging ? "scale-110" : ""}`}
                >
                  <Upload
                    className={`mx-auto mb-3 ${isDragging ? "text-purple-400" : "text-gray-500"}`}
                    size={40}
                  />
                  <p
                    className={`font-medium ${isDragging ? "text-purple-400" : "text-gray-400"}`}
                  >
                    {isDragging
                      ? "Drop images here!"
                      : "Click or drag images here"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Supports PNG, JPG, WEBP
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.preview}
                        alt={img.name}
                        className="w-28 h-28 object-cover rounded-xl border-2 border-[#30363d] group-hover:border-purple-500/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-400 shadow-lg cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {aiResponse && (
                <div className="bg-[#0d1117] border border-purple-500/30 rounded-xl p-5 space-y-4 mt-4">
                  <h4 className="text-purple-400 font-bold flex items-center gap-2">
                    <Sparkles size={16} /> AI Analysis Results
                  </h4>
                  {aiResponse.error ? (
                    <p className="text-red-400">{aiResponse.error}</p>
                  ) : (
                    <div className="space-y-4 text-sm">
                      <div className="p-3 bg-[#161b22] rounded-lg">
                        <span className="text-gray-500 text-xs uppercase tracking-wider">
                          Question
                        </span>
                        <p className="text-white mt-1">{aiResponse.question}</p>
                      </div>
                      <div className="p-3 bg-[#161b22] rounded-lg">
                        <span className="text-gray-500 text-xs uppercase tracking-wider">
                          Options
                        </span>
                        <ul className="mt-2 space-y-2">
                          {aiResponse.options?.map((opt, i) => (
                            <li
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded-lg ${aiResponse.correctOption === i ? "bg-emerald-500/10 border border-emerald-500/30" : ""}`}
                            >
                              <span
                                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${aiResponse.correctOption === i ? "bg-emerald-500 text-white" : "bg-[#30363d] text-gray-400"}`}
                              >
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span
                                className={
                                  aiResponse.correctOption === i
                                    ? "text-emerald-400 font-medium"
                                    : "text-gray-300"
                                }
                              >
                                {opt}
                              </span>
                              {aiResponse.correctOption === i && (
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-400 ml-auto"
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-[#161b22] rounded-lg">
                          <span className="text-gray-500 text-xs uppercase tracking-wider">
                            Category
                          </span>
                          <p className="text-white mt-1">
                            {aiResponse.category || "Not detected"}
                          </p>
                        </div>
                        <div className="p-3 bg-[#161b22] rounded-lg">
                          <span className="text-gray-500 text-xs uppercase tracking-wider">
                            Difficulty
                          </span>
                          <p
                            className={`mt-1 font-semibold ${aiResponse.difficulty === "Easy" ? "text-emerald-400" : aiResponse.difficulty === "Medium" ? "text-yellow-400" : "text-red-400"}`}
                          >
                            {aiResponse.difficulty || "Not detected"}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs italic flex items-center gap-1">
                        <CheckCircle2 size={12} /> Fields have been auto-filled.
                        Review and adjust as needed.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Question Card */}
        <SectionCard icon={BookOpen} title="Question Details">
          {/* Hidden input for block image uploads */}
          <input
            type="file"
            ref={blockImageInputRef}
            onChange={handleBlockImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Question Text Field with Markdown Support */}
          <InputField label="Question Text">
            <textarea
              required
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              rows={12}
              className={
                inputBaseClass + " resize-y min-h-[160px] font-mono text-sm"
              }
              placeholder={`Enter your question here.
Supports Markdown and LaTeX.

To add an image:
1. Upload it using the button below
2. Copy the markdown code
3. Paste it here

Example:
What is the output of this code?

![diagram](https://example.com/image.png)`}
            />
            <div className="flex justify-between items-start mt-2">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="text-purple-400">💡</span>
                <span>
                  Supports <strong className="text-purple-400">Markdown</strong>{" "}
                  & <strong className="text-purple-400">LaTeX</strong>
                </span>
              </p>
            </div>
          </InputField>

          {/* Helper Tools Toggles */}
          <div className="flex flex-wrap items-center gap-6 mt-4 p-4 rounded-xl bg-[#0d1117] border border-[#30363d]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowImageHelper(!showImageHelper)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${showImageHelper ? "text-emerald-400" : "text-gray-400 hover:text-gray-300"}`}
              >
                {showImageHelper ? (
                  <ToggleRight size={28} />
                ) : (
                  <ToggleLeft size={28} />
                )}
                Image Upload Helper
              </button>
            </div>

            <div className="w-px h-6 bg-[#30363d] hidden sm:block" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDiagramHelper(!showDiagramHelper)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${showDiagramHelper ? "text-purple-400" : "text-gray-400 hover:text-gray-300"}`}
              >
                {showDiagramHelper ? (
                  <ToggleRight size={28} />
                ) : (
                  <ToggleLeft size={28} />
                )}
                Diagram Builder
              </button>
            </div>
          </div>

          {/* Image Upload Helper */}
          {showImageHelper && (
            <div className="mt-4 p-4 rounded-xl bg-[#0d1117] border border-[#30363d] border-dashed animate-fade-in-up">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Image size={16} className="text-emerald-400" />
                  Image Upload Helper
                </h4>
                <button
                  type="button"
                  onClick={() => blockImageInputRef.current?.click()}
                  disabled={uploadingBlockImage}
                  className="px-3 py-1.5 bg-emerald-600/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-600/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {uploadingBlockImage ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  {uploadingBlockImage ? "Uploading..." : "Upload Image"}
                </button>
              </div>

              {lastUploadedImage ? (
                <div className="bg-[#161b22] rounded-lg p-3 mt-2 border border-[#30363d] flex gap-3">
                  <div className="w-20 h-20 shrink-0 bg-white rounded-md flex items-center justify-center overflow-hidden border border-white/10">
                    <img
                      src={lastUploadedImage}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-gray-500 mb-1">
                      Markdown Code (Click to Copy):
                    </p>
                    <code
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `![diagram](${lastUploadedImage})`,
                        );
                        toast.success("Markdown copied!");
                      }}
                      className="block bg-black/30 p-2 rounded text-xs text-emerald-400 font-mono cursor-pointer hover:bg-black/50 transition-colors whitespace-nowrap overflow-x-auto"
                    >
                      {`![diagram](${lastUploadedImage})`}
                    </code>
                    <p className="text-[10px] text-gray-600 mt-1">
                      Paste this code into the question text area above.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 text-center py-2">
                  Upload an image to generate a Markdown link for your question.
                </p>
              )}
            </div>
          )}

          {/* Diagram Builder */}
          {showDiagramHelper && (
            <div className="mt-4 p-4 rounded-xl bg-[#0d1117] border border-[#30363d] border-dashed animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <BarChart3 size={16} className="text-purple-400" />
                  Diagram Builder
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                    NEW
                  </span>
                </h4>
              </div>

              {/* Diagram Type Selector */}
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(diagramTemplates).map(([key, { name }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setDiagramType(key);
                      setDiagramCode(diagramTemplates[key].template);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${diagramType === key
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                      }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 mb-3">
                {diagramTemplates[diagramType]?.description}
              </p>

              {/* Code Editor */}
              <div className="relative">
                <textarea
                  value={diagramCode}
                  onChange={(e) => setDiagramCode(e.target.value)}
                  rows={6}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-gray-300 resize-y focus:outline-none focus:border-purple-500/50"
                  placeholder="Edit your diagram code here..."
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const markdownCode =
                        "```mermaid\n" + diagramCode + "\n```";
                      navigator.clipboard.writeText(markdownCode);
                      toast.success("Diagram code copied!");
                    }}
                    disabled={!diagramCode}
                    className="p-1.5 bg-purple-500/20 text-purple-400 rounded-md hover:bg-purple-500/30 transition-all cursor-pointer disabled:opacity-50"
                    title="Copy to clipboard"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={() =>
                    setDiagramCode(diagramTemplates[diagramType].template)
                  }
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
                >
                  Reset to template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const markdownCode =
                      "\n```mermaid\n" + diagramCode + "\n```\n";
                    setFormData((prev) => ({
                      ...prev,
                      question: prev.question + markdownCode,
                    }));
                    toast.success("Diagram added to question!");
                  }}
                  disabled={!diagramCode}
                  className="px-3 py-1.5 bg-purple-600/20 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/30 hover:bg-purple-600/30 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={12} />
                  Add to Question
                </button>
              </div>

              <p className="text-[10px] text-gray-600 mt-2">
                💡 Select a diagram type, customize the code, then click "Add to
                Question" to insert it.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <InputField label="Category">
              <div className="relative">
                <select
                  value={
                    [
                      "Operating Systems",
                      "OOPs",
                      "DBMS",
                      "Computer Networks",
                      "DSA",
                      "SQL",
                      "System Design",
                      "Aptitude",
                      "Code Output",
                    ].includes(formData.category)
                      ? formData.category
                      : "Others"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Others") {
                      setFormData({ ...formData, category: "" });
                    } else {
                      setFormData({ ...formData, category: val });
                    }
                  }}
                  className={selectBaseClass}
                >
                  <option>Operating Systems</option>
                  <option>OOPs</option>
                  <option>DBMS</option>
                  <option>Computer Networks</option>
                  <option>DSA</option>
                  <option>SQL</option>
                  <option>System Design</option>
                  <option>Aptitude</option>
                  <option>Code Output</option>
                  <option>Others</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Custom Category Input */}
              {(![
                "Operating Systems",
                "OOPs",
                "DBMS",
                "Computer Networks",
                "DSA",
                "SQL",
                "System Design",
                "Aptitude",
                "Code Output",
              ].includes(formData.category)) && (
                  <div className="mt-2 animate-fade-in-up">
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={inputBaseClass}
                      placeholder="Type custom category name..."
                      autoFocus
                    />
                  </div>
                )}
            </InputField>
            <InputField label="Difficulty">
              <div className="relative">
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className={selectBaseClass}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </InputField>
          </div>
        </SectionCard>

        {/* Options Card */}
        <SectionCard icon={CheckCircle2} title="Answer Options">
          {/* Hidden input for option image uploads */}
          <input
            type="file"
            ref={optionImageInputRef}
            onChange={handleOptionImageSelect}
            accept="image/*"
            className="hidden"
          />
          {/* Toggle for Single/Multi Selection */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#30363d]">
            <div>
              <h4 className="text-sm font-semibold text-white">
                Selection Mode
              </h4>
              <p className="text-xs text-gray-500">
                Allow multiple correct options?
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMultiSelect(!isMultiSelect);
                // If switching to single, keep only the first selected option if any
                if (isMultiSelect && formData.correctOptions.length > 1) {
                  setFormData((prev) => ({
                    ...prev,
                    correctOptions: prev.correctOptions.slice(0, 1),
                  }));
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isMultiSelect ? "bg-purple-600" : "bg-gray-600"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMultiSelect ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div className="space-y-3">
            {formData.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <input
                  type={isMultiSelect ? "checkbox" : "radio"}
                  name="correctOption" // Required for radio behavior
                  checked={formData.correctOptions.includes(i)}
                  onChange={() => {
                    if (isMultiSelect) {
                      // Multi-select logic (Toggle)
                      const newCorrectOptions =
                        formData.correctOptions.includes(i)
                          ? formData.correctOptions.filter((idx) => idx !== i)
                          : [...formData.correctOptions, i];
                      setFormData({
                        ...formData,
                        correctOptions: newCorrectOptions,
                      });
                    } else {
                      // Single-select logic (Replace)
                      setFormData({ ...formData, correctOptions: [i] });
                    }
                  }}
                  className={`w-5 h-5 cursor-pointer ${isMultiSelect ? "rounded accent-emerald-500" : "accent-emerald-500"}`}
                />
                <div className="flex-1 relative">
                  <span
                    className={`absolute left-3 top-3 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold z-10 ${formData.correctOptions.includes(i) ? "bg-emerald-500 text-white" : "bg-[#30363d] text-gray-500"}`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <textarea
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    rows={1}
                    className={`${inputBaseClass} pl-12 pr-10 resize-y min-h-[44px] font-mono text-sm ${formData.correctOptions.includes(i) ? "border-emerald-500/50 ring-2 ring-emerald-500/20" : ""}`}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUploadingOptionIndex(i);
                      optionImageInputRef.current?.click();
                    }}
                    disabled={uploadingOptionIndex !== null}
                    className="absolute right-2 top-2 p-1.5 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all cursor-pointer"
                    title="Upload image for this option"
                  >
                    {uploadingOptionIndex === i ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Image size={16} />
                    )}
                  </button>
                </div>
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-3 text-sm flex items-center gap-2 text-purple-400 hover:text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-500/10 transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Another Option
          </button>
        </SectionCard>

        {/* Metadata Card */}
        <SectionCard icon={Settings2} title="Question Metadata">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Question Type" accentColor="blue">
              <div className="relative">
                <select
                  value={formData.questionType}
                  onChange={(e) =>
                    setFormData({ ...formData, questionType: e.target.value })
                  }
                  className={selectBaseClass}
                >
                  <option value="Practice">Practice Question</option>
                  <option value="Real">Real / Test Question</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </InputField>
            <InputField label="Question Source" accentColor="blue">
              <div className="relative">
                <select
                  value={formData.questionSource}
                  onChange={(e) =>
                    setFormData({ ...formData, questionSource: e.target.value })
                  }
                  className={selectBaseClass}
                >
                  <option value="Internship">Internship</option>
                  <option value="Placement">Placement</option>
                  <option value="Both">Both</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </InputField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Year Asked" icon={Calendar} accentColor="blue">
              <input
                type="number"
                value={formData.yearAsked}
                onChange={(e) =>
                  setFormData({ ...formData, yearAsked: e.target.value })
                }
                className={inputBaseClass}
                placeholder="e.g. 2024"
              />
            </InputField>
            <InputField label="Companies" icon={Building2} accentColor="blue">
              <input
                value={formData.companies}
                onChange={(e) =>
                  setFormData({ ...formData, companies: e.target.value })
                }
                className={inputBaseClass}
                placeholder="e.g. Google, Amazon"
              />
            </InputField>
          </div>
        </SectionCard>

        {/* Explanation Card */}
        <SectionCard icon={HelpCircle} title="Explanation & Tags">
          <InputField
            label="Explanation (Why is it correct?)"
            icon={HelpCircle}
            accentColor="yellow"
          >
            <textarea
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              rows={8}
              className={inputBaseClass + " resize-y min-h-[80px]"}
              placeholder="Explain why the correct answer is right..."
            />
          </InputField>
          <InputField label="Tags (Comma Separated)" icon={Tag}>
            <input
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className={inputBaseClass}
              placeholder="e.g. Process, Thread, Scheduling"
            />
          </InputField>
        </SectionCard>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 text-lg cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Saving...
              </>
            ) : (
              <>
                <Save size={20} /> Save MCQ
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMCQForm;
