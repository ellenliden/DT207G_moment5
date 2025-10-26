import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import config from "../config.js";

const router = express.Router();

//Validering för registrering
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Användarnamn måste vara 3-30 tecken"),
  body("email").isEmail().normalizeEmail().withMessage("Ogiltig e-postadress"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Lösenord måste vara minst 6 tecken"),
];

//validering för inloggning
const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Ogiltig e-postadress"),
  body("password").notEmpty().withMessage("Lösenord krävs"),
];

// POST /api/auth/register - Registrera ny användare
router.post("/register", registerValidation, async (req, res) => {
  try {
    // Kontrollera valideringsfel
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Valideringsfel",
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;

    // kontrollera om användare redan finns
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Användare med denna e-post eller användarnamn finns redan",
      });
    }

    // Skapa ny användare
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Skapa JWT-token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      success: true,
      message: "Användare skapad framgångsrikt",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registreringsfel:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid registrering",
    });
  }
});

// POST /api/auth/login - Logga in användare
router.post("/login", loginValidation, async (req, res) => {
  try {
    // Kontrollera valideringsfel
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Valideringsfel",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Hitta användare
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Ogiltiga inloggningsuppgifter",
      });
    }

    //kontrollera lösenord
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Ogiltiga inloggningsuppgifter",
      });
    }

    //skapa JWT-token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      success: true,
      message: "Inloggning lyckades",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Inloggningsfel:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid inloggning",
    });
  }
});

export default router;
