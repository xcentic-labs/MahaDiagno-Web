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
  const [data, setData] = useState({
    totalUsers: 0,
    totalServiceBoy: 0,
    totalZones: 0,
    totalServices: 0,
  })

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
        totalServiceBoy={data.totalServiceBoy}
        totalServices={data.totalServices}
        totalUsers={data.totalUsers}
        totalZones={data.totalZones}
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
