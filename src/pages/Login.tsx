import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, GraduationCap, Library, BookOpen, CheckCircle2 } from 'lucide-react';

export default function Login() {
    const { user, loading, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !loading) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full h-screen grid lg:grid-cols-2">
            {/* Left Panel - Branding (Visible on Desktop) */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white relative overflow-hidden">
                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2573&auto=format&fit=crop')] bg-cover bg-center opacity-20 contrast-125 saturate-0 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent"></div>

                {/* Content */}
                <div className="relative z-10 flex items-center gap-2 font-bold text-xl">
                    <img src="/acadify.svg" alt="Acadify Logo" className="h-8 w-8 invert" />
                    <span>Acadify</span>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        Master Your Academic Life
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Join thousands of students who organize their schedules, tasks, and notes in one seamless workspace.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Smart Scheduling
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Task Tracking
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Focus Mode
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-zinc-500">
                    &copy; {new Date().getFullYear()} Acadify Inc.
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex items-center justify-center p-8 bg-background relative">
                <Button
                    variant="ghost"
                    className="absolute top-4 left-4 md:top-8 md:left-8"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>

                <div className="w-full max-w-sm space-y-6">
                    <div className="flex flex-col space-y-2 text-center">
                        {/* Mobile Logo */}
                        <div className="flex justify-center mb-4 lg:hidden">
                            <img src="/acadify.svg" alt="Acadify Logo" className="h-10 w-10" />
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <Button
                            variant="outline"
                            type="button"
                            className="h-12 text-base font-medium relative overflow-hidden group transition-all hover:border-primary/50 hover:bg-primary/5"
                            onClick={signInWithGoogle}
                            disabled={loading}
                        >
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Continue with Google
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Secure Login
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
