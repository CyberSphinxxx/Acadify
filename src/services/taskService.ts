
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
        console.log("taskService.addTask called with:", task);
        try {
            const cleanTask = removeUndefined({
                ...task,
                // Ensure dates are stored as Timestamps
                createdAt: Timestamp.fromDate(task.createdAt),
                updatedAt: Timestamp.fromDate(new Date()),
                dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null
            });

            const docRef = await addDoc(collection(db, TASKS_COLLECTION), cleanTask);
            console.log("taskService.addTask success, ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error adding task: ", error);
            throw error;
        }
    },

    // Subscribe to tasks for a specific user
    subscribeToTasks: (userId: string, callback: (tasks: Task[]) => void) => {
        console.log("taskService.subscribeToTasks initializing for user:", userId);
        const q = query(
            collection(db, TASKS_COLLECTION),
            where("userId", "==", userId)
            // orderBy("createdAt", "desc") // Removed to avoid index requirement for now
        );

        return onSnapshot(q, (snapshot) => {
            console.log("taskService.subscribeToTasks snapshot received. Docs count:", snapshot.docs.length);
            const parseDate = (date: any) => {
                if (!date) return undefined;
                const d = date.toDate ? date.toDate() : new Date(date);
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
            console.log("taskService.subscribeToTasks parsed tasks:", tasks);
            callback(tasks);
        });
    },

    // Update a task (e.g., status change, content edit)
    updateTask: async (id: string, updates: Partial<Task>) => {
        console.log("taskService.updateTask called for ID:", id, "Updates:", updates);
        try {
            const taskRef = doc(db, TASKS_COLLECTION, id);
            // Handle date conversions if necessary
            const firestoreUpdates: any = {
                ...updates,
                updatedAt: Timestamp.fromDate(new Date())
            };
            if (updates.dueDate) {
                firestoreUpdates.dueDate = Timestamp.fromDate(updates.dueDate);
            }
            // CreateAt should usually not be updated, but if so handle it

            // Sanitize updates
            const sanitizedUpdates = removeUndefined(firestoreUpdates);

            await updateDoc(taskRef, sanitizedUpdates);
            console.log("taskService.updateTask success");
        } catch (error) {
            console.error("Error updating task: ", error);
            throw error;
        }
    },

    // Delete a task
    deleteTask: async (id: string) => {
        console.log("taskService.deleteTask called for ID:", id);
        try {
            await deleteDoc(doc(db, TASKS_COLLECTION, id));
            console.log("taskService.deleteTask success");
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
