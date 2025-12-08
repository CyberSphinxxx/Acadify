import { generateICS } from '@/lib/icsGenerator';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SemesterSettingsDialog } from '@/components/features/schedule/SemesterSettingsDialog';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { scheduleService } from '@/services/scheduleService';
import type { ClassSession } from '@/types/schedule';
import { ScheduleGrid } from '@/components/features/schedule/ScheduleGrid';
import { AddClassDialog } from '@/components/features/schedule/AddClassDialog';

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

    const handleExport = () => {
        if (classes.length === 0) return;
        const icsString = generateICS(classes);
        const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'acadify_schedule.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                <div className="flex items-center gap-2">
                    <SemesterSettingsDialog />
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={classes.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Calendar
                    </Button>
                    <AddClassDialog onAddClass={handleAddClass} />
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ScheduleGrid classes={classes} onDeleteClass={handleDeleteClass} />
            </div>
        </div>
    )
}
