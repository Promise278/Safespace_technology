"use client";
import HomeNavbar from "@/components/HomeNav";
import { Search, Send, MessageCircle, ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE = "https://safespace-technology-1.onrender.com";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Supporter {
  id: string;
  username: string;
  email: string;
}

interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderUsername?: string;
}

interface ConversationData {
  id: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  sender: { id: string; username: string; email: string };
  receiver: { id: string; username: string; email: string };
  messages: MessageData[];
  unreadCount?: number;
  status: "pending" | "accepted" | "rejected";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("safespace_token");
}

function getCurrentUser() {
  if (typeof window === "undefined") return null;
  // Try safespace_user first
  const raw = localStorage.getItem("safespace_user");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through
    }
  }
  // Fallback: decode the JWT token to get user info
  const token = localStorage.getItem("safespace_token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const user = { id: payload.id, username: payload.username, email: payload.email, roles: payload.roles };
      // Cache it for next time
      localStorage.setItem("safespace_user", JSON.stringify(user));
      return user;
    } catch {
      // fall through
    }
  }
  return null;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Supporter List Item ─────────────────────────────────────────────────────

function SupporterListItem({
  name,
  lastMessage,
  time,
  isActive,
  isOnline,
  unreadCount,
  onClick,
}: {
  name: string;
  lastMessage?: string;
  time?: string;
  isActive: boolean;
  isOnline: boolean;
  unreadCount?: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center p-3 rounded-xl w-full text-left transition-all duration-200 group ${
        isActive
          ? "bg-linear-to-r from-[#fef1eb] to-[#fce8df] border-l-4 border-[#f19469] shadow-sm"
          : "bg-white hover:bg-[#fdf8f6]"
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
            isActive
              ? "bg-[#f19469] shadow-md"
              : "bg-linear-to-br from-[#f19469] to-[#ed835f]"
          }`}
        >
          <span className="text-white font-bold text-sm">
            {getInitials(name)}
          </span>
        </div>
        {isOnline && (
           <div className="absolute bottom-0 right-3 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className={`text-sm truncate ${
              isActive || unreadCount
                ? "font-semibold text-neutral-900"
                : "font-medium text-neutral-700"
            }`}
          >
            {name}
          </span>
          {time && (
            <span className="text-[11px] text-neutral-400 ml-2 shrink-0">
              {time}
            </span>
          )}
        </div>
        {lastMessage && (
          <p
            className={`text-xs truncate mt-0.5 ${
              unreadCount ? "text-neutral-800 font-medium" : "text-neutral-500"
            }`}
          >
            {lastMessage}
          </p>
        )}
      </div>
      {unreadCount ? (
        <div className="w-5 h-5 rounded-full bg-[#f19469] flex items-center justify-center ml-2 shrink-0">
          <span className="text-white text-[10px] font-bold">{unreadCount}</span>
        </div>
      ) : null}
    </button>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

function ChatBubble({
  content,
  time,
  isMine,
  senderName,
}: {
  content: string;
  time: string;
  isMine: boolean;
  senderName?: string;
}) {
  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3 animate-in`}
    >
      <div className={`max-w-[75%] ${isMine ? "order-2" : ""}`}>
        {!isMine && senderName && (
          <p className="text-[11px] text-neutral-400 mb-1 ml-1">
            {senderName}
          </p>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? "bg-linear-to-r from-[#f19469] to-[#ed835f] text-white rounded-br-md shadow-md"
              : "bg-white text-neutral-800 border border-gray-100 rounded-bl-md shadow-sm"
          }`}
        >
          {content}
        </div>
        <p
          className={`text-[10px] text-neutral-400 mt-1 ${
            isMine ? "text-right mr-1" : "ml-1"
          }`}
        >
          {timeAgo(time)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MessagesPage() {
  // State
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [selectedUser, setSelectedUser] = useState<Supporter | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const currentUser = getCurrentUser();
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevConversationRef = useRef<string | null>(null);

  // ─── Scroll to bottom ────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // ─── Socket.IO Setup ────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(API_BASE, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (currentUser?.id) {
        socket.emit("join", currentUser.id);
      }
    });

    socket.on("userOnline", (userId: string) => {
      setOnlineUsers((prev) => {
         const newSet = new Set(prev);
         newSet.add(userId);
         return newSet;
      });
    });

    socket.on("userOffline", (userId: string) => {
      setOnlineUsers((prev) => {
         const newSet = new Set(prev);
         newSet.delete(userId);
         return newSet;
      });
    });
    
    socket.on("onlineUsersList", (userIds: string[]) => {
       setOnlineUsers(new Set(userIds));
    });

    socket.on("receiveMessage", (msg: MessageData) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
    });

    socket.on(
      "userTyping",
      (data: { userId: string; username: string }) => {
        if (data.userId !== currentUser?.id) {
          setTypingUser(data.username);
        }
      },
    );

    socket.on("userStopTyping", () => {
      setTypingUser(null);
    });

    socket.on("messageError", (err: { error: string }) => {
      console.error("Message error:", err.error);
      setSending(false);
    });

    socket.on("conversationUpdate", (data: { id: string; status: "pending" | "accepted" | "rejected" }) => {
        setConversations(prev => prev.map(c => 
            c.id === data.id ? { ...c, status: data.status } : c
        ));
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id, scrollToBottom]);

  // ─── Join/Leave conversation room ────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Leave the previous room
    if (prevConversationRef.current) {
      socket.emit("leaveConversation", prevConversationRef.current);
    }

    // Join the new room
    if (selectedConversationId) {
      socket.emit("joinConversation", selectedConversationId);
      prevConversationRef.current = selectedConversationId;
    }
  }, [selectedConversationId]);

  // ─── Fetch supporters + conversations on mount ──────────────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const fetchAll = async () => {
      try {
        const [suppRes, convRes] = await Promise.all([
          fetch(`${API_BASE}/auth/seesupporters`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/messages/conversations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (suppRes.ok) {
          const suppData = await suppRes.json();
          // Filter out self from supporters
          const filtered = (suppData.data || []).filter(
            (s: Supporter) => s.id !== currentUser?.id,
          );
          setSupporters(filtered);
          
          // Request online status for these supporters if socket is ready
          if (socketRef.current) {
            socketRef.current.emit("getOnlineUsers", filtered.map((s: Supporter) => s.id));
          }
        }

        if (convRes.ok) {
          const convData = await convRes.json();
          setConversations(convData.data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentUser?.id]);

  // ─── Fetch messages for selected conversation ───────────────────────────
  useEffect(() => {
    if (!selectedConversationId) return;

    const token = getToken();
    if (!token) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/messages/${selectedConversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          setMessages(data.data || []);
          
          // Clear notification
          fetch(`${API_BASE}/messages/read/${selectedConversationId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => console.error("Failed to read messages", err));

          setConversations(prev => prev.map(c => 
            c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c
          ));
        } else {
          // 404 means no messages yet, which is fine
          setMessages([]);
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
        setMessages([]);
      } finally {
        setMessagesLoading(false);
        scrollToBottom();
      }
    };

    fetchMessages();
  }, [selectedConversationId, scrollToBottom]);

  // ─── Start or select conversation ───────────────────────────────────────
  const handleSelectUser = async (supporter: Supporter) => {
    setSelectedUser(supporter);
    setShowSidebar(false);

    // Check if conversation already exists
    const existingConv = conversations.find(
      (c) =>
        (c.senderId === currentUser?.id && c.receiverId === supporter.id) ||
        (c.senderId === supporter.id && c.receiverId === currentUser?.id),
    );

    if (existingConv) {
      setSelectedConversationId(existingConv.id);
      return;
    }

    // Create new conversation
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/messages/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: supporter.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedConversationId(data.data.id);
        // Add to conversations list
        setConversations((prev) => [data.data, ...prev]);
      }
    } catch (err) {
      console.error("Start conversation error:", err);
    }
  };

  // ─── Send message ──────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId || !selectedUser) return;

    setSending(true);
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          receiverId: selectedUser.id,
          content: messageText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const sentMsg = data.data;
        // Add the message to the UI directly from the API response
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [
            ...prev,
            {
              id: sentMsg.id,
              conversationId: sentMsg.conversationId,
              senderId: sentMsg.senderId,
              content: sentMsg.content,
              isRead: sentMsg.isRead,
              createdAt: sentMsg.createdAt,
              senderUsername: currentUser?.username,
            },
          ];
        });
        setMessageText("");
        scrollToBottom();
        // Stop typing indicator
        socketRef.current?.emit("stopTyping", {
          conversationId: selectedConversationId,
          userId: currentUser?.id,
        });
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptConversation = async () => {
    if (!selectedConversationId) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/messages/conversations/${selectedConversationId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConversations(prev => prev.map(c => 
          c.id === selectedConversationId ? { ...c, status: "accepted" } : c
        ));
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleRejectConversation = async () => {
    if (!selectedConversationId) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/messages/conversations/${selectedConversationId}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConversations(prev => prev.map(c => 
          c.id === selectedConversationId ? { ...c, status: "rejected" } : c
        ));
      }
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  // ─── Typing handler ─────────────────────────────────────────────────────
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    if (!selectedConversationId || !currentUser) return;

    socketRef.current?.emit("typing", {
      conversationId: selectedConversationId,
      userId: currentUser.id,
      username: currentUser.username,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", {
        conversationId: selectedConversationId,
        userId: currentUser.id,
      });
    }, 2000);
  };

  // ─── Build the merged contact list (supporters with conversations) ─────
  const getContactList = () => {
    const contactMap = new Map<
      string,
      {
        user: Supporter;
        lastMessage?: string;
        lastTime?: string;
        conversationId?: string;
        unreadCount?: number;
      }
    >();

    // Add users from existing conversations
    conversations.forEach((conv) => {
      const otherUser =
        conv.senderId === currentUser?.id ? conv.receiver : conv.sender;
      if (otherUser) {
        const lastMsg =
          conv.messages && conv.messages.length > 0
            ? conv.messages[0]
            : undefined;
        contactMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: lastMsg?.content,
          lastTime: lastMsg?.createdAt || conv.updatedAt,
          conversationId: conv.id,
          unreadCount: conv.unreadCount,
        });
      }
    });

    // Add supporters not yet in conversations
    supporters.forEach((s) => {
      if (!contactMap.has(s.id)) {
        contactMap.set(s.id, { user: s });
      }
    });

    return Array.from(contactMap.values());
  };

  const contactList = getContactList();
  const filteredContacts = contactList.filter((c) =>
    c.user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f4f2] pt-16">
        <HomeNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#ed835f]/20 border-t-[#ed835f] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f4f2] pt-16">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
            {currentUser?.roles === "supporter" ? "Support Hub" : "My Support Chats"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {currentUser?.roles === "supporter" 
              ? "You're making a difference. Helping those in need feel heard." 
              : "Safe conversations with people who care about your journey."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* ── Sidebar ── */}
          <div
            className={`${
              showSidebar ? "flex" : "hidden lg:flex"
            } w-full lg:w-[340px] flex-col border-r border-gray-100 ${
              currentUser?.roles === "supporter" ? "bg-[#fdfcfb]" : "bg-white"
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder={currentUser?.roles === "supporter" ? "Search sharers..." : "Search supporters..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#f19469] focus:border-transparent bg-[#fafafa] transition-all"
                />
                <Search
                  size={16}
                  color="#9ca3af"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <SupporterListItem
                    key={contact.user.id}
                    name={contact.user.username}
                    lastMessage={contact.lastMessage}
                    time={
                      contact.lastTime ? timeAgo(contact.lastTime) : undefined
                    }
                    isActive={selectedUser?.id === contact.user.id}
                    isOnline={onlineUsers.has(contact.user.id)}
                    unreadCount={contact.unreadCount}
                    onClick={() => handleSelectUser(contact.user)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle
                    size={40}
                    className="text-neutral-300 mx-auto mb-3"
                  />
                  <p className="text-sm text-neutral-500 max-w-[200px] mx-auto">
                    {searchQuery
                      ? "No matching contacts found"
                      : currentUser?.roles === "supporter"
                        ? "Browse stories to find someone who needs active support."
                        : "Post a story or reply to a supporter to start a conversation."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Chat Area ── */}
          <div
            className={`${
              !showSidebar ? "flex" : "hidden lg:flex"
            } flex-1 flex-col min-w-0`}
          >
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
                  <button
                    className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setShowSidebar(true)}
                  >
                    <ArrowLeft size={20} className="text-neutral-600" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#e07a51] to-[#ed835f] flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">
                        {getInitials(selectedUser.username)}
                      </span>
                    </div>
                    {onlineUsers.has(selectedUser.id) && (
                       <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-neutral-900 truncate flex items-center gap-2">
                       {selectedUser.username}
                       {currentUser?.roles === "supporter" && (
                         <span className="bg-[#e07a51]/10 text-[#e07a51] text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Sharer</span>
                       )}
                       {onlineUsers.has(selectedUser.id) && (
                         <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">Online</span>
                       )}
                    </h3>
                    {typingUser ? (
                      <p className="text-xs text-[#f19469] font-medium animate-pulse">
                        typing...
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-500">
                        {selectedUser.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-linear-to-b from-[#fdfbfa] to-[#f9f4f2]">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-3 border-[#ed835f]/20 border-t-[#ed835f] rounded-full animate-spin" />
                    </div>
                  ) : messages.length > 0 ? (
                    <>
                      {messages.map((msg) => (
                        <ChatBubble
                          key={msg.id}
                          content={msg.content}
                          time={msg.createdAt}
                          isMine={msg.senderId === currentUser?.id}
                          senderName={
                            msg.senderId !== currentUser?.id
                              ? msg.senderUsername || selectedUser.username
                              : undefined
                          }
                        />
                      ))}
                      {typingUser && (
                        <div className="flex justify-start mb-3">
                          <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div className="flex gap-1.5">
                              <div
                                className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <div
                                className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <div
                                className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#fce8df] to-[#fef1eb] flex items-center justify-center mb-4">
                        <MessageCircle
                          size={28}
                          className="text-[#f19469]"
                        />
                      </div>
                      <p className="text-neutral-800 font-medium mb-1">
                        Start the conversation
                      </p>
                      <p className="text-sm text-neutral-500">
                        Send a message to {selectedUser.username}
                      </p>
                    </div>
                  )}
                </div>

                {/* Accept/Reject Banner or Message Input */}
                {conversations.find(c => c.id === selectedConversationId)?.status === "pending" && 
                 conversations.find(c => c.id === selectedConversationId)?.receiverId === currentUser?.id ? (
                    <div className="p-6 bg-[#fdf8f6] border-t border-gray-100 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-md mx-auto">
                            <h4 className="text-neutral-900 font-bold text-lg mb-2">Message Request</h4>
                            <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                                {selectedUser.username} wants to start a supporting conversation. 
                                Your identity remains protected until you choose to interact.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleAcceptConversation}
                                    className="px-8 py-2.5 bg-[#e07a51] text-white rounded-xl font-bold hover:bg-[#d46b43] transition-all shadow-md active:scale-95"
                                >
                                    Accept Support
                                </button>
                                <button
                                    onClick={handleRejectConversation}
                                    className="px-8 py-2.5 bg-white text-neutral-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                ) : conversations.find(c => c.id === selectedConversationId)?.status === "rejected" ? (
                    <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-neutral-500 font-medium italic">This conversation has been closed.</p>
                    </div>
                ) : (
                    /* Message Input */
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-3 p-4 border-t border-gray-100 bg-white"
                    >
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleTyping}
                    placeholder={`Message ${selectedUser.username}...`}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f19469] focus:border-transparent text-sm bg-[#fafafa] transition-all"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    className={`
                      w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200
                      ${
                        messageText.trim() && !sending
                          ? "bg-linear-to-r from-[#f19469] to-[#ed835f] text-white shadow-md hover:shadow-lg hover:scale-[1.05] active:scale-95"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
              )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#fce8df] to-[#fef1eb] flex items-center justify-center mb-6 shadow-sm">
                  <MessageCircle size={36} className="text-[#f19469]" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  Your Messages
                </h3>
                <p className="text-neutral-500 max-w-sm">
                  Select a {currentUser?.roles === "supporter" ? "sharer" : "supporter"} from the sidebar to start a private
                  conversation
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}