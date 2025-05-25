"use client"
import { Geist, Geist_Mono } from "next/font/google";
import '@/app/globals.css';
import { ToastContainer } from 'react-toastify';
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation";
import { useIsLoggedIn } from "@/hooks/use-isloogedIn";
import { useEffect } from "react";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});



export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    const redirect = useRouter();
    const isLoogedIn = useIsLoggedIn();

    useEffect(() => {
        if (!isLoogedIn) {
            redirect.push('/')
        }
    }, [isLoogedIn])

    return (
        <div
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <ToastContainer position="top-right" autoClose={3000} />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-[10vh] shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="/dashboard">
                                            MahaDiagno Admin DashBoard
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {/* <BreadcrumbSeparator className="hidden md:block" /> */}
                                    <BreadcrumbItem>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    <div className="w-full h-[88vh] p-2 overflow-y-scroll scrollbarhidden">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
