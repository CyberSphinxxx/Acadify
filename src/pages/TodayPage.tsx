import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useTaskStore } from '@/store/useTaskStore';
import { format, isSameDay, parse, isAfter } from 'date-fns';
import { StatCard } from '@/components/dashboard/StatCard';
import { TodayTimeline } from '@/components/dashboard/TodayTimeline';
import { DueTodayList } from '@/components/dashboard/DueTodayList';
import { Loader2, Calendar, AlertCircle, BookOpen, Flame } from 'lucide-react';

export default function TodayPage() {
    const { user } = useAuthStore();
    const { classes, fetchClasses, loading: loadingSchedule } = useScheduleStore();
    const { tasks, fetchTasks, addTask, loading: loadingTasks } = useTaskStore();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        if (!user) return;
        fetchClasses(user.uid);
        fetchTasks(user.uid);

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [user, fetchClasses, fetchTasks]);

    // Data Processing
    const today = new Date();
    const dayIndex = today.getDay();

    const overdueTasks = useMemo(() =>
        tasks.filter(t => t.status !== 'DONE' && t.dueDate && t.dueDate < today && !isSameDay(t.dueDate, today)),
        [tasks, today]);

    const dueTodayTasks = useMemo(() =>
        tasks.filter(t =>
            t.status !== 'DONE' &&
            (
                (t.dueDate && isSameDay(t.dueDate, today)) ||
                t.status === 'INBOX'
            )
        ).sort((a, b) => {
            // Sort: High Priority > Inbox > Others
            if (a.status === 'INBOX' && b.status !== 'INBOX') return -1;
            if (a.status !== 'INBOX' && b.status === 'INBOX') return 1;
            return 0; // Keep existing sort or improve
        }),
        [tasks, today]);

    const remainingClasses = useMemo(() => {
        return classes.filter(c => {
            if (c.dayOfWeek !== dayIndex) return false;
            // Parse time logic
            const endTime = parse(c.endTime, 'HH:mm', today);
            return isAfter(endTime, currentTime);
        }).length;
    }, [classes, dayIndex, currentTime, today]);


    // Handlers
    const handleQuickAdd = async (title: string) => {
        if (!user) return;
        try {
            await addTask({
                title,
                status: 'TODO',
                priority: 'MEDIUM',
                dueDate: new Date(),
                userId: user.uid,
            });
        } catch (error) {
            console.error("Failed to add task", error);
        }
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loadingSchedule || (loadingTasks && tasks.length === 0)) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background p-6 space-y-6 overflow-hidden">
            {/* Header */}
            <div className="shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {user?.displayName?.split(' ')[0] || 'Student'}</h1>
                <p className="text-muted-foreground text-lg">{format(today, 'EEEE, MMM d')}</p>
            </div>

            {/* Content Grid - Bento Box Layout */}
            <div className="flex-1 flex flex-col gap-6 min-h-0">
                {/* Section A: Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                    <StatCard
                        title="Tasks Due Today"
                        value={dueTodayTasks.length}
                        icon={Calendar}
                        intent={dueTodayTasks.length > 5 ? 'warning' : 'neutral'}
                    />
                    <StatCard
                        title="Overdue Tasks"
                        value={overdueTasks.length}
                        icon={AlertCircle}
                        intent={overdueTasks.length > 0 ? 'danger' : 'success'}
                    />
                    <StatCard
                        title="Classes Remaining"
                        value={remainingClasses}
                        icon={BookOpen}
                        intent="neutral"
                    />
                    <StatCard
                        title="Study Streak"
                        value="3 Days"
                        icon={Flame}
                        intent="success"
                        trend="Keep it up!"
                    />
                </div>

                {/* Section B: Main Action Area */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
                    {/* Left: Schedule (2/3 width on desktop) */}
                    <div className="md:col-span-2 min-h-0 flex flex-col">
                        <TodayTimeline classes={classes} />
                    </div>

                    {/* Right: Actions (1/3 width on desktop) */}
                    <div className="md:col-span-1 min-h-0 flex flex-col">
                        <DueTodayList
                            overdueTasks={overdueTasks}
                            dueTodayTasks={dueTodayTasks}
                            classes={classes}
                            onQuickAdd={handleQuickAdd}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
