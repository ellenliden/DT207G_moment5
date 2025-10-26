import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config.js";

/**
 * Middleware för JWT-autentisering
 * Kontrollerar att användaren är inloggad och att token är giltig
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // hämta token från Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Åtkomst nekad. Ingen token tillhandahållen.",
      });
    }

    //Verifiera token
    const decoded = jwt.verify(token, config.jwtSecret);

    //Hitta användaren i databasen
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Ogiltig token. Användare hittades inte.",
      });
    }

    //Lägg till användarinformation i request-objektet
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Ogiltig token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token har gått ut",
      });
    }

    console.error("Autentiseringsfel:", error);
    res.status(500).json({
      success: false,
      message: "Serverfel vid autentisering",
    });
  }
};
