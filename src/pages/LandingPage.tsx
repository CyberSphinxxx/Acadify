import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Calendar, ListTodo, ArrowRight, BookOpen } from "lucide-react";

import { useState } from "react";

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    const handleCtaClick = () => {
        if (user) {
            navigate("/dashboard");
        } else {
            setIsExiting(true);
            setTimeout(() => {
                navigate("/login");
            }, 800); // Wait for animation
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden selection:bg-primary selection:text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2573&auto=format&fit=crop')] bg-cover bg-center opacity-10 contrast-125 saturate-0 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-zinc-900/80 to-zinc-900 pointer-events-none"></div>

            {/* Content Wrapper - Animates Out */}
            <div className={`relative z-10 transition-all duration-800 ease-in-out ${isExiting ? 'scale-95 opacity-0 blur-sm translate-y-4' : 'scale-100 opacity-100 blur-0 translate-y-0'}`}>

                {/* Navbar */}
                <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md">
                    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
                            <img src="/acadify.svg" alt="Acadify Logo" className="h-8 w-8 invert" />
                            <span>Acadify</span>
                        </div>
                        <nav>
                            {user && (
                                <Button
                                    variant="ghost"
                                    className="text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    Dashboard
                                </Button>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="relative pt-32 pb-20 px-6 container mx-auto">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                        {/* Badge */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-primary-foreground/80">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                            v1.0 is now live
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 pb-2">
                            Master Your <span className="text-white">Academic Life</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            The all-in-one workspace for students. Organize your schedule, manage tasks, and capture notes—without the chaos.
                        </p>

                        {/* CTA */}
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg rounded-full bg-white text-zinc-900 hover:bg-zinc-200 transition-all hover:scale-105"
                                onClick={handleCtaClick}
                            >
                                {user ? "Go to Dashboard" : "Get Started for Free"}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            {!user && (
                                <p className="text-xs text-zinc-500 mt-4 sm:mt-0 sm:ml-4">
                                    No credit card required.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mt-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        <FeatureCard
                            icon={<Calendar className="h-6 w-6 text-blue-400" />}
                            title="Smart Schedule"
                            description="Visualize your classes with our intuitive weekly calendar. Never miss a lecture again."
                        />
                        <FeatureCard
                            icon={<ListTodo className="h-6 w-6 text-purple-400" />}
                            title="Task Management"
                            description="Track assignments, set due dates, and prioritize your workload with ease."
                        />
                        <FeatureCard
                            icon={<BookOpen className="h-6 w-6 text-emerald-400" />}
                            title="Structured Notes"
                            description="Keep your lecture notes organized by subject or topic. Search instantly."
                        />
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-white/5 py-10 mt-20 relative z-10 bg-zinc-900">
                    <div className="container mx-auto px-6 text-center text-sm text-zinc-600">
                        <p>&copy; {new Date().getFullYear()} Acadify. Built for students who want more.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <div className="h-12 w-12 rounded-lg bg-zinc-900/50 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
            <p className="mt-2 text-zinc-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
