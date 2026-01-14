// src/app/api/payment/verify/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // 1. Capture the secret safely
    const secret = process.env.RAZORPAY_KEY_SECRET;

    // 2. Safety Check: If secret is missing, stop immediately.
    if (!secret) {
      console.warn("Razorpay secret is missing. Verification disabled.");
      return NextResponse.json({ message: 'Payment verification disabled' }, { status: 503 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;

    // 3. Use the 'secret' variable (TypeScript knows it is definitely a string here)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(sign)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ message: 'Payment verification failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}