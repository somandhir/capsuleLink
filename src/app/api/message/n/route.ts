import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import { verifyJWT } from "@/helpers/verifyJWT";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const payload = verifyJWT(req);

    // console.log("GET /api/message/n - Session:", {
    //   hasSession: !!session,
    //   userId: session?.user?._id,
    //   username: (session?.user as any)?.username,
    // });
    // console.log("GET /api/message/n - JWT payload:", {
    //   hasPayload: !!payload,
    //   _id: payload?._id,
    //   id: payload?.id,
    // });

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

    console.log("Fetching messages for userId:", userId);
    const normalMessages = await Message.find({
      receiverId: userId,
      type: "normal",
    }).sort({ createdAt: -1 });

    console.log("Found messages:", normalMessages.length);

    if (normalMessages.length === 0) {
      return NextResponse.json(
        new ApiResponse(200, {}, "no normal  messages"),
        {
          status: 200,
        }
      );
    }
    return NextResponse.json(
      new ApiResponse(200, { normalMessages }, "messages fetched successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in normal messages controller: ", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
