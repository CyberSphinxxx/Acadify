import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    writeBatch,
    updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Ensure db is exported from firebase.ts
import type { ClassSession } from '@/types/schedule';

const COLLECTION_NAME = 'classes';

export const scheduleService = {
    addClass: async (userId: string, classData: Omit<ClassSession, 'id' | 'userId'>) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...classData,
                userId,
            });
            return { id: docRef.id, ...classData, userId };
        } catch (error) {
            console.error("Error adding class: ", error);
            throw error;
        }
    },

    batchAddClasses: async (userId: string, classesData: Omit<ClassSession, 'id' | 'userId'>[]) => {
        try {
            const batch = writeBatch(db);
            const promises = classesData.map(async (classData) => {
                const docRef = doc(collection(db, COLLECTION_NAME));
                batch.set(docRef, { ...classData, userId });
                return { id: docRef.id, ...classData, userId };
            });
            await batch.commit();
            return Promise.all(promises);
        } catch (error) {
            console.error("Error batch adding classes: ", error);
            throw error;
        }
    },

    getClasses: async (userId: string): Promise<ClassSession[]> => {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const classes: ClassSession[] = [];
            querySnapshot.forEach((doc) => {
                classes.push({ id: doc.id, ...doc.data() } as ClassSession);
            });
            return classes;
        } catch (error) {
            console.error("Error getting classes: ", error);
            throw error;
        }
    },

    subscribeToClasses: (userId: string, callback: (classes: ClassSession[]) => void) => {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId)
        );
        return onSnapshot(q, (snapshot) => {
            const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassSession));
            callback(classes);
        });
    },

    deleteClass: async (classId: string) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, classId));
        } catch (error) {
            console.error("Error deleting class: ", error);
            throw error;
        }
    },

    batchDeleteClasses: async (classIds: string[]) => {
        try {
            const batch = writeBatch(db);
            classIds.forEach(id => {
                const docRef = doc(db, COLLECTION_NAME, id);
                batch.delete(docRef);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error batch deleting classes: ", error);
            throw error;
        }
    },

    updateClass: async (classId: string, updates: Partial<ClassSession>) => {
        try {
            const classRef = doc(db, COLLECTION_NAME, classId);
            const { id, ...dataToUpdate } = updates as ClassSession;
            await updateDoc(classRef, dataToUpdate);
        } catch (error) {
            console.error("Error updating class: ", error);
            throw error;
        }
    }
};
