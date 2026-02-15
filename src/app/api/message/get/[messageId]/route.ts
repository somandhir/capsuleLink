import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import { verifyJWT } from "@/helpers/verifyJWT";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { ObjectId } from "mongoose";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { messageId: string } },
) {
  try {
    await dbConnect();

    const payload = verifyJWT(req);
    if (!payload) {
      return NextResponse.json(
        new ApiResponse(401, {}, "unauthorized request"),
        { status: 401 },
      );
    }

    const userId = payload.id;
    const { messageId } = await params;

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: userId,
      },
      { $set: { isRead: true } },
      { new: true },
    );

    if (!message) {
      return NextResponse.json(
        new ApiResponse(404, {}, "message not found or not allowed"),
        { status: 404 },
      );
    }

    return NextResponse.json(
      new ApiResponse(200, message, "message fetched successfully"),
      { status: 200 },
    );
  } catch (error) {
    console.log("Error in get message controller: ", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
