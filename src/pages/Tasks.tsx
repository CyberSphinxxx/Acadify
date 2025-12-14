import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTaskStore } from '@/store/useTaskStore';
import type { Task } from '@/types/task';
import { TaskBoardView } from '@/components/features/tasks/TaskBoardView';
import { TaskListView } from '@/components/features/tasks/TaskListView';
import { TaskCalendarView } from '@/components/features/tasks/TaskCalendarView';
import { AddTaskDialog } from '@/components/features/tasks/AddTaskDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, Kanban, Calendar as CalendarIcon, ClipboardList, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';

function EmptyState({ isFiltered, onClearFilters }: { isFiltered: boolean; onClearFilters: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in-50">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {isFiltered ? 'No matching tasks found' : 'No tasks yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {isFiltered
                    ? "Try adjusting your filters or search query to find what you're looking for."
                    : "Create your first task to start tracking your academic progress and stay organized."}
            </p>
            {isFiltered ? (
                <Button variant="outline" onClick={onClearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                </Button>
            ) : (
                <AddTaskDialog />
            )}
        </div>
    );
}

export default function Tasks() {
    const { user } = useAuthStore();
    const { tasks, loading, fetchTasks, deleteTask, updateTask } = useTaskStore();
    const [view, setView] = useState<'list' | 'board' | 'calendar'>('list');

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');

    // Deletion State
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        fetchTasks(user.uid);
    }, [user, fetchTasks]);

    const handleDeleteTask = (taskId: string) => {
        setTaskToDelete(taskId);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        try {
            await deleteTask(taskToDelete);
            toast.success("Task deleted successfully");
        } catch (error) {
            console.error("Failed to delete task", error);
            toast.error("Failed to delete task");
        } finally {
            setTaskToDelete(null);
        }
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            await updateTask(taskId, updates);
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    // Derived State
    const filteredTasks = tasks.filter(task => {
        // 1. Search Filter
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Status Filter
        let matchesStatus = true;
        if (filterStatus === 'PENDING') matchesStatus = task.status !== 'DONE';
        if (filterStatus === 'DONE') matchesStatus = task.status === 'DONE';

        // 3. Exclude Focus Sessions
        const isNotFocusSession = !task.isFocusSession;

        return matchesSearch && matchesStatus && isNotFocusSession;
    });

    const isFiltered = searchQuery.length > 0 || filterStatus !== 'ALL';
    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterStatus('ALL');
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="flex flex-col gap-4 border-b px-6 py-4 shrink-0">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Tasks</h1>
                    <AddTaskDialog />
                </div>

                <div className="flex items-center justify-between gap-4">
                    {/* Search & Filter Controls */}
                    <div className="flex items-center gap-2 flex-1 max-w-lg">
                        <Input
                            placeholder="Search tasks..."
                            className="max-w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="flex items-center bg-muted rounded-md p-1">
                            {(['ALL', 'PENDING', 'DONE'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-medium rounded-sm transition-all capitalize",
                                        filterStatus === status ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {status.toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* View Switcher */}
                    <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="list"><List className="w-4 h-4 mr-2" />List</TabsTrigger>
                            <TabsTrigger value="board"><Kanban className="w-4 h-4 mr-2" />Board</TabsTrigger>
                            <TabsTrigger value="calendar"><CalendarIcon className="w-4 h-4 mr-2" />Calendar</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </header>

            <div className="flex-1 overflow-hidden p-6">
                {filteredTasks.length === 0 && view !== 'calendar' ? (
                    <EmptyState isFiltered={isFiltered} onClearFilters={handleClearFilters} />
                ) : (
                    <>
                        {view === 'list' && <TaskListView tasks={filteredTasks} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} />}
                        {view === 'board' && <TaskBoardView tasks={filteredTasks} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} />}
                        {view === 'calendar' && <TaskCalendarView tasks={filteredTasks} />}
                    </>
                )}
            </div>

            <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your task.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
