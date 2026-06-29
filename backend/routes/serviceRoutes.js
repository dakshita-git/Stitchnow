import express from "express";
import Service from "../models/Service.js";
import Boutique from "../models/Boutique.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
GET /api/services
Optional filters:
GET /api/services?boutique=ID
GET /api/services?category=Blouse
*/
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.boutique) {
      filter.boutique = req.query.boutique;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const services = await Service.find(filter)
      .populate("boutique", "name city rating")
      .sort({ createdAt: -1 });

    return res.json(services);
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);

    return res.status(500).json({
      message: "Could not fetch services",
      error: error.message,
    });
  }
});

/*
POST /api/services
Only the owner of that boutique can add a service.
*/
router.post("/", protect, async (req, res) => {
  try {
    const {
      boutique,
      name,
      category,
      price,
      urgentPrice,
      deliveryDays,
      description,
    } = req.body;

    if (!boutique || !name || !category || price === undefined) {
      return res.status(400).json({
        message: "Boutique, name, category and price are required",
      });
    }

    const boutiqueExists = await Boutique.findById(boutique);

    if (!boutiqueExists) {
      return res.status(404).json({
        message: "Boutique not found",
      });
    }

    if (boutiqueExists.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can add services only to your own boutique",
      });
    }

    const service = await Service.create({
      boutique,
      name,
      category,
      price: Number(price),
      urgentPrice: urgentPrice ? Number(urgentPrice) : 0,
      deliveryDays: deliveryDays ? Number(deliveryDays) : 3,
      description,
    });

    return res.status(201).json({
      message: "Service added successfully",
      service,
    });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);

    return res.status(500).json({
      message: "Could not add service",
      error: error.message,
    });
  }
});

/*
PUT /api/services/:id
Only the boutique owner can update.
*/
router.put("/:id", protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("boutique");

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    if (service.boutique.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can update only your own services",
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("UPDATE SERVICE ERROR:", error);

    return res.status(500).json({
      message: "Could not update service",
      error: error.message,
    });
  }
});

/*
DELETE /api/services/:id
Only the boutique owner can delete.
*/
router.delete("/:id", protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("boutique");

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    if (service.boutique.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can delete only your own services",
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SERVICE ERROR:", error);

    return res.status(500).json({
      message: "Could not delete service",
      error: error.message,
    });
  }
});

export default router;