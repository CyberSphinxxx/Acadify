import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot
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
    }
};
