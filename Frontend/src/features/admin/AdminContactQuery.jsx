import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Send,
  RefreshCcw,
  MoreVertical,
  Trash2,
  Inbox,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ContactQueryList = () => {
  // --- Data States ---
  const [allTickets, setAllTickets] = useState([]); // Raw data from DB
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [statusFilter, setStatusFilter] = useState("Open"); // 'Open', 'Closed', 'All'
  const [dateFilter, setDateFilter] = useState("all"); // '7days', '30days', 'all'
  const [searchQuery, setSearchQuery] = useState("");

  // --- Reply States ---
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // 1. Initial Fetch
  useEffect(() => {
    fetchTickets();
  }, []);

  // 2. Auto-scroll to bottom of chat
  useEffect(() => {
    if (selectedTicket) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const secret = sessionStorage.getItem("admin_secret");
      // Fetching ALL allows us to filter locally very fast
      const { data } = await axios.get(`${API_URL}/admin/contact/all`, {
        headers: { "x-admin-secret": secret },
      });
      setAllTickets(data.data || []);

      // If we have a selected ticket, refresh its data live
      if (selectedTicket) {
        const updated = data.data.find((t) => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error("Failed to load tickets");
      toast.error("Could not load support tickets");
    } finally {
      setLoading(false);
    }
  };

  // 3. ADVANCED FILTERING LOGIC (Industry Standard)
  const filteredTickets = useMemo(() => {
    return allTickets.filter((ticket) => {
      // A. Status Filter
      if (statusFilter !== "All" && ticket.status !== statusFilter)
        return false;

      // B. Search Filter (Case insensitive search on Name, Email, Subject, TicketID)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          ticket.name.toLowerCase().includes(q) ||
          ticket.email.toLowerCase().includes(q) ||
          ticket.subject.toLowerCase().includes(q) ||
          ticket.ticketId?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // C. Date Filter
      if (dateFilter !== "all") {
        const ticketDate = new Date(ticket.updatedAt);
        const now = new Date();
        const diffTime = Math.abs(now - ticketDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === "7days" && diffDays > 7) return false;
        if (dateFilter === "30days" && diffDays > 30) return false;
      }

      return true;
    });
  }, [allTickets, statusFilter, searchQuery, dateFilter]);

  // --- Handlers ---

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const secret = sessionStorage.getItem("admin_secret");
      await axios.post(
        `${API_URL}/admin/contact/reply`,
        { ticketId: selectedTicket._id, message: replyText },
        { headers: { "x-admin-secret": secret } }
      );
      setReplyText("");
      fetchTickets(); // Refresh data to show new message
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const secret = sessionStorage.getItem("admin_secret");
      await axios.patch(
        `${API_URL}/admin/contact/${selectedTicket._id}/status`,
        { status: newStatus },
        { headers: { "x-admin-secret": secret } }
      );
      toast.success(`Ticket marked as ${newStatus}`);
      fetchTickets(); // Refresh

      // Optional: If filter is "Open" and we close it, deselect or stay?
      // Typically keep it selected so admin can see the result.
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this ticket history?")) return;
    try {
      const secret = sessionStorage.getItem("admin_secret");
      await axios.delete(`${API_URL}/admin/contact/${selectedTicket._id}`, {
        headers: { "x-admin-secret": secret },
      });
      toast.success("Ticket deleted");
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // --- UI Components ---

  const StatusBadge = ({ status }) => {
    const styles =
      status === "Open"
        ? "bg-green-500/10 text-green-500 border-green-500/20"
        : "bg-gray-700/50 text-gray-400 border-gray-600/30";
    return (
      <span
        className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${styles}`}
      >
        {status}
      </span>
    );
  };

  if (loading && allTickets.length === 0)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Loading Support Desk...
      </div>
    );

  return (
    <div className="flex flex-col h-[85vh] max-h-[800px] bg-[#0d1117] border border-[#333] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in">
      {/* 1. TOP CONTROL BAR */}
      <div className="bg-[#161b22] border-b border-[#333] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Stats & Title */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
            <Inbox size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              Support Desk
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>
                {allTickets.filter((t) => t.status === "Open").length} Open
              </span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span>{allTickets.length} Total</span>
            </div>
          </div>
        </div>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2 bg-[#0d1117] border border-[#333] text-gray-400 hover:text-white rounded-lg hover:border-gray-500 transition-all disabled:opacity-50 group cursor-pointer"
            title="Refresh List"
          >
            <RefreshCcw
              size={18}
              className={`transition-transform ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
          </button>
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0d1117] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500 transition-all w-48 md:w-64"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#0d1117] border border-[#333] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 cursor-pointer appearance-none pr-8"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <Filter
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA (Split View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Ticket List */}
        <div
          className={`w-full md:w-96 border-r border-[#333] flex flex-col ${
            selectedTicket ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Status Tabs */}
          <div className="flex p-2 gap-1 border-b border-[#333] bg-[#0d1117]">
            {["Open", "Closed", "All"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-[#1f6feb]/10 text-[#58a6ff]"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#161b22]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 p-2 space-y-1">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                <AlertCircle size={24} opacity={0.5} />
                <span className="text-xs">No tickets found</span>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`group p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedTicket?._id === ticket._id
                      ? "bg-[#161b22] border-blue-500/50 shadow-md"
                      : "bg-transparent border-transparent hover:bg-[#161b22] hover:border-[#333]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <StatusBadge status={ticket.status} />
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(ticket.updatedAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  </div>
                  <h4
                    className={`text-sm font-semibold truncate mb-0.5 ${
                      selectedTicket?._id === ticket._id
                        ? "text-white"
                        : "text-gray-300"
                    }`}
                  >
                    {ticket.subject}
                  </h4>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <User size={10} /> {ticket.name}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Conversation View */}
        <div
          className={`flex-1 flex flex-col bg-[#05070a] ${
            !selectedTicket ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#333] bg-[#161b22]/50 backdrop-blur-sm flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="md:hidden p-2 hover:bg-[#333] rounded-lg cursor-pointer"
                  >
                    ←
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-200 text-sm md:text-base">
                        {selectedTicket.subject}
                      </h3>
                      <span className="text-[10px] text-gray-600 bg-gray-900 px-1.5 rounded border border-gray-800">
                        {selectedTicket.ticketId}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {selectedTicket.email} •{" "}
                      {selectedTicket.phone || "No phone"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status === "Open" ? (
                    <button
                      onClick={() => handleStatusChange("Closed")}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Close Ticket"
                    >
                      <XCircle size={18} />
                      Close
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDelete()}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => handleStatusChange("Open")}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Re-open Ticket"
                      >
                        <RefreshCcw size={18} /> Open
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
                {selectedTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === "Admin";
                  return (
                    <div
                      key={idx}
                      className={`flex ${
                        isAdmin ? "justify-end" : "justify-start"
                      } animate-in fade-in slide-in-from-bottom-2`}
                    >
                      <div className={`max-w-[85%] md:max-w-[70%] group`}>
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm shadow-sm relative ${
                            isAdmin
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-[#161b22] border border-[#333] text-gray-200 rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 mt-1 text-[10px] text-gray-600 ${
                            isAdmin ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>{isAdmin ? "You" : selectedTicket.name}</span>
                          <span>•</span>
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
                  <form onSubmit={handleSendReply} className="relative">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e);
                        }
                      }}
                      // DISABLE INPUT WHILE SENDING
                      disabled={sending}
                      placeholder={
                        sending
                          ? "Sending reply..."
                          : "Type your reply... (Press Enter to send)"
                      }
                      rows={1}
                      className={`w-full bg-[#0d1117] border border-[#333] rounded-xl pl-4 pr-12 py-3.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:bg-[#05070a] transition-all resize-none shadow-inner ${
                        sending ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      style={{ minHeight: "50px" }}
                    />

                    <button
                      type="submit"
                      // DISABLE BUTTON WHILE SENDING OR EMPTY
                      disabled={sending || !replyText.trim()}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all shadow-lg flex items-center justify-center cursor-pointer ${
                        sending || !replyText.trim()
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-500"
                      }`}
                    >
                      {/* SHOW LOADER IF SENDING, ELSE SHOW SEND ICON */}
                      {sending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </form>

                  <div className="text-[10px] text-gray-600 mt-2 flex justify-end px-1">
                    {sending
                      ? "Sending notification..."
                      : "Reply is sent via Email & Saved to history"}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#161b22] border-t border-[#333] flex justify-center">
                  <button
                    onClick={() => handleStatusChange("Open")}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white bg-[#0d1117] border border-[#333] hover:border-gray-500 px-4 py-2 rounded-full transition-all cursor-pointer"
                  >
                    <RefreshCcw size={14} /> Re-open this ticket to reply
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 select-none">
              <div className="w-20 h-20 bg-[#161b22] rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} opacity={0.5} />
              </div>
              <p className="font-medium text-gray-400">
                Select a ticket to view details
              </p>
              <p className="text-sm">
                Manage user inquiries and support requests
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactQueryList;
