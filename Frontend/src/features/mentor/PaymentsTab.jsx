import React from "react";
import { motion } from "framer-motion";
import { Wallet, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Sparkline } from "./Common";

const PaymentsTab = ({ stats }) => {
    return (
        <motion.div
            key="payments"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
        >
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Wallet size={20} className="text-emerald-400" />
                        </div>
                        <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Available</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">${stats.earnings.available}</div>
                    <p className="text-xs text-zinc-500 mt-1">Ready to withdraw</p>
                </div>

                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Clock size={20} className="text-amber-400" />
                        </div>
                        <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-2 py-1 rounded">Processing</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">${stats.earnings.pending}</div>
                    <p className="text-xs text-zinc-500 mt-1">Pending clearance</p>
                </div>

                <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <TrendingUp size={20} className="text-zinc-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-white">${stats.earnings.total}</div>
                    <p className="text-xs text-zinc-500 mt-1">Lifetime earnings</p>
                </div>
            </div>

            {/* Sparkline */}
            <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">Earnings Trend</h3>
                    <span className="text-xs text-zinc-500 font-mono">Last 6 months</span>
                </div>
                <Sparkline width={800} height={200} />
            </div>

            {/* Withdraw Button */}
            <div className="flex justify-end">
                <button className="flex items-center gap-3 px-6 py-3 bg-[#0d0d0d] border border-emerald-500/30 text-emerald-400 rounded-xl font-semibold transition-all hover:bg-emerald-500/5 hover:border-emerald-500/50 cursor-pointer group">
                    <div className="w-8 h-6 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded flex items-center justify-center">
                        <div className="w-4 h-3 bg-[#0d0d0d] rounded-sm" />
                    </div>
                    Withdraw Funds
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

export default PaymentsTab;
