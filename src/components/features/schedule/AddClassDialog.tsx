import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DAYS_OF_WEEK } from "@/types/schedule"
import { useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"

const sessionSchema = z.object({
    dayOfWeek: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    room: z.string(),
})

const formSchema = z.object({
    subject: z.string().min(2, {
        message: "Subject must be at least 2 characters.",
    }),
    code: z.string().min(2, {
        message: "Course code must be at least 2 characters.",
    }),
    instructor: z.string(),
    color: z.string().default("#3b82f6"), // blue-500
    sessions: z.array(sessionSchema).min(1, {
        message: "At least one session is required.",
    }),
})

interface AddClassDialogProps {
    onAddClass: (data: z.infer<typeof formSchema>) => Promise<void>
}

export function AddClassDialog({ onAddClass }: AddClassDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: "",
            code: "",
            instructor: "",
            color: "#3b82f6",
            sessions: [
                { dayOfWeek: "1", startTime: "09:00", endTime: "10:30", room: "" }
            ]
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "sessions",
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await onAddClass(values)
            setOpen(false)
            form.reset({
                subject: "",
                code: "",
                instructor: "",
                color: "#3b82f6",
                sessions: [{ dayOfWeek: "1", startTime: "09:00", endTime: "10:30", room: "" }]
            })
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Class
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Class</DialogTitle>
                    <DialogDescription>
                        Add a new class and its weekly sessions.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Calculus" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="MATH101" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="instructor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructor (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dr. Smith" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="color"
                                            {...field}
                                            className="h-10 w-full p-1 cursor-pointer"
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Sessions</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ dayOfWeek: "1", startTime: "09:00", endTime: "10:30", room: "" })}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Session
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="p-3 border rounded-md space-y-3 bg-muted/20 relative group">
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name={`sessions.${index}.dayOfWeek`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Day</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue placeholder="Select day" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {DAYS_OF_WEEK.map((day, i) => (
                                                                <SelectItem key={i} value={i.toString()}>
                                                                    {day}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`sessions.${index}.room`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Room</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8" placeholder="Room 301" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField
                                            control={form.control}
                                            name={`sessions.${index}.startTime`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Start Time</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8 text-xs" type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`sessions.${index}.endTime`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">End Time</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8 text-xs" type="time" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Class
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
