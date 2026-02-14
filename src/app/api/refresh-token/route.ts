import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        new ApiResponse(401, {}, "Refresh token missing"),
        { status: 401 },
      );
    }
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      return NextResponse.json(
        new ApiResponse(403, {}, "Invalid or expired refresh token"),
        { status: 403 },
      );
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        new ApiResponse(404, {}, "User no longer exists"),
        { status: 404 },
      );
    }
    const newAccessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1d" },
    );
    return NextResponse.json(
      new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed"),
    );
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
