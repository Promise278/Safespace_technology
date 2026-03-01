import "./global.css"
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
 
export default function App() {
  const router = useRouter();
  return (
    <View className="flex-1 gap-y-4 items-center justify-center bg-white">
      <View className="flex items-center gap-3">
        <View className="w-20 h-20 rounded-full flex items-center justify-center">
          <Image source={require('../assets/images/safespace.care-removebg-preview.png')} style={{ width: 120, height: 120 }} />
        </View>
        <Text className="text-4xl font-display font-bold text-foreground pt-4">SafeSpace</Text>
      </View>
      <View>
        <Text className="text-center text-xl pt-4 text-gray-500"> A safe community platform for youth affected by gender-based violence</Text>
      </View>
      <TouchableOpacity onPress={() => router.push("/signup")} className="bg-[#ed835f] rounded-full h-16 w-48 justify-center items-center mt-8">
        <Text className="text-white text-xl">Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity 
          onPress={() => router.push("/signin")} 
          className="mt-6"
        >
          <Text className="text-gray-700 text-base">
            Already have an account? <Text className="text-orange-500 font-semibold">Sign In</Text>
          </Text>
        </TouchableOpacity>
    </View>
  );
}