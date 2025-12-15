import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Pin, Tag, BookOpen, Clock, MoreVertical, Trash2, Folder, Maximize2, Minimize2,
    Loader2, Check
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import type { Note } from '@/types/note';
import type { ClassSession } from '@/types/schedule';

interface NoteHeaderProps {
    note: Note;
    title: string;
    isSaving: boolean;
    isFocusMode: boolean;
    isDeleteAlertOpen: boolean;
    availableFolders: string[];
    uniqueClasses: ClassSession[];
    relatedClass: ClassSession | undefined;
    tagInput: string;
    newFolderInput: string;

    // Handlers
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleFocusMode: () => void;
    onTogglePin: () => void;
    onDeleteClick: () => void;
    onFolderSelect: (folder: string | null) => void;
    onNewFolderInputCheck: (e: React.KeyboardEvent) => void;
    onNewFolderInputChange: (value: string) => void;
    onClassSelect: (classId: string) => void;
    onTagInputChange: (value: string) => void;
    onTagAddCheck: (e: React.KeyboardEvent) => void;
    onRemoveTag: (tag: string) => void;
}

export const NoteHeader = memo(function NoteHeader({
    note,
    title,
    isSaving,
    isFocusMode,
    availableFolders,
    uniqueClasses,
    relatedClass,
    tagInput,
    newFolderInput,
    onTitleChange,
    onToggleFocusMode,
    onTogglePin,
    onDeleteClick,
    onFolderSelect,
    onNewFolderInputCheck,
    onNewFolderInputChange,
    onClassSelect,
    onTagInputChange,
    onTagAddCheck,
    onRemoveTag
}: NoteHeaderProps) {
    return (
        <div className="px-8 pt-6 pb-2 space-y-4 fade-in-20 animate-in duration-500">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <Input
                        value={title}
                        onChange={onTitleChange}
                        className="text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent transition-all"
                        placeholder="Untitled Note"
                    />
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2" title="Last updated">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isValid(new Date(note.updatedAt)) ? format(new Date(note.updatedAt), 'MMM d, h:mm a') : 'Just now'}</span>
                        </div>

                        <div className="h-3 w-px bg-border/60" />

                        {/* Folder & Class Info */}
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className={cn("h-6 px-2 gap-1.5 text-xs font-normal transition-colors", note.folder && "text-primary bg-primary/10 hover:bg-primary/20")}>
                                        <Folder className={cn("w-3.5 h-3.5 mr-1", note.folder && "fill-current")} />
                                        {note.folder || 'No Folder'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="start">
                                    <DropdownMenuLabel>Move to Folder</DropdownMenuLabel>
                                    <div className="px-2 py-1.5">
                                        <Input
                                            placeholder="New folder name..."
                                            className="h-8 text-xs"
                                            value={newFolderInput}
                                            onChange={(e) => onNewFolderInputChange(e.target.value)}
                                            onKeyDown={onNewFolderInputCheck}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onFolderSelect(null)}>
                                        <span className="italic text-muted-foreground">None</span>
                                    </DropdownMenuItem>
                                    {availableFolders.map(folder => (
                                        <DropdownMenuItem key={folder} onClick={() => onFolderSelect(folder)}>
                                            <Folder className="w-3 h-3 mr-2" />
                                            {folder}
                                            {note.folder === folder && <span className="ml-auto text-primary">✓</span>}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className={cn("h-6 px-2 gap-1.5 text-xs font-normal transition-colors", note.relatedClassId && "text-primary bg-primary/10 hover:bg-primary/20")}>
                                        <BookOpen className="w-3.5 h-3.5 mr-1" />
                                        {relatedClass ? relatedClass.subject : 'No Class'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Link to Class</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {uniqueClasses.map(cls => (
                                        <DropdownMenuItem key={cls.id} onClick={() => onClassSelect(cls.id)}>
                                            {cls.subject}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="h-3 w-px bg-border/60" />

                        {/* Tags */}
                        <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            <div className="flex flex-wrap gap-1">
                                {note.tags?.map(tag => (
                                    <Badge key={tag} variant="secondary" className="h-5 px-1.5 gap-1 text-[10px] font-normal cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-200" onClick={() => onRemoveTag(tag)}>
                                        {tag}
                                    </Badge>
                                ))}
                                <Input
                                    value={tagInput}
                                    onChange={(e) => onTagInputChange(e.target.value)}
                                    onKeyDown={onTagAddCheck}
                                    className="h-5 w-16 text-[10px] border-none shadow-none focus-visible:ring-0 p-0 bg-transparent placeholder:text-muted-foreground/50 transition-all hover:w-20 focus:w-24"
                                    placeholder="+Tag..."
                                />
                            </div>
                        </div>
                    </div>
                </div>


                <div className="flex items-center gap-1 shrink-0">
                    {/* Focus Mode Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleFocusMode}
                        title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
                        className="text-muted-foreground hover:text-foreground transition-transform hover:scale-105"
                    >
                        {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onTogglePin}
                        className={cn("transition-all duration-300", note.isPinned ? "text-primary rotate-45" : "text-muted-foreground hover:text-foreground hover:-rotate-12")}
                        title={note.isPinned ? "Unpin Note" : "Pin Note"}
                    >
                        <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
                    </Button>

                    <div className="flex items-center gap-2 border-l pl-2 ml-1">
                        <div className="flex items-center justify-end w-16 px-2">
                            {isSaving ? (
                                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium animate-pulse">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Saving</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium transition-opacity duration-500">
                                    <Check className="w-3 h-3" />
                                    <span>Saved</span>
                                </div>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onDeleteClick} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Note
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to ensure strict equality checks on important props
    // We want to avoid re-renders if the only thing changing is the `note` object reference but not its relevant content
    // However, `note` updates from server might be relevant. 
    // Usually standard shallow compare from `memo` is enough if we make sure callbacks are stable.

    // For now, let's rely on standard shallow comparison but ensure our parent passes stable props used here.
    // If strict performance is needed we can implement custom check.
    return prevProps.note === nextProps.note &&
        prevProps.title === nextProps.title &&
        prevProps.isSaving === nextProps.isSaving &&
        prevProps.isFocusMode === nextProps.isFocusMode &&
        prevProps.tagInput === nextProps.tagInput &&
        prevProps.newFolderInput === nextProps.newFolderInput &&
        prevProps.note.updatedAt === nextProps.note.updatedAt &&
        prevProps.note.folder === nextProps.note.folder &&
        prevProps.note.tags === nextProps.note.tags &&
        prevProps.note.relatedClassId === nextProps.note.relatedClassId &&
        prevProps.note.isPinned === nextProps.note.isPinned;
});
