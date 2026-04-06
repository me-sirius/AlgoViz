import React from "react";
import { motion } from "framer-motion";
import { Video, CheckCircle, FileText } from "lucide-react";

const SessionsTab = ({ sessions, loading, onRefresh, onViewResume, onUpdateLinks }) => {
  return (
    <motion.div
      key="sessions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Upcoming Sessions</h2>
          <p className="text-zinc-500 text-sm">Your scheduled interviews</p>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-cyan-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-zinc-500 text-sm">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
            <Video size={32} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-zinc-500 text-sm">No upcoming sessions</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session._id}
              className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-white flex items-center justify-center font-semibold">
                  {(session.studentId?.name || session.userId?.name)?.[0] || "U"}
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    {session.studentId?.name || session.userId?.name || "Unknown"}
                  </h4>
                  <p className="text-sm text-zinc-500">
                    {session.title || session.topic || "Mock Interview"}
                    {session.difficulty && (
                      <span
                        className={`ml-2 text-xs px-1.5 py-0.5 rounded ${session.difficulty === "Hard"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                          }`}
                      >
                        {session.difficulty}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-mono text-sm text-zinc-300">
                    {new Date(
                      session.date || session.startedAt || session.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {session.timeSlot ? ` • ${session.timeSlot}` : ""}
                  </div>
                  <div className="text-xs text-emerald-400 flex items-center justify-end gap-1">
                    <CheckCircle size={10} /> Confirmed
                  </div>
                </div>

                <button
                  onClick={() => onViewResume(session._id)}
                  disabled={!session.resume?.fileName}
                  title={
                    session.resume?.fileName
                      ? `Open ${session.resume.fileName}`
                      : "No resume uploaded"
                  }
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-semibold ${session.resume?.fileName
                      ? "bg-[#111] border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white cursor-pointer"
                      : "bg-[#111]/50 border border-white/5 text-zinc-600 cursor-not-allowed"
                    }`}
                >
                  <FileText size={16} /> CV
                </button>

                <button
                  onClick={() => window.open(`/room/${session._id}`, "_blank")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Video size={16} /> Join
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default SessionsTab;
