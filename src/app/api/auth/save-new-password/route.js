import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, newPassword, token, oldPassword } = body || {};

    if (!email?.trim() || !newPassword?.trim()) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    if (!token && !oldPassword) {
      return NextResponse.json({ message: "Provide either reset token or current password" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }

    // initialize Prisma client (require inside function to avoid build-time errors)
    let prisma;
    try {
      const { PrismaClient } = require("@prisma/client");
      if (!globalThis.__prismaClient) globalThis.__prismaClient = new PrismaClient();
      prisma = globalThis.__prismaClient;
    } catch (err) {
      console.error("Prisma client init failed:", err);
      return NextResponse.json({ message: "Server database misconfiguration" }, { status: 500 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, password: true, isActive: true }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (!user.isActive) return NextResponse.json({ message: "Account inactive" }, { status: 403 });

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.email !== normalizedEmail || decoded.purpose !== "forgot_password") {
          return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }
      } catch (err) {
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
      }
    } else {
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update failed:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}