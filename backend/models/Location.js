import mongoose from "mongoose";

// Schema för food truck-platser och öppettider
const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Platsnamn krävs"],
      trim: true,
      maxlength: [100, "Platsnamn får inte vara mer än 100 tecken"],
    },
    address: {
      type: String,
      required: [true, "Adress krävs"],
      trim: true,
      maxlength: [200, "Adress får inte vara mer än 200 tecken"],
    },
    coordinates: {
      lat: {
        type: Number,
        min: [-90, "Latitud måste vara mellan -90 och 90"],
        max: [90, "Latitud måste vara mellan -90 och 90"],
      },
      lng: {
        type: Number,
        min: [-180, "Longitud måste vara mellan -180 och 180"],
        max: [180, "Longitud måste vara mellan -180 och 180"],
      },
    },
    schedule: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
          match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Tid måste vara i format HH:MM",
          ],
        },
        endTime: {
          type: String,
          required: true,
          match: [
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Tid måste vara i format HH:MM",
          ],
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Lägger automatiskt till createdAt och updatedAt
  }
);

// Indexer för bättre prestanda vid sökningar
locationSchema.index({ isActive: 1 });
locationSchema.index({ "schedule.day": 1 });

// Virtual för att få dagens schema
locationSchema.virtual("todaySchedule").get(function () {
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  return this.schedule.find((s) => s.day === today && s.isActive);
});

// Virtual för att kontrollera om platsen är öppen just nu
locationSchema.virtual("isOpenNow").get(function () {
  const todaySchedule = this.todaySchedule;
  if (!todaySchedule) return false;

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  return (
    currentTime >= todaySchedule.startTime &&
    currentTime <= todaySchedule.endTime
  );
});

//Säkerställ att virtual fields inkluderas i JSON-utdata
locationSchema.set("toJSON", { virtuals: true });

const Location = mongoose.model("Location", locationSchema);

export default Location;
