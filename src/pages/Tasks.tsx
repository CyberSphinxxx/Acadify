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
import { Loader2 } from 'lucide-react';

export default function Tasks() {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'board' | 'calendar'>('list');

    useEffect(() => {
        if (!user) return;

        const unsubscribe = taskService.subscribeToTasks(user.uid, (updatedTasks) => {
            setTasks(updatedTasks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="flex h-14 items-center justify-between border-b px-6 shrink-0 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold">Tasks</h1>
                    <Tabs defaultValue="list" value={view} onValueChange={(v) => setView(v as any)} className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-3 w-[200px]">
                            <TabsTrigger value="list"><List className="w-4 h-4 mr-2" />List</TabsTrigger>
                            <TabsTrigger value="board"><Kanban className="w-4 h-4 mr-2" />Board</TabsTrigger>
                            <TabsTrigger value="calendar"><CalendarIcon className="w-4 h-4 mr-2" />Calendar</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <AddTaskDialog />
            </header>
            <div className="flex-1 overflow-hidden p-6">
                {view === 'list' && <TaskListView tasks={tasks} />}
                {view === 'board' && <TaskBoardView tasks={tasks} />}
                {view === 'calendar' && <TaskCalendarView tasks={tasks} />}
            </div>
        </div>
    );
}
