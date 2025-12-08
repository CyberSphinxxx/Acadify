import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    intent?: 'neutral' | 'success' | 'danger' | 'warning';
    className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, intent = 'neutral', className }: StatCardProps) {
    return (
        <Card className={cn("bg-card/50 backdrop-blur border shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", {
                    "text-muted-foreground": intent === 'neutral',
                    "text-green-500": intent === 'success',
                    "text-red-500": intent === 'danger',
                    "text-yellow-500": intent === 'warning',
                })} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
