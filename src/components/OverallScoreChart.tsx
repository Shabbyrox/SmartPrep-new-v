// src/components/OverallScoreChart.tsx
'use client'

import { memo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface WeeklyScore {
    name: string; // e.g., "Week 1", "2023-10-28"
    score: number;
}

interface OverallScoreChartProps {
    data: WeeklyScore[];
}

const OverallScoreChart = ({ data }: OverallScoreChartProps) => {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Average Score</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis 
                        dataKey="name" 
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
        
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #ccc',
                            borderRadius: '0.5rem' 
                        }} 
                        labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default memo(OverallScoreChart)
