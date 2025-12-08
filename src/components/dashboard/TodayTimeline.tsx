import { useMemo, useState, useEffect } from 'react';
import type { ClassSession } from '@/types/schedule';
import { format, parse, differenceInMinutes, isWithinInterval } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Coffee, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodayTimelineProps {
    classes: ClassSession[];
}

type TimelineItemType = 'CLASS' | 'FREE';

interface TimelineItem {
    type: TimelineItemType;
    startTime: Date;
    endTime: Date;
    data?: ClassSession;
    durationMinutes: number;
}

export function TodayTimeline({ classes }: TodayTimelineProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Derived States
    const today = new Date();
    const dayIndex = today.getDay();

    // 1. Filter Today's Classes & Sort
    const todayClasses = useMemo(() => {
        return classes
            .filter(c => c.dayOfWeek === dayIndex)
            .sort((a, b) => {
                const timeA = parse(a.startTime, 'HH:mm', new Date());
                const timeB = parse(b.startTime, 'HH:mm', new Date());
                return timeA.getTime() - timeB.getTime();
            });
    }, [classes, dayIndex]);

    // 2. Smart Timeline Algorithm
    const timeline = useMemo(() => {
        const items: TimelineItem[] = [];
        if (todayClasses.length === 0) return items;

        const parseTime = (timeStr: string) => parse(timeStr, 'HH:mm', today);

        for (let i = 0; i < todayClasses.length; i++) {
            const currentClass = todayClasses[i];
            const currentStart = parseTime(currentClass.startTime);
            const currentEnd = parseTime(currentClass.endTime);

            items.push({
                type: 'CLASS',
                startTime: currentStart,
                endTime: currentEnd,
                data: currentClass,
                durationMinutes: differenceInMinutes(currentEnd, currentStart)
            });

            if (i < todayClasses.length - 1) {
                const nextClass = todayClasses[i + 1];
                const nextStart = parseTime(nextClass.startTime);
                const gapMinutes = differenceInMinutes(nextStart, currentEnd);

                if (gapMinutes > 0) {
                    items.push({
                        type: 'FREE',
                        startTime: currentEnd,
                        endTime: nextStart,
                        durationMinutes: gapMinutes
                    });
                }
            }
        }
        return items;
    }, [todayClasses, today]);

    return (
        <div className="flex flex-col h-full min-h-0 bg-card/50 rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-card/80 backdrop-blur sticky top-0 z-10">
                <h2 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Today's Timeline
                </h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pr-4">
                    {todayClasses.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <Coffee className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p>No classes scheduled for today.</p>
                            <p className="text-sm">Enjoy your free time!</p>
                        </div>
                    ) : (
                        timeline.map((item, idx) => {
                            const isNow = isWithinInterval(currentTime, { start: item.startTime, end: item.endTime });

                            if (item.type === 'CLASS' && item.data) {
                                return (
                                    <Card key={`class-${idx}`} className={cn("relative transition-all", isNow ? "border-primary shadow-md ring-1 ring-primary/20" : "hover:border-primary/50")}>
                                        {isNow && <Badge className="absolute -top-2 -right-2 z-10 animate-pulse">Now</Badge>}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg" style={{ backgroundColor: item.data.color || '#3b82f6' }} />
                                        <CardContent className="p-4 pl-6">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-lg">{item.data.subject}</h3>
                                                <span className="text-sm font-medium font-mono text-muted-foreground">
                                                    {format(item.startTime, 'h:mm a')} - {format(item.endTime, 'h:mm a')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{item.data.room || 'No Room'}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            } else {
                                const isDeepFocus = item.durationMinutes >= 60;
                                const isQuickReview = item.durationMinutes <= 30;
                                const label = isDeepFocus ? 'Deep Focus Block' : isQuickReview ? 'Quick Review' : 'Free Block';
                                const Icon = isDeepFocus ? Zap : Coffee;

                                return (
                                    <div key={`free-${idx}`} className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-4 bg-muted/5 flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden group">
                                        {isNow && <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Current Time" />}
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Icon className="w-4 h-4" />
                                            <span className="font-medium">{label}</span>
                                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                                {item.durationMinutes} min
                                            </span>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-8 gap-2 bg-background hover:bg-primary hover:text-primary-foreground transition-colors">
                                            Start Session
                                        </Button>
                                    </div>
                                );
                            }
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
