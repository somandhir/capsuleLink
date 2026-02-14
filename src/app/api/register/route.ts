import { ApiError, ApiResponse } from "@/helpers/apiUtils";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    //  VALIDATION 
    if (password.length < 6) {
      return NextResponse.json(
        new ApiResponse(400, {}, "Password must be at least 6 characters"),
        { status: 400 }
      );
    }

    const usernameRegex = /^(?![_.])(?!.*[_.]$)[a-z0-9._]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        new ApiResponse(
          400,
          {},
          "Invalid username. Only lowercase letters, numbers, _ and . are allowed, cannot start or end with _ or ."
        ),
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        new ApiResponse(400, {}, "Invalid email format"),
        { status: 400 }
      );
    }

    // ----- EXISTING USER CHECK -----
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    const verifyCode = Math.floor(100000 + Math.random() * 900000);

    if (existingUser) {
      if (existingUser.isVerified) {
        const conflictField =
          existingUser.email === email ? "email" : "username";
        return NextResponse.json(
          new ApiResponse(
            400,
            {},
            `A verified user with given ${conflictField} already exists`
          ),
          { status: 400 }
        );
      }

      // UPDATE UNVERIFIED USER
      existingUser.username = username.toLowerCase();
      existingUser.email = email.toLowerCase();
      existingUser.verificationCode = verifyCode;
      existingUser.passwordHash = await bcrypt.hash(password, 10);
      existingUser.codeExpiry = new Date(Date.now() + 3600000);

      await existingUser.save();

      return NextResponse.json(
        new ApiResponse(
          200,
          { userId: existingUser._id },
          "User updated, verify your account"
        ),
        { status: 200 }
      );
    } else {
      // CREATE NEW USER 
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        verificationCode: verifyCode,
        codeExpiry: new Date(Date.now() + 3600000),
      });

      return NextResponse.json(
        new ApiResponse(
          201,
          { userId: newUser._id },
          "User created, verify your account"
        ),
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.log("Error in register controller: ", error);
    return NextResponse.json(
      new ApiError(500, "Internal server error"),
      { status: 500 }
    );
  }
}
