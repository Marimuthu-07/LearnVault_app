import { DashboardStats } from "../types";
import { Award, BookOpen, CheckCircle, RefreshCw, Flame, HelpCircle } from "lucide-react";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  // Safe calculations
  const total = stats.totalTopics || 0;
  const completed = stats.completedCount || 0;
  const revising = stats.revisingCount || 0;
  const pending = stats.pendingCount || 0;
  
  const progressPercent = stats.progressPercent || 0;

  // Circular progress ring calculations
  const strokeRadius = 36;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (progressPercent / 100) * strokeCircumference;

  // Total topics distribution by difficulty
  const easy = stats.difficultyDistribution?.easy || 0;
  const medium = stats.difficultyDistribution?.medium || 0;
  const hard = stats.difficultyDistribution?.hard || 0;
  const difficultyTotal = easy + medium + hard || 1;

  const easyPercent = Math.round((easy / difficultyTotal) * 100);
  const mediumPercent = Math.round((medium / difficultyTotal) * 100);
  const hardPercent = Math.round((hard / difficultyTotal) * 100);

  // Maximum weekly action count to compute relative heights safely
  const weeklyMaxCount = Math.max(...stats.weeklyActivity.map(d => d.count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Global Progress Circular Card */}
      <div className="bg-[#0F1626]/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-5 flex items-center justify-between neon-glow-purple group hover:border-purple-600/35 transition-all">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase block">Vault Capacity</span>
          <h4 className="text-2xl font-bold text-gray-100 font-display">{total} <span className="text-xs text-gray-500 font-normal">topics</span></h4>
          <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{completed} Completed ({progressPercent}%)</span>
          </p>
        </div>
        
        {/* SVG Ring Graph */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={strokeRadius}
              className="stroke-gray-800"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Foreground ring */}
            <circle
              cx="50"
              cy="50"
              r={strokeRadius}
              className="stroke-purple-500 transition-all duration-500 ease-out"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={strokeCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-mono font-bold text-gray-100">{progressPercent}%</span>
            <span className="text-[8px] text-gray-500 font-mono tracking-tighter uppercase">Ratio</span>
          </div>
        </div>
      </div>

      {/* 2. Streak Counter */}
      <div className="bg-[#0F1626]/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-5 flex items-center justify-between group hover:border-[#F59E0B]/35 transition-all">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase block">Learning Streak</span>
          <div className="flex items-baseline gap-1.5">
            <h4 id="streak_counter_val" className="text-3xl font-bold text-[#F59E0B] font-display">
              {stats.streak}
            </h4>
            <span className="text-xs text-gray-400 font-mono">days consecutive</span>
          </div>
          <p className="text-[11px] text-gray-550 leading-tight">
            {stats.streak > 0 
              ? "Awesome work! Log/revise a topic daily to keep growing." 
              : "No streak yet. Build your portfolio with a new study item."}
          </p>
        </div>
        <div className="p-3 bg-[#F59E0B]/10 rounded-2xl border border-[#F59E0B]/15 text-[#F59E0B] group-hover:scale-110 transition-transform">
          <Flame className="w-7 h-7 fill-[#F59E0B]/20 animate-pulse" />
        </div>
      </div>

      {/* 3. Difficulties Bar Dist Chart */}
      <div className="bg-[#0F1626]/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between group hover:border-blue-600/35 transition-all">
        <div>
          <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase block">Difficulty Spectrum</span>
          <div className="flex items-center gap-4 mt-1.5 mb-2">
            <h4 className="text-lg font-bold text-gray-200">
              {easy + medium + hard === 0 ? "Empty spectrum" : "Segment metrics"}
            </h4>
          </div>
        </div>

        {/* Custom stacked visual bar */}
        <div className="space-y-2 mt-2">
          <div className="h-2 w-full rounded-full bg-gray-900 overflow-hidden flex">
            {easy > 0 && <div className="h-full bg-emerald-500" style={{ width: `${easyPercent}%` }} title={`Easy ${easyPercent}%`} />}
            {medium > 0 && <div className="h-full bg-purple-500" style={{ width: `${mediumPercent}%` }} title={`Medium ${mediumPercent}%`} />}
            {hard > 0 && <div className="h-full bg-red-500" style={{ width: `${hardPercent}%` }} title={`Hard ${hardPercent}%`} />}
            {easy === 0 && medium === 0 && hard === 0 && <div className="h-full bg-gray-800 w-full" />}
          </div>
          
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
            <div className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>Easy ({easy})</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400 justify-center">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              <span>Med ({medium})</span>
            </div>
            <div className="flex items-center gap-1 text-red-400 justify-end">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              <span>Hard ({hard})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Weekly study log chart */}
      <div className="bg-[#0F1626]/60 backdrop-blur-md border border-gray-800/80 rounded-2xl p-4 flex flex-col justify-between group hover:border-emerald-600/35 transition-all">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono text-gray-500 tracking-wider uppercase block">Study Velocity</span>
            <span className="text-xs text-gray-400 font-mono mt-0.5 block">Last 7 Days Activity</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-lg">
            Active
          </span>
        </div>

        {/* Dynamic bar columns */}
        <div className="flex items-end justify-between h-14 px-1 gap-2 mt-4">
          {stats.weeklyActivity && stats.weeklyActivity.map((act, i) => {
            const hPercent = Math.max(12, Math.round((act.count / weeklyMaxCount) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group/bar">
                {/* Bar */}
                <div 
                  className="w-full bg-purple-500/40 hover:bg-purple-400 rounded-t-sm transition-all duration-300 relative self-end"
                  style={{ height: `${hPercent}%` }}
                >
                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-950 text-gray-200 border border-gray-850 px-1 py-0.5 text-[8px] rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-all">
                    {act.count}
                  </span>
                </div>
                {/* Label text */}
                <span className="text-[9px] font-mono text-gray-650 tracking-tighter">
                  {act.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Status strip */}
      <div className="md:col-span-2 lg:col-span-4 bg-[#101726]/30 border border-gray-850/60 rounded-xl px-4 py-2.5 flex flex-wrap gap-4 items-center justify-between text-xs text-gray-400 font-mono">
        <div className="flex items-center gap-3">
          <span>🧠 Status Overview:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{completed} Completed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>{revising} Revising</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{pending} Pending</span>
          </span>
        </div>
        <div className="text-[11px] text-purple-400">
          Target: Complete 100% of pending topics for max grade scores.
        </div>
      </div>
    </div>
  );
}
