"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { verifySchema } from "@/lib/zod"; // Ensure you have this in your zod schemas
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof verifySchema>;

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  // Handle countdown for the Resend button cooldown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const toastId = toast.loading("Verifying your account...");
console.log("hellooo");
  const username = params?.username?.toString();


    try {
      console.log(username, data.code)
      const res = await axios.post("/api/verify-code", {
        identifier : username,
        code: data.code,
      });

      toast.success(res.data.message || "Account verified!", { id: toastId });
      router.push("/login");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Invalid verification code", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    const toastId = toast.loading("Resending code...");

    try {
      const res = await axios.post("/api/resend-code", { identifier: username });
      toast.success(res.data.message || "New code sent to your email", { id: toastId });
      setTimer(60);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Wait before resending", {
        id: toastId,
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Verify Your Account</h1>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            We've sent a 6-digit verification code to your email. Enter it below
            to activate your profile.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        className="text-center tracking-[0.5em] text-lg font-bold"
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Verifying..." : "Verify Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={onResend}

                disabled={timer > 0 || resending}
                className="text-black font-semibold hover:underline disabled:text-gray-400 disabled:no-underline transition"
              >
                {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}