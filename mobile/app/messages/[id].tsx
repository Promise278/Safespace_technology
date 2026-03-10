import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { API_BASE } from "../../config";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
}

export default function ChatScreen() {
  const { id, username } = useLocalSearchParams<{
    id?: string;
    username?: string;
  }>();
  const currentConversationId = Array.isArray(id) ? id[0] : id || "";
  const contactName = Array.isArray(username)
    ? username[0]
    : username || "Chat";

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserUsername, setCurrentUserUsername] =
    useState<string | null>(null);
  const [currentUser, setCurrentUser] =
    useState<Record<string, any> | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [convStatus, setConvStatus] = useState<string>("accepted");
  const [convReceiverId, setConvReceiverId] = useState<string | null>(null);
  const [otherUserRole, setOtherUserRole] = useState<string>("user");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isContactOnline, setIsContactOnline] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      try {
        if (isMounted) setLoading(true);
        const userStr = await AsyncStorage.getItem("safespace_user");
        let uid: string | null = null;
        if (userStr) {
          const user = JSON.parse(userStr);
          uid = user.id;
          if (isMounted) {
            setCurrentUserId(uid);
            setCurrentUserUsername(user.username);
            setCurrentUser({ ...user, role: user.role || user.roles || "sharer" });
          }
        }

        const token = await AsyncStorage.getItem("safespace_token");
        if (!token || !uid || !currentConversationId) {
          if (isMounted) setLoading(false);
          return;
        }

        // 1. Fetch historical messages
        const res = await fetch(`${API_BASE}/messages/${currentConversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let data: ApiResponse = await res.json();

        // 2. If not found, try to create or fetch conversion by other userId
        if (!(res.ok && data.success)) {
          console.log("Conversation not found by ID, attempting to start/get by user identity...");
          const createRes = await fetch(`${API_BASE}/messages/conversations`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ receiverId: currentConversationId }),
          });
          const createData = await createRes.json();
          if (createRes.ok && createData.success) {
            data = createData;
          }
        }

        // 3. Process conversation data
        if (data && data.success) {
          let computedOtherId: string | null = null;
          let actualConvId: string | null = null;

          if (Array.isArray(data.data)) {
            // It's an array of messages
            if (isMounted) {
              setMessages(data.data);
              setConvStatus("accepted");
            }
            actualConvId = currentConversationId;

            // Fetch metadata
            try {
              const convRes = await fetch(`${API_BASE}/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const convData = await convRes.json();
              if (convRes.ok && convData.success && Array.isArray(convData.data)) {
                const found = convData.data.find((c: any) => String(c.id) === String(currentConversationId));
                if (found) {
                  if (isMounted) {
                    setConvStatus(found.status || "accepted");
                    setConvReceiverId(found.receiverId || null);
                    const otherId = found.senderId === uid ? found.receiverId : found.senderId;
                    setOtherUserId(otherId || null);
                    computedOtherId = otherId || null;
                    const oUser = found.senderId === uid ? found.receiver : found.sender;
                    if (oUser) setOtherUserRole(oUser.role || oUser.roles || "user");
                  }
                }
              }
            } catch (e) {
              console.error("Metadata fetch failed:", e);
            }

            if (!computedOtherId && data.data.length > 0) {
              const msg = data.data.find((m: any) => m.senderId !== uid) || data.data[0];
              const other = msg.senderId === uid ? msg.receiverId : msg.senderId;
              if (isMounted) setOtherUserId(other || null);
              computedOtherId = other || null;
            }
          } else if (data.data) {
            // It's a single conversation object
            const convDataObj = (data.data as any).conversation || data.data;
            if (isMounted) {
              setMessages((data.data as any).messages || []);
              setConvStatus(convDataObj.status || "accepted");
              setConvReceiverId(convDataObj.receiverId || null);
              const otherId = convDataObj.senderId === uid ? convDataObj.receiverId : convDataObj.senderId;
              setOtherUserId(otherId || null);
              computedOtherId = otherId || null;
              const oUser = convDataObj.senderId === uid ? convDataObj.receiver : convDataObj.sender;
              if (oUser) setOtherUserRole(oUser.role || oUser.roles || "user");
            }
            actualConvId = convDataObj.id || null;
          }

          if (isMounted && actualConvId) {
            setConversationId(actualConvId);
          }

          // Mark as Read
          if (actualConvId) {
             fetch(`${API_BASE}/messages/read/${actualConvId}`, {
               method: "PUT",
               headers: { Authorization: `Bearer ${token}` },
             }).catch(e => console.error("Read mark failed:", e));
          }

          // 4. Setup Socket
          if (token && uid && actualConvId && isMounted) {
            const newSocket = io(API_BASE, { 
              auth: { token },
              transports: ['websocket'],
              autoConnect: true
            });
            
            newSocket.on("connect", () => {
              newSocket.emit("join", uid);
              if (computedOtherId) newSocket.emit("getOnlineUsers", [computedOtherId]);
              newSocket.emit("joinConversation", actualConvId);
            });

            newSocket.on("connect_error", (err) => {
              console.error("Socket Connect Error:", err.message);
              // Only alert if we're still mounted
              if (isMounted) alert("Wait... connection to chat server failed. Retrying...");
            });

            newSocket.on("onlineUsersList", (uIds: string[]) => {
              if (isMounted && computedOtherId && uIds.includes(computedOtherId)) setIsContactOnline(true);
            });
            newSocket.on("userOnline", (u: string) => {
              if (isMounted && computedOtherId && u === computedOtherId) setIsContactOnline(true);
            });
            newSocket.on("userOffline", (u: string) => {
              if (isMounted && computedOtherId && u === computedOtherId) setIsContactOnline(false);
            });
            newSocket.on("userTyping", (p: { userId: string }) => {
              if (isMounted && computedOtherId && p.userId === computedOtherId) {
                setIsTyping(true);
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
              }
            });
            newSocket.on("userStopTyping", (p: { userId: string }) => {
              if (isMounted && computedOtherId && p.userId === computedOtherId) setIsTyping(false);
            });
            newSocket.on("receiveMessage", (msg: Message) => {
              if (!isMounted) return;
              if (String(msg.senderId) === String(uid)) { 
                setIsTyping(false); 
                return; 
              }
              if (computedOtherId && (String(msg.senderId) === String(computedOtherId) || String(msg.receiverId) === String(computedOtherId))) {
                setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
                setIsTyping(false);
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
              }
            });
            newSocket.on("conversationUpdate", (p: { id: string; status: string }) => {
              if (isMounted && p.id === actualConvId) setConvStatus(p.status);
            });
            newSocket.on("messageError", (err: { error: string; details?: string }) => {
              console.error("Socket Error:", err.error, err.details || "");
              alert(`Message Error: ${err.error}\n\nReason: ${err.details || "Unknown"}`);
            });
            
            socketRef.current = newSocket;
          }
        }
      } catch (err: any) {
        console.error("Init Chat Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentConversationId]);

  const handleTyping = useCallback(
    (text: string) => {
      setNewMessage(text);
      if (!socketRef.current || !currentUserId || !conversationId) return;

      socketRef.current.emit("typing", {
        conversationId,
        userId: currentUserId,
        username: currentUserUsername || "User",
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("stopTyping", { conversationId, userId: currentUserId });
        }
      }, 2000);
    },
    [conversationId, currentUserId, currentUserUsername]
  );

  const handleSend = useCallback(() => {
    if (!newMessage.trim()) return;

    if (!socketRef.current || !currentUserId || !otherUserId || !conversationId) {
       console.log("Cannot send message: Requirements missing", {
         hasSocket: !!socketRef.current,
         hasUID: !!currentUserId,
         hasOtherID: !!otherUserId,
         hasConvID: !!conversationId
       });
       let missing = [];
       if (!socketRef.current) missing.push("Server connection");
       if (!otherUserId) missing.push("Recipient details");
       if (!conversationId) missing.push("Chat session");
       
       alert("Chat not ready. Missing: " + missing.join(", "));
       return;
    }

    const messagePayload = {
      senderId: currentUserId,
      receiverId: otherUserId,
      content: newMessage.trim(),
      conversationId: conversationId,
      senderUsername: currentUserUsername || "User",
    };

    socketRef.current.emit("sendMessage", messagePayload);

    const optimisticMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: otherUserId,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
  }, [newMessage, conversationId, currentUserId, otherUserId, currentUserUsername]);

  const handleAccept = async () => {
    try {
      const token = await AsyncStorage.getItem("safespace_token");
      if (!token || !conversationId) return;
      const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConvStatus("accepted");
    } catch (err) { console.error(err); }
  };

  const handleReject = async () => {
    try {
      const token = await AsyncStorage.getItem("safespace_token");
      if (!token || !conversationId) return;
      const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConvStatus("rejected");
    } catch (err) { console.error(err); }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View className="relative">
          <View className="w-10 h-10 rounded-full bg-[#f19469] items-center justify-center mr-3">
             <Text className="text-white font-bold text-base">
                {contactName.substring(0, 2).toUpperCase()}
             </Text>
          </View>
          {isContactOnline && (
            <View className="absolute bottom-0 right-3 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></View>
          )}
        </View>
        <View>
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-gray-900 mr-2">{contactName}</Text>
            {currentUser?.role === "supporter" && (
              <View className="bg-[#e07a51]/10 px-1.5 py-0.5 rounded-full border border-[#e07a51]/20">
                <Text className="text-[9px] text-[#e07a51] font-bold uppercase tracking-widest">Sharer</Text>
              </View>
            )}
          </View>
          {isContactOnline ? (
            <Text className="text-xs text-green-600 font-medium tracking-wide">● Online</Text>
          ) : (
            <Text className="text-xs text-gray-500">Offline</Text>
          )}
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {loading ? (
             <ActivityIndicator size="small" color="#ed835f" className="mt-8" />
          ) : messages.length === 0 ? (
             <Text className="text-center text-gray-500 mt-10">Start the conversation!</Text>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <View 
                  key={msg.id || index} 
                  className={`max-w-[80%] rounded-2xl p-3 mb-3 ${isMine ? 'bg-[#ed835f] self-end rounded-tr-sm shadow-sm' : 'bg-gray-200 self-start rounded-tl-sm'}`}
                >
                  <Text className={`text-base ${isMine ? 'text-white' : 'text-gray-900'}`}>{msg.content}</Text>
                </View>
              );
            })
          )}
          
          {isTyping && (
            <View className="bg-gray-200 self-start rounded-2xl rounded-tl-sm p-3 mb-3 max-w-[80px]">
              <View className="flex-row space-x-1 items-center justify-center" style={{ gap: 4, height: 20 }}>
                <View className="w-2 h-2 rounded-full bg-gray-400" />
                <View className="w-2 h-2 rounded-full bg-gray-400 opacity-70" />
                <View className="w-2 h-2 rounded-full bg-gray-400 opacity-40" />
              </View>
            </View>
          )}
          <View className="h-6" />
        </ScrollView>

        {convStatus === "pending" && String(convReceiverId) === String(currentUserId) ? (
          <View className="px-6 py-6 bg-[#fdf8f6] border-t border-gray-100 items-center pb-12">
            <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-3">
               <Ionicons name="chatbubbles-outline" size={24} color="#e07a51" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-1">
                {otherUserRole === "supporter" ? "Support Request" : "Message Request"}
            </Text>
            <Text className="text-gray-500 text-center text-sm mb-5 px-4 leading-5">
              {otherUserRole === "supporter" 
                ? `${contactName} wants to offer you support. Your identity remains private until you accept.` 
                : `${contactName} wants to start a conversation with you. Do you want to accept?`}
            </Text>
            <View className="flex-row space-x-3" style={{ gap: 12 }}>
              <TouchableOpacity onPress={handleAccept} className="bg-[#e07a51] px-8 py-3 rounded-xl shadow-sm">
                <Text className="text-white font-bold">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReject} className="bg-white border border-gray-200 px-8 py-3 rounded-xl">
                <Text className="text-gray-600 font-bold">Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : convStatus === "rejected" ? (
          <View className="p-8 bg-gray-50 border-t border-gray-100 items-center pb-12">
             <Text className="text-gray-400 font-medium italic">Conversation closed</Text>
          </View>
        ) : (
          <View className="flex-row items-end px-4 py-3 bg-white border-t border-gray-100 pb-8">
            <TextInput
              className="flex-1 bg-gray-100 rounded-2xl min-h-[46px] max-h-[100px] px-4 pt-3 pb-3 text-base text-gray-800"
              placeholder="Type a message..."
              multiline
              value={newMessage}
              onChangeText={handleTyping}
            />
            <TouchableOpacity 
              className={`w-11 h-11 ml-3 rounded-full items-center justify-center ${newMessage.trim() ? "bg-[#ed835f]" : "bg-gray-300"}`}
              disabled={!newMessage.trim()}
              onPress={handleSend}
            >
               <Ionicons name="send" size={18} color="white" style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}