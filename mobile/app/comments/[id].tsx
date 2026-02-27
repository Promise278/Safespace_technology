import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../../config";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  likesCount?: number;
  isLiked?: boolean;
}

export default function CommentsScreen() {
  const { id } = useLocalSearchParams();
  const storyId = Array.isArray(id) ? id[0] : id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("safespace_token");
        const res = await fetch(`${API_BASE}/comments/${storyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setComments(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (storyId) fetchComments();
  }, [storyId]);

  const handleLikeComment = async (commentId: string) => {
    try {
      const token = await AsyncStorage.getItem("safespace_token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/supports/comment/${commentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            const alreadyLiked = c.isLiked;
            if (alreadyLiked) return c; // Backend currently only allows one-way like
            return {
              ...c,
              isLiked: true,
              likesCount: (c.likesCount || 0) + 1
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("safespace_token");
      const res = await fetch(`${API_BASE}/comments/${storyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: newComment })
      });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => [...prev, data.data]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Responses</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1 bg-gray-50 px-4 pt-4 pb-20">
          {loading ? (
            <ActivityIndicator size="small" color="#ed835f" className="mt-8" />
          ) : comments.length === 0 ? (
            <Text className="text-center text-gray-500 mt-10">No responses yet. Be the first to share your thoughts!</Text>
          ) : (
            comments.map(comment => (
              <View key={comment.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                <View className="flex-row items-center justify-between xl:justify-start mb-2">
                  <Text className="text-sm font-semibold text-gray-900">{comment.user?.username || "Unknown"}</Text>
                  <Text className="text-xs text-gray-500 xl:ml-3">{timeAgo(comment.createdAt)}</Text>
                </View>
                <Text className="text-base text-gray-800 mb-2">{comment.content}</Text>
                
                {/* Like Button */}
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => handleLikeComment(comment.id)}
                >
                  <Ionicons 
                    name={comment.isLiked ? "heart" : "heart-outline"} 
                    size={16} 
                    color={comment.isLiked ? "#ed835f" : "#666"} 
                  />
                  <Text className={`ml-1 text-xs ${comment.isLiked ? "text-[#ed835f] font-semibold" : "text-gray-500"}`}>
                    {comment.likesCount || 0}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Bar */}
        <View className="flex-row items-end px-4 py-3 bg-white border-t border-gray-100 pb-8">
          <TextInput
            className="flex-1 bg-gray-100 rounded-2xl min-h-[46px] max-h-[100px] px-4 pt-3 pb-3 text-base text-gray-800"
            placeholder="Type your response..."
            multiline
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity 
            className={`w-11 h-11 ml-3 rounded-full items-center justify-center ${newComment.trim() ? "bg-[#ed835f]" : "bg-gray-300"}`}
            disabled={!newComment.trim() || submitting}
            onPress={handlePostComment}
          >
            {submitting ? (
               <ActivityIndicator color="white" size="small" />
            ) : (
               <Ionicons name="send" size={18} color="white" style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
