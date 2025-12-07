import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { noteService } from '@/services/noteService';
import type { Note } from '@/types/note';
import { NotesSidebar } from '@/components/features/notes/NotesSidebar';
import { NoteEditor } from '@/components/features/notes/NoteEditor';

export default function Notes() {
    const { user } = useAuthStore();
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = noteService.subscribeToNotes(user.uid, (fetchedNotes) => {
            setNotes(fetchedNotes);
            setLoading(false);

            // Auto-select first note if none selected (optional UX)
            // if (!selectedNoteId && fetchedNotes.length > 0) {
            //     setSelectedNoteId(fetchedNotes[0].id);
            // }
        });

        return () => unsubscribe();
    }, [user]); // Removed selectedNoteId from dep to avoid loop

    const selectedNote = notes.find(n => n.id === selectedNoteId);

    if (loading) {
        return <div className="p-8">Loading notes...</div>;
    }

    if (!user) return null;

    return (
        <div className="flex h-[calc(100vh-4rem)]"> {/* Adjust height for layout */}
            <NotesSidebar
                notes={notes}
                selectedNoteId={selectedNoteId}
                onSelectNote={setSelectedNoteId}
                userId={user.uid}
            />
            <div className="flex-1 p-6 overflow-hidden">
                {selectedNote ? (
                    <NoteEditor note={selectedNote} />
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md bg-muted/10">
                        <p>Select a note to start writing</p>
                    </div>
                )}
            </div>
        </div>
    );
}
