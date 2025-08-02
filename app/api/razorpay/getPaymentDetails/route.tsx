import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_id } = body;

    if (!payment_id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const payment = await razorpay.payments.fetch(payment_id);
    
    return NextResponse.json({
      id: payment.id,
      method: payment.method,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      bank: payment.bank || null,
      wallet: payment.wallet || null,
      vpa: payment.vpa || null, 
      card_id: payment.card_id || null,
      created_at: payment.created_at
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json({ error: 'Failed to fetch payment details' }, { status: 500 });
  }
}