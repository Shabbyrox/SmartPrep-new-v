'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentGateway() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const handlePayment = async () => {
    try {
      
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 499 }), 
      })

      if (!res.ok) throw new Error('Failed to create order');
      const order = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'SmartPrep',
        description: 'Premium Subscription',
        order_id: order.id,

        handler: async function (response: any) {
          // 3️⃣ Verify payment (Updated URL)
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })

          const result = await verifyRes.json()

          if (result.success) {
            alert('✅ Payment Successful!')
          } else {
            alert('❌ Payment Verification Failed')
          }
        },
        theme: { color: '#2563eb' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-lg text-center">
        <h1 className="mb-4 text-2xl font-bold">Upgrade to Premium</h1>
        <p className="mb-6 text-gray-600">Get access to all premium features</p>
        <button
          onClick={handlePayment}
          className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Pay ₹499
        </button>
      </div>
    </div>
  )
}