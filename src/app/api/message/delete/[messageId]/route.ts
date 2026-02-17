import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params:Promise<{ messageId: string }>}
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized request" },
        { status: 401 }
      );
    }

    const { messageId } = await params;

    const message = await Message.findById(messageId);

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    if (message.receiverId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Not allowed to delete this message" },
        { status: 403 }
      );
    }

    await Message.findByIdAndDelete(messageId);

    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 } 
    );
  } catch (error) {
    console.error("Error in delete message route: ", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}