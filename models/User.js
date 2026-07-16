// /models/User.js

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
        
    // ✅ Payment Methods - Professional
    paymentMethods: [{
      id: { type: String }, // Stripe PaymentMethod ID
      type: { 
        type: String, 
        enum: ["card", "jazzcash", "easypaisa", "bank"],
        required: true 
      },
      last4: { type: String }, // Last 4 digits for card
      brand: { type: String }, // Card brand (visa, mastercard, etc.)
      accountNo: { type: String },
      nameOnAccount: { type: String, default: "" },
      isDefault: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Stripe Customer ID
    stripeCustomerId: { type: String, default: "" },
    
    // ✅ Google OAuth fields
    googleId: { type: String, sparse: true },
    isGoogleUser: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
    paymentMethods: [{
      type: { type: String, enum: ["jazzcash", "easypaisa", "bank", "card"] },
      accountNo: String,
      isDefault: { type: Boolean, default: false }
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);