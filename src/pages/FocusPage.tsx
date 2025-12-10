import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useFocusStore } from '@/store/useFocusStore';
import type { Subtask, Task } from '@/types/task';
import type { Note } from '@/types/note';
import { noteService } from '@/services/noteService';
import { NoteEditor } from '@/components/features/notes/NoteEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes, startOfDay, isValid } from 'date-fns';
import { Plus, Calendar as CalendarIcon, CheckCircle2, ChevronLeft, Target, Trash2, Clock, Link as LinkIcon, FileText, ArrowLeft, ExternalLink, Menu, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FocusSidebar } from '@/components/features/focus/FocusSidebar';

export default function FocusPage() {
    const { user } = useAuthStore();
    const { addTask, updateTask, tasks } = useTaskStore();
    const { focusedTasks, subscribeToFocusSessions, toggleFocusSession } = useFocusStore();
    const navigate = useNavigate();

    // Local State
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [setupTitle, setSetupTitle] = useState('');
    const [subtaskInput, setSubtaskInput] = useState('');
    const [isSetupMode, setIsSetupMode] = useState(false);

    // Phase 1: Date & Time State
    const [selectedTime, setSelectedTime] = useState<string>("09:00");

    // Phase 2: Notebook State
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');

    // Phase 3: Resource Links State
    const [linkName, setLinkName] = useState('');
    const [linkUrl, setLinkUrl] = useState('');

    // Phase 4: Timer Logic (Server-Side Persistence)
    const [now, setNow] = useState(Date.now()); // Local ticker for UI updates

    // Derived State
    const activeTask = activeTaskId ? (tasks.find(t => t.id === activeTaskId) || focusedTasks.find(t => t.id === activeTaskId)) : null;
    const activeNote = activeNoteId ? notes.find(n => n.id === activeNoteId) : null;

    // Helper: Calculate elapsed time from server data
    const getSecondsElapsed = (task: Task | null | undefined) => {
        if (!task) return 0;
        const accumulated = task.accumulatedFocusTime || 0;
        if (task.focusStartTime) {
            // Task is currently running
            return Math.floor((now - task.focusStartTime) / 1000) + accumulated;
        }
        // Task is paused
        return accumulated;
    };

    const secondsElapsed = getSecondsElapsed(activeTask);

    // Subtask Progress Logic
    const completedSubtasks = activeTask?.subtasks?.filter(s => s.completed).length || 0;
    const totalSubtasks = activeTask?.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    // Load Focus Sessions
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToFocusSessions(user.uid);
        return () => unsubscribe();
    }, [user, subscribeToFocusSessions]);

    // Timer Ticker: Updates 'now' every second to animate the timer
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Note Subscription
    useEffect(() => {
        if (!user || !activeTaskId) return;
        const unsubscribe = noteService.subscribeToNotes(user.uid, (allNotes) => {
            // Filter for this task
            const relevantNotes = allNotes.filter(n => n.relatedTaskId === activeTaskId);
            setNotes(relevantNotes);
        });
        return () => unsubscribe();
    }, [user, activeTaskId]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // --- TIMER HELPERS ---
    const startTimer = async (taskId: string) => {
        await updateTask(taskId, { focusStartTime: Date.now() });
    };

    const pauseTimer = async (task: Task) => {
        if (!task.focusStartTime) return;
        const sessionDuration = Math.floor((Date.now() - task.focusStartTime) / 1000);
        const newAccumulated = (task.accumulatedFocusTime || 0) + sessionDuration;

        await updateTask(task.id, {
            focusStartTime: null,
            accumulatedFocusTime: newAccumulated
        });
    };

    // --- HANDLERS ---

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
                notes: '',
                resourceLinks: [],
                accumulatedFocusTime: 0,
                focusStartTime: Date.now() // Auto-start
            });
            await toggleFocusSession(taskId, true);
            setActiveTaskId(taskId);
            setSetupTitle('');
            setIsSetupMode(false);
        } catch (error) {
            console.error("Failed to start session:", error);
        }
    };

    const handleSwitchSession = async (taskId: string) => {
        // Pause current active task before switching
        if (activeTask && activeTask.id !== taskId) {
            await pauseTimer(activeTask);
        }

        setActiveTaskId(taskId);
        setIsSetupMode(false);

        // Auto-resume new task if desired? The requirement implies "Resume" action, 
        // but traditionally clicking a session in the sidebar focuses it.
        // For now, let's leave it to user to click 'Resume' or auto-resume if it was running.
        // If it was running on server, it stays running. If paused, it stays paused until resumed?
        // Let's safe-bet: If I explicitly switch to it, I probably want to work on it.
        const newTask = tasks.find(t => t.id === taskId) || focusedTasks.find(t => t.id === taskId);
        if (newTask && !newTask.focusStartTime) {
            await startTimer(taskId);
        }
    };

    const handleNewSession = () => {
        setActiveTaskId(null);
        setIsSetupMode(true);
    };

    const handleUpdateTitle = async (newTitle: string) => {
        if (!activeTask || !newTitle.trim()) return;
        updateTask(activeTask.id, { title: newTitle });
    };

    const handleUpdateDueDate = async (date: Date | undefined) => {
        if (!activeTask || !date) return;

        let newDate = startOfDay(date);
        if (selectedTime) {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            newDate = setHours(setMinutes(newDate, minutes), hours);
        }

        updateTask(activeTask.id, { dueDate: newDate });
    };

    const handleUpdateTime = async (time: string) => {
        setSelectedTime(time);
        if (!activeTask?.dueDate) return;

        const [hours, minutes] = time.split(':').map(Number);
        const newDate = setHours(setMinutes(new Date(activeTask.dueDate), minutes), hours);
        updateTask(activeTask.id, { dueDate: newDate });
    };

    const handleAddSubtask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTask || !subtaskInput.trim()) return;

        try {
            const newSubtask: Subtask = {
                id: Date.now().toString(36) + Math.random().toString(36).substring(2),
                title: subtaskInput,
                completed: false
            };

            const updatedSubtasks = [...(activeTask.subtasks || []), newSubtask];
            await updateTask(activeTask.id, { subtasks: updatedSubtasks });
            setSubtaskInput('');
        } catch (error) {
            console.error("Failed to add subtask:", error);
        }
    };

    const handleToggleSubtask = async (subtaskId: string) => {
        if (!activeTask) return;
        try {
            const updatedSubtasks = activeTask.subtasks?.map(s =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
            );
            await updateTask(activeTask.id, { subtasks: updatedSubtasks });
        } catch (error) {
            console.error("Failed to toggle subtask:", error);
        }
    };

    const deleteSubtask = async (subtaskId: string) => {
        if (!activeTask) return;
        try {
            const updatedSubtasks = activeTask.subtasks?.filter(s => s.id !== subtaskId);
            await updateTask(activeTask.id, { subtasks: updatedSubtasks });
        } catch (error) {
            console.error("Failed to delete subtask:", error);
        }
    }

    const handleCreateNote = async () => {
        if (!user || !activeTaskId) return;
        try {
            const noteId = await noteService.createNote(user.uid, activeTaskId);
            setActiveNoteId(noteId);
            setViewMode('editor');
        } catch (error) {
            console.error("Failed to create note:", error);
        }
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTask || !linkName || !linkUrl) return;

        try {
            const newLink = { name: linkName, url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}` };
            const updatedLinks = [...(activeTask.resourceLinks || []), newLink];
            await updateTask(activeTask.id, { resourceLinks: updatedLinks });
            setLinkName('');
            setLinkUrl('');
        } catch (error) {
            console.error("Failed to add link:", error);
        }
    };

    const removeLink = async (index: number) => {
        if (!activeTask) return;
        try {
            const updatedLinks = [...(activeTask.resourceLinks || [])];
            updatedLinks.splice(index, 1);
            await updateTask(activeTask.id, { resourceLinks: updatedLinks });
        } catch (error) {
            console.error("Failed to remove link:", error);
        }
    }

    // --- EXIT ACTIONS ---

    // --- EXIT ACTIONS ---



    const handleMarkDone = async () => {
        if (!activeTask) return;
        // Pause timer to capture final duration
        await pauseTimer(activeTask);

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setTimeout(async () => {
            // Mark as DONE but keep isFocusSession=true so it goes to Archive
            await updateTask(activeTask.id, { status: 'DONE' });
            setActiveTaskId(null);
            setViewMode('list');
            setActiveNoteId(null);
        }, 1500);
    };

    const handleSaveExit = async () => {
        // Pause timer before leaving, session persists
        if (activeTask) {
            await pauseTimer(activeTask);
        }
        setActiveTaskId(null);
        navigate('/dashboard');
    };

    const handleDeleteFromArchive = async (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Permanently delete this session and task?")) {
            const { deleteTask } = useTaskStore.getState();
            await deleteTask(taskId);
        }
    };

    const handleReviveTask = async (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await updateTask(taskId, { status: 'IN_PROGRESS' });
    };

    return (
        <div className="flex h-[calc(100vh-3.5rem)] bg-background animate-in fade-in duration-300">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full">
                <FocusSidebar
                    activeTaskId={activeTaskId}
                    focusedTasks={focusedTasks}
                    onSwitchSession={handleSwitchSession}
                    onNewSession={handleNewSession}
                    onDeleteFromArchive={handleDeleteFromArchive}
                    onReviveTask={handleReviveTask}
                />
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50">
                        <Menu className="w-6 h-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                    <FocusSidebar
                        activeTaskId={activeTaskId}
                        focusedTasks={focusedTasks}
                        onSwitchSession={handleSwitchSession}
                        onNewSession={handleNewSession}
                        onDeleteFromArchive={handleDeleteFromArchive}
                        onReviveTask={handleReviveTask}
                    />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 h-full overflow-hidden flex flex-col relative bg-muted/20">

                {!activeTask ? (
                    // --- VIEW A: DASHBOARD OR SETUP ---
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        {focusedTasks.filter(t => t.status !== 'DONE').length > 0 && !isSetupMode ? (
                            // 1. Dashboard Grid View
                            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}</h1>
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
                        ) : (
                            // 2. Setup View (Input)
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
                        )}
                    </div>
                ) : (
                    // --- VIEW B: FOCUS STUDIO ---
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">

                            {/* Header Section */}
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-1">
                                        <Input
                                            className="text-3xl md:text-4xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
                                            value={activeTask.title}
                                            onChange={e => handleUpdateTitle(e.target.value)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-sm px-2 py-0.5">In Progress</Badge>
                                            {activeTask.dueDate && isValid(new Date(activeTask.dueDate)) && (
                                                <span className={cn("text-xs font-medium", new Date() > activeTask.dueDate ? "text-red-500" : "text-muted-foreground")}>
                                                    Due {format(activeTask.dueDate, "MMM d, h:mm a")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={cn("hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm border shadow-sm transition-colors", activeTask.focusStartTime ? "bg-primary/10 border-primary/20" : "bg-muted/50")}>
                                            <Clock className={cn("w-4 h-4", activeTask.focusStartTime ? "text-primary animate-pulse" : "text-muted-foreground")} />
                                            {formatTime(secondsElapsed)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                                    <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className={cn("h-8 justify-start text-left font-normal", !activeTask.dueDate && "text-muted-foreground")}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {activeTask.dueDate && isValid(new Date(activeTask.dueDate)) ? format(activeTask.dueDate, "MMM d, yyyy") : <span>Set Date</span>}
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

                                        <div className="w-px h-4 bg-border" />

                                        <Select value={selectedTime} onValueChange={handleUpdateTime}>
                                            <SelectTrigger className="w-[100px] h-8 border-none focus:ring-0 shadow-none">
                                                <SelectValue placeholder="Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 48 }).map((_, i) => {
                                                    const h = Math.floor(i / 2);
                                                    const m = i % 2 === 0 ? '00' : '30';
                                                    const time = `${h.toString().padStart(2, '0')}:${m}`;
                                                    return (
                                                        <SelectItem key={time} value={time}>
                                                            {format(setMinutes(setHours(new Date(), h), Number(m)), 'h:mm a')}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Stop Focusing Button in Header */}
                                    {/* Timer Controls */}
                                    <div className="ml-auto flex items-center gap-2">
                                        <Button
                                            variant={activeTask.focusStartTime ? "secondary" : "default"} // Visual feedback
                                            size="sm"
                                            onClick={() => activeTask.focusStartTime ? pauseTimer(activeTask) : startTimer(activeTask.id)}
                                            className="gap-2"
                                        >
                                            {activeTask.focusStartTime ? (
                                                <>
                                                    <div className="w-2 h-2 rounded-sm bg-current animate-pulse" /> {/* Pause Icon-ish */}
                                                    Pause Session
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-4 h-4" />
                                                    Resume Session
                                                </>
                                            )}
                                        </Button>

                                        <Button variant="ghost" size="icon" onClick={handleSaveExit} title="Exit Session">
                                            <LogOut className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                {/* Center: Subtasks (7 cols) */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-semibold flex items-center justify-between">
                                            Task Breakdown
                                            <span className="text-xs font-normal text-muted-foreground">{Math.round(progress)}% Complete</span>
                                        </h2>
                                        <Progress value={progress} className="h-2" />
                                    </div>

                                    <Card className="border-muted/50 shadow-sm">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-2">
                                                {activeTask.subtasks?.map(subtask => (
                                                    <div key={subtask.id} className="group flex items-center gap-3 p-3 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors border border-transparent hover:border-border">
                                                        <div
                                                            className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all", subtask.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground hover:border-primary")}
                                                            onClick={() => handleToggleSubtask(subtask.id)}
                                                        >
                                                            {subtask.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <span className={cn("flex-1 text-sm pt-0.5 font-medium", subtask.completed && "line-through text-muted-foreground font-normal")}>
                                                            {subtask.title}
                                                        </span>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                                            onClick={() => deleteSubtask(subtask.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {(!activeTask.subtasks || activeTask.subtasks.length === 0) && (
                                                    <div className="text-center py-8 text-muted-foreground text-sm italic border-2 border-dashed rounded-lg bg-muted/10">
                                                        No subtasks yet. Break your goal down into smaller steps.
                                                    </div>
                                                )}
                                            </div>
                                            <form onSubmit={handleAddSubtask} className="flex gap-2 relative">
                                                <Input
                                                    placeholder="Add a step..."
                                                    className="h-11 pr-10"
                                                    value={subtaskInput}
                                                    onChange={e => setSubtaskInput(e.target.value)}
                                                />
                                                <Button type="submit" size="sm" className="absolute right-1 top-1 h-9 w-9 p-0" disabled={!subtaskInput.trim()}>
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>

                                    {/* Resources Section */}
                                    <div className="pt-4 space-y-4">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" /> Resources
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {activeTask.resourceLinks?.map((link, index) => (
                                                <div key={index} className="flex items-center gap-1 bg-background border shadow-sm text-foreground px-3 py-1.5 rounded-full text-sm group hover:border-primary/50 transition-colors">
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline max-w-[200px] truncate">
                                                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                                        {link.name}
                                                    </a>
                                                    <button onClick={() => removeLink(index)} className="ml-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={handleAddLink} className="flex gap-2">
                                            <Input
                                                placeholder="Title"
                                                className="flex-1 h-9"
                                                value={linkName}
                                                onChange={e => setLinkName(e.target.value)}
                                            />
                                            <Input
                                                placeholder="URL"
                                                className="flex-[2] h-9"
                                                value={linkUrl}
                                                onChange={e => setLinkUrl(e.target.value)}
                                            />
                                            <Button type="submit" size="sm" variant="secondary" disabled={!linkName.trim() || !linkUrl.trim()}>
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>

                                {/* Right: Notebook (5 cols) */}
                                <div className="lg:col-span-5 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Notebook
                                        </h2>
                                        {viewMode === 'list' ? (
                                            <Button size="sm" variant="outline" onClick={handleCreateNote} className="h-8">
                                                <Plus className="w-3 h-3 mr-2" /> Note
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" onClick={() => setViewMode('list')} className="h-8">
                                                <ArrowLeft className="w-3 h-3 mr-2" /> Back
                                            </Button>
                                        )}
                                    </div>

                                    <Card className="flex-1 overflow-hidden flex flex-col shadow-md border-muted/60">
                                        {viewMode === 'list' ? (
                                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                                                {notes.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                                                        <FileText className="w-12 h-12 mb-4 opacity-10" />
                                                        <p className="text-sm">No notes yet.</p>
                                                        <Button variant="link" size="sm" onClick={handleCreateNote}>Create one</Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {notes.map(note => (
                                                            <div
                                                                key={note.id}
                                                                onClick={() => { setActiveNoteId(note.id); setViewMode('editor'); }}
                                                                className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-all group"
                                                            >
                                                                <div className="font-medium text-sm group-hover:text-primary transition-colors">{note.title || 'Untitled Note'}</div>
                                                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                                                    {note.content.replace(/<[^>]*>/g, '') || 'Empty note...'}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground/50 mt-2 text-right">
                                                                    {isValid(new Date(note.updatedAt)) ? format(note.updatedAt, 'MMM d, h:mm a') : 'Just now'}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex-1 overflow-hidden relative">
                                                {activeNote && <NoteEditor note={activeNote} />}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-end gap-3 pt-8 border-t">
                                <Button variant="ghost" onClick={handleSaveExit}>
                                    Save & Exit
                                </Button>
                                <Button size="lg" onClick={handleMarkDone} className="gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Mark Done
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
