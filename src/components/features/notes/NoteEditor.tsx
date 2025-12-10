import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Bold, Italic, Heading1, Heading2,
    Pin, Tag, BookOpen, Clock, MoreVertical, Trash2, Folder
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Note } from '@/types/note';
import { noteService } from '@/services/noteService';
import { useScheduleStore } from '@/store/useScheduleStore';
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

interface NoteEditorProps {
    note: Note;
    availableFolders?: string[];
}

export function NoteEditor({ note, availableFolders = [] }: NoteEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [tagInput, setTagInput] = useState('');
    const [newFolderInput, setNewFolderInput] = useState(''); // For creating new folder

    const { classes } = useScheduleStore();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your note...',
            }),
        ],
        content: note.content,
        // ... rest of editor config
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            handleSave({ content: editor.getHTML() });
        },
    });

    // ... (keep usage of useEffect, useRef etc)
    // Sync local state when note prop changes
    useEffect(() => {
        setTitle(note.title);
        if (editor && note.content !== editor.getHTML()) {
            editor.commands.setContent(note.content);
        }
    }, [note.id, editor]);

    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSave = (updates: Partial<Note>) => {
        setIsSaving(true);
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await noteService.updateNote(note.id, updates);
            } catch (error) {
                console.error("Auto-save failed", error);
            } finally {
                setIsSaving(false);
            }
        }, 1000);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        handleSave({ title: newTitle });
    };

    const togglePin = () => {
        handleSave({ isPinned: !note.isPinned });
    };

    const handleClassSelect = (classId: string) => {
        handleSave({ relatedClassId: classId === 'none' ? null : classId });
    };

    const handleFolderSelect = (folderName: string | null) => {
        handleSave({ folder: folderName });
    };

    const handleCreateFolder = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newFolderInput.trim()) {
            e.preventDefault();
            handleSave({ folder: newFolderInput.trim() });
            setNewFolderInput('');
        }
    }

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            const newTags = [...(note.tags || []), tagInput.trim()];
            handleSave({ tags: newTags });
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = (note.tags || []).filter(t => t !== tagToRemove);
        handleSave({ tags: newTags });
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this note?")) {
            await noteService.deleteNote(note.id);
        }
    };

    if (!editor) return null;

    const relatedClass = classes.find(c => c.id === note.relatedClassId);

    return (
        <div className="flex flex-col h-full bg-background relative group">
            {/* Metadata Header */}
            <div className="px-8 pt-6 pb-2 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <Input
                        value={title}
                        onChange={handleTitleChange}
                        className="text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                        placeholder="Untitled Note"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground w-16 text-right">
                            {isSaving ? 'Saving...' : 'Saved'}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Note
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{isValid(new Date(note.updatedAt)) ? format(note.updatedAt, 'MMM d, h:mm a') : 'Just now'}</span>
                    </div>

                    <div className="h-4 w-px bg-border" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePin}
                        className={cn("h-7 px-2 gap-1.5", note.isPinned && "text-primary bg-primary/10")}
                    >
                        <Pin className={cn("w-3.5 h-3.5", note.isPinned && "fill-current")} />
                        {note.isPinned ? 'Pinned' : 'Pin'}
                    </Button>

                    <div className="h-4 w-px bg-border" />

                    {/* Folder Selection */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className={cn("h-7 px-2 gap-1.5", note.folder && "text-primary bg-primary/10")}>
                                <Folder className={cn("w-3.5 h-3.5", note.folder && "fill-current")} />
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
                                    onChange={(e) => setNewFolderInput(e.target.value)}
                                    onKeyDown={handleCreateFolder}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleFolderSelect(null)}>
                                <span className="italic text-muted-foreground">None</span>
                            </DropdownMenuItem>
                            {availableFolders.map(folder => (
                                <DropdownMenuItem key={folder} onClick={() => handleFolderSelect(folder)}>
                                    <Folder className="w-3 h-3 mr-2" />
                                    {folder}
                                    {note.folder === folder && <span className="ml-auto text-primary">✓</span>}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-px bg-border" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className={cn("h-7 px-2 gap-1.5", note.relatedClassId && "text-primary bg-primary/10")}>
                                <BookOpen className="w-3.5 h-3.5" />
                                {relatedClass ? relatedClass.subject : 'Add Class'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Link to Class</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleClassSelect('none')}>None</DropdownMenuItem>
                            {classes.map(cls => (
                                <DropdownMenuItem key={cls.id} onClick={() => handleClassSelect(cls.id)}>
                                    {cls.subject}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-px bg-border" />

                    <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" />
                        <div className="flex flex-wrap gap-1">
                            {note.tags?.map(tag => (
                                <Badge key={tag} variant="secondary" className="h-5 px-1.5 gap-1 text-[10px] font-normal cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeTag(tag)}>
                                    {tag}
                                </Badge>
                            ))}
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="h-5 w-20 text-[10px] border-none shadow-none focus-visible:ring-0 p-0 min-w-[3rem]"
                                placeholder="+ Tag"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="sticky top-0 z-10 px-8 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-muted' : ''}
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-muted' : ''}
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                >
                    <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                >
                    <Heading2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
