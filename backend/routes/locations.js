import express from "express";
import { body, validationResult } from "express-validator";
import Location from "../models/Location.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Publika endpoints

// GET /api/locations - hämtar alla platser (publik)
router.get("/", async (req, res) => {
  try {
    const { active } = req.query;

    let filter = {};
    if (active === "true") {
      filter.isActive = true;
    }

    const locations = await Location.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Fel vid hämtning av platser:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av platser",
    });
  }
});

// GET /api/locations/active - Hämta aktiva platser (publik)
router.get("/active", async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error("Fel vid hämtning av aktiva platser:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av platser",
    });
  }
});

// GET /api/locations/:id - Hämta specifik plats (publik)
router.get("/:id", async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Plats hittades inte",
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error("Fel vid hämtning av plats:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av plats",
    });
  }
});

// Admin endpoints

// POST /api/locations - skapa ny plats (admin)
router.post(
  "/",
  authenticateToken,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Platsnamn krävs (max 100 tecken)"),
    body("address")
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Adress krävs (max 200 tecken)"),
    body("coordinates.lat")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitud måste vara mellan -90 och 90"),
    body("coordinates.lng")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitud måste vara mellan -180 och 180"),
    body("schedule").isArray().withMessage("Schema måste vara array"),
    body("schedule.*.day")
      .isIn([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
      .withMessage("Ogiltig dag"),
    body("schedule.*.startTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Starttid måste vara i format HH:MM"),
    body("schedule.*.endTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Sluttid måste vara i format HH:MM"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Valideringsfel",
          errors: errors.array(),
        });
      }

      const { name, address, coordinates, schedule } = req.body;

      // Validera att starttid är före sluttid för varje dag
      for (const daySchedule of schedule) {
        const startTime = daySchedule.startTime.split(":").map(Number);
        const endTime = daySchedule.endTime.split(":").map(Number);
        const startMinutes = startTime[0] * 60 + startTime[1];
        const endMinutes = endTime[0] * 60 + endTime[1];

        if (startMinutes >= endMinutes) {
          return res.status(400).json({
            success: false,
            message: `Starttid måste vara före sluttid för ${daySchedule.day}`,
          });
        }
      }

      const location = new Location({
        name,
        address,
        coordinates,
        schedule,
      });

      await location.save();

      res.status(201).json({
        success: true,
        message: "Plats skapad framgångsrikt",
        data: location,
      });
    } catch (error) {
      console.error("Fel vid skapande av plats:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid skapande av plats",
      });
    }
  }
);

// PUT /api/locations/:id - uppdatera plats (admin)
router.put(
  "/:id",
  authenticateToken,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Platsnamn max 100 tecken"),
    body("address")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Adress max 200 tecken"),
    body("coordinates.lat")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitud måste vara mellan -90 och 90"),
    body("coordinates.lng")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitud måste vara mellan -180 och 180"),
    body("schedule")
      .optional()
      .isArray()
      .withMessage("Schema måste vara array"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive måste vara boolean"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Valideringsfel",
          errors: errors.array(),
        });
      }

      //om schema uppdateras, validera tiderna
      if (req.body.schedule) {
        for (const daySchedule of req.body.schedule) {
          const startTime = daySchedule.startTime.split(":").map(Number);
          const endTime = daySchedule.endTime.split(":").map(Number);
          const startMinutes = startTime[0] * 60 + startTime[1];
          const endMinutes = endTime[0] * 60 + endTime[1];

          if (startMinutes >= endMinutes) {
            return res.status(400).json({
              success: false,
              message: `Starttid måste vara före sluttid för ${daySchedule.day}`,
            });
          }
        }
      }

      const location = await Location.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Plats hittades inte",
        });
      }

      res.json({
        success: true,
        message: "Plats uppdaterad framgångsrikt",
        data: location,
      });
    } catch (error) {
      console.error("Fel vid uppdatering av plats:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid uppdatering av plats",
      });
    }
  }
);

// DELETE /api/locations/:id - tar bort plats (admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Plats hittades inte",
      });
    }

    res.json({
      success: true,
      message: "Plats borttagen framgångsrikt",
    });
  } catch (error) {
    console.error("Fel vid borttagning av plats:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid borttagning av plats",
    });
  }
});

// PUT /api/locations/:id/schedule - Uppdatera endast schema (admin)
router.put(
  "/:id/schedule",
  authenticateToken,
  [
    body("schedule").isArray().withMessage("Schema måste vara array"),
    body("schedule.*.day")
      .isIn([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ])
      .withMessage("Ogiltig dag"),
    body("schedule.*.startTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Starttid måste vara i format HH:MM"),
    body("schedule.*.endTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Sluttid måste vara i format HH:MM"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Valideringsfel",
          errors: errors.array(),
        });
      }

      const { schedule } = req.body;

      // Validera att starttid är före sluttid för varje dag
      for (const daySchedule of schedule) {
        const startTime = daySchedule.startTime.split(":").map(Number);
        const endTime = daySchedule.endTime.split(":").map(Number);
        const startMinutes = startTime[0] * 60 + startTime[1];
        const endMinutes = endTime[0] * 60 + endTime[1];

        if (startMinutes >= endMinutes) {
          return res.status(400).json({
            success: false,
            message: `Starttid måste vara före sluttid för ${daySchedule.day}`,
          });
        }
      }

      const location = await Location.findByIdAndUpdate(
        req.params.id,
        { schedule },
        { new: true, runValidators: true }
      );

      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Plats hittades inte",
        });
      }

      res.json({
        success: true,
        message: "Schema uppdaterat framgångsrikt",
        data: location,
      });
    } catch (error) {
      console.error("Fel vid uppdatering av schema:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid uppdatering av schema",
      });
    }
  }
);

export default router;
