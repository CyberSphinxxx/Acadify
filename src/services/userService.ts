import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { calculateStreak } from '@/lib/dashboardUtils';
import type { Task } from '@/types/task';
import type { Note } from '@/types/note';

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    studyStreak: number;
    lastStudyDate: string | null; // ISO string YYYY-MM-DD
    createdAt?: any;
    updatedAt?: any;
}

export const userService = {
    /**
     * Get user profile from Firestore.
     * Creates one if it doesn't exist.
     */
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data() as UserProfile;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    /**
     * Create or update basic user profile data.
     */
    async updateUserProfile(uid: string, data: Partial<UserProfile>) {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    },

    /**
     * Calculate and sync the study streak to Firebase.
     * This should be called when dashboard/profile loads or when activities are completed.
     */
    async syncStreak(uid: string, tasks: Task[], notes: Note[]): Promise<number> {
        try {
            // 1. Gather all activity dates
            // Prioritize updatedAt (completion time for Done tasks ideally), fallback to createdAt
            // Include BOTH creation (planning) and completion (executing) as activity
            // This ensures we don't lose the streak if the user just created tasks (old behavior)
            const taskCreationDates = tasks.map(t => new Date(t.createdAt));
            const taskCompletionDates = tasks
                .filter(t => t.status === 'DONE' && t.updatedAt)
                .map(t => new Date(t.updatedAt!));

            const noteDates = notes.map(n => new Date(n.updatedAt || n.createdAt));

            const allActivityDates = [...taskCreationDates, ...taskCompletionDates, ...noteDates];

            // 2. Calculate streak locally
            const currentStreak = calculateStreak(allActivityDates);

            const today = new Date().toISOString().split('T')[0];

            // 3. Update Firebase
            await this.updateUserProfile(uid, {
                studyStreak: currentStreak,
                lastStudyDate: currentStreak > 0 ? today : null
            });

            return currentStreak;
        } catch (error) {
            console.error("Error syncing streak:", error);
            return 0;
        }
    },

    /**
     * PERMANENTLY delete all user data.
     * Deletes tasks, notes, folders, classes, and user profile.
     */
    async deleteUserData(uid: string) {
        try {
            console.log(`Starting data deletion for user: ${uid}`);

            // Helper to delete specific collection for user
            const deleteCollectionData = async (collectionName: string) => {
                const q = query(collection(db, collectionName), where('userId', '==', uid));
                const snapshot = await getDocs(q);

                if (snapshot.empty) return;

                // Create a batch
                const batch = writeBatch(db);
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
                console.log(`Deleted ${snapshot.size} documents from ${collectionName}`);
            };

            // 1. Delete Tasks
            await deleteCollectionData('tasks');

            // 2. Delete Notes
            await deleteCollectionData('notes');

            // 3. Delete Folders
            await deleteCollectionData('folders');

            // 4. Delete Classes
            await deleteCollectionData('classes');

            // 5. Delete User Profile
            const userRef = doc(db, 'users', uid);
            await deleteDoc(userRef);

            console.log("User data deleted successfully.");
        } catch (error) {
            console.error("Error deleting user data:", error);
            throw error;
        }
    }
};
