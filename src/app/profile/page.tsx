

import { ProfileClient } from './_components/profile-client';
import { BackButton } from '@/components/back-button';

export default function ProfilePage() {
    return (
        <div className="container mx-auto py-8">
            <BackButton />
            <h1 className="text-3xl font-headline font-bold mb-8">Profile & Analytics</h1>
            <ProfileClient />
        </div>
    );
}
