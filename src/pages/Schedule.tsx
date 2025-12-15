import { Loader2, List, Calendar as CalendarIcon } from 'lucide-react';
import { ScheduleGrid } from '@/components/features/schedule/ScheduleGrid';
import { SubjectList } from '@/components/features/schedule/SubjectList';
import { EditClassDialog } from '@/components/features/schedule/EditClassDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScheduleLogic } from '@/hooks/useScheduleLogic';
import { ScheduleHeader } from '@/components/features/schedule/ScheduleHeader';

export default function Schedule() {
    const {
        classes,
        loading,
        editDialogOpen,
        setEditDialogOpen,
        editingCourse,
        handleAddClass,
        handleDeleteClass,
        handleDeleteCourse,
        handleEditClass,
        handleEditCourseFromList,
        handleSaveCourse,
        handleExport
    } = useScheduleLogic();

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <ScheduleHeader
                onExport={handleExport}
                hasClasses={classes.length > 0}
                onAddClass={handleAddClass}
            />

            <Tabs defaultValue="calendar" className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="calendar" className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" /> Calendar
                        </TabsTrigger>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" /> Subjects
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="calendar" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden h-full">
                    <ScheduleGrid
                        classes={classes}
                        onDeleteClass={handleDeleteClass}
                        onEditClass={handleEditClass}
                    />
                </TabsContent>

                <TabsContent value="list" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden overflow-y-auto">
                    <SubjectList
                        classes={classes}
                        onEdit={handleEditCourseFromList}
                        onDelete={handleDeleteCourse}
                    />
                </TabsContent>
            </Tabs>

            <EditClassDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                course={editingCourse}
                onSave={handleSaveCourse}
            />
        </div>
    )
}

