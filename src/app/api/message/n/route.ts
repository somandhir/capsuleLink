import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import { verifyJWT } from "@/helpers/verifyJWT";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
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
    const normalMessages = await Message.find({
      receiverId: userId,
      type: "normal",
    }).sort({ createdAt: -1 });
    if (normalMessages.length===0) {
      return NextResponse.json(
        new ApiResponse(200, {}, "no normal  messages"),
        {
          status: 200,
        },
      );
    }
    return NextResponse.json(
      new ApiResponse(200, { normalMessages }, "messages fetched successfully"),
      { status: 200 },
    );
  } catch (error) {
    console.log("Error in normal messages controller: ", error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
