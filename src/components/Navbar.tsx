"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Mail, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-neutral-200/50 bg-white/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ rotate: 12 }}
            className="bg-black p-1.5 rounded-lg text-white"
          >
            <Mail className="w-5 h-5" />
          </motion.div>
          <span className="font-bold text-xl tracking-tighter">CapsuleLink</span>
        </Link>

      

        {/* Right: Auth Logic */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" className="rounded-full gap-2 text-sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              
              <Button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                variant="outline" 
                className="rounded-full border-neutral-200"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full text-sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-full bg-black text-white hover:bg-neutral-800 text-sm px-5">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}