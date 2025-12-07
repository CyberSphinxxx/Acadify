import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading1, Heading2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Note } from '@/types/note';
import { noteService } from '@/services/noteService';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming we might need this or just custom logic

interface NoteEditorProps {
    note: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
    const [isSaving, setIsSaving] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your note...',
            }),
        ],
        content: note.content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            handleSave(editor.getHTML());
        },
    });

    // Update editor content if note changes externally (e.g. switching notes)
    useEffect(() => {
        if (editor && note.content !== editor.getHTML()) {
            editor.commands.setContent(note.content);
        }
    }, [note.id, editor]); // Only reset if ID changes to avoid cursor jumps on self-update

    // Custom debounce save logic
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSave = (content: string) => {
        setIsSaving(true);
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await noteService.updateNote(note.id, { content });
            } catch (error) {
                console.error("Auto-save failed", error);
            } finally {
                setIsSaving(false);
            }
        }, 1500); // 1.5s debounce
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col h-full border rounded-md shadow-sm bg-background">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b bg-muted/20">
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
                <div className="w-px h-6 bg-border mx-1" />
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

                <div className="ml-auto text-xs text-muted-foreground">
                    {isSaving ? 'Saving...' : 'Saved'}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
