// import { useState, useEffect, useRef } from "react";
// import { 
//   View, Text, TextInput, TouchableOpacity, ScrollView, 
//   ActivityIndicator, KeyboardAvoidingView, Platform 
// } from "react-native";
// import { useLocalSearchParams, router } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { SafeAreaView } from "react-native-safe-area-context";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { io, Socket } from "socket.io-client";
// import { API_BASE } from "../../config";

// interface Message {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   content: string;
//   createdAt: string;
// }

// export default function ChatScreen() {
//   const { id, username } = useLocalSearchParams();
//   const currentConversationId = Array.isArray(id) ? id[0] : id;
//   const contactName = Array.isArray(username) ? username[0] : (username || "Chat");

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [newMessage, setNewMessage] = useState("");
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);
//   const [currentUserUsername, setCurrentUserUsername] = useState<string | null>(null);
//   const [currentUser, setCurrentUser] = useState<Record<string, any> | null>(null);
//   const [conversationId, setConversationId] = useState<string | null>(null);
//   const [otherUserId, setOtherUserId] = useState<string | null>(null);
//   const [convStatus, setConvStatus] = useState<string>("accepted");
//   const [convReceiverId, setConvReceiverId] = useState<string | null>(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const [isContactOnline, setIsContactOnline] = useState(false);

//   const socketRef = useRef<Socket | null>(null);
//   const scrollViewRef = useRef<ScrollView>(null);
//   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const initChat = async () => {
//       try {
//         const userStr = await AsyncStorage.getItem("safespace_user");
//         let uid = null;
//         if (userStr) {
//           const user = JSON.parse(userStr);
//           uid = user.id;
//           setCurrentUserId(uid);
//           setCurrentUserUsername(user.username);
//           setCurrentUser({
//             ...user,
//             role: user.role || user.roles || "sharer"
//           });
//         }

//         const token = await AsyncStorage.getItem("safespace_token");
//         if (!token || !uid || !currentConversationId) return;

//         // 1. Fetch historical messages and mark as read
//         const res = await fetch(`${API_BASE}/messages/${currentConversationId}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const data = await res.json();

//         if (!(res.ok && data.success)) {
//           try {
//             const createRes = await fetch(`${API_BASE}/messages/conversations`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//               body: JSON.stringify({ receiverId: currentConversationId })
//             });
//             const createData = await createRes.json();
//             if (createRes.ok && createData.success) {
//               // Use the returned conversation
//               data.data = createData.data;
//             } else {
//             }
//           } catch (e) {
//             console.error("Failed to create conversation:", e);
//           }
//         }

//         if (data && data.success) {
//           try {
//             let computedOtherId: string | null = null;

//             if (Array.isArray(data.data)) {
//             setMessages(data.data || []);
//             setConversationId(currentConversationId || null);
//             setConvStatus("accepted");

//             try {
//               const convRes = await fetch(`${API_BASE}/messages/conversations`, {
//                 headers: { Authorization: `Bearer ${token}` }
//               });
//               const convData = await convRes.json();
//               if (convRes.ok && convData.success && Array.isArray(convData.data)) {
//                 const found = convData.data.find((c: any) => String(c.id) === String(currentConversationId));
//                 if (found) {
//                   setConvStatus(found.status || "accepted");
//                   setConvReceiverId(found.receiverId || null);
//                   const otherIdFromConv = found.senderId === uid ? found.receiverId : found.senderId;
//                   setOtherUserId(otherIdFromConv || null);
//                 }
//               }
//             } catch (e) {
//               console.error("Failed to fetch conversations for metadata:", e);
//             }

//             if (!otherUserId && data.data && data.data.length > 0) {
//               const msg = data.data.find((m: any) => m.senderId !== uid) || data.data[0];
//               const derivedOther = msg.senderId === uid ? msg.receiverId : msg.senderId;
//               setOtherUserId(derivedOther || null);
//               computedOtherId = derivedOther || null;
//             } else if (otherUserId) {
//               computedOtherId = otherUserId;
//             }

//             if (currentConversationId) {
//               await fetch(`${API_BASE}/messages/read/${currentConversationId}`, {
//                 method: "PUT",
//                 headers: { Authorization: `Bearer ${token}` }
//               });
//             }
//           } else {
//             setMessages(data.data.messages || []);
//             setConversationId(data.data.conversation?.id || null);
//             setConvStatus(data.data.conversation?.status || "accepted");
//             setConvReceiverId(data.data.conversation?.receiverId || null);

//             const otherId = data.data.conversation?.senderId === uid
//               ? data.data.conversation?.receiverId
//               : data.data.conversation?.senderId;
//             setOtherUserId(otherId || null);
//             computedOtherId = otherId || null;

//             if (data.data.conversation?.id) {
//               await fetch(`${API_BASE}/messages/read/${data.data.conversation.id}`, {
//                 method: "PUT",
//                 headers: { Authorization: `Bearer ${token}` }
//               });
//             }
//           }

//           const contactId: string | null = computedOtherId || null;
//           const convRoomId: string | null = (data.data && data.data.conversation && data.data.conversation.id) || currentConversationId || null;

//           const newSocket = io(API_BASE, { auth: { token } });

//           newSocket.on("connect", () => {
//             newSocket.emit("join", uid);
//             if (contactId) newSocket.emit("getOnlineUsers", [contactId]);
//             if (convRoomId) newSocket.emit("joinConversation", convRoomId);
//           });

//           newSocket.on("onlineUsersList", (userIds: string[]) => {
//             if (contactId && userIds.includes(contactId)) setIsContactOnline(true);
//           });

//           newSocket.on("userOnline", (userId: string) => {
//             if (contactId && userId === contactId) setIsContactOnline(true);
//           });

//           newSocket.on("userOffline", (userId: string) => {
//             if (contactId && userId === contactId) setIsContactOnline(false);
//           });

//           newSocket.on("userTyping", (data: { userId: string }) => {
//             if (contactId && data.userId === contactId) {
//               setIsTyping(true);
//               setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
//             }
//           });

//           newSocket.on("userStopTyping", (data: { userId: string }) => {
//             if (contactId && data.userId === contactId) setIsTyping(false);
//           });

//           newSocket.on("receiveMessage", (msg: Message) => {
//             if (contactId && (msg.senderId === contactId || msg.receiverId === contactId)) {
//               setMessages(prev => [...prev, msg]);
//               setIsTyping(false);
//               setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
//             }
//           });

//           newSocket.on("conversationUpdate", (data: { id: string; status: string }) => {
//             if (data.id === conversationId) setConvStatus(data.status);
//           });

//           socketRef.current = newSocket;
//         } catch (e) {
//           console.error("Failed to setup socket:", e);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initChat();

//     return () => {
//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//       if (socketRef.current) {
//         if (conversationId) {
//           socketRef.current.emit("leaveConversation", conversationId);
//         }
//         socketRef.current.disconnect();
//       }
//     };
//   }, [currentConversationId, conversationId, otherUserId]);

//   const handleTyping = (text: string) => {
//     setNewMessage(text);
    
//     if (!socketRef.current || !currentUserId || !conversationId) return;

//     socketRef.current.emit("typing", {
//       conversationId,
//       userId: currentUserId,
//       username: currentUserUsername || "User"
//     });

//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
//     typingTimeoutRef.current = setTimeout(() => {
//       if (socketRef.current) {
//         socketRef.current.emit("stopTyping", {
//           conversationId,
//           userId: currentUserId
//         });
//       }
//     }, 2000);
//   };

//   const handleSend = () => {
//     if (!newMessage.trim() || !socketRef.current || !currentUserId || !otherUserId) return;

//     const messagePayload = {
//       senderId: currentUserId,
//       receiverId: otherUserId,
//       content: newMessage.trim(),
//       conversationId: conversationId
//     };

//     socketRef.current.emit("sendMessage", messagePayload);

//     // Optimistically update the UI to feel instant
//     const optimisticMsg: Message = {
//       id: Date.now().toString(),
//       senderId: currentUserId,
//       receiverId: otherUserId,
//       content: newMessage.trim(),
//       createdAt: new Date().toISOString()
//     };

//     setMessages(prev => [...prev, optimisticMsg]);
//     setNewMessage("");
//   };

//   const handleAccept = async () => {
//     try {
//       const token = await AsyncStorage.getItem("safespace_token");
//       const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}/accept`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.ok) setConvStatus("accepted");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleReject = async () => {
//     try {
//       const token = await AsyncStorage.getItem("safespace_token");
//       const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}/reject`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (res.ok) setConvStatus("rejected");
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
    // <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "bottom"]}>
    //   {/* Header */}
    //   <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
    //     <TouchableOpacity onPress={() => router.back()} className="mr-3">
    //       <Ionicons name="arrow-back" size={24} color="#333" />
    //     </TouchableOpacity>
    //     <View className="relative">
    //       <View className="w-10 h-10 rounded-full bg-[#f19469] items-center justify-center mr-3">
    //          <Text className="text-white font-bold text-base">
    //             {contactName.substring(0, 2).toUpperCase()}
    //          </Text>
    //       </View>
    //       {isContactOnline && (
    //         <View className="absolute bottom-0 right-3 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></View>
    //       )}
    //     </View>
    //     <View>
    //       <View className="flex-row items-center">
    //         <Text className="text-lg font-bold text-gray-900 mr-2">
    //           {contactName}
    //         </Text>
    //         {currentUser?.role === "supporter" && (
    //           <View className="bg-[#e07a51]/10 px-1.5 py-0.5 rounded-full border border-[#e07a51]/20">
    //             <Text className="text-[9px] text-[#e07a51] font-bold uppercase tracking-widest">Sharer</Text>
    //           </View>
    //         )}
    //       </View>
    //       {isContactOnline ? (
    //         <Text className="text-xs text-green-600 font-medium tracking-wide">● Online</Text>
    //       ) : (
    //         <Text className="text-xs text-gray-500">Offline</Text>
    //       )}
    //     </View>
    //   </View>

    //   <KeyboardAvoidingView 
    //     style={{ flex: 1 }} 
    //     behavior={Platform.OS === "ios" ? "padding" : undefined}
    //   >
    //     <ScrollView 
    //       ref={scrollViewRef}
    //       className="flex-1 px-4 py-4"
    //       onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
    //     >
    //       {loading ? (
    //          <ActivityIndicator size="small" color="#ed835f" className="mt-8" />
    //       ) : messages.length === 0 ? (
    //          <Text className="text-center text-gray-500 mt-10">Start the conversation!</Text>
    //       ) : (
    //         messages.map((msg, index) => {
    //           const isMine = msg.senderId === currentUserId;
    //           return (
    //             <View 
    //               key={msg.id || index} 
    //               className={`max-w-[80%] rounded-2xl p-3 mb-3 ${isMine ? 'bg-[#ed835f] self-end rounded-tr-sm shadow-sm' : 'bg-gray-200 self-start rounded-tl-sm'}`}
    //             >
    //               <Text className={`text-base ${isMine ? 'text-white' : 'text-gray-900'}`}>{msg.content}</Text>
    //             </View>
    //           );
    //         })
    //       )}
          
    //       {/* Typing Indicator */}
    //       {isTyping && (
    //         <View className="bg-gray-200 self-start rounded-2xl rounded-tl-sm p-3 mb-3 max-w-[80px]">
    //           <View className="flex-row space-x-1 items-center justify-center" style={{ gap: 4, height: 20 }}>
    //             <View className="w-2 h-2 rounded-full bg-gray-400" />
    //             <View className="w-2 h-2 rounded-full bg-gray-400 opacity-70" />
    //             <View className="w-2 h-2 rounded-full bg-gray-400 opacity-40" />
    //           </View>
    //         </View>
    //       )}
          
    //       {/* Spacer block for scrolling perfectly */}
    //       <View className="h-6" />
    //     </ScrollView>

    //     {/* Chat Input Bar or Accept/Reject Banner */}
    //     {convStatus === "pending" && convReceiverId === currentUserId ? (
    //       <View className="px-6 py-6 bg-[#fdf8f6] border-t border-gray-100 items-center pb-12">
    //         <Text className="text-gray-900 font-bold text-lg mb-1">Message Request</Text>
    //         <Text className="text-gray-500 text-center text-sm mb-5 px-4">
    //           {contactName} wants to support you. Your identity is hidden until you accept.
    //         </Text>
    //         <View className="flex-row space-x-3" style={{ gap: 12 }}>
    //           <TouchableOpacity 
    //             onPress={handleAccept}
    //             className="bg-[#e07a51] px-8 py-3 rounded-xl shadow-sm"
    //           >
    //             <Text className="text-white font-bold">Accept</Text>
    //           </TouchableOpacity>
    //           <TouchableOpacity 
    //             onPress={handleReject}
    //             className="bg-white border border-gray-200 px-8 py-3 rounded-xl"
    //           >
    //             <Text className="text-gray-600 font-bold">Decline</Text>
    //           </TouchableOpacity>
    //         </View>
    //       </View>
    //     ) : convStatus === "rejected" ? (
    //       <View className="p-8 bg-gray-50 border-t border-gray-100 items-center pb-12">
    //          <Text className="text-gray-400 font-medium italic">Conversation closed</Text>
    //       </View>
    //     ) : (
    //       <View className="flex-row items-end px-4 py-3 bg-white border-t border-gray-100 pb-8">
    //         <TextInput
    //           className="flex-1 bg-gray-100 rounded-2xl min-h-[46px] max-h-[100px] px-4 pt-3 pb-3 text-base text-gray-800"
    //           placeholder="Type a message..."
    //           multiline
    //           value={newMessage}
    //           onChangeText={handleTyping}
    //         />
    //         <TouchableOpacity 
    //           className={`w-11 h-11 ml-3 rounded-full items-center justify-center ${newMessage.trim() ? "bg-[#ed835f]" : "bg-gray-300"}`}
    //           disabled={!newMessage.trim()}
    //           onPress={handleSend}
    //         >
    //            <Ionicons name="send" size={18} color="white" style={{ marginLeft: 3 }} />
    //         </TouchableOpacity>
    //       </View>
    //     )}
    //   </KeyboardAvoidingView>
    // </SafeAreaView>
//   );
// }
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

interface Conversation {
  id: string;
  status: string;
  receiverId: string;
  senderId: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
}

export default function ChatScreen(): JSX.Element {
  const { id, username } = useLocalSearchParams<{
    id?: string;
    username?: string;
  }>();
  const currentConversationId = Array.isArray(id) ? id[0] : id;
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
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isContactOnline, setIsContactOnline] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const userStr = await AsyncStorage.getItem("safespace_user");
        let uid: string | null = null;
        if (userStr) {
          const user = JSON.parse(userStr);
          uid = user.id;
          setCurrentUserId(uid);
          setCurrentUserUsername(user.username);
          setCurrentUser({
            ...user,
            role: user.role || user.roles || "sharer",
          });
        }

        const token = await AsyncStorage.getItem("safespace_token");
        if (!token || !uid || !currentConversationId) return;

        // 1. Fetch historical messages and mark as read
        const res = await fetch(
          `${API_BASE}/messages/${currentConversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data: ApiResponse = await res.json();

        if (!(res.ok && data.success)) {
          try {
            const createRes = await fetch(
              `${API_BASE}/messages/conversations`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ receiverId: currentConversationId }),
              }
            );
            const createData: ApiResponse = await createRes.json();
            if (createRes.ok && createData.success) {
              // Use the returned conversation
              data.data = createData.data;
            }
          } catch (e) {
            console.error("Failed to create conversation:", e);
          }
        }

        if (data && data.success) {
          try {
            let computedOtherId: string | null = null;

            if (Array.isArray(data.data)) {
              setMessages(data.data);
              setConversationId(currentConversationId || null);
              setConvStatus("accepted");

              try {
                const convRes = await fetch(
                  `${API_BASE}/messages/conversations`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const convData: ApiResponse = await convRes.json();
                if (
                  convRes.ok &&
                  convData.success &&
                  Array.isArray(convData.data)
                ) {
                  const found = convData.data.find(
                    (c: any) =>
                      String(c.id) === String(currentConversationId)
                  );
                  if (found) {
                    setConvStatus(found.status || "accepted");
                    setConvReceiverId(found.receiverId || null);
                    const otherIdFromConv =
                      found.senderId === uid
                        ? found.receiverId
                        : found.senderId;
                    setOtherUserId(otherIdFromConv || null);
                  }
                }
              } catch (e) {
                console.error(
                  "Failed to fetch conversations for metadata:",
                  e
                );
              }

              if (!otherUserId && data.data.length > 0) {
                const msg =
                  data.data.find((m: any) => m.senderId !== uid) ||
                  data.data[0];
                const derivedOther =
                  msg.senderId === uid ? msg.receiverId : msg.senderId;
                setOtherUserId(derivedOther || null);
                computedOtherId = derivedOther || null;
              } else if (otherUserId) {
                computedOtherId = otherUserId;
              }

              if (currentConversationId) {
                await fetch(
                  `${API_BASE}/messages/read/${currentConversationId}`,
                  {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
              }
            } else {
              setMessages(data.data.messages || []);
              setConversationId(
                data.data.conversation?.id || null
              );
              setConvStatus(
                data.data.conversation?.status || "accepted"
              );
              setConvReceiverId(
                data.data.conversation?.receiverId || null
              );

              const otherId =
                data.data.conversation?.senderId === uid
                  ? data.data.conversation?.receiverId
                  : data.data.conversation?.senderId;
              setOtherUserId(otherId || null);
              computedOtherId = otherId || null;

              if (data.data.conversation?.id) {
                await fetch(
                  `${API_BASE}/messages/read/${data.data.conversation.id}`,
                  {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
              }
            }

            const contactId: string | null = computedOtherId;
            const convRoomId: string | null =
              (data.data &&
                data.data.conversation &&
                data.data.conversation.id) ||
              currentConversationId ||
              null;

            const newSocket = io(API_BASE, { auth: { token } });

            newSocket.on("connect", () => {
              newSocket.emit("join", uid);
              if (contactId) newSocket.emit("getOnlineUsers", [contactId]);
              if (convRoomId) newSocket.emit("joinConversation", convRoomId);
            });

            newSocket.on("onlineUsersList", (userIds: string[]) => {
              if (contactId && userIds.includes(contactId))
                setIsContactOnline(true);
            });

            newSocket.on("userOnline", (userId: string) => {
              if (contactId && userId === contactId)
                setIsContactOnline(true);
            });

            newSocket.on("userOffline", (userId: string) => {
              if (contactId && userId === contactId)
                setIsContactOnline(false);
            });

            newSocket.on(
              "userTyping",
              (payload: { userId: string }) => {
                if (contactId && payload.userId === contactId) {
                  setIsTyping(true);
                  setTimeout(
                    () =>
                      scrollViewRef.current?.scrollToEnd({
                        animated: true,
                      }),
                    100
                  );
                }
              }
            );

            newSocket.on(
              "userStopTyping",
              (payload: { userId: string }) => {
                if (contactId && payload.userId === contactId)
                  setIsTyping(false);
              }
            );

            newSocket.on("receiveMessage", (msg: Message) => {
              if (
                contactId &&
                (msg.senderId === contactId ||
                  msg.receiverId === contactId)
              ) {
                setMessages((prev) => [...prev, msg]);
                setIsTyping(false);
                setTimeout(
                  () =>
                    scrollViewRef.current?.scrollToEnd({
                      animated: true,
                    }),
                  100
                );
              }
            });

            newSocket.on(
              "conversationUpdate",
              (payload: { id: string; status: string }) => {
                if (payload.id === conversationId)
                  setConvStatus(payload.status);
              }
            );

            socketRef.current = newSocket;
          } catch (e) {
            console.error("Failed to setup socket:", e);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (socketRef.current) {
        if (conversationId) {
          socketRef.current.emit("leaveConversation", conversationId);
        }
        socketRef.current.disconnect();
      }
    };
  }, [currentConversationId, conversationId, otherUserId]);

  const handleTyping = useCallback(
    (text: string) => {
      setNewMessage(text);

      if (!socketRef.current || !currentUserId || !conversationId) return;

      socketRef.current.emit("typing", {
        conversationId,
        userId: currentUserId,
        username: currentUserUsername || "User",
      });

      if (typingTimeoutRef.current)
        clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("stopTyping", {
            conversationId,
            userId: currentUserId,
          });
        }
      }, 2000);
    },
    [conversationId, currentUserId, currentUserUsername]
  );

  const handleSend = useCallback(() => {
    if (
      !newMessage.trim() ||
      !socketRef.current ||
      !currentUserId ||
      !otherUserId
    )
      return;

    const messagePayload = {
      senderId: currentUserId,
      receiverId: otherUserId,
      content: newMessage.trim(),
      conversationId: conversationId,
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
  }, [
    newMessage,
    currentUserId,
    otherUserId,
    conversationId,
  ]);

  const handleAccept = async () => {
    try {
      const token = await AsyncStorage.getItem("safespace_token");
      if (!token || !conversationId) return;
      const res = await fetch(
        `${API_BASE}/messages/conversations/${conversationId}/accept`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) setConvStatus("accepted");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    try {
      const token = await AsyncStorage.getItem("safespace_token");
      if (!token || !conversationId) return;
      const res = await fetch(
        `${API_BASE}/messages/conversations/${conversationId}/reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) setConvStatus("rejected");
    } catch (err) {
      console.error(err);
    }
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
            <Text className="text-lg font-bold text-gray-900 mr-2">
              {contactName}
            </Text>
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
          
          {/* Typing Indicator */}
          {isTyping && (
            <View className="bg-gray-200 self-start rounded-2xl rounded-tl-sm p-3 mb-3 max-w-[80px]">
              <View className="flex-row space-x-1 items-center justify-center" style={{ gap: 4, height: 20 }}>
                <View className="w-2 h-2 rounded-full bg-gray-400" />
                <View className="w-2 h-2 rounded-full bg-gray-400 opacity-70" />
                <View className="w-2 h-2 rounded-full bg-gray-400 opacity-40" />
              </View>
            </View>
          )}
          
          {/* Spacer block for scrolling perfectly */}
          <View className="h-6" />
        </ScrollView>

        {/* Chat Input Bar or Accept/Reject Banner */}
        {convStatus === "pending" && convReceiverId === currentUserId ? (
          <View className="px-6 py-6 bg-[#fdf8f6] border-t border-gray-100 items-center pb-12">
            <Text className="text-gray-900 font-bold text-lg mb-1">Message Request</Text>
            <Text className="text-gray-500 text-center text-sm mb-5 px-4">
              {contactName} wants to support you. Your identity is hidden until you accept.
            </Text>
            <View className="flex-row space-x-3" style={{ gap: 12 }}>
              <TouchableOpacity 
                onPress={handleAccept}
                className="bg-[#e07a51] px-8 py-3 rounded-xl shadow-sm"
              >
                <Text className="text-white font-bold">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleReject}
                className="bg-white border border-gray-200 px-8 py-3 rounded-xl"
              >
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