import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    startOfDay,
    isValid
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task';
import { AddTaskDialog } from './AddTaskDialog';

interface TaskCalendarViewProps {
    tasks: Task[];
}

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Fill in days to complete the grid (start from Sunday)
    const startDay = monthStart.getDay();
    const prefixDays = Array.from({ length: startDay }, (_, i) => i);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsAddDialogOpen(true);
    };

    const getTasksForDate = (date: Date) => {
        return tasks.filter(task => {
            if (!task.dueDate || !isValid(task.dueDate)) return false;
            // Normalize both to start of day for accurate comparison
            return isSameDay(startOfDay(task.dueDate), startOfDay(date));
        });
    };

    return (
        <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm">
            <div className="p-4 flex items-center justify-between border-b">
                <h2 className="text-lg font-semibold">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b bg-muted/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground uppercase">
                        {day}
                    </div>
                ))}
            </div>

            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {prefixDays.map(i => (
                    <div key={`prefix-${i}`} className="border-b border-r bg-muted/20" />
                ))}

                {days.map(day => {
                    const dayTasks = getTasksForDate(day);
                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "group relative min-h-[100px] border-b border-r p-2 transition-colors hover:bg-accent/50 cursor-pointer",
                                isDayToday && "bg-accent/20"
                            )}
                            onClick={() => handleDateClick(day)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={cn(
                                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                    isDayToday ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="space-y-1">
                                {dayTasks.slice(0, 3).map(task => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded truncate font-medium",
                                            task.priority === 'HIGH' ? "bg-red-100 text-red-700" :
                                                task.priority === 'MEDIUM' ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-blue-100 text-blue-700",
                                            task.status === 'DONE' && "opacity-50 line-through"
                                        )}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground pl-1">
                                        +{dayTasks.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <AddTaskDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                defaultDate={selectedDate || undefined}
            />
        </div>
    );
}
