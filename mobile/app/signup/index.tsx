import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { API_BASE } from "../../config";

interface RadioButtonCardProps {
  type: string;
  title: string;
  subtitle: string;
  userType: string;
  onSelect: (selected: string) => void;
}

const RadioButtonCard: React.FC<RadioButtonCardProps> = ({
  type,
  title,
  subtitle,
  userType,
  onSelect,
}) => {
  const isSelected = userType === type;

  const cardClasses = isSelected
    ? "border-orange-500 bg-orange-100"
    : "border-gray-300 bg-white";

  const radioCircleClasses = isSelected
    ? "border-orange-500"
    : "border-gray-300";

  return (
    <TouchableOpacity
      className={`border rounded-lg p-3 mb-2 ${cardClasses}`}
      onPress={() => onSelect(type)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View
          className={`h-4 w-4 rounded-full border-2 items-center justify-center mt-0.5 mr-2 ${radioCircleClasses}`}
        >
          {isSelected && (
            <View className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-800">{title}</Text>
          <Text className="text-xs text-gray-500">{subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Signup() {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Single-select function
  const selectUserType = (type: string) => {
    setUserType(type === userType ? "" : type);
  };

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password || !userType) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // Map UI values to backend roles
      const roleMap: { [key: string]: string } = {
        share: "sharer",
        support: "supporter",
      };

      const role = roleMap[userType];

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
        Alert.alert(
          "Signup Failed",
          data.message || "Failed to create account",
        );
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-gray-50 to-white mt-8">
      <StatusBar barStyle="dark-content" />

      <View className="flex-1 px-4 py-2">
        {/* Logo */}
        <View className="items-center mb-3">
          <View className="w-20 h-20 rounded-full flex items-center justify-center">
            <Image
              source={require("../../assets/images/safespace.care-removebg-preview.png")}
              style={{ width: 120, height: 120 }}
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900 pt-2">SafeSpace</Text>
          <Text className="text-sm text-gray-600 mt-1">
            A safe place to share and heal
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-white rounded-xl p-4 shadow-sm shadow-gray-300 gap-y-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            Join SafeSpace
          </Text>
          <Text className="text-sm text-gray-600 mb-3">Create an account</Text>

          {/* Username */}
          <Text className="text-xs font-semibold text-gray-800 mb-1">
            Username
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-3 text-sm mb-2 bg-gray-50"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />

          {/* User Type Selection */}
          <Text className="text-xs font-semibold text-gray-800 mb-1.5">
            I want to:
          </Text>

          <RadioButtonCard
            type="share"
            title="Share my story"
            subtitle="Seek support"
            userType={userType}
            onSelect={selectUserType}
          />

          <RadioButtonCard
            type="support"
            title="Provide support"
            subtitle="Help others"
            userType={userType}
            onSelect={selectUserType}
          />

          {/* Email */}
          <Text className="text-xs font-semibold text-gray-800 mb-1 mt-2">
            Email
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-3 text-sm mb-2 bg-gray-50"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Password */}
          <Text className="text-xs font-semibold text-gray-800 mb-1">
            Password
          </Text>
          <View className="relative mb-3">
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 text-sm bg-gray-50 pr-10"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            <TouchableOpacity
              className="absolute right-2 top-2"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-lg py-3 items-center mb-2 ${loading ? "bg-orange-300" : "bg-orange-500 active:bg-orange-600"}`}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-sm font-semibold text-white">
              {loading ? "Creating..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-gray-700">Have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signin")}>
              <Text className="text-sm text-orange-500 font-semibold">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
