"use client";

import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState("sharer");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (role.length === 0) {
      toast.error("Please select at least one role");
      setLoading(false);
      return;
    }

    if (!username.trim() || !email.trim() || !password.trim() || !role) {
      toast.error("Please fill all fields");
      setLoading(false);
      return;
    }

    console.log("Sending roles to backend:", role);

    try {
      const res = await fetch("https://safespace-technology-1.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (res.ok) {
        toast.success("User registered successfully! 🎉", {
          duration: 4000,
          position: "top-right",
        });

        setTimeout(() => {
          setUsername("");
          setEmail("");
          setPassword("");
          setRole("sharer");
          router.push("/pages/signin");
        }, 1500);
      } else {
        toast.error("All fields are Required", {
          style: {
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
          },
          duration: 5000,
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", {
        duration: 5000,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#fffdfd] backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href='/'>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f19469] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-display font-bold text-[#171717]">
                  SafeSpace
                </h1>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-[#171717] bg-transparent border border-transparent rounded-xl hover:bg-[#f37552] hover:text-white transition md:flex hidden"
                onClick={() => router.push("/pages/signin")}
              >
                Sign In
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-[#ed835f] rounded-xl shadow hover:opacity-90 transition"
                onClick={() => router.push("/pages/signup")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>
      <Toaster />
      <div className="min-h-screen flex items-center justify-center bg-[#fff8f4] px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#f19469] flex items-center justify-center mx-auto shadow">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">SafeSpace</h1>
            <p className="text-gray-500">A safe place to share and heal</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Join SafeSpace
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Create an account to share or provide support
            </p>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Username */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#f19469] focus:outline-none disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  I want to:
                </label>
                <div className="space-y-3">
                  {/* Share my story (Sharer) */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group hover:shadow-sm ${
                      role === "sharer"
                        ? "border-[#f19469] bg-[#fff2ea] shadow-md ring-2 ring-[#f19469]/20"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="sharer"
                      checked={role === "sharer"}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading}
                      className="mt-1 mr-3 w-5 h-5 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#f19469] focus:border-[#f19469] checked:bg-[#f19469] checked:border-[#f19469] transition-all duration-200 cursor-pointer"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        Share my story
                      </p>
                      <p className="text-sm text-gray-500">
                        Seek support and connect with others who understand
                      </p>
                    </div>
                  </label>

                  {/* Provide support (Supporter) */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group hover:shadow-sm ${
                      role === "supporter"
                        ? "border-[#f19469] bg-[#fff2ea] shadow-md ring-2 ring-[#f19469]/20"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="supporter"
                      checked={role === "supporter"}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading}
                      className="mt-1 mr-3 w-5 h-5 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#f19469] focus:border-[#f19469] checked:bg-[#f19469] checked:border-[#f19469] transition-all duration-200 cursor-pointer"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        Provide support
                      </p>
                      <p className="text-sm text-gray-500">
                        Help others and offer comfort as a trained supporter
                      </p>
                    </div>
                  </label>
                </div>
                {/*  Role preview */}
                <p className="mt-3 text-xs text-gray-500 text-center">
                  Selected:{" "}
                  <span className="font-medium text-[#f19469] capitalize">
                    {role}
                  </span>
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#f19469] focus:outline-none disabled:bg-gray-100"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pr-12 pl-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#f19469] focus:outline-none disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#f19469] p-1 rounded transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !username ||
                  !email ||
                  !password ||
                  role.length === 0
                }
                className="w-full py-3 rounded-lg bg-[#ed835f] text-white font-medium hover:bg-[#db724f] transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/pages/signin")}
                className="text-[#ed835f] font-medium hover:underline"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
