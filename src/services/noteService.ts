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
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Note } from '@/types/note';

const NOTES_COLLECTION = 'notes';

export const noteService = {
    // Create a new blank note
    createNote: async (userId: string) => {
        try {
            const now = new Date();
            const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
                userId,
                title: 'Untitled Note',
                content: '',
                createdAt: Timestamp.fromDate(now),
                updatedAt: Timestamp.fromDate(now)
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating note: ", error);
            throw error;
        }
    },

    // Subscribe to notes list
    subscribeToNotes: (userId: string, callback: (notes: Note[]) => void) => {
        const q = query(
            collection(db, NOTES_COLLECTION),
            where("userId", "==", userId)
            // orderBy("updatedAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate()
                } as Note;
            });
            callback(notes);
        });
    },

    // Update note content/title
    updateNote: async (id: string, updates: Partial<Note>) => {
        try {
            const docRef = doc(db, NOTES_COLLECTION, id);
            const firestoreUpdates: any = {
                ...updates,
                updatedAt: Timestamp.fromDate(new Date())
            };

            // Remove local date fields if present in updates (they shouldn't be, but safe guard)
            // We always want server timestamp or new Date() for updatedAt

            await updateDoc(docRef, firestoreUpdates);
        } catch (error) {
            console.error("Error updating note: ", error);
            throw error;
        }
    },

    deleteNote: async (id: string) => {
        try {
            await deleteDoc(doc(db, NOTES_COLLECTION, id));
        } catch (error) {
            console.error("Error deleting note: ", error);
            throw error;
        }
    }
};
