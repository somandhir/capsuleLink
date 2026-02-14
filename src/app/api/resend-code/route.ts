import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { redis } from "@/lib/redis";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const user = await User.findById(userId);

    const redisKey = `resend-cooldown:${userId}`;
    const isLocked = await redis.get(redisKey);

    if (isLocked) {
      return NextResponse.json(
        new ApiResponse(
          429,
          {},
          "Please wait 60 seconds before requesting again",
        ),
        {
          status: 429,
        },
      );
    }

    if (!user) {
      return NextResponse.json(new ApiResponse(404, {}, "user not found"), {
        status: 404,
      });
    }
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verifyCode;
    user.codeExpiry = new Date(Date.now() + 3600000);
    await user.save();

    await redis.set(redisKey, "true", { ex: 60 });

    const emailResponse = await sendVerificationEmail(
      user.email,
      user.username,
      verifyCode,
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      new ApiResponse(200, {}, "verification code sent successfully"),
    );
  } catch (error) {
    console.log("error in resend-code route");
    return NextResponse.json(new ApiError(500, "internal server error"), {
      status: 500,
    });
  }
}
