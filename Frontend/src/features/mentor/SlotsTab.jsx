import React from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";

const SlotsTab = ({ datesToRender, schedule, toggleSlot, handleSaveSlots, TIME_SLOTS, formatDate }) => {
  return (
    <motion.div
      key="slots"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Availability Manager</h2>
          <p className="text-zinc-500 text-sm">Configure your slots for the next 14 days</p>
        </div>
        <button
          onClick={handleSaveSlots}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>

      {/* Heatmap Calendar */}
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-fixed">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-left text-lg font-medium text-zinc-500 uppercase tracking-wider w-32 border-r border-white/5 bg-[#0a0a0a] sticky left-0 z-10">
                  Time
                </th>
                {datesToRender.map((dateObj, idx) => {
                  const isToday = idx === 0;
                  return (
                    <th
                      key={formatDate(dateObj)}
                      className="py-3 px-1 text-center border-r border-white/5 last:border-0 min-w-[60px]"
                    >
                      <div
                        className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-emerald-400" : "text-zinc-500"
                          }`}
                      >
                        {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div
                        className={`text-xl font-mono leading-none mt-1 ${isToday ? "text-emerald-400" : "text-zinc-300"
                          }`}
                      >
                        {dateObj.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => {
                // Format time range (e.g. "10:00 AM" -> "10 - 11 AM")
                const [hourStr, modifier] = time.split(" ");
                const hour = parseInt(hourStr.split(":")[0]);
                const nextHour = hour === 12 ? 1 : hour + 1;
                const hourStrPadded = hour.toString().padStart(2, "0");
                const nextHourStr = nextHour.toString().padStart(2, "0");
                const rangeLabel = `${hourStrPadded} - ${nextHourStr}`;

                return (
                  <tr key={time} className="border-b border-white/[0.02]">
                    <td className="py-3 px-4 border-r border-white/5 bg-[#0a0a0a] sticky left-0 z-10">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-zinc-300 font-medium">
                          {rangeLabel}{" "}
                          <span className="text-[10px] text-zinc-600">
                            {modifier}
                          </span>
                        </span>
                      </div>
                    </td>
                    {datesToRender.map((dateObj) => {
                      const dateKey = formatDate(dateObj);
                      const selectedSlots = schedule[dateKey] || [];
                      const isSelected = selectedSlots.includes(time);
                      // Mock booking logic based on Admin file
                      const isBooked =
                        dateKey === formatDate(datesToRender[2]) &&
                        (time === "2:00 PM" || time === "4:00 PM");

                      return (
                        <td
                          key={`${dateKey}-${time}`}
                          className="p-1 text-center border-r border-white/[0.02] last:border-0"
                        >
                          <button
                            onClick={() => !isBooked && toggleSlot(dateObj, time)}
                            disabled={isBooked}
                            className={`w-full h-10 rounded text-xs font-medium transition-all flex items-center justify-center ${isBooked
                                ? "bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.06),rgba(255,255,255,0.06)_10px,transparent_10px,transparent_20px)] text-zinc-400 cursor-not-allowed"
                                : isSelected
                                  ? "bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
                                  : "bg-white/[0.08] text-zinc-600 hover:bg-white/[0.05] hover:text-zinc-400 cursor-pointer"
                              }`}
                          >
                            {isBooked ? (
                              "Busy"
                            ) : isSelected ? (
                              "Open"
                            ) : (
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-white/10" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded bg-zinc-800/50"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
              }}
            />
            <span>Booked</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SlotsTab;
