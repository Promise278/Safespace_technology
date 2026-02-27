import { Platform } from "react-native";

// YOUR LOCAL MACHINE IP — run `hostname -I` to find yours
// Android emulator: use 10.0.2.2 (special alias for host machine)
// Physical device (Android or iOS): use your machine's LAN IP e.g. 192.168.1.x
const LOCAL_IP = "https://safespace-technology-1.onrender.com"; // Your machine's LAN IP

export const API_BASE =
  Platform.OS === "android"
    ? `https://safespace-technology-1.onrender.com:5000`      // Android emulator
    : `http://${LOCAL_IP}:5000`;  // Physical device (iOS or Android via Expo Go)
