import express, { Request, Response } from "express";
import { param, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { sendVerificationEmail } from "../services/email";

const router = express.Router();

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/send-verification-code - Send OTP to user's email
router.post("/send-verification-code", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const code = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailVerificationCode = code;
    user.emailVerificationCodeExpires = expires;
    await user.save();

    await sendVerificationEmail(user.email, code);

    res.status(200).json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Send verification code error:", error);
    res.status(500).json({ message: "Failed to send verification code. Please make sure the sender email is verified in Brevo dashboard." });
  }
});

// POST /api/auth/verify-email - Verify OTP code
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: "User ID and code are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
      return res.status(400).json({ message: "No verification code found. Please request a new one." });
    }

    if (new Date() > user.emailVerificationCodeExpires) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );

    res.cookie("session_id", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 86400000,
      path: "/",
    });

    res.status(200).json({
      message: "Email verified successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Failed to verify email" });
  }
});

export default router;
