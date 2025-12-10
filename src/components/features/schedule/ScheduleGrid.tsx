import { useMemo, useEffect, useRef } from 'react';
import { differenceInMinutes, parse, startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { useScheduleStore } from '@/store/useScheduleStore';
import type { ClassSession } from '@/types/schedule';
import { DAYS_OF_WEEK } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
// Unused imports moved or removed in refactor
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ScheduleGridProps {
    classes: ClassSession[];
    onDeleteClass: (classId: string) => void;
    onEditClass: (classSession: ClassSession) => void;
}

const START_HOUR = 7; // 7 AM
const END_HOUR = 24;  // Midnight - Extended to accommodate late classes/viewing
const TIME_SLOTS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

interface PositionedClass extends ClassSession {
    top: number;
    height: number;
    left: number;
    width: number;
    zIndex: number;
}

export function ScheduleGrid({ classes, onDeleteClass, onEditClass }: ScheduleGridProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { currentSemester, addHoliday, removeHoliday } = useScheduleStore();

    // Auto-scroll to center current time on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            const now = new Date();
            const hour = now.getHours();

            if (hour < START_HOUR) {
                // Scroll to top
                scrollContainerRef.current.scrollTop = 0;
            } else if (hour > END_HOUR) {
                // Scroll to bottom
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            } else {
                // Scroll to current time (minus offset for context)
                const scrollPos = (hour - START_HOUR) * 100 - 200;
                scrollContainerRef.current.scrollTop = scrollPos > 0 ? scrollPos : 0;
            }
        }
    }, [classes]); // Re-run if classes change, or essentially on mount + updates

    const positionedClasses = useMemo(() => {
        const positioned: PositionedClass[] = [];

        DAYS_OF_WEEK.forEach((_, dayIndex) => {
            const daysClasses = classes
                .filter(c => c.dayOfWeek === dayIndex)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (daysClasses.length === 0) return;

            const dayStart = parse(`${START_HOUR}:00`, 'HH:mm', new Date());

            const sessionBlocks = daysClasses.map(session => {
                const start = parse(session.startTime, 'HH:mm', new Date());
                const end = parse(session.endTime, 'HH:mm', new Date());
                const duration = differenceInMinutes(end, start);
                const offset = differenceInMinutes(start, dayStart);

                return {
                    ...session,
                    startVals: offset,
                    endVals: offset + duration,
                    top: (offset / 60) * 100, // 100px per hour
                    height: (duration / 60) * 100
                };
            });

            const columns: any[][] = [];

            sessionBlocks.forEach(session => {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    const col = columns[i];
                    const lastInCol = col[col.length - 1];
                    if (session.startVals >= lastInCol.endVals) {
                        col.push(session);
                        (session as any).colIndex = i;
                        placed = true;
                        break;
                    }
                }

                if (!placed) {
                    columns.push([session]);
                    (session as any).colIndex = columns.length - 1;
                }
            });

            const maxCols = columns.length;

            sessionBlocks.forEach((session: any) => {
                positioned.push({
                    ...session,
                    left: (session.colIndex / maxCols) * 100,
                    width: 100 / maxCols,
                    zIndex: 10
                } as PositionedClass);
            });
        });

        return positioned;
    }, [classes]);

    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // 0 = Sunday
    const weekDates = DAYS_OF_WEEK.map((_, i) => addDays(startOfCurrentWeek, i));

    const handleDateContextMenu = (e: React.MouseEvent, date: Date) => {
        e.preventDefault();
        const isAlreadyHoliday = currentSemester?.holidays.some(h => isSameDay(h, date));
        if (isAlreadyHoliday) {
            removeHoliday(date);
        } else {
            addHoliday(date);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
            {/* Header (Days) */}
            <div className="grid grid-cols-[60px_1fr] border-b">
                <div className="p-2 border-r bg-muted/50"></div>
                <div className="grid grid-cols-7 divide-x">
                    {weekDates.map((date) => {
                        const isToday = isSameDay(date, today);
                        const isHoliday = currentSemester?.holidays.some(h => isSameDay(h, date));
                        return (
                            <div
                                key={date.toString()}
                                className={cn(
                                    "p-2 text-center text-sm font-medium bg-muted/50 truncate flex flex-col justify-center cursor-context-menu hover:bg-muted/80 transition-colors select-none",
                                    isToday && "bg-primary/5 text-primary",
                                    isHoliday && "bg-muted/80 text-muted-foreground line-through decoration-destructive"
                                )}
                                onContextMenu={(e) => handleDateContextMenu(e, date)}
                                title="Right-click to toggle holiday"
                            >
                                <span>{format(date, 'EEE')}</span>
                                <span className={cn("text-xs font-normal", isToday ? "text-primary/80" : "text-muted-foreground")}>
                                    {format(date, 'MMM d')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Grid Body */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto max-h-[800px] scroll-smooth">
                <div className="grid grid-cols-[60px_1fr] relative min-h-[1600px]">
                    {/* Time Labels Column */}
                    <div className="border-r bg-muted/10 divide-y relative">
                        {TIME_SLOTS.map(hour => (
                            <div key={hour} className="h-[100px] text-xs text-muted-foreground p-1 text-right relative">
                                <span className="-top-2 relative block">{hour}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns Container */}
                    <div className="grid grid-cols-7 divide-x relative">
                        {/* Live Time Indicator (Overlay) */}
                        <div className="absolute inset-x-0 h-full pointer-events-none z-10">
                            <CurrentTimeIndicator startHour={START_HOUR} endHour={END_HOUR} />
                        </div>

                        {weekDates.map((date, i) => {
                            const isHoliday = currentSemester?.holidays.some(h => isSameDay(h, date));

                            return (
                                <div key={date.toString()} className={cn("relative h-full", i % 2 === 0 ? "bg-background" : "bg-muted/5")}>
                                    {/* Horizontal Grid Lines */}
                                    {TIME_SLOTS.map(hour => (
                                        <div key={hour} className="h-[100px] border-b border-dashed border-border/50 w-full absolute top-0" style={{ top: `${(hour - START_HOUR) * 100}px` }}></div>
                                    ))}

                                    {/* Holiday Overlay */}
                                    {isHoliday && (
                                        <div className="absolute inset-0 bg-muted/80 z-20 flex flex-col items-center justify-center p-2 text-center select-none backdrop-blur-[1px]">
                                            <span className="font-bold text-muted-foreground/50 tracking-widest text-lg rotate-90 sm:rotate-0 whitespace-nowrap">
                                                NO CLASSES
                                            </span>
                                        </div>
                                    )}

                                    {/* Classes - Only Render if NOT a holiday */}
                                    {!isHoliday && positionedClasses.filter(c => c.dayOfWeek === i).map(session => (
                                        <HoverCard key={session.id}>
                                            <HoverCardTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "absolute rounded-md border p-1 text-xs shadow-sm overflow-hidden hover:z-50 hover:shadow-md transition-all cursor-pointer group hover:ring-2 hover:ring-primary/50",
                                                        "border-l-4"
                                                    )}
                                                    style={{
                                                        top: `${session.top}px`,
                                                        height: `${session.height}px`,
                                                        left: `${session.left}%`,
                                                        width: `${session.width}%`,
                                                        backgroundColor: `${session.color}20`,
                                                        borderLeftColor: session.color,
                                                        zIndex: session.zIndex,
                                                    }}
                                                >
                                                    <div className="font-bold truncate">{session.code}</div>
                                                    <div className="font-semibold truncate text-[10px] sm:text-xs">{session.subject}</div>
                                                    <div className="text-[10px] text-muted-foreground truncate">{session.startTime} - {session.endTime}</div>
                                                </div>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80 p-0 overflow-hidden" align="start" side="right">
                                                <div className="bg-muted p-4 border-b">
                                                    <h4 className="font-bold text-lg">{session.subject}</h4>
                                                    <span className="text-muted-foreground text-sm font-mono">{session.code}</span>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground text-xs block uppercase tracking-wider">Time</span>
                                                            <span className="font-medium">{session.startTime} - {session.endTime}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground text-xs block uppercase tracking-wider">Room</span>
                                                            <span className="font-medium">{session.room || "N/A"}</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-muted-foreground text-xs block uppercase tracking-wider">Instructor</span>
                                                            <span className="font-medium">{session.instructor || "Not assigned"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-2 bg-muted/30 border-t flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" className="h-8 gap-2 hover:text-primary" onClick={() => onEditClass(session)}>
                                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Class</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this session of {session.subject}?
                                                                    To delete the entire course, use the list view.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => onDeleteClass(session.id)}
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
