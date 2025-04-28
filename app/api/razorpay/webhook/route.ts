import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  
  const signature = req.headers.get('x-razorpay-signature') || '';
  const body = await req.text(); // Important: .text(), not .json()

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ status: 'Invalid signature' }, { status: 400 });
  }

  const jsonBody = JSON.parse(body); // now parse after verifying
  const event = jsonBody.event;

  if (event === 'payment.captured') {
    const payment = jsonBody.payload.payment.entity;
    console.log(payment);
    const product = payment.notes?.Product || 'Unknown';
    const page = payment.notes?.Page || 'N/A';
    const amount = payment.amount / 100;

    console.log(`💰 Product purchased: ${product}`);
    console.log(`🧾 Page: ${page}`);
    console.log(`💸 Amount: ₹${amount}`);

    return NextResponse.json({ status: 'success' });
  }

  return NextResponse.json({ status: 'event ignored' });
}
