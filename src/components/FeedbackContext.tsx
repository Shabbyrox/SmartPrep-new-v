'use client'

import { useState } from 'react'
import { MessageSquare, X, Star, Send, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function FeedbackContext() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true) // Controls visibility
  
  // Form State
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1. Get User ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // 2. Insert into Supabase
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        rating,
        message: comment,
        category: 'Dashboard_Prompt'
      })

      if (error) throw error

      // 3. Success UI
      setIsOpen(false)
      setIsVisible(false) // 👋 Hides the button immediately
      router.refresh() // Updates server state so it stays hidden on reload

    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user has already submitted (controlled by parent) or just submitted, hide everything
  if (!isVisible) return null

  return (
    <>
      {/* 🟢 THE TRIGGER BUTTON (Beside Name) */}
      <button
        onClick={() => setIsOpen(true)}
        className="ml-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors border border-indigo-200"
      >
        <Star className="h-3 w-3 fill-indigo-700" />
        Rate Us
      </button>

      {/* 🔵 THE MODAL */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900">How's your experience?</h3>
                  <button onClick={() => setIsOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Stars */}
                  <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star className={`h-8 w-8 ${star <= (hoveredRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-50'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Comment */}
                  <textarea 
                    rows={3}
                    placeholder="Any suggestions? (Optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-sm p-3 text-slate-900 bg-slate-200 rounded-lg border-transparent focus:border-indigo-500 focus:bg-white transition-colors resize-none"
                  />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={rating === 0 || isSubmitting}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit Feedback <Send className="h-3 w-3" /></>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}