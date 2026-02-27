"use client";
import HomeNavbar from "@/components/HomeNav";
import { Pencil, Trash2, Heart, MessageSquare, Send, Mail, X } from "lucide-react";
import { StorySkeleton, CommentSkeleton } from "../../../components/Skeleton";

import React, { useState, useEffect } from "react";

interface ShareStoryProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id: string;
    title: string;
    description: string;
    isAnonymous: boolean;
  } | null;
}

const ShareStoryModal: React.FC<ShareStoryProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setStory(initialData.description);
      setIsAnonymous(initialData.isAnonymous);
    } else {
      setTitle("");
      setStory("");
      setIsAnonymous(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !story.trim()) return;

    try {
      setSubmitting(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("safespace_token")
          : null;

      if (!token) {
        alert("You must be logged in to post a story.");
        return;
      }

      const url = initialData
        ? `https://safespace-technology-1.onrender.com/updatestory/${initialData.id}`
        : "https://safespace-technology-1.onrender.com/createstories";

      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: story,
          isAnonymous,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Story action error:", err);
        alert(err?.message || `Failed to ${initialData ? "update" : "create"} story`);
        return;
      }

      onClose();
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed min-h-screen inset-0 flex items-center justify-center z-50 px-4 ">
        <div
          className="absolute inset-0 bg-gray-300 opacity-40 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col">
          <div className="p-4 sm:p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-neutral-900">
                {initialData ? "Update Your Story" : "Share Your Story"}
              </h2>
              <button
                onClick={onClose}
                className="text-neutral-700 hover:text-neutral-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Give your story a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ed835f] focus:border-transparent text-neutral-900 placeholder-neutral-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Your Story
                </label>
                <textarea
                  placeholder="Share your experience. This is a safe space..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  maxLength={3500}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ed835f] focus:border-transparent resize-none text-neutral-900 placeholder-neutral-400"
                />
                <div className="text-right mt-1">
                  <span className="text-sm text-neutral-500">
                    {story.length}/3500 characters
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition ${
                        isAnonymous ? "bg-[#ed835f]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition transform ${
                          isAnonymous ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">
                      Post anonymously
                    </p>
                    <p className="text-xs text-neutral-500">
                      Your username will be hidden from others
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-neutral-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !story.trim()}
                className="flex-1 px-6 py-3 bg-[#ed835f] rounded-lg text-white font-medium hover:bg-[#e07a51] transition shadow-md disabled:opacity-60"
              >
                {submitting
                  ? initialData
                    ? "Updating..."
                    : "Sharing..."
                  : initialData
                    ? "Update Story"
                    : "Share Story"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-60 p-4">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-60 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-4 mb-6 text-red-600">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={24} />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Delete Story?</h2>
        </div>

        <p className="text-neutral-600 mb-8">
          Are you sure you want to delete <span className="font-semibold text-neutral-900">&quot;{title}&quot;</span>? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-neutral-700 font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface Story {
  _id: string;
  id: string;
  title: string;
  description: string;
  username: string;
  userId: string;
  createdAt: string;
  supportsCount?: number;
  isSupported?: boolean;
  isAnonymous: boolean;
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  likesCount?: number;
  isLiked?: boolean;
}

interface CurrentUser {
  id: string;
  username: string;
  role: string;
}

interface StoryCardProps {
  onEdit: (story: Story) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ onEdit }) => {
  // stories
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // per‑story respond UI
  const [activeStoryIds, setActiveStoryIds] = useState<Set<string>>(new Set());
  const [responseTexts, setResponseTexts] = useState<Record<string, string>>({});
  const [likedStoryIds, setLikedStoryIds] = useState<Set<string>>(
    () => new Set(),
  );

  // comments state
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentData[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  // current user for ownership (edit/delete)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // deletion modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    storyId: string;
    storyTitle: string;
  }>({ isOpen: false, storyId: "", storyTitle: "" });

  const extractStories = (response: { data?: unknown[] } | unknown) => {
    if (
      response &&
      typeof response === "object" &&
      "data" in response &&
      Array.isArray((response as { data: unknown[] }).data)
    ) {
      return (response as { data: unknown[] }).data;
    }
    return [];
  };

  useEffect(() => {
    // load current user from localStorage (you set this at login)
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("safespace_user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setCurrentUser({
            id: parsed.id,
            username: parsed.username,
            role: parsed.role || parsed.roles || "sharer",
          });
        } catch (e) {
          console.error("Failed to parse safespace_user:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const token = localStorage.getItem("safespace_token");
        if (!token) throw new Error("No token found");

      const res = await fetch(
        `https://safespace-technology-1.onrender.com/stories/seeAllstories`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch stories");

        const data = await res.json();
        const normalizedStories = extractStories(data) as Story[];

        // newest first
        normalizedStories.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        const initialLikedIds = new Set<string>();
        normalizedStories.forEach(s => {
          if (s.isSupported) {
            initialLikedIds.add(s.id);
          }
        });
        setLikedStoryIds(initialLikedIds);
        setStories(normalizedStories);
      } catch (err) {
        console.error(err);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f4f2] pt-6">
        <div className="max-w-3xl mx-auto p-4 flex flex-col gap-6">
          <StorySkeleton />
          <StorySkeleton />
          <StorySkeleton />
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    const clean = name.trim();
    if (clean.length >= 4) return (clean[0] + clean[3]).toUpperCase();
    if (clean.length >= 3) return (clean[0] + clean[2]).toUpperCase();
    return clean[0].toUpperCase();
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const handleSupport = async (storyId: string) => {
    try {
      const token = localStorage.getItem("safespace_token");
      if (!token) {
        alert("You must be logged in to support a story.");
        return;
      }

      const res = await fetch(
        `https://safespace-technology-1.onrender.com/supports/${storyId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Support story error:", err);
        alert(err?.message || "Failed to support story");
        return;
      }

      await res.json();
      
      const isCurrentlyLiked = likedStoryIds.has(storyId);

      setStories((prev) =>
        prev.map((s) =>
          s.id === storyId
            ? { ...s, supportsCount: isCurrentlyLiked ? (s.supportsCount || 0) - 1 : (s.supportsCount || 0) + 1 }
            : s,
        ),
      );

      setLikedStoryIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(storyId);
        } else {
          newSet.add(storyId);
        }
        return newSet;
      });
    } catch (e) {
      console.error("Error supporting story:", e);
    }
  };

  const handleRespondClick = async (storyId: string) => {
    setActiveStoryIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
        
        // Fetch comments if opening
        if (!commentsMap[storyId]) {
          setLoadingComments((prev) => ({ ...prev, [storyId]: true }));
          const token = localStorage.getItem("safespace_token");
          fetch(`https://safespace-technology-1.onrender.com/comments/${storyId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.ok ? res.json() : null)
            .then(json => {
              if (json) setCommentsMap((prev) => ({ ...prev, [storyId]: json.data || [] }));
            })
            .catch(err => console.error("Failed to fetch comments", err))
            .finally(() => setLoadingComments((prev) => ({ ...prev, [storyId]: false })));
        }
      }
      return newSet;
    });
  };

  const handleSubmitResponse = async (
    e: React.FormEvent<HTMLFormElement>,
    storyId: string,
  ) => {
    e.preventDefault();
    const text = responseTexts[storyId];
    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem("safespace_token");
      if (!token) {
        alert("You must be logged in to respond.");
        return;
      }

      // call your backend response endpoint here
      const res = await fetch(
        `https://safespace-technology-1.onrender.com/comments/${storyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: text }),
        },
      );

      if (res.ok) {
        const json = await res.json();
        setCommentsMap((prev) => ({
          ...prev,
          [storyId]: [...(prev[storyId] || []), json.data],
        }));
      }

      setResponseTexts((prev) => ({ ...prev, [storyId]: "" }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikeComment = async (storyId: string, commentId: string) => {
    try {
      const token = localStorage.getItem("safespace_token");
      if (!token) return;

      const res = await fetch(`https://safespace-technology-1.onrender.com/supports/comment/${commentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCommentsMap(prev => ({
          ...prev,
          [storyId]: prev[storyId].map(c => {
            if (c.id === commentId) {
              if (c.isLiked) return c;
              return { ...c, isLiked: true, likesCount: (c.likesCount || 0) + 1 };
            }
            return c;
          })
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageSharer = async (sharerId: string) => {
    try {
      const token = localStorage.getItem("safespace_token");
      if (!token) return;

      const res = await fetch("https://safespace-technology-1.onrender.com/messages/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: sharerId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to messages with the conversation ID
        window.location.href = `/pages/message?conversationId=${data.data.id}`;
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      const token = localStorage.getItem("safespace_token");
      if (!token) {
        alert("You must be logged in to delete a story.");
        return;
      }

      const res = await fetch(
        `https://safespace-technology-1.onrender.com/stories/deletestories/${storyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.message || "Failed to delete story");
        return;
      }

      setStories((prev) => prev.filter((s) => s.id !== storyId));
      setDeleteModal({ isOpen: false, storyId: "", storyTitle: "" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full">
      <div className="mt-6 space-y-6">
        {Array.isArray(stories) && stories.length > 0 ? (
          stories.map((story, index) => {
            const storyTime = story.createdAt
              ? timeAgo(story.createdAt)
              : "Just now";
            const displayName =
              story.username && story.username.trim() !== ""
                ? story.username
                : "Anonymous";
            const initials = getInitials(displayName);

            const isOwner =
              currentUser != null && story.userId === currentUser.id;

            const isLiked = likedStoryIds.has(story.id);

            return (
              <div
                key={story.id || `story-${index}`}
                className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 mb-6 last:mb-0"
              >
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#f19469] flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-white font-bold text-lg">
                      {initials}
                    </span>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-neutral-500">{storyTime}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {isOwner && (
                      <>
                        <button
                          type="button"
                          className="p-1 rounded text-neutral-500 hover:text-blue-600"
                          onClick={() => onEdit(story)}
                        >
                          <Pencil className="w-6 h-6" />
                        </button>

                        <button
                          type="button"
                          className="p-1 rounded text-neutral-500 hover:text-red-600"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              storyId: story.id,
                              storyTitle: story.title,
                            })
                          }
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-neutral-900 mb-4 leading-tight">
                  {story.title || "Untitled Story"}
                </h2>

                <div className="text-base text-neutral-700 leading-relaxed mb-8 space-y-3">
                  {story.description ? (
                    story.description.split("\\n").map((line, i) => (
                      <p key={`line-${i}`} className="mb-3 last:mb-0">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="text-neutral-500 italic">No content shared</p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-start sm:gap-8 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => handleSupport(story.id)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 text-neutral-600 hover:text-[#ed835f] hover:bg-orange-50 transition-all duration-200 rounded-lg font-medium group"
                  >
                    <Heart
                      size={20}
                      className={`sm:w-6 sm:h-6 group-hover:scale-110 transition-transform ${
                        isLiked ? "text-[#ed835f]" : ""
                      }`}
                      fill={isLiked ? "#ed835f" : "none"}
                    />
                    <span className="text-sm sm:text-base">
                      {typeof story.supportsCount === "number"
                        ? `(${story.supportsCount})`
                        : ""}
                    </span>
                  </button>

                  <button
                    onClick={() => handleRespondClick(story.id)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 text-neutral-600 hover:text-[#ed835f] hover:bg-orange-50 transition-all duration-200 rounded-lg font-medium group"
                  >
                    <MessageSquare
                      size={20}
                      className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-sm sm:text-base">Comment</span>
                  </button>

                  {currentUser?.role === "supporter" && !isOwner && (
                    <button
                      onClick={() => handleMessageSharer(story.userId)}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 text-neutral-600 hover:text-[#ed835f] hover:bg-orange-50 transition-all duration-200 rounded-lg font-medium group"
                    >
                      <Mail size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-sm sm:text-base">Message</span>
                    </button>
                  )}
                </div>

                {activeStoryIds.has(story.id) && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <h4 className="text-sm font-semibold text-neutral-800 mb-3">Comments</h4>
                    
                    {loadingComments[story.id] ? (
                      <div className="space-y-3">
                        <CommentSkeleton />
                        <CommentSkeleton />
                      </div>
                    ) : commentsMap[story.id]?.length > 0 ? (
                      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
                        {commentsMap[story.id].map(comment => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-3 group/comment">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-900">{comment.user?.username || "Unknown"}</span>
                                <span className="text-xs text-neutral-500">{timeAgo(comment.createdAt)}</span>
                              </div>
                              <button 
                                onClick={() => handleLikeComment(story.id, comment.id)}
                                className="flex items-center gap-1 text-neutral-500 hover:text-[#ed835f] transition-colors"
                              >
                                <Heart 
                                  size={14} 
                                  fill={comment.isLiked ? "#ed835f" : "none"}
                                  className={comment.isLiked ? "text-[#ed835f]" : ""}
                                />
                                <span className="text-xs">{comment.likesCount || 0}</span>
                              </button>
                            </div>
                            <p className="text-sm text-neutral-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500 py-2 italic mb-4">No comments yet. Be the first to respond!</div>
                    )}

                    <form
                      onSubmit={(e) => handleSubmitResponse(e, story.id)}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="text"
                          value={responseTexts[story.id] || ""}
                          onChange={(e) => setResponseTexts(prev => ({ ...prev, [story.id]: e.target.value }))}
                          placeholder="Write a response..."
                          className="flex-1 h-12 px-4 py-2 text-sm border-2 border-neutral-200 rounded-xl focus:outline-none focus:ring focus:ring-[#ed835f] focus:border-[#ed835f] bg-white shadow-sm"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!responseTexts[story.id]?.trim()}
                          className={`
                            w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-200
                            ${
                              responseTexts[story.id]?.trim()
                                ? "bg-linear-to-r from-[#ed835f] to-[#e07a51] text-white hover:shadow-lg hover:scale-105 active:scale-95"
                                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                            }
                          `}
                        >
                          <Send size={20} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-xs text-neutral-500">
                        <span>Press Enter to send</span>
                        <span>{(responseTexts[story.id] || "").length}/500</span>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-neutral-200 shadow-sm">
            <MessageSquare className="w-16 h-16 text-neutral-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-neutral-800 mb-3">
              No stories yet
            </h3>
            <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
              Be the first to share your experience in this safe space community
            </p>
          </div>
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, storyId: "", storyTitle: "" })
        }
        onConfirm={() => handleDelete(deleteModal.storyId)}
        title={deleteModal.storyTitle}
      />
    </div>
  );
};

export default function FeedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStory(null);
  };

  return (
    <div className="min-h-screen bg-[#f9f4f2]">
      <HomeNavbar />

      <main className="max-w-3xl mx-auto p-4 pt-24">
        <button
          onClick={() => {
            setEditingStory(null);
            setIsModalOpen(true);
          }}
          className="bg-[#ed835f] rounded-xl h-14 flex items-center justify-center mb-8 w-full shadow-md hover:bg-[#e07a51] transition duration-200"
        >
          <span className="text-white font-semibold text-lg">
            + Share Your Story
          </span>
        </button>

        <StoryCard onEdit={handleEdit} />
      </main>

      <ShareStoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={
          editingStory
            ? {
                id: editingStory.id,
                title: editingStory.title,
                description: editingStory.description,
                isAnonymous: editingStory.isAnonymous,
              }
            : null
        }
      />
    </div>
  );
}
