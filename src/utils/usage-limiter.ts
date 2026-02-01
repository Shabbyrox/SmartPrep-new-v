// src/utils/usage-limiter.ts
import { SupabaseClient } from '@supabase/supabase-js'

const MAX_DAILY_LIMIT = 3
type UsageType = 'pdf_scan_count' | 'jd_match_count' | 'builder_ai_count'

// 1. CHECK ONLY (Read-Only)
export async function checkDailyLimit(
    supabase: SupabaseClient, 
    userId: string, 
    type: UsageType
) {
    const today = new Date().toISOString().split('T')[0]

    const { data: usage } = await supabase
        .from('user_daily_usage')
        .select('*')
        .eq('user_id', userId)
        .single()

    // If no record, or record is from yesterday, they are safe to proceed
    if (!usage || usage.date_tracked !== today) {
        return { allowed: true }
    }

    // If record exists for today, check the number
    if (usage[type] >= MAX_DAILY_LIMIT) {
        return { allowed: false, message: `Daily limit reached (3/3). Try again tomorrow!` }
    }

    return { allowed: true }
}

// 2. INCREMENT ONLY (Call this AFTER success)
export async function incrementDailyLimit(
    supabase: SupabaseClient, 
    userId: string, 
    type: UsageType
) {
    const today = new Date().toISOString().split('T')[0]

    const { data: usage } = await supabase
        .from('user_daily_usage')
        .select('*')
        .eq('user_id', userId)
        .single()

    // Scenario A: First success of the day (or new user) -> Create/Reset row
    if (!usage || usage.date_tracked !== today) {
        await supabase
            .from('user_daily_usage')
            .upsert({ 
                user_id: userId, 
                date_tracked: today, 
                pdf_scan_count: 0, 
                jd_match_count: 0, 
                builder_ai_count: 0,
                [type]: 1 // Set this specific action to 1
            })
        return
    }

    // Scenario B: Just add 1 to existing today's count
    await supabase
        .from('user_daily_usage')
        .update({ [type]: usage[type] + 1 })
        .eq('user_id', userId)
}