import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // ==================== BASIC INFO ====================
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser; // Password not required for Google users
      },
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================== ROLE ====================
    role: {
      type: String,
      enum: ["admin", "seller", "buyer"],
      default: "buyer",
      required: true,
    },

    // ==================== FAVOURITES ====================
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
      },
    ],

    // ==================== PAYMENT METHODS (Separate Collection) ====================
    paymentMethods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaymentMethod",
      },
    ],

    // ==================== STRIPE ====================
    stripeCustomerId: {
      type: String,
      default: "",
    },

    // ==================== GOOGLE OAUTH ====================
    googleId: {
      type: String,
      default: "",
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },

    // ==================== PROFILE ====================
    avatar: {
      type: String,
      default: "",
    },

    // ==================== TIMESTAMPS ====================
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ==================== VIRTUAL: Get default payment method ====================
UserSchema.virtual("defaultPaymentMethod", {
  ref: "PaymentMethod",
  localField: "_id",
  foreignField: "user",
  justOne: true,
  options: { match: { isDefault: true } },
});

// ==================== VIRTUAL: Get all payment methods (populated) ====================
UserSchema.virtual("allPaymentMethods", {
  ref: "PaymentMethod",
  localField: "_id",
  foreignField: "user",
});

// ==================== INDEXES ====================
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// ==================== PRE-SAVE HOOK ====================
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// ==================== TO JSON TRANSFORM ====================
UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

UserSchema.set("toObject", {
  virtuals: true,
});

// ==================== EXPORT ====================
export default mongoose.models.User || mongoose.model("User", UserSchema);