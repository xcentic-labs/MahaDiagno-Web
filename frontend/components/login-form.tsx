"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Login } from "@/lib/types"
import axios from "axios"
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';



export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const [data, setData] = useState<Login>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!data.email.trim() || !data.password.trim()) {
      toast.warning('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/adminlogin`, data);

      if (res.status === 200) {
        toast.success('Login successful');

        const authInfo = {
          authStatus: true,
          userData: {
            firstName: res.data.admin.firstName,
            lastName: res.data.admin.lastName,
            email: res.data.admin.email,
          }
        }

        // Save token or user data if needed
        localStorage.setItem('token', res.data.admin.token);
        localStorage.setItem('authInfo', JSON.stringify(authInfo))

        console.log("Navigating to /dashboard"); // ← Add this
        router.push('/dashboard');

      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={(e) => handleLogin(e)}>
      <div className="flex flex-col items-start gap-2 text-center">
        <h1 className="text-2xl text-left font-bold">Welcom Back Admin</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required onChange={(e) => setData({ ...data, email: e.target.value })} value={data.email} />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" type="password" required placeholder="********" onChange={(e) => setData({ ...data, password: e.target.value })} value={data.password} />
        </div>
        <Button type="submit" className="w-full cursor-pointer font-bold">
          {
            loading ?
              <span className="w-4 h-4 border-2 border-r-0 rounded-full animate-spin"></span>
              :
              'Login'
          }
        </Button>
      </div>
    </form>
  )
}
