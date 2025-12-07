
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChallenges } from '@/context/challenge-context';
import { Challenge } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, ArchiveRestore, Pen, Trash2, Copy, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getChallengeProgress, getStartDateAsDate } from '@/lib/helpers';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { format, addDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type FilterStatus = 'active' | 'completed' | 'archived';

const ChallengeCard = React.memo(function ChallengeCard({ 
    challenge, 
    onArchive, 
    onUnarchive, 
    onDelete, 
    onDuplicate 
}: { 
    challenge: Challenge;
    onArchive: (id: string) => void;
    onUnarchive: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}) {
    const router = useRouter();
    const progress = getChallengeProgress(challenge);
    
    const startDate = getStartDateAsDate(challenge.startDate);
    const endDate = addDays(startDate, challenge.durationDays);

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-xl">
                        <Link href={`/challenges/challenge?id=${challenge.id}`} className="hover:underline">
                            {challenge.title}
                        </Link>
                    </CardTitle>
                     <Badge variant={challenge.status === 'completed' ? "secondary" : "default"}>
                        {challenge.status}
                    </Badge>
                </div>
                <CardDescription>
                    From {format(startDate, 'MMM d')} to {format(endDate, 'MMM d, yyyy')} ({challenge.durationDays} days)
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between bg-muted/50 p-3 rounded-b-lg">
                <p className="text-xs text-muted-foreground">
                    {challenge.isArchived ? `Archived` : `Active`}
                </p>
                <div className="flex items-center gap-1">
                    <TooltipProvider>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/challenges/edit?id=${challenge.id}`)}>
                                    <Pen className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit</p>
                            </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDuplicate(challenge.id)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Duplicate</p>
                            </TooltipContent>
                        </Tooltip>
                        {challenge.isArchived ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onUnarchive(challenge.id)}>
                                        <ArchiveRestore className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Unarchive</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onArchive(challenge.id)}>
                                        <Archive className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Archive</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                         <AlertDialog>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete</p>
                                </TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the challenge and all its data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(challenge.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    );
});

export function ChallengeListClient() {
  const { challenges, archiveChallenge, unarchiveChallenge, deleteChallenge, duplicateChallenge } = useChallenges();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('active');

  const filteredChallenges = useMemo(() => {
    return challenges
      .filter(challenge => {
        if (filter === 'archived') {
          return challenge.isArchived;
        }
        if (filter === 'completed') {
          return challenge.status === 'completed' && !challenge.isArchived;
        }
        // Active
        return challenge.status === 'active' && !challenge.isArchived;
      })
      .filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [challenges, searchTerm, filter]);

  const handleArchive = useCallback((id: string) => archiveChallenge(id), [archiveChallenge]);
  const handleUnarchive = useCallback((id: string) => unarchiveChallenge(id), [unarchiveChallenge]);
  const handleDelete = useCallback((id: string) => deleteChallenge(id), [deleteChallenge]);
  const handleDuplicate = useCallback((id: string) => duplicateChallenge(id), [duplicateChallenge]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search challenges by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
        </Tabs>
      </div>
      
      {filteredChallenges.length > 0 ? (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {filteredChallenges.map(challenge => (
                <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                />
             ))}
         </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold text-muted-foreground">No challenges found.</h3>
            <p className="text-muted-foreground mt-1">
                {filter === 'active' && 'Why not start a new one?'}
                {filter === 'completed' && 'Keep up the great work!'}
                {filter === 'archived' && 'Your archives are empty.'}
            </p>
        </div>
      )}
    </div>
  );
}
