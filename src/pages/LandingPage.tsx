import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCtaClick = () => {
        if (user) {
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <img src="/acadify.svg" alt="Acadify Logo" className="h-8 w-8" />
                        <span>Acadify</span>
                    </div>
                    <nav>
                        {user ? (
                            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                                Dashboard
                            </Button>
                        ) : (
                            <Button variant="ghost" onClick={() => navigate("/login")}>
                                Login
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-background to-muted/20">
                <div className="max-w-3xl space-y-6">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
                        Acadify: Master Your <span className="text-primary">Academic Life</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Track classes, manage tasks, and organize notes in one seamless workspace.
                        Designed for students who want to stay ahead.
                    </p>
                    <div className="pt-4">
                        <Button size="lg" className="text-lg px-8 h-12" onClick={handleCtaClick}>
                            {user ? "Go to Dashboard" : "Get Started"}
                        </Button>
                    </div>
                </div>
            </main>

            {/* Footer (Optional simple footer) */}
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Acadify. Built for students.</p>
            </footer>
        </div>
    );
}
