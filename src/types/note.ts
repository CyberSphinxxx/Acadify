export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string; // HTML content
    createdAt: Date;
    updatedAt: Date;
}
