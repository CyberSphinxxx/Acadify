export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string; // HTML content
    isPinned?: boolean;
    tags?: string[];
    relatedClassId?: string;
    folder?: string;
    createdAt: Date;
    updatedAt: Date;
}
