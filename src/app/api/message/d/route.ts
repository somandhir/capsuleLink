import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import { verifyJWT } from "@/helpers/verifyJWT";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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
    const delayedMessages = await Message.aggregate([
      {
        $match: {
          receiverId: new mongoose.Types.ObjectId(userId),
          type: "delayed",
        },
      },
      {
        $addFields: {
          content: {
            $cond: {
              if: { $gt: [new Date(), "$unlockDate"] },
              then: "$content",
              else: "can only see after the unlock date",
            },
          },
        },
      },
    ]);
    if (delayedMessages.length === 0) {
      return NextResponse.json(
        new ApiResponse(200, {}, "no delayed messages"),
        {
          status: 200,
        },
      );
    }
    return NextResponse.json(
      new ApiResponse(
        200,
        { delayedMessages },
        "messages fetched successfully",
      ),
      { status: 200 },
    );
  } catch (error) {
    console.log("Error in delayed messages controller: ", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
