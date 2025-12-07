

import { CreateChallengeForm } from "../_components/create-challenge-form";
import { BackButton } from "@/components/back-button";

export default function NewChallengePage() {
    return (
        <div className="container mx-auto py-8">
            <BackButton />
            <CreateChallengeForm />
        </div>
    )
}
    
