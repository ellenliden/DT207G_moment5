import mongoose from "mongoose";

//Schema för meny-items (maträtter)
const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Maträttsnamn krävs"],
      trim: true,
      maxlength: [100, "Namn får inte vara mer än 100 tecken"],
    },
    description: {
      type: String,
      required: [true, "Beskrivning krävs"],
      trim: true,
      maxlength: [500, "Beskrivning får inte vara mer än 500 tecken"],
    },
    price: {
      type: Number,
      required: [true, "Pris krävs"],
      min: [0, "Pris måste vara positivt"],
      max: [10000, "Pris får inte vara mer än 10000 kr"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: [true, "Kategori krävs"],
    },
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Tom URL är ok
          try {
            const url = new URL(v);
            return url.protocol === "http:" || url.protocol === "https:";
          } catch {
            return false;
          }
        },
        message: "Bild-URL måste vara giltig",
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    allergens: [
      {
        type: String,
        trim: true,
        lowercase: true, // Konvertera automatiskt till små bokstäver
      },
    ],
    preparationTime: {
      type: Number,
      default: 15,
      min: [1, "Tillagningstid måste vara minst 1 minut"],
      max: [120, "Tillagningstid får inte vara mer än 120 minuter"],
    },
  },
  {
    timestamps: true, //lägger automatiskt till createdAt och updatedAt
  }
);

//Indexer för bättre prestanda vid sökningar
menuItemSchema.index({ categoryId: 1, isAvailable: 1 });
menuItemSchema.index({ isPopular: 1 });
menuItemSchema.index({ name: "text", description: "text" }); // Text-sökning

// Virtual för att populära maträtter i kategori-information
menuItemSchema.virtual("category", {
  ref: "MenuCategory",
  localField: "categoryId",
  foreignField: "_id",
  justOne: true,
});

//Säkerställ att virtual fields inkluderas i JSON-utdata
menuItemSchema.set("toJSON", { virtuals: true });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
