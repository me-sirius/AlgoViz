import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * PasswordStrengthBar - Visual progress bar for password strength
 * 
 * @param {object} validation - Object with boolean values for each requirement
 * @param {boolean} validation.hasLength - At least 8 characters
 * @param {boolean} validation.hasUppercase - Contains uppercase
 * @param {boolean} validation.hasLowercase - Contains lowercase
 * @param {boolean} validation.hasNumber - Contains number
 * @param {boolean} validation.hasSpecial - Contains special character
 */
const PasswordStrengthBar = ({ validation }) => {
    const { strength, color, label } = useMemo(() => {
        const checks = [
            validation.hasLength,
            validation.hasUppercase,
            validation.hasLowercase,
            validation.hasNumber,
            validation.hasSpecial,
        ];

        const passedCount = checks.filter(Boolean).length;
        const percentage = (passedCount / 5) * 100;

        if (passedCount === 0) {
            return { strength: 0, color: "bg-gray-600", label: "" };
        } else if (passedCount <= 2) {
            return { strength: percentage, color: "bg-red-500", label: "Weak" };
        } else if (passedCount <= 3) {
            return { strength: percentage, color: "bg-orange-500", label: "Fair" };
        } else if (passedCount <= 4) {
            return { strength: percentage, color: "bg-yellow-500", label: "Good" };
        } else {
            return { strength: percentage, color: "bg-green-500", label: "Strong" };
        }
    }, [validation]);

    const labelColor = useMemo(() => {
        if (strength === 0) return "text-gray-500";
        if (strength <= 40) return "text-red-400";
        if (strength <= 60) return "text-orange-400";
        if (strength <= 80) return "text-yellow-400";
        return "text-green-400";
    }, [strength]);

    return (
        <div className="space-y-2">
            {/* Progress Bar */}
            <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    className={`absolute inset-y-0 left-0 rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${strength}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div>

            {/* Strength Label */}
            {label && (
                <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
                    <span className="text-xs text-gray-500">{Math.round(strength)}%</span>
                </div>
            )}

            {/* Requirements (compact) */}
            <div className="flex flex-wrap gap-2 mt-3">
                {[
                    { key: "hasLength", label: "8+ chars" },
                    { key: "hasUppercase", label: "A-Z" },
                    { key: "hasLowercase", label: "a-z" },
                    { key: "hasNumber", label: "0-9" },
                    { key: "hasSpecial", label: "!@#$" },
                ].map(({ key, label }) => (
                    <span
                        key={key}
                        className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${validation[key]
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/5 text-gray-500 border border-white/5"
                            }`}
                    >
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthBar;
