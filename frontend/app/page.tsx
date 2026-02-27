"use client"
import { useState } from "react";
// import { useRouter } from "next/router";
import { useRouter } from "next/navigation";
import { Shield, Heart, Users, MessageCircle } from "lucide-react";

const Index = () => {
  const router = useRouter();
  // const [isSubscribing, setIsSubscribing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Landing Page Navbar */}
      <header className="sticky top-0 z-50 bg-[#fffdfd] backdrop-blur supports-backdrop-filter:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f19469] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-display font-bold text-[#171717]">SafeSpace</h1>
            </div>
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 bg-[#fdf5f0]">
        <div className="absolute inset-0 bg-warm-gradient opacity-5" />
        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f19469] mb-6 shadow-card">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-[#171717] mb-6 leading-tight">
              SafeSpace
            </h1>
            <p className="text-md md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              A safe community platform for youth affected by gender-based violence
            </p>
            <p className="text-md md:text-lg text-[#171717/80] mb-8 max-w-2xl mx-auto">
              Share your story anonymously, receive support from trained counselors, and connect with others who understand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="text-lg h-13 md:h-14 px-6 md:px-8 shadow-card bg-[#ed835f] text-white rounded-xl transition hover:opacity-90"
                onClick={() => router.push("/pages/signup")}
              >
                Get Started
              </button>
              <button
                className="text-lg h-13 md:h-14 px-6 md:px-8 border border-gray-300 text-[#171717] rounded-xl transition hover:bg-[#db643d] hover:text-white"
                onClick={() => router.push("/pages/signup")}
              >
                Im a Supporter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[#f8f7f5]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-[#171717]">
            How SafeSpace Helps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-[#ffffff] shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#f09367] mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-[#171717]">
                Share Safely
              </h3>
              <p className="text-muted-foreground">
                Post your experiences anonymously in a judgment-free, supportive environment designed for healing.
              </p>
            </div>

            <div
              className="text-center p-6 rounded-2xl bg-[#ffffff] shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-16 h-16 rounded-full bg-[#89dfe2] mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-[#171717]">
                Receive Support
              </h3>
              <p className="text-muted-foreground">
                Get compassionate responses from trained supporters who understand and care about your wellbeing.
              </p>
            </div>

            <div
              className="text-center p-6 rounded-2xl bg-[#ffffff] shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-16 h-16 rounded-full bg-[#f56a3c] mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-[#171717]">
                Connect & Heal
              </h3>
              <p className="text-muted-foreground">
                Join a community of survivors and supporters working together toward healing and empowerment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Subscription Section */}
      {/* <section className="py-20 px-4">
        <div className="container mx-auto max-w-xl text-center">
          <div className="w-16 h-16 rounded-full bg-trust-gradient mx-auto mb-6 flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">
            Stay Connected
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to receive updates about new features, community stories, 
            and mental health resources directly to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              // value={email}
              // onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              // disabled={isSubscribing}
            />
            <button type="submit" disabled={isSubscribing}>
              {isSubscribing ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#fdfaf9]">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-[#171717]">
            You’re Not Alone
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Take the first step toward healing. Join SafeSpace today and find the support you deserve.
          </p>
          <button
            className="text-lg h-14 px-8 shadow-card bg-[#ed835f] text-white rounded-xl transition hover:opacity-90"
            onClick={() => router.push("/pages/signup")}
          >
            Join SafeSpace
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-4 bg-[#ffffff]">
        <div className="container mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          <p className="mb-2">
            <strong className="text-[#171717]">Crisis Helpline:</strong> If you’re in immediate danger, please call your local emergency services.
          </p>
          <p>SafeSpace is a peer support platform and does not replace professional mental health services.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;