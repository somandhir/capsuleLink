"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCcw,
  Copy,
  Inbox,
  Clock,
  Link as LinkIcon,
  ShieldCheck,
  ShieldOff
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const TABS = [
  { id: "normal", label: "Normal", icon: Inbox, api: "/api/message/n" },
  { id: "delayed", label: "Delayed", icon: Clock, api: "/api/message/d" }
];

export default function Dashboard() {
  const { data: session, status } = useSession();

  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState("normal");
  const [messages, setMessages] = useState<any[]>([]);
  const [counts, setCounts] = useState({ normal: 0, delayed: 0 });

  const [loading, setLoading] = useState(true);

  const [profileUrl, setProfileUrl] = useState("");
  const [accepting, setAccepting] = useState<boolean | null>(null);
  const [updatingAccept, setUpdatingAccept] = useState(false);

  useEffect(() => setMounted(true), []);

  // ✅ INIT USER DATA
  useEffect(() => {
    if (status === "authenticated") {
      const username = (session.user as any)?.username;

      setProfileUrl(`${window.location.origin}/u/${username}`);
      setAccepting((session.user as any)?.isAcceptingMessage);
    }
  }, [status, session]);

  // ✅ INITIAL PARALLEL FETCH (counts + first tab messages)
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchAll = async () => {
      try {
        setLoading(true);

        const [normalRes, delayedRes] = await Promise.all([
          axios.get("/api/message/n", { withCredentials: true }),
          axios.get("/api/message/d", { withCredentials: true })
        ]);

        const normalMsgs = normalRes.data.data?.normalMessages || [];
        const delayedMsgs = delayedRes.data.data?.delayedMessages || [];

        setCounts({
          normal: normalMsgs.length,
          delayed: delayedMsgs.length
        });

        setMessages( normalMsgs );
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [status]);

  // ✅ TAB SWITCH FETCH (fresh data)
  const fetchMessages = async (tabId: string) => {
    try {
      setLoading(true);

      const apiPath = TABS.find((t) => t.id === tabId)?.api;

      const { data } = await axios.get(apiPath!, { withCredentials: true });

      const fetched =
        data.data?.normalMessages ||
        data.data?.delayedMessages ||
        [];

      setMessages(fetched);

      setCounts((prev) => ({
        ...prev,
        [tabId]: fetched.length
      }));
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchMessages(activeTab);
  }, [activeTab]);

  // ✅ TOGGLE
  const toggleAcceptMessages = async () => {
    if (accepting === null) return;

    const optimistic = !accepting;
    setAccepting(optimistic);

    try {
      const { data } = await axios.patch(
        "/api/accept-message",
        {},
        { withCredentials: true }
      );

      setAccepting(data.data.isAcceptingMessage);
    } catch {
      setAccepting(!optimistic);
      toast.error("Failed to update");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied!");
  };

  if (!mounted || status === "loading") return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      {/* 🔥 CONTROL CENTER */}
      <div className="bg-gradient-to-br from-white to-neutral-50 border rounded-2xl p-6 shadow-sm space-y-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Share your link & manage incoming capsules
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white border px-4 py-2 rounded-xl">

            {accepting === null ? (
              <span className="text-sm text-gray-400">Loading...</span>
            ) : accepting ? (
              <>
                <ShieldCheck className="text-green-600 w-4 h-4" />
                <span className="text-sm font-medium">Receiving messages</span>
              </>
            ) : (
              <>
                <ShieldOff className="text-gray-400 w-4 h-4" />
                <span className="text-sm font-medium">Paused</span>
              </>
            )}

            {accepting !== null && (
              <Switch
                checked={accepting}
                onCheckedChange={toggleAcceptMessages}
                disabled={updatingAccept}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              readOnly
              value={profileUrl}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 border rounded-xl text-sm font-mono"
            />
          </div>

          <Button onClick={copyLink} className="rounded-xl">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>

      <Separator />

      {/* 🧭 TABS */}
      <div className="flex justify-between items-center">

        <div className="flex bg-neutral-100 p-1 rounded-xl border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-4 py-2 text-sm font-medium"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  />
                )}

                <span className="relative flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className="text-xs text-gray-400">
                    {counts[tab.id as "normal" | "delayed"]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchMessages(activeTab)}
        >
          <RefreshCcw className={loading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
        </Button>
      </div>

      {/* 💌 MESSAGES */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-neutral-100 animate-pulse" />
          ))}

        <AnimatePresence>
          {!loading &&
            messages.map((msg) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-[1px] rounded-2xl bg-gradient-to-br from-neutral-200 to-transparent"
              >
                <div className="p-5 bg-white rounded-2xl h-full flex flex-col justify-between hover:shadow-md transition">

                  <p className="text-sm text-gray-800 line-clamp-4">
                    {msg.content}
                  </p>

                  <div className="text-xs text-gray-400 flex justify-between pt-4 border-t mt-4">
                    <span>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>

                    {activeTab === "delayed" && (
                      <span className="text-amber-600 font-medium">
                        Unlocks {new Date(msg.unlockDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>

        {!loading && messages.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            No capsules yet 📭
          </div>
        )}
      </div>
    </div>
  );
}
