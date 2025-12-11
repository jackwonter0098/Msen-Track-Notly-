
"use client";

import { useState, useEffect } from 'react';

// Helper function to calculate time difference
const calculateTimeDiff = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
        return { elapsed: null, remaining: null };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
        days,
        hours,
        minutes,
        seconds
    };
};


interface ChallengeTimerProps {
    startDate: Date;
    durationDays: number;
}

export function ChallengeTimer({ startDate, durationDays }: ChallengeTimerProps) {
    const [time, setTime] = useState({ elapsed: '' , remaining: '' });

    useEffect(() => {
        if (!startDate) return;

        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const timerId = setInterval(() => {
            const now = new Date();
            let elapsedDiff = now.getTime() - startDate.getTime();
            let remainingDiff = endDate.getTime() - now.getTime();
            
            if (elapsedDiff < 0) elapsedDiff = 0;
            if (remainingDiff < 0) remainingDiff = 0;

            const elapsedDays = Math.floor(elapsedDiff / (1000 * 60 * 60 * 24));
            const elapsedHours = Math.floor((elapsedDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const elapsedMinutes = Math.floor((elapsedDiff % (1000 * 60 * 60)) / (1000 * 60));
            const elapsedSeconds = Math.floor((elapsedDiff % (1000 * 60)) / 1000);

            const remainingDays = Math.floor(remainingDiff / (1000 * 60 * 60 * 24));
            const remainingHours = Math.floor((remainingDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((remainingDiff % (1000 * 60 * 60)) / (1000 * 60));
            const remainingSeconds = Math.floor((remainingDiff % (1000 * 60)) / 1000);

            setTime({
                elapsed: `${elapsedDays}d ${elapsedHours}h ${elapsedMinutes}m ${elapsedSeconds}s`,
                remaining: `${remainingDays}d ${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`
            });

        }, 1000);

        // Cleanup function to stop the timer
        return () => clearInterval(timerId);

    }, [startDate, durationDays]);

    if (!time.elapsed) return null;

    return (
        <div className="text-sm text-muted-foreground mt-2 grid grid-cols-2 gap-x-4">
            <div>
                <span className="font-semibold">Elapsed Time:</span>
                <p className="font-mono">{time.elapsed}</p>
            </div>
            <div>
                <span className="font-semibold">Time Remaining:</span>
                 <p className="font-mono">{time.remaining}</p>
            </div>
        </div>
    );
}
