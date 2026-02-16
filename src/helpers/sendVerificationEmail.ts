import { resend } from "@/lib/resend";
import { ApiError, ApiResponse } from "./apiUtils";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Capsule Link | Verification code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    return new ApiResponse(200, data, "Verification email sent successfully");
  } catch (emailError) {
    console.error("error sending verification email ", emailError);
    throw new ApiError(500, "internal server error");
  }
}
