// Street Bites API-konfiguration
export default {
  // Databasanslutning
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/streetbites",

  // JWT-konfiguration för autentisering
  jwtSecret: process.env.JWT_SECRET || "street-bites-super-secret-key-2025",
  jwtExpiration: process.env.JWT_EXPIRATION || "24h",

  // serverkonfiguration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // säkerhet, bcrypt för lösenordshashing
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // rate limiting för att förhindra brute force-attacker
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minuter
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,

  // filuppladdning för meny-bilder
  maxFileSize: process.env.MAX_FILE_SIZE || "5MB",
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],

  // Affärslogik
  defaultPreparationTime: parseInt(process.env.DEFAULT_PREP_TIME) || 15, // minuter
  orderNumberPrefix: process.env.ORDER_PREFIX || "SB",

  //E-postkonfiguration (för framtida utveckling)
  emailService: process.env.EMAIL_SERVICE || "gmail",
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
};
