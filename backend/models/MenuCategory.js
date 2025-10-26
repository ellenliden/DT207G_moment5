import mongoose from "mongoose";

// Schema för meny-kategorier (Burgers, Tacos, Drinks, etc.)
const menuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Kategorinamn krävs"],
      trim: true,
      maxlength: [50, "Kategorinamn får inte vara mer än 50 tecken"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Beskrivning får inte vara mer än 200 tecken"],
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order måste vara positivt"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, //lägger automatiskt till createdAt och updatedAt
  }
);

//Index för bättre prestanda vid sökningar
menuCategorySchema.index({ displayOrder: 1, isActive: 1 });

const MenuCategory = mongoose.model("MenuCategory", menuCategorySchema);

export default MenuCategory;
