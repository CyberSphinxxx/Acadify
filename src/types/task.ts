export type TaskStatus = 'INBOX' | 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date; // Use Date object for easier manipulation locally, convert to Timestamp for Firestore
    relatedClassId?: string;
    isRecurring?: boolean;
    recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    department?: string; // Optional field if needed

    // Workflow Hub Fields
    isArchived?: boolean;
    subtasks?: Subtask[];
    notes?: string;
    resourceLinks?: { name: string; url: string; }[];
    isFocusSession?: boolean; // Persists session activation state

    // Focus Timer Persistence
    focusStartTime?: number | null; // Timestamp (Date.now()) or null if paused
    accumulatedFocusTime?: number; // Total seconds spent previously

    createdAt: Date;
}
