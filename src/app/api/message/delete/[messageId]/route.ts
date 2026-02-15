import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import { verifyJWT } from "@/helpers/verifyJWT";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { ObjectId } from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } },
) {
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
    const { messageId } = await params;
    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json(
        new ApiResponse(404, {}, "no message with the given id found"),
        {
          status: 404,
        },
      );
    }
    if (message.receiverId !== userId) {
      return NextResponse.json(
        new ApiResponse(403, {}, "not allowed to delete this message"),
        {
          status: 403,
        },
      );
    }
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    return NextResponse.json(
      new ApiResponse(204, deletedMessage, "message deleted successfully"),
      {
        status: 204,
      },
    );
  } catch (error) {
    console.log("Error in delete messages controller: ", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
