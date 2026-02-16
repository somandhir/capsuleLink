"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, Copy, Inbox, Clock, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const TABS = [
    { id: "normal", label: "Normal", icon: Inbox, api: "/api/message/n" },
    { id: "delayed", label: "Delayed", icon: Clock, api: "/api/message/d" },
];

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("normal");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const [profileUrl, setProfileUrl] = useState("Loading link...");
    const [mounted, setMounted] = useState(false);

    // Construct the URL safely
    const username = (session?.user as any)?.username;
    useEffect(() => {
        setMounted(true);
        const currentUsername = (session?.user as any)?.username;
        if (currentUsername) {
            setProfileUrl(`${window.location.origin}/u/${currentUsername}`);
        }
    }, [session]);
    const fetchMessages = async (tabId: string) => {
        setLoading(true);
        const apiPath = TABS.find((t) => t.id === tabId)?.api;

        // Fallback: check localStorage for manual users, but Google users rely on Cookies
        const manualToken = localStorage.getItem("accessToken");
        const headers: any = {};
        if (manualToken) {
            headers["Authorization"] = `Bearer ${manualToken}`;
        }

        try {
            const { data } = await axios.get(apiPath!, {
                headers,
                withCredentials: true // Important for sending NextAuth cookies
            });

            // Your backend returns { data: { normalMessages: [...] } } or { data: { delayedMessages: [...] } }
            const fetchedMessages = data.data?.normalMessages || data.data?.delayedMessages || [];
            setMessages(fetchedMessages);

        } catch (error: any) {
            console.log("Fetch Error:", error.response?.data || error.message);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            fetchMessages(activeTab);
        }
    }, [activeTab, status]);

    if (!mounted) {
        return null; // Or a loading skeleton
    }

    const copyLink = () => {
        const username = (session?.user as any)?.username;
        if (!username) return toast.error("User not loaded yet");
        navigator.clipboard.writeText(profileUrl);
        toast.success("Capsule Link copied!");
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header & Visible Link Section */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Capsules</h1>
                    <p className="text-sm text-gray-500">Share your link to receive anonymous capsules</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            readOnly
                            value={profileUrl}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border rounded-xl text-sm font-mono text-gray-600 focus:outline-none"
                        />
                    </div>
                    <Button onClick={copyLink} className="bg-black text-white hover:bg-neutral-800 rounded-xl">
                        <Copy className="w-4 h-4 mr-2" /> Copy Link
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Tab Switcher and Refresh Button */}
            <div className="flex items-center justify-between">
                <div className="flex bg-neutral-100 p-1 rounded-xl border">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${isActive ? "text-black" : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <Icon className="w-4 h-4 relative z-10" />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchMessages(activeTab)}
                    disabled={loading}
                    className="rounded-xl"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            {/* Messages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="wait">
                    {messages.length > 0 ? (
                        messages.map((msg: any) => (
                            <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]"
                            >
                                <p className="text-gray-800 text-sm leading-relaxed mb-4">
                                    {msg.content}
                                </p>
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold text-gray-400 pt-4 border-t border-neutral-50">
                                    <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                    {activeTab === "delayed" && (
                                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                            Unlocks: {new Date(msg.unlockDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            {loading ? "Fetching capsules..." : "No messages found in this category."}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}