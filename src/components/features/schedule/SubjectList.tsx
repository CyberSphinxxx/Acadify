import { DAYS_OF_WEEK } from "@/types/schedule";
import type { ClassSession } from "@/types/schedule";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Clock, MapPin } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SubjectListProps {
    classes: ClassSession[];
    onEdit: (course: { subject: string; code: string; sessions: ClassSession[] }) => void;
    onDelete: (subject: string, code: string) => void;
}

export function SubjectList({ classes, onEdit, onDelete }: SubjectListProps) {
    // Group classes by subject and code to form "Courses"
    const courses = classes.reduce((acc, curr) => {
        const key = `${curr.subject}-${curr.code}`;
        if (!acc[key]) {
            acc[key] = {
                subject: curr.subject,
                code: curr.code,
                instructor: curr.instructor,
                color: curr.color,
                sessions: [] as ClassSession[]
            };
        }
        acc[key].sessions.push(curr);
        return acc;
    }, {} as Record<string, { subject: string; code: string; instructor?: string; color: string; sessions: ClassSession[] }>);

    const sortedCourses = Object.values(courses).sort((a, b) => a.subject.localeCompare(b.subject));

    if (sortedCourses.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                No classes added yet. Click "Add Class" to get started.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedCourses.map((course) => (
                <Card key={`${course.subject}-${course.code}`} className="overflow-hidden">
                    <div className="flex items-center border-l-4" style={{ borderLeftColor: course.color }}>
                        <div className="flex-1 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-lg">{course.subject}</h3>
                                    <p className="text-sm text-muted-foreground">{course.code} {course.instructor && `• ${course.instructor}`}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(course)}
                                    >
                                        <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete {course.subject} ({course.code})? This will remove all scheduled sessions for this course.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(course.subject, course.code)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {course.sessions.map((session) => (
                                    <div key={session.id} className="flex items-center text-sm bg-muted/50 p-2 rounded relative">
                                        <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                                        <span className="font-medium mr-2">{DAYS_OF_WEEK[session.dayOfWeek]}</span>
                                        <span>{session.startTime} - {session.endTime}</span>
                                        {session.room && (
                                            <>
                                                <MapPin className="h-3 w-3 ml-3 mr-1 text-muted-foreground" />
                                                <span className="text-muted-foreground">{session.room}</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
