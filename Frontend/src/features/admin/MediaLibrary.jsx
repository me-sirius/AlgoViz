import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Image,
  Trash2,
  Copy,
  Check,
  X,
  Loader2,
  FolderOpen,
  Plus,
  Search,
  Grid,
  List,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const VITE_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const MediaLibrary = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const folders = [
    "all",
    "general",
    "questions",
    "blogs",
    "avatars",
    "misc",
    "resumes",
  ];

  const fetchUploads = useCallback(async () => {
    try {
      setLoading(true);
      const secret = sessionStorage.getItem("admin_secret");
      const response = await axios.get(
        `${VITE_API_BASE_URL}/upload/uploads?folder=${selectedFolder}`,
        {
          headers: { "x-admin-secret": secret },
        }
      );
      setUploads(response.data.data || []);
    } catch (error) {
      console.error("Fetch uploads error:", error);
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const secret = sessionStorage.getItem("admin_secret");

    try {
      for (const file of files) {
        // Client-side file size check
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`"${file.name}" is too large! Maximum size is 5MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "folder",
          selectedFolder === "all" ? "general" : selectedFolder
        );
        formData.append("name", file.name);

        await axios.post(`${VITE_API_BASE_URL}/upload/upload`, formData, {
          headers: {
            "x-admin-secret": secret,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      toast.success(`${files.length} file(s) uploaded successfully!`);
      fetchUploads();
    } catch (error) {
      console.error("Upload error:", error);
      // Show specific error message from backend
      const errorMessage = error.response?.data?.message || "Upload failed";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const secret = sessionStorage.getItem("admin_secret");
      await axios.delete(`${VITE_API_BASE_URL}/upload/upload/${id}`, {
        headers: { "x-admin-secret": secret },
      });
      toast.success("Image deleted");
      setUploads((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };

  const filteredUploads = uploads.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="text-blue-500" size={24} />
            Media Library
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload and manage images for your content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer transition-colors">
            <Plus size={18} />
            <span>Upload</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(Array.from(e.target.files))}
            />
          </label>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Folder Filter */}
        <div className="flex items-center gap-2 bg-[#161b22] rounded-lg p-1">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize cursor-pointer ${
                selectedFolder === folder
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#21262d]"
              }`}
            >
              {folder}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-[#161b22] rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === "grid" ? "bg-[#21262d] text-white" : "text-gray-500"
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
              viewMode === "list" ? "bg-[#21262d] text-white" : "text-gray-500"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-[#30363d] bg-[#161b22]"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <Loader2 className="animate-spin" size={24} />
            <span>Uploading...</span>
          </div>
        ) : (
          <div className="text-gray-500">
            <Upload className="mx-auto mb-2" size={32} />
            <p>Drag and drop images here, or click "Upload" button</p>
            <p className="text-xs mt-1">Max 5MB per file • Images only</p>
          </div>
        )}
      </div>

      {/* Media Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : filteredUploads.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>No images found</p>
          <p className="text-sm">Upload your first image to get started</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredUploads.map((upload) => (
            <div
              key={upload._id}
              className="group relative bg-[#161b22] rounded-xl overflow-hidden border border-[#30363d] hover:border-blue-500/50 transition-colors"
            >
              <img
                src={upload.url}
                alt={upload.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => window.open(upload.url, "_blank")}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                </button>
                <button
                  onClick={() => copyToClipboard(upload.url, upload._id)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  title="Copy URL"
                >
                  {copiedId === upload._id ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(upload._id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
              <div className="p-2">
                <p
                  className="text-xs text-gray-400 truncate"
                  title={upload.name}
                >
                  {upload.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUploads.map((upload) => (
            <div
              key={upload._id}
              className="flex items-center gap-4 p-3 bg-[#161b22] rounded-lg border border-[#30363d] hover:border-blue-500/50 transition-colors"
            >
              <img
                src={upload.url}
                alt={upload.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.name}</p>
                <p className="text-xs text-gray-500 truncate">{upload.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(upload.url, "_blank")}
                  className="p-2 hover:bg-[#21262d] rounded-lg transition-colors cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} className="text-gray-400" />
                </button>
                <button
                  onClick={() => copyToClipboard(upload.url, upload._id)}
                  className="p-2 hover:bg-[#21262d] rounded-lg transition-colors cursor-pointer"
                  title="Copy URL"
                >
                  {copiedId === upload._id ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} className="text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(upload._id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
