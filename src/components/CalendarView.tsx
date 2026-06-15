import { useState, useMemo } from "react";
import { Topic, Status } from "../types";
import { Calendar, ChevronLeft, ChevronRight, BookOpen, Clock, AlertCircle } from "lucide-react";

interface CalendarViewProps {
  topics: Topic[];
  onTopicClick: (topic: Topic) => void;
}

export function CalendarView({ topics, onTopicClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    new Date().toISOString().split("T")[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to format Date objects as YYYY-MM-DD local format
  function formatDateKey(d: Date): string {
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, "0");
    const dStr = String(d.getDate()).padStart(2, "0");
    return `${yStr}-${mStr}-${dStr}`;
  }

  // Pre-index studies vs revision schedules for O(1) rendering
  const calendarEvents = useMemo(() => {
    const events: Record<string, { learned: Topic[]; revisions: Topic[] }> = {};
    
    topics.forEach((topic) => {
      // Index by DateLearned
      if (topic.dateLearned) {
        const dStr = topic.dateLearned.split("T")[0];
        if (!events[dStr]) events[dStr] = { learned: [], revisions: [] };
        events[dStr].learned.push(topic);
      }
      
      // Index by RevisionDate
      if (topic.revisionDate) {
        const rStr = topic.revisionDate.split("T")[0];
        if (!events[rStr]) events[rStr] = { learned: [], revisions: [] };
        events[rStr].revisions.push(topic);
      }
    });

    return events;
  }, [topics]);

  const daysInMonth = useMemo(() => {
    const days = [];
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Previous month filler days
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayDate = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        key: formatDateKey(dayDate)
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(year, month, i);
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        key: formatDateKey(dayDate)
      });
    }

    // Next month filler days (fill out the 42-day calendar container)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const dayDate = new Date(year, month + 1, i);
      days.push({
        date: dayDate,
        isCurrentMonth: false,
        key: formatDateKey(dayDate)
      });
    }

    return days;
  }, [year, month]);

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const selectedDateEvents = useMemo(() => {
    if (!selectedDateStr) return { learned: [], revisions: [] };
    return calendarEvents[selectedDateStr] || { learned: [], revisions: [] };
  }, [selectedDateStr, calendarEvents]);

  const selectedDateReadable = useMemo(() => {
    if (!selectedDateStr) return "";
    const parsed = new Date(selectedDateStr + "T00:00:00");
    return parsed.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, [selectedDateStr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
      {/* Calendar Grid Section */}
      <div className="lg:col-span-2 bg-[#0F1626]/70 backdrop-blur-md rounded-2xl border border-gray-800/80 p-5 neon-glow-purple">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-semibold font-display text-gray-100">
              {monthNames[month]} <span className="text-gray-500 font-normal">{year}</span>
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              id="btn_prev_month"
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200 transition-colors border border-gray-800/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              id="btn_today_month"
              className="px-2.5 py-1 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors border border-purple-500/20"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              id="btn_next_month"
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200 transition-colors border border-gray-800/50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="text-xs font-mono text-gray-500 py-1 uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((dayObj) => {
            const hasLearned = (calendarEvents[dayObj.key]?.learned.length || 0) > 0;
            const hasRevision = (calendarEvents[dayObj.key]?.revisions.length || 0) > 0;
            const isSelected = selectedDateStr === dayObj.key;
            const isToday = formatDateKey(new Date()) === dayObj.key;

            return (
              <button
                key={dayObj.key}
                onClick={() => setSelectedDateStr(dayObj.key)}
                id={`calendar_day_${dayObj.key}`}
                className={`
                  aspect-square flex flex-col justify-between items-center p-1.5 rounded-xl border transition-all text-xs relative cursor-pointer group
                  ${dayObj.isCurrentMonth ? "text-gray-200" : "text-gray-600"}
                  ${isSelected 
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-md transform scale-102" 
                    : isToday
                      ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                      : "bg-[#111A30]/30 hover:bg-[#182343]/60 border-gray-900/50 hover:border-gray-800"
                  }
                `}
              >
                {/* Day num */}
                <span className={`font-mono text-sm self-start ${isToday ? "font-bold" : ""}`}>
                  {dayObj.date.getDate()}
                </span>

                {/* Tags or dot overlays */}
                <div className="flex gap-1 justify-center w-full mt-auto">
                  {hasLearned && (
                    <span 
                      className="w-1.5 h-1.5 bg-purple-500 rounded-full" 
                      title={`${calendarEvents[dayObj.key]?.learned.length} topics learned`}
                    />
                  )}
                  {hasRevision && (
                    <span 
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" 
                      title={`${calendarEvents[dayObj.key]?.revisions.length} revisions scheduled`}
                    />
                  )}
                </div>

                {/* Tooltip on hover */}
                {(hasLearned || hasRevision) && (
                  <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-950/95 border border-gray-800 text-gray-300 text-[10px] py-1 px-1.5 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-sans">
                    {hasLearned && `Learned: ${calendarEvents[dayObj.key].learned.length}  `}
                    {hasRevision && `To Revise: ${calendarEvents[dayObj.key].revisions.length}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5 text-[11px] font-mono text-gray-500 border-t border-gray-800/50 pt-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#111A30]/30 border border-blue-500/40 rounded" />
            <span>Today's Date</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
            <span>Learned items</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            <span>Scheduled revision due</span>
          </div>
        </div>
      </div>

      {/* Date Detail Column */}
      <div className="flex flex-col bg-[#0F1626]/50 rounded-2xl border border-gray-800/80 p-5 p-y-4">
        <div className="mb-4">
          <span className="text-[11px] font-mono text-gray-500 tracking-widest uppercase">Planning Log</span>
          <h4 className="text-sm font-semibold text-gray-100 mt-1 border-b border-gray-800/60 pb-2">
            {selectedDateReadable}
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[350px]">
          {/* Learned topics list */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-purple-400 font-medium mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learned Today ({selectedDateEvents.learned.length})</span>
            </div>
            {selectedDateEvents.learned.length === 0 ? (
              <p className="text-xs text-gray-600 italic py-1 pl-5">No newly logged topics on this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.learned.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onTopicClick(topic)}
                    id={`calendar_learned_topic_${topic.id}`}
                    className="w-full text-left p-2.5 bg-[#141B2D]/40 hover:bg-[#1C253E]/60 border border-gray-800/40 hover:border-gray-800 rounded-xl transition-all block cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-gray-200 group-hover:text-purple-300 transition-colors line-clamp-1">
                        {topic.title}
                      </span>
                      <span className={`text-[10px] px-1.5 rounded-full uppercase font-mono border ${
                        topic.status === Status.Completed 
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                          : topic.status === Status.Revising
                            ? "bg-purple-950/40 text-purple-400 border-purple-900/30"
                            : "bg-amber-950/40 text-amber-400 border-amber-900/30"
                      }`}>
                        {topic.status}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center text-[10px] text-gray-500 mt-1">
                      <span>{topic.category}</span>
                      <span>•</span>
                      <span>{topic.difficulty}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Revisions topics list */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 font-medium mb-2 mt-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Revision Targets ({selectedDateEvents.revisions.length})</span>
            </div>
            {selectedDateEvents.revisions.length === 0 ? (
              <p className="text-xs text-gray-600 italic py-1 pl-5">No revision reminders set for this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.revisions.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onTopicClick(topic)}
                    id={`calendar_revision_topic_${topic.id}`}
                    className="w-full text-left p-2.5 bg-[#141B2D]/40 hover:bg-[#1C253E]/60 border border-gray-800/40 hover:border-gray-800 rounded-xl transition-all block cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-gray-200 group-hover:text-blue-300 transition-colors line-clamp-1">
                        {topic.title}
                      </span>
                      <span className="text-[9px] bg-blue-950/50 text-blue-400 border border-blue-900/45 px-1 rounded uppercase">
                        Due
                      </span>
                    </div>
                    <div className="flex gap-2 items-center text-[10px] text-gray-500 mt-1">
                      <span>{topic.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5 text-blue-400" />
                        <span>{topic.difficulty}</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-purple-950/10 border border-purple-900/30 rounded-xl p-3 mt-4 text-[11px] text-purple-300 leading-relaxed">
          <p>
            💡 <strong>Revision Pro-Tip:</strong> Schedule topics for spaced repetition. Return to <strong>Hard</strong> topics after 1-2 days, <strong>Medium</strong> after 4 days, and <strong>Easy</strong> after 7 days!
          </p>
        </div>
      </div>
    </div>
  );
}
