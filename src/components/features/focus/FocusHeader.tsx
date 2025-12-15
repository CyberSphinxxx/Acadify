import type { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes, isValid } from 'date-fns';

interface FocusHeaderProps {
    activeTask: Task;
    secondsElapsed: number;
    selectedTime: string;
    handleUpdateTitle: (newTitle: string) => void;
    handleUpdateDueDate: (date: Date | undefined) => void;
    handleUpdateTime: (time: string) => void;
    handleSaveExit: () => void;
    startTimer: (taskId: string) => void;
    pauseTimer: (task: Task) => void;
    formatTime: (seconds: number) => string;
}

export function FocusHeader({
    activeTask,
    secondsElapsed,
    selectedTime,
    handleUpdateTitle,
    handleUpdateDueDate,
    handleUpdateTime,
    handleSaveExit,
    startTimer,
    pauseTimer,
    formatTime
}: FocusHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                    <Input
                        className="text-3xl md:text-4xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 bg-transparent"
                        value={activeTask.title}
                        onChange={e => handleUpdateTitle(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm px-2 py-0.5">In Progress</Badge>
                        {activeTask.dueDate && isValid(new Date(activeTask.dueDate)) && (
                            <span className={cn("text-xs font-medium", new Date() > activeTask.dueDate ? "text-red-500" : "text-muted-foreground")}>
                                Due {format(activeTask.dueDate, "MMM d, h:mm a")}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={cn("hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm border shadow-sm transition-colors", activeTask.focusStartTime ? "bg-primary/10 border-primary/20" : "bg-muted/50")}>
                        <Clock className={cn("w-4 h-4", activeTask.focusStartTime ? "text-primary animate-pulse" : "text-muted-foreground")} />
                        {formatTime(secondsElapsed)}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2 bg-card border rounded-md p-1 shadow-sm">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className={cn("h-8 justify-start text-left font-normal", !activeTask.dueDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {activeTask.dueDate && isValid(new Date(activeTask.dueDate)) ? format(activeTask.dueDate, "MMM d, yyyy") : <span>Set Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={activeTask.dueDate ? new Date(activeTask.dueDate) : undefined}
                                onSelect={handleUpdateDueDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <div className="w-px h-4 bg-border" />

                    <Select value={selectedTime} onValueChange={handleUpdateTime}>
                        <SelectTrigger className="w-[100px] h-8 border-none focus:ring-0 shadow-none">
                            <SelectValue placeholder="Time" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 48 }).map((_, i) => {
                                const h = Math.floor(i / 2);
                                const m = i % 2 === 0 ? '00' : '30';
                                const time = `${h.toString().padStart(2, '0')}:${m}`;
                                return (
                                    <SelectItem key={time} value={time}>
                                        {format(setMinutes(setHours(new Date(), h), Number(m)), 'h:mm a')}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {/* Stop Focusing Button in Header */}
                {/* Timer Controls */}
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant={activeTask.focusStartTime ? "secondary" : "default"} // Visual feedback
                        size="sm"
                        onClick={() => activeTask.focusStartTime ? pauseTimer(activeTask) : startTimer(activeTask.id)}
                        className="gap-2"
                    >
                        {activeTask.focusStartTime ? (
                            <>
                                <div className="w-2 h-2 rounded-sm bg-current animate-pulse" /> {/* Pause Icon-ish */}
                                Pause Session
                            </>
                        ) : (
                            <>
                                <Clock className="w-4 h-4" />
                                Resume Session
                            </>
                        )}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={handleSaveExit} title="Exit Session">
                        <LogOut className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
