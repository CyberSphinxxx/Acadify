import type { ClassSession } from '@/types/schedule';
import { addDays, format, parse, startOfDay, getDay } from 'date-fns';

const formatICSDate = (date: Date): string => {
    return format(date, "yyyyMMdd'T'HHmmss");
};

export const generateICS = (classes: ClassSession[]): string => {
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Acadify//Schedule Export//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    const now = new Date();
    const currentDayIndex = getDay(now);

    classes.forEach((session) => {
        // Calculate the next occurrence date
        // session.dayOfWeek is 0 (Sunday) to 6 (Saturday)
        const dayDiff = (session.dayOfWeek - currentDayIndex + 7) % 7;
        const nextOccurrence = addDays(startOfDay(now), dayDiff);

        const startTime = parse(session.startTime, 'HH:mm', nextOccurrence);
        const endTime = parse(session.endTime, 'HH:mm', nextOccurrence);

        // If the calculated start time is in the past (e.g. earlier today), move to next week
        // Actually, for "Export", it's usually fine to start from "this week's occurrence" even if passed, 
        // or strictly next future occurrence. Let's stick to "upcoming or today".
        // If it's today and already passed, it might be better to show it for next week? 
        // Standard convention: Start from the nearest calculated date. Google Cal handles the past fine.

        const uid = `${session.id}-${format(now, 'yyyyMMdd')}@acadify.app`;

        icsContent.push(
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `SUMMARY:${session.subject} (${session.code})`,
            `DTSTART:${formatICSDate(startTime)}`,
            `DTEND:${formatICSDate(endTime)}`,
            `RRULE:FREQ=WEEKLY`, // Repeats weekly
            `LOCATION:${session.room || 'TBD'}`,
            `DESCRIPTION:Instructor: ${session.instructor || 'N/A'}`,
            'STATUS:CONFIRMED',
            `DTSTAMP:${formatICSDate(now)}`,
            'END:VEVENT'
        );
    });

    icsContent.push('END:VCALENDAR');

    return icsContent.join('\r\n');
};
