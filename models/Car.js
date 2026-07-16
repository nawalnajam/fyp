import mongoose from "mongoose";

const CarSchema = new mongoose.Schema(
  {
    brand: String,
    model: String,
    year: String,
    bodyType: String,
    color: String,

    fuelType: String,
    transmission: String,
    seats: String,

    driveType: String,
    headlights: String,
    condition: String,

    additionalInfo: String,

    price: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    images: [String],
  // ✅ AGGREGATION: Car references Seller (ObjectId)
  // If seller is deleted, car can still exist 
    // ✅ required
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    /* ======================== */
    /* 🔥 ANALYTICS FIELDS     */
    /* ======================== */
    views: {
      type: Number,
      default: 0,
    },

    testDriveCount: {
      type: Number,
      default: 0,
    },

    /* ======================== */
    /* 📌 SELLER AD STATUS     */
    /* pending → admin approve  */
    /* ======================== */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold"],
      default: "pending",
    },

    /* ======================== */
    /* 🏷️ ADMIN INVENTORY      */
    /* available / unavailable  */
    /* ======================== */
    availabilityStatus: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",   // admin car add kare → seedha available
    },

    // ✅ Admin cars or seller car?
    addedByAdmin: {
      type: Boolean,
      default: false,
    },

    // ✅ Featured cars
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
  // /models/User.js - Add this field in schema


);

export default mongoose.models.Car || mongoose.model("Car", CarSchema);