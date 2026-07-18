import Razorpay from "razorpay";
import { NextResponse } from "next/server";

// Initialize Razorpay with your secret keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // Razorpay requires the amount in the smallest currency unit (paise for INR)
    // So ₹500 becomes 50000 paise
    const orderOptions = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(orderOptions);
    
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}