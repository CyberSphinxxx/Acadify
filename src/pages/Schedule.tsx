import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { scheduleService } from '@/services/scheduleService';
import type { ClassSession } from '@/types/schedule';
import { ScheduleGrid } from '@/components/features/schedule/ScheduleGrid';
import { AddClassDialog } from '@/components/features/schedule/AddClassDialog';
import { Loader2 } from 'lucide-react';

export default function Schedule() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            loadClasses();
        }
    }, [user]);

    const loadClasses = async () => {
        try {
            if (!user) return;
            const data = await scheduleService.getClasses(user.uid);
            setClasses(data);
        } catch (error) {
            console.error("Failed to load classes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (data: any) => {
        if (!user) return;
        try {
            await scheduleService.addClass(user.uid, {
                ...data,
                dayOfWeek: parseInt(data.dayOfWeek) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
            });
            loadClasses();
        } catch (error) {
            console.error("Failed to add class", error);
        }
    };

    const handleDeleteClass = async (classId: string) => {
        try {
            await scheduleService.deleteClass(classId);
            setClasses(classes.filter(c => c.id !== classId));
        } catch (error) {
            console.error("Failed to delete class", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Class Schedule</h1>
                <AddClassDialog onAddClass={handleAddClass} />
            </div>

            <div className="flex-1 min-h-0">
                <ScheduleGrid classes={classes} onDeleteClass={handleDeleteClass} />
            </div>
        </div>
    )
}
