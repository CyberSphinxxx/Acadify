import type { Task, TaskPriority } from '@/types/task';
import { format, isToday, isThisWeek, isPast, isFuture } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';
import { Calendar, Circle } from 'lucide-react';

interface TaskListViewProps {
    tasks: Task[];
}

export function TaskListView({ tasks }: TaskListViewProps) {
    // Group tasks
    const groups = {
        Overdue: tasks.filter(t => t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate) && t.status !== 'DONE'),
        Today: tasks.filter(t => t.dueDate && isToday(t.dueDate) && t.status !== 'DONE'),
        'This Week': tasks.filter(t => t.dueDate && isThisWeek(t.dueDate) && !isToday(t.dueDate) && !isPast(t.dueDate) && t.status !== 'DONE'),
        Later: tasks.filter(t => (!t.dueDate || (isFuture(t.dueDate) && !isThisWeek(t.dueDate))) && t.status !== 'DONE'),
        Completed: tasks.filter(t => t.status === 'DONE')
    };

    const toggleComplete = async (task: Task) => {
        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        await taskService.updateTaskStatus(task.id, newStatus);
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'LOW': return 'bg-green-100 text-green-800 hover:bg-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 overflow-y-auto h-full pr-2">
            {Object.entries(groups).map(([title, groupTasks]) => (
                groupTasks.length > 0 && (
                    <div key={title} className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            {title === 'Overdue' && <Circle className="w-3 h-3 fill-red-500 text-red-500" />}
                            {title === 'Today' && <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />}
                            {title}
                            <span className="text-xs font-normal text-muted-foreground ml-auto">{groupTasks.length}</span>
                        </h3>
                        <div className="bg-card rounded-lg border shadow-sm divide-y">
                            {groupTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-4 p-3 hover:bg-accent/50 transition-colors group">
                                    <input
                                        type="checkbox"
                                        checked={task.status === 'DONE'}
                                        onChange={() => toggleComplete(task)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className={cn("text-sm font-medium truncate", task.status === 'DONE' && "line-through text-muted-foreground")}>
                                            {task.title}
                                        </div>
                                        {task.description && (
                                            <div className="text-xs text-muted-foreground truncate">
                                                {task.description}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className={cn("text-[10px]", getPriorityColor(task.priority))}>
                                            {task.priority}
                                        </Badge>

                                        {task.dueDate && (
                                            <div className={cn(
                                                "text-xs flex items-center gap-1",
                                                isPast(task.dueDate) && !isToday(task.dueDate) && task.status !== 'DONE' ? "text-red-500 font-medium" : "text-muted-foreground"
                                            )}>
                                                <Calendar className="w-3 h-3" />
                                                {format(task.dueDate, 'MMM d')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            ))}
        </div>
    );
}
