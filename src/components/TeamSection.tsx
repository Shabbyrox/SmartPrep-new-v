// src/components/TeamSection.tsx
'use client'

import { Linkedin, Github, Code2, Crown, Mail } from 'lucide-react'
import Image from 'next/image'

const team = [
  // 1. Founder
  {
    name: 'Sneh Limbani',
    role: 'Founder & MD',
    image: '/sneh_linkedin.png', 
    bio: 'Driven by a genuine passion to bridge the gap between education and industry, empowering students to reach their full potential.',
    socials: { 
      email: 'limbanisneh55@gmail.com',
      linkedin: 'https://www.linkedin.com/in/sneh-limbani-b88113297'
    }
  },
  // 2. Lead Developer
  {
    name: 'Shubham Debnath',
    role: 'Lead Developer',
    image: null, 
    bio: 'Leading the technical architecture and core development of the platform.',
    socials: { 
      linkedin: 'https://www.linkedin.com/in/shubhamdebnath00', 
      github: 'https://github.com/Shabbyrox' 
    }
  },
  // 3. Dev 1
  {
    name: 'Prasham Karkera',
    role: 'Full Stack Developer',
    image: null,
    bio: 'Building seamless full-stack solutions with a focus on intuitive user experiences.',
    socials: { 
      linkedin: 'https://www.linkedin.com/in/prasham-karkera-3a6820290/', 
      github: 'https://github.com/Prasham-Karkera' 
    }
  },
  // 4. Dev 2
  {
    name: 'Simon Shibu',
    role: 'Full Stack Developer',
    image: null,
    bio: 'Integrating machine learning capabilities with robust backend systems.',
    socials: { 
      linkedin: 'https://www.linkedin.com/in/simon-k-shibu-75a40128b/', 
      github: 'https://github.com/SimSam0' 
    }
  },
  // 5. Dev 3
  {
    name: 'Yash Pithwa',
    role: 'Full Stack Developer',
    image: null,
    // 👇 Shortened slightly to match the others perfectly
    bio: 'Optimizing database architecture and implementing data-driven AI logic.',
    socials: { 
      linkedin: 'https://www.linkedin.com/in/yash-pithwa-29a29b277/', 
      github: 'https://github.com/Yashpithwa' 
    }
  }
]

export default function TeamSection() {
  return (
    <section id="team" className="py-24 bg-white border-t border-slate-200">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">
            Meet the Builders
          </h2>
          <p className="text-lg text-slate-600">
            The dedicated team working behind the scenes.
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-12 gap-6 snap-x snap-mandatory px-4 items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {team.map((member, idx) => (
              <div 
                key={idx} 
                className="group relative min-w-[300px] w-[300px] flex flex-col flex-shrink-0 snap-center rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center transition-all duration-300 hover:border-indigo-100 hover:bg-white hover:shadow-xl hover:-translate-y-1"
              >
                
                {/* Avatar */}
                <div className="mx-auto mb-6 h-32 w-32 relative rounded-full border-4 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center group-hover:border-indigo-50 transition-colors">
                   {member.image ? (
                      <Image 
                          src={member.image} 
                          alt={member.name}
                          fill
                          className="object-cover"
                      />
                   ) : (
                      <Code2 className="h-12 w-12 text-indigo-400" />
                   )}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-slate-900">
                  {member.name}
                </h3>
                
                {/* Role */}
                <div className="flex items-center justify-center gap-2 mb-4 mt-1">
                  {member.role.includes('Founder') && <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  <p className="text-sm font-medium text-indigo-600">
                      {member.role}
                  </p>
                </div>
                
                {/* Bio */}
                <p className="text-slate-600 mb-6 text-sm leading-relaxed flex-grow">
                  {member.bio}
                </p>

                {/* Social Icons - mt-auto ensures they stick to bottom */}
                <div className="flex justify-center gap-4 mt-auto pt-4">
                  
                  {/* Email (For Founder) */}
                  {/* @ts-ignore */}
                  {member.socials.email && (
                    <a href={`mailto:${member.socials.email}`} className="text-slate-400 hover:text-red-500 transition-colors" aria-label="Email">
                      <Mail className="h-5 w-5" />
                    </a>
                  )}

                  {/* LinkedIn */}
                  {member.socials.linkedin && (
                    <a 
                        href={member.socials.linkedin} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#0077b5] transition-colors" 
                        aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  
                  {/* GitHub */}
                  {member.socials.github && (
                    <a 
                        href={member.socials.github} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-900 transition-colors" 
                        aria-label="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  
                </div>
              </div>
            ))}

          </div>
          
          {/* Fade Effect for Mobile */}
          <div className="absolute right-0 top-0 bottom-12 w-16 bg-gradient-to-l from-white to-transparent md:hidden pointer-events-none" />
        </div>

      </div>
    </section>
  )
}