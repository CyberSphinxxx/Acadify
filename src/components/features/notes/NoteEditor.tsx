import { useEditor, EditorContent } from '@tiptap/react';
import { useCallback, useState, useRef, useMemo } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { noteService } from '@/services/noteService';
import { useScheduleStore } from '@/store/useScheduleStore';
import type { Note } from '@/types/note';
import { cn } from '@/lib/utils';
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
import { NoteHeader } from './NoteHeader';
import { NoteToolbar } from './NoteToolbar';

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
    const uniqueClasses = useMemo(() => {
        return classes.reduce((acc, current) => {
            const x = acc.find(item => item.subject === current.subject);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, [] as typeof classes).sort((a, b) => a.subject.localeCompare(b.subject));
    }, [classes]);

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
        // Set saving state immediately
        setIsSaving(true);

        if (contentSaveTimeoutRef.current) {
            clearTimeout(contentSaveTimeoutRef.current);
        }

        contentSaveTimeoutRef.current = setTimeout(async () => {
            // Get HTML ONLY when we are actually ready to save to avoid expensive computation during typing
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
    // We intentionally do NOT include 'note.content' in dependency array to avoid re-initializing editor on every keystroke
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
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8 pb-32 prose-p:my-1 prose-headings:my-2 prose-li:my-0.5',
            },
        },
        onUpdate: ({ editor }) => {
            handleContentUpdate(editor);
        },
    }, [note.id]); // Re-create editor only if different note is selected

    // --- Memoized Handlers for Header ---

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        handleSave({ title: newTitle });
    }, [handleSave]);

    const togglePin = useCallback(() => {
        // We use functional update or get latest from props? 
        // Note object changes when saved, so `note.isPinned` is fresh.
        handleSave({ isPinned: !note.isPinned });
    }, [handleSave, note.isPinned]);

    const handleClassSelect = useCallback((classId: string) => {
        handleSave({ relatedClassId: classId === 'none' ? null : classId });
    }, [handleSave]);

    const handleFolderSelect = useCallback((folderName: string | null) => {
        handleSave({ folder: folderName });
    }, [handleSave]);

    const handleCreateFolder = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newFolderInput.trim()) {
            e.preventDefault();
            handleSave({ folder: newFolderInput.trim() });
            setNewFolderInput('');
        }
    }, [newFolderInput, handleSave]);

    const handleAddTag = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            // Use note.tags directly or pass it safely? 
            // note.tags is safe to use here as we want latest state
            const newTags = [...(note.tags || []), tagInput.trim()];
            handleSave({ tags: newTags });
            setTagInput('');
        }
    }, [tagInput, note.tags, handleSave]);

    const removeTag = useCallback((tagToRemove: string) => {
        const newTags = (note.tags || []).filter(t => t !== tagToRemove);
        handleSave({ tags: newTags });
    }, [note.tags, handleSave]);

    const handleDelete = useCallback(() => {
        setIsDeleteAlertOpen(true);
    }, []);

    const toggleFocusMode = useCallback(() => {
        setIsFocusMode(prev => !prev);
    }, []);

    const confirmDelete = useCallback(async () => {
        try {
            await noteService.deleteNote(note.id);
        } catch (error) {
            console.error("Failed to delete note", error);
        } finally {
            setIsDeleteAlertOpen(false);
        }
    }, [note.id]);


    if (!editor) return null;

    const relatedClass = classes.find(c => c.id === note.relatedClassId);

    return (
        <div className={cn(
            "flex flex-col h-full bg-background relative group transition-all duration-300",
            isFocusMode && "fixed inset-0 z-50 w-screen h-screen"
        )}>
            {/* Metadata Header - Memoized */}
            <NoteHeader
                note={note}
                title={title}
                isSaving={isSaving}
                isFocusMode={isFocusMode}
                isDeleteAlertOpen={isDeleteAlertOpen}
                availableFolders={availableFolders}
                uniqueClasses={uniqueClasses}
                relatedClass={relatedClass}
                tagInput={tagInput}
                newFolderInput={newFolderInput}
                onTitleChange={handleTitleChange}
                onToggleFocusMode={toggleFocusMode}
                onTogglePin={togglePin}
                onDeleteClick={handleDelete}
                onFolderSelect={handleFolderSelect}
                onNewFolderInputCheck={handleCreateFolder}
                onNewFolderInputChange={setNewFolderInput}
                onClassSelect={handleClassSelect}
                onTagInputChange={setTagInput}
                onTagAddCheck={handleAddTag}
                onRemoveTag={removeTag}
            />

            {/* Toolbar - Memoized */}
            <NoteToolbar editor={editor} />

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
