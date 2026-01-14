// src/app/api/payment/create-order/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  // 1. Capture keys in variables
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  // 2. Safety Check: If keys are missing (undefined), stop here.
  if (!key_id || !key_secret) {
    console.warn("Razorpay keys are missing. Payment disabled.");
    // We return a 503 Service Unavailable status
    return NextResponse.json({ message: 'Payment gateway not configured' }, { status: 503 });
  }

  try {
    // 3. Initialize Razorpay using the variables (TypeScript now knows they are definitely strings)
    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    const body = await request.json();

    if (!body.amount) {
      return NextResponse.json({ message: 'Amount is required' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: body.amount * 100,
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}