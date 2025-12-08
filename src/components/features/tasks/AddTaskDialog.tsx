import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import type { TaskPriority, TaskStatus } from '@/types/task';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

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
}

export function AddTaskDialog({ open: controlledOpen, onOpenChange: setControlledOpen, defaultDate }: AddTaskDialogProps) {
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

    useEffect(() => {
        if (defaultDate) {
            form.setValue('dueDate', format(defaultDate, 'yyyy-MM-dd'));
        }
    }, [defaultDate, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return;

        try {
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
            setOpen(false);
            form.reset({
                title: '',
                description: '',
                priority: 'MEDIUM',
                status: 'TODO',
                dueDate: '',
                relatedClassId: 'none',
            });
        } catch (error) {
            console.error("Failed to add task", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {setControlledOpen === undefined && (
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
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
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
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
                                                {classes.map(cls => (
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
