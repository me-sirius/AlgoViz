import React, { useState, useEffect } from "react";
import { Code2, Terminal, Loader2 } from "lucide-react";

const LoadingPage = ({ message }) => {
  const [loadingText, setLoadingText] = useState("Initializing");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const texts = [
      "Initializing",
      "Loading resources",
      "Connecting to server",
      "Setting up environment",
      "Almost ready",
    ];

    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length;
      setLoadingText(texts[textIndex]);
    }, 800);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Logo/Icon Animation */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          </div>
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 animate-bounce">
              <Code2 className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            {/* <div className="absolute -top-2 -right-2">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div> */}
          </div>
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {message || "AlgoViz"}
          </h1>
          <p className="text-gray-400 text-sm">Building something awesome</p>
        </div>

        {/* Loading Text with Animation */}
        <div className="flex items-center justify-center space-x-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <p className="text-cyan-400 font-medium text-lg animate-pulse">
            {loadingText}
            <span className="inline-block animate-bounce">.</span>
            <span
              className="inline-block animate-bounce"
              style={{ animationDelay: "0.2s" }}
            >
              .
            </span>
            <span
              className="inline-block animate-bounce"
              style={{ animationDelay: "0.4s" }}
            >
              .
            </span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            {Math.floor(Math.min(progress, 100))}%
          </p>
        </div>

        {/* Spinning Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Footer Text */}
        <p className="text-gray-500 text-xs mt-8">
          Please wait while we prepare everything for you
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};
export default LoadingPage;
