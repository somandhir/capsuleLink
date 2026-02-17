"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";

import { signInSchema } from "@/lib/zod"; // Ensure this uses your identifier/password schema
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
import axios from "axios";

type FormValues = z.infer<typeof signInSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const toastId = toast.loading("Checking credentials...");

    try {
        // Use NextAuth's signIn instead of axios
        const result = await signIn("credentials", {
            redirect: false,
            identifier: data.identifier, // This can be email or username
            password: data.password,
        });

        if (result?.error) {
            // Special handling for your verification logic
            if (result.error === "not verified") {
                toast.error("Please verify your account", { id: toastId });
                router.push(`/verify/${data.identifier}`);
            } else {
                toast.error(result.error || "Invalid credentials", { id: toastId });
            }
        } else {
            toast.success("Login successful!", { id: toastId });
            router.replace("/dashboard");
        }
    } catch (error) {
        toast.error("An unexpected error occurred", { id: toastId });
    } finally {
        setLoading(false);
    }
};

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/dashboard" });
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                        Sign in to check your messages and manage your capsule.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="identifier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username or Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="soman.dhir"
                                                {...field}
                                                suppressHydrationWarning
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                                suppressHydrationWarning
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Signing in..." : "Login"}
                            </Button>
                        </form>
                    </Form>

                    <div className="my-6 h-px bg-neutral-200" />

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        className="group/btn relative w-full flex items-center gap-2 overflow-hidden cursor-pointer"
                        suppressHydrationWarning
                    >
                        <FaGoogle className="h-4 w-4" />
                        Continue with Google
                    </Button>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <button
                        suppressHydrationWarning
                            onClick={() => router.push("/sign-up")}
                            className="text-black font-semibold hover:underline"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </main>
    );
}