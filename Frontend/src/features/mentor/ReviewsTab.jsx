import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const ReviewsTab = ({ stats, reviews }) => {
    return (
        <motion.div
            key="reviews"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
            {/* Stats Card */}
            <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-zinc-500 uppercase text-xs font-medium tracking-wider mb-3">Overall Rating</h3>
                <div className="text-4xl font-bold text-white mb-2">{stats.rating}</div>
                <div className="flex gap-0.5 text-amber-400 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={16} fill={s <= Math.round(stats.rating) ? "currentColor" : "none"} />
                    ))}
                </div>
                <p className="text-xs text-zinc-500">Based on {stats.reviews} reviews</p>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-3 space-y-3">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-[#0d0d0d] border border-white/10 p-5 rounded-xl">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-semibold text-sm">
                                    {review.user[0]}
                                </div>
                                <div>
                                    <span className="text-white font-medium text-sm">{review.user}</span>
                                    <div className="flex gap-0.5 text-amber-400 mt-0.5">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} size={10} fill="currentColor" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-zinc-600 text-xs font-mono">{review.date}</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">"{review.comment}"</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ReviewsTab;
