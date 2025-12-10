import { useState, useMemo } from 'react';
import type { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Folder,
    ChevronDown,
    ChevronRight,
    Search,
    Clock,
    Filter,
    FileText,
    Pin
} from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { noteService } from '@/services/noteService';
import { Input } from '@/components/ui/input';
import { useScheduleStore } from '@/store/useScheduleStore';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotesSidebarProps {
    notes: Note[];
    selectedNoteId: string | null;
    onSelectNote: (id: string) => void;
    userId: string;
    folders: string[];
}

export function NotesSidebar({ notes, selectedNoteId, onSelectNote, userId, folders }: NotesSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState<string>('all');
    const [activeFolder, setActiveFolder] = useState<string | null>(null);
    const [isFoldersExpanded, setIsFoldersExpanded] = useState(true);

    const { classes } = useScheduleStore();

    const handleCreateNote = async () => {
        try {
            const newId = await noteService.createNote(userId);
            onSelectNote(newId);
        } catch (error) {
            console.error("Failed to create note", error);
        }
    };

    const filteredNotes = useMemo(() => {
        let result = notes;

        // Folder filter
        if (activeFolder) {
            result = result.filter(note => note.folder === activeFolder);
        }

        // Search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(note =>
                note.title.toLowerCase().includes(lowerQuery) ||
                stripHtml(note.content).toLowerCase().includes(lowerQuery)
            );
        }

        // Class filter
        if (classFilter !== 'all') {
            result = result.filter(note => note.relatedClassId === classFilter);
        }

        // Drop pinned notes to top (if not already handled by parent sort, but safe to do here)
        return result.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            // Then by updatedAt desc
            return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
    }, [notes, searchQuery, classFilter, activeFolder]);

    const pinnedNotes = filteredNotes.filter(n => n.isPinned);
    const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

    return (
        <div className="flex flex-col h-full border-r bg-muted/10 w-64 flex-shrink-0 transition-all duration-300">
            {/* Header / Search */}
            <div className="p-4 border-b space-y-3">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 bg-background/50"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 justify-between text-xs h-8">
                                <span className="flex items-center gap-2">
                                    <Filter className="w-3 h-3" />
                                    {classFilter === 'all' ? 'All Classes' : classes.find(c => c.id === classFilter)?.subject || 'Filtered'}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Filter by Class</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={classFilter} onValueChange={setClassFilter}>
                                <DropdownMenuRadioItem value="all">All Classes</DropdownMenuRadioItem>
                                {classes.map(cls => (
                                    <DropdownMenuRadioItem key={cls.id} value={cls.id}>
                                        {cls.subject}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button onClick={handleCreateNote} size="icon" className="h-8 w-8 shrink-0">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">

                {/* Folders Section */}
                {folders.length > 0 && (
                    <div className="space-y-1">
                        <button
                            className="flex items-center justify-between w-full px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider group hover:text-foreground transition-colors"
                            onClick={() => setIsFoldersExpanded(!isFoldersExpanded)}
                        >
                            <span className="flex items-center gap-1">
                                <Folder className="w-3 h-3" /> Folders
                            </span>
                            {isFoldersExpanded ? <ChevronDown className="w-3 h-3 opacity-50" /> : <ChevronRight className="w-3 h-3 opacity-50" />}
                        </button>

                        {isFoldersExpanded && (
                            <div className="space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                                <button
                                    onClick={() => setActiveFolder(null)}
                                    className={cn(
                                        "w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2",
                                        activeFolder === null ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    )}
                                >
                                    <FileText className="w-3.5 h-3.5" /> All Notes
                                </button>
                                {folders.map(folder => (
                                    <button
                                        key={folder}
                                        onClick={() => setActiveFolder(folder === activeFolder ? null : folder)}
                                        className={cn(
                                            "w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2",
                                            activeFolder === folder ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                        )}
                                    >
                                        <Folder className={cn("w-3.5 h-3.5", activeFolder === folder && "fill-current")} />
                                        {folder}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pinned Section */}
                {pinnedNotes.length > 0 && (
                    <div className="space-y-1">
                        <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                        </div>
                        {pinnedNotes.map(note => <NoteItem key={note.id} note={note} selectedNoteId={selectedNoteId} onSelect={onSelectNote} />)}
                    </div>
                )}

                {/* Other Notes */}
                <div className="space-y-1">
                    {(pinnedNotes.length > 0 || folders.length > 0) && unpinnedNotes.length > 0 && (
                        <div className="px-2 pb-1 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Recent
                        </div>
                    )}
                    {unpinnedNotes.map(note => <NoteItem key={note.id} note={note} selectedNoteId={selectedNoteId} onSelect={onSelectNote} />)}

                    {filteredNotes.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notes found matching filters.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NoteItem({ note, selectedNoteId, onSelect }: { note: Note, selectedNoteId: string | null, onSelect: (id: string) => void }) {
    return (
        <button
            onClick={() => onSelect(note.id)}
            className={cn(
                "w-full text-left p-3 rounded-lg transition-all group border border-transparent",
                selectedNoteId === note.id
                    ? "bg-background border-border shadow-sm"
                    : "hover:bg-accent/50 hover:border-accent"
            )}
        >
            <div className="flex items-start gap-3">
                {note.isPinned ? (
                    <Pin className={cn(
                        "w-4 h-4 mt-1 shrink-0 transition-colors rotate-45",
                        selectedNoteId === note.id ? "text-primary fill-primary/20" : "text-muted-foreground"
                    )} />
                ) : (
                    <FileText className={cn(
                        "w-4 h-4 mt-1 shrink-0 transition-colors",
                        selectedNoteId === note.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                )}

                <div className="overflow-hidden min-w-0 flex-1">
                    <h4 className={cn(
                        "font-medium text-sm truncate",
                        !note.title && "italic text-muted-foreground"
                    )}>
                        {note.title || 'Untitled Note'}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                        {stripHtml(note.content) || 'No content...'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground/70">
                            {isValid(new Date(note.updatedAt)) ? formatDistanceToNow(note.updatedAt, { addSuffix: true }) : 'Just now'}
                        </span>
                        {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-1 overflow-hidden">
                                {note.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1 py-0">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}

// Simple helper to strip HTML for sidebar preview
function stripHtml(html: string) {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}
