import type { ClassSession } from '@/types/schedule';
import type { Task } from '@/types/task';
import { differenceInMinutes, isSameDay, parse, startOfDay } from 'date-fns';

/**
 * Get classes for the current day of the week.
 * @param classes All class sessions
 * @returns Filtered list of classes for today
 */
export const getTodaysClasses = (classes: ClassSession[]): ClassSession[] => {
    const today = new Date().getDay(); // 0 (Sunday) - 6 (Saturday)
    // Adjust logic if ClassSession dayOfWeek uses different indexing (0-6 usually matches)
    // Our type uses 0-6.
    return classes.filter(c => c.dayOfWeek === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
};

/**
 * Calculate total free time (in minutes) between classes for today.
 * Assumes classes are for the same day.
 * @param todaysClasses Sorted list of today's classes
 * @returns Total minutes of free time between first and last class
 */
export const calculateFreeTime = (todaysClasses: ClassSession[]): number => {
    if (todaysClasses.length <= 1) return 0;

    let freeTime = 0;
    const now = new Date();
    // const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD - Unused

    // Helper to converting "HH:mm" to Date object for today
    const getTimeDate = (timeStr: string) => {
        return parse(timeStr, 'HH:mm', now);
    };

    for (let i = 0; i < todaysClasses.length - 1; i++) {
        const currentClassEnd = getTimeDate(todaysClasses[i].endTime);
        const nextClassStart = getTimeDate(todaysClasses[i + 1].startTime);

        // Calculate gap
        const diff = differenceInMinutes(nextClassStart, currentClassEnd);
        if (diff > 0) {
            freeTime += diff;
        }
    }

    return freeTime;
};

/**
 * Get tasks due today.
 * @param tasks All tasks
 * @returns Tasks with dueDate being today
 */
export const getTasksDueToday = (tasks: Task[]): Task[] => {
    const today = startOfDay(new Date());
    return tasks.filter(t => {
        if (!t.dueDate) return false;
        return isSameDay(t.dueDate, today);
    });
};

/**
 * Calculate the current study streak in days.
 * A streak is defined as consecutive days (ending today or yesterday) with activity.
 * @param dates Array of activity dates (created/updated timestamps)
 * @returns Number of days in the current streak
 */
export const calculateStreak = (dates: Date[]): number => {
    if (dates.length === 0) return 0;

    // 1. Normalize all dates to start of day strings to remove time & duplicates easily
    const uniqueDays = Array.from(new Set(
        dates.map(d => startOfDay(d).toISOString())
    )).sort().reverse(); // Descending order: Today, Yesterday, ...

    if (uniqueDays.length === 0) return 0;

    const today = startOfDay(new Date());
    const yesterday = startOfDay(new Date(Date.now() - 86400000));

    // 2. Check if the most recent activity is today or yesterday. 
    // If last activity was 2 days ago, streak is broken -> 0.
    const lastActivity = new Date(uniqueDays[0]);

    if (!isSameDay(lastActivity, today) && !isSameDay(lastActivity, yesterday)) {
        return 0;
    }

    // 3. Count consecutive days
    const latestDayStr = uniqueDays[0];
    const latestDay = new Date(latestDayStr);

    let streak = 1;
    let previousDate = latestDay; // Start from the most recent one we found

    for (let i = 1; i < uniqueDays.length; i++) {
        const currentDate = new Date(uniqueDays[i]);

        const expectedDate = new Date(previousDate);
        expectedDate.setDate(previousDate.getDate() - 1);

        if (isSameDay(currentDate, expectedDate)) {
            streak++;
            previousDate = currentDate;
        } else {
            break; // Streak broken
        }
    }

    return streak;
};
