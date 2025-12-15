import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { taskService } from '@/services/taskService';
import { noteService } from '@/services/noteService';
import { userService } from '@/services/userService';
import { useTheme } from "@/components/theme-provider"
import type { Task } from '@/types/task';
import type { Note } from '@/types/note';

import { ProfileHeader } from '@/components/features/profile/ProfileHeader';
import { ProfileSettings } from '@/components/features/profile/ProfileSettings';
import { ProfileInsights } from '@/components/features/profile/ProfileInsights';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState(user?.displayName || '');

    // Store raw data to compute streak precisely
    const [rawData, setRawData] = useState<{ tasks: Task[], notes: Note[] }>({ tasks: [], notes: [] });

    const [stats, setStats] = useState({
        completedTasks: 0,
        totalNotes: 0,
        studyStreak: 0
    });

    // Delete Data States
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteData = async () => {
        if (!user || deleteInput !== 'delete my data') return;

        setIsDeleting(true);
        try {
            await userService.deleteUserData(user.uid);
            await logout(); // Logout ensures local state is cleared and user is booted
            navigate('/'); // Redirect to landing
        } catch (error) {
            console.error("Failed to delete data:", error);
            alert("Failed to delete data. Please try again.");
            setIsDeleting(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-8">
            <ProfileHeader user={user} handle={handle} isGoogleUser={isGoogleUser} />

            <Tabs defaultValue="settings" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-6 mt-6">
                    <ProfileSettings
                        user={user}
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        handleUpdateProfile={handleUpdateProfile}
                        handleLogout={handleLogout}
                        isGoogleUser={isGoogleUser}
                        theme={theme}
                        setTheme={setTheme}
                        deleteConfirmOpen={deleteConfirmOpen}
                        setDeleteConfirmOpen={setDeleteConfirmOpen}
                        deleteInput={deleteInput}
                        setDeleteInput={setDeleteInput}
                        handleDeleteData={handleDeleteData}
                        isDeleting={isDeleting}
                    />
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                    <ProfileInsights stats={stats} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
