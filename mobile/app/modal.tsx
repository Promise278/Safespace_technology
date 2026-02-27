import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../config";

export default function CreateStoryModal() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill out both the title and your story.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("safespace_token");
      if (!token) {
        Alert.alert("Authentication Error", "You are not logged in.");
        return;
      }

      const res = await fetch(`${API_BASE}/stories/createstories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, isAnonymous }),
      });
      
      const data = await res.json();
      if (res.ok) {
        router.back();
      } else {
        Alert.alert("Error Posting Story", data.message || "Failed to share your story.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Unable to share your story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text className="text-gray-500 text-base">Cancel</Text>
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-gray-900">Share Story</Text>
        
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading || !title.trim() || !description.trim()}
        >
          {loading ? (
             <ActivityIndicator color={"#ed835f"} size="small" />
          ) : (
             <Text className={`font-semibold text-base ${title.trim() && description.trim() ? "text-[#ed835f]" : "text-gray-300"}`}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <View className="flex-1 px-4 py-5">
        <TextInput
          className="text-2xl font-bold text-gray-900 mb-4"
          placeholder="Give your story a title..."
          placeholderTextColor="#a1a1aa"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          className="flex-1 text-base text-gray-700 mt-2"
          placeholder="What do you want to share with the SafeSpace community today?"
          placeholderTextColor="#a1a1aa"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Anonymous Toggle Footer */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100 mb-8">
        <View className="flex-row items-center flex-1 pr-4">
          <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
             <Ionicons name="eye-off-outline" size={22} color="#ed835f" />
          </View>
          <View>
            <Text className="text-base font-semibold text-gray-800">Share as Anonymous</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Hide your identity on this post.</Text>
          </View>
        </View>
        <Switch 
          value={isAnonymous} 
          onValueChange={setIsAnonymous}
          trackColor={{ false: "#e4e4e7", true: "#fbcfe8" }}
          thumbColor={isAnonymous ? "#ed835f" : "#f4f3f4"}
        />
      </View>
    </SafeAreaView>
  );
}
