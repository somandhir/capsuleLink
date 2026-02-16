"use client";

import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value?: string;
  onChange: (val: string) => void;
};

export function RotatingPlaceholderTextarea({ value, onChange }: Props) {
  const placeholders = [
    "Write something kind 🌸",
    "Leave a future surprise message 🎁",
    "Say something you always wanted to say 💬",
    "Send anonymous appreciation 🕵️✨",
    "Drop a wholesome message 🌼",

    "If you could say ONE thing… what would it be? 👀",
    "Confess something anonymously 👀",
    "Drop your best compliment here ",
    "Tell them what you really think… (be nice tho 😄)",

    // Goofy / fun
    "This is your villain monologue moment 😈",
    "Future you will read this… no pressure ⏳😅",
    "Type like nobody is screenshotting 📸😂",
    "Be honest… we won’t tell (probably) 🤫",
    "Send emotional damage… or love… your choice 💀❤️",
    "This message will age like milk or wine 🥛🍷",
    "Write something that makes them go 'aww' 🥺",
    "Write something that makes them go 'WHAT?!' 🤯",
    "If this was your last text… what would you send? 📱😶",
    "Drop lore. We love lore. 📜🧙‍♂️",
    "Main character moment — go 🧍‍♂️✨",
  ];
  const [placeholder, setPlaceholder] = useState("");

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (value && value.length > 0) return;

    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => {
          let next = prev;
          while (next === prev && placeholders.length > 1) {
            next = Math.floor(Math.random() * placeholders.length);
          }
          setPlaceholder(placeholders[next]);
          return next;
        });
        setVisible(true);
      }, 300); // fade out time
    }, 3000);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="relative">
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        className="min-h-[120px] relative z-10"
      />

      {/* Animated Placeholder Overlay */}
      {!value && (
        <div
          className={`
            absolute left-3 top-2 pointer-events-none
            transition-all duration-300 ease-out
            ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
            text-gray-400
          `}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
