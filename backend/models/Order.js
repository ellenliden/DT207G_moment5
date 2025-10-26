import mongoose from "mongoose";

// Schema för kundbeställningar (take away)
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "Beställningsnummer krävs"],
      unique: true,
      uppercase: true,
    },
    customerName: {
      type: String,
      required: [true, "Kundnamn krävs"],
      trim: true,
      maxlength: [100, "Kundnamn får inte vara mer än 100 tecken"],
    },
    phone: {
      type: String,
      required: [true, "Telefonnummer krävs"],
      trim: true,
      match: [/^[\+]?[0-9\s\-\(\)]{8,15}$/, "Ogiltigt telefonnummer"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Ogiltig e-postadress",
      ],
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Antal måste vara minst 1"],
          max: [20, "Antal får inte vara mer än 20"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Pris måste vara positivt"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Totalbelopp krävs"],
      min: [0, "Totalbelopp måste vara positivt"],
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    estimatedReadyTime: {
      type: Date,
    },
    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, "Special instruktioner får inte vara mer än 500 tecken"],
    },
  },
  {
    timestamps: true, //lägger automatiskt till createdAt och updatedAt
  }
);

// Indexer för bättre prestanda vid sökningar
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerName: 1 });

// Pre-save middleware för att generera beställningsnummer automatiskt
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `SB${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

//Virtual för att beräkna totalt antal items
orderSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Säkerställ att virtual fields inkluderas i JSON-utdata
orderSchema.set("toJSON", { virtuals: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
