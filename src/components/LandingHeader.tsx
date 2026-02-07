// src/components/LandingHeader.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

// Local Button Component to keep styles consistent
const HeaderButton = ({ children, className, variant = 'primary', ...props }: any) => {
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

export default function LandingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  
  const scrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      // If we are on Login page, go to Home first
      router.push('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // If we are already on Home
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
        
        <nav className="ml-auto flex items-center space-x-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-sm transition-colors hover:text-indigo-600 text-slate-600 font-medium hidden md:block"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm transition-colors hover:text-indigo-600 text-slate-600 font-medium hidden md:block"
          >
            How It Works
          </button>
          <Link href="/login">
            <HeaderButton variant="ghost" className="text-sm h-9 px-4">
              Log in
            </HeaderButton>
          </Link>
          <Link href="/login?signup=true">  {/* 👈 Added ?signup=true */}
            <HeaderButton className="h-9 px-4 text-sm bg-indigo-600 text-white hover:bg-indigo-700">
              Start Free
            </HeaderButton>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}