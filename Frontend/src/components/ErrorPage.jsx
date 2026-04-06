import React, { useState } from "react";
import { useTheme } from "../core/context/ThemeContext";
import {
  AlertCircle,
  RefreshCw,
  Home,
  Mail,
  Wifi,
  WifiOff,
  ServerCrash,
  Database,
} from "lucide-react";
import NotFoundPage from "../pages/not-found/NotFoundPage";

const ErrorPage = ({
  errorType = "general", // 'general', 'network', 'server', 'database'
  message = "Something went wrong",
  onRetry,
  onGoHome,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  // If it's a 404 error, use the dedicated NotFoundPage component
  if (errorType === "404") {
    return <NotFoundPage />;
  }

  const errorConfigs = {
    general: {
      icon: AlertCircle,
      title: "Oops! Something Went Wrong",
      description: "We encountered an unexpected error. Please try again.",
      color: "red",
    },
    network: {
      icon: WifiOff,
      title: "Connection Problem",
      description:
        "Unable to connect to the server. Please check your internet connection.",
      color: "orange",
    },
    server: {
      icon: ServerCrash,
      title: "Server Error",
      description: "Our servers are experiencing issues. We're working on it!",
      color: "red",
    },
    database: {
      icon: Database,
      title: "Database Connection Failed",
      description:
        "We couldn't connect to our database. Please try again in a moment.",
      color: "purple",
    },
  };

  const config = errorConfigs[errorType] || errorConfigs.general;
  const IconComponent = config.icon;

  const colorClasses = {
    red: {
      bg: "bg-red-500",
      text: "text-red-400",
      border: "border-red-500",
      glow: "shadow-red-500/50",
      hover: "hover:bg-red-600",
    },
    orange: {
      bg: "bg-orange-500",
      text: "text-orange-400",
      border: "border-orange-500",
      glow: "shadow-orange-500/50",
      hover: "hover:bg-orange-600",
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-purple-400",
      border: "border-purple-500",
      glow: "shadow-purple-500/50",
      hover: "hover:bg-purple-600",
    },
  };

  const colors = colorClasses[config.color];

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    }
    setTimeout(() => setIsRetrying(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg w-full">
        {/* Error Icon with Animation */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-40 h-40 ${colors.bg} rounded-full blur-3xl opacity-20 animate-pulse`}
            ></div>
          </div>
          <div className="relative">
            <div
              className={`w-32 h-32 bg-gray-800 border-4 ${colors.border} rounded-full flex items-center justify-center ${colors.glow} shadow-2xl`}
            >
              <IconComponent
                className={`w-16 h-16 ${colors.text} animate-pulse`}
                strokeWidth={2}
              />
            </div>
            {errorType === "network" && (
              <div className="absolute -bottom-2 -right-2">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600">
                  <WifiOff className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            {config.title}
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            {message || config.description}
          </p>
        </div>

        {/* Error Code/Details (Optional) */}
        <div className="inline-block px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg">
          <p className="text-gray-500 text-sm font-mono">
            Error Code:{" "}
            <span className={colors.text}>{errorType.toUpperCase()}_ERROR</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`flex items-center gap-2 px-6 py-3 ${colors.bg} ${colors.hover} text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg ${colors.glow}`}
            >
              <RefreshCw
                className={`w-5 h-5 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Retrying..." : "Try Again"}
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 border border-gray-600"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="pt-8 space-y-4">
          <div className="h-px bg-gray-700 w-full"></div>

          <div className="space-y-3">
            <p className="text-gray-500 text-sm">Still having trouble?</p>

            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                Contact Support
              </button>

              <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Wifi className="w-4 h-4" />
                Check Status
              </button>
            </div>
          </div>

          {/* Additional Tips */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
            <p className="text-gray-400 text-xs text-left">
              <strong className="text-white">Quick fixes:</strong>
              <br />• Refresh the page
              <br />• Check your internet connection
              <br />• Clear your browser cache
              <br />• Try again in a few minutes
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs mt-8">
          If this problem persists, please contact our support team
        </p>
      </div>
    </div>
  );
};
export default ErrorPage;
