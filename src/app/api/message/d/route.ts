import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import { verifyJWT } from "@/helpers/verifyJWT";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const payload = verifyJWT(req);
    
    const idString = session?.user?._id || payload?._id || payload?.id;
    
    if (!idString) {
      console.log("No user ID found in session or token");
      return NextResponse.json(
        new ApiError(401, "Unauthorized - no user ID"),
        { status: 401 }
      );
    }

    let userId;
    try {
      userId = new mongoose.Types.ObjectId(idString);
    } catch (err) {
      console.log("Invalid ObjectId:", idString, err);
      return NextResponse.json(
        new ApiError(400, "Invalid user ID format"),
        { status: 400 }
      );
    }

    console.log("Fetching delayed messages for userId:", userId);
    const delayedMessages = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
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
    
    console.log("Found delayed messages:", delayedMessages.length);
    
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
