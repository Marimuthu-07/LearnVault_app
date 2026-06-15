import React, { useState, useEffect } from "react";
import { Topic, Difficulty, Status } from "../types";
import { X, Calendar, Edit2, Plus, Tag, HelpCircle, Check, Eye, Trash2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topicData: Omit<Topic, "id" | "userId" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  topic?: Topic | null; // If passed, we are EDITING
}

const CATEGORIES = [
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

export function TopicModal({ isOpen, onClose, onSave, onDelete, topic }: TopicModalProps) {
  // Controlled fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [status, setStatus] = useState<Status>(Status.Pending);
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [dateLearned, setDateLearned] = useState("");
  const [revisionDate, setRevisionDate] = useState("");
  
  // Note taking mode: write vs raw markdown preview
  const [noteMode, setNoteMode] = useState<"write" | "preview">("write");

  // Load input initial values if editing or standard base defaults
  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setCategory(topic.category);
      setDifficulty(topic.difficulty);
      setStatus(topic.status);
      setNotes(topic.notes);
      setTags(topic.tags || []);
      setDateLearned(topic.dateLearned ? topic.dateLearned.split("T")[0] : new Date().toISOString().split("T")[0]);
      setRevisionDate(topic.revisionDate ? topic.revisionDate.split("T")[0] : "");
    } else {
      // Clear for new creations
      setTitle("");
      setCategory("Computer Science");
      setDifficulty(Difficulty.Medium);
      setStatus(Status.Pending);
      setNotes("");
      setTags([]);
      const todayStr = new Date().toISOString().split("T")[0];
      setDateLearned(todayStr);
      // Auto-set 7 days from now as secondary
      const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      setRevisionDate(nextWeekStr);
    }
    setNoteMode("write");
  }, [topic, isOpen]);

  // Handle adding revision offsets automatically
  const setSpacedRepetitionInterval = (days: number) => {
    const baseDate = dateLearned ? new Date(dateLearned) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    setRevisionDate(baseDate.toISOString().split("T")[0]);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/,/g, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: topic?.id,
      title: title.trim(),
      category,
      difficulty,
      status,
      notes,
      tags,
      dateLearned,
      revisionDate: revisionDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="modal_container"
        className="w-full max-w-4xl bg-[#0E1524] border border-gray-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] toast-slide-enter"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0A0E1A]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              {topic ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </span>
            <h2 className="text-base font-semibold font-display text-gray-100">
              {topic ? `Edit Topic: ${topic.title}` : "Add New Learned Topic"}
            </h2>
          </div>
          <button
            onClick={onClose}
            id="btn_close_topic_modal"
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Topic specifics */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5 font-medium">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spaced Repetition Algorithms, Closure in JavaScript..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  id="input_topic_title"
                  className="w-full px-4 py-2.5 bg-[#121A2C] border border-gray-800 text-sm text-gray-100 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Grid: Category and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    id="select_topic_category"
                    className="w-full px-3 py-2.5 bg-[#121A2C] border border-gray-800 text-sm text-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0E1524]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5 font-medium">Difficulty</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#121A2C] p-1 border border-gray-800 rounded-xl">
                    {Object.values(Difficulty).map((diff) => {
                      const isSel = difficulty === diff;
                      return (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setDifficulty(diff)}
                          id={`btn_diff_${diff}`}
                          className={`py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                            isSel 
                              ? diff === Difficulty.Easy 
                                ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/25"
                                : diff === Difficulty.Medium
                                  ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/25"
                                  : "bg-red-500/20 text-red-300 font-bold border border-red-500/25"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {diff}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Date learned & Reminders */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date Learned</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateLearned}
                    onChange={(e) => setDateLearned(e.target.value)}
                    id="input_date_learned"
                    className="w-full px-3 py-2 bg-[#121A2C] border border-gray-800 text-sm text-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Revision Due</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={revisionDate}
                    onChange={(e) => setRevisionDate(e.target.value)}
                    id="input_date_revision"
                    className="w-full px-3 py-2 bg-[#121A2C] border border-gray-800 text-sm text-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Revision interval helper buttons */}
              <div>
                <span className="text-[10px] font-mono text-gray-500 mb-1.5 block">Spaced Repetition Scheduler Recommend:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSpacedRepetitionInterval(1)}
                    id="btn_set_rev_1"
                    className="px-2.5 py-1 text-[10px] font-mono bg-blue-500/5 hover:bg-blue-500/15 border border-blue-500/20 text-blue-400 rounded-md transition-colors"
                  >
                    +1 Day (Hard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpacedRepetitionInterval(4)}
                    id="btn_set_rev_4"
                    className="px-2.5 py-1 text-[10px] font-mono bg-[#14B8A6]/5 hover:bg-[#14B8A6]/15 border border-[#14B8A6]/20 text-[#14B8A6] rounded-md transition-colors"
                  >
                    +4 Days (Med)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpacedRepetitionInterval(7)}
                    id="btn_set_rev_7"
                    className="px-2.5 py-1 text-[10px] font-mono bg-[#8B5CF6]/5 hover:bg-[#8B5CF6]/15 border border-[#8B5CF6]/20 text-purple-400 rounded-md transition-colors"
                  >
                    +7 Days (Easy)
                  </button>
                </div>
              </div>

              {/* Status Segment */}
              <div>
                <label className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5 font-medium">Status Check</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(Status).map((st) => {
                    const isSel = status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        id={`btn_status_${st}`}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs rounded-xl border transition-all cursor-pointer ${
                          isSel
                            ? st === Status.Completed
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-medium"
                              : st === Status.Revising
                                ? "bg-purple-500/10 border-purple-500/40 text-purple-400 font-medium"
                                : "bg-amber-500/10 border-amber-500/40 text-amber-400 font-medium"
                            : "bg-[#111622] hover:bg-[#151D2F] border-gray-800 text-gray-400 hover:text-gray-300"
                        }`}
                      >
                        {isSel && <Check className="w-3.5 h-3.5" />}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Topic Tags (Press Enter / Comma)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#121A2C] border border-gray-800 rounded-xl min-h-[42px] items-center">
                  {tags.map((tg, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 bg-[#1A253C] border border-gray-800 py-0.5 px-2 text-[11px] text-gray-300 rounded-lg group"
                    >
                      <span>#{tg}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-gray-500 group-hover:text-red-400 text-xs focus:outline-none ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={tags.length === 0 ? "add key tags..." : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    id="input_topic_tags"
                    className="flex-1 bg-transparent border-none text-xs text-gray-200 focus:outline-none focus:ring-0 min-w-[100px] h-6"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Markdown notes notebook */}
            <div className="flex flex-col border border-gray-800/80 rounded-2xl bg-[#0B0F19] p-4 min-h-[300px] h-full md:h-[calc(100%)]">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-850/50">
                <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest block font-semibold">Notes (Markdown)</span>
                <div className="flex bg-[#121A2C] p-1 border border-gray-805/70 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setNoteMode("write")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      noteMode === "write" 
                        ? "bg-purple-600 text-gray-100 font-medium" 
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteMode("preview")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      noteMode === "preview" 
                        ? "bg-purple-600 text-gray-100 font-medium" 
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {noteMode === "write" ? (
                <div className="flex-1 flex flex-col space-y-1">
                  <textarea
                    placeholder="Document your study notes here using standard Markdown styles
# Core concept heading
Use **double asterisks** for bold statements.
Use `backticks` for inline codes.

- [ ] Interactive markdown task checkbox
- [x] Complete task
- Standard point bullet checklist"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    id="textarea_topic_notes"
                    className="w-full flex-1 min-h-[220px] bg-[#121A2C]/20 border border-transparent text-sm text-gray-250 placeholder:text-gray-650 rounded-xl focus:outline-none resize-none p-3 font-mono leading-relaxed"
                  />
                  <span className="text-[10px] font-mono text-gray-600 italic block pl-1">Supports spacing shortcuts, list bullets, code highlighting, and checklist tasks</span>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-2 py-1 max-h-[350px] md:max-h-[380px] bg-slate-900/10 rounded-xl border border-gray-850/50 p-2.5">
                  <MarkdownRenderer notesText={notes} />
                </div>
              )}
            </div>

          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-gray-800/80 pt-5 mt-4">
            <div>
              {topic && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this topic from your vault?")) {
                      onDelete(topic.id);
                    }
                  }}
                  id="btn_delete_topic"
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Topic</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-200 border border-gray-800 hover:bg-gray-800/40 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn_submit_topic"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-md shadow-purple-500/15 rounded-xl cursor-pointer transition-all"
              >
                {topic ? "Save Changes" : "Secure Topic into Vault"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
