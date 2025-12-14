import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useState, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2,
    Pin, Tag, BookOpen, Clock, MoreVertical, Trash2, Folder, List, ListOrdered, MoveVertical,
    Maximize2, Minimize2
} from 'lucide-react';
import { noteService } from '@/services/noteService';
import { useScheduleStore } from '@/store/useScheduleStore';
import type { Note } from '@/types/note';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NoteEditorProps {
    note: Note;
    availableFolders?: string[];
}

// Custom Font Size Extension
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace('px', ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}px`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});

// Custom Line Height Extension
const LineHeight = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return {
            types: ['paragraph', 'heading'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: element => element.style.lineHeight,
                        renderHTML: attributes => {
                            if (!attributes.lineHeight) {
                                return {};
                            }
                            return {
                                style: `line-height: ${attributes.lineHeight}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setLineHeight: (lineHeight: any) => ({ commands }: any) => {
                return commands.updateAttributes(this.options.types[0], { lineHeight }) &&
                    commands.updateAttributes(this.options.types[1], { lineHeight });
            },
            unsetLineHeight: () => ({ commands }: any) => {
                return commands.resetAttributes(this.options.types[0], 'lineHeight') &&
                    commands.resetAttributes(this.options.types[1], 'lineHeight');
            },
        };
    },
});

export function NoteEditor({ note, availableFolders = [] }: NoteEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState(note.title);
    const [tagInput, setTagInput] = useState('');
    const [newFolderInput, setNewFolderInput] = useState(''); // For creating new folder
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);

    const { classes } = useScheduleStore();

    // Deduplicate classes by SUBJECT for the dropdown (to avoid multiple "Mobile Programming" entries)
    // Similar to NotesSidebar logic
    const uniqueClasses = classes.reduce((acc, current) => {
        const x = acc.find(item => item.subject === current.subject);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, [] as typeof classes).sort((a, b) => a.subject.localeCompare(b.subject));

    // Memoize handleSave for METADATA updates (Title, Tags, Folder, etc.)
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSave = useCallback((updates: Partial<Note>) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setIsSaving(true);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await noteService.updateNote(note.id, updates);
            } catch (error) {
                console.error("Auto-save failed", error);
            } finally {
                setIsSaving(false);
            }
        }, 1000);
    }, [note.id]);

    // Dedicated handler for CONTENT updates to prevent lag
    // Defer getHTML() execution and use a longer debounce (3000ms)
    const contentSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleContentUpdate = useCallback((editor: any) => {
        // Set saving state immediately (React will bail out if already true)
        setIsSaving(true);

        if (contentSaveTimeoutRef.current) {
            clearTimeout(contentSaveTimeoutRef.current);
        }

        contentSaveTimeoutRef.current = setTimeout(async () => {
            // Get HTML ONLY when we are actually ready to save
            const content = editor.getHTML();
            try {
                await noteService.updateNote(note.id, { content });
            } catch (error) {
                console.error("Content auto-save failed", error);
            } finally {
                setIsSaving(false);
            }
        }, 3000);
    }, [note.id]);

    // Editor configuration
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            FontSize,
            LineHeight,
            Placeholder.configure({
                placeholder: 'Start writing your note...',
            }),
        ],
        content: note.content,
        // ... rest of editor config
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8 pb-32 prose-p:my-1 prose-headings:my-2 prose-li:my-0.5',
            },
        },
        onUpdate: ({ editor }) => {
            handleContentUpdate(editor);
        },
    }, [note.id]); // Re-create editor only if note.id changes (rarely happens in this component lifecycle)

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

    const handleDelete = () => {
        setIsDeleteAlertOpen(true);
    };

    const toggleFocusMode = () => {
        setIsFocusMode(!isFocusMode);
    };

    const confirmDelete = async () => {
        try {
            await noteService.deleteNote(note.id);
        } catch (error) {
            console.error("Failed to delete note", error);
        } finally {
            setIsDeleteAlertOpen(false);
        }
    };

    if (!editor) return null;

    const relatedClass = classes.find(c => c.id === note.relatedClassId);

    return (
        <div className={cn(
            "flex flex-col h-full bg-background relative group transition-all duration-300",
            isFocusMode && "fixed inset-0 z-50 w-screen h-screen"
        )}>
            {/* Metadata Header */}
            <div className="px-8 pt-6 pb-2 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <Input
                            value={title}
                            onChange={handleTitleChange}
                            className="text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent"
                            placeholder="Untitled Note"
                        />
                        {/* Metadata Row - Cleaner Layout */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2" title="Last updated">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{isValid(new Date(note.updatedAt)) ? format(note.updatedAt, 'MMM d, h:mm a') : 'Just now'}</span>
                            </div>

                            <div className="h-3 w-px bg-border/60" />

                            {/* Folder & Class Info */}
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className={cn("h-6 px-2 gap-1.5 text-xs font-normal", note.folder && "text-primary bg-primary/5")}>
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className={cn("h-6 px-2 gap-1.5 text-xs font-normal", note.relatedClassId && "text-primary bg-primary/5")}>
                                            <BookOpen className="w-3.5 h-3.5 mr-1" />
                                            {relatedClass ? relatedClass.subject : 'No Class'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Link to Class</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {uniqueClasses.map(cls => (
                                            <DropdownMenuItem key={cls.id} onClick={() => handleClassSelect(cls.id)}>
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
                                        <Badge key={tag} variant="secondary" className="h-5 px-1.5 gap-1 text-[10px] font-normal cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors" onClick={() => removeTag(tag)}>
                                            {tag}
                                        </Badge>
                                    ))}
                                    <Input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        className="h-5 w-16 text-[10px] border-none shadow-none focus-visible:ring-0 p-0 bg-transparent placeholder:text-muted-foreground/50"
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
                            onClick={toggleFocusMode}
                            title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePin}
                            className={cn(note.isPinned ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                            title={note.isPinned ? "Unpin Note" : "Pin Note"}
                        >
                            <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
                        </Button>

                        <div className="flex items-center gap-2 border-l pl-2 ml-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 w-12 text-right font-medium">
                                {isSaving ? 'Saving' : 'Saved'}
                            </span>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Note
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="sticky top-0 z-10 px-8 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center gap-1 flex-wrap">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-muted' : ''}
                >
                    <Bold className="w-4 h-4" />
                </Button>

                {/* Font Size Selector */}
                <Select
                    value={editor.getAttributes('textStyle').fontSize || '16'}
                    onValueChange={(value) => editor.chain().focus().setFontSize(value).run()}
                >
                    <SelectTrigger className="h-7 w-[60px] text-xs px-2 border-none bg-transparent hover:bg-muted focus:ring-0">
                        <SelectValue placeholder="16" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="14">14</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="18">18</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                    </SelectContent>
                </Select>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-muted' : ''}
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    disabled={!editor.can().chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? 'bg-muted' : ''}
                >
                    <UnderlineIcon className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />

                {/* Line Height Selector */}
                <Select
                    value={editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight || 'Default'}
                    onValueChange={(value) => editor.chain().focus().setLineHeight(value === 'Default' ? (null as any) : value).run()}
                >
                    <SelectTrigger className="h-7 w-[60px] text-xs px-2 border-none bg-transparent hover:bg-muted focus:ring-0 gap-1">
                        <MoveVertical className="w-3 h-3 text-muted-foreground" />
                        <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="1">Single</SelectItem>
                        <SelectItem value="1.15">1.15</SelectItem>
                        <SelectItem value="1.5">1.5</SelectItem>
                        <SelectItem value="2">Double</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-px h-4 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                >
                    <ListOrdered className="w-4 h-4" />
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

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this note.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
