import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Subtask } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Plus, Calendar as CalendarIcon, CheckCircle2, ChevronLeft, Target, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export default function FocusPage() {
    const { user } = useAuthStore();
    const { addTask, updateTask, tasks } = useTaskStore();
    const navigate = useNavigate();

    // Local State
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [setupTitle, setSetupTitle] = useState('');
    const [subtaskInput, setSubtaskInput] = useState('');

    // Derived State
    const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

    // Subtask Progress Logic
    const completedSubtasks = activeTask?.subtasks?.filter(s => s.completed).length || 0;
    const totalSubtasks = activeTask?.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    // Handlers
    const handleStartSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!setupTitle.trim() || !user) return;

        try {
            const taskId = await addTask({
                title: setupTitle,
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                userId: user.uid,
                isArchived: false,
                subtasks: [],
                notes: ''
            });
            setActiveTaskId(taskId);
            setSetupTitle('');
        } catch (error) {
            console.error("Failed to start session:", error);
        }
    };

    const handleUpdateTitle = async (newTitle: string) => {
        if (!activeTask || !newTitle.trim()) return;
        updateTask(activeTask.id, { title: newTitle });
    };

    const handleUpdateDueDate = async (date: Date | undefined) => {
        if (!activeTask) return;
        updateTask(activeTask.id, { dueDate: date });
    };

    const handleAddSubtask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTask || !subtaskInput.trim()) return;

        const newSubtask: Subtask = {
            id: crypto.randomUUID(),
            title: subtaskInput,
            completed: false
        };

        const updatedSubtasks = [...(activeTask.subtasks || []), newSubtask];
        await updateTask(activeTask.id, { subtasks: updatedSubtasks });
        setSubtaskInput('');
    };

    const handleToggleSubtask = async (subtaskId: string) => {
        if (!activeTask) return;
        const updatedSubtasks = activeTask.subtasks?.map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        await updateTask(activeTask.id, { subtasks: updatedSubtasks });
    };

    const deleteSubtask = async (subtaskId: string) => {
        if (!activeTask) return;
        const updatedSubtasks = activeTask.subtasks?.filter(s => s.id !== subtaskId);
        await updateTask(activeTask.id, { subtasks: updatedSubtasks });
    }

    const handleUpdateNotes = async (notes: string) => {
        if (!activeTask) return;
        updateTask(activeTask.id, { notes });
    };

    const handleCompleteSession = async () => {
        if (!activeTask) return;

        // Celebrate!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setTimeout(async () => {
            await updateTask(activeTask.id, { status: 'DONE' });
            setActiveTaskId(null); // Return to setup
        }, 1500);
    };

    const handleSaveExit = () => {
        setActiveTaskId(null);
        navigate('/dashboard');
    };

    // --- VIEW A: SESSION SETUP ---
    if (!activeTask) {
        return (
            <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 bg-muted/20">
                <Card className="w-full max-w-lg border-2 shadow-lg animate-in fade-in zoom-in-95 duration-300">
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
                            <Button type="submit" size="lg" className="w-full" disabled={!setupTitle.trim()}>
                                Enter Studio <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- VIEW B: FOCUS STUDIO ---
    return (
        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-background animate-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-8">

                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <Input
                            className="text-3xl md:text-4xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
                            value={activeTask.title}
                            onChange={e => handleUpdateTitle(e.target.value)}
                        />
                        <Badge variant="secondary" className="text-sm px-3 py-1 shrink-0">In Progress</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !activeTask.dueDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {activeTask.dueDate ? format(activeTask.dueDate, "PPP") : <span>Set deadline</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={activeTask.dueDate ? new Date(activeTask.dueDate) : undefined}
                                    onSelect={handleUpdateDueDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left: Subtasks (2/3) */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold flex items-center justify-between">
                                Break it down
                                <span className="text-xs font-normal text-muted-foreground">{Math.round(progress)}%</span>
                            </h2>
                            <Progress value={progress} className="h-2" />
                        </div>

                        <Card className="border-dashed shadow-sm">
                            <CardContent className="p-4 space-y-4">
                                {/* Subtask List */}
                                <div className="space-y-2">
                                    {activeTask.subtasks?.map(subtask => (
                                        <div key={subtask.id} className="group flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                                            <div
                                                className={cn("w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors", subtask.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground")}
                                                onClick={() => handleToggleSubtask(subtask.id)}
                                            >
                                                {subtask.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className={cn("flex-1 text-sm pt-0.5", subtask.completed && "line-through text-muted-foreground")}>
                                                {subtask.title}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                                onClick={() => deleteSubtask(subtask.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!activeTask.subtasks || activeTask.subtasks.length === 0) && (
                                        <div className="text-center py-6 text-muted-foreground text-sm italic">
                                            No subtasks yet. Break it down to make it easier!
                                        </div>
                                    )}
                                </div>

                                {/* Add Subtask */}
                                <form onSubmit={handleAddSubtask} className="flex gap-2">
                                    <Input
                                        placeholder="Add a step..."
                                        className="h-9"
                                        value={subtaskInput}
                                        onChange={e => setSubtaskInput(e.target.value)}
                                    />
                                    <Button type="submit" size="sm" disabled={!subtaskInput.trim()}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Notes (1/3) */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Notes</h2>
                        <Card className="h-full">
                            <CardContent className="p-0 h-full">
                                <Textarea
                                    className="min-h-[300px] border-0 focus-visible:ring-0 resize-none p-4 rounded-xl leading-relaxed bg-transparent"
                                    placeholder="Jot down quick notes, links, or ideas..."
                                    value={activeTask.notes || ''}
                                    onChange={e => handleUpdateNotes(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-8 border-t">
                    <Button variant="ghost" onClick={handleSaveExit}>
                        Save & Exit
                    </Button>
                    <Button size="lg" onClick={handleCompleteSession} className="gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Complete Session
                    </Button>
                </div>

            </div>
        </div>
    );
}
