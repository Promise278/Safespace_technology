"use client";

import { useRouter } from "next/navigation";
import { Shield, Home, MessageCircle, LogOut } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const HomeNavbar = () => {
  const router = useRouter();

  const [username] = useState(() => {
    if (typeof window === "undefined") return "User";
    return localStorage.getItem("username");
  });

  const handleLogout = () => {
    localStorage.removeItem("safespace_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_roles");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("safespace_user");

    router.push("/pages/signin");
  };

  return (
    <div className="flex justify-between items-center fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 md:px-72 px-4 z-10">
      <Link href="./HomeNav">
        <div className="flex items-center">
          <div className="md:w-10 w-8 md:h-10 h-8 rounded-full bg-[#f19469] flex items-center justify-center">
            <Shield size={22} color="white" />
          </div>
          <div className="ml-3">
            <h1 className="md:text-xl text-sm font-bold text-neutral-800">
              SafeSpace
            </h1>
            <p className="md:text-md text-sm text-neutral-500">
              Welcome, {username}
            </p>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-5 text-sm text-neutral-700">
        <button
          onClick={() => router.push("/pages/homepage")}
          className="items-center gap-1 hover:text-[#ed835f] flex"
        >
          <Home size={22} />
          <span className="md:flex hidden">Feed</span>
        </button>
        <button
          onClick={() => router.push("/pages/message")}
          className="items-center gap-1 hover:text-[#ed835f] flex"
        >
          <MessageCircle size={22} />
          <span className="md:flex hidden">Messages</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 hover:text-[#ed835f]"
        >
          <LogOut size={22} />
          <span className="md:flex hidden">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default HomeNavbar;
