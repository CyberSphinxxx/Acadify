import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    defaultDropAnimationSideEffects,
    type DropAnimation
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types/task';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { AddTaskDialog } from './AddTaskDialog';

interface TaskBoardViewProps {
    tasks: Task[];
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function TaskBoardView({ tasks, onDelete, onUpdate }: TaskBoardViewProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const tasksByStatus = useMemo(() => {
        const acc: Record<TaskStatus, Task[]> = {
            INBOX: [],
            TODO: [],
            IN_PROGRESS: [],
            DONE: []
        };
        tasks.forEach(task => {
            if (acc[task.status]) {
                acc[task.status].push(task);
            }
        });
        return acc;
    }, [tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the task
        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine new status
        // If dropped on a column container
        let newStatus: TaskStatus | undefined;

        if (columns.includes(overId as TaskStatus)) {
            newStatus = overId as TaskStatus;
        } else {
            // Dropped on another task, find that task's status
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (newStatus && newStatus !== activeTask.status) {
            // Update via onUpdate prop
            try {
                await onUpdate(activeId, { status: newStatus });
            } catch (error) {
                console.error("Failed to move task", error);
            }
        }
    };

    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {columns.map(status => (
                    <div key={status} className="flex-1 min-w-[300px]">
                        <TaskColumn
                            id={status}
                            title={status.replace('_', ' ')}
                            tasks={tasksByStatus[status]}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            onEdit={setEditingTask}
                        />
                    </div>
                ))}
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask ? (
                        <TaskCard
                            task={activeTask}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            onEdit={setEditingTask}
                        />
                    ) : null}
                </DragOverlay>,
                document.body
            )}
            {createPortal(
                editingTask && (
                    <AddTaskDialog
                        open={!!editingTask}
                        onOpenChange={(open) => !open && setEditingTask(null)}
                        taskToEdit={editingTask}
                    />
                ),
                document.body
            )}
        </DndContext>
    );
}
