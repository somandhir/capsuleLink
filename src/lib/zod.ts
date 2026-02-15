import { z } from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      /^(?![_.])(?!.*[_.]$)[a-z0-9._]+$/,
      "Username can only contail lowercase letters, numbers, _ and . are allowed, cannot start or end with _ or .",
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const messageSchema = z
  .object({
    content: z
      .string()
      .min(10, "Message must be at least 10 characters")
      .max(500, "Message cannot exceed 500 characters"),
    type: z.enum(["normal", "delayed"]),
    senderName: z
      .string()
      .max(30, "Name is too long")
      .optional()
      .default("Anonymous"),
    unlockDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "delayed" && !data.unlockDate) {
        return false;
      }
      return true;
    },
    {
      message: "Unlock date is required for delayed messages",
      path: ["unlockDate"],
    },
  );

export const signInSchema = z.object({
  identifier: z.string().min(1, "Email or Username is required"), // Flexible for both
  password: z.string().min(1, "Password is required"),
});

export const verifySchema = z.object({
  code: z.string().length(6, "Verification code must be exactly 6 digits"),
});


export const acceptMessageSchema = z.object({
  acceptMessages: z.boolean(),
});

