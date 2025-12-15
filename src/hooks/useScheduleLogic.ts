import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { scheduleService } from '@/services/scheduleService';
import type { ClassSession } from '@/types/schedule';
import { generateICS } from '@/lib/icsGenerator';
import { toast } from 'sonner';

export function useScheduleLogic() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Dialog State
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<{
        subject: string;
        code: string;
        sessions: ClassSession[];
    } | null>(null);

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
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (data: any) => {
        if (!user) return;
        try {
            // Check if sessions is array
            if (!data.sessions || !Array.isArray(data.sessions)) {
                toast.error("Invalid class data");
                return;
            }

            const classesToAdd = data.sessions.map((session: any) => ({
                userId: user.uid,
                subject: data.subject,
                code: data.code,
                instructor: data.instructor,
                color: data.color,
                dayOfWeek: parseInt(session.dayOfWeek),
                startTime: session.startTime,
                endTime: session.endTime,
                room: session.room
            }));

            await scheduleService.batchAddClasses(user.uid, classesToAdd);
            await loadClasses();
            toast.success("Class added successfully");
        } catch (error) {
            console.error("Failed to add class", error);
            toast.error("Failed to add class");
        }
    };

    const handleDeleteClass = async (classId: string) => {
        try {
            await scheduleService.deleteClass(classId);
            setClasses(prev => prev.filter(c => c.id !== classId));
            toast.success("Class session deleted");
        } catch (error) {
            console.error("Failed to delete class", error);
            toast.error("Failed to delete class session");
        }
    };

    const handleDeleteCourse = async (subject: string, code: string) => {
        try {
            const classesToDelete = classes.filter(c => c.subject === subject && c.code === code);
            const idsToDelete = classesToDelete.map(c => c.id);
            if (idsToDelete.length > 0) {
                await scheduleService.batchDeleteClasses(idsToDelete);
                setClasses(prev => prev.filter(c => !(c.subject === subject && c.code === code)));
                toast.success(`Deleted all sessions for ${subject}`);
            }
        } catch (error) {
            console.error("Failed to delete course", error);
            toast.error("Failed to delete course");
        }
    };

    const handleEditClass = (session: ClassSession) => {
        // Find all sessions for this course
        const courseSessions = classes.filter(c => c.subject === session.subject && c.code === session.code);
        setEditingCourse({
            subject: session.subject,
            code: session.code,
            sessions: courseSessions
        });
        setEditDialogOpen(true);
    };

    const handleEditCourseFromList = (course: { subject: string; code: string; sessions: ClassSession[] }) => {
        setEditingCourse(course);
        setEditDialogOpen(true);
    };

    const handleSaveCourse = async (data: any, initialSessions: ClassSession[]) => {
        if (!user) return;
        try {
            const courseSubject = data.subject;
            const courseCode = data.code;
            const courseColor = data.color;
            const courseInstructor = data.instructor;

            const existingIds = new Set(initialSessions.map(s => s.id));
            const keptIds = new Set<string>();

            const sessionsToUpdate: any[] = [];
            const sessionsToAdd: any[] = [];

            data.sessions.forEach((session: any) => {
                const sessionData = {
                    userId: user.uid,
                    subject: courseSubject,
                    code: courseCode,
                    instructor: courseInstructor,
                    color: courseColor,
                    dayOfWeek: parseInt(session.dayOfWeek),
                    startTime: session.startTime,
                    endTime: session.endTime,
                    room: session.room
                };

                if (session.id && existingIds.has(session.id)) {
                    sessionsToUpdate.push({ id: session.id, ...sessionData });
                    keptIds.add(session.id);
                } else {
                    sessionsToAdd.push(sessionData);
                }
            });

            const idsToDelete = initialSessions
                .filter(s => !keptIds.has(s.id))
                .map(s => s.id);

            // Execute updates
            const promises = [];

            if (idsToDelete.length > 0) {
                promises.push(scheduleService.batchDeleteClasses(idsToDelete));
            }

            if (sessionsToAdd.length > 0) {
                promises.push(scheduleService.batchAddClasses(user.uid, sessionsToAdd));
            }

            sessionsToUpdate.forEach(s => {
                promises.push(scheduleService.updateClass(s.id, s));
            });

            await Promise.all(promises);
            await loadClasses();
            toast.success("Course updated successfully");
        } catch (error) {
            console.error("Failed to update course", error);
            toast.error("Failed to update course");
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

    return {
        classes,
        loading,
        editDialogOpen,
        setEditDialogOpen,
        editingCourse,
        setEditingCourse,
        handleAddClass,
        handleDeleteClass,
        handleDeleteCourse,
        handleEditClass,
        handleEditCourseFromList,
        handleSaveCourse,
        handleExport
    };
}
