import express from "express";
import Message from "../models/Message.js";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/authMiddleware.js";
import { io } from "../server.js";

const router = express.Router();

router.get("/:bookingId", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate(
      "boutique"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isOwner =
      booking.boutique.owner.toString() === req.user._id.toString();

    if (!isCustomer && !isOwner) {
      return res.status(403).json({
        message: "Not allowed to view this chat",
      });
    }

    const messages = await Message.find({
      booking: req.params.bookingId,
    })
      .populate("sender", "name role")
      .populate("receiver", "name role")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("GET CHAT ERROR:", error);
    res.status(500).json({ message: "Could not load chat" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { bookingId, message, image } = req.body;

    if (!bookingId || (!message && !image)) {
      return res.status(400).json({
        message: "Booking and message/image are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate("boutique");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isOwner =
      booking.boutique.owner.toString() === req.user._id.toString();

    if (!isCustomer && !isOwner) {
      return res.status(403).json({
        message: "Not allowed to send message",
      });
    }

    const receiver = isCustomer ? booking.boutique.owner : booking.customer;

    const newMessage = await Message.create({
      booking: bookingId,
      sender: req.user._id,
      receiver,
      message: message || "",
      image: image || "",
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name role")
      .populate("receiver", "name role");

    io.to(`booking_${bookingId}`).emit("chatMessage", populatedMessage);

    io.to(`user_${receiver.toString()}`).emit("notification", {
      type: "CHAT_MESSAGE",
      title: "New Chat Message",
      message: `${req.user.name} sent you a message.`,
      bookingId,
      createdAt: new Date(),
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: "Could not send message" });
  }
});

export default router;