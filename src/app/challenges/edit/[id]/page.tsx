'use client';

import { CreateChallengeForm } from "../../_components/create-challenge-form";
import { BackButton } from "@/components/back-button";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function EditChallengePageContent() {
    const params = useParams();
    const challengeId = params.id as string;

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


export default function EditChallengePage({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto py-8">
            <BackButton />
            {/* The component inside will use useSearchParams, so Suspense is good practice */}
            <Suspense fallback={<div>Loading...</div>}>
                 <CreateChallengeForm challengeId={params.id} />
            </Suspense>
        </div>
    )
}
