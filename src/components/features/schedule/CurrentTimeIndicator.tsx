import { useEffect, useState } from 'react';
import { differenceInMinutes, startOfDay, addHours } from 'date-fns';

interface CurrentTimeIndicatorProps {
    startHour: number;
    endHour: number;
}

export function CurrentTimeIndicator({ startHour, endHour: _endHour }: CurrentTimeIndicatorProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // Update time every minute
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Calculate position
    const calculatePosition = () => {
        const now = currentTime;
        const dayStart = addHours(startOfDay(now), startHour);
        const minutesSinceStart = differenceInMinutes(now, dayStart);

        // 100px per hour standard from ScheduleGrid
        const topPosition = (minutesSinceStart / 60) * 100;

        return topPosition;
    };

    const top = calculatePosition();
    // const totalHeight = (endHour - startHour + 1) * 100;

    // Only render if within schedule bounds - User requested it back, letting it overflow or stick
    // if (top < 0 || top > totalHeight) return null;

    return (
        <div
            className="absolute w-full flex items-center z-20 pointer-events-none group"
            style={{ top: `${top}px` }}
        >
            {/* Circle Indicator on Axis */}
            <div className="absolute -left-[5px] w-3 h-3 rounded-full bg-red-500 ring-2 ring-background shadow-sm" />

            {/* "Now" Label (visible on hover or always?) -> User requested just a circle, but a label is nice */}
            <div className="absolute -left-[45px] bg-red-500 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Now
            </div>

            {/* The Line */}
            <div className="w-full h-[2px] bg-red-500 shadow-sm" />
        </div>
    );
}
