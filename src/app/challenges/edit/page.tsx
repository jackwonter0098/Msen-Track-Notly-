'use client';

import { CreateChallengeForm } from "../_components/create-challenge-form";
import { BackButton } from "@/components/back-button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function EditChallengePageContent() {
    const searchParams = useSearchParams();
    const challengeId = searchParams.get('id');

    if (!challengeId) {
        return (
             <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Invalid Challenge ID</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }
    return <CreateChallengeForm challengeId={challengeId} />
}


export default function EditChallengePage() {
    return (
        <div className="container mx-auto py-8">
            <BackButton />
            <Suspense fallback={<div>Loading...</div>}>
                <EditChallengePageContent />
            </Suspense>
        </div>
    )
}
