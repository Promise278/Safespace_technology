import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStories((prev) =>
          prev.map((s) => {
            if (s.id === storyId) {
              const isCurrentlySupported = s.isSupported;
              return {
                ...s,
                isSupported: !isCurrentlySupported,
                supportsCount: isCurrentlySupported
                  ? (s.supportsCount || 0) - 1
                  : (s.supportsCount || 0) + 1,
              };
            }
            return s;
          }),
        );
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: sharerId }),
      });
      const data = await res.json();
      if (res.ok) {
        // Find if we have the username of the sharer
        const sharer = stories.find((s) => s.userId === sharerId);
        router.push({
          pathname: `/messages/[id]`,
          params: { id: sharerId, username: sharer?.username || "Sharer" },
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
    <ScrollView className="flex-1 bg-[#f9f4f2] px-4 pt-16">
      {/* NAVBAR */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-20 h-20 rounded-full flex items-center justify-center">
            <Image
              source={require("../../assets/images/safespace.care-removebg-preview.png")}
              style={{ width: 80, height: 80 }}
            />
          </View>
          <View className="ml-3">
            <Text className="text-xl font-bold text-neutral-800">
              SafeSpace
            </Text>
            <Text className="text-sm text-neutral-500">
              Welcome, {username}
            </Text>
          </View>
        </View>

        {/* Icons Right */}
        <View className="flex-row items-center gap-5">
          <Feather name="home" size={22} color="#ed835f" />
          <TouchableOpacity onPress={() => router.push("/messages" as any)}>
            <Feather name="message-square" size={22} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Feather name="log-out" size={22} color="#444" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        className="bg-[#ed835f] rounded-xl h-14 items-center justify-center mb-8"
        onPress={() => router.push("/modal")}
      >
        <Text className="text-white font-semibold text-lg">
          + Share Your Story
        </Text>
      </TouchableOpacity>

      {/* STORY LIST */}
      {loading ? (
        <View className="pb-20">
          <StorySkeleton />
          <StorySkeleton />
          <StorySkeleton />
        </View>
      ) : stories.length === 0 ? (
        <View className="py-10 items-center justify-center">
          <Text className="text-neutral-500">No stories shared yet.</Text>
        </View>
      ) : (
        <View className="pb-20">
          {stories.map((story) => (
            <View
              key={story.id}
              className="bg-white rounded-xl p-5 shadow-sm mb-4"
            >
              {/* Header */}
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full bg-[#f19469] items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {story.username.substring(0, 2).toUpperCase()}
                  </Text>
                </View>

                <View className="ml-3">
                  <Text className="text-base font-semibold text-neutral-800">
                    {story.username}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    {timeAgo(story.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Title */}
              <Text className="text-lg font-semibold text-neutral-900 mb-2">
                {story.title}
              </Text>

              {/* Body */}
              <Text className="text-base text-neutral-700 mb-5">
                {story.description}
              </Text>

              {/* Actions */}
              <View className="flex-row items-center gap-8 border-t border-neutral-100 pt-3">
                <TouchableOpacity
                  className="flex-row items-center gap-2"
                  onPress={() => handleSupport(story.id)}
                >
                  <Ionicons
                    name={story.isSupported ? "heart" : "heart-outline"}
                    size={20}
                    color={story.isSupported ? "#ed835f" : "#444"}
                  />
                  <Text
                    className={`text-neutral-700 ${story.isSupported ? "text-[#ed835f]" : ""}`}
                  >
                    Likes{" "}
                    {story.supportsCount ? `(${story.supportsCount})` : ""}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-2"
                  onPress={() => router.push(`/comments/${story.id}` as any)}
                >
                  <MaterialCommunityIcons
                    name="message-outline"
                    size={20}
                    color="#444"
                  />
                  <Text className="text-neutral-700">Respond</Text>
                </TouchableOpacity>

                {role === "supporter" &&
                  story.userId !==
                    (AsyncStorage.getItem("safespace_user") as any)?.id && (
                    <TouchableOpacity
                      className="flex-row items-center gap-2"
                      onPress={() => handleMessageSharer(story.userId)}
                    >
                      <Feather name="mail" size={18} color="#444" />
                      <Text className="text-neutral-700">Message</Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
