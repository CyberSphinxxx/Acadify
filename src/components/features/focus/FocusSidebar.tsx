
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Layout, Target, Trash2, Clock, RotateCcw } from 'lucide-react';
import type { Task } from '@/types/task';

interface FocusSidebarProps {
    activeTaskId: string | null;
    focusedTasks: Task[];
    onSwitchSession: (id: string) => void;
    onNewSession: () => void;
    onDeleteFromArchive: (id: string, e: React.MouseEvent) => void;
    onReviveTask: (id: string, e: React.MouseEvent) => void;
}

export function FocusSidebar({
    activeTaskId,
    focusedTasks,
    onSwitchSession,
    onNewSession,
    onDeleteFromArchive,
    onReviveTask
}: FocusSidebarProps) {
    const activeSessions = focusedTasks.filter(t => t.status !== 'DONE');
    const archivedSessions = focusedTasks.filter(t => t.status === 'DONE');
    const [showArchive, setShowArchive] = useState(false);

    return (
        <div className="flex flex-col h-full bg-card border-r w-64 p-4 gap-4">
            <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <Layout className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">Focus Sessions</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
                {/* Active Sessions */}
                {activeSessions.map(task => (
                    <div
                        key={task.id}
                        onClick={() => onSwitchSession(task.id)}
                        className={cn(
                            "p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 border border-transparent",
                            activeTaskId === task.id ? "bg-muted border-primary/20 shadow-sm" : ""
                        )}
                    >
                        <div className="font-medium truncate">{task.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                            <span>{task.subtasks?.filter(s => s.completed).length || 0}/{task.subtasks?.length || 0} steps</span>
                            {/* Pulse if running */}
                            {task.focusStartTime && <Clock className="w-3 h-3 text-primary animate-pulse" />}
                        </div>
                    </div>
                ))}

                {activeSessions.length === 0 && !showArchive && (
                    <div className="text-sm text-muted-foreground text-center py-8 italic">
                        No active sessions.
                    </div>
                )}

                {/* Archive Toggle */}
                {archivedSessions.length > 0 && (
                    <div className="pt-4 border-t mt-2">
                        <button
                            onClick={() => setShowArchive(!showArchive)}
                            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-full hover:text-foreground mb-2"
                        >
                            <Target className="w-3 h-3" />
                            {showArchive ? 'Hide Archive' : `Archive (${archivedSessions.length})`}
                        </button>

                        {showArchive && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                {archivedSessions.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-3 rounded-lg bg-muted/20 border border-transparent opacity-70 hover:opacity-100 transition-all group relative"
                                    >
                                        <div className="font-medium truncate line-through decoration-muted-foreground/50">{task.title}</div>
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                                            <span>Finished</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-5 h-5 text-primary hover:bg-primary/10"
                                                    onClick={(e) => onReviveTask(task.id, e)}
                                                    title="Revive Task"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-5 h-5 text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => onDeleteFromArchive(task.id, e)}
                                                    title="Delete Permanently"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Button onClick={onNewSession} className="w-full gap-2" variant="outline">
                <Plus className="w-4 h-4" /> New Session
            </Button>
        </div>
    );
}
