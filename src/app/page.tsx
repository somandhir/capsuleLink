"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";


export default function LandingPage() {
  return (
    <div className= "relative min-h-screen bg-white text-black selection:bg-neutral-200 overflow-x-hidden">
      <div className="absolute inset-0 z-0">
          <BackgroundRippleEffect rows={12} cols={30} />
        </div>
      {/* 🚀 Hero Section with Ripple Background */}
      <section className="w-full flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
        {/* The Background */}
        

        {/* The Content (Higher Z-Index) */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 text-xs font-bold uppercase tracking-widest text-neutral-500 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-blue-500" />
            Anonymous & Time-Locked
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-extrabold tracking-tighter"
          >
            Send messages <br />
            <span className="text-neutral-400">to the future.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-lg text-neutral-500 font-medium"
          >
            CapsuleLink lets you receive anonymous messages that only reveal themselves when the time is right.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="rounded-full px-8 bg-black hover:bg-neutral-800 text-white shadow-xl shadow-black/10">
              <Link href="/login">Get Started Free <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 bg-white/50 backdrop-blur-sm border-neutral-200" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              How it works
            </Button>
          </motion.div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Clock className="w-5 h-5" />}
          title="Delayed Release"
          description="Senders can set a specific date when their message becomes readable."
        />
        <FeatureCard
          icon={<Shield className="w-5 h-5" />}
          title="Fully Anonymous"
          description="No accounts required for senders. Pure, honest feedback and thoughts."
        />
        <FeatureCard
          icon={<Sparkles className="w-5 h-5" />}
          title="Dashboard"
          description="Manage your future capsules in a clean, organized, and modern space."
        />
      </section>

      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24 border-t border-neutral-100">
        <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <Step
            number="01"
            title="Create your Link"
            description="Sign up and get your unique CapsuleLink. Customize it to your vibe."
          />
          <Step
            number="02"
            title="Receive Capsules"
            description="Share your link. Friends send messages—instant or locked for a future date."
          />
          <Step
            number="03"
            title="The Unveiling"
            description="Get notified when a capsule unlocks. Read, reflect, and keep the memory."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-100 text-center text-neutral-400 text-sm">
        © 2026 CapsuleLink. Built by Soman Dhir.
      </footer>
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="space-y-4">
      <div className="text-4xl font-black text-neutral-300 ">{number}</div>
      <h3 className="font-bold text-xl">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 bg-neutral-50 border border-neutral-100 rounded-3xl space-y-4 hover:border-neutral-200 transition-colors">
      <div className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-black">
        {icon}
      </div>
      <h3 className="font-bold text-xl">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}