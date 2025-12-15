import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Trash2, AlertTriangle } from 'lucide-react';

interface DangerZoneProps {
    deleteConfirmOpen: boolean;
    setDeleteConfirmOpen: (open: boolean) => void;
    deleteInput: string;
    setDeleteInput: (input: string) => void;
    handleDeleteData: () => void;
    isDeleting: boolean;
}

export function DangerZone({
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteInput,
    setDeleteInput,
    handleDeleteData,
    isDeleting
}: DangerZoneProps) {
    return (
        <div className="pt-6 border-t mt-6">
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                <h3 className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" /> Hazard Zone
                </h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                    Permanently delete all your tasks, notes, classes, and profile data. This action cannot be undone.
                </p>

                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete All Data
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                tasks, notes, classes, and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <Label htmlFor="confirm-delete" className="mb-2 block text-sm font-medium">
                                Type <span className="font-bold select-none">delete my data</span> to confirm:
                            </Label>
                            <Input
                                id="confirm-delete"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                placeholder="delete my data"
                                autoComplete="off"
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setDeleteInput('');
                                setDeleteConfirmOpen(false);
                            }}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteData}
                                disabled={deleteInput !== 'delete my data' || isDeleting}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Data'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
