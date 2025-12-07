'use client';

import { ChallengeDetailClient } from "@/app/challenges/_components/challenge-detail";
import { BackButton } from "@/components/back-button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function ChallengePageContent() {
    const searchParams = useSearchParams();
    const challengeId = searchParams.get('id');

    if (!challengeId) {
        return <div className="container mx-auto py-8 text-center">Invalid Challenge ID</div>
    }

    return <ChallengeDetailClient challengeId={challengeId} />
}


export default function ChallengePage() {
    return (
        <div className="container mx-auto py-8">
            <BackButton />
            <Suspense fallback={<div className="container mx-auto py-8 space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>}>
                <ChallengePageContent />
            </Suspense>
        </div>
    )
}
