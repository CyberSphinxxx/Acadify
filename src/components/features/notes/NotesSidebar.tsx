import type { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { noteService } from '@/services/noteService';

interface NotesSidebarProps {
    notes: Note[];
    selectedNoteId: string | null;
    onSelectNote: (id: string) => void;
    userId: string;
}

export function NotesSidebar({ notes, selectedNoteId, onSelectNote, userId }: NotesSidebarProps) {
    const handleCreateNote = async () => {
        try {
            const newId = await noteService.createNote(userId);
            onSelectNote(newId);
        } catch (error) {
            console.error("Failed to create note", error);
        }
    };

    return (
        <div className="flex flex-col h-full border-r bg-muted/10 w-64 flex-shrink-0">
            <div className="p-4 border-b">
                <Button onClick={handleCreateNote} className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    New Note
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {notes.map(note => (
                    <button
                        key={note.id}
                        onClick={() => onSelectNote(note.id)}
                        className={cn(
                            "w-full text-left p-3 rounded-lg transition-colors hover:bg-accent group",
                            selectedNoteId === note.id ? "bg-accent" : "bg-transparent"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <FileText className={cn(
                                "w-4 h-4 mt-1 text-muted-foreground transition-colors",
                                selectedNoteId === note.id ? "text-primary" : "group-hover:text-foreground"
                            )} />
                            <div className="overflow-hidden">
                                <h4 className={cn(
                                    "font-medium text-sm truncate",
                                    !note.content && "italic text-muted-foreground"
                                )}>
                                    {/* Naive title extraction from content or fallback */}
                                    {note.title || (note.content ? stripHtml(note.content).slice(0, 20) || 'Untitled Note' : 'Untitled Note')}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Simple helper to strip HTML for sidebar preview
function stripHtml(html: string) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
