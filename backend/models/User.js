import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//Användarschema för administratörer
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Användarnamn krävs"],
      unique: true,
      trim: true,
      minlength: [3, "Användarnamn måste vara minst 3 tecken"],
      maxlength: [30, "Användarnamn får inte vara mer än 30 tecken"],
    },
    email: {
      type: String,
      required: [true, "E-post krävs"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Ogiltig e-postadress",
      ],
    },
    password: {
      type: String,
      required: [true, "Lösenord krävs"],
      minlength: [6, "Lösenord måste vara minst 6 tecken"],
    },
    role: {
      type: String,
      enum: ["admin", "manager"],
      default: "admin",
    },
  },
  {
    timestamps: true, // Lägger automatiskt till createdAt och updatedAt
  }
);

// Hasha lösenord innan sparning
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// metod för att jämföra lösenord
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ta bort lösenord från JSON-utdata
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
