// src/app/dashboard/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard...</h2>
      </div>
    </div>
  );
}