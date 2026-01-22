// src/components/PaymentGateway_Tempname.tsx
'use client'

export default function PaymentGateway() {
  // Logic removed for deployment safety
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-lg bg-white p-8 shadow-lg text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">💎</span>
          </div>
        </div>
        
        <h1 className="mb-2 text-gray-800 text-2xl font-bold">Premium Features</h1>
        <p className="mb-6 text-gray-600">
          We are currently upgrading our payment system to bring you a smoother experience.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-sm text-yellow-800 font-medium">
                Payments are temporarily paused.
            </p>
        </div>

        <button
          disabled
          className="w-full rounded bg-gray-300 px-6 py-3 text-white cursor-not-allowed font-medium"
        >
          Coming Soon
        </button>
      </div>
    </div>
  )
}