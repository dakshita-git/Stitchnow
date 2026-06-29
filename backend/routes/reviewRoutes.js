import express from "express";
import Review from "../models/Review.js";
import Boutique from "../models/Boutique.js";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:boutiqueId", async (req, res) => {
  try {
    const reviews = await Review.find({ boutique: req.params.boutiqueId })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch reviews" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { boutique, rating, comment, image } = req.body;

    if (!boutique || !rating) {
      return res.status(400).json({ message: "Boutique and rating are required" });
    }

    const deliveredBooking = await Booking.findOne({
      customer: req.user._id,
      boutique,
      status: "Delivered",
    });

    if (!deliveredBooking) {
      return res.status(403).json({
        message: "You can review only after your order is delivered",
      });
    }

    const alreadyReviewed = await Review.findOne({
      customer: req.user._id,
      boutique,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this boutique",
      });
    }

    const review = await Review.create({
      customer: req.user._id,
      boutique,
      rating,
      comment,
      image,
    });

    const reviews = await Review.find({ boutique });

    const avgRating =
      reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

    await Boutique.findByIdAndUpdate(boutique, {
      rating: avgRating,
      totalReviews: reviews.length,
    });

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("REVIEW ERROR:", error);
    res.status(500).json({ message: "Could not add review" });
  }
});

export default router;