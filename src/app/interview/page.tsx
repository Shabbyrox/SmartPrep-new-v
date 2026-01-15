// src/app/interview/page.tsx
import InterviewCard from '@/components/InterviewCard'

export default function InterviewPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">AI Voice Interview</h1>
                <InterviewCard />
            </div>
        </div>
    )
}
