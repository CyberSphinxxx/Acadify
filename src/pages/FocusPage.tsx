import { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useFocusStore } from '@/store/useFocusStore';
import type { Subtask, Task } from '@/types/task';
import type { Note } from '@/types/note';
import { noteService } from '@/services/noteService';
import { Button } from '@/components/ui/button';
import { setHours, setMinutes, startOfDay } from 'date-fns';
import { Menu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FocusSidebar } from '@/components/features/focus/FocusSidebar';
import { FocusDashboard } from '@/components/features/focus/FocusDashboard';
import { FocusSession } from '@/components/features/focus/FocusSession';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

    const handleDeleteFromArchive = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTaskToDeleteId(taskId);
    };

    const confirmDeleteSession = async () => {
        if (taskToDeleteId) {
            const { deleteTask } = useTaskStore.getState();
            await deleteTask(taskToDeleteId);
            setTaskToDeleteId(null);
        }
    };

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
                    <FocusDashboard
                        userDisplayName={user?.displayName}
                        focusedTasks={focusedTasks}
                        isSetupMode={isSetupMode}
                        setIsSetupMode={setIsSetupMode}
                        setupTitle={setupTitle}
                        setSetupTitle={setSetupTitle}
                        handleSwitchSession={handleSwitchSession}
                        handleNewSession={handleNewSession}
                        handleStartSession={handleStartSession}
                    />
                ) : (
                    // --- VIEW B: FOCUS STUDIO ---
                    <FocusSession
                        activeTask={activeTask}
                        secondsElapsed={secondsElapsed}
                        selectedTime={selectedTime}
                        handleUpdateTitle={handleUpdateTitle}
                        handleUpdateDueDate={handleUpdateDueDate}
                        handleUpdateTime={handleUpdateTime}
                        handleSaveExit={handleSaveExit}
                        startTimer={startTimer}
                        pauseTimer={pauseTimer}
                        formatTime={formatTime}
                        progress={progress}
                        subtaskInput={subtaskInput}
                        setSubtaskInput={setSubtaskInput}
                        handleAddSubtask={handleAddSubtask}
                        handleToggleSubtask={handleToggleSubtask}
                        deleteSubtask={deleteSubtask}
                        linkName={linkName}
                        setLinkName={setLinkName}
                        linkUrl={linkUrl}
                        setLinkUrl={setLinkUrl}
                        handleAddLink={handleAddLink}
                        removeLink={removeLink}
                        notes={notes}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        activeNote={activeNote}
                        setActiveNoteId={setActiveNoteId}
                        handleCreateNote={handleCreateNote}
                        handleMarkDone={handleMarkDone}
                    />
                )}
            </div>

            <AlertDialog open={!!taskToDeleteId} onOpenChange={(open) => !open && setTaskToDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently delete this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the focus session and the associated task. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
