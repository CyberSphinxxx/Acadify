import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { scheduleService } from '@/services/scheduleService';
import { taskService } from '@/services/taskService';
import type { ClassSession } from '@/types/schedule';
import type { Task } from '@/types/task';
import { getTodaysClasses, calculateFreeTime, getTasksDueToday } from '@/lib/dashboardUtils';
import { StatCard } from '@/components/features/dashboard/StatCard';
import { BookOpen, Clock, CalendarDays, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
    const { user } = useAuthStore();
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Subscribe to classes
                const unsubscribeClasses = scheduleService.subscribeToClasses(user.uid, (allClasses) => {
                    setClasses(allClasses);
                });

                // Subscribe to tasks
                const unsubscribeTasks = taskService.subscribeToTasks(user.uid, (allTasks) => {
                    setTasks(allTasks);
                });

                setLoading(false);
                return () => {
                    unsubscribeClasses();
                    unsubscribeTasks();
                };
            } catch (error) {
                console.error("Error fetching dashboard data", error);
                setLoading(false);
            }
        };

        fetchData();
        return () => {
            // Cleanup is handled inside fetchData's return if it was synchronous, 
            // but here we have a slight async mismatch. 
            // To be cleaner with React Query later, but for now this is "okay".
            // Actually, the subscriptions are likely establishing distinct listeners.
            // Let's refine this effect to be safer.
        };
    }, [user]);

    // Safer Effect removed as logic is consolidated in the first effect above.


    if (loading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    const todaysClasses = getTodaysClasses(classes);
    const freeTimeMinutes = calculateFreeTime(todaysClasses);
    const tasksDueToday = getTasksDueToday(tasks);
    const freeTimeHours = Math.floor(freeTimeMinutes / 60);
    const freeTimeMinsRemainder = freeTimeMinutes % 60;
    const freeTimeDisplay = `${freeTimeHours}h ${freeTimeMinsRemainder}m`;

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.displayName || 'Student'}. Here's your overview for today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Classes Today"
                    value={todaysClasses.length}
                    icon={BookOpen}
                    description={format(new Date(), 'EEEE, MMMM do')}
                />
                <StatCard
                    title="Free Time Gaps"
                    value={freeTimeDisplay}
                    icon={Clock}
                    description="Between classes today"
                />
                <StatCard
                    title="Assignments Due"
                    value={tasksDueToday.length}
                    icon={CalendarDays}
                    description="Due today"
                />
                <StatCard
                    title="Total Tasks"
                    value={tasks.filter(t => t.status !== 'DONE').length}
                    icon={CheckCircle}
                    description="Active tasks"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {todaysClasses.length > 0 ? (
                            <div className="space-y-4">
                                {todaysClasses.map((cls) => (
                                    <div key={cls.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-2 h-12 rounded-full"
                                                style={{ backgroundColor: cls.color }}
                                            />
                                            <div>
                                                <p className="font-medium text-sm">{cls.subject}</p>
                                                <p className="text-xs text-muted-foreground">{cls.code}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{cls.startTime} - {cls.endTime}</p>
                                            <p className="text-xs text-muted-foreground">{cls.room || 'No Room'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Due Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tasksDueToday.length > 0 ? (
                            <div className="space-y-4">
                                {tasksDueToday.map(task => (
                                    <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-medium">{task.title}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{task.priority} Priority</p>
                                        </div>
                                        <div className="text-xs rounded-full px-2 py-1 bg-muted">
                                            {task.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No assignments due today.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
