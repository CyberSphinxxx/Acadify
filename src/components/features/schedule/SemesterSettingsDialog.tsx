import { useState } from 'react';
import { useScheduleStore } from '@/store/useScheduleStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar'; // Verify this component exists or use native date picker if needed
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function SemesterSettingsDialog() {
    const { currentSemester, updateSemester } = useScheduleStore();
    const [open, setOpen] = useState(false);

    // Local state for form
    const [label, setLabel] = useState(currentSemester?.label || '');
    const [startDate, setStartDate] = useState<Date | undefined>(currentSemester?.startDate);
    const [endDate, setEndDate] = useState<Date | undefined>(currentSemester?.endDate);

    const handleSave = () => {
        if (startDate && endDate) {
            updateSemester({
                label,
                startDate,
                endDate
            });
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Semester Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="label">Semester Label</Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Spring 2025"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Start Date</Label>
                        <DatePicker date={startDate} setDate={setStartDate} />
                    </div>

                    <div className="grid gap-2">
                        <Label>End Date</Label>
                        <DatePicker date={endDate} setDate={setEndDate} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DatePicker({ date, setDate }: { date: Date | undefined; setDate: (date: Date | undefined) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
