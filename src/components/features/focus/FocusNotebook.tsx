import type { Note } from '@/types/note';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, ArrowLeft } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { NoteEditor } from '@/components/features/notes/NoteEditor';

interface FocusNotebookProps {
    notes: Note[];
    viewMode: 'list' | 'editor';
    setViewMode: (mode: 'list' | 'editor') => void;
    activeNote: Note | null | undefined;
    setActiveNoteId: (id: string) => void;
    handleCreateNote: () => void;
}

export function FocusNotebook({
    notes,
    viewMode,
    setViewMode,
    activeNote,
    setActiveNoteId,
    handleCreateNote
}: FocusNotebookProps) {
    return (
        <div className="lg:col-span-5 flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Notebook
                </h2>
                {viewMode === 'list' ? (
                    <Button size="sm" variant="outline" onClick={handleCreateNote} className="h-8">
                        <Plus className="w-3 h-3 mr-2" /> Note
                    </Button>
                ) : (
                    <Button size="sm" variant="ghost" onClick={() => setViewMode('list')} className="h-8">
                        <ArrowLeft className="w-3 h-3 mr-2" /> Back
                    </Button>
                )}
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col shadow-md border-muted/60">
                {viewMode === 'list' ? (
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                        {notes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                                <FileText className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-sm">No notes yet.</p>
                                <Button variant="link" size="sm" onClick={handleCreateNote}>Create one</Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {notes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => { setActiveNoteId(note.id); setViewMode('editor'); }}
                                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-all group"
                                    >
                                        <div className="font-medium text-sm group-hover:text-primary transition-colors">{note.title || 'Untitled Note'}</div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">
                                            {note.content.replace(/<[^>]*>/g, '') || 'Empty note...'}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground/50 mt-2 text-right">
                                            {isValid(new Date(note.updatedAt)) ? format(note.updatedAt, 'MMM d, h:mm a') : 'Just now'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden relative">
                        {activeNote && <NoteEditor note={activeNote} />}
                    </div>
                )}
            </Card>
        </div>
    );
}
