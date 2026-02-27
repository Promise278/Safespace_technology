import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { API_BASE } from "../../config";

interface RadioButtonCardProps {
  type: string;
  title: string;
  subtitle: string;
  userType: string[];
  onSelect: (selected: string) => void;
}

const RadioButtonCard: React.FC<RadioButtonCardProps> = ({
  type,
  title,
  subtitle,
  userType,
  onSelect,
}) => {
  const isSelected = userType.includes(type);

  const cardClasses = isSelected
    ? "border-orange-500 bg-orange-100"
    : "border-gray-300 bg-white";

  const radioCircleClasses = isSelected
    ? "border-orange-500"
    : "border-gray-300";

  return (
    <TouchableOpacity
      className={`border rounded-lg p-4 mb-3 ${cardClasses}`}
      onPress={() => onSelect(type)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View
          className={`h-5 w-5 rounded-full border-2 items-center justify-center mt-0.5 mr-3 ${radioCircleClasses}`}
        >
          {isSelected && (
            <View className="h-3 w-3 rounded-full bg-orange-500" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-1">
            {title}
          </Text>
          <Text className="text-sm text-gray-500">{subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Signup() {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Multi-select toggle function
  const toggleUserType = (type: string) => {
    setUserType((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]                
    );
  };

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password || userType.length === 0) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    try {
      const role = userType.includes("share") && userType.includes("support") 
        ? "both" 
        : userType[0];

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert("Success", "Account created successfully. Please sign in.");
        router.push("/signin");
      } else {
        Alert.alert("Signup Failed", data.message || "Failed to create account");
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

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center px-5 py-6">

          {/* Header */}
          <View className="items-center mb-6">
            <View className="bg-orange-500 rounded-full p-2 mb-3">
              <Ionicons name="shield-outline" size={30} color="#FFF" />
            </View>

            <Text className="text-2xl font-bold text-gray-900">SafeSpace</Text>
            <Text className="text-sm text-gray-600 mt-0.5">
              A safe place to share and heal
            </Text>
          </View>

          {/* Form Card */}
          <View className="w-full max-w-md bg-white rounded-xl p-6 shadow-md shadow-gray-300">
            <Text className="text-xl font-semibold text-gray-900">
              Join SafeSpace
            </Text>

            <Text className="text-sm text-gray-600 mt-1 mb-4">
              Create an account to share or provide support
            </Text>

            {/* Username */}
            <Text className="text-base font-medium text-gray-800 mb-2">
              Username
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 mb-4"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {/* User Type Selection */}
            <Text className="text-base font-medium text-gray-800 mb-2">
              I want to:
            </Text>

            <RadioButtonCard
              type="share"
              title="Share my story"
              subtitle="Seek support and connect with others"
              userType={userType}
              onSelect={toggleUserType}
            />

            <RadioButtonCard
              type="support"
              title="Provide support"
              subtitle="Help others and offer comfort"
              userType={userType}
              onSelect={toggleUserType}
            />

            {/* Email */}
            <Text className="text-base font-medium text-gray-800 mb-2 mt-4">
              Email
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 mb-4"
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
              className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 mb-4"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Submit Button */}
            <TouchableOpacity
              className={`rounded-xl py-4 items-center mt-4 ${loading ? 'bg-orange-300' : 'bg-orange-500'}`}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text className="text-lg font-semibold text-white">
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="flex-row mt-6 mb-4">
            <Text className="text-base text-gray-600">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/signin")}>
              <Text className="text-base font-semibold text-orange-500 ml-1">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}