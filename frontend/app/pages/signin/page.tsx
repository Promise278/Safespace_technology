"use client";
import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://safespace-technology-1.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (res.ok && data.token) {
        localStorage.setItem("safespace_token", data.token);
        const username = data.user?.username || data.username;
        localStorage.setItem("username", username);
        // Save full user object for messaging and other features
        if (data.user) {
          localStorage.setItem("safespace_user", JSON.stringify(data.user));
        }

        toast.success("User Login Successfully! 🎉", {
          duration: 3000,
          position: "top-right",
        });

        // Redirect to feed/dashboard
        setTimeout(() => {
          router.push("/pages/homepage");
        }, 1000);
      } else {
        toast.error(data.message || "Invalid email or password", {
          duration: 5000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please check your connection.", {
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
            <Link href="/">
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
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#f19469] flex items-center justify-center mx-auto shadow">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-4">SafeSpace</h1>
            <p className="text-gray-500 mt-1">A safe place to share and heal</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Sign in to continue supporting our community
            </p>

            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="w-full mt-1 px-4 py-2 rounded-lg text-black border border-gray-300 bg-white focus:ring-2 focus:ring-[#f19469] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    className="w-full pr-12 pl-4 py-2 rounded-lg text-black border border-gray-300 bg-white focus:ring-2 focus:ring-[#f19469] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[#f19469] p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-lg bg-[#ed835f] text-white font-medium hover:bg-[#db724f] transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Switch Auth */}
            <p className="mt-4 text-center text-sm text-gray-600">
              Need an account?{" "}
              <button
                onClick={() => router.push("/pages/signup")}
                className="text-[#ed835f] font-medium hover:underline disabled:opacity-50"
                disabled={loading}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
