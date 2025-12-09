import { create } from 'zustand';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/task';

interface TaskStore {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    fetchTasks: (userId: string) => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Date }) => Promise<string>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],
    loading: false,
    error: null,
    fetchTasks: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            taskService.subscribeToTasks(userId, (tasks) => {
                set({ tasks, loading: false });
            });
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            set({ error: 'Failed to fetch tasks', loading: false });
        }
    },
    addTask: async (taskData) => {
        set({ loading: true, error: null });
        try {
            const createdAt = taskData.createdAt || new Date();
            // Optimistic Update
            const tempId = crypto.randomUUID();
            const optimisticTask = { ...taskData, id: tempId, createdAt } as Task;

            set(state => ({ tasks: [...state.tasks, optimisticTask] }));

            const id = await taskService.addTask({
                ...taskData,
                createdAt,
            });

            // Update with real ID once confirmed (taskService subscription will likely handle this too, but this ensures consistency)
            set(state => ({
                tasks: state.tasks.map(t => t.id === tempId ? { ...t, id } : t),
                loading: false
            }));

            return id;
        } catch (error) {
            console.error('Failed to add task:', error);
            set({ error: 'Failed to add task', loading: false });
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
