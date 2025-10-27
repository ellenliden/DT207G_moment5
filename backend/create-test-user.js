/**
 * Skapa test-användare för Street Bites Admin
 * Kör detta script för att skapa en test-användare
 */

import mongoose from "mongoose";
import User from "./models/User.js";
import config from "./config.js";

async function createTestUser() {
  try {
    // Anslut till databas
    await mongoose.connect(config.mongodbUri);
    console.log("✅ Ansluten till MongoDB");

    // Kontrollera om test-användare redan finns
    const existingUser = await User.findOne({ email: "test@streetbites.com" });
    
    if (existingUser) {
      console.log("⚠️ Test-användare finns redan:", existingUser.email);
      return;
    }

    // Skapa test-användare
    const testUser = new User({
      username: "testadmin",
      email: "test@streetbites.com",
      password: "test123",
      role: "admin"
    });

    await testUser.save();
    console.log("✅ Test-användare skapad:");
    console.log("   E-post: test@streetbites.com");
    console.log("   Lösenord: test123");
    console.log("   Roll: admin");

  } catch (error) {
    console.error("❌ Fel vid skapande av test-användare:", error);
  } finally {
    // Stäng databasanslutning
    await mongoose.disconnect();
    console.log("🔌 Databasanslutning stängd");
  }
}

// Kör funktionen
createTestUser();
