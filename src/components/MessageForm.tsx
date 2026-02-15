"use client";

import { messageSchema } from "@/lib/zod";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "./ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { RotatingPlaceholderTextarea } from "./RotatingPlaceholderTextarea";

type MessageFormProps = {
  username: string;
};

type MessageFormValues = z.input<typeof messageSchema>;

const MessageForm = ({ username }: MessageFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: "normal",
      senderName: "Anonymous",
    },
  });

  const messageType = form.watch("type");

  const onSubmit = async (data: MessageFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Sending your message...");

    try {
      const res = await axios.post(`/api/u/${username}/message`, data);

      toast.success(res.data.message || "Message sent!", { id: toastId });
      setSuccess(true);
      form.reset();
    } catch (error) {
      const msg =
        (error as AxiosError<{ message: string }>)?.response?.data?.message ||
        "Something went wrong";

      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h2 className="text-2xl font-bold text-green-600">Message Sent!</h2>
        <p>Your message has been delivered to @{username}.</p>
        <button
          onClick={() => setSuccess(false)}
          className="text-blue-500 underline"
        >
          Send another one?
        </button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Send a message to @{username}</h1>
        <p className="text-gray-500">
          Say something nice or set a future surprise.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 bg-white p-6 rounded-xl shadow-sm border"
        >
          <FormField
            control={form.control}
            name="senderName"
            render={({ field }) => {
              const isAnonymous = field.value === "Anonymous";

              return (
                <FormItem className="space-y-3">
                  <FormLabel>Sender</FormLabel>

                  {/* Radio Group */}
                  <RadioGroup
                    value={isAnonymous ? "anonymous" : "named"}
                    onValueChange={(val) => {
                      if (val === "anonymous") {
                        form.setValue("senderName", "Anonymous");
                      } else {
                        form.setValue("senderName", "");
                      }
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="anonymous" id="anon" />
                      <label htmlFor="anon">Send anonymously</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="named" id="named" />
                      <label htmlFor="named">Send with name</label>
                    </div>
                  </RadioGroup>

                  {/* Name Input Only If Named */}
                  {!isAnonymous && (
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  )}

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Message</FormLabel>
                <FormControl>
                  <RotatingPlaceholderTextarea
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <RadioGroup
            value={form.watch("type")}
            onValueChange={(val) =>
              form.setValue("type", val as "normal" | "delayed")
            }
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="normal" id="normal" />
              <label htmlFor="normal">Instant</label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delayed" id="delayed" />
              <label htmlFor="delayed">Delayed </label>
            </div>
          </RadioGroup>

          {messageType === "delayed" && (
            <div className="flex justify-center">
              <FormField
                control={form.control}
                name="unlockDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unlock Date</FormLabel>
                    <FormControl>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={{ before: new Date() }}
                        className="rounded-lg border"
                        captionLayout="dropdown"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MessageForm;
