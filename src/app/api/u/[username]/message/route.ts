import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { username: string } },
) {
  try {
    await dbConnect();
    const { username } = await params;
    console.log(username)
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(new ApiResponse(404, {}, "User not found"), {
        status: 404,
      });
    }
    if (!user.isAcceptingMessage) {
      return NextResponse.json(
        new ApiResponse(403, {}, "User not accepting messages"),
        {
          status: 403,
        },
      );
    }

    const { type, senderName, content, unlockDate } = await req.json();
    if (!content) {
      return NextResponse.json(
        new ApiResponse(403, {}, "content can't be empty"),
        {
          status: 403,
        },
      );
    }

    const message = await Message.create({
      receiverId: user._id,
      type,
      senderName,
      content,
      unlockDate,
    });
    return NextResponse.json(
      new ApiResponse(201, message, "message sent successfully"),
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("message send error :", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
