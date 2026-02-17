import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { error } from "console";

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById((session.user as any)._id);
    if (!user) return Response.json({ error: "user not found" }, { status: 404 })
    return Response.json({ isAcceptingMessage: user.isAcceptingMessage });
}