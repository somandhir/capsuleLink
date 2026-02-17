import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  console.log("session from accept message : " , session)

  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { acceptMessages } = await req.json();

  try {
    const updatedUser = await User.findByIdAndUpdate(
      (session.user as any)._id,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: acceptMessages ? "You are now receiving messages" : "Messages paused",
      data: updatedUser
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error updating status" }, { status: 500 });
  }
}