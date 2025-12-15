import type { Task } from '@/types/task';
import type { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { FocusHeader } from './FocusHeader';
import { FocusTaskBreakdown } from './FocusTaskBreakdown';
import { FocusResources } from './FocusResources';
import { FocusNotebook } from './FocusNotebook';

interface FocusSessionProps {
    activeTask: Task;
    secondsElapsed: number;
    selectedTime: string;
    handleUpdateTitle: (newTitle: string) => void;
    handleUpdateDueDate: (date: Date | undefined) => void;
    handleUpdateTime: (time: string) => void;
    handleSaveExit: () => void;
    startTimer: (taskId: string) => void;
    pauseTimer: (task: Task) => void;
    formatTime: (seconds: number) => string;
    progress: number;
    subtaskInput: string;
    setSubtaskInput: (val: string) => void;
    handleAddSubtask: (e: React.FormEvent) => void;
    handleToggleSubtask: (subtaskId: string) => void;
    deleteSubtask: (subtaskId: string) => void;
    linkName: string;
    setLinkName: (val: string) => void;
    linkUrl: string;
    setLinkUrl: (val: string) => void;
    handleAddLink: (e: React.FormEvent) => void;
    removeLink: (index: number) => void;
    notes: Note[];
    viewMode: 'list' | 'editor';
    setViewMode: (mode: 'list' | 'editor') => void;
    activeNote: Note | null | undefined;
    setActiveNoteId: (id: string) => void;
    handleCreateNote: () => void;
    handleMarkDone: () => void;
}

export function FocusSession({
    activeTask,
    secondsElapsed,
    selectedTime,
    handleUpdateTitle,
    handleUpdateDueDate,
    handleUpdateTime,
    handleSaveExit,
    startTimer,
    pauseTimer,
    formatTime,
    progress,
    subtaskInput,
    setSubtaskInput,
    handleAddSubtask,
    handleToggleSubtask,
    deleteSubtask,
    linkName,
    setLinkName,
    linkUrl,
    setLinkUrl,
    handleAddLink,
    removeLink,
    notes,
    viewMode,
    setViewMode,
    activeNote,
    setActiveNoteId,
    handleCreateNote,
    handleMarkDone
}: FocusSessionProps) {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
                {/* Header Section */}
                <FocusHeader
                    activeTask={activeTask}
                    secondsElapsed={secondsElapsed}
                    selectedTime={selectedTime}
                    handleUpdateTitle={handleUpdateTitle}
                    handleUpdateDueDate={handleUpdateDueDate}
                    handleUpdateTime={handleUpdateTime}
                    handleSaveExit={handleSaveExit}
                    startTimer={startTimer}
                    pauseTimer={pauseTimer}
                    formatTime={formatTime}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Center: Subtasks (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <FocusTaskBreakdown
                            activeTask={activeTask}
                            progress={progress}
                            subtaskInput={subtaskInput}
                            setSubtaskInput={setSubtaskInput}
                            handleAddSubtask={handleAddSubtask}
                            handleToggleSubtask={handleToggleSubtask}
                            deleteSubtask={deleteSubtask}
                        />

                        {/* Resources Section */}
                        <FocusResources
                            activeTask={activeTask}
                            linkName={linkName}
                            setLinkName={setLinkName}
                            linkUrl={linkUrl}
                            setLinkUrl={setLinkUrl}
                            handleAddLink={handleAddLink}
                            removeLink={removeLink}
                        />
                    </div>

                    {/* Right: Notebook (5 cols) */}
                    <FocusNotebook
                        notes={notes}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        activeNote={activeNote}
                        setActiveNoteId={setActiveNoteId}
                        handleCreateNote={handleCreateNote}
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-8 border-t">
                    <Button variant="ghost" onClick={handleSaveExit}>
                        Save & Exit
                    </Button>
                    <Button size="lg" onClick={handleMarkDone} className="gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Mark Done
                    </Button>
                </div>
            </div>
        </div>
    );
}
