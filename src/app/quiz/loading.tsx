// src/app/quiz/loading.tsx
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4 w-full md:w-64">
              <div className="h-10 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Accordion Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Role Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Cards Grid (Simulating open state for the first one) */}
              {i === 1 && (
                <div className="p-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                        <div className="flex justify-between">
                          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="pt-2">
                           <div className="h-8 w-full bg-gray-100 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fallback Spinner (Just in case user prefers simple) */}
        <div className="flex justify-center mt-12 text-indigo-600 opacity-50">
           <Loader2 className="h-8 w-8 animate-spin" />
        </div>

      </div>
    </div>
  )
}