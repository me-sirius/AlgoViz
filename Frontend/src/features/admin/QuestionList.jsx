import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Search,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  X,
  Filter,
  RefreshCw,
  FileCode,
  Clock,
  HardDrive,
  Tag,
  Building2,
} from "lucide-react";
import SecretPinModal from "../../components/SecretPinModal";
import MarkdownEditor from "../../components/MarkdownEditor";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const QuestionList = () => {
  // State
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit state
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  // PIN Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("admin_secret");

      const res = await axios.get(`${API_URL}/admin/questions`, {
        params: { search, company: companySearch, difficulty, page, limit: 15 },
        headers: { "x-admin-secret": token },
      });

      if (res.data.success) {
        setQuestions(res.data.data);
        setTotalPages(res.data.pages);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  }, [search, companySearch, difficulty, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, companySearch]);

  // Toggle expand
  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingId(null);
      return;
    }

    try {
      const token = sessionStorage.getItem("admin_secret");
      const res = await axios.get(`${API_URL}/admin/question/${id}`, {
        headers: { "x-admin-secret": token },
      });

      if (res.data.success && res.data.data) {
        setExpandedId(id);
        setEditData(res.data.data); // FIX: Use res.data.data, not res.data
      }
    } catch (error) {
      toast.error("Failed to load question details");
    }
  };

  // Start editing
  const handleEdit = (e, question) => {
    e.stopPropagation();
    setEditingId(question._id);
    if (expandedId !== question._id) {
      toggleExpand(question._id);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Input change
  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Trigger save (opens PIN modal)
  const handleSaveClick = (e) => {
    e.stopPropagation();
    setPendingAction({ type: "save", id: editingId });
    setShowPinModal(true);
  };

  // Trigger delete (opens PIN modal)
  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setPendingAction({ type: "delete", id });
    setShowPinModal(true);
  };

  // Confirm PIN and execute action
  const handlePinConfirm = async (pin) => {
    if (!pendingAction) return;

    setSaving(true);

    try {
      const token = sessionStorage.getItem("admin_secret");

      if (pendingAction.type === "save") {
        const res = await axios.patch(
          `${API_URL}/admin/question/${pendingAction.id}`,
          { ...editData, secretPin: pin },
          { headers: { "x-admin-secret": token } }
        );

        if (res.data.success) {
          toast.success("Question updated successfully!");
          setEditingId(null);
          fetchQuestions();
        }
      } else if (pendingAction.type === "delete") {
        const res = await axios.delete(
          `${API_URL}/admin/question/${pendingAction.id}`,
          {
            data: { secretPin: pin },
            headers: { "x-admin-secret": token },
          }
        );

        if (res.data.success) {
          toast.success("Question deleted successfully!");
          setExpandedId(null);
          fetchQuestions();
        }
      }

      setShowPinModal(false);
      setPendingAction(null);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Invalid PIN!");
      } else {
        toast.error(error.response?.data?.message || "Operation failed");
      }
    } finally {
      setSaving(false);
    }
  };

  // Difficulty badge color
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode className="text-blue-500" />
            Question Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">{total} questions total</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Title Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#0d1117] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none w-48"
            />
          </div>

          {/* Company Search */}
          <div className="relative">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search company..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#0d1117] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-[#0d1117] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <button
            onClick={fetchQuestions}
            className="p-2 bg-[#0d1117] border border-[#333] rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition-colors cursor-pointer"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#333] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#0d1117] border-b border-[#333] text-gray-400 text-sm font-medium">
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Companies</div>
          <div className="col-span-2">Tags</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        )}

        {/* Empty */}
        {!loading && questions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No questions found
          </div>
        )}

        {/* Rows */}
        {!loading &&
          questions.map((q) => (
            <div key={q._id} className="border-b border-[#333] last:border-b-0">
              {/* Row */}
              <div
                onClick={() => toggleExpand(q._id)}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer hover:bg-[#1a1f26] transition-colors"
              >
                <div className="col-span-4 flex items-center gap-2">
                  {expandedId === q._id ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                  <span className="text-white font-medium truncate">
                    {q.title}
                  </span>
                </div>

                <div className="col-span-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(
                      q.difficulty
                    )}`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="col-span-2 flex flex-wrap gap-1">
                  {q.companies?.slice(0, 2).map((company, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs"
                    >
                      {company}
                    </span>
                  ))}
                  {q.companies?.length > 2 && (
                    <span className="text-gray-500 text-xs">
                      +{q.companies.length - 2}
                    </span>
                  )}
                </div>

                <div className="col-span-2 flex flex-wrap gap-1">
                  {q.tags?.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {q.tags?.length > 2 && (
                    <span className="text-gray-500 text-xs">
                      +{q.tags.length - 2}
                    </span>
                  )}
                </div>

                <div className="col-span-2 flex justify-end gap-2">
                  <button
                    onClick={(e) => handleEdit(e, q)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, q._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded Details / Edit Form */}
              {expandedId === q._id && (
                <div className="px-6 py-4 bg-[#0d1117] border-t border-[#333] max-h-[70vh] overflow-y-auto">
                  {editingId === q._id ? (
                    // Edit Form - ALL FIELDS
                    <div className="space-y-4">
                      {/* Row 1: Title, Difficulty, Year */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editData.title || ""}
                            onChange={(e) =>
                              handleInputChange("title", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Difficulty
                          </label>
                          <select
                            value={editData.difficulty || "Easy"}
                            onChange={(e) =>
                              handleInputChange("difficulty", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Year Asked
                          </label>
                          <input
                            type="number"
                            value={editData.yearAsked || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "yearAsked",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Row 2: Time, Memory, Opportunity Type */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Time Limit (sec)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={editData.timeLimit || 2}
                            onChange={(e) =>
                              handleInputChange(
                                "timeLimit",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Memory Limit (MB)
                          </label>
                          <input
                            type="number"
                            value={editData.memoryLimit || 256}
                            onChange={(e) =>
                              handleInputChange(
                                "memoryLimit",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Opportunity Type
                          </label>
                          <select
                            value={editData.opportunityType || "Internship"}
                            onChange={(e) =>
                              handleInputChange(
                                "opportunityType",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          >
                            <option value="Internship">Internship</option>
                            <option value="Placement">Placement</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Tags, Companies */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Tags (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editData.tags?.join(", ") || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "tags",
                                e.target.value
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">
                            Companies (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editData.companies?.join(", ") || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "companies",
                                e.target.value
                                  .split(",")
                                  .map((c) => c.trim())
                                  .filter(Boolean)
                              )
                            }
                            className="w-full px-3 py-2 bg-[#161b22] border border-[#333] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <MarkdownEditor
                          label="Description (Markdown + LaTeX)"
                          value={editData.description || ""}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          rows={10}
                          placeholder="Write question description with Markdown and LaTeX support..."
                        />
                      </div>

                      {/* Input/Output Format */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <MarkdownEditor
                            label="Input Format"
                            value={editData.inputFormat || ""}
                            onChange={(e) =>
                              handleInputChange("inputFormat", e.target.value)
                            }
                            rows={5}
                            placeholder="Describe the input format..."
                          />
                        </div>
                        <div>
                          <MarkdownEditor
                            label="Output Format"
                            value={editData.outputFormat || ""}
                            onChange={(e) =>
                              handleInputChange("outputFormat", e.target.value)
                            }
                            rows={5}
                            placeholder="Describe the output format..."
                          />
                        </div>
                      </div>

                      {/* Constraints */}
                      <div>
                        <MarkdownEditor
                          label="Constraints"
                          value={editData.constraints?.join("\n") || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "constraints",
                              e.target.value.split("\n").filter(Boolean)
                            )
                          }
                          rows={4}
                          placeholder="1 <= T <= 100&#10;1 <= N <= 10^5"
                        />
                      </div>

                      {/* Hints */}
                      <div>
                        <MarkdownEditor
                          label="Hints"
                          value={editData.hints?.join("\n") || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "hints",
                              e.target.value.split("\n").filter(Boolean)
                            )
                          }
                          rows={4}
                          placeholder="Add hints to help users solve the problem..."
                        />
                      </div>

                      {/* Solution */}
                      <div>
                        <MarkdownEditor
                          label="Solution (Editorial/Code)"
                          value={editData.solution || ""}
                          onChange={(e) =>
                            handleInputChange("solution", e.target.value)
                          }
                          rows={12}
                          placeholder="Write solution with Markdown and LaTeX support..."
                        />
                      </div>

                      {/* Test Cases Count (Read-only info) */}
                      <div className="flex items-center gap-4 p-3 bg-[#161b22] rounded-lg border border-[#333]">
                        <span className="text-gray-400 text-sm">
                          Test Cases:{" "}
                          <span className="text-white font-bold">
                            {editData.testCases?.length || 0}
                          </span>
                        </span>
                        <span className="text-gray-400 text-sm">
                          Public:{" "}
                          <span className="text-green-400 font-bold">
                            {editData.testCases?.filter((tc) => tc.isPublic)
                              .length || 0}
                          </span>
                        </span>
                        <span className="text-gray-400 text-sm">
                          Hidden:{" "}
                          <span className="text-red-400 font-bold">
                            {editData.testCases?.filter((tc) => !tc.isPublic)
                              .length || 0}
                          </span>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-[#0d1117] py-3">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-[#161b22] border border-[#333] text-gray-400 rounded-lg hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveClick}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <Save size={16} />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Details
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {editData.companies?.map((company, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-sm flex items-center gap-1"
                          >
                            <Building2 size={12} />
                            {company}
                          </span>
                        ))}
                        {editData.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-sm flex items-center gap-1"
                          >
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                        {editData.description?.substring(0, 300)}
                        {editData.description?.length > 300 && "..."}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Year: {editData.yearAsked || "N/A"}</span>
                        <span>Time: {editData.timeLimit}s</span>
                        <span>Memory: {editData.memoryLimit}MB</span>
                        <span>Type: {editData.opportunityType}</span>
                        <span>Tests: {editData.testCases?.length || 0}</span>
                      </div>

                      <button
                        onClick={(e) => handleEdit(e, q)}
                        className="mt-2 px-4 py-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600/20 transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
                      >
                        <Edit3 size={14} />
                        Edit Question
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#161b22] border border-[#333] rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[#161b22] border border-[#333] rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* PIN Modal */}
      <SecretPinModal
        isOpen={showPinModal}
        onConfirm={handlePinConfirm}
        onCancel={() => {
          setShowPinModal(false);
          setPendingAction(null);
        }}
        title={
          pendingAction?.type === "delete" ? "Confirm Delete" : "Confirm Save"
        }
        message={
          pendingAction?.type === "delete"
            ? "Enter admin PIN to permanently delete this question"
            : "Enter admin PIN to save changes"
        }
        isLoading={saving}
      />
    </div>
  );
};

export default QuestionList;
