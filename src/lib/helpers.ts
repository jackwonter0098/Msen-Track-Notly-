
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Challenge } from "@/types";
import { parseISO, isValid, format, startOfToday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStartDateAsDate(startDate: string | Date | null | undefined): Date {
    if (startDate instanceof Date && isValid(startDate)) {
        return startDate;
    }
    if (typeof startDate === 'string') {
        const parsedDate = parseISO(startDate);
        if (isValid(parsedDate)) {
            return parsedDate;
        }
    }
    // Fallback for null, undefined, empty string, or invalid date string
    return new Date();
}


export function getChallengeProgress(challenge: Challenge): number {
  const startDate = getStartDateAsDate(challenge.startDate);
  
  const { durationDays } = challenge;
  const now = Date.now();
  const startMs = startDate.getTime();
  const endDate = startMs + durationDays * 24 * 60 * 60 * 1000;
  
  if (now >= endDate) return 100;
  if (now < startMs) return 0;

  const elapsed = now - startMs;
  const totalDuration = endDate - startMs;
  
  return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
}

export function formatTime(ms: number): string {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (days === 0 && hours === 0) {
      parts.push(`${seconds}s`);
    } else if (minutes > 0) { // Also show seconds if minutes are shown
      parts.push(`${seconds}s`);
    }
  
    return parts.join(' ') || '0s';
}

export function getDaysArray(challenge: Challenge): string[] {
    const days: string[] = [];
    const start = getStartDateAsDate(challenge.startDate);
    
    // Use startOfToday to avoid timezone issues affecting the 'current day'
    const today = startOfToday();

    for (let i = 0; i < challenge.durationDays; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        if (day > today) {
            break;
        }
        days.push(format(day, 'yyyy-MM-dd'));
    }
    return days;
}
