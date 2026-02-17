import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !user?._id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;
console.log("message id : ",messageId)
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: user._id, 
      },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!message) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }

    const isLocked = message.type === "delayed" && new Date(message.unlockDate!) > new Date();

    if (isLocked) {
      return NextResponse.json({
        success: true,
        data: {
          ...message.toObject(),
          content: "This capsule is still sealed.",
          isLocked: true
        }
      });
    }

    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}