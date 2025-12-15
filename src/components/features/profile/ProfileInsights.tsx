import { StatCard } from '@/components/features/dashboard/StatCard';
import { CheckCircle2, FileText, TrendingUp } from 'lucide-react';

interface ProfileInsightsProps {
    stats: {
        completedTasks: number;
        totalNotes: number;
        studyStreak: number;
    };
}

export function ProfileInsights({ stats }: ProfileInsightsProps) {
    return (
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
    );
}
