import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  MessageSquare,
  Clock,
  Send,
  User,
  Search,
  AlertCircle,
  XCircle,
  Loader2,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const UserSupportPage = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("new"); // 'new' or 'history'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State (New Ticket)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Chat State (Reply)
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = useRef(null);

  // --- INITIAL DATA ---
  useEffect(() => {
    fetchMyTickets();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === "history" && selectedTicket) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages, activeTab]);

  // --- API CALLS ---

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/contact/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(data.data || []);
    } catch (error) {
      console.error("Error fetching tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill in all required fields");
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      // Submit to Public Contact Route (Create New Ticket)
      await axios.post(`${API_URL}/contact`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Ticket Created Successfully!");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });

      // Refresh list and switch to history view to see the new ticket
      await fetchMyTickets();
      setActiveTab("history");
    } catch (error) {
      toast.error("Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSendingReply(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        `${API_URL}/contact/user-reply`,
        {
          ticketId: selectedTicket._id,
          message: replyText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update UI instantly
      const updatedTicket = data.data;
      setSelectedTicket(updatedTicket);
      setTickets((prev) =>
        prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
      );
      setReplyText("");
    } catch (error) {
      toast.error("Reply failed");
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm("Are you sure you want to close this ticket?")) return;
    try {
      // NOTE: Ensure you create a user-side route for this, or use the admin one if permission allows.
      // Usually users hit a specific endpoint like /contact/close-my-ticket
      // For now, I'll simulate a status update if your backend allows it via reply logic or add a route.
      // Assuming a generic update route exists:
      const token = localStorage.getItem("token");
      // You might need to add this route to backend: router.patch("/contact/user/close/:id")
      // OR reuse the admin one if your middleware checks ownership.
      toast.error("Please ask admin to close (or implement user-close route)");
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-4 md:p-6 font-sans flex flex-col items-center">
      {/* 1. TOP HEADER */}
      <div className="w-full max-w-7xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-[#161b22] border border-[#333] rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Support Center</h1>
            <p className="text-xs text-gray-500">
              Manage your inquiries and support requests
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT CONTAINER */}
      <div className="w-full max-w-7xl h-[80vh] grid grid-cols-1 md:grid-cols-12 gap-0 bg-[#0d1117] border border-[#333] rounded-2xl overflow-hidden shadow-2xl">
        {/* === LEFT COLUMN: TABS & LIST === */}
        <div className="md:col-span-4 border-r border-[#333] flex flex-col bg-[#0d1117]">
          {/* Tabs */}
          <div className="flex p-2 gap-1 border-b border-[#333] bg-[#161b22]">
            <button
              onClick={() => {
                setActiveTab("new");
                setSelectedTicket(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === "new"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:bg-[#0d1117]"
              }`}
            >
              <Plus size={14} /> New Query
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === "history"
                  ? "bg-[#1f6feb]/10 text-blue-400 border border-blue-500/20"
                  : "text-gray-400 hover:bg-[#0d1117]"
              }`}
            >
              <MessageSquare size={14} /> History
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800">
            {activeTab === "new" ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full opacity-60">
                <FileText size={48} className="mb-4 text-gray-700" />
                <p className="text-sm font-medium">Create a New Ticket</p>
                <p className="text-xs max-w-[200px] mt-2">
                  Fill out the form on the right to start a fresh conversation.
                </p>
              </div>
            ) : (
              // History List
              <>
                {tickets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No past tickets found.
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all group ${
                        selectedTicket?._id === ticket._id
                          ? "bg-[#161b22] border-blue-500/50 shadow-md"
                          : "bg-transparent border-transparent hover:bg-[#161b22] hover:border-[#333]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ticket.status === "Open"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-gray-700/50 text-gray-400 border-gray-600"
                          }`}
                        >
                          {ticket.status}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock size={10} />{" "}
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-semibold truncate ${
                          selectedTicket?._id === ticket._id
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      >
                        {ticket.subject}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {ticket.ticketId}
                      </p>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN: DYNAMIC CONTENT === */}
        <div className="md:col-span-8 bg-[#05070a] flex flex-col h-full overflow-hidden relative">
          {/* VIEW A: NEW TICKET FORM */}
          {activeTab === "new" && (
            <div className="flex-1 flex flex-col p-8 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto">
              <div className="max-w-2xl mx-auto w-full">
                <div className="mb-8 border-b border-[#333] pb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Submit a Request
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Please provide detailed information so we can assist you
                    better.
                  </p>
                </div>

                <form onSubmit={handleSubmitNew} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <User size={12} /> Name
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-[#161b22] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Your Full Name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Mail size={12} /> Email
                      </label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full bg-[#161b22] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Phone size={12} /> Phone (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full bg-[#161b22] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="+91..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Subject
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full bg-[#161b22] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Brief summary of issue"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Message
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full bg-[#161b22] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors h-40 resize-none"
                      placeholder="Describe your issue in detail..."
                    />
                  </div>

                  <button
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    Submit Ticket
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VIEW B: HISTORY / CHAT */}
          {activeTab === "history" &&
            (selectedTicket ? (
              <div className="flex flex-col h-full animate-in fade-in">
                {/* Chat Header */}
                <div className="h-16 border-b border-[#333] bg-[#161b22]/50 backdrop-blur flex items-center justify-between px-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white">
                        {selectedTicket.subject}
                      </h3>
                      <span className="text-[10px] bg-[#0d1117] border border-[#333] px-2 py-0.5 rounded text-gray-400">
                        {selectedTicket.ticketId}
                      </span>
                    </div>
                  </div>
                  {/* User can Close but NOT delete */}
                  {selectedTicket.status === "Open" && (
                    <button
                      onClick={handleCloseTicket}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-500/20"
                    >
                      <XCircle size={14} /> Close Ticket
                    </button>
                  )}
                  {selectedTicket.status === "Closed" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-gray-500 rounded-lg text-xs font-bold border border-[#333]">
                      <AlertCircle size={14} /> Closed
                    </div>
                  )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
                  {selectedTicket.messages.map((msg, i) => {
                    const isMe = msg.sender === "User";
                    return (
                      <div
                        key={i}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className={`max-w-[85%]`}>
                          <div
                            className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-[#161b22] border border-[#333] text-gray-200 rounded-bl-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <div
                            className={`text-[10px] mt-1.5 flex items-center gap-1.5 text-gray-500 ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>{isMe ? "You" : "Support Team"}</span>
                            <span className="w-0.5 h-0.5 bg-gray-600 rounded-full"></span>
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Box */}
                {selectedTicket.status === "Open" ? (
                  <div className="p-4 bg-[#161b22] border-t border-[#333]">
                    <form onSubmit={handleReply} className="flex gap-3">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        disabled={sendingReply}
                        className="flex-1 bg-[#0d1117] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                      <button
                        disabled={sendingReply || !replyText.trim()}
                        className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingReply ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 bg-[#161b22] border-t border-[#333] text-center">
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                      <AlertCircle size={14} /> This ticket is closed. create a
                      new one for further assistance.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Empty State for History
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 select-none">
                <div className="w-20 h-20 bg-[#161b22] rounded-full flex items-center justify-center mb-4 border border-[#333]">
                  <MessageSquare size={32} opacity={0.5} />
                </div>
                <p className="font-medium text-gray-400">
                  Select a ticket to view details
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UserSupportPage;