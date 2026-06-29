import express from "express";
import Booking from "../models/Booking.js";
import Boutique from "../models/Boutique.js";
import Service from "../models/Service.js";
import { protect } from "../middleware/authMiddleware.js";

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

/*
POST /api/bookings
Customer creates a booking.
*/
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

    const boutiqueExists = await Boutique.findById(boutique);

    if (!boutiqueExists) {
      return res.status(404).json({
        message: "Boutique not found",
      });
    }

    const serviceExists = await Service.findById(service);

    if (!serviceExists) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    // Prevent booking a service belonging to another boutique
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

/*
GET /api/bookings/my
Customer sees only their own bookings.
*/
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

/*
GET /api/bookings/boutique/:boutiqueId
Only the owner of that boutique can view its orders.
*/
router.get("/boutique/:boutiqueId", protect, async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.boutiqueId);

    if (!boutique) {
      return res.status(404).json({
        message: "Boutique not found",
      });
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

/*
PUT /api/bookings/:id/status
Only the booking's boutique owner can change the status.
*/
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(req.params.id).populate("boutique");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.boutique.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the boutique owner can update this booking",
      });
    }

    booking.status = status;
    await booking.save();

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