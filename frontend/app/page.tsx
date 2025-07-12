"use client"
import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import logo from '@/assets/logo.png'
import login from '@/assets/login.png'
import { useIsLoggedIn } from "@/hooks/use-isloogedIn"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const redirect = useRouter()
  const isLoogedIn = useIsLoggedIn();

  useEffect(() => {
    console.log(isLoogedIn)
    if (isLoogedIn) {
      redirect.push('/dashboard');
    }
  }, [isLoogedIn]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* Left Panel - Login Form */}
      <div className="flex flex-col justify-between p-8 lg:p-12">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl" >
            <Image 
              src={logo.src} 
              width={50} 
              height={50} 
              alt="Logo"
            />
          </div>
          <span className="text-xl font-semibold text-slate-900 dark:text-white">
            Mahadiagno
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign in
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2024 Mahiagno. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900">
          <Image
            src={login}
            alt="Mahadiagno Admin Portal"
            className="h-full w-full object-cover opacity-80 dark:opacity-60"
            fill
            priority
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-end h-full p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#019b7c'}}></div>
              Admin Portal
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white">
                Streamlined
                <br />
                Administration
              </h2>
              <p className="text-xl text-white/80 max-w-md">
                Powerful tools designed for modern workflow management and team collaboration.
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
      </div>
    </div>
  )
}