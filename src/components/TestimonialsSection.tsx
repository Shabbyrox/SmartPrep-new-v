// src/components/TestimonialsSection.tsx
'use client'

import { Star, Quote } from 'lucide-react'

const testimonials = [
  // 1. Coding Arena
  {
    name: "Rohan Mehta",
    role: "Final Year CSE Student",
    content: "The coding arena is actually relevant for placements. I mostly used the company-specific filters. Instead of solving random problems, I just practiced the exact pattern asked by recruiters. It actually helped me clear my first OA because the logic was very similar.",
    rating: 5
  },
  // 2. Resume Analyzer
  {
    name: "Ananya Singh",
    role: "3rd Year IT Student",
    content: "I was applying to internships but getting no replies. The Analyzer showed me my ATS score was only 40% because of formatting errors. I fixed it and I've finally started getting OA links.",
    rating: 5
  },
  // 3. JD Matcher
  {
    name: "Vivek Patel",
    role: "Job Seeker (Fresh Grad)",
    content: "The JD Matcher is a lifesaver. I pasted a job description for a React role and it told me exactly which keywords I was missing. It helps you tailor your resume perfectly for specific companies.",
    rating: 5
  },
  // 4. Quiz
  {
    name: "Priya K.",
    role: "Pre-Final Year Student",
    content: "Used the quizzes to brush up on DBMS and OOPs concepts right before my interview. The questions are tricky but they cover the exact theory topics interviewers ask.",
    rating: 4
  }
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white border-t border-slate-200">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">
            What Our Users Say
          </h2>
          <p className="text-lg text-slate-600">
            Join hundreds of students and professionals accelerating their careers.
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-12 gap-6 snap-x snap-mandatory px-4 items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {testimonials.map((item, idx) => (
              <div 
                key={idx} 
                // Fixed width of 350px per card ensures readability while scrolling
                className="relative min-w-[320px] md:min-w-[350px] w-[350px] flex-shrink-0 snap-center p-8 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-100 hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 h-6 w-6 text-indigo-100 fill-indigo-100" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-700 leading-relaxed mb-6 flex-grow text-sm md:text-base">
                  "{item.content}"
                </p>

                {/* Author */}
                <div className="mt-auto border-t border-slate-200 pt-4">
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">{item.role}</p>
                </div>
              </div>
            ))}

          </div>
          
          {/* Fade Effect for Mobile (Right Side) */}
          <div className="absolute right-0 top-0 bottom-12 w-16 bg-gradient-to-l from-white to-transparent md:hidden pointer-events-none" />
        </div>

      </div>
    </section>
  )
}