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
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

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

const data = {
  user: {
    name: "Anish",
    email: "admin@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard, // better match than SquareTerminal
      isActive: true,
    },
    {
      title: "Services",
      url: "/services",
      icon: Layers, // represents modules/services
    },
    {
      title: "Zone",
      url: "/zone",
      icon: Map, // suitable for zones
    },
    {
      title: "User",
      url: "/user",
      icon: Users, // more appropriate than Settings2
    },
    {
      title: "Appointment",
      url: "/appointment/pending",
      icon: CalendarClock, // perfect for appointments
      items: [
        { title: "Pending", url: "/appointment/pending" },
        { title: "Accepted", url: "/appointment/accepted" },
        { title: "Completed", url: "/appointment/completed" },
        { title: "Cancelled", url: "/appointment/cancelled" },
      ],
    },
    {
      title: "Admin",
      url: "/admin",
      icon: ShieldCheck, // indicates admin/security
    },
    {
      title: "Service Boy",
      url: "/addserviceboy",
      icon: BadgePlus, // suits service personnel
    },
  ],
};


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
