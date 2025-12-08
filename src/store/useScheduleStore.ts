import { create } from 'zustand';
import { scheduleService } from '@/services/scheduleService';
import type { ClassSession } from '@/types/schedule';

interface ScheduleStore {
    classes: ClassSession[];
    loading: boolean;
    error: string | null;
    fetchClasses: (userId: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
    classes: [],
    loading: false,
    error: null,
    fetchClasses: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const classes = await scheduleService.getClasses(userId);
            set({ classes, loading: false });
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            set({ error: 'Failed to fetch classes', loading: false });
        }
    },
}));
