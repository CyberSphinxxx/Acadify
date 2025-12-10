import { useDroppable } from '@dnd-kit/core';
import type { Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onDelete: (id: string) => void;
}

export function TaskColumn({ id, title, tasks, onDelete }: TaskColumnProps) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="flex flex-col h-full bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">
                {title} <span className="text-xs ml-1 bg-muted-foreground/20 px-2 py-0.5 rounded-full">{tasks.length}</span>
            </h3>

            <SortableContext id={id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className={cn("flex-1 min-h-[100px]", tasks.length === 0 && "border-2 border-dashed border-muted-foreground/20 rounded-lg")}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
