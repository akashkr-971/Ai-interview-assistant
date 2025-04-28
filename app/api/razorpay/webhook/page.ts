import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!; // Set this in your .env file

  const signature = req.headers['x-razorpay-signature'] as string;
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  // Verify webhook signature
  if (signature !== expectedSignature) {
    return res.status(400).json({ status: 'Invalid signature' });
  }

  const event = req.body.event;

  if (event === 'payment.captured') {
    const payment = req.body.payload.payment.entity;
    console.log(payment);
    const product = payment.notes?.Product || 'Unknown';
    const page = payment.notes?.Page || 'N/A';
    const amount = payment.amount / 100;

    console.log(`💰 Product purchased: ${product}`);
    console.log(`🧾 Page: ${page}`);
    console.log(`💸 Amount: ₹${amount}`);

    return res.status(200).json({ status: 'success' });
  }

  return res.status(200).json({ status: 'event ignored' });
}
