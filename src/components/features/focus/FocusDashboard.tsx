import type { Task } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Calendar as CalendarIcon, ArrowLeft, Target, ChevronLeft } from 'lucide-react';
import { format, isValid } from 'date-fns';

interface FocusDashboardProps {
    userDisplayName: string | null | undefined;
    focusedTasks: Task[];
    isSetupMode: boolean;
    setIsSetupMode: (mode: boolean) => void;
    setupTitle: string;
    setSetupTitle: (title: string) => void;
    handleSwitchSession: (taskId: string) => void;
    handleNewSession: () => void;
    handleStartSession: (e: React.FormEvent) => void;
}

export function FocusDashboard({
    userDisplayName,
    focusedTasks,
    isSetupMode,
    setIsSetupMode,
    setupTitle,
    setSetupTitle,
    handleSwitchSession,
    handleNewSession,
    handleStartSession
}: FocusDashboardProps) {

    if (focusedTasks.filter(t => t.status !== 'DONE').length > 0 && !isSetupMode) {
        // 1. Dashboard Grid View
        return (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userDisplayName?.split(' ')[0] || 'User'}</h1>
                        <p className="text-muted-foreground mt-2">Pick up where you left off or start a new focus session.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Active Session Cards */}
                        {focusedTasks.filter(t => t.status !== 'DONE').map(task => (
                            <Card key={task.id} className="group hover:shadow-md transition-all border-l-4 border-l-primary cursor-pointer" onClick={() => handleSwitchSession(task.id)}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="leading-snug text-lg group-hover:text-primary transition-colors line-clamp-2">{task.title}</CardTitle>
                                        <Badge variant="secondary" className="shrink-0">In Progress</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4" />
                                            {task.dueDate && isValid(new Date(task.dueDate)) ? format(task.dueDate, "MMM d, h:mm a") : "No deadline"}
                                        </div>

                                        <div className="flex items-center justify-between text-sm pt-2 border-t">
                                            <span className="text-muted-foreground">{task.subtasks?.filter(s => s.completed).length || 0} / {task.subtasks?.length || 0} steps</span>
                                            <Button
                                                size="sm"
                                                className="gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSwitchSession(task.id);
                                                }}
                                            >
                                                {task.focusStartTime ? 'Continue' : 'Resume'} <ArrowLeft className="w-3 h-3 rotate-180" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Create New Card */}
                        <button
                            onClick={handleNewSession}
                            className="flex flex-col items-center justify-center p-8 h-full min-h-[200px] border-2 border-dashed rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary gap-4 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-lg">Create New Goal</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Setup View (Input)
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                <Card className="w-full max-w-lg border-2 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">What is your main goal right now?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleStartSession} className="space-y-4">
                            <Input
                                autoFocus
                                placeholder="e.g., Complete Figma Design"
                                className="text-lg h-12 text-center"
                                value={setupTitle}
                                onChange={e => setSetupTitle(e.target.value)}
                            />
                            <div className="grid gap-2">
                                <Button type="submit" size="lg" className="w-full" disabled={!setupTitle.trim()}>
                                    Enter Studio <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
                                </Button>
                                {focusedTasks.length > 0 && (
                                    <Button type="button" variant="ghost" onClick={() => setIsSetupMode(false)}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
