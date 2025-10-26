import express from "express";
import { body, validationResult } from "express-validator";
import MenuCategory from "../models/MenuCategory.js";
import MenuItem from "../models/MenuItem.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// MENY-KATEGORIER
// GET /api/menu/categories - Hämta alla kategorier (publik)
router.get("/categories", async (req, res) => {
  try {
    const categories = await MenuCategory.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Fel vid hämtning av kategorier:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av kategorier",
    });
  }
});

// POST /api/menu/categories - Skapa ny kategori (admin)
router.post(
  "/categories",
  authenticateToken,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Kategorinamn krävs (max 50 tecken)"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Beskrivning max 200 tecken"),
    body("displayOrder")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Display order måste vara positivt"),
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

      const { name, description, displayOrder } = req.body;

      const category = new MenuCategory({
        name,
        description,
        displayOrder: displayOrder || 0,
      });

      await category.save();

      res.status(201).json({
        success: true,
        message: "Kategori skapad framgångsrikt",
        data: category,
      });
    } catch (error) {
      console.error("Fel vid skapande av kategori:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid skapande av kategori",
      });
    }
  }
);

// PUT /api/menu/categories/:id - uppdatera kategori (admin)
router.put(
  "/categories/:id",
  authenticateToken,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Kategorinamn max 50 tecken"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Beskrivning max 200 tecken"),
    body("displayOrder")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Display order måste vara positivt"),
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

      const category = await MenuCategory.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Kategori hittades inte",
        });
      }

      res.json({
        success: true,
        message: "Kategori uppdaterad framgångsrikt",
        data: category,
      });
    } catch (error) {
      console.error("Fel vid uppdatering av kategori:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid uppdatering av kategori",
      });
    }
  }
);

// DELETE /api/menu/categories/:id - Ta bort kategori (admin)
router.delete("/categories/:id", authenticateToken, async (req, res) => {
  try {
    // Kontrollera om kategorin har items
    const itemsCount = await MenuItem.countDocuments({
      categoryId: req.params.id,
    });
    if (itemsCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Kan inte ta bort kategori som har maträtter. Ta bort maträtterna först.",
      });
    }

    const category = await MenuCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori hittades inte",
      });
    }

    res.json({
      success: true,
      message: "Kategori borttagen framgångsrikt",
    });
  } catch (error) {
    console.error("Fel vid borttagning av kategori:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid borttagning av kategori",
    });
  }
});

// Meny-items

// GET /api/menu/items - Hämta alla maträtter (publik)
router.get("/items", async (req, res) => {
  try {
    const { category, popular, available } = req.query;

    let filter = {};

    if (category) {
      filter.categoryId = category;
    }

    if (available === "true") {
      filter.isAvailable = true;
    }

    if (popular === "true") {
      filter.isPopular = true;
    }

    const items = await MenuItem.find(filter)
      .populate("category", "name")
      .sort({ isPopular: -1, name: 1 });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Fel vid hämtning av maträtter:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av maträtter",
    });
  }
});

// GET /api/menu/items/category/:id - Hämta maträtter per kategori (publik)
router.get("/items/category/:id", async (req, res) => {
  try {
    const items = await MenuItem.find({
      categoryId: req.params.id,
      isAvailable: true,
    })
      .populate("category", "name")
      .sort({ isPopular: -1, name: 1 });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Fel vid hämtning av maträtter per kategori:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av maträtter",
    });
  }
});

// POST /api/menu/items - Skapa ny maträtt (admin)
router.post(
  "/items",
  authenticateToken,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Maträttsnamn krävs (max 100 tecken)"),
    body("description")
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Beskrivning krävs (max 500 tecken)"),
    body("price")
      .isFloat({ min: 0, max: 10000 })
      .withMessage("Pris måste vara mellan 0-10000 kr"),
    body("categoryId").isMongoId().withMessage("Ogiltigt kategori-ID"),
    body("image").optional().isURL().withMessage("Bild-URL måste vara giltig"),
    body("preparationTime")
      .optional()
      .isInt({ min: 1, max: 120 })
      .withMessage("Tillagningstid 1-120 minuter"),
    body("allergens")
      .optional()
      .isArray()
      .withMessage("Allergener måste vara array"),
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

      const {
        name,
        description,
        price,
        categoryId,
        image,
        preparationTime,
        allergens,
      } = req.body;

      // Kontrollera att kategorin finns
      const category = await MenuCategory.findById(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Kategori hittades inte",
        });
      }

      const item = new MenuItem({
        name,
        description,
        price,
        categoryId,
        image,
        preparationTime: preparationTime || 15,
        allergens: allergens || [],
      });

      await item.save();
      await item.populate("category", "name");

      res.status(201).json({
        success: true,
        message: "Maträtt skapad framgångsrikt",
        data: item,
      });
    } catch (error) {
      console.error("Fel vid skapande av maträtt:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid skapande av maträtt",
      });
    }
  }
);

// PUT /api/menu/items/:id - Uppdatera maträtt (admin)
router.put(
  "/items/:id",
  authenticateToken,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Maträttsnamn max 100 tecken"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Beskrivning max 500 tecken"),
    body("price")
      .optional()
      .isFloat({ min: 0, max: 10000 })
      .withMessage("Pris måste vara mellan 0-10000 kr"),
    body("categoryId")
      .optional()
      .isMongoId()
      .withMessage("Ogiltigt kategori-ID"),
    body("image").optional().isURL().withMessage("Bild-URL måste vara giltig"),
    body("preparationTime")
      .optional()
      .isInt({ min: 1, max: 120 })
      .withMessage("Tillagningstid 1-120 minuter"),
    body("isAvailable")
      .optional()
      .isBoolean()
      .withMessage("isAvailable måste vara boolean"),
    body("isPopular")
      .optional()
      .isBoolean()
      .withMessage("isPopular måste vara boolean"),
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

      // Om categoryId uppdateras, kontrollera att kategorin finns
      if (req.body.categoryId) {
        const category = await MenuCategory.findById(req.body.categoryId);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: "Kategori hittades inte",
          });
        }
      }

      const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate("category", "name");

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Maträtt hittades inte",
        });
      }

      res.json({
        success: true,
        message: "Maträtt uppdaterad framgångsrikt",
        data: item,
      });
    } catch (error) {
      console.error("Fel vid uppdatering av maträtt:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid uppdatering av maträtt",
      });
    }
  }
);

// DELETE /api/menu/items/:id - Ta bort maträtt (admin)
router.delete("/items/:id", authenticateToken, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Maträtt hittades inte",
      });
    }

    res.json({
      success: true,
      message: "Maträtt borttagen framgångsrikt",
    });
  } catch (error) {
    console.error("Fel vid borttagning av maträtt:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid borttagning av maträtt",
    });
  }
});

export default router;
