import Link from 'next/link'
import { Flame, CheckCircle2, ArrowRight, Target } from 'lucide-react'

interface DailyGoalProps {
    streak: number
    hasSolvedToday: boolean
}

export default function DailyGoalCard({ streak, hasSolvedToday }: DailyGoalProps) {
    return (
        // 1. Removed 'h-full'. Added 'h-fit' so it only takes necessary space.
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col h-fit relative overflow-hidden">
            
            {/* Background Decoration (Made smaller) */}
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 -mr-6 -mt-6 ${
                hasSolvedToday ? 'bg-green-500' : 'bg-orange-500'
            }`} />

            {/* Header */}
            <div className="flex justify-between items-start relative z-10 mb-4">
                <div>
                    <h3 className="font-bold text-slate-900 text-base">Daily Goal</h3>
                    <p className="text-xs text-slate-500">Keep it up!</p>
                </div>
                
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs ${
                    streak > 0 
                        ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                        : 'bg-slate-100 text-slate-400'
                }`}>
                    <Flame className={`w-3.5 h-3.5 ${streak > 0 && 'fill-orange-600'}`} />
                    <span>{streak} Days</span>
                </div>
            </div>

            {/* Middle: Visual Status (Compact) */}
            <div className="flex items-center gap-4 mb-5">
                {hasSolvedToday ? (
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                ) : (
                    <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center border-2 border-dashed border-orange-200 shrink-0">
                        <Target className="w-6 h-6" />
                    </div>
                )}
                
                <div>
                    <p className="font-bold text-slate-900 text-sm">
                        {hasSolvedToday ? 'Goal Complete!' : '0 / 1 Solved'}
                    </p>
                    <p className="text-xs text-slate-500">
                        {hasSolvedToday ? 'Come back tomorrow.' : 'Solve a problem today.'}
                    </p>
                </div>
            </div>

            {/* Footer: Action Button (Compact) */}
            <div className="relative z-10">
                {hasSolvedToday ? (
                     <Link 
                        href="/coding" 
                        className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-green-100 border border-green-200 transition-colors"
                     >
                        Practice More 
                     </Link>
                ) : (
                    <Link 
                        href="/coding" 
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md hover:bg-slate-800 transition-all hover:scale-[1.02]"
                    >
                        Solve Now <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    )
}