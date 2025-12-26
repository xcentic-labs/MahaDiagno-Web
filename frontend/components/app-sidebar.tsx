"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Layers,
  Map,
  Users,
  CalendarClock,
  ShieldCheck,
  BadgePlus,
  Upload,
  DollarSign,
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  FilePlus2,
  Stethoscope
} from "lucide-react";
import { Bike } from "lucide-react";

import Link from "next/link";
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,

} from "@/components/ui/sidebar"
import Image from "next/image"
import logo from '@/assets/logo.png'
import { useGetUser, useIsLoggedIn } from "@/hooks/use-isloogedIn";
import { title } from "process";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard, // better match than SquareTerminal
      isActive: true,
    },
    // {
    //   title: "Zone",
    //   url: "/zone",
    //   icon: Map, // suitable for zones
    // },
    {
      title: "Banner",
      url: "/banner",
      icon: FilePlus2, // suitable for banners
    },
    {
      title: "User",
      url: "/user",
      icon: Users, // more appropriate than Settings2
    },
    {
      title: "Partners",
      url: "/partner",
      icon: Users, // more appropriate than Settings2
    },
    {
      title: "Doctors",
      url: "/doctor",
      icon: Users, // more appropriate than Settings2
    },
    {
      title: "Specializations",
      url: "/specialization",
      icon: Stethoscope, // perfect for medical specializations
    },
    {
      title : "Medicine Category",
      url : "/medicinecategory",
      icon : Layers, // suitable for categories
    },
    {
      title : "Phayrmacy Vendor",
      url : "/pharmacyvendors",
      icon : Users, // more appropriate than Settings2
    },
    {
      title : "Orders",
      url : "/orders",
      icon : Banknote, // suitable for orders and transactions
    },
    {
      title: "Appointment",
      url: "/appointment/pending",
      icon: CalendarClock, // perfect for appointments
      items: [
        { title: "Pending", url: "/appointment/pending/" },
        { title: "Accepted", url: "/appointment/accepted" },
        { title: "Completed", url: "/appointment/completed" },
        { title: "Cancelled", url: "/appointment/cancelled" },
      ],
    },
    {
      title: "Consultation",
      url: "/doctorappointment",
      icon: CalendarClock, // perfect for consultations
    },
    // {
    //   title: "Partner Appointment",
    //   url: "/partnerappointment/pending",
    //   icon: CalendarClock, // perfect for appointments partnerappointment
    //   items: [
    //     { title: "Pending", url: "/partnerappointment/pending/" },
    //     { title: "Accepted", url: "/partnerappointment/accepted" },
    //     { title: "Completed", url: "/partnerappointment/completed" },
    //     { title: "Cancelled", url: "/partnerappointment/cancelled" },
    //   ],
    // },
    // withdraw
    {
      title: "Pending Withdraw",
      url: "/withdraw",
      icon: Clock, // ⏳ Indicates it's waiting for approval
    },
    {
      title: "Success Withdraw",
      url: "/sucesswithdraw",
      icon: CheckCircle, // ✅ Indicates success
    },
    {
      title: "Rejected Withdraw",
      url: "/rejectedwithdraw",
      icon: XCircle, // ❌ Indicates rejection or failure
    },

    {
      title: "Admin",
      url: "/admin",
      icon: ShieldCheck, // indicates admin/security
    },
    {
      title: "Subscription",
      url: "/subscription",
      icon: DollarSign, // indicates admin/security
    },
    {
      title: "Service Boy",
      url: "/addserviceboy",
      icon: BadgePlus, // suits service personnel
    },
    // {
    //   title: "Track Service Boy",
    //   url: "/serviceboylocation",
    //   icon: Bike,
    // }

  ],
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useGetUser()
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="text-sidebar-primary-foreground flex aspect-square  items-center justify-center rounded-lg">
                  <Image src={logo.src} width={50} height={50} alt="Logo" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight translate-y-1">
                  <span className="truncate font-bold mb-0.5">MahaDiagno</span>
                  <span className="truncate text-xs font-medium">Health Care</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
