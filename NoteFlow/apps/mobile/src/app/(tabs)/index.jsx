import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Plus,
  Search,
  Trash2,
  Clock,
  Tag,
  Sparkles,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import useHandleStreamResponse from "@/utils/useHandleStreamResponse";

const CATEGORIES = ["Personal", "Work", "Ideas"];

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  // Save Note Mutation
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
      setIsEditorOpen(false);
      setEditingNote(null);
      setSummary("");
      setStreamingSummary("");
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
    },
  });

  const handleSummaryFinish = useCallback((message) => {
    setSummary(message);
    setStreamingSummary("");
    setIsSummarizing(false);
  }, []);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingSummary,
    onFinish: handleSummaryFinish,
  });

  const handleSummarize = useCallback(async () => {
    if (!editingNote?.content || editingNote.content.trim() === "") {
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
      setIsSummarizing(false);
    }
  }, [editingNote, handleStreamResponse]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesCategory =
        selectedCategory === "All" || note.category === selectedCategory;
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content &&
          note.content.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleEdit = (note) => {
    setEditingNote(note);
    setSummary("");
    setStreamingSummary("");
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingNote({ title: "", content: "", category: "Personal" });
    setSummary("");
    setStreamingSummary("");
    setIsEditorOpen(true);
  };

  const handleDelete = (id) => {
    deleteNoteMutation.mutate(id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: "700",
            color: "#FFFFFF",
            marginBottom: 20,
          }}
        >
          NoteFlow
        </Text>

        {/* Search Bar with Liquid Glass */}
        <GlassView
          isInteractive={false}
          style={[
            { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
            !isLiquidGlassAvailable() && {
              opacity: 0.7,
              backgroundColor: "#1C1C1E",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Search size={18} color="#8E8E93" />
            <TextInput
              placeholder="Search notes..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: "#FFFFFF",
              }}
            />
          </View>
        </GlassView>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={() => setSelectedCategory("All")}>
              <GlassView
                isInteractive={true}
                style={[
                  {
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                  },
                  !isLiquidGlassAvailable() && {
                    opacity: 0.8,
                    backgroundColor:
                      selectedCategory === "All" ? "#3478F6" : "#1C1C1E",
                  },
                ]}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}
                >
                  All
                </Text>
              </GlassView>
            </TouchableOpacity>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
              >
                <GlassView
                  isInteractive={true}
                  style={[
                    {
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 20,
                    },
                    !isLiquidGlassAvailable() && {
                      opacity: 0.8,
                      backgroundColor:
                        selectedCategory === cat ? "#3478F6" : "#1C1C1E",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {cat}
                  </Text>
                </GlassView>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Notes List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotes.map((note) => (
          <TouchableOpacity
            key={note.id}
            onPress={() => handleEdit(note)}
            style={{ marginBottom: 16 }}
          >
            <GlassView
              isInteractive={true}
              style={[
                { borderRadius: 20, padding: 20 },
                !isLiquidGlassAvailable() && {
                  opacity: 0.8,
                  backgroundColor: "#1C1C1E",
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    {note.category}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(note.id)}>
                  <Trash2 size={18} color="#FF453A" />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  marginBottom: 8,
                }}
              >
                {note.title}
              </Text>
              <Text
                style={{ fontSize: 14, color: "#8E8E93", marginBottom: 12 }}
                numberOfLines={2}
              >
                {note.content || "No content"}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Clock size={12} color="#8E8E93" />
                <Text style={{ fontSize: 12, color: "#8E8E93" }}>
                  {format(new Date(note.updated_at), "MMM d, h:mm a")}
                </Text>
              </View>
            </GlassView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreate}
        style={{ position: "absolute", bottom: 80, right: 20 }}
      >
        <GlassView
          isInteractive={true}
          style={[
            {
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
            },
            !isLiquidGlassAvailable() && {
              opacity: 0.9,
              backgroundColor: "#3478F6",
            },
          ]}
        >
          <Plus size={28} color="#FFFFFF" />
        </GlassView>
      </TouchableOpacity>

      {/* Editor Modal */}
      <Modal
        visible={isEditorOpen}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
          <StatusBar style="light" />

          {/* Modal Header */}
          <View
            style={{
              paddingTop: insets.top + 20,
              paddingHorizontal: 20,
              paddingBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <TouchableOpacity onPress={() => setIsEditorOpen(false)}>
                <Text
                  style={{ fontSize: 17, color: "#3478F6", fontWeight: "600" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: 17, fontWeight: "600", color: "#FFFFFF" }}
              >
                {editingNote?.id ? "Edit Note" : "New Note"}
              </Text>
              <TouchableOpacity
                onPress={() => saveNoteMutation.mutate(editingNote)}
                disabled={saveNoteMutation.isPending}
              >
                <Text
                  style={{ fontSize: 17, color: "#3478F6", fontWeight: "600" }}
                >
                  {saveNoteMutation.isPending ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Selection */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setEditingNote((prev) => ({ ...prev, category: cat }))
                    }
                  >
                    <GlassView
                      isInteractive={true}
                      style={[
                        {
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 16,
                        },
                        !isLiquidGlassAvailable() && {
                          opacity: 0.8,
                          backgroundColor:
                            editingNote?.category === cat
                              ? "#3478F6"
                              : "#1C1C1E",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                      >
                        {cat}
                      </Text>
                    </GlassView>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Editor Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          >
            <TextInput
              placeholder="Note Title"
              placeholderTextColor="#8E8E93"
              value={editingNote?.title || ""}
              onChangeText={(text) =>
                setEditingNote((prev) => ({ ...prev, title: text }))
              }
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: 20,
              }}
              autoFocus
            />
            <TextInput
              placeholder="Start writing..."
              placeholderTextColor="#8E8E93"
              value={editingNote?.content || ""}
              onChangeText={(text) =>
                setEditingNote((prev) => ({ ...prev, content: text }))
              }
              multiline
              style={{
                fontSize: 16,
                color: "#FFFFFF",
                minHeight: 200,
                lineHeight: 24,
              }}
            />

            {/* AI Summarize Button */}
            <TouchableOpacity
              onPress={handleSummarize}
              disabled={isSummarizing || !editingNote?.content}
              style={{ marginTop: 24 }}
            >
              <GlassView
                isInteractive={true}
                style={[
                  {
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  },
                  !isLiquidGlassAvailable() && {
                    opacity: 0.9,
                    backgroundColor: "#8E44AD",
                  },
                  (!editingNote?.content || isSummarizing) && { opacity: 0.5 },
                ]}
              >
                <Sparkles size={18} color="#FFFFFF" />
                <Text
                  style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}
                >
                  {isSummarizing ? "Summarizing..." : "AI Summarize"}
                </Text>
              </GlassView>
            </TouchableOpacity>

            {/* Summary Display */}
            {(summary || streamingSummary) && (
              <View
                style={{
                  marginTop: 24,
                  backgroundColor: "rgba(138, 68, 173, 0.2)",
                  padding: 20,
                  borderRadius: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Sparkles size={16} color="#BB86FC" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#BB86FC",
                    }}
                  >
                    AI Summary
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 14, color: "#FFFFFF", lineHeight: 20 }}
                >
                  {summary || streamingSummary}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
