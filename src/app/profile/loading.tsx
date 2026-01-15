// src/app/profile/loading.tsx
export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 py-12 sm:px-6 lg:px-8">
             <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8 animate-pulse"></div>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 space-y-6 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i}>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                    <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
                </div>
            </div>
        </div>
    )
}