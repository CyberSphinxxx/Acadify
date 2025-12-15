import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { SemesterSettingsDialog } from '@/components/features/schedule/SemesterSettingsDialog';
import { AddClassDialog } from '@/components/features/schedule/AddClassDialog';

interface ScheduleHeaderProps {
    onExport: () => void;
    hasClasses: boolean;
    onAddClass: (data: any) => Promise<void>;
}

export function ScheduleHeader({ onExport, hasClasses, onAddClass }: ScheduleHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Class Schedule</h1>
            <div className="flex items-center gap-2">
                <SemesterSettingsDialog />
                <Button variant="outline" size="sm" onClick={onExport} disabled={!hasClasses} className="hidden sm:flex">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
                <AddClassDialog onAddClass={onAddClass} />
            </div>
        </div>
    );
}
