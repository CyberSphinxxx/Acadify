import { create } from 'zustand';
import { scheduleService } from '@/services/scheduleService';
import type { ClassSession, Semester } from '@/types/schedule';

interface ScheduleStore {
    classes: ClassSession[];
    currentSemester: Semester | null;
    loading: boolean;
    error: string | null;
    fetchClasses: (userId: string) => Promise<void>;
    setSemester: (semester: Semester) => void;
    updateSemester: (updates: Partial<Semester>) => void;
    addHoliday: (date: Date) => void;
    removeHoliday: (date: Date) => void;
}

const DEFAULT_SEMESTER: Semester = {
    label: 'Current Semester',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)), // approx 4 months
    holidays: []
};

export const useScheduleStore = create<ScheduleStore>((set) => ({
    classes: [],
    currentSemester: DEFAULT_SEMESTER, // Default to avoid null checks everywhere for now
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
    setSemester: (semester) => set({ currentSemester: semester }),
    updateSemester: (updates) => set((state) => ({
        currentSemester: state.currentSemester ? { ...state.currentSemester, ...updates } : null
    })),
    addHoliday: (date) => set((state) => {
        if (!state.currentSemester) return {};
        return {
            currentSemester: {
                ...state.currentSemester,
                holidays: [...state.currentSemester.holidays, date]
            }
        };
    }),
    removeHoliday: (date) => set((state) => {
        if (!state.currentSemester) return {};
        return {
            currentSemester: {
                ...state.currentSemester,
                holidays: state.currentSemester.holidays.filter(h => h.getTime() !== date.getTime())
            }
        };
    })
}));
