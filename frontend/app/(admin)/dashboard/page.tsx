"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { SectionCards } from "@/components/section-cards"
import { axiosClient } from "@/lib/axiosClient"
import { toast } from "react-toastify"

const quick = [
  { title: "Pending Appointment", url: "/appointment/pending/" },
  { title: "Accepted Appointment", url: "/appointment/accepted" },
  { title: "Completed Appointment", url: "/appointment/completed" },
  { title: "Cancelled Appointment ", url: "/appointment/cancelled" },
]

export default function DashBoard() {
  const [data, setData] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get("/admin/getdashboarddata")
        setData(response.data)
      } catch (error: any) {
        if (error.status === 401) {
          if (typeof window === "undefined") return
          localStorage.removeItem("authInfo")
          // Optionally, reload or redirect
          window.location.href = "/"  // or use your preferred route
        }
        toast.error(error.response.data.error);
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 p-5">
      <h1 className="font-bold text-xl tracking-wider">Statics</h1>
      <SectionCards
        data={!data ? [
          { title: "user", label: 'Total Users', data: 0 },
          { title: "service", label: 'Total Services', data: 0 },
          { title: "serviceBoy", label: 'Total Service Boys', data: 0 },
          { title: "doctor", label: 'Total Doctors', data: 0 },
          { title: "partners", label: 'Total Partners', data: 0 },
        ] : data}
      />
      <h1 className="font-bold text-xl tracking-wider">Quick Access Appointments</h1>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
        {quick.map((item, index) => (
          <Card key={index} name={item.title} url={item.url} />
        ))}
      </div>
    </div>
  )
}

const Card = ({ name, url }: { name: string, url: string }) => {
  const route = useRouter()
  return (
    <div className="p-2 flex justify-between items-center @container/card border-[1px] border-gray-200 shadow-sm  rounded-xl px-4 py-4 cursor-pointer" onClick={() => route.push(url)}>
      <div>
        <h4>{name}</h4>
      </div>
      <div className="p-2 bg-gray-200 rounded-full">
        <ChevronRight size={18} />
      </div>
    </div>
  )
}
