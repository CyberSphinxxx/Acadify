import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from 'firebase/auth';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/features/dashboard/StatCard';
import { CheckCircle2, FileText, TrendingUp, LogOut, User as UserIcon } from 'lucide-react';
import { taskService } from '@/services/taskService';
import { noteService } from '@/services/noteService';
import { userService } from '@/services/userService';

import type { Task } from '@/types/task';
import type { Note } from '@/types/note';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState(user?.displayName || '');

    // Store raw data to compute streak precisely
    const [rawData, setRawData] = useState<{ tasks: Task[], notes: Note[] }>({ tasks: [], notes: [] });

    const [stats, setStats] = useState({
        completedTasks: 0,
        totalNotes: 0,
        studyStreak: 0
    });

    // Derive handle from email
    const handle = user?.email?.split('@')[0] || 'student';
    const isGoogleUser = user?.providerData[0]?.providerId === 'google.com';

    useEffect(() => {
        if (!user) return;

        const fetchStats = () => {
            const unsubTasks = taskService.subscribeToTasks(user.uid, (tasks) => {
                setRawData(prev => ({ ...prev, tasks }));
            });

            const unsubNotes = noteService.subscribeToNotes(user.uid, (notes) => {
                setRawData(prev => ({ ...prev, notes }));
            });




            return () => {
                unsubTasks();
                unsubNotes();
            }
        };

        const cleanup = fetchStats();
        return cleanup;
    }, [user]);

    // Derived stats
    useEffect(() => {
        const { tasks, notes } = rawData;

        const completedTasks = tasks.filter(t => t.status === 'DONE').length;
        const totalNotes = notes.length;

        // Sync streak to Firebase
        // Centralized logic: We do NOT calculate locally. We ask userService to do the heavy lifting and sync DB.
        const syncToFirebase = async () => {
            if (!user) return;
            // Even if no local items, we should check if there's stored global streak (though unlikely if 0 items)
            // But to be safe, if we have data, we sync.
            if (tasks.length > 0 || notes.length > 0) {
                const syncedStreak = await userService.syncStreak(user.uid, tasks, notes);
                setStats(prev => ({ ...prev, completedTasks, totalNotes, studyStreak: syncedStreak }));
            } else {
                // Fallback: Fetch what's in DB if we have no local data loaded yet? 
                // Or just trust 0? Let's fetch profile to be sure.
                const profile = await userService.getUserProfile(user.uid);
                setStats(prev => ({ ...prev, completedTasks, totalNotes, studyStreak: profile?.studyStreak || 0 }));
            }
        };

        syncToFirebase();

    }, [rawData, user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await updateProfile(user, { displayName });
            // Ideally notify user of success
            alert('Profile updated!');
        } catch (error) {
            console.error(error);
            alert('Failed to update profile.');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg border shadow-sm">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback className="text-2xl">{user.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-bold">{user.displayName}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                        <span className="font-semibold text-primary">@{handle}</span>
                        <span>•</span>
                        <span>{user.email}</span>
                    </div>
                    {/* Badge for Google User could go here */}
                    {isGoogleUser && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Google Account
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-6 mt-6">
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
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Completed Tasks"
                            value={stats.completedTasks}
                            icon={CheckCircle2}
                            description="Total tasks finished"
                        />
                        <StatCard
                            title="Total Notes"
                            value={stats.totalNotes}
                            icon={FileText}
                            description="Notes created"
                        />
                        <StatCard
                            title="Study Streak"
                            value={`${stats.studyStreak} Days`}
                            icon={TrendingUp}
                            description="Keep it up!"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
