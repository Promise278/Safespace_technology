import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../../config";

interface Supporter {
  id: string;
  username: string;
  role?: string;
  roles?: string;
}

interface Conversation {
  id: string;
  senderId: string;
  receiverId: string;
  updatedAt: string;
  unreadCount?: number;
  sender: Supporter;
  receiver: Supporter;
  messages: any[];
  status: "pending" | "accepted" | "rejected";
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<Supporter | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("safespace_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser({
          ...user,
          role: user.role || user.roles || "sharer"
        });
      }

      const token = await AsyncStorage.getItem("safespace_token");
      const res = await fetch(`${API_BASE}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setConversations(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const getContactList = () => {
    const contactMap = new Map();

    conversations.forEach(conv => {
      const otherUser = conv.senderId === currentUser?.id ? conv.receiver : conv.sender;
      if (otherUser) {
        const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[0] : undefined;
        contactMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: lastMsg?.content,
          lastTime: lastMsg?.createdAt || conv.updatedAt,
          conversationId: conv.id,
          unreadCount: conv.unreadCount
        });
      }
    });
    
    return Array.from(contactMap.values()).sort((a, b) => {
      const timeA = new Date(a.lastTime || 0).getTime();
      const timeB = new Date(b.lastTime || 0).getTime();
      return timeB - timeA;
    });
  };

  const contacts = getContactList();
  const filteredContacts = contacts.filter((c) =>
    c.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View className="flex-1">
           <Text className="text-xl font-bold text-gray-900">
             {currentUser?.role === "supporter" ? "Support Center" : "My Inbox"}
           </Text>
           <Text className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
             {currentUser?.role === "supporter" ? "Active Cases" : "Direct Support"}
           </Text>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 py-3 border-b border-gray-100 bg-white">
        <View className="relative flex-row items-center">
          <Feather name="search" size={16} color="#9ca3af" className="absolute left-3.5 z-10" />
          <TextInput
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800"
            placeholder={currentUser?.role === "supporter" ? "Search sharers..." : "Search supporters..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView className="flex-1 bg-white">
        {loading ? (
          <ActivityIndicator size="small" color="#ed835f" className="mt-8" />
        ) : filteredContacts.length === 0 ? (
          <View className="items-center py-12 px-6">
            <Feather name="message-circle" size={48} color="#d1d5db" className="mb-4" />
            <Text className="text-lg font-semibold text-gray-800 mb-1">
               {currentUser?.role === "supporter" ? "Start Supporting" : "No chats yet"}
            </Text>
            <Text className="text-center text-gray-500">
               {currentUser?.role === "supporter" 
                 ? "Browse the community feed to reach out and support others." 
                 : "Your conversations with supporters will appear here."}
            </Text>
          </View>
        ) : (
          filteredContacts.map((contact) => (
            <TouchableOpacity 
              key={contact.user.id} 
              className="flex-row items-center px-4 py-4 border-b border-gray-50"
              onPress={() => router.push(`/messages/${contact.conversationId}?username=${encodeURIComponent(contact.user.username)}` as any)}
            >
              <View className="w-12 h-12 rounded-full bg-[#f19469] items-center justify-center mr-3 relative">
                <Text className="text-white font-bold text-lg">
                  {contact.user.username.substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className={`text-base ${contact.unreadCount ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                    {contact.user.username}
                  </Text>
                  {contact.lastTime && (
                    <Text className={`text-xs ${contact.unreadCount ? "font-semibold text-[#f19469]" : "text-gray-400"}`}>
                      {timeAgo(contact.lastTime)}
                    </Text>
                  )}
                </View>
                <Text 
                  className={`text-sm tracking-tight ${contact.unreadCount ? "font-medium text-gray-900" : "text-gray-500"}`}
                  numberOfLines={1}
                >
                  {contact.lastMessage || "No messages yet"}
                </Text>
              </View>

              {!!contact.unreadCount && contact.unreadCount > 0 && (
                <View className="ml-3 w-5 h-5 rounded-full bg-[#ed835f] items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">{contact.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
