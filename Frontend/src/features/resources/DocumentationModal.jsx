import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code,
  Play,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  Trophy,
  Brain,
  Rocket,
  BookMarked,
  GraduationCap,
  FileQuestion,
  MessageSquare,
  Crown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocumentationPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const features = [
    {
      icon: <Play className="w-6 h-6" />,
      title: "Interactive Visualizations",
      description:
        "Watch algorithms execute step-by-step with smooth animations and real-time feedback.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Code Implementation",
      description:
        "View actual code implementations in multiple programming languages for each algorithm.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Complexity Analysis",
      description:
        "Understand time and space complexity with visual graphs and detailed explanations.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Learning Path",
      description:
        "Follow structured learning paths from beginner to advanced algorithm concepts.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const algorithmCategories = [
    { name: "Sorting Algorithms", count: 6, icon: <Zap size={20} /> },
    { name: "Search Algorithms", count: 5, icon: <Target size={20} /> },
    { name: "Trees & Graphs", count: 8, icon: <Brain size={20} /> },
    { name: "Dynamic Programming", count: 6, icon: <Sparkles size={20} /> },
    { name: "Greedy Algorithms", count: 5, icon: <Trophy size={20} /> },
    { name: "Backtracking", count: 5, icon: <Rocket size={20} /> },
  ];

  const quickLinks = [
    { name: "Practice Problems", route: "/dashboard", icon: <BookMarked size={20} />, desc: "500+ curated problems" },
    { name: "MCQ Quiz", route: "/mcq", icon: <FileQuestion size={20} />, desc: "Test your knowledge" },
    { name: "Mock Test", route: "/mock-test", icon: <GraduationCap size={20} />, desc: "Simulate real interviews" },
    { name: "Cheat Sheet", route: "/cheatsheet", icon: <BookOpen size={20} />, desc: "Quick reference guide" },
    { name: "Interview Stories", route: "/Interview-Experience", icon: <MessageSquare size={20} />, desc: "Learn from others" },
    { name: "Go Premium", route: "/premium", icon: <Crown size={20} />, desc: "Unlock all features" },
  ];

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <BookOpen size={18} /> },
    { id: "features", label: "Features", icon: <Zap size={18} /> },
    { id: "algorithms", label: "Algorithms", icon: <Code size={18} /> },
    { id: "quicklinks", label: "Quick Links", icon: <ArrowRight size={18} /> },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0b0b0d]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Documentation</h1>
                <p className="text-xs text-gray-500">AlgoViz Guide</p>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-[#0b0b0d] lg:bg-transparent border-r border-white/5 lg:border-0 z-40 transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
        >
          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeSection === item.id
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 lg:px-8 py-8 lg:ml-0">
          {/* Hero Section */}
          <motion.section
            id="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <Sparkles size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Welcome to AlgoViz</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Master Algorithms{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Visually
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                AlgoViz is an interactive platform designed to help you understand complex
                algorithms and data structures through beautiful visualizations.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                { value: "500+", label: "Problems" },
                { value: "50+", label: "Algorithms" },
                { value: "10K+", label: "Users" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section
            id="features"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="text-blue-400" size={24} />
              Key Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 rounded-2xl bg-[#121214] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Getting Started */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold mb-6">Getting Started</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: "Choose an Algorithm", desc: "Browse our extensive collection organized by category." },
                { step: 2, title: "Watch the Visualization", desc: "See algorithms execute step-by-step with adjustable speed." },
                { step: 3, title: "Practice & Learn", desc: "Study implementations and test your understanding." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#121214] border border-white/5"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="text-gray-600" size={20} />
                </div>
              ))}
            </div>
          </motion.section>

          {/* Algorithm Categories */}
          <motion.section
            id="algorithms"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Code className="text-purple-400" size={24} />
              Algorithm Categories
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {algorithmCategories.map((cat, i) => (
                <motion.button
                  key={i}
                  onClick={() => navigate("/algorithms")}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all text-left cursor-pointer"
                >
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                    {cat.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{cat.name}</h4>
                    <p className="text-xs text-gray-500">{cat.count} algorithms</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Quick Links */}
          <motion.section
            id="quicklinks"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Rocket className="text-cyan-400" size={24} />
              Quick Links
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link, i) => (
                <motion.button
                  key={i}
                  onClick={() => navigate(link.route)}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#121214] border border-white/5 hover:border-white/10 transition-all text-left cursor-pointer group"
                >
                  <div className="p-3 rounded-xl bg-white/5 text-gray-400 group-hover:text-blue-400 transition-colors">
                    {link.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {link.name}
                    </h4>
                    <p className="text-xs text-gray-500">{link.desc}</p>
                  </div>
                  <ChevronRight className="ml-auto text-gray-600 group-hover:text-blue-400 transition-colors" size={18} />
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* CTA Footer */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
          >
            <h3 className="text-2xl font-bold mb-2">Ready to Start Learning?</h3>
            <p className="text-gray-400 mb-6">
              Join thousands mastering algorithms through interactive visualization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer"
              >
                Start Learning Now
              </motion.button>
              <motion.button
                onClick={() => navigate("/")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all cursor-pointer"
              >
                Back to Home
              </motion.button>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
};

export default DocumentationPage;
