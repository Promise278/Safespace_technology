import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../../config";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        await AsyncStorage.setItem("safespace_token", data.token);
        if (data.user) {
           await AsyncStorage.setItem("safespace_user", JSON.stringify(data.user));
        }
        router.push("/home");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" />

      <View className="flex-1 items-center px-5 mt-12">
        {/* Header */}
        <View className="items-center py-8">
          <View className="bg-orange-500 rounded-full p-2 mb-3">
            <Ionicons name="shield-outline" size={30} color="#FFF" />
          </View>

          <Text className="text-2xl font-bold text-gray-900">SafeSpace</Text>

          <Text className="text-sm text-gray-600 mt-0.5">
            A safe place to share and heal
          </Text>
        </View>

        {/* Form */}
        <View className="w-full bg-white rounded-xl p-6 shadow-md shadow-gray-300">
          <Text className="text-xl font-semibold text-gray-900">
            Join SafeSpace
          </Text>

          <Text className="text-sm text-gray-600 mt-1 mb-8">
           Login to your account to share or provide support
          </Text>

          {/* Email */}
          <Text className="text-base font-medium text-gray-800 mb-2">
            Email
          </Text>

          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 mb-8"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Text className="text-base font-medium text-gray-800 mb-2">
            Password
          </Text>

          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 mb-8"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Create Account Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mt-5 mb-2 ${loading ? 'bg-orange-300' : 'bg-orange-500'}`}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text className="text-lg font-semibold text-white">
              {loading ? "Logging in..." : "Log In"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row mt-6">
          <Text className="text-base text-gray-600">
            Dont have an account?
          </Text>

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-base font-semibold text-orange-500 ml-1">
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}