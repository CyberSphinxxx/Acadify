import { create } from 'zustand';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/task';

interface TaskStore {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    unsubscribe: (() => void) | null;
    fetchTasks: (userId: string) => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Date }) => Promise<string>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],
    loading: false,
    error: null,
    unsubscribe: null as (() => void) | null,
    fetchTasks: async (userId: string) => {
        const store = useTaskStore.getState();
        if (store.unsubscribe) {
            store.unsubscribe();
        }

        set({ loading: true, error: null });
        try {
            const unsub = taskService.subscribeToTasks(userId, (tasks) => {
                set({ tasks, loading: false });
            });
            set({ unsubscribe: unsub });
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            set({ error: 'Failed to fetch tasks', loading: false });
        }
    },
    addTask: async (taskData) => {
        // Optimistic Update
        // Note: We don't set loading: true here to avoid UI flicker since we show optimistic result immediately
        const createdAt = taskData.createdAt || new Date();
        const tempId = crypto.randomUUID();
        const optimisticTask = { ...taskData, id: tempId, createdAt } as Task;

        set(state => ({ tasks: [...state.tasks, optimisticTask], error: null }));

        try {
            const id = await taskService.addTask({
                ...taskData,
                createdAt,
            });

            // The subscription will eventually update the list with the real ID and server data.
            // We return the real ID so components like FocusPage can use it immediately.
            return id;
        } catch (error) {
            console.error('Failed to add task:', error);
            // Revert optimistic update on failure
            set(state => ({
                tasks: state.tasks.filter(t => t.id !== tempId),
                error: 'Failed to add task'
            }));
            throw error;
        }
    },
    updateTask: async (id, updates) => {
        try {
            await taskService.updateTask(id, updates);
        } catch (error) {
            console.error('Failed to update task:', error);
            set({ error: 'Failed to update task' });
            throw error;
        }
    },
    deleteTask: async (id) => {
        try {
            await taskService.deleteTask(id);
        } catch (error) {
            console.error('Failed to delete task:', error);
            set({ error: 'Failed to delete task' });
            throw error;
        }
    }
}));

