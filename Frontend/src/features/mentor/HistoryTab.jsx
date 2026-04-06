import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Download, Receipt } from "lucide-react";

const HistoryTab = ({ history, showHistoryCalendar, setShowHistoryCalendar, historyDate, setHistoryDate, viewDate, setViewDate }) => {
    const calendarRef = useRef(null);

    // Close calendar on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowHistoryCalendar(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setShowHistoryCalendar]);

    const handleExportCSV = () => {
        const headers = ["Transaction ID", "Candidate", "Topic", "Date", "Amount", "Status"];
        const rows = history.map(item => [
            item.transactionId,
            item.user,
            item.topic,
            item.date,
            `$${item.payout}`,
            "Completed" // Assuming completed for history
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `AlgoViz_Payouts_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {/* Header with Tools */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Financial Ledger</h2>
                    <p className="text-zinc-500 text-sm">Transaction history and payouts</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowHistoryCalendar(!showHistoryCalendar)}
                            className={`flex items-center gap-2 px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-sm hover:border-white/20 transition-colors cursor-pointer ${showHistoryCalendar ? 'text-white border-white/30' : 'text-zinc-400 hover:text-zinc-300'
                                }`}
                        >
                            <Calendar size={14} />
                            <span className="font-mono">
                                {historyDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                            <ChevronDown size={14} />
                        </button>

                        {showHistoryCalendar && (
                            <div ref={calendarRef} className="absolute top-12 right-0 w-64 bg-[#0d0d0d] border border-white/10 rounded-xl shadow-2xl p-4 z-50">
                                {/* Calendar Header with real navigation */}
                                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                    <button
                                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <span className="text-sm font-semibold text-white">
                                        {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                    <button
                                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>

                                {/* Days Header */}
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <span key={i} className="text-[10px] text-zinc-500 font-bold">{d}</span>
                                    ))}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Empty slots for start padding */}
                                    {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}

                                    {/* Actual days */}
                                    {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                                        const day = i + 1;
                                        const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                        const isSelected = currentDayDate.toDateString() === historyDate.toDateString();
                                        const isToday = currentDayDate.toDateString() === new Date().toDateString();

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setHistoryDate(currentDayDate);
                                                    setShowHistoryCalendar(false);
                                                }}
                                                className={`w-8 h-8 rounded text-xs flex items-center justify-center transition-all cursor-pointer ${isSelected
                                                        ? 'bg-emerald-600 text-white font-bold'
                                                        : isToday
                                                            ? 'border border-emerald-500/50 text-emerald-400'
                                                            : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-zinc-400 text-sm hover:border-emerald-500/30 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Ledger Table */}
            {history.length === 0 ? (
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-16 text-center">
                    <Receipt size={48} className="mx-auto mb-4 text-zinc-700" />
                    <h3 className="text-white font-semibold mb-1">No Transactions Yet</h3>
                    <p className="text-zinc-500 text-sm">Completed sessions will appear here</p>
                </div>
            ) : (
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-left bg-[#080808]">
                                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Transaction ID</th>
                                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Candidate</th>
                                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Topic</th>
                                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
                                    <th className="py-3 px-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4 px-4 font-mono text-zinc-400 text-xs">#{item.transactionId}</td>
                                        <td className="py-4 px-4 text-white font-medium">{item.user}</td>
                                        <td className="py-4 px-4 text-zinc-500">{item.topic}</td>
                                        <td className="py-4 px-4 font-mono text-zinc-400 text-xs">{item.date}</td>
                                        <td className="py-4 px-4 font-mono text-emerald-400 font-semibold">${item.payout.toFixed(2)}</td>
                                        <td className="py-4 px-4 text-right">
                                            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/5 rounded-lg transition-all cursor-pointer" title="Download Invoice">
                                                <Download size={14} className="text-zinc-400 hover:text-white" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
                        <span>Showing {history.length} transactions</span>
                        <span className="font-mono">Total: <span className="text-emerald-400 font-semibold">${history.reduce((acc, item) => acc + item.payout, 0).toFixed(2)}</span></span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default HistoryTab;
