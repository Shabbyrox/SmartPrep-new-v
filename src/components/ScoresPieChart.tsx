// src/components/ScoresPieChart.tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { memo } from 'react'

interface Props {
    quizScore: number
    resumeScore: number
    interviewScore: number
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B']; // Indigo, Emerald, Amber

const ScoresPieChart = ({ quizScore, resumeScore, interviewScore }: Props) => {
    const data = [
        { name: 'Quiz Accuracy', value: quizScore },
        { name: 'Resume Score', value: resumeScore },
        // Normalize interview (0-10) to percentage (0-100) for visual comparison
        { name: 'Interview Score', value: interviewScore * 10 }, 
    ]

    // Filter out zero values so the chart doesn't look broken if data is missing
    const activeData = data.filter(d => d.value > 0)

    if (activeData.length === 0) {
        return (
            <div className="bg-white overflow-hidden shadow rounded-lg p-4 h-full flex items-center justify-center">
                <p className="text-gray-400">No data for pie chart</p>
            </div>
        )
    }

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg p-4 h-full flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Skill Distribution</h3>
            <div className="flex-grow min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={activeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, value}) => `${value}%`}
                        >
                            {activeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `${value}%`} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default memo(ScoresPieChart)