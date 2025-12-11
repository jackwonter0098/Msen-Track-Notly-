
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ChallengeListClient } from "./_components/challenge-list-client";

export default function ChallengesPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-headline font-bold">Your Challenges</h1>
                <Button asChild>
                    <Link href="/challenges/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Challenge
                    </Link>
                </Button>
            </div>
            
            <ChallengeListClient />
        </div>
    )
}
