"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Inbox, User } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";

interface MessageViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  message: any;
}

export default function MessageViewDialog({ isOpen, onOpenChange, message }: MessageViewDialogProps) {
  const countdown = useCountdown(message?.unlockDate);
  const isLocked = message?.type === "delayed" && new Date(message.unlockDate) > new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Message from {message?.senderName || "Anonymous"}</DialogTitle>
          <DialogDescription>Viewing capsule content</DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-b from-neutral-50 to-white p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sender</span>
                <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                  {message?.senderName || "Anonymous"}
                </h2>
              </div>
            </div>
            <div className="bg-neutral-100 px-3 py-1 rounded-full text-[10px] font-bold text-neutral-500 uppercase">
              {message?.type === 'normal' ? 'Instant' : 'Delayed'}
            </div>
          </div>

          {isLocked ? (
            <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl text-center space-y-4 my-6">
              <Clock className="w-8 h-8 text-amber-600 animate-pulse mx-auto" />
              <div>
                <p className="text-sm font-bold text-amber-900">Unlocking in</p>
                <div className="text-2xl font-black text-amber-700 font-mono tracking-tighter mt-1">
                  {countdown}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm mb-6">
              <p className="text-lg text-neutral-800 leading-relaxed font-medium italic">
                "{message?.content}"
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-neutral-400 text-[10px] font-bold uppercase tracking-widest border-t pt-6">
            <div className="flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5" />
              Received {message && new Date(message.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}