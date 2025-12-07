import { useMemo } from 'react';
import { differenceInMinutes, parse } from 'date-fns';
import type { ClassSession } from '@/types/schedule';
import { DAYS_OF_WEEK } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';


interface ScheduleGridProps {
    classes: ClassSession[];
    onDeleteClass: (classId: string) => void;
}

const START_HOUR = 7; // 7 AM
const END_HOUR = 22;  // 10 PM
const TIME_SLOTS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

interface PositionedClass extends ClassSession {
    top: number;
    height: number;
    left: number;
    width: number;
    zIndex: number;
    isHovered?: boolean;
}

export function ScheduleGrid({ classes, onDeleteClass }: ScheduleGridProps) {
    const positionedClasses = useMemo(() => {
        const positioned: PositionedClass[] = [];

        DAYS_OF_WEEK.forEach((_, dayIndex) => {
            // 1. Filter classes for the day
            const daysClasses = classes
                .filter(c => c.dayOfWeek === dayIndex)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (daysClasses.length === 0) return;

            // 2. Calculate vertical position (top, height)
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

            // 3. Calculate horizontal overlap
            // Simple greedy coloring algorithm for column layout
            const columns: any[][] = [];

            sessionBlocks.forEach(session => {
                let placed = false;
                // Try to place in an existing column
                for (let i = 0; i < columns.length; i++) {
                    const col = columns[i];
                    // Check for collision with the last event in this column
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

            // We need a more sophisticated grouping to divide width equally
            // Find connected components (groups of overlapping events)
            // For simplicity in this iteration, we just divide by max columns found in the day roughly
            // Better approach: Sweep-line or interval coloring. 
            // Let's settle for a simplified "shared width" logic for now: 
            // width = 100% / max_overlaps_at_this_time. 
            // But calculating exact left offset is tricky without complex graph coloring.
            // 
            // Fallback: visual style overlap with slight offset.
            // or simple Column-based:

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


    return (
        <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
            {/* Header (Days) */}
            <div className="grid grid-cols-[60px_1fr] border-b">
                <div className="p-2 border-r bg-muted/50"></div>
                <div className="grid grid-cols-7 divide-x">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium bg-muted/50 truncate">
                            {day}
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid Body */}
            <div className="flex-1 overflow-y-auto max-h-[800px]">
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
                        {DAYS_OF_WEEK.map((day, i) => (
                            <div key={day} className="relative h-full odd:bg-muted/5">
                                {/* Horizontal Grid Lines */}
                                {TIME_SLOTS.map(hour => (
                                    <div key={hour} className="h-[100px] border-b border-dashed border-border/50 w-full absolute top-0" style={{ top: `${(hour - START_HOUR) * 100}px` }}></div>
                                ))}

                                {/* Classes */}
                                {positionedClasses.filter(c => c.dayOfWeek === i).map(session => (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            "absolute rounded-md border p-1 text-xs shadow-sm overflow-hidden hover:z-50 hover:shadow-md transition-all group",
                                            // approximate brightness check or just predefined style
                                            "border-l-4"
                                        )}
                                        style={{
                                            top: `${session.top}px`,
                                            height: `${session.height}px`,
                                            left: `${session.left}%`,
                                            width: `${session.width}%`,
                                            backgroundColor: `${session.color}20`, // 20% opacity background
                                            borderLeftColor: session.color,
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold truncate">{session.code}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteClass(session.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="font-semibold truncate text-[10px] sm:text-xs">{session.subject}</div>
                                        <div className="text-[10px] text-muted-foreground truncate">{session.startTime} - {session.endTime}</div>
                                        {session.room && <div className="text-[10px] truncate">{session.room}</div>}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
