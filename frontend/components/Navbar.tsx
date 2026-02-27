"use client"
import { Shield, MessageSquare, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  username?: string;
}

const Navbar = ({ username }: NavbarProps) => {
    const router = useRouter();

  const handleSignOut = async () => {
    router.push("/"); 
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warm-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">SafeSpace</h1>
              {username && <p className="text-xs text-muted-foreground">Welcome, {username}</p>}
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <Link 
              href="/feed"
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </Link>
            <Link 
              href="/messages"
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </Link>
            <button onClick={handleSignOut} className="ml-2">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;