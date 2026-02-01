import { createClient } from '@/utils/supabase/server'

export async function getUserStreak(userId: string) {
    const supabase = await createClient()

    // 1. Fetch all solved dates (unique)
    const { data } = await supabase
        .from('user_leetcode_progress')
        .select('solved_at')
        .eq('user_id', userId)
        .order('solved_at', { ascending: false })

    if (!data || data.length === 0) {
        return { currentStreak: 0, hasSolvedToday: false }
    }

    // 2. Normalize dates to YYYY-MM-DD to ignore time
    const solvedDates = new Set(
        data.map(item => new Date(item.solved_at).toISOString().split('T')[0])
    )

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const hasSolvedToday = solvedDates.has(today)
    
    // 3. Calculate Streak
    let streak = 0
    let checkDate = new Date()

    // If they haven't solved today, start checking from yesterday to preserve streak
    if (!hasSolvedToday) {
        checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0]
        if (solvedDates.has(dateStr)) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1) // Go back one day
        } else {
            break // Streak broken
        }
    }

    return { currentStreak: streak, hasSolvedToday }
}