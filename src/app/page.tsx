// src/app/page.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, Target, Award, Brain, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import LandingFooter from '@/components/LandingFooter'
import TeamSection from '@/components/TeamSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import Image from 'next/image'

// --- 1. Reusable Components (Button & Card) ---
const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11 px-8"
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md",
    secondary: "bg-white text-indigo-600 hover:bg-gray-100 shadow-md",
    ghost: "hover:bg-slate-100 text-slate-900"
  }
  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  )
}

const Card = ({ children, className }: any) => (
  <div className={`rounded-xl border bg-white text-slate-950 shadow-sm ${className}`}>
    {children}
  </div>
)

// --- 2. Header Component (Adapted for Next.js) ---
function Header() {
  const pathname = usePathname(); // Replaces useLocation
  const router = useRouter();     // Replaces useNavigate
  
  const scrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      router.push('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-slate-200/40 bg-white/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center px-8">
        <Link href="/" className="flex items-center space-x-2">
          {/* <Image 
              src="/intraa_icon.jpeg" 
              alt="Intraa Logo"
              width={120} 
              height={60} 
              className="h-12 w-auto object-contains"
              priority // Loads image immediately for LCP score
           /> */}
           <span className="text-2xl tracking-tight text-slate-900" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>Intraa</span>
        </Link>
        
        <nav className="ml-auto flex items-center space-x-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-sm transition-colors hover:text-indigo-600 text-slate-600 font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm transition-colors hover:text-indigo-600 text-slate-600 font-medium"
          >
            How It Works
          </button>
          {/* <Link href="/dashboard" className="text-sm transition-colors hover:text-indigo-600 text-slate-600 font-medium">
            Dashboard
          </Link> */}
          <Link href="/login">
            <Button variant="ghost" className="text-sm h-9 px-4">
              Log in
            </Button>
          </Link>
          <Link href="/login">
            <Button className="h-9 px-4 text-sm bg-indigo-600 text-white hover:bg-indigo-700">
              Start Free
            </Button>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}


// --- 4. Main Page Component ---
export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        router.push('/dashboard')
      } else {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router])

  if (isLoading) return null 

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* ADDED HEADER HERE */}
      <Header />

      {/* Hero Section */}
      <section className="relative px-8 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-violet-50/50 -z-10" />
        
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl tracking-tight text-slate-900" style={{ fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Prepare smarter. Perform better. Build the career you deserve.
              </h1>
              <p className="text-xl text-slate-600 max-w-xl" style={{ lineHeight: 1.6 }}>
                AI-powered job preparation for resumes, ATS matching, skills, and interviews — all in one platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button>Start Preparing Free</Button>
              </Link>
              <Button variant="ghost" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                See How It Works
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto lg:ml-auto">
               <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="p-6 shadow-lg border-slate-200/50 backdrop-blur-sm hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Resume Score</p>
                      <p className="text-3xl mt-1 text-slate-900" style={{ fontWeight: 600 }}>88%</p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="p-6 shadow-lg border-slate-200/50 backdrop-blur-sm hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">ATS Match</p>
                      <p className="text-3xl mt-1 text-slate-900" style={{ fontWeight: 600 }}>92%</p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="p-6 shadow-lg border-slate-200/50 backdrop-blur-sm hover:shadow-xl transition-shadow">
                  <div>
                    <p className="text-sm text-slate-500">Interview Feedback</p>
                    <p className="text-lg mt-2 text-slate-900">Confidence: <span style={{ fontWeight: 600 }} className="text-indigo-600">High</span></p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-slate-200 bg-slate-50/50 py-8">
        <div className="container mx-auto px-8">
          <p className="text-center text-sm text-slate-500 font-medium tracking-wide uppercase">
            Trusted by ambitious students and professionals
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 py-24 scroll-mt-16 bg-white">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl tracking-tight mb-6 text-slate-900" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
              All-in-One Career Preparation Platform
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to land your dream job, powered by AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'AI Resume Builder',
                description: 'Create ATS-optimized resumes with AI-powered suggestions'
              },
              {
                icon: Target,
                title: 'Resume Analyzer (ATS Score)',
                description: 'Get instant feedback on your resume\'s ATS compatibility'
              },
              {
                icon: Award,
                title: 'Job Description Matcher',
                description: 'Match your resume to specific job requirements'
              },
              {
                icon: Brain,
                title: 'Role-Based Skill Quizzes',
                description: 'Test and improve your technical knowledge'
              },
              {
                icon: MessageSquare,
                title: 'AI Mock Interviews',
                description: 'Practice interviews with AI-powered feedback'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-lg transition-all hover:-translate-y-1 border-slate-200">
                  <feature.icon className="h-12 w-12 text-indigo-600 mb-6" />
                  <h3 className="text-xl mb-3 text-slate-900" style={{ fontWeight: 600 }}>{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-8 py-24 bg-slate-50 scroll-mt-16">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl tracking-tight mb-6 text-slate-900" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
              Simple, Logical Process
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: 'Build Resume', icon: FileText },
              { step: 2, title: 'Analyze ATS', icon: Target },
              { step: 3, title: 'Match JD', icon: Award },
              { step: 4, title: 'Test Skills', icon: Brain },
              { step: 5, title: 'Practice', icon: MessageSquare }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center relative z-10">
                <div className="flex flex-col items-center">
                  <div className="h-20 w-20 rounded-full bg-white border border-indigo-100 shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                    <item.icon className="h-9 w-9" />
                  </div>
                  <p className="text-sm text-center font-semibold text-slate-900">{item.title}</p>
                </div>
                {idx < 4 && (
                  <ArrowRight className="h-6 w-6 text-slate-300 mx-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <TeamSection />

      {/* Final CTA */}
      <section className="px-8 py-24 relative overflow-hidden bg-indigo-600">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 opacity-90 -z-10" />
        
        <div className="container mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl md:text-5xl tracking-tight mb-6 font-bold">
            Your career deserves more than guesswork.
          </h2>
          <Link href="/login">
            <Button variant="secondary" className="mt-8 text-lg px-10 h-14">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* ADDED FOOTER HERE */}
      <LandingFooter />
    </div>
  )
}