import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import { verifyJWT } from "@/helpers/verifyJWT";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const payload = verifyJWT(req);
    if (!payload) {
      return NextResponse.json(
        new ApiResponse(401, {}, "unauthorized request"),
        {
          status: 401,
        },
      );
    }
    const userId = payload.id;
    const newUser = await User.findByIdAndUpdate(
      userId,
      [
        {
          $set: {
            isAcceptingMessage: { $not: "$isAcceptingMessage" },
          },
        },
      ],
      { new: true },
    );
    return NextResponse.json(
      new ApiResponse(200, newUser, "user updated successfully"),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log("Error is accept-message controller: ", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
