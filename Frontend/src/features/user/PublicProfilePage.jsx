import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  Crown,
  Code2,
  Target,
  Flame,
  User,
  Activity
} from "lucide-react";
import { toProxyUrl } from "../../core/utils/urlHelpers";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const { data } = await axios.get(`${API_URL}/users/getUserDetail/${id}`, config);
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("User profile not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-semibold tracking-wider font-mono">LOADING PROFILE...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-center px-4">
        <User size={48} className="text-red-500/50 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#101524] text-white border border-[#1e293b] rounded-lg hover:bg-[#1e293b] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] pt-24 pb-20 px-4 sm:px-6 relative font-sans text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer group flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm font-semibold"
        >
          <div className="w-8 h-8 rounded-full bg-[#101524] border border-[#1e293b] flex items-center justify-center group-hover:bg-[#1e293b] transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Arena
        </button>

        {/* Profile Card */}
        <div className="bg-[#101524] border border-[#1e293b] rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header Backdrop */}
          <div className="h-32 bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-[#101524] relative">
             <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#101524] to-transparent pointer-events-none" />
          </div>

          <div className="px-6 sm:px-10 pb-10 relative">
            
            {/* Avatar & Top Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20 mb-8 relative z-10">
              <div className="w-32 h-32 rounded-2xl border-4 border-[#101524] bg-[#070b14] overflow-hidden shadow-xl shrink-0 p-1">
                {profile.avatar ? (
                  <img src={toProxyUrl(profile.avatar)} className="w-full h-full object-cover rounded-xl" alt={profile.name} />
                ) : (
                  <div className="w-full h-full bg-[#1e293b] rounded-xl flex items-center justify-center text-4xl font-bold font-mono text-gray-400">
                    {profile.name?.[0] || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                   <h1 className="text-3xl font-bold tracking-tight text-white">{profile.name}</h1>
                   {profile.isPremium && (
                      <span className="inline-flex items-center justify-center w-max mx-auto sm:mx-0 gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase font-bold tracking-wider">
                        <Crown size={12} /> PRO
                      </span>
                   )}
                </div>
                <div className="text-gray-400 font-mono text-sm">@{profile.username || profile.email?.split('@')[0]}</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               
               {/* Left Col: Info */}
               <div className="md:col-span-2 space-y-8">
                  
                  {/* Bio */}
                  {profile.bio && (
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-[#1e293b] pb-2">About</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {(profile.skills && profile.skills.length > 0) && (
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-[#1e293b] pb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                         {profile.skills.map((skill, idx) => (
                           <span key={idx} className="px-3 py-1 bg-[#1e293b] border border-[#334155] rounded-md text-xs font-semibold text-slate-300">
                             {skill}
                           </span>
                         ))}
                      </div>
                    </div>
                  )}

                  {/* Socials & Meta */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-[#1e293b] pb-2">Links</h3>
                    <div className="flex flex-wrap gap-4">
                      {profile.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin size={16} /> {profile.location}
                        </div>
                      )}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                          <Globe size={16} /> Website
                        </a>
                      )}
                      {profile.github && (
                        <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                          <Github size={16} /> GitHub
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                          <Linkedin size={16} /> LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

               </div>

               {/* Right Col: Stats */}
               <div className="space-y-4">
                  <div className="bg-[#070b14] border border-[#1e293b] p-5 rounded-2xl">
                     <div className="flex items-center gap-3 mb-4 border-b border-[#1e293b] pb-3">
                        <Activity className="text-cyan-400" size={20} />
                        <h3 className="text-sm font-bold text-white tracking-wide">ARENA STATS</h3>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                             <Target size={14} className="text-purple-400"/> Score
                           </span>
                           <span className="font-mono font-bold text-lg text-white">{(profile.totalScore || 0).toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                             <Code2 size={14} className="text-indigo-400"/> DSA
                           </span>
                           <span className="font-mono font-bold text-base text-slate-300">{profile.questionsSolvedCount || 0}</span>
                        </div>

                        <div className="flex items-center justify-between">
                           <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                             <Flame size={14} className="text-orange-500"/> Streak
                           </span>
                           <span className="font-mono font-bold text-base text-slate-300">{profile.streak || 0}</span>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
