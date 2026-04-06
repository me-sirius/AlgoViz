import React, { useState, useEffect, useRef } from "react";
import { X, Lock, AlertCircle, Loader2 } from "lucide-react";

/**
 * SecretPinModal - Reusable modal for PIN confirmation before sensitive operations
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onConfirm - Callback when PIN is confirmed, receives (pin) as argument
 * @param {function} onCancel - Callback when modal is cancelled
 * @param {string} title - Modal title (default: "Security Verification")
 * @param {string} message - Message to display (default: "Enter admin PIN to continue")
 * @param {boolean} isLoading - Whether the action is in progress
 */
const SecretPinModal = ({
    isOpen,
    onConfirm,
    onCancel,
    title = "Security Verification",
    message = "Enter admin PIN to continue",
    isLoading = false,
}) => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setPin("");
            setError("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === "Escape") {
                onCancel();
            } else if (e.key === "Enter" && pin.length === 4) {
                handleConfirm();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, pin, onCancel]);

    const handleConfirm = () => {
        if (pin.length !== 4) {
            setError("PIN must be 4 digits");
            return;
        }
        setError("");
        onConfirm(pin);
    };

    const handlePinChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
        setPin(value);
        if (error) setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-[#161b22] border border-[#333] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <Lock size={32} className="text-yellow-500" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-gray-400 text-sm text-center mb-6">{message}</p>

                {/* PIN Input */}
                <div className="mb-4">
                    <input
                        ref={inputRef}
                        type="password"
                        value={pin}
                        onChange={handlePinChange}
                        placeholder="Enter 4-digit PIN"
                        maxLength={4}
                        className={`w-full px-4 py-3 bg-[#0d1117] border rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-white placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-base focus:outline-none transition-colors ${error
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#333] focus:border-yellow-500"
                            }`}
                        disabled={isLoading}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm mb-4 justify-center">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#333] text-gray-400 rounded-xl font-medium hover:bg-[#1a1f26] hover:text-white transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={pin.length !== 4 || isLoading}
                        className="flex-1 px-4 py-2.5 bg-yellow-500 text-black rounded-xl font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            "Confirm"
                        )}
                    </button>
                </div>

                {/* Hint */}
                <p className="text-gray-600 text-xs text-center mt-4">
                    Press Enter to confirm or Escape to cancel
                </p>
            </div>
        </div>
    );
};

export default SecretPinModal;
