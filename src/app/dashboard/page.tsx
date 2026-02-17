"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  Copy,
  Inbox,
  Clock,
  Link as LinkIcon,
  Loader2,
  ExternalLink,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const TABS = [
  { id: "normal", label: "Normal", icon: Inbox, api: "/api/message/n" },
  { id: "delayed", label: "Delayed", icon: Clock, api: "/api/message/d" },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  console.log(session, status);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("normal");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  const [accepting, setAccepting] = useState<boolean | null>(null);
  const [updatingAccept, setUpdatingAccept] = useState(false);

  const [counts, setCounts] = useState({ normal: 0, delayed: 0 });

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);


  useEffect(() => {
    setMounted(true);
    console.log(status);
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const username = (session?.user as any)?.username;
    if (username && typeof window !== "undefined") {
      setProfileUrl(`${window.location.origin}/u/${username}`);
    }
  }, [session]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (status === "authenticated") {
        try {
          // Create this simple endpoint or use an existing user data endpoint
          const { data } = await axios.get("/api/get-user-settings");
          setAccepting(data.isAcceptingMessage);
        } catch (error) {
          // Fallback to session if API fails
          setAccepting((session?.user as any).isAcceptingMessage ?? true);
        }
      }
    };

    fetchSettings();
  }, [session, status]);

  const toggleAcceptMessages = async () => {
    setUpdatingAccept(true);
    try {
      const response = await axios.post("/api/accept-message", {
        acceptMessages: !accepting,
      });

      if (response.data.success) {
        setAccepting(!accepting);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingAccept(false);
    }
  };

  const fetchMessages = async (tabId: string) => {
    setLoading(true);
    const apiPath = TABS.find((t) => t.id === tabId)?.api;

    const manualToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const headers: any = {};
    if (manualToken) {
      headers["Authorization"] = `Bearer ${manualToken}`;
    }

    try {
      const { data } = await axios.get(apiPath!, {
        headers,
        withCredentials: true
      });

      const fetchedMessages = data.data?.normalMessages || data.data?.delayedMessages || [];
      setMessages(fetchedMessages);
      setCounts(prev => ({
        ...prev,
        [tabId]: fetchedMessages.length
      }));

    } catch (error: any) {
      console.error("Fetch Error:", error.response?.data || error.message);
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

  const fetchCounts = async () => {
    try {
      const [normalRes, delayedRes] = await Promise.all([
        axios.get("/api/message/n"),
        axios.get("/api/message/d")
      ]);

      setCounts({
        normal: normalRes.data.data?.normalMessages?.length || 0,
        delayed: delayedRes.data.data?.delayedMessages?.length || 0
      });
    } catch (error) {
      console.error("Error fetching counts", error);
    }
  };
  useEffect(() => {
    if (status === "authenticated") {
      fetchCounts();
    }
  }, [status]);

  const copyLink = () => {
    if (!profileUrl || profileUrl.includes("undefined")) {
      return toast.error("Profile link not ready yet");
    }
    navigator.clipboard.writeText(profileUrl);
    toast.success("Capsule Link copied!");
  };

  const openMessage = async (msgId: string) => {
    try {
      const res = await axios.get(`/api/message/get/${msgId}`);
      if (res.data.success) {
        setSelectedMessage(res.data.data);
        setIsViewOpen(true);
        fetchMessages(activeTab);
      }
    } catch (error) {
      console.log("error in opening message : ", error)
      toast.error("Could not open capsule");
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this capsule?")) return;

    try {
      const res = await axios.delete(`/api/message/delete/${messageId}`);
      if (res.data.success) {
        toast.success("Capsule destroyed!");
        // 🔄 Refresh the messages list
        fetchMessages(activeTab);
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-400" />
        <p className="text-neutral-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }


  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">

      <div className="bg-gradient-to-br from-white to-neutral-50 border rounded-3xl p-6 shadow-sm space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Share your link & manage incoming capsules
            </p>
          </div>

          {/* Status Toggle Box */}
          <div className="flex items-center gap-4 bg-white border border-neutral-200 px-5 py-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              {accepting === null ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : accepting ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-gray-700">Receiving</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span className="text-sm font-semibold text-gray-400">Paused</span>
                </div>
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Switch
                checked={accepting || false}
                onCheckedChange={toggleAcceptMessages}
                disabled={updatingAccept || accepting === null}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </div>

        {/* Link Sharing Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow group">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              readOnly
              value={profileUrl || "Generating link..."}
              className="w-full pl-11 pr-4 py-3 bg-neutral-100/50 border border-neutral-200 rounded-2xl text-sm font-mono text-gray-600 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>

          <Button
            onClick={copyLink}
            className="bg-black cursor-pointer text-white hover:bg-neutral-800 rounded-2xl px-8 h-[46px] transition-all active:scale-95"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      <Separator className="opacity-50" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            // Get count for this specific tab
            const count = tab.id === "normal" ? counts.normal : counts.delayed;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${isActive ? "text-black" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-black/5"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}

                <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-black" : "text-gray-400"}`} />

                <span className="relative z-10">{tab.label}</span>

                <span
                  className={`relative z-10 ml-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${isActive
                    ? " text-neutral-500"
                    : " text-neutral-500"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="icon"
          onClick={() => fetchMessages(activeTab)}
          disabled={loading}
          className="rounded-2xl w-12 h-12 bg-white border shadow-sm hover:bg-neutral-50"
        >
          <RefreshCcw className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {messages.length > 0 ? (
            messages.map((msg: any) => {
              const locked = activeTab === "delayed" && !msg.isUnlocked;

              const previewContent = msg.content.length > 20
                ? msg.content.slice(0, 20) + "..."
                : msg.content;

              return (

                <motion.div
                  key={msg._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => !locked && openMessage(msg._id)}
                  className={`
                  cursor-pointer group p-6 relative bg-white border border-neutral-200 rounded-3xl shadow-sm hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between min-h-[180px] 
                 ${locked ? "cursor-not-allowed" : "hover:scale-[1.02]"}
                  `}
                >


                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="absolute top-4 right-4 p-2 bg-white/80 rounded-xl border z-30 transition-all
        opacity-100 text-red-500 border-neutral-100 
        hover:hover:opacity-0 
        hover:hover:group-hover:opacity-100 
        hover:hover:text-neutral-400 
        hover:hover:hover:text-red-600 
        hover:hover:border-transparent 
        hover:hover:hover:border-red-100"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Destroy this capsule?</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-500">
                          This action cannot be undone. This message will be permanently removed from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-2xl border-neutral-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(msg._id)}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all active:scale-95"
                        >
                          Delete Forever
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <p
                    className={`text-gray-800 text-sm md:text-base leading-relaxed font-medium italic transition-all duration-300
                    ${locked ? "blur-sm select-none" : ""}
                   `}
                  >
                    {previewContent}
                  </p>

                  <div className="mt-6">
                    <div className="mb-3 flex items-end gap-2">
                      <div className="h-px grow bg-neutral-100" />
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-white px-2">
                        From: {msg.senderName || "Anonymous"}
                      </span>
                      <div className="h-px grow bg-neutral-100" />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Received</span>
                        <span className="text-xs text-neutral-500 font-medium">
                          {new Date(msg.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {activeTab === "delayed" && (
                        <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 flex flex-col items-end">
                          <span className="block text-[8px] font-black text-amber-600 uppercase tracking-tighter">Unlocks On</span>
                          <span className="text-[10px] text-amber-700 font-bold">
                            {new Date(msg.unlockDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-300"
            >
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Inbox className="w-8 h-8 text-neutral-300" />
              </div>
              <p className="text-gray-500 font-medium">
                {loading ? "Decrypting your capsules..." : `No ${activeTab} messages yet.`}
              </p>
              <p className="text-xs text-neutral-400 mt-1">Share your link to get the conversation started!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">

          {/* 1. Add DialogHeader with Title and Description for Accessibility */}
          <DialogHeader className="sr-only">
            <DialogTitle>Message from {selectedMessage?.senderName || "Anonymous"}</DialogTitle>
            <DialogDescription>Viewing your anonymous capsule content.</DialogDescription>
          </DialogHeader>

          <div className="bg-gradient-to-b from-neutral-50 to-white p-8">
            {/* 2. Your existing Vibe UI logic starts here */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                  Capsule Content
                </span>
                <h2 className="text-xl font-bold text-neutral-900">
                  From {selectedMessage?.senderName || "Anonymous"}
                </h2>
              </div>
              <div className="bg-neutral-100 px-3 py-1 rounded-full text-[10px] font-bold">
                {selectedMessage?.type === 'normal' ? 'INSTANT' : 'TIME-DELAYED'}
              </div>
            </div>

            <p className="text-lg text-neutral-800 leading-relaxed font-medium italic mb-8">
              "{selectedMessage?.content}"
            </p>

            <div className="flex items-center gap-4 text-neutral-500 text-xs border-t pt-6">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {new Date(selectedMessage?.createdAt).toLocaleDateString()}
              </div>
              {selectedMessage?.type === 'delayed' && (
                <div className="text-amber-600 font-semibold">
                  Unlocked on {new Date(selectedMessage?.unlockDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}