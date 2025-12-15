import type { Task } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusTaskBreakdownProps {
    activeTask: Task;
    progress: number;
    subtaskInput: string;
    setSubtaskInput: (val: string) => void;
    handleAddSubtask: (e: React.FormEvent) => void;
    handleToggleSubtask: (subtaskId: string) => void;
    deleteSubtask: (subtaskId: string) => void;
}

export function FocusTaskBreakdown({
    activeTask,
    progress,
    subtaskInput,
    setSubtaskInput,
    handleAddSubtask,
    handleToggleSubtask,
    deleteSubtask
}: FocusTaskBreakdownProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold flex items-center justify-between">
                    Task Breakdown
                    <span className="text-xs font-normal text-muted-foreground">{Math.round(progress)}% Complete</span>
                </h2>
                <Progress value={progress} className="h-2" />
            </div>

            <Card className="border-muted/50 shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                        {activeTask.subtasks?.map(subtask => (
                            <div key={subtask.id} className="group flex items-center gap-3 p-3 bg-muted/20 hover:bg-muted/40 rounded-lg transition-colors border border-transparent hover:border-border">
                                <div
                                    className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all", subtask.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground hover:border-primary")}
                                    onClick={() => handleToggleSubtask(subtask.id)}
                                >
                                    {subtask.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                                <span className={cn("flex-1 text-sm pt-0.5 font-medium", subtask.completed && "line-through text-muted-foreground font-normal")}>
                                    {subtask.title}
                                </span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteSubtask(subtask.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ))}
                        {(!activeTask.subtasks || activeTask.subtasks.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground text-sm italic border-2 border-dashed rounded-lg bg-muted/10">
                                No subtasks yet. Break your goal down into smaller steps.
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleAddSubtask} className="flex gap-2 relative">
                        <Input
                            placeholder="Add a step..."
                            className="h-11 pr-10"
                            value={subtaskInput}
                            onChange={e => setSubtaskInput(e.target.value)}
                        />
                        <Button type="submit" size="sm" className="absolute right-1 top-1 h-9 w-9 p-0" disabled={!subtaskInput.trim()}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
