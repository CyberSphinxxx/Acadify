import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function removeUndefined(obj: any): any {
    if (obj === undefined) {
        return null;
    }
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(removeUndefined);
    }
    const result: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = removeUndefined(obj[key]);
            if (value !== undefined) {
                result[key] = value;
            } else {
                result[key] = null; // Convert undefined fields to null for Firestore
            }
        }
    }
    return result;
}
