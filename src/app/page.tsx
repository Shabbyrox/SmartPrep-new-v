// app/page.tsx
'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Target, Award, Brain, MessageSquare, ArrowRight, CheckCircle2, Code2Icon, Menu, X, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import LandingFooter from '@/components/LandingFooter'
import TeamSection from '@/components/TeamSection'
import TestimonialsSection from '@/components/TestimonialsSection'

// --- 1. Smart Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  href?: string;
  className?: string;
  // Allow anchor props if acting as a link
  target?: string;
  rel?: string;
}

const Button = ({ children, className = '', variant = 'primary', href, ...props }: ButtonProps) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11 px-8"
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md",
    secondary: "bg-white text-indigo-600 hover:bg-gray-100 shadow-md",
    ghost: "hover:bg-slate-100 text-slate-900",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900" 
  }
  
  const combinedClasses = `${baseStyle} ${variants[variant]} ${className}`

  // If href is provided, render a Link
  if (href) {
    return (
      // Added {...props} here so you can pass target="_blank" or onClick later if needed
      <Link href={href} className={combinedClasses} {...(props as any)}>
        {children}
      </Link>
    )
  }

  // Otherwise render a standard button
  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  )
}
const Card = ({ children, className }: any) => (
  <div className={`rounded-xl border bg-white text-slate-950 shadow-sm ${className}`}>
    {children}
  </div>
)

// --- 2. Mobile-Responsive Header ---
function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
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
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center z-50">
           <Image 
              src="/intraa_latest_logo.jpeg" 
              alt="Intraa Logo"
              width={180}   // Base width (high res for retina)
              height={60}   // Base height
              // 👇 RESPONSIVE MAGIC:
              // h-8 (32px) on mobile -> Prevents it from looking huge
              // md:h-10 (40px) on laptop -> Looks standard size
              // w-auto -> Automatically adjusts width to match height (prevents stretching)
              className="h-8 w-auto md:h-10 object-contain"
              priority 
           />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => scrollToSection('features')} className="text-sm hover:text-indigo-600 text-slate-600 font-medium transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-sm hover:text-indigo-600 text-slate-600 font-medium transition-colors">
            How It Works
          </button>
          {/* UPDATED: Using 'href' prop directly on Button */}
          <Button href="/login" variant="ghost" className="text-sm h-9 px-4">Log in</Button>
          <Button href="/login" className="h-9 px-4 text-sm bg-indigo-600 text-white hover:bg-indigo-700">Start Free</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-slate-600 z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 md:hidden flex flex-col space-y-4"
            >
              <button onClick={() => scrollToSection('features')} className="text-left px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">
                How It Works
              </button>
              <hr className="border-slate-100" />
              <div className="flex flex-col gap-3 px-4 pt-2">
                <Button href="/login" variant="outline" className="w-full justify-center">Log in</Button>
                <Button href="/login" className="w-full justify-center bg-indigo-600">Start Free</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

// --- 3. Main Page Component ---
export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')
      else setIsLoading(false)
    }
    checkUser()
  }, [router])

  // FIX: Professional Loading State instead of blank screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-500 text-sm font-medium">Loading Intraa...</p>
        </div>
      </div>
    )
  }

  return (
    // FIX: overflow-x-hidden ensures no horizontal scroll/black bars on mobile
    <div className="flex flex-col min-h-screen bg-white w-full overflow-x-hidden">
      
      <Header />

      {/* Hero Section */}
      <section className="relative px-4 md:px-8 py-16 md:py-32 overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-violet-50/50 -z-10" />
        
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 text-center lg:text-left"
          >
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight text-slate-900 font-bold leading-tight">
                Prepare smarter. Perform better. Build the career you deserve.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                AI-powered job preparation for resumes, ATS matching, skills, and interviews — all in one platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* UPDATED: Using href prop directly */}
              <Button href="/login" className="w-full sm:w-auto">Start Preparing Free</Button>
              
              <Button variant="ghost" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                See How It Works
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mt-8 lg:mt-0"
          >
            {/* Cards Container */}
            <div className="grid grid-cols-1 gap-4 max-w-sm md:max-w-md mx-auto lg:ml-auto w-full">
               <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                <Card className="p-6 shadow-lg border-slate-200/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Resume Score</p>
                      <p className="text-3xl mt-1 text-slate-900 font-semibold">88%</p>
                    </div>
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                <Card className="p-6 shadow-lg border-slate-200/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">ATS Match</p>
                      <p className="text-3xl mt-1 text-slate-900 font-semibold">92%</p>
                    </div>
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Target className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
                <Card className="p-6 shadow-lg border-slate-200/50 backdrop-blur-sm">
                  <div>
                    <p className="text-sm text-slate-500">Interview Feedback</p>
                    <p className="text-lg mt-2 text-slate-900">Confidence: <span className="font-semibold text-indigo-600">High</span></p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-slate-200 bg-slate-50/50 py-8">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-center text-xs md:text-sm text-slate-500 font-medium tracking-wide uppercase">
            Trusted by ambitious students and professionals
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 md:px-8 py-16 md:py-24 scroll-mt-16 bg-white w-full">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl tracking-tight mb-4 md:mb-6 text-slate-900 font-bold">
              All-in-One Career Platform
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to land your dream job, powered by AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: FileText, title: 'AI Resume Builder', desc: 'Create ATS-optimized resumes with AI-powered suggestions' },
              { icon: Target, title: 'Resume Analyzer', desc: 'Get instant feedback on your resume\'s ATS compatibility' },
              { icon: Award, title: 'Job Matcher', desc: 'Match your resume to specific job requirements' },
              { icon: Brain, title: 'Skill Quizzes', desc: 'Test and improve your technical knowledge' },
              { icon: MessageSquare, title: 'AI Mock Interviews', desc: 'Practice interviews with AI-powered feedback' },
              { icon: Code2Icon, title: 'Coding Arena', desc: 'Practice FAANG questions with real-time verification' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 md:p-8 h-full hover:shadow-lg transition-all border-slate-200">
                  <feature.icon className="h-10 w-10 md:h-12 md:w-12 text-indigo-600 mb-4 md:mb-6" />
                  <h3 className="text-lg md:text-xl mb-3 text-slate-900 font-semibold">{feature.title}</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 md:px-8 py-16 md:py-24 bg-slate-50 scroll-mt-16 w-full">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl tracking-tight mb-6 text-slate-900 font-bold">
              Simple, Logical Process
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            {[
              { title: 'Build Resume', icon: FileText },
              { title: 'Analyze ATS', icon: Target },
              { title: 'Match JD', icon: Award },
              { title: 'Test Skills', icon: Brain },
              { title: 'Practice', icon: MessageSquare }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center relative z-10 w-full md:w-auto justify-center md:justify-start">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white border border-indigo-100 shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                    <item.icon className="h-8 w-8 md:h-9 md:w-9" />
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
      <section className="px-4 md:px-8 py-24 relative overflow-hidden bg-indigo-600 w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 opacity-90 -z-10" />
        
        <div className="container mx-auto text-center text-white relative z-10">
          <h2 className="text-3xl md:text-5xl tracking-tight mb-6 font-bold">
            Your career deserves more than guesswork.
          </h2>
          {/* UPDATED: Using href prop directly */}
          <Button href="/login" variant="secondary" className="mt-8 text-lg px-10 h-14 w-full md:w-auto">
            Create Your Free Account
          </Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}