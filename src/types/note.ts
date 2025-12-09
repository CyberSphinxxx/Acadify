export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string; // HTML content
    isPinned?: boolean | null;
    tags?: string[] | null;
    relatedClassId?: string | null;
    relatedTaskId?: string | null;
    folder?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
