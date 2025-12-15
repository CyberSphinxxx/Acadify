import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sun, Moon, Laptop, User as UserIcon, LogOut } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { DangerZone } from './DangerZone';

type Theme = "dark" | "light" | "system"

interface ProfileSettingsProps {
    user: User;
    displayName: string;
    setDisplayName: (name: string) => void;
    handleUpdateProfile: (e: React.FormEvent) => void;
    handleLogout: () => void;
    isGoogleUser: boolean;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    // DangerZone Props
    deleteConfirmOpen: boolean;
    setDeleteConfirmOpen: (open: boolean) => void;
    deleteInput: string;
    setDeleteInput: (input: string) => void;
    handleDeleteData: () => void;
    isDeleting: boolean;
}

export function ProfileSettings({
    user,
    displayName,
    setDisplayName,
    handleUpdateProfile,
    handleLogout,
    isGoogleUser,
    theme,
    setTheme,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    deleteInput,
    setDeleteInput,
    handleDeleteData,
    isDeleting
}: ProfileSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your profile and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <div className="flex gap-4">
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                            <Button type="submit">Save</Button>
                        </div>
                    </div>
                </form>

                <div className="space-y-2 pt-4 border-t">
                    <Label>Appearance</Label>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {theme === 'light' && <Sun className="h-4 w-4" />}
                            {theme === 'dark' && <Moon className="h-4 w-4" />}
                            {theme === 'system' && <Laptop className="h-4 w-4" />}
                            <span className="text-sm font-medium text-foreground capitalize">{theme} Mode</span>
                        </div>
                        <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <div className="flex items-center gap-2">
                                        <Sun className="h-4 w-4" /> Light
                                    </div>
                                </SelectItem>
                                <SelectItem value="dark">
                                    <div className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" /> Dark
                                    </div>
                                </SelectItem>
                                <SelectItem value="system">
                                    <div className="flex items-center gap-2">
                                        <Laptop className="h-4 w-4" /> System
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <Label>Password</Label>
                    {isGoogleUser ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                            <UserIcon className="h-4 w-4" />
                            Your password is managed by Google.
                        </div>
                    ) : (
                        <div>
                            <Button variant="outline">Change Password</Button>
                        </div>
                    )}
                </div>

                <div className="space-y-1 pt-4 border-t text-sm text-muted-foreground">
                    <p>Account Created: {user.metadata.creationTime ? format(new Date(user.metadata.creationTime), 'PP p') : 'N/A'}</p>
                    <p>Last Signed In: {user.metadata.lastSignInTime ? format(new Date(user.metadata.lastSignInTime), 'PP p') : 'N/A'}</p>
                </div>

                <div className="pt-4 border-t">
                    <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>

                {/* Hazard Zone */}
                <DangerZone
                    deleteConfirmOpen={deleteConfirmOpen}
                    setDeleteConfirmOpen={setDeleteConfirmOpen}
                    deleteInput={deleteInput}
                    setDeleteInput={setDeleteInput}
                    handleDeleteData={handleDeleteData}
                    isDeleting={isDeleting}
                />
            </CardContent>
        </Card>
    );
}
