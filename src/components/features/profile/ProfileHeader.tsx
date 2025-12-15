import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { User } from 'firebase/auth';

interface ProfileHeaderProps {
    user: User;
    handle: string;
    isGoogleUser: boolean;
}

export function ProfileHeader({ user, handle, isGoogleUser }: ProfileHeaderProps) {
    return (
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
    );
}
