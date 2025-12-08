import { useState } from "react"
import { Outlet, NavLink } from "react-router-dom"
import { LayoutDashboard, Calendar, CheckSquare, FileText, Menu, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardLayout() {
    const [open, setOpen] = useState(false)

    const navItems = [
        { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/schedule", icon: Calendar, label: "Schedule" },
        { to: "/tasks", icon: CheckSquare, label: "Tasks" },
        { to: "/focus", icon: Target, label: "Focus Studio" },
        { to: "/notes", icon: FileText, label: "Notes" },
    ]

    const SidebarContent = () => {
        const { user } = useAuth();

        return (
            <div className="flex flex-col h-full">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <NavLink to="/dashboard" className="flex items-center gap-2 font-semibold">
                        <LayoutDashboard className="h-6 w-6" />
                        <span className="">Acadify</span>
                    </NavLink>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                        isActive
                                            ? "bg-muted text-primary"
                                            : "text-muted-foreground"
                                    )
                                }
                                onClick={() => setOpen(false)}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Profile Widget */}
                {user && (
                    <div className="mt-auto p-4">
                        <Separator className="mb-4" />
                        <NavLink
                            to="/profile"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-primary"
                            onClick={() => setOpen(false)}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || ''} />
                                <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col truncate">
                                <span className="truncate font-semibold text-foreground">{user.displayName}</span>
                                <span className="truncate text-xs text-muted-foreground">View Profile</span>
                            </div>
                        </NavLink>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <SidebarContent />
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <span className="font-semibold">Acadify</span>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
