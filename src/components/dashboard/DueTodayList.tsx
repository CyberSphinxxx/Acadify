import { useState } from 'react';
import type { Task } from '@/types/task';
import type { ClassSession } from '@/types/schedule';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DueTodayListProps {
    overdueTasks: Task[];
    dueTodayTasks: Task[];
    classes: ClassSession[];
    onQuickAdd: (title: string) => Promise<void>;
}

export function DueTodayList({ overdueTasks, dueTodayTasks, classes, onQuickAdd }: DueTodayListProps) {
    const [quickTaskTitle, setQuickTaskTitle] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTaskTitle.trim()) return;
        await onQuickAdd(quickTaskTitle);
        setQuickTaskTitle('');
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Overdue Section - Conditionally rendered if there are overdue tasks */}
            {overdueTasks.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4 animate-in slide-in-from-right-2">
                    <h3 className="text-red-700 dark:text-red-400 font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Overdue Tasks
                    </h3>
                    <ScrollArea className="max-h-[150px]">
                        <div className="space-y-2">
                            {overdueTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3 bg-background p-2.5 rounded-lg border shadow-sm">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate text-sm">{task.title}</p>
                                        <p className="text-xs text-red-500">Due {format(task.dueDate!, 'MMM d')}</p>
                                    </div>
                                    <Badge variant="destructive" className="shrink-0 text-[10px]">Overdue</Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Due Today Section */}
            <div className="flex-1 flex flex-col min-h-0 bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-card/80 backdrop-blur">
                    <h2 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Due Today
                    </h2>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2 pr-4">
                        {dueTodayTasks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No tasks due today. <br /> clear sailing! ⛵
                            </div>
                        ) : (
                            dueTodayTasks.map(task => (
                                <div key={task.id} className="group flex items-center gap-3 bg-accent/20 hover:bg-accent/40 p-3 rounded-lg border transition-colors">
                                    <div className={cn(
                                        "w-1 h-8 rounded-full",
                                        task.priority === 'HIGH' ? 'bg-red-500' : task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{task.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{task.priority}</Badge>
                                            {task.relatedClassId && (
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                                                    {classes.find(c => c.id === task.relatedClassId)?.subject}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                                        <CheckCircle2 className="w-4 h-4 text-muted-foreground hover:text-green-600" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Quick Add */}
                <div className="p-4 border-t bg-card mt-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            placeholder="Add a task for today..."
                            value={quickTaskTitle}
                            onChange={e => setQuickTaskTitle(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!quickTaskTitle.trim()}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
