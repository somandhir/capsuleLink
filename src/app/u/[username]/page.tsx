import { notFound } from "next/navigation";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import MessageForm from "@/components/MessageForm";

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = await params;

  // await dbConnect();

  // const user = await User.findOne({
  //   username,
  //   isVerified: true,
  // }).select("isAcceptingMessage ");

  // if (!user) {
  //   console.log("user not found")
  //   return notFound();
  // }

  // if (!user.isAcceptingMessage) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
  //       <h1 className="text-2xl font-bold text-gray-800">
  //         @{username} is taking a break
  //       </h1>
  //       <p className="text-gray-600 mt-2">
  //         This user is currently not accepting new messages.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <MessageForm username={username} />
    </main>
  );
}
