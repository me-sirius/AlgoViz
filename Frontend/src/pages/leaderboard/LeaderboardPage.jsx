import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  Trophy, 
  Code2, 
  Target, 
  Flame, 
  Crown, 
  Lightbulb,
  User,
  ArrowLeft
} from "lucide-react";
import { toProxyUrl } from "../../core/utils/urlHelpers";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("global"); // global, streak
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/leaderboard`);
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setError("Failed to load rankings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getSortedUsers = () => {
    if (activeTab === "streak") {
      return [...users].sort((a, b) => (b.streak || 0) - (a.streak || 0));
    }
    return users; // Default is by totalScore from backend
  };

  const sortedUsers = getSortedUsers();
  const top3 = sortedUsers.slice(0, 3);
  const restUsers = sortedUsers.slice(3);

  const currentUserId = localStorage.getItem("userId");
  let currentUserRankInfo = null;
  if (currentUserId && users.length > 0) {
    const rankIndex = sortedUsers.findIndex(u => u._id === currentUserId);
    if (rankIndex !== -1) {
      currentUserRankInfo = {
        rank: rankIndex + 1,
        user: sortedUsers[rankIndex],
        isTop3: rankIndex < 3
      };
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-semibold tracking-wider">LOADING ARENA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-red-400">
        <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white pt-24 pb-32 px-4 sm:px-6 relative font-sans">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 relative">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer absolute left-0 -top-12 md:top-1/2 md:-translate-y-1/2 md:-translate-x-12 flex items-center justify-center w-8 h-8 rounded-full bg-[#101524] border border-[#1e293b] text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2 text-center md:text-left">
            AlgoViz Arena
          </h1>
          
          <div className="flex items-center gap-2 bg-[#101524] border border-[#1e293b] rounded-full px-5 py-2.5 text-xs text-gray-400 shadow-md">
            <Code2 size={14} className="text-indigo-400" /> <span className="font-semibold text-gray-300">DSA</span>
            <span className="text-gray-600 mx-1">+</span>
            <Lightbulb size={14} className="text-fuchsia-400" /> <span className="font-semibold text-gray-300">MCQ</span>
            <span className="text-gray-600 mx-1">=</span>
            <span className="text-white font-bold tracking-wider uppercase text-[10px] bg-white/10 px-2 py-0.5 rounded">Total</span>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-[#101524] p-1 rounded-xl border border-[#1e293b] flex gap-1">
            <button
              onClick={() => setActiveTab('global')}
              className={`cursor-pointer px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'global' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Global Rankings
            </button>
            <button
              onClick={() => setActiveTab('streak')}
              className={`cursor-pointer px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'streak' ? 'bg-[#1e293b] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Streaks
            </button>
          </div>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 mb-20 px-4 md:px-0">
            {/* Rank 2 (Silver) */}
            {top3[1] && <PodiumUser user={top3[1]} rank={2} tab={activeTab} navigate={navigate} />}

            {/* Rank 1 (Gold) */}
            {top3[0] && <PodiumUser user={top3[0]} rank={1} tab={activeTab} navigate={navigate} />}

            {/* Rank 3 (Bronze) */}
            {top3[2] && <PodiumUser user={top3[2]} rank={3} tab={activeTab} navigate={navigate} />}
          </div>
        )}

        {/* List */}
        <div className="flex flex-col gap-3">
          {restUsers.map((user, index) => {
            const isCurrentUser = user._id === currentUserId;
            return <ListUser key={user._id} user={user} index={index} isCurrentUser={isCurrentUser} activeTab={activeTab} navigate={navigate} />;
          })}
        </div>
      </div>

      {/* Your Position Footer */}
      {currentUserRankInfo && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#070b14] via-[#070b14]/90 to-transparent z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto bg-[#041d2d] border border-cyan-500/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_0_40px_rgba(6,182,212,0.15)] w-full max-w-4xl backdrop-blur-md relative overflow-hidden">
            {/* Inner glow accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-[3px] border-cyan-400 p-0.5 overflow-hidden bg-[#070b14]">
                  {currentUserRankInfo.user.avatar ? (
                    <img src={toProxyUrl(currentUserRankInfo.user.avatar)} className="w-full h-full object-cover rounded-full" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-[#041d2d] rounded-full text-cyan-400 font-bold">{currentUserRankInfo.user.name[0]}</div>
                  )}
                </div>
                <div className="absolute top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#041d2d]" />
              </div>

              <div className="flex flex-col">
                <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-0.5 hidden sm:block">
                  Your Position
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-white font-bold text-base sm:text-lg tracking-tight">
                    {currentUserRankInfo.user.name}
                  </span>
                  <span className="bg-[#0b3b4d] text-cyan-400 text-[10px] px-2.5 py-0.5 rounded-full border border-cyan-500/30 whitespace-nowrap font-semibold">
                    Rank #{currentUserRankInfo.rank}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end relative z-10">
              <span className="text-cyan-400/80 text-[9px] font-bold uppercase tracking-widest mb-0.5 hidden sm:flex items-center gap-1">
                Total Arena Points
              </span>
              <div className="text-white font-bold text-2xl sm:text-3xl font-mono leading-none flex items-end gap-1.5">
                {activeTab === 'streak' ? currentUserRankInfo.user.streak : currentUserRankInfo.user.totalScore} 
                <span className="text-cyan-400 text-xs sm:text-sm font-sans mb-0.5 font-bold">
                  {activeTab === 'streak' ? 'days' : 'pts'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual list row (Rank 4+)
const ListUser = ({ user, index, isCurrentUser, activeTab, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`flex flex-col bg-[#101524] border ${isCurrentUser ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-[#1e293b]'} rounded-2xl cursor-pointer transition-colors overflow-hidden hover:border-[#334155]`}
    >
      <div className="flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-6 sm:w-8 font-bold text-gray-500 text-sm sm:text-base text-center">
            #{index + 4}
          </div>
          
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border ${isCurrentUser ? 'border-cyan-400' : 'border-[#1e293b]'} overflow-hidden bg-[#070b14] flex-shrink-0 flex items-center justify-center`}>
            {user.avatar ? (
              <img src={toProxyUrl(user.avatar)} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>
          
          <div className="flex flex-col">
            <span className={`font-bold text-sm sm:text-base ${isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
              {user.name} {isCurrentUser && <span className="text-[10px] ml-1 bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 uppercase">You</span>}
            </span>
            
            {activeTab !== 'streak' ? (
              <div className="flex items-center gap-2 mt-1.5 flex flex-wrap">
                <span className="bg-[#1e1b4b] text-indigo-300 text-[10px] sm:text-[11px] px-2 py-0.5 rounded border border-indigo-900 leading-none font-mono font-medium">
                  DSA: {user.questionsSolvedCount || 0}
                </span>
                <span className="bg-[#2e1065] text-purple-300 text-[10px] sm:text-[11px] px-2 py-0.5 rounded border border-purple-900 leading-none font-mono font-medium">
                  MCQ: {user.mcqCorrectCount || 0}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1.5 flex flex-wrap">
                <span className="bg-[#431407] text-orange-300 text-[10px] sm:text-[11px] px-2 py-0.5 rounded border border-orange-900 leading-none font-mono font-medium flex items-center gap-1">
                  <Flame size={12}/> Streak: {user.streak || 0}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`font-bold text-xl sm:text-2xl tracking-tight font-mono ${isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
          {activeTab === 'streak' ? (user.streak || 0) : (user.totalScore || 0)}
        </div>
      </div>

      {/* Expanded Area */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-[#1e293b] mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
           <div className="text-sm text-slate-400 italic flex-1 w-full max-w-lg mt-3">
              {user.bio ? `"${user.bio}"` : "This competitor prefers to operate in the shadows. Ready to challenge them?"}
           </div>
           
           <button
             onClick={(e) => {
               e.stopPropagation();
               navigate(`/profile/${user._id}`);
             }}
             className="whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold bg-[#1e293b] text-white hover:bg-slate-700 transition-colors border border-slate-600/50 mt-3 sm:mt-0 shadow-lg"
           >
             Go to profile
           </button>
        </div>
      )}
    </div>
  );
};

// Sub-component for Top 3
const PodiumUser = ({ user, rank, tab, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;

  const themeConfig = {
    1: { 
      border: "border-yellow-500", 
      bg: "bg-[#1C1808]", 
      text: "text-yellow-500", 
      badgeBg: "bg-yellow-500", 
      badgeText: "text-black",
      avatarOuter: "border-yellow-500 border-dashed" 
    },
    2: { 
      border: "border-gray-400", 
      bg: "bg-[#101524]", 
      text: "text-gray-400", 
      badgeBg: "bg-gray-400", 
      badgeText: "text-black",
      avatarOuter: "border-gray-400 border-solid" 
    },
    3: { 
      border: "border-orange-500", 
      bg: "bg-[#101524]", 
      text: "text-orange-500", 
      badgeBg: "bg-orange-600",
      badgeText: "text-white", 
      avatarOuter: "border-orange-500 border-solid" 
    }
  };

  const theme = themeConfig[rank];
  const containerSize = isGold ? "w-full md:w-72" : "w-full md:w-60";
  const avatarSize = isGold ? "w-24 h-24" : "w-20 h-20";
  const cardHeight = isGold ? "pt-12 pb-6 -mt-10 md:-mt-12" : "pt-10 pb-6 -mt-8 md:-mt-10";

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className={`flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2 relative ${isGold ? 'z-20 md:-mt-12 order-1 md:order-2' : 'z-10 order-2 md:order-1'} ${isBronze && 'order-3 md:order-3'} ${containerSize}`}
    >
      {isGold && (
        <Crown className="text-yellow-500 mb-2 w-7 h-7" fill="currentColor" />
      )}
      
      {/* Avatar Wrapper */}
      <div className="relative z-10 mb-2">
        <div className={`${avatarSize} rounded-full border-[3px] ${theme.avatarOuter} p-1 shadow-lg bg-[#070b14]`}>
          {user.avatar ? (
            <img src={toProxyUrl(user.avatar)} className="w-full h-full rounded-full object-cover border-2 border-[#070b14] bg-gray-800" />
          ) : (
            <div className="w-full h-full rounded-full border-2 border-[#070b14] bg-gray-800 flex items-center justify-center text-3xl font-bold text-white">
              {user.name[0]}
            </div>
          )}
        </div>
        
        {/* Rank Badge */}
        <div className={`absolute bottom-0 right-0 ${isGold ? 'w-6 h-6' : 'w-5 h-5'} ${theme.badgeBg} ${theme.badgeText} text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#070b14] shadow-md`}>
          {rank}
        </div>
      </div>

      {/* Stand/Card */}
      <div className={`${theme.bg} rounded-2xl w-full text-center ${cardHeight} border-t-2 ${theme.border} border border-[#1e293b] shadow-2xl relative transition-all duration-300 ${isExpanded ? 'pb-16' : ''}`}>
        <h3 className="text-white font-bold text-base line-clamp-1 px-4 tracking-tight">
          {user.name}
        </h3>
        
        {/* Statistics Pills */}
        {!isExpanded && (
          <div className="flex justify-center mt-2 px-2">
            {tab !== 'streak' ? (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <span className="bg-[#1e1b4b] text-indigo-300 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border border-indigo-900 leading-none font-mono font-medium">
                  DSA: {user.questionsSolvedCount || 0}
                </span>
                <span className="bg-[#2e1065] text-purple-300 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border border-purple-900 leading-none font-mono font-medium">
                  MCQ: {user.mcqCorrectCount || 0}
                </span>
              </div>
            ) : (
              <span className="bg-[#431407] text-orange-300 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border border-orange-900 leading-none font-mono font-medium flex items-center gap-1 justify-center">
                <Flame size={10}/> Streak: {user.streak || 0}
              </span>
            )}
          </div>
        )}
        
        {tab === 'streak' ? (
          <div className={`font-bold text-3xl md:text-4xl ${isExpanded ? 'mt-2' : 'mt-1'} tracking-tight ${theme.text}`}>
            {user.streak || 0}
          </div>
        ) : (
          <div className={`font-bold ${isGold ? 'text-4xl md:text-5xl' : 'text-3xl md:text-3xl'} mt-1 tracking-tight ${theme.text}`}>
            {user.totalScore || 0}
          </div>
        )}
        
        {isGold && !isExpanded && (
          <div className="mt-3 bg-gradient-to-r from-[#2c220f] to-[#3d3311] inline-block px-4 py-1.5 rounded border border-yellow-500/20 shadow-inner">
            <span className="text-yellow-500/90 text-[10px] uppercase font-bold tracking-[0.2em]">
              {tab === 'streak' ? 'Unstoppable' : 'Grandmaster'}
            </span>
          </div>
        )}

        {/* Expansion Details */}
        {isExpanded && (
          <div className="absolute inset-x-0 bottom-4 px-4 flex flex-col items-center animate-in fade-in zoom-in duration-200">
             <div className="text-[10px] text-slate-400 mb-2 truncate max-w-full italic px-2">
               {user.bio ? `"${user.bio}"` : ""}
             </div>
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 navigate(`/profile/${user._id}`);
               }}
               className="w-full py-1.5 rounded text-xs font-bold bg-[#1e293b] text-white hover:bg-slate-700 transition-colors border border-slate-600/50"
             >
               Go to profile
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
