
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ListChecks,
} from "lucide-react"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/challenges", label: "Challenges", icon: ListChecks },
]

function MainNav({ className }: { className?: string }) {
    const pathname = usePathname()
    return (
        <nav className={cn("flex items-center gap-4 lg:gap-6", className)}>
            {menuItems.map((item) => (
                 <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
       <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-6">
                    <Logo />
                    <MainNav />
                </div>
                <div className="flex-1 flex justify-end items-center gap-4">
                    <ThemeToggle />
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {children}
            </main>
        </div>
    )
}
