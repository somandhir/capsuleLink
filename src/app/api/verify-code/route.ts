import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { userId, code } = await req.json();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        new ApiResponse(404, {}, "user with the given username doesn't exist"),
        { status: 404 },
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        new ApiResponse(200, {}, "user already verified"),
        { status: 200 },
      );
    }

    const expiryDate = user.codeExpiry;
    if (!expiryDate) {
      console.log("expiry date is undefined");
      return NextResponse.json(
        new ApiResponse(500, {}, "internal server error"),
        { status: 500 },
      );
    }
    if (new Date() > expiryDate) {
      return NextResponse.json(
        new ApiResponse(
          403,
          {},
          "code expired, please ask for new code and than verify",
        ),
        { status: 403 },
      );
    }

    if (code !== user.verificationCode) {
      return NextResponse.json(new ApiResponse(403, {}, "incorrect code"), {
        status: 403,
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.codeExpiry = undefined;
    await user.save();

    return NextResponse.json(
      new ApiResponse(200, {}, "Code verified successfully, now you can login"),
    );
  } catch (error) {
    console.log("error in verify code route");
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
