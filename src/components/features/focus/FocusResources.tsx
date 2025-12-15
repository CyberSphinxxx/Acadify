import type { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link as LinkIcon, ExternalLink, Trash2, Plus } from 'lucide-react';

interface FocusResourcesProps {
    activeTask: Task;
    linkName: string;
    setLinkName: (val: string) => void;
    linkUrl: string;
    setLinkUrl: (val: string) => void;
    handleAddLink: (e: React.FormEvent) => void;
    removeLink: (index: number) => void;
}

export function FocusResources({
    activeTask,
    linkName,
    setLinkName,
    linkUrl,
    setLinkUrl,
    handleAddLink,
    removeLink
}: FocusResourcesProps) {
    return (
        <div className="pt-4 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Resources
            </h2>
            <div className="flex flex-wrap gap-2">
                {activeTask.resourceLinks?.map((link, index) => (
                    <div key={index} className="flex items-center gap-1 bg-background border shadow-sm text-foreground px-3 py-1.5 rounded-full text-sm group hover:border-primary/50 transition-colors">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline max-w-[200px] truncate">
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            {link.name}
                        </a>
                        <button onClick={() => removeLink(index)} className="ml-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddLink} className="flex gap-2">
                <Input
                    placeholder="Title"
                    className="flex-1 h-9"
                    value={linkName}
                    onChange={e => setLinkName(e.target.value)}
                />
                <Input
                    placeholder="URL"
                    className="flex-[2] h-9"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                />
                <Button type="submit" size="sm" variant="secondary" disabled={!linkName.trim() || !linkUrl.trim()}>
                    <Plus className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
