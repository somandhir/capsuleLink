"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MessageCardProps {
  msg: any;
  activeTab: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MessageCard({ msg, activeTab, onOpen, onDelete }: MessageCardProps) {
  const locked = activeTab === "delayed" && !msg.isUnlocked;

  const previewContent = msg.content.length > 20
    ? msg.content.slice(0, 20) + "..."
    : msg.content;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => onOpen(msg._id)}
      className={`cursor-pointer group p-6 relative bg-white border border-neutral-200 rounded-3xl shadow-sm hover:shadow-md hover:border-neutral-300 transition-all flex flex-col justify-between min-h-[180px] 
      ${locked ? "cursor-not-allowed opacity-80" : "hover:scale-[1.02]"}`}
    >
      {/* 🔵 NEW MESSAGE INDICATOR */}
      {!msg.isRead && !locked && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">New</span>
        </div>
      )}

      {/* DELETE ACTION */}
      <div onClick={(e) => e.stopPropagation()}> {/* Prevent modal opening when clicking delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="absolute top-4 right-4 p-2 bg-white/80 rounded-xl border z-30 transition-all
              opacity-100 text-red-500 border-neutral-100 
              hover:hover:opacity-0 hover:hover:group-hover:opacity-100 
              hover:hover:text-neutral-400 hover:hover:hover:text-red-600"
              title="Delete Message"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-bold">Destroy this capsule?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(msg._id)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-2xl"
              >
                Delete Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className={`text-gray-800 text-sm md:text-base leading-relaxed font-medium italic transition-all duration-300 mt-4
        ${locked ? "blur-sm select-none" : ""}`}>
        "{locked ? "Hidden Content" : previewContent}"
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
              {new Date(msg.createdAt).toLocaleDateString()}
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
  );
}