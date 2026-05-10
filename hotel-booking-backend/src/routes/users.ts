import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../services/email";

const router = express.Router();

router.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ message: "something went wrong" });
  }
});

router.put("/me", verifyToken, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, street, city, state, country, zipCode } = req.body;

    const updateData: any = { firstName, lastName, phone };
    if (street || city || state || country || zipCode) {
      updateData.address = { street, city, state, country, zipCode };
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Unable to update profile" });
  }
});

router.post(
  "/register",
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
    check("role").optional().isIn(["user", "hotel_owner"]).withMessage("Invalid role"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      let user = await User.findOne({
        email: req.body.email,
      });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      const role = req.body.role || "user";
      user = new User({ ...req.body, role });
      await user.save();

      sendWelcomeEmail(user.email, user.firstName).catch(() => {});

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailVerificationCode = code;
      user.emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      console.log(`[DEV] OTP for ${user.email}: ${code}`);
      sendVerificationEmail(user.email, code).catch((err: any) => {
        console.error("Email send failed:", err?.message || err);
      });

      return res.status(200).send({ message: "User registered OK", userId: user._id });
    } catch (error) {
      console.error("User registration error:", error);
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

router.post(
  "/forgot-password",
  [check("email", "Email is required").isEmail()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(200).json({
          message: "If an account exists with that email, a reset link has been sent",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      sendPasswordResetEmail(user.email, resetUrl).catch(() => {});

      res.status(200).json({
        message: "If an account exists with that email, a reset link has been sent",
        resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.post(
  "/reset-password",
  [
    check("token", "Reset token is required").isString(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.body.token)
        .digest("hex");

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

export default router;
