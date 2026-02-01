// src/app/resume/loading.tsx

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Skeleton */}
        <div className="text-center mb-12 animate-pulse space-y-4">
          {/* Title Placeholder */}
          <div className="h-10 bg-slate-200 rounded-lg w-3/4 md:w-1/2 mx-auto"></div>
          {/* Subtitle Placeholder */}
          <div className="h-4 bg-slate-200 rounded w-full md:w-2/3 mx-auto"></div>
        </div>

        {/* 3-Column Grid Skeleton */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="relative flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Card Header (Colored part mimic) */}
              <div className="p-6 bg-slate-100 border-b border-slate-50 animate-pulse flex justify-between items-start">
                {/* Icon Box Skeleton */}
                <div className="h-14 w-14 bg-slate-200 rounded-xl"></div>
                {/* Badge Skeleton */}
                <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
              </div>

              {/* Card Content Skeleton */}
              <div className="p-6 flex-1 flex flex-col justify-between animate-pulse">
                <div className="space-y-4">
                  {/* Title */}
                  <div className="h-7 bg-slate-200 rounded w-3/4"></div>
                  {/* Description Lines */}
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                  </div>
                </div>
                
                {/* Bottom "Start Now" Skeleton */}
                <div className="mt-8 flex items-center gap-2">
                  <div className="h-5 w-24 bg-slate-200 rounded"></div>
                  <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  )
}