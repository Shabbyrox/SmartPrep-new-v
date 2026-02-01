// src/components/DashboardChart.tsx
'use client'

import dynamic from 'next/dynamic'
import {  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

const ScoresPieChart = dynamic(() => import('@/components/ScoresPieChart'), { ssr: false })

interface WeeklyScore {
    name: string;
    score: number;
}

interface DashboardChartProps {
    data: WeeklyScore[];
    quizScore: number;
    resumeScore: number;
    interviewScore: number;
}

export default function DashboardChart({ data, quizScore, resumeScore, interviewScore }: DashboardChartProps) {
    return (
        // 1. items-stretch makes both children equal height automatically
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* LEFT SIDE */}
            <div className="lg:col-span-2 bg-white shadow rounded-xl border border-slate-200 p-6 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        Weekly Performance
                    </h3>
                    <p className="text-sm text-slate-500">
                        Your average score trend over time.
                    </p>
                </div>

                {/* 2. Fixed height container for the Area Chart */}
                <div className="flex-1 min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 12 }} 
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 12 }} 
                                domain={[0, 100]}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '8px', 
                                    border: '1px solid #e2e8f0', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                }}
                                itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                                formatter={(value: any) => [`${value}%`, 'Avg Score']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#4f46e5" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RIGHT SIDE */}
            {/* 3. FIX: explicit height here so the child's "h-full" works */}
            <div className="lg:col-span-1 min-h-[400px]">
                <ScoresPieChart 
                    quizScore={quizScore} 
                    resumeScore={resumeScore} 
                    interviewScore={interviewScore} 
                />
            </div>
        </div>
    )
}