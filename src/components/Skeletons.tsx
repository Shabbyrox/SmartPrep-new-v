// src/components/Skeletons.tsx
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-5 mb-12">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow rounded-lg p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      <div className="lg:col-span-2 bg-white shadow rounded-lg p-4 h-[350px] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-full bg-gray-100 rounded" />
      </div>
      <div className="lg:col-span-1 bg-white shadow rounded-lg p-4 h-[350px] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 mx-auto" />
        <div className="h-48 w-48 bg-gray-200 rounded-full mx-auto mt-8" />
      </div>
    </div>
  )
}

export function RoleProgressSkeleton() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md animate-pulse">
      <ul className="divide-y divide-gray-200">
        {[...Array(3)].map((_, i) => (
          <li key={i} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5" />
          </li>
        ))}
      </ul>
    </div>
  )
}