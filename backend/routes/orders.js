import express from "express";
import { body, validationResult } from "express-validator";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

//Publika endpoints

// POST /api/orders - Skapa ny beställning (publik)
router.post(
  "/",
  [
    body("customerName")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Kundnamn krävs (max 100 tecken)"),
    body("phone")
      .matches(/^[\+]?[0-9\s\-\(\)]{8,15}$/)
      .withMessage("Ogiltigt telefonnummer"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Ogiltig e-postadress"),
    body("items").isArray({ min: 1 }).withMessage("Minst en maträtt krävs"),
    body("items.*.menuItemId").isMongoId().withMessage("Ogiltigt maträtt-ID"),
    body("items.*.quantity")
      .isInt({ min: 1, max: 20 })
      .withMessage("Antal måste vara 1-20"),
    body("specialInstructions")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Special instruktioner max 500 tecken"),
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

      const { customerName, phone, email, items, specialInstructions } =
        req.body;

      // Validera och beräkna totalbelopp
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) {
          return res.status(400).json({
            success: false,
            message: `Maträtt med ID ${item.menuItemId} hittades inte`,
          });
        }

        if (!menuItem.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `Maträtt "${menuItem.name}" är inte tillgänglig`,
          });
        }

        const itemTotal = menuItem.price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
        });
      }

      // Beräkna uppskattad tid för beställning
      const maxPreparationTime = Math.max(
        ...validatedItems.map((item) => {
          const menuItem = items.find((i) => i.menuItemId === item.menuItemId);
          return menuItem.quantity * 15; // 15 minuter per maträtt som standard
        })
      );

      const estimatedReadyTime = new Date();
      estimatedReadyTime.setMinutes(
        estimatedReadyTime.getMinutes() + maxPreparationTime
      );

      // Skapa beställning
      const order = new Order({
        customerName,
        phone,
        email,
        items: validatedItems,
        totalAmount,
        specialInstructions,
        estimatedReadyTime,
      });

      await order.save();

      res.status(201).json({
        success: true,
        message: "Beställning skapad framgångsrikt",
        data: {
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          estimatedReadyTime: order.estimatedReadyTime,
          status: order.status,
        },
      });
    } catch (error) {
      console.error("Fel vid skapande av beställning:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid skapande av beställning",
      });
    }
  }
);

// GET /api/orders/:orderNumber - hämtar beställning med ordernummer (publik)
router.get("/:orderNumber", async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber.toUpperCase(),
    }).populate("items.menuItemId", "name description price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Beställning hittades inte",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Fel vid hämtning av beställning:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av beställning",
    });
  }
});

// Admin endpoints
// GET /api/orders - Hämta alla beställningar (admin)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("items.menuItemId", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Fel vid hämtning av beställningar:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av beställningar",
    });
  }
});

// GET /api/orders/admin/:id - Hämta beställning med ID (admin)
router.get("/admin/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.menuItemId",
      "name description price"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Beställning hittades inte",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Fel vid hämtning av beställning:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av beställning",
    });
  }
});

// PUT /api/orders/:id/status - Uppdatera beställningsstatus (admin)
router.put(
  "/:id/status",
  authenticateToken,
  [
    body("status")
      .isIn(["pending", "preparing", "ready", "completed", "cancelled"])
      .withMessage("Ogiltig status"),
    body("estimatedReadyTime")
      .optional()
      .isISO8601()
      .withMessage("Ogiltigt datum"),
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

      const { status, estimatedReadyTime } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
          status,
          ...(estimatedReadyTime && {
            estimatedReadyTime: new Date(estimatedReadyTime),
          }),
        },
        { new: true, runValidators: true }
      ).populate("items.menuItemId", "name");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Beställning hittades inte",
        });
      }

      res.json({
        success: true,
        message: "Beställningsstatus uppdaterad framgångsrikt",
        data: order,
      });
    } catch (error) {
      console.error("Fel vid uppdatering av beställningsstatus:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid uppdatering av beställningsstatus",
      });
    }
  }
);

// PUT /api/orders/:id - Uppdatera beställning (admin)
router.put(
  "/:id",
  authenticateToken,
  [
    body("customerName")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Kundnamn max 100 tecken"),
    body("phone")
      .optional()
      .matches(/^[\+]?[0-9\s\-\(\)]{8,15}$/)
      .withMessage("Ogiltigt telefonnummer"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Ogiltig e-postadress"),
    body("specialInstructions")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Special instruktioner max 500 tecken"),
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

      const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate("items.menuItemId", "name");

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Beställning hittades inte",
        });
      }

      res.json({
        success: true,
        message: "Beställning uppdaterad framgångsrikt",
        data: order,
      });
    } catch (error) {
      console.error("Fel vid uppdatering av beställning:", error);
      res.status(500).json({
        success: false,
        message: "Serverfel vid uppdatering av beställning",
      });
    }
  }
);

// DELETE /api/orders/:id - tar bort beställning (admin)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Beställning hittades inte",
      });
    }

    res.json({
      success: true,
      message: "Beställning borttagen framgångsrikt",
    });
  } catch (error) {
    console.error("Fel vid borttagning av beställning:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid borttagning av beställning",
    });
  }
});

export default router;
