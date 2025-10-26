import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";

//Importerar routes
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menu.js";
import orderRoutes from "./routes/orders.js";
import locationRoutes from "./routes/locations.js";
import protectedRoutes from "./routes/protected.js";

// Ladda miljövariabler från .env-fil
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Säkerhetsmiddleware
app.use(helmet()); // Säkerhetsheaders
app.use(cors()); // Cross-Origin Resource Sharing

// Rate limiting för att förhindra brute force-attacker
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: 100, // Max 100 försök per IP per tidsperiod
  message: {
    success: false,
    message: "För många försök, försök igen senare.",
  },
});

// Applicera rate limiting på autentiseringsroutes
app.use("/api/auth", authLimiter);

// Middleware för att parsa JSON och URL-encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Anslut till MongoDB-databas
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/streetbites", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Ansluten till MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB-anslutningsfel:", error);
    process.exit(1);
  });

// API-routes
app.use("/api/auth", authRoutes); // autentisering (registrering, inloggning)
app.use("/api/menu", menuRoutes); // meny-hantering
app.use("/api/orders", orderRoutes); //beställnings-hantering
app.use("/api/locations", locationRoutes); //plats-hantering
app.use("/api/protected", protectedRoutes); // skyddade endpoints

// Root endpoint, API-information
app.get("/", (req, res) => {
  res.json({
    message: "Street Bites Food Truck API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      menu: {
        categories: "GET /api/menu/categories",
        items: "GET /api/menu/items",
        itemsByCategory: "GET /api/menu/items/category/:id",
      },
      orders: {
        create: "POST /api/orders",
        getAll: "GET /api/orders",
        getById: "GET /api/orders/:id",
        updateStatus: "PUT /api/orders/:id/status",
      },
      locations: {
        getAll: "GET /api/locations",
        getActive: "GET /api/locations/active",
      },
      protected: {
        test: "GET /api/protected",
        profile: "GET /api/protected/profile",
      },
    },
  });
});

//Felhanteringsmiddleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internt serverfel",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404-hanterare för okända endpoints
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint inte hittad",
  });
});

//startae servern
app.listen(PORT, () => {
  console.log(`🚚 Street Bites API körs på port ${PORT}`);
  console.log(`🌐 API tillgängligt på: http://localhost:${PORT}`);
});
