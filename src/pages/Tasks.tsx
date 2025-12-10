import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/task';
import { TaskBoardView } from '@/components/features/tasks/TaskBoardView';
import { TaskListView } from '@/components/features/tasks/TaskListView';
import { TaskCalendarView } from '@/components/features/tasks/TaskCalendarView';
import { AddTaskDialog } from '@/components/features/tasks/AddTaskDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, Kanban, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function Tasks() {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'board' | 'calendar'>('list');

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'DONE'>('ALL');

    useEffect(() => {
        if (!user) return;

        const unsubscribe = taskService.subscribeToTasks(user.uid, (updatedTasks) => {
            setTasks(updatedTasks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDeleteTask = async (taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await taskService.deleteTask(taskId);
            } catch (error) {
                console.error("Failed to delete task", error);
            }
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
                {view === 'list' && <TaskListView tasks={filteredTasks} onDelete={handleDeleteTask} />}
                {view === 'board' && <TaskBoardView tasks={filteredTasks} onDelete={handleDeleteTask} />}
                {view === 'calendar' && <TaskCalendarView tasks={filteredTasks} />}
            </div>
        </div>
    );
}
