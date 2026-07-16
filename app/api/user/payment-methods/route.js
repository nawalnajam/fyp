// /app/api/user/payment-methods/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

// ✅ Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getUserId(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

// ✅ GET - Get all payment methods
export async function GET(req) {
  try {
    await connectDB();
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId).select("paymentMethods stripeCustomerId");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      methods: user.paymentMethods || [],
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch (error) {
    console.error("❌ GET Payment Methods Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ POST - Add payment method
export async function POST(req) {
  try {
    await connectDB();
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { paymentMethodId, type, accountNo, nameOnAccount } = await req.json();

    if (!paymentMethodId && !accountNo) {
      return NextResponse.json(
        { success: false, message: "Payment method details required" },
        { status: 400 }
      );
    }

    let user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ If card payment via Stripe
    if (paymentMethodId) {
      // Get or create Stripe customer
      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user._id.toString() },
        });
        user.stripeCustomerId = customer.id;
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId,
      });

      // Get payment method details
      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      // Add to local database
      const isFirst = user.paymentMethods.length === 0;
      user.paymentMethods.push({
        id: paymentMethodId,
        type: "card",
        last4: pm.card?.last4 || "****",
        brand: pm.card?.brand || "card",
        isDefault: isFirst,
        nameOnAccount: nameOnAccount || "",
      });
      
      await user.save();

      return NextResponse.json({
        success: true,
        message: "Card added successfully",
        methods: user.paymentMethods,
      });
    }

    // ✅ Mobile wallet or bank (manual entry)
    const isFirst = user.paymentMethods.length === 0;
    user.paymentMethods.push({
      type: type || "jazzcash",
      accountNo: accountNo,
      nameOnAccount: nameOnAccount || "",
      isDefault: isFirst,
    });
    
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment method added successfully",
      methods: user.paymentMethods,
    });

  } catch (error) {
    console.error("❌ POST Payment Method Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Remove payment method
export async function DELETE(req) {
  try {
    await connectDB();
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const methodId = searchParams.get("id");

    if (!methodId) {
      return NextResponse.json(
        { success: false, message: "Method ID required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find the method to delete
    const methodToDelete = user.paymentMethods.find(
      m => m._id.toString() === methodId
    );

    if (!methodToDelete) {
      return NextResponse.json(
        { success: false, message: "Payment method not found" },
        { status: 404 }
      );
    }

    // ✅ If Stripe card, detach from Stripe
    if (methodToDelete.id && user.stripeCustomerId) {
      try {
        await stripe.paymentMethods.detach(methodToDelete.id);
      } catch (e) {
        console.log("Stripe detach error:", e.message);
      }
    }

    // Remove from local database
    user.paymentMethods = user.paymentMethods.filter(
      m => m._id.toString() !== methodId
    );

    // If deleted method was default, set first as default
    if (user.paymentMethods.length > 0) {
      const hasDefault = user.paymentMethods.some(m => m.isDefault);
      if (!hasDefault) {
        user.paymentMethods[0].isDefault = true;
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
      methods: user.paymentMethods,
    });
  } catch (error) {
    console.error("❌ DELETE Payment Method Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ PATCH - Set default payment method
export async function PATCH(req) {
  try {
    await connectDB();
    const userId = getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { methodId } = await req.json();

    if (!methodId) {
      return NextResponse.json(
        { success: false, message: "Method ID required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find the method
    const methodToSet = user.paymentMethods.find(
      m => m._id.toString() === methodId
    );

    if (!methodToSet) {
      return NextResponse.json(
        { success: false, message: "Payment method not found" },
        { status: 404 }
      );
    }

    // ✅ If Stripe card, set as default in Stripe
    if (methodToSet.id && user.stripeCustomerId) {
      try {
        await stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: { default_payment_method: methodToSet.id },
        });
      } catch (e) {
        console.log("Stripe default set error:", e.message);
      }
    }

    // Update local
    user.paymentMethods.forEach(m => {
      m.isDefault = m._id.toString() === methodId;
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Default payment method updated",
      methods: user.paymentMethods,
    });
  } catch (error) {
    console.error("❌ PATCH Payment Method Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}