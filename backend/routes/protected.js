import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// GET /api/protected - test endpoint för autentisering
router.get("/", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Du är autentiserad!",
    user: req.user,
  });
});

// GET /api/protected/profile - hämtar användarprofil
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Profil hämtad framgångsrikt",
      user: req.user,
    });
  } catch (error) {
    console.error("Fel vid hämtning av profil:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid hämtning av profil",
    });
  }
});

export default router;
