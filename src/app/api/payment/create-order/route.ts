import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.amount) {
      return NextResponse.json({ message: 'Amount is required' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: body.amount * 100, // rupees -> paise
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}