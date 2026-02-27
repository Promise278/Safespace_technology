import "./global.css"
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
// import { router } from "expo-router";
 
export default function App() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="flex items-center gap-3">
        <View className="w-20 h-20 rounded-full bg-[#f19469] flex items-center justify-center">
          <Ionicons name="shield" size={48} color="white" />
        </View>
        <Text className="text-4xl font-display font-bold text-foreground">SafeSpace</Text>
      </View>
      <TouchableOpacity onPress={() => router.push("/signup")} className="bg-[#ed835f] rounded-full h-16 w-48 justify-center items-center mt-8">
        <Text className="text-white text-xl">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}