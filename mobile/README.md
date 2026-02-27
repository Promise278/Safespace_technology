# SafeSpace Mobile (React Native / Expo)
SafeSpace Mobile is the React Native / Expo client for SafeSpace. It delivers the same anonymous, supportive environment as the web app, optimized for mobile devices.

## Features
### Mobile Story Feed
* Scrollable feed of stories from Sharers.
* Supporters can react, comment, and open 1:1 chats.

### Sharer & Supporter Roles
* Role-aware navigation and screens.
* Authenticated views mirror backend permissions.

### Real-Time Chat
* Socket.IO client for instant messaging between Sharers and Supporters.

### Smooth Mobile UX
* Built with Expo Router (file-based navigation).
* Styled using NativeWind (Tailwind CSS for React Native).
* Skeleton loaders, pull-to-refresh, and bottom tabs.
* Icons via Expo Vector Icons (Feather, Ionicons, etc.).

## Tech Stack
* Framework: React Native (Expo)
* Navigation: Expo Router
* Styling: NativeWind (Tailwind in RN)
* Icons: @expo/vector-icons
* Realtime: Socket.IO client
* HTTP: fetch / axios / React Query (depending on your implementation)
* Auth: Communicates with backend JWT API, stores tokens securely (e.g. SecureStore / AsyncStorage)

## Getting Started
### 1. Prerequisites
* Node.js v18+
* Expo CLI (via npx or globally)
* Expo Go app installed on your device (iOS/Android)
* Backend server running and reachable from your phone/emulator

### 2. Installation
From the mobile/ directory:

```bash
cd mobile
npm install
```

### 3. Run the App
```bash
npx expo start
# Press "a" for Android emulator, "i" for iOS simulator, or scan QR with Expo Go.
```

### 4. Project Structure (Mobile)
```bash
mobile/
├── app/
│   ├── _layout.tsx        
│   ├── index.tsx          
│   ├── home/              
│   ├── story/             
│   ├── chat/              
│   └── settings/          
├── components/
│   ├── story/             
│   ├── chat/              
│   ├── layout/            
│   └── ui/                
├── hooks/
│   ├── useAuth.ts         
│   ├── useSocket.ts       
│   └── useStories.ts      
├── lib/
│   ├── api.ts             
│   └── storage.ts         
└── tailwind.config.js     
```

### 5. Styling
NativeWind lets you use Tailwind-like classes:

```tsx
import { View, Text } from "react-native";

export function StoryCard() {
  return (
    <View className="mb-3 rounded-xl bg-neutral-900 p-4">
      <Text className="text-white font-semibold">Anonymous</Text>
      <Text className="mt-1 text-neutral-300 text-sm">
        You’re not alone. Share your story.
      </Text>
    </View>
  );
}
```
Ensure NativeWind is configured in babel.config.js and tailwind.config.js.

### 6. Privacy & Security (Mobile)
* Uses the same JWT-based backend as the web app.

* Tokens should be stored using a secure mechanism (e.g. Expo SecureStore).

* Role checks on the client prevent accidental exposure of restricted views.

* Anonymous posting options are surfaced clearly in the UI.

### 7. Scripts
```bash
npm run start 
npm run android 
npm run ios 
npm run lint       
```

### License
SafeSpace Mobile is distributed under the MIT License. See the root LICENSE file for details.