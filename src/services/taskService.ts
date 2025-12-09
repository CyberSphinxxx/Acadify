import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    Timestamp,
    // orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task, TaskStatus } from '@/types/task';
import { removeUndefined } from '@/lib/utils';

const TASKS_COLLECTION = 'tasks';

export const taskService = {
    // Add a new task
    addTask: async (task: Omit<Task, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
                ...task,
                // Ensure dates are stored as Timestamps
                createdAt: Timestamp.fromDate(task.createdAt),
                dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding task: ", error);
            throw error;
        }
    },

    // Subscribe to tasks for a specific user
    subscribeToTasks: (userId: string, callback: (tasks: Task[]) => void) => {
        const q = query(
            collection(db, TASKS_COLLECTION),
            where("userId", "==", userId)
            // orderBy("createdAt", "desc") // Removed to avoid index requirement for now
        );

        return onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Timestamps back to JS Dates
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
                    dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : (data.dueDate ? new Date(data.dueDate) : undefined)
                } as Task;
            });
            callback(tasks);
        });
    },

    // Update a task (e.g., status change, content edit)
    updateTask: async (id: string, updates: Partial<Task>) => {
        try {
            const taskRef = doc(db, TASKS_COLLECTION, id);
            // Handle date conversions if necessary
            const firestoreUpdates: any = { ...updates };
            if (updates.dueDate) {
                firestoreUpdates.dueDate = Timestamp.fromDate(updates.dueDate);
            }
            // CreateAt should usually not be updated, but if so handle it

            // Sanitize updates
            const sanitizedUpdates = removeUndefined(firestoreUpdates);

            await updateDoc(taskRef, sanitizedUpdates);
        } catch (error) {
            console.error("Error updating task: ", error);
            throw error;
        }
    },

    // Delete a task
    deleteTask: async (id: string) => {
        try {
            await deleteDoc(doc(db, TASKS_COLLECTION, id));
        } catch (error) {
            console.error("Error deleting task: ", error);
            throw error;
        }
    },

    // Update task status (specific helper)
    updateTaskStatus: async (id: string, status: TaskStatus) => {
        try {
            const taskRef = doc(db, TASKS_COLLECTION, id);
            await updateDoc(taskRef, { status });
        } catch (error) {
            console.error("Error updating task status: ", error);
            throw error;
        }
    }
};
