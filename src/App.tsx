import React, { useState, useEffect, useMemo } from "react";
import { User, Topic, Difficulty, Status, DashboardStats } from "./types";
import { api } from "./api";
import { Sidebar } from "./components/Sidebar";
import { StatsGrid } from "./components/StatsGrid";
import { CalendarView } from "./components/CalendarView";
import { TopicModal } from "./components/TopicModal";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { MarkdownRenderer } from "./components/MarkdownRenderer";
import { 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  BookOpen, 
  Sparkles, 
  ArrowUpDown, 
  SlidersHorizontal,
  Bookmark,
  FileDown,
  LogOut,
  BrainCircuit,
  Lock,
  Mail,
  User as UserIcon,
  HelpCircle,
  Eye,
  AlertCircle
} from "lucide-react";

export default function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Application State
  const [activeTab, setActiveTab] = useState<"dashboard" | "topics" | "calendar">("dashboard");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Filter & Search State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Topic Modal state
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active topic reader panel (Side Drawer or Modal inside Topics tab)
  const [readingTopic, setReadingTopic] = useState<Topic | null>(null);

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-clear toast after delay
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  // Check auth details on load
  useEffect(() => {
    if (api.isAuthenticated()) {
      refreshSession();
    }
  }, []);

  // Fetch metrics and records when switching tabs or loading
  useEffect(() => {
    if (user) {
      fetchAppCoreData();
    }
  }, [user, activeTab, category, status, sortBy]); // Automatically refresh when filter state switches

  const refreshSession = async () => {
    try {
      const res = await api.getProfile();
      setUser(res.user);
      triggerToast(`Welcome back, ${res.user.username}! ✨`, "info");
    } catch (err: any) {
      api.logout();
      setUser(null);
    }
  };

  const fetchAppCoreData = async () => {
    setIsDataLoading(true);
    try {
      const [topicsData, statsData] = await Promise.all([
        api.getTopics({ search, category, status, sortBy }),
        api.getStats()
      ]);
      setTopics(topicsData.topics);
      setStats(statsData);
    } catch (err: any) {
      triggerToast(err.message || "Failed to load records database", "error");
    } finally {
      setIsDataLoading(false);
    }
  };

  // Handle Search Input Debounce-like action on button submission
  const handleFilterSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppCoreData();
  };

  // Authentication Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail || !authPassword) {
      setAuthError("Email and password fields are required");
      return;
    }
    setIsAuthLoading(true);
    try {
      const res = await api.login(authEmail, authPassword);
      setUser(res.user);
      triggerToast(`Sign-in key verified! Welcome to LearnVault.`, "success");
      // Clear fields
      setAuthEmail("");
      setAuthPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authUsername || !authEmail || !authPassword) {
      setAuthError("All credentials are required to construct an account");
      return;
    }
    setIsAuthLoading(true);
    try {
      const res = await api.register(authUsername, authEmail, authPassword);
      setUser(res.user);
      triggerToast(`Vault initialized! Welcome ${authUsername}! 🔥`, "success");
      // Clear fields
      setAuthUsername("");
      setAuthEmail("");
      setAuthPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Registration failed. Duplicate email or username.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setTopics([]);
    setStats(null);
    setReadingTopic(null);
    triggerToast("Vault locked securely. Happy learning!", "info");
  };

  // Topic CRUD saves
  const handleSaveTopic = async (topicData: Omit<Topic, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => {
    try {
      if (topicData.id) {
        // Edit Topic
        const res = await api.updateTopic(topicData.id, topicData);
        triggerToast("Concept updated and secured perfectly!");
        // Update reading window if active
        if (readingTopic && readingTopic.id === topicData.id) {
          setReadingTopic(res.topic);
        }
      } else {
        // Create Topic
        await api.createTopic(topicData as any);
        triggerToast("New learning milestone registered!");
      }
      setIsModalOpen(false);
      setSelectedTopic(null);
      // Reload everything
      fetchAppCoreData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to submit topic item", "error");
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await api.deleteTopic(id);
      triggerToast("Topic removed from your ledger.", "info");
      setIsModalOpen(false);
      setSelectedTopic(null);
      if (readingTopic && readingTopic.id === id) {
        setReadingTopic(null);
      }
      fetchAppCoreData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to remove topic item", "error");
    }
  };

  // Open Edit Trigger
  const handleEditClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  // Open Add Trigger
  const handleAddClick = () => {
    setSelectedTopic(null);
    setIsModalOpen(true);
  };

  // Select item in calendar or general dashboards
  const handleInspectTopic = (topic: Topic) => {
    setReadingTopic(topic);
    // Switch to topics view if reading details from other tabs
    if (activeTab !== "topics") {
      setActiveTab("topics");
    }
  };

  // Markdown Export Function
  const handleExportPDF = (topic: Topic) => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        triggerToast("Popup blocker blocked the notes exporter. Please unlock popups.", "error");
        return;
      }

      // Stylized HTML Layout design for beautiful notes printout/PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${topic.title} - LearnVault Notebook Export</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #1F2937;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 0 20px;
            }
            .header {
              border-bottom: 2px solid #6D28D9;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 28px;
              font-weight: 700;
              color: #111827;
              margin: 0 0 10px 0;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              font-size: 11px;
              color: #4B5563;
              font-family: monospace;
              background-color: #F3F4F6;
              padding: 10px 15px;
              border-radius: 8px;
            }
            .tag {
              display: inline-block;
              background-color: #EDE9FE;
              color: #5B21B6;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              margin-right: 5px;
              font-weight: 500;
            }
            .section-title {
              color: #6D28D9;
              font-size: 16px;
              font-weight: 600;
              margin-top: 25px;
              margin-bottom: 15px;
              border-bottom: 1px solid #E5E7EB;
              pb-5px;
            }
            .notes {
              background: #FAF5FF;
              border-left: 4px solid #8B5CF6;
              padding: 20px;
              border-radius: 0 8px 8px 0;
              font-size: 14px;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #E5E7EB;
              padding-top: 15px;
              font-size: 11px;
              color: #9CA3AF;
              text-align: center;
            }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${topic.title}</h1>
            <div class="meta-grid">
              <div><strong>Category:</strong> ${topic.category}</div>
              <div><strong>Difficulty:</strong> ${topic.difficulty}</div>
              <div><strong>Status:</strong> ${topic.status}</div>
              <div><strong>Date Learned:</strong> ${topic.dateLearned}</div>
              <div><strong>Next Revision Due:</strong> ${topic.revisionDate}</div>
              <div><strong>Stature:</strong> Secured in LearnVault</div>
            </div>
            <div style="margin-top: 15px;">
              ${topic.tags.map(t => `<span class="tag">#${t}</span>`).join("")}
            </div>
          </div>
          
          <h2 class="section-title">Notebook Insights & Study Key-Notes</h2>
          <div class="notes">${topic.notes || "No notes logged for this entry."}</div>
          
          <div class="footer">
            Generated securely using LearnVault — Your Dedicated Personal Academic Portfolio. Created at ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      triggerToast("Export initialized in secondary window!", "success");
    } catch (err: any) {
      triggerToast("Export failed: " + err.message, "error");
    }
  };

  // Categories list for filtration dropdowns
  const availableFilters = [
    "Computer Science",
    "Mathematics",
    "Science",
    "Languages",
    "Engineering",
    "Business & Finance",
    "Design & Arts",
    "Humanities",
    "General"
  ];

  // Inline greeting calculations based on time of day
  const greetingText = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="min-h-screen bg-[#080C16] text-gray-100 flex flex-col md:flex-row relative">
      
      {/* Background glowing meshes (Linear premium dark aesthetic) */}
      <div className="bg-glowing-mesh" />

      {/* 1. Unauthorized authentication login wrapper screen */}
      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen relative overflow-hidden">
          
          {/* Neon mesh circles behind portal cards */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

          <div className="w-full max-w-md bg-[#0F1626]/75 backdrop-blur-xl border border-gray-800/90 rounded-3xl p-8 shadow-2xl relative z-10 neon-glow-purple">
            
            {/* Header logo */}
            <div className="flex flex-col items-center mb-8">
              <span className="p-3 bg-gradient-to-tr from-purple-500 to-blue-600 text-white rounded-2xl shadow-xl shadow-purple-500/15 mb-3">
                <BrainCircuit className="w-8 h-8 animate-pulse" />
              </span>
              <h1 className="text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-blue-100">
                LearnVault
              </h1>
              <p className="text-xs text-gray-400 text-center mt-1">
                Your secure full-stack personal academic study repository & revision engine
              </p>
            </div>

            {/* Error alerts */}
            {authError && (
              <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2 mb-4 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Auth Form Selector buttons */}
            <div className="flex bg-[#121A2C] p-1 border border-gray-800 rounded-xl mb-6 text-xs">
              <button
                onClick={() => { setAuthScreen("login"); setAuthError(null); }}
                id="btn_auth_login_tab"
                className={`flex-1 py-2 rounded-lg text-center font-semibold cursor-pointer transition-colors ${
                  authScreen === "login" ? "bg-purple-600 text-white" : "text-gray-450 hover:text-gray-100"
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setAuthScreen("register"); setAuthError(null); }}
                id="btn_auth_register_tab"
                className={`flex-1 py-2 rounded-lg text-center font-semibold cursor-pointer transition-colors ${
                  authScreen === "register" ? "bg-purple-600 text-white" : "text-gray-450 hover:text-gray-100"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Logical Forms inputs */}
            {authScreen === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1.5 font-medium">Your Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@university.edu"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      id="input_login_email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121A2C] border border-gray-800 text-sm text-gray-100 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1.5 font-medium">Password credentials</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      id="input_login_password"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121A2C] border border-gray-800 text-sm text-gray-100 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn_auth_login_submit"
                  disabled={isAuthLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl mt-6 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isAuthLoading ? "Verifying Keys..." : "Access LearnVault Key"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1.5 font-medium">Student Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. AlexStudy2026"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      id="input_register_username"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121A2C] border border-gray-800 text-sm text-gray-100 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1.5 font-medium">Academic Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@college.edu"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      id="input_register_email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121A2C] border border-gray-800 text-sm text-gray-100 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1.5 font-medium">Password (Min 6 chars)</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      id="input_register_password"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121A2C] border border-gray-800 text-sm text-gray-100 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn_auth_register_submit"
                  disabled={isAuthLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl mt-6 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isAuthLoading ? "Forging Account Key..." : "Secure My Study Vault"}
                </button>
              </form>
            )}

            <div className="border-t border-gray-800/80 mt-6 pt-5 text-center">
              <span className="text-[10px] font-mono text-gray-500 leading-snug">
                🔒 Data encrypted locally. Powered by MongoDB persistent document ledger schemas.
              </span>
            </div>

          </div>
        </div>
      ) : (
        /* 2. Authorized Dashboard workspace */
        <>
          {/* Sticky responsive Sidebar */}
          <Sidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onAddTopicClick={handleAddClick} 
            onLogout={handleLogout} 
          />

          {/* Main workspace arena */}
          <main className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
            
            {/* Top Toolbar line */}
            <header className="px-6 py-4 border-b border-gray-800/70 bg-[#090D1A]/80 flex flex-wrap gap-4 items-center justify-between sticky top-0 md:static z-20 backdrop-blur">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase tracking-widest block">Core Portal Workspace</span>
                <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-1.5 uppercase font-display">
                  <span>{activeTab === "dashboard" ? "Academic Dashboard Analytics" : activeTab === "topics" ? "Topics Inventory Ledger" : "Spaced Revision Scheduler"}</span>
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddClick}
                  id="header_quick_add"
                  className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/25 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Topic</span>
                </button>
              </div>
            </header>

            {/* Inner scroll contents container */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Conditional load display */}
              {isDataLoading && topics.length === 0 ? (
                <LoadingSkeleton />
              ) : (
                <>
                  {/* --- TAB 1: DASHBOARD --- */}
                  {activeTab === "dashboard" && (
                    <div className="space-y-6">
                      
                      {/* Hero banner Welcome */}
                      <div className="bg-[#101424]/70 border border-gray-800/90 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden neon-glow-purple">
                        {/* Decorative neon background light */}
                        <div className="absolute top-0 right-0 w-64 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                        
                        <div className="space-y-2 relative z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-full font-bold">
                            <Sparkles className="w-3 h-3 animate-spin" />
                            <span>Vault Verified</span>
                          </span>
                          <h2 className="text-xl md:text-2xl font-bold font-display text-gray-100 tracking-tight">
                            {greetingText}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{user.username}</span>!
                          </h2>
                          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
                            Welcome back to your Study Vault. You currently have <strong className="text-purple-300 font-bold">{topics.length}</strong> topics logged, with <strong className="text-blue-300 font-bold">{topics.filter(t => t.status === Status.Revising).length}</strong> slated in active revision. Connect new topics or review calendars below!
                          </p>
                        </div>
                        
                        <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-center gap-3 self-stretch md:self-auto justify-center">
                          <div className="text-center">
                            <span className="text-[10px] font-mono text-gray-500 block">Streak Balance</span>
                            <span className="text-3xl font-bold text-[#F59E0B] font-display">{stats?.streak || 0}d</span>
                          </div>
                          <span className="w-px h-10 bg-gray-800" />
                          <div className="text-center font-mono">
                            <span className="text-[10px] text-gray-500 block">Completion</span>
                            <span className="text-lg font-bold text-emerald-400 font-display">{stats?.progressPercent || 0}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats SVG Grid panel */}
                      {stats && <StatsGrid stats={stats} />}

                      {/* Double layout split: Recent list + Category Allocations summary */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Column Left: Recent 4 topics */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold font-display text-gray-200 tracking-wide uppercase">Recently Logged Milestones</h3>
                            <button 
                              onClick={() => setActiveTab("topics")}
                              className="text-xs text-purple-400 hover:text-purple-300 font-mono"
                            >
                              Browse all &rarr;
                            </button>
                          </div>

                          {topics.length === 0 ? (
                            <div className="bg-[#0F1626]/40 border border-gray-800/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                              <BookOpen className="w-8 h-8 text-gray-650 mb-2" />
                              <h4 className="text-sm font-semibold text-gray-300">No learning logged yet</h4>
                              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                Track topics you study to start compiling statistics and streaks instantly.
                              </p>
                              <button
                                onClick={handleAddClick}
                                className="mt-4 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg"
                              >
                                Record First Topic
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {topics.slice(0, 4).map((topic) => (
                                <div
                                  key={topic.id}
                                  onClick={() => handleInspectTopic(topic)}
                                  id={`recent_topic_card_${topic.id}`}
                                  className="p-4 bg-[#0E1424]/60 hover:bg-[#151D33]/80 border border-gray-800/70 hover:border-purple-600/30 rounded-2xl transition-all flex items-center justify-between gap-4 cursor-pointer group"
                                >
                                  <div className="space-y-1 overflow-hidden flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-semibold text-gray-200 group-hover:text-purple-300 transition-colors truncate">
                                        {topic.title}
                                      </span>
                                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase border ${
                                        topic.difficulty === Difficulty.Easy 
                                          ? "text-emerald-400 border-emerald-900/30 bg-emerald-950/20"
                                          : topic.difficulty === Difficulty.Medium
                                            ? "text-purple-400 border-purple-900/30 bg-purple-950/20"
                                            : "text-red-400 border-red-900/30 bg-red-950/20"
                                      }`}>
                                        {topic.difficulty}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-gray-500 font-mono">
                                      <span>{topic.category}</span>
                                      <span>•</span>
                                      <span>Studied {topic.dateLearned}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                                      topic.status === Status.Completed
                                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/20"
                                        : topic.status === Status.Revising
                                          ? "bg-purple-950/40 text-purple-400 border-purple-900/20"
                                          : "bg-amber-950/40 text-amber-400 border-amber-900/20"
                                    }`}>
                                      {topic.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Column Right: Category visual distribution donut/legend ratios */}
                        <div className="bg-[#0F1626]/50 rounded-2xl border border-gray-800 p-5 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block font-bold">Category Distribution</span>
                            <h4 className="text-xs font-mono text-gray-400 mt-1 border-b border-gray-850/60 pb-2">Academic Concentration:</h4>
                          </div>

                          <div className="space-y-3 my-4 overflow-y-auto max-h-[170px] pr-1">
                            {stats?.categoryDistribution && stats.categoryDistribution.map((cat, idx) => {
                              const totalCount = stats.totalTopics || 1;
                              const ratio = Math.round((cat.value / totalCount) * 100);
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs font-mono">
                                    <span className="text-gray-300 truncate" style={{ color: cat.color }}>{cat.name}</span>
                                    <span className="text-gray-500">{cat.value} items ({ratio}%)</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-900/60 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${ratio}%`, backgroundColor: cat.color }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-purple-950/10 border border-purple-900/10 p-3 rounded-lg text-[11px] text-purple-400 leading-snug">
                            💡 Use high categorization tags (like Computer Science or Mathematics) for robust filters across the vault index.
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* --- TAB 2: TOPICS VAULT --- */}
                  {activeTab === "topics" && (
                    <div className="space-y-6">
                      
                      {/* Interactive Filter Grid */}
                      <form onSubmit={handleFilterSearchSubmit} className="space-y-4 bg-[#0F1626]/60 border border-gray-850/70 rounded-2xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          
                          {/* Search bar inputs */}
                          <div className="md:col-span-2 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                              type="text"
                              placeholder="Search by topic title, tag, or concepts..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              id="filter_search"
                              className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F19] border border-gray-800 text-xs text-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-650"
                            />
                          </div>

                          {/* Category selectivity */}
                          <div>
                            <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              id="filter_category"
                              className="w-full px-3 py-2.5 bg-[#0B0F19] border border-gray-800 text-xs text-gray-350 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                            >
                              <option value="all">All Categories</option>
                              {availableFilters.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                          {/* Status selectivity */}
                          <div>
                            <select
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              id="filter_status"
                              className="w-full px-3 py-2.5 bg-[#0B0F19] border border-gray-800 text-xs text-gray-350 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                            >
                              <option value="all">All Statuses</option>
                              <option value={Status.Completed}>Completed</option>
                              <option value={Status.Revising}>Revising</option>
                              <option value={Status.Pending}>Pending</option>
                            </select>
                          </div>

                        </div>

                        {/* Extra control triggers */}
                        <div className="flex flex-wrap gap-4 items-center justify-between border-t border-gray-850/50 pt-3 text-xs text-gray-400">
                          
                          <div className="flex items-center gap-1.5 font-mono text-gray-550">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                            <span>Quick results found: {topics.length}</span>
                          </div>

                          {/* Sorting block selector */}
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-mono text-[11px] text-gray-550">
                              <ArrowUpDown className="w-3 h-3" />
                              <span>Sort by:</span>
                            </span>
                            <div className="flex bg-[#0B0F19] p-0.5 border border-gray-800 rounded-lg text-[10px]">
                              <button
                                type="button"
                                onClick={() => setSortBy("newest")}
                                id="btn_sort_newest"
                                className={`px-2.5 py-1 rounded-md cursor-pointer ${sortBy === "newest" ? "bg-purple-600 text-white font-medium" : "text-gray-500 hover:text-gray-300"}`}
                              >
                                Newest
                              </button>
                              <button
                                type="button"
                                onClick={() => setSortBy("oldest")}
                                id="btn_sort_oldest"
                                className={`px-2.5 py-1 rounded-md cursor-pointer ${sortBy === "oldest" ? "bg-purple-600 text-white font-medium" : "text-gray-500 hover:text-gray-300"}`}
                              >
                                Oldest
                              </button>
                              <button
                                type="button"
                                onClick={() => setSortBy("revision")}
                                id="btn_sort_revision"
                                className={`px-2.5 py-1 rounded-md cursor-pointer ${sortBy === "revision" ? "bg-purple-600 text-white font-medium" : "text-gray-500 hover:text-gray-300"}`}
                              >
                                Revision Due
                              </button>
                            </div>
                          </div>

                        </div>
                      </form>

                      {/* Main Layout Area: Grid of topics (Left) + Focused text reader notes (Right) */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* LEFT GRID: 2 Columns on desktop */}
                        <div className="lg:col-span-2 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                          
                          {topics.length === 0 ? (
                            <div className="bg-[#0F1626]/30 border border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                              <BookOpen className="w-12 h-12 text-gray-700 mb-3" />
                              <h4 className="text-base font-semibold text-gray-300">No matching topics secured</h4>
                              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                Try relaxing your filters or record a new study topic directly into your LearnVault.
                              </p>
                              <button
                                onClick={handleAddClick}
                                className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold rounded-xl"
                              >
                                Create New Topic
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {topics.map((topic) => {
                                const isFocused = readingTopic?.id === topic.id;
                                return (
                                  <div
                                    key={topic.id}
                                    onClick={() => setReadingTopic(topic)}
                                    id={`topic_card_${topic.id}`}
                                    className={`
                                      p-4 rounded-2xl border transition-all flex flex-col justify-between h-44 cursor-pointer relative group
                                      ${isFocused 
                                        ? "bg-purple-950/20 shadow-lg border-purple-500/80 ring-1 ring-purple-500/30" 
                                        : "bg-[#0E1524]/60 hover:bg-[#151E33]/70 border-gray-800 hover:border-purple-500/30"
                                      }
                                    `}
                                  >
                                    {/* Card main text */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{topic.category}</span>
                                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase border ${
                                          topic.difficulty === Difficulty.Easy 
                                            ? "text-emerald-400 border-emerald-950/40 bg-emerald-950/20"
                                            : topic.difficulty === Difficulty.Medium
                                              ? "text-purple-400 border-purple-950/40 bg-purple-950/20"
                                              : "text-red-400 border-red-950/30 bg-red-950/20"
                                        }`}>
                                          {topic.difficulty}
                                        </span>
                                      </div>

                                      <h3 className="text-xs font-semibold text-gray-150 group-hover:text-purple-300 transition-colors line-clamp-2">
                                        {topic.title}
                                      </h3>

                                      {/* Tags mapping */}
                                      <div className="flex flex-wrap gap-1 pt-1.5 h-6 overflow-hidden">
                                        {topic.tags && topic.tags.slice(0, 3).map((tg, i) => (
                                          <span key={i} className="text-[9px] font-mono bg-gray-900 px-1.5 py-0.2 border border-gray-800 text-gray-400 rounded">
                                            #{tg}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Card meta foot details */}
                                    <div className="flex items-center justify-between border-t border-gray-850 pt-2.5 mt-2 text-[10px] text-gray-500 font-mono">
                                      <div className="flex items-center gap-1.5">
                                        <CheckCircle className={`w-3.5 h-3.5 ${
                                          topic.status === Status.Completed 
                                            ? "text-emerald-400" 
                                            : topic.status === Status.Revising
                                              ? "text-purple-400"
                                              : "text-amber-400"
                                        }`} />
                                        <span>{topic.status}</span>
                                      </div>
                                      
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditClick(topic);
                                        }}
                                        id={`edit_trigger_${topic.id}`}
                                        className="text-purple-400 hover:text-purple-300 font-mono font-semibold"
                                      >
                                        Edit &rarr;
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>

                        {/* RIGHT FOCUSED NOTEBOOK CONSOLE */}
                        <div className="bg-[#0F1626]/70 border border-gray-800 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between h-[500px]">
                          {readingTopic ? (
                            <div className="flex flex-col h-full justify-between">
                              
                              {/* Header metrics */}
                              <div className="space-y-3 pb-3 border-b border-gray-850/60">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-semibold">
                                    Notebook Reader
                                  </span>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleExportPDF(readingTopic)}
                                      id="btn_export_notes"
                                      className="p-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-blue-400 rounded-lg border border-gray-800/80 transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-mono"
                                      title="Export to Print / PDF"
                                    >
                                      <FileDown className="w-3.5 h-3.5" />
                                      <span>Export</span>
                                    </button>
                                    <button 
                                      onClick={() => handleEditClick(readingTopic)}
                                      id="btn_edit_focused"
                                      className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-medium rounded-lg border border-purple-500/15 transition-all text-[10px] font-mono"
                                    >
                                      Edit notes
                                    </button>
                                  </div>
                                </div>

                                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-purple-100 uppercase font-display leading-tight">
                                  {readingTopic.title}
                                </h3>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-500 bg-[#121A2D]/40 p-2 rounded-xl">
                                  <div>Category: <span className="text-gray-300">{readingTopic.category}</span></div>
                                  <div>Difficulty: <span className="text-purple-300 font-bold">{readingTopic.difficulty}</span></div>
                                  <div>Learned: <span className="text-gray-300">{readingTopic.dateLearned}</span></div>
                                  <div>Revision Due: <span className="text-blue-300">{readingTopic.revisionDate}</span></div>
                                </div>
                              </div>

                              {/* Markdown body view */}
                              <div className="flex-1 overflow-y-auto my-4 pr-1">
                                <MarkdownRenderer notesText={readingTopic.notes} />
                              </div>

                              {/* Card tags at bottom */}
                              <div className="border-t border-gray-850/60 pt-3 flex flex-wrap gap-1">
                                {readingTopic.tags && readingTopic.tags.map((tg, idx) => (
                                  <span key={idx} className="bg-purple-950/20 border border-purple-900/15 py-0.5 px-2 text-[10px] text-purple-300 font-mono rounded-lg">
                                    #{tg}
                                  </span>
                                ))}
                                {(!readingTopic.tags || readingTopic.tags.length === 0) && (
                                  <span className="text-[10px] font-mono text-gray-600 italic">No category tags mapped</span>
                                )}
                              </div>

                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-3">
                              <BookOpen className="w-10 h-10 text-gray-750 mb-3 animate-pulse" />
                              <h4 className="text-sm font-semibold text-gray-400">No Document Selected</h4>
                              <p className="text-xs text-gray-600 mt-1 max-w-sm">
                                Inspect any study card from your catalog list to view comprehensive notebook data, export sheets, and review checklists.
                              </p>
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  )}

                  {/* --- TAB 3: CALENDAR VIEW --- */}
                  {activeTab === "calendar" && (
                    <div className="space-y-4">
                      <div className="bg-[#121A2C]/10 border border-gray-850/60 p-4 rounded-xl flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-400 animate-pulse" />
                        <div className="text-xs">
                          <h4 className="font-semibold text-gray-200">Personal Revision Scheduler</h4>
                          <p className="text-gray-500 mt-0.5">Track your past study periods as well as future revision commitments directly on an interactive calendar matrix.</p>
                        </div>
                      </div>

                      <CalendarView 
                        topics={topics} 
                        onTopicClick={handleInspectTopic} 
                      />
                    </div>
                  )}

                </>
              )}

            </div>

          </main>
        </>
      )}

      {/* 3. Popup Topic Addition / Editor Modals */}
      <TopicModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedTopic(null); }} 
        onSave={handleSaveTopic} 
        onDelete={handleDeleteTopic} 
        topic={selectedTopic} 
      />

      {/* 4. Sliding Bottom Right Alert Toasts notifications */}
      {toast && (
        <div 
          id="toast_notification"
          className={`
            fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 border shadow-2xl flex items-center gap-3 font-sans transition-all toast-slide-enter
            ${toast.type === "success" 
              ? "bg-slate-900 border-emerald-500/40 text-emerald-300" 
              : toast.type === "error"
                ? "bg-slate-900 border-red-500/40 text-red-300"
                : "bg-slate-900 border-purple-500/40 text-purple-300"
            }
          `}
        >
          <div className="flex-1 text-xs font-semibold">
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-200 focus:outline-none text-sm font-bold cursor-pointer pr-1"
          >
            ×
          </button>
        </div>
      )}

    </div>
  );
}
