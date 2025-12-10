import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { noteService } from '@/services/noteService';
import type { Note } from '@/types/note';
import { NotesSidebar } from '@/components/features/notes/NotesSidebar';
import { NoteEditor } from '@/components/features/notes/NoteEditor';
import { Menu, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useScheduleStore } from '@/store/useScheduleStore';
import { Loader2 } from 'lucide-react';

export default function Notes() {
    const { user } = useAuthStore();
    const { fetchClasses } = useScheduleStore();
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        fetchClasses(user.uid); // Fetch classes for filters/metadata

        const unsubscribe = noteService.subscribeToNotes(user.uid, (fetchedNotes) => {
            // Filter out Focus Session notes (those linked to a task)
            const generalNotes = fetchedNotes.filter(n => !n.relatedTaskId);
            setNotes(generalNotes);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, fetchClasses]);

    const selectedNote = notes.find(n => n.id === selectedNoteId);

    const handleSelectNote = (id: string) => {
        setSelectedNoteId(id);
        setIsMobileSidebarOpen(false);
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) return null;

    const uniqueFolders = Array.from(new Set(notes.map(n => n.folder).filter(Boolean))) as string[];

    return (
        <div className="flex h-[calc(100vh-3.5rem)] bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full">
                <NotesSidebar
                    notes={notes}
                    selectedNoteId={selectedNoteId}
                    onSelectNote={handleSelectNote}
                    userId={user.uid}
                    folders={uniqueFolders}
                />
            </div>

            {/* Mobile Sheet Sidebar */}
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <SheetContent side="left" className="p-0 w-80">
                    <NotesSidebar
                        notes={notes}
                        selectedNoteId={selectedNoteId}
                        onSelectNote={handleSelectNote}
                        userId={user.uid}
                        folders={uniqueFolders}
                    />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden border-b p-2 flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold ml-2">Notes</span>
                </div>

                {selectedNote ? (
                    <NoteEditor note={selectedNote} availableFolders={uniqueFolders} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5 p-8 text-center">
                        <div className="bg-muted/20 p-4 rounded-full mb-4">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Select a note to view</h3>
                        <p className="text-sm max-w-sm">
                            Choose a note from the sidebar or create a new one to get started with your knowledge base.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
