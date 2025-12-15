import { memo, useEffect, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2,
    List, ListOrdered, MoveVertical
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NoteToolbarProps {
    editor: Editor | null;
}

export const NoteToolbar = memo(function NoteToolbar({ editor }: NoteToolbarProps) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
            forceUpdate();
        };

        editor.on('transaction', handleUpdate);
        editor.on('selectionUpdate', handleUpdate);

        return () => {
            editor.off('transaction', handleUpdate);
            editor.off('selectionUpdate', handleUpdate);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <TooltipProvider delayDuration={300}>
            <div className="sticky top-0 z-10 px-8 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center gap-1 flex-wrap animate-in slide-in-from-top-2 duration-300">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            disabled={!editor.can().chain().focus().toggleBold().run()}
                            className={editor.isActive('bold') ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'}
                        >
                            <Bold className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bold (Cmd+B)</TooltipContent>
                </Tooltip>

                {/* Font Size Selector */}
                <Select
                    value={editor.getAttributes('textStyle').fontSize || '16'}
                    onValueChange={(value) => editor.chain().focus().setFontSize(value).run()}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SelectTrigger className="h-7 w-[60px] text-xs px-2 border-none bg-transparent hover:bg-muted/80 focus:ring-0 text-muted-foreground hover:text-foreground transition-colors">
                                <SelectValue placeholder="16" />
                            </SelectTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Font Size</TooltipContent>
                    </Tooltip>
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

                <div className="w-px h-4 bg-border/60 mx-1" />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            disabled={!editor.can().chain().focus().toggleItalic().run()}
                            className={editor.isActive('italic') ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'}
                        >
                            <Italic className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Italic (Cmd+I)</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            disabled={!editor.can().chain().focus().toggleUnderline().run()}
                            className={editor.isActive('underline') ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'}
                        >
                            <UnderlineIcon className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Underline (Cmd+U)</TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border/60 mx-1" />

                {/* Line Height Selector */}
                <Select
                    value={editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight || 'Default'}
                    onValueChange={(value) => editor.chain().focus().setLineHeight(value === 'Default' ? (null as any) : value).run()}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SelectTrigger className="h-7 w-[60px] text-xs px-2 border-none bg-transparent hover:bg-muted/80 focus:ring-0 gap-1 text-muted-foreground hover:text-foreground transition-colors">
                                <MoveVertical className="w-3 h-3 text-muted-foreground" />
                                <SelectValue placeholder="-" />
                            </SelectTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Line Height</TooltipContent>
                    </Tooltip>
                    <SelectContent>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="1">Single</SelectItem>
                        <SelectItem value="1.15">1.15</SelectItem>
                        <SelectItem value="1.5">1.5</SelectItem>
                        <SelectItem value="2">Double</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-px h-4 bg-border/60 mx-1" />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={editor.isActive('bulletList') ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bullet List</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={editor.isActive('orderedList') ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'}
                        >
                            <ListOrdered className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ordered List</TooltipContent>
                </Tooltip>

                <div className="w-px h-4 bg-border/60 mx-1" />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'}
                        >
                            <Heading1 className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Heading 1</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'}
                        >
                            <Heading2 className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Heading 2</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
});
