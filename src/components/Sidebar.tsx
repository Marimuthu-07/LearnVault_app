import React, { useState } from "react";
import { User } from "../types";
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Plus, 
  LogOut, 
  Flame, 
  Brain, 
  Menu, 
  X,
  GraduationCap
} from "lucide-react";

interface SidebarProps {
  user: User | null;
  activeTab: "dashboard" | "topics" | "calendar";
  setActiveTab: (tab: "dashboard" | "topics" | "calendar") => void;
  onAddTopicClick: () => void;
  onLogout: () => void;
}

export function Sidebar({ user, activeTab, setActiveTab, onAddTopicClick, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "topics", label: "Topics Vault", icon: BookOpen },
    { id: "calendar", label: "Revision Calendar", icon: Calendar }
  ] as const;

  const handleTabSelect = (tabId: "dashboard" | "topics" | "calendar") => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0B0F19] sticky top-0 z-40">
        <div className="flex items-center gap-1.5">
          <div className="p-1 text-purple-400 bg-purple-500/10 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            LearnVault
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          id="btn_mobile_menu"
          className="p-1 border border-gray-800 hover:bg-gray-800 text-gray-300 rounded-lg focus:outline-none cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar background overlay for mobile drawers */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/75 z-40 backdrop-blur-sm"
        />
      )}

      {/* Shared Layout Sidebar Drawer */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-gray-800/80 bg-[#080B14] flex flex-col justify-between transition-transform duration-300 transform
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:h-screen md:sticky md:top-0
      `}>
        
        {/* Brand/Logo Section */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-xl shadow-md shadow-purple-500/20">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display font-bold text-base tracking-tight text-gray-50 flex items-center gap-1">
                LearnVault
              </h1>
              <span className="text-[10px] font-mono text-gray-500">Student Study Core v1.2</span>
            </div>
          </div>

          {/* User Profile Info Card */}
          {user && (
            <div className="p-3 bg-[#111624]/60 rounded-xl border border-gray-800/80 mb-2">
              <div className="flex items-center gap-2.5">
                {/* Simulated Avatar */}
                <span className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 font-display font-semibold text-xs text-white flex items-center justify-center uppercase">
                  {user.username.slice(0, 2)}
                </span>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold text-gray-200 truncate">{user.username}</h4>
                  <span className="text-[10px] font-mono text-gray-400 truncate block">{user.email}</span>
                </div>
              </div>

              {/* Little stats bar inside Profile */}
              <div className="flex items-center justify-between border-t border-gray-800/50 pt-2.5 mt-2.5">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Active Meter</span>
                <div className="flex items-center gap-1 bg-[#F59E0B]/10 border border-[#F59E0B]/15 px-2 py-0.5 rounded-md">
                  <Flame className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]/10 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-[#F59E0B]">{user.streak}d</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selection Navigation list */}
        <div className="flex-1 px-3 space-y-1">
          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider pl-4 mb-2.5 block font-semibold">Vault Core Views</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isAct = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                id={`sidebar_tab_${item.id}`}
                className={`
                  w-full flex items-center gap-3 py-2.5 px-4 text-xs font-medium rounded-xl transition-all cursor-pointer
                  ${isAct 
                    ? "bg-purple-600/10 text-purple-300 font-semibold border-l-2 border-purple-500 shadow-sm" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#121827]/40"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isAct ? "text-purple-400" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 px-2">
            <button
              onClick={() => {
                onAddTopicClick();
                setMobileOpen(false);
              }}
              id="sidebar_btn_add_topic"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium text-xs py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-purple-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Topic</span>
            </button>
          </div>
        </div>

        {/* Action Foot Block */}
        <div className="p-4 border-t border-gray-800/80">
          <button
            onClick={onLogout}
            id="sidebar_btn_logout"
            className="w-full flex items-center gap-3 py-2 px-3 text-xs font-medium text-red-500/80 hover:text-red-400 rounded-lg hover:bg-red-950/10 hover:border hover:border-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Close Session Log</span>
          </button>
        </div>

      </aside>
    </>
  );
}
