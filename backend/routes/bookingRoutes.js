import express from "express";
import Booking from "../models/Booking.js";
import Boutique from "../models/Boutique.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { io } from "../server.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

const validStatuses = [
  "Order Placed",
  "Accepted",
  "Design Confirmed",
  "Cutting",
  "Stitching",
  "Trial Ready",
  "Alteration",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

router.post("/", protect, async (req, res) => {
  try {
    const {
      boutique,
      service,
      bookingDate,
      timeSlot,
      designImage,
      notes,
      measurements,
      amount,
    } = req.body;

    if (!boutique || !service || !bookingDate || !timeSlot) {
      return res.status(400).json({
        message: "Boutique, service, booking date and time slot are required",
      });
    }

    const boutiqueExists = await Boutique.findById(boutique).populate(
      "owner",
      "name email"
    );

    if (!boutiqueExists) {
      return res.status(404).json({ message: "Boutique not found" });
    }

    const serviceExists = await Service.findById(service);

    if (!serviceExists) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (serviceExists.boutique.toString() !== boutique.toString()) {
      return res.status(400).json({
        message: "This service does not belong to the selected boutique",
      });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      boutique,
      service,
      bookingDate,
      timeSlot,
      designImage: designImage || "",
      notes: notes || "",
      measurements: measurements || {},
      amount: Number(amount || serviceExists.price),
      paymentStatus: "pending",
      status: "Order Placed",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("boutique", "name city phone")
      .populate("service", "name category price urgentPrice deliveryDays")
      .populate("customer", "name email phone");

    io.to(`user_${boutiqueExists.owner._id.toString()}`).emit("notification", {
      type: "NEW_BOOKING",
      title: "New Booking Received",
      message: `${req.user.name} booked ${serviceExists.name}.`,
      bookingId: booking._id,
      createdAt: new Date(),
    });

    await sendEmail({
      to: req.user.email,
      subject: "Your StitchNow booking is confirmed",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
          <h2 style="color:#7c3aed">Booking Confirmed 🎉</h2>
          <p>Hi ${req.user.name},</p>
          <p>Your booking has been created successfully.</p>
          <div style="padding:16px;border:1px solid #ede9fe;border-radius:12px;background:#faf5ff">
            <p><strong>Boutique:</strong> ${boutiqueExists.name}</p>
            <p><strong>Service:</strong> ${serviceExists.name}</p>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time Slot:</strong> ${timeSlot}</p>
            <p><strong>Amount:</strong> ₹${Number(amount || serviceExists.price)}</p>
            <p><strong>Status:</strong> Order Placed</p>
          </div>
          <p>You can track your order from your StitchNow account.</p>
          <p>Thank you,<br/>StitchNow Team</p>
        </div>
      `,
    });

    if (boutiqueExists.owner?.email) {
      await sendEmail({
        to: boutiqueExists.owner.email,
        subject: "New booking received on StitchNow",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
            <h2 style="color:#7c3aed">New Booking Received</h2>
            <p>Hi ${boutiqueExists.owner.name || "Boutique Owner"},</p>
            <p>You have received a new booking.</p>
            <div style="padding:16px;border:1px solid #ede9fe;border-radius:12px;background:#faf5ff">
              <p><strong>Customer:</strong> ${req.user.name}</p>
              <p><strong>Service:</strong> ${serviceExists.name}</p>
              <p><strong>Date:</strong> ${bookingDate}</p>
              <p><strong>Time Slot:</strong> ${timeSlot}</p>
              <p><strong>Amount:</strong> ₹${Number(amount || serviceExists.price)}</p>
            </div>
            <p>Please open your dashboard to accept and manage this order.</p>
            <p>Thank you,<br/>StitchNow Team</p>
          </div>
        `,
      });
    }

    return res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Could not create booking",
      error: error.message,
    });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
    })
      .populate("boutique", "name city phone image")
      .populate("service", "name category price urgentPrice deliveryDays")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: "Could not fetch your bookings",
      error: error.message,
    });
  }
});

router.get("/boutique/:boutiqueId", protect, async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.boutiqueId);

    if (!boutique) {
      return res.status(404).json({ message: "Boutique not found" });
    }

    if (boutique.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can view bookings only for your own boutique",
      });
    }

    const bookings = await Booking.find({
      boutique: req.params.boutiqueId,
    })
      .populate("customer", "name email phone")
      .populate("service", "name category price urgentPrice deliveryDays")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error("GET BOUTIQUE BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: "Could not fetch boutique bookings",
      error: error.message,
    });
  }
});

router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("boutique")
      .populate("service", "name")
      .populate("customer", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.boutique.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the boutique owner can update this booking",
      });
    }

    booking.status = status;
    await booking.save();

    io.to(`user_${booking.customer._id.toString()}`).emit("notification", {
      type: "ORDER_STATUS_UPDATED",
      title: "Order Status Updated",
      message: `Your ${booking.service?.name || "tailoring"} order is now "${status}".`,
      bookingId: booking._id,
      status,
      createdAt: new Date(),
    });

    await sendEmail({
      to: booking.customer.email,
      subject: `Your StitchNow order is now ${status}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
          <h2 style="color:#7c3aed">Order Status Updated</h2>
          <p>Hi ${booking.customer.name},</p>
          <p>Your order status has been updated.</p>
          <div style="padding:16px;border:1px solid #ede9fe;border-radius:12px;background:#faf5ff">
            <p><strong>Service:</strong> ${booking.service?.name || "Tailoring Service"}</p>
            <p><strong>New Status:</strong> ${status}</p>
          </div>
          <p>You can track your order from your StitchNow account.</p>
          <p>Thank you,<br/>StitchNow Team</p>
        </div>
      `,
    });

    return res.json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("UPDATE BOOKING STATUS ERROR:", error);

    return res.status(500).json({
      message: "Could not update booking status",
      error: error.message,
    });
  }
});

export default router;