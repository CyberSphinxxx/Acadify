import { create } from 'zustand';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/task';

interface TaskStore {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    fetchTasks: (userId: string) => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
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
            // Subscribe to tasks instead of one-time fetch to keep it real-time
            // Note: In a real app, we might handle subscription cleanup differently
            // For now, we'll just use the service's subscribe method and update state
            taskService.subscribeToTasks(userId, (tasks) => {
                set({ tasks, loading: false });
            });
            // We return a promise that resolves immediately as the subscription is active
            // Ideally we'd store the unsubscribe function to call it later but keeping it simple for now
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            set({ error: 'Failed to fetch tasks', loading: false });
        }
    },
    addTask: async (taskData) => {
        set({ loading: true, error: null });
        try {
            const id = await taskService.addTask({
                ...taskData,
                createdAt: new Date(),
                // Default recurrence fields if needed, or let them be undefined
            });
            set({ loading: false });
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
