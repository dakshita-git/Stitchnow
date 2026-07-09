import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const token = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const sendUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage || "",
  createdAt: user.createdAt,
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const allowedRoles = ["customer", "boutiqueOwner"];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid account role selected",
      });
    }

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Name, email, phone and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Please login instead.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "customer",
    });

    return res.status(201).json({
      message: "Registration successful",
      token: token(user._id),
      user: sendUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.json({
      message: "Login successful",
      token: token(user._id),
      user: sendUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

router.get("/me", protect, (req, res) => {
  res.json(sendUser(req.user));
});

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    const user = await User.findById(req.user._id);

    user.name = name;
    user.phone = phone;
    user.profileImage = profileImage || user.profileImage || "";

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: sendUser(user),
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return res.status(500).json({
      message: "Could not update profile",
      error: error.message,
    });
  }
});

export default router;