import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        new ApiResponse(403, {}, "invalid credentials"),
        {
          status: 403,
        },
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(new ApiResponse(403, {}, "not verified"), {
        status: 403,
      });
    }

    const userPassword = user?.passwordHash;
    const isPasswordCorrect = await bcrypt.compare(password, userPassword);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        new ApiResponse(403, {}, "invalid credentials"),
        {
          status: 403,
        },
      );
    }
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1d" },
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json(
      new ApiResponse(200, { accessToken }, "Login successful"),
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.log("Error in login controller: ", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
