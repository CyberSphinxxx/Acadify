import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // We might need to adjust Card imports if we want tighter control
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types/task';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
    task: Task;
    onDelete: (id: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-500 hover:bg-red-600';
            case 'MEDIUM': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'LOW': return 'bg-green-500 hover:bg-green-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 touch-none group relative">
            <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium leading-tight">
                            {task.title}
                        </CardTitle>
                        <Badge className={cn("text-[10px] px-1.5 py-0", getPriorityColor(task.priority))}>
                            {task.priority}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {task.description}
                        </p>
                    )}
                    {task.dueDate && (
                        <div className="text-xs text-muted-foreground flex items-center">
                            Due: {isValid(new Date(task.dueDate)) ? format(task.dueDate, 'MMM d') : 'Invalid Date'}
                        </div>
                    )}
                </CardContent>

                {/* Delete Button (Visible on Hover) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive bg-background/50 backdrop-blur-sm"
                        onPointerDown={(e) => {
                            // Using onPointerDown to capture event before drag starts
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
