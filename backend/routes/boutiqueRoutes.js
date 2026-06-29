import express from "express";
import Boutique from "../models/Boutique.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const search = req.query.q || "";

    const boutiques = await Boutique.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    })
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json(boutiques);
  } catch (error) {
    console.error("GET BOUTIQUES ERROR:", error);

    return res.status(500).json({
      message: "Could not fetch boutiques",
      error: error.message,
    });
  }
});

router.get("/owner/my-boutiques", protect, async (req, res) => {
  try {
    const boutiques = await Boutique.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(boutiques);
  } catch (error) {
    console.error("MY BOUTIQUES ERROR:", error);

    return res.status(500).json({
      message: "Could not fetch your boutiques",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );

    if (!boutique) {
      return res.status(404).json({
        message: "Boutique not found",
      });
    }

    return res.status(200).json(boutique);
  } catch (error) {
    console.error("GET BOUTIQUE ERROR:", error);

    return res.status(500).json({
      message: "Could not fetch boutique details",
      error: error.message,
    });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      address,
      city,
      image,
      isAvailableForUrgentOrders,
    } = req.body;

    if (!name || !description || !phone || !address || !city) {
      return res.status(400).json({
        message:
          "Name, description, phone, address and city are required",
      });
    }

    const boutique = await Boutique.create({
      owner: req.user._id,
      name,
      description,
      phone,
      address,
      city,
      image,
      isAvailableForUrgentOrders,
    });

    return res.status(201).json({
      message: "Boutique created successfully",
      boutique,
    });
  } catch (error) {
    console.error("CREATE BOUTIQUE ERROR:", error);

    return res.status(500).json({
      message: "Could not create boutique",
      error: error.message,
    });
  }
});

export default router;