import express from "express";
import User from "../models/User.js";
import Boutique from "../models/Boutique.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({
      message: "Could not load wishlist",
      error: error.message,
    });
  }
});

router.post("/:boutiqueId", protect, async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.boutiqueId);

    if (!boutique) {
      return res.status(404).json({ message: "Boutique not found" });
    }

    const user = await User.findById(req.user._id);

    const exists = user.wishlist.some(
      (id) => id.toString() === req.params.boutiqueId
    );

    if (exists) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== req.params.boutiqueId
      );
    } else {
      user.wishlist.push(req.params.boutiqueId);
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate("wishlist");

    res.json({
      message: exists ? "Removed from wishlist" : "Added to wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not update wishlist",
      error: error.message,
    });
  }
});

export default router;