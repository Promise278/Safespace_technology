import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StorySkeleton } from "../../components/Skeleton";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../../config";

interface Story {
  id: string;
  title: string;
  description: string;
  username: string;
  userId: string;
  createdAt: string;
  supportsCount?: number;
  isSupported?: boolean;
}

export default function HomeScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("User");
  const [role, setRole] = useState("sharer");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
    fetchStories();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem("safespace_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username);
        setRole(user.role || user.roles || "sharer");
        setCurrentUserId(user.id);
      } catch (err) {
        console.error("Error parsing user:", err);
      }
    }
  };

  const fetchStories = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("safespace_token");
      const res = await fetch(`${API_BASE}/stories/seeAllstories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStories(data.data || []);
      }
    } catch (err) {
      console.error("Fetch stories err", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async (storyId: string) => {
    try {
      const token = await AsyncStorage.getItem("safespace_token");
      if (!token) return;
      
      const res = await fetch(`${API_BASE}/supports/${storyId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStories(prev => prev.map(s => {
          if (s.id === storyId) {
             const isCurrentlySupported = s.isSupported;
             return {
               ...s,
               isSupported: !isCurrentlySupported,
               supportsCount: isCurrentlySupported ? (s.supportsCount || 0) - 1 : (s.supportsCount || 0) + 1
             };
          }
          return s;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageSharer = async (sharerId: string) => {
    try {
      const token = await AsyncStorage.getItem("safespace_token");
      const res = await fetch(`${API_BASE}/messages/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: sharerId }),
      });
      const data = await res.json();
      if (res.ok) {
        const sharer = stories.find(s => s.userId === sharerId);
        router.push({
          pathname: `/messages/[id]`,
          params: { id: sharerId, username: sharer?.username || "Sharer" }
        } as any);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("safespace_token");
    await AsyncStorage.removeItem("safespace_user");
    router.replace("/signin");
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
    <SafeAreaView className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      <StatusBar barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ──── HEADER ──── */}
        <View className="px-5 pt-2 pb-6 bg-white border-b border-gray-100">
          {/* Top Nav */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 items-center justify-center shadow-md shadow-orange-200">
                <Ionicons name="shield" size={24} color="white" />
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-900">SafeSpace</Text>
              </View>
            </View>

            {/* Top Right Icons */}
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.push("/messages" as any)} className="p-2">
                <MaterialCommunityIcons name="message-outline" size={22} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} className="p-2">
                <Ionicons name="log-out" size={22} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Section */}
          <View className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
            <Text className="text-gray-600 text-sm mb-1">Welcome back,</Text>
            <Text className="text-2xl font-bold text-gray-900 mb-1">{username} 👋</Text>
            <Text className="text-xs text-gray-600 capitalize">
              {role === "sharer" ? "Story Sharer" : "Supporter"} • Ready to help
            </Text>
          </View>
        </View>

        {/* ──── ACTION BUTTON ──── */}
        <View className="px-5 py-6">
          <TouchableOpacity 
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl py-4 flex-row items-center justify-center gap-2 shadow-lg shadow-orange-300 active:opacity-90"
            onPress={() => router.push("/modal")}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white font-bold text-lg">
              {role === "sharer" ? "Share Your Story" : "Find Stories"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ──── STORIES SECTION ──── */}
        <View className="px-5 pb-10">
          {/* Title */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-gray-900">
              {role === "sharer" ? "Get Support" : "Stories to Support"}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              {loading ? "Loading..." : `${stories.length} stories`}
            </Text>
          </View>

          {/* Stories */}
          {loading ? (
            <View className="gap-4">
              <StorySkeleton />
              <StorySkeleton />
              <StorySkeleton />
            </View>
          ) : stories.length === 0 ? (
            <View className="py-12 items-center justify-center bg-gray-50 rounded-2xl">
              <Ionicons name="paper-plane" size={48} color="#ccc" />
              <Text className="text-gray-400 mt-3 text-center font-medium">
                No stories yet. Be the first to share!
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {stories.map((story) => (
                <View key={story.id} className="bg-white rounded-2xl p-4 shadow-sm shadow-gray-200 border border-gray-100">
                  {/* User Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <View className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 items-center justify-center">
                        <Text className="text-white font-bold text-sm">
                          {story.username.substring(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-gray-900">{story.username}</Text>
                        <Text className="text-xs text-gray-500">{timeAgo(story.createdAt)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Story Content */}
                  <Text className="text-base font-bold text-gray-900 mb-2 leading-snug">
                    {story.title}
                  </Text>
                  <Text className="text-sm text-gray-700 mb-4 leading-relaxed">
                    {story.description.substring(0, 150)}
                    {story.description.length > 150 ? "..." : ""}
                  </Text>

                  {/* Actions */}
                  <View className="flex-row items-center gap-3 border-t border-gray-100 pt-3">
                    <TouchableOpacity 
                      className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-gray-50 rounded-lg active:bg-gray-100"
                      onPress={() => handleSupport(story.id)}
                    >
                      <Ionicons 
                        name={story.isSupported ? "heart" : "heart-outline"} 
                        size={18} 
                        color={story.isSupported ? "#f97316" : "#666"} 
                      />
                      <Text className={`text-xs font-semibold ${story.isSupported ? "text-orange-500" : "text-gray-700"}`}>
                        {story.supportsCount || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-orange-50 rounded-lg active:bg-orange-100"
                      onPress={() => router.push(`/comments/${story.id}` as any)}
                    >
                      <MaterialCommunityIcons name="comment-outline" size={18} color="#f97316" />
                      <Text className="text-xs font-semibold text-orange-600">Respond</Text>
                    </TouchableOpacity>

                    {role === "supporter" && story.userId !== currentUserId && (
                      <TouchableOpacity 
                        className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-gray-50 rounded-lg active:bg-gray-100"
                        onPress={() => handleMessageSharer(story.userId)}
                      >
                        <Ionicons name="mail-outline" size={18} color="#666" />
                        <Text className="text-xs font-semibold text-gray-700">Chat</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
