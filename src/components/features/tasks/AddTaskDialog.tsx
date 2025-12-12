import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { taskService } from '@/services/taskService';
import { useAuthStore } from '@/store/useAuthStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useState, useEffect } from 'react';
import type { TaskPriority, TaskStatus, Task } from '@/types/task';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH'] as [string, ...string[]]),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'] as [string, ...string[]]),
    dueDate: z.string().optional(),
    relatedClassId: z.string().optional(),
    isRecurring: z.boolean().optional(),
    recurrencePattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
});

interface AddTaskDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultDate?: Date;
    taskToEdit?: Task | null;
}

export function AddTaskDialog({ open: controlledOpen, onOpenChange: setControlledOpen, defaultDate, taskToEdit }: AddTaskDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const { user } = useAuthStore();
    const { classes, fetchClasses } = useScheduleStore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'MEDIUM',
            status: 'TODO',
            dueDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '',
            relatedClassId: 'none',
        },
    });

    useEffect(() => {
        if (open && user) {
            fetchClasses(user.uid);
        }
    }, [open, user, fetchClasses]);

    // Reset form when taskToEdit changes or dialog opens
    useEffect(() => {
        if (open) {
            if (taskToEdit) {
                form.reset({
                    title: taskToEdit.title,
                    description: taskToEdit.description || '',
                    priority: taskToEdit.priority,
                    status: taskToEdit.status,
                    dueDate: taskToEdit.dueDate ? format(new Date(taskToEdit.dueDate), 'yyyy-MM-dd') : '',
                    relatedClassId: taskToEdit.relatedClassId || 'none',
                    isRecurring: taskToEdit.isRecurring,
                    recurrencePattern: taskToEdit.recurrencePattern,
                });
            } else {
                form.reset({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    status: 'TODO',
                    dueDate: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '',
                    relatedClassId: 'none',
                    isRecurring: false,
                });
            }
        }
    }, [open, taskToEdit, form, defaultDate]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return;

        try {
            if (taskToEdit) {
                await taskService.updateTask(taskToEdit.id, {
                    title: values.title,
                    description: values.description,
                    priority: values.priority as TaskPriority,
                    status: values.status as TaskStatus,
                    dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
                    relatedClassId: values.relatedClassId === 'none' ? undefined : values.relatedClassId,
                    isRecurring: values.isRecurring,
                    recurrencePattern: values.recurrencePattern as 'DAILY' | 'WEEKLY' | 'MONTHLY' | undefined,
                });
            } else {
                await taskService.addTask({
                    userId: user.uid,
                    title: values.title,
                    description: values.description,
                    priority: values.priority as TaskPriority,
                    status: values.status as TaskStatus,
                    dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
                    relatedClassId: values.relatedClassId === 'none' ? undefined : values.relatedClassId,
                    isRecurring: values.isRecurring,
                    recurrencePattern: values.recurrencePattern as 'DAILY' | 'WEEKLY' | 'MONTHLY' | undefined,
                    createdAt: new Date(),
                });
            }
            setOpen(false);
            form.reset(); // Reset to defaults after submit
        } catch (error) {
            console.error("Failed to save task", error);
        }
    };

    // Deduplicate classes by subject for the dropdown
    const uniqueClasses = Array.from(new Map(classes.map(cls => [cls.subject, cls])).values());

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {setControlledOpen === undefined && !taskToEdit && (
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    <DialogDescription>
                        {taskToEdit ? 'Update your task details.' : 'Create a new task to track your academic progress.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Finish assignment..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LOW" className="text-green-600 font-medium">Low</SelectItem>
                                                <SelectItem value="MEDIUM" className="text-yellow-600 font-medium">Medium</SelectItem>
                                                <SelectItem value="HIGH" className="text-red-600 font-medium">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="TODO">To Do</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="DONE">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="relatedClassId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {uniqueClasses.map(cls => (
                                                    <SelectItem key={cls.id} value={cls.id}>
                                                        {cls.subject}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full">Create Task</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
