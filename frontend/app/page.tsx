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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="text-primary-foreground flex items-center justify-center rounded-md">
              <Image src={logo.src} width={50} height={50} alt="Logo" />
            </div>
            <p className=" translate-y-1 font-bold">Mahiagno</p>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:flex  justify-end items-end">
        <Image
          src={login}
          alt="Mahadiagno Admin Portal"
          className="h-full w-full object-fill dark:brightness-[0.2]"
          fill
          priority
        />
      </div>
    </div>
  )
}
