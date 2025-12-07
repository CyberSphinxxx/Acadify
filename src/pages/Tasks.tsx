import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/task'; // Import Task type
import { KanbanBoard } from '@/components/features/tasks/KanbanBoard';
import { AddTaskDialog } from '@/components/features/tasks/AddTaskDialog';

export default function Tasks() {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = taskService.subscribeToTasks(user.uid, (updatedTasks) => {
            setTasks(updatedTasks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <div className="p-8">Loading tasks...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="flex h-14 items-center justify-between border-b px-6 shrink-0">
                <h1 className="text-xl font-semibold">Tasks</h1>
                <AddTaskDialog />
            </header>
            <div className="flex-1 overflow-hidden p-6">
                <KanbanBoard tasks={tasks} />
            </div>
        </div>
    );
}
