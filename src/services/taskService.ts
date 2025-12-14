
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
            // First sanitize the input data (converts undefined to null, handles recursion)
            // We use 'as any' to allow re - assignment of fields with Timestamps later
            const safeTask = removeUndefined(task);

            // Then construct the Firestore data with proper Timestamps
            // Note: We don't run removeUndefined AFTER this because it would strip Timestamp prototypes
            const firestoreData = {
                ...safeTask,
                // Ensure dates are stored as Timestamps
                createdAt: Timestamp.fromDate(task.createdAt),
                updatedAt: Timestamp.fromDate(new Date()),
                dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null
            };

            const docRef = await addDoc(collection(db, TASKS_COLLECTION), firestoreData);
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
            const parseDate = (date: any) => {
                if (!date) return undefined;
                // Handle both Timestamp objects and potential plain objects (if legacy bad data exists)
                // If the bug caused some data to be saved as plain objects, toDate() is missing.
                // We fallback to new Date(date) but if date is { seconds, ... }, new Date(date) might fail or produce invalid date.
                // However, for Timestamps, .toDate() is the way.
                const d = date.toDate ? date.toDate() : new Date(date.seconds ? date.seconds * 1000 : date);
                return !isNaN(d.getTime()) ? d : undefined;
            };

            const tasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Timestamps back to JS Dates
                    createdAt: parseDate(data.createdAt) || new Date(),
                    updatedAt: parseDate(data.updatedAt),
                    dueDate: parseDate(data.dueDate)
                } as Task;
            });
            callback(tasks);
        });
    },

    // Update a task (e.g., status change, content edit)
    updateTask: async (id: string, updates: Partial<Task>) => {
        try {
            const taskRef = doc(db, TASKS_COLLECTION, id);

            // Sanitize updates first
            const safeUpdates = removeUndefined(updates);

            // Prepare Firestore updates with Timestamps
            const firestoreUpdates: any = {
                ...safeUpdates,
                updatedAt: Timestamp.fromDate(new Date())
            };

            if (updates.dueDate !== undefined) {
                firestoreUpdates.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
            }

            await updateDoc(taskRef, firestoreUpdates);
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
            await updateDoc(taskRef, {
                status,
                updatedAt: Timestamp.fromDate(new Date())
            });
        } catch (error) {
            console.error("Error updating task status: ", error);
            throw error;
        }
    }
};
