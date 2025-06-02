'use client'

import { useState } from 'react'
import { supabase } from "@/lib/supabaseClient";

interface CoinProduct {
  id: string
  label: string
  coins: number
  price: number
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number | string
  currency: string
  name: string
  description: string
  image?: string
  order_id?: string
  handler: (response: RazorpayResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: {
    product_id: string | number
    product_name: string
    [key: string]: string | number
  }
  theme?: {
    color?: string
  }
  modal?: {
    escape?: boolean
    ondismiss?: () => void
  }
  [key: string]: unknown
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void
    }
  }
}

const PRODUCTS: CoinProduct[] = [
  { id: 'coinx1', label: '1 Coin', coins: 1, price: 10 }, 
  { id: 'coinx5', label: '5 Coins', coins: 5, price: 45 },     
  { id: 'coinx10', label: '10 Coins', coins: 10, price: 80 },  
  { id: 'coinx25', label: '25 Coins', coins: 25, price: 175 }, 
  { id: 'coinx50', label: '50 Coins', coins: 50, price: 300 },  
  { id: 'coinx100', label: '100 Coins', coins: 100, price: 500 },
]

export default function ProductModal({ onClose }: { onClose: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState<CoinProduct | null>(PRODUCTS[0])

  const openCheckout = async (): Promise<void> => {
    if (!selectedProduct) return

    const order = await fetch('/api/razorpay/createOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: selectedProduct.price * 100,
      }),
    }).then((res) => res.json())

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
      amount: order.amount,
      currency: 'INR',
      name: 'PrepWise',
      description: `${selectedProduct.label} Purchase`,
      order_id: order.id,
      handler: () => {
        updatecoins(selectedProduct.coins);
        onClose();
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
      modal: {
        escape: true,
        ondismiss: () => {
          console.log('Payment dismissed')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp?.open()
  }

  const updatecoins = async (coins:number) => {
    const {error} = await supabase.from('users').update({coins: coins}).eq('id', localStorage.getItem('userId'));
    if(error){
      console.log(error);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
            <img src="/coin.svg" alt="Coin" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Buy Coins</h2>
          <p className="text-xs sm:text-sm text-gray-600">Get more coins to generate interviews</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {PRODUCTS.map((product) => {
            const isSelected = selectedProduct?.id === product.id;
            const basePrice = product.coins * 10;
            const discount = Math.round(((basePrice - product.price) / basePrice) * 100);
            
            return (
              <div
                key={product.id}
                className={`relative p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                    -{discount}%
                  </div>
                )}
                
                <div className="text-center">
                  <img src="/coin.svg" alt="Coin" className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">{product.label}</div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">₹{product.price}</div>
                  <div className="text-xs text-gray-500">₹{Math.round(product.price / product.coins)} per coin</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Button */}
        <button
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200"
          onClick={openCheckout}
          disabled={!selectedProduct}
        >
          Pay with Razorpay
        </button>
        <button
          className="text-white w-full text-lg mt-2 font-bold bg-red-500 py-2 rounded-xl hover:bg-red-700 "
          onClick={onClose}
        >
          Cancel
        </button>

        {/* Trust Badge */}
        <div className="text-center mt-3 text-sm text-gray-500">
          🔒 Secure Payment • Instant Delivery
        </div>
      </div>
    </div>
  )
}
