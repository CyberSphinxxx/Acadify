import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import type { Task } from '@/types/task';

interface FocusStore {
    focusedTasks: Task[];
    loading: boolean;
    error: string | null;
    subscribeToFocusSessions: (userId: string) => () => void;
    toggleFocusSession: (taskId: string, isActive: boolean) => Promise<void>;
}

export const useFocusStore = create<FocusStore>((set) => ({
    focusedTasks: [],
    loading: false,
    error: null,

    subscribeToFocusSessions: (userId: string) => {
        set({ loading: true });

        const q = query(
            collection(db, 'tasks'),
            where('userId', '==', userId),
            where('isFocusSession', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
                    dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : (data.dueDate ? new Date(data.dueDate) : undefined)
                } as Task;
            });
            set({ focusedTasks: tasks, loading: false });
        }, (error) => {
            console.error('Focus subscription error:', error);
            set({ error: 'Failed to sync focus sessions', loading: false });
        });

        return unsubscribe;
    },

    toggleFocusSession: async (taskId: string, isActive: boolean) => {
        try {
            const taskRef = doc(db, 'tasks', taskId);
            await updateDoc(taskRef, {
                isFocusSession: isActive
            });
        } catch (error) {
            console.error('Failed to toggle focus session:', error);
            throw error;
        }
    }
}));
