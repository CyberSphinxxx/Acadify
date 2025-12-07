export interface ClassSession {
    id: string;
    userId: string;
    subject: string;
    code: string;
    room?: string;
    instructor?: string;
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // "HH:mm" 24h format
    endTime: string;   // "HH:mm" 24h format
    color: string;
}

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
