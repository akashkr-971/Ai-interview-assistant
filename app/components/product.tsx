'use client'

import { useState } from 'react'

interface CoinProduct {
  id: string
  label: string
  coins: number
  price: number
}

const PRODUCTS: CoinProduct[] = [
  { id: 'coinx1', label: '1 Coin', coins: 1, price: 10 },
  { id: 'coinx5', label: '5 Coins', coins: 5, price: 45 },
  { id: 'coinx10', label: '10 Coins', coins: 10, price: 80 },
  { id: 'coinx50', label: '50 Coins', coins: 50, price: 350 },
]

export default function ProductModal({ onClose }: { onClose: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<CoinProduct | null>(PRODUCTS[0])

  type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

const openCheckout = async () => {
  if (!selectedProduct) return;

  const order = await fetch('/api/razorpay/createOrder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: selectedProduct.price * 100,
    }),
  }).then(res => res.json());

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: order.amount,
    currency: 'INR',
    name: 'PrepWise',
    description: `${selectedProduct.label} Purchase`,
    order_id: order.id,
    handler: function (response: RazorpayResponse) {
      alert(`Payment Successful for ${selectedProduct.label}`);
      console.log('Payment ID:', response.razorpay_payment_id);
      console.log('Order ID:', response.razorpay_order_id);
      console.log('Signature:', response.razorpay_signature);
    },
    prefill: {
      name: 'Customer Name',
      email: 'email@example.com',
      contact: '9999999999',
    },
    notes: {
      product_id: selectedProduct.id,
      product_name: selectedProduct.label,
    },
    theme: {
      color: '#f97316',
    },
  };

  const rzp = new (window as any).Razorpay(options); 
  rzp.open();
};

  return (
    <div className="fixed inset-0 bg-opacity-40 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full relative">
        <h2 className="text-xl font-semibold mb-4">Buy Coins</h2>

        <div className="space-y-3">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                selectedProduct?.id === product.id ? 'bg-orange-100 border-orange-500' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedProduct(product)}
            >
              <span>{product.label}</span>
              <span>₹{product.price}</span>
            </div>
          ))}
        </div>

        <button
          className="bg-green-600 text-white px-4 py-2 mt-4 rounded hover:bg-green-700 w-full"
          onClick={openCheckout}
        >
          Pay with Razorpay
        </button>

        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
