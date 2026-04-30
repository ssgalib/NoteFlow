"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Trash2,
  MoreVertical,
  Clock,
  Tag,
  Archive,
  Star,
  Hash,
  Filter,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Toaster, toast } from "sonner";
import useHandleStreamResponse from "@/utils/useHandleStreamResponse";

// Mock Categories for Sidebar
const CATEGORIES = [
  { id: "all", name: "All Notes", icon: Archive },
  { id: "Personal", name: "Personal", icon: Hash },
  { id: "Work", name: "Work", icon: Hash },
  { id: "Ideas", name: "Ideas", icon: Hash },
];

export default function NotesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [summary, setSummary] = useState("");
  const [streamingSummary, setStreamingSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const queryClient = useQueryClient();

  // Fetch Notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("/api/notes");
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
  });

  // Create/Update Note Mutation
  const saveNoteMutation = useMutation({
    mutationFn: async (note) => {
      const method = note.id ? "PATCH" : "POST";
      const url = note.id ? `/api/notes/${note.id}` : "/api/notes";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });
      if (!res.ok) throw new Error("Failed to save note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success(editingNote ? "Note updated" : "Note created");
      setIsEditorOpen(false);
      setEditingNote(null);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted");
    },
  });

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesCategory =
        selectedCategory === "all" || note.category === selectedCategory;
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content &&
          note.content.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleEdit = (note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const handleCreate = () => {
    setEditingNote({ title: "", content: "", category: "Personal" });
    setIsEditorOpen(true);
  };

  const handleSummaryFinish = useCallback((message) => {
    setSummary(message);
    setStreamingSummary("");
    setIsSummarizing(false);
    toast.success("Summary generated");
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingSummary,
    onFinish: handleSummaryFinish,
  });

  const handleSummarize = useCallback(async () => {
    if (!editingNote?.content || editingNote.content.trim() === "") {
      toast.error("Add some content to summarize");
      return;
    }

    setIsSummarizing(true);
    setSummary("");
    setStreamingSummary("");

    try {
      const response = await fetch(
        "/integrations/anthropic-claude-sonnet-4-5/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Please provide a concise summary of the following note in 2-3 sentences:\n\n${editingNote.content}`,
              },
            ],
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      handleStreamResponse(response);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate summary");
      setIsSummarizing(false);
    }
  }, [editingNote, handleStreamResponse]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 font-inter overflow-hidden">
      <Toaster position="top-right" />

      {/* Sidebar - Liquid Glass */}
      <aside className="w-64 bg-white/60 backdrop-blur-xl border-r border-white/50 flex flex-col hidden md:flex shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-500/90 rounded-lg flex items-center justify-center text-white font-semibold backdrop-blur-sm">
              N
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              NoteFlow
            </span>
          </div>

          <div className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-500/20 text-blue-700 backdrop-blur-sm border border-blue-300/30"
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900 backdrop-blur-sm"
                }`}
              >
                <cat.icon size={18} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/30">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 font-medium bg-white/40 backdrop-blur-sm rounded-xl">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
            Cloud Synced
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header - Liquid Glass */}
        <header className="bg-white/50 backdrop-blur-xl border-b border-white/50 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/40 border border-white/50 focus:bg-white/70 focus:border-blue-300/50 rounded-xl text-sm outline-none transition-all backdrop-blur-sm placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white/50 rounded-full transition-colors backdrop-blur-sm">
              <Filter size={20} />
            </button>
            <button
              onClick={handleCreate}
              className="bg-blue-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-600/90 transition-colors flex items-center gap-2 backdrop-blur-sm shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} /> New Note
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {CATEGORIES.find((c) => c.id === selectedCategory)?.name ||
                  "Notes"}
              </h2>
              <div className="text-sm text-gray-500 font-medium bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {filteredNotes.length} notes
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-white/40 rounded-2xl border border-white/50 backdrop-blur-sm"
                  />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 mb-4 border border-white/50">
                  <Archive size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  No notes found
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try a different search or create your first note.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleEdit(note)}
                    className="group bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 cursor-pointer hover:bg-white/70 hover:border-white/60 transition-all flex flex-col shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-500/10 border border-blue-300/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider inline-flex items-center gap-1 backdrop-blur-sm">
                        <Tag size={10} />
                        {note.category}
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, note.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all backdrop-blur-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {note.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                      {note.content || "No content provided."}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/30">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Clock size={12} />
                        {format(new Date(note.updated_at), "MMM d, h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Editor Modal Overlay - Liquid Glass */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white/80 backdrop-blur-xl w-full max-w-2xl rounded-3xl border border-white/50 shadow-2xl shadow-blue-500/10 animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <header className="px-6 py-4 border-b border-white/30 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsEditorOpen(false);
                    setSummary("");
                    setStreamingSummary("");
                  }}
                  className="p-2 hover:bg-white/60 rounded-full transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingNote?.id ? "Edit Note" : "Create Note"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setEditingNote((prev) => ({
                          ...prev,
                          category: cat.id,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        (editingNote?.category || "Personal") === cat.id
                          ? "bg-blue-500/20 text-blue-700 border-blue-300/50 backdrop-blur-sm"
                          : "bg-white/40 text-gray-600 border-white/40 hover:bg-white/60 backdrop-blur-sm"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-white/30 to-white/10">
              <input
                type="text"
                placeholder="Note Title"
                value={editingNote?.title || ""}
                onChange={(e) =>
                  setEditingNote((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full text-3xl font-semibold text-gray-900 placeholder-gray-400 outline-none tracking-tight bg-transparent"
                autoFocus
              />
              <textarea
                placeholder="Start writing your thoughts here..."
                value={editingNote?.content || ""}
                onChange={(e) =>
                  setEditingNote((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                className="w-full h-64 text-base text-gray-600 placeholder-gray-400 outline-none resize-none leading-relaxed bg-transparent"
              />

              {/* AI Summarize Button */}
              <div className="flex items-center justify-between pt-4 border-t border-white/30">
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing || !editingNote?.content}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500/90 to-blue-500/90 text-white hover:from-purple-600/90 hover:to-blue-600/90 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                  <Sparkles size={16} />
                  {isSummarizing ? "Summarizing..." : "AI Summarize"}
                </button>
              </div>

              {/* Summary Display */}
              {(summary || streamingSummary) && (
                <div className="bg-gradient-to-br from-purple-100/60 to-blue-100/60 backdrop-blur-md border border-purple-200/50 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-purple-600" />
                    <h4 className="text-sm font-semibold text-purple-900">
                      AI Summary
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {summary || streamingSummary}
                    {isSummarizing && (
                      <span className="inline-block w-1 h-4 bg-purple-600 ml-1 animate-pulse" />
                    )}
                  </p>
                </div>
              )}
            </div>

            <footer className="px-8 py-6 border-t border-white/30 bg-white/40 backdrop-blur-sm flex items-center justify-between">
              <div className="text-xs text-gray-500 font-medium">
                {editingNote?.updated_at
                  ? `Last edited ${format(new Date(editingNote.updated_at), "MMM d, yyyy")}`
                  : "New note will be saved to cloud"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-6 py-2 rounded-full text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-all border border-white/40 hover:border-white/60 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveNoteMutation.mutate(editingNote)}
                  disabled={saveNoteMutation.isPending}
                  className="bg-blue-500/90 text-white px-8 py-2 rounded-full text-sm font-semibold hover:bg-blue-600/90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 backdrop-blur-sm"
                >
                  {saveNoteMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Mobile FAB - Liquid Glass */}
      <button
        onClick={handleCreate}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-500/90 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-600/90 transition-colors z-40 backdrop-blur-sm border border-white/30"
      >
        <Plus size={24} />
      </button>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Liquid Glass Enhancements */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Smooth scrolling */
        .scroll-smooth {
          scroll-behavior: smooth;
        }

        /* Backdrop blur fallback */
        @supports not (backdrop-filter: blur(12px)) {
          .backdrop-blur-sm {
            background-color: rgba(255, 255, 255, 0.9) !important;
          }
          .backdrop-blur-md {
            background-color: rgba(255, 255, 255, 0.85) !important;
          }
          .backdrop-blur-xl {
            background-color: rgba(255, 255, 255, 0.8) !important;
          }
        }
      `}</style>
    </div>
  );
}
