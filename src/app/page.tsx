
'use client'

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useChallenges } from '@/context/challenge-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getChallengeProgress, getStartDateAsDate } from '@/lib/helpers';
import { quotes } from '@/lib/quotes';
import { ArrowRight, CheckCircle, ListChecks, PlusCircle } from 'lucide-react';
import { addDays, format } from 'date-fns';

export default function Dashboard() {
  const { challenges, loading } = useChallenges();
  const [randomQuote, setRandomQuote] = useState({ en: '', hi: '' });

  useEffect(() => {
    // Select a random quote on client-side to avoid hydration mismatch
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const stats = useMemo(() => {
    return {
      active: challenges.filter(c => c.status === 'active' && !c.isArchived).length,
      completed: challenges.filter(c => c.status === 'completed' && !c.isArchived).length,
    }
  }, [challenges]);
  
  const latestActiveChallenge = useMemo(() => {
    return challenges
      .filter(c => c.status === 'active' && !c.isArchived)
      .sort((a, b) => getStartDateAsDate(b.startDate).getTime() - getStartDateAsDate(a.startDate).getTime())[0];
  }, [challenges]);


  if (loading) {
      return (
          <div className="container mx-auto py-8 space-y-8">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-56 w-full" />
          </div>
      )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 p-6 bg-card border rounded-lg shadow-sm">
        <h2 className="font-headline text-2xl font-semibold text-primary">Welcome Back!</h2>
        {randomQuote.en && (
          <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
            <p>"{randomQuote.en}"</p>
            <p className="mt-1 text-sm">"{randomQuote.hi}"</p>
          </blockquote>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">challenges currently in progress</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completed Challenges</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                   <p className="text-xs text-muted-foreground">goals you have achieved</p>              </CardContent>
          </Card>
      </div>

      {latestActiveChallenge ? (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-headline font-semibold">Continue Your Journey</h3>
                 <Button variant="outline" asChild>
                    <Link href="/challenges">View All Challenges <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            <Link href={`/challenges/challenge?id=${latestActiveChallenge.id}`} className="block">
                <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{latestActiveChallenge.title}</CardTitle>
                        <CardDescription>
                            {latestActiveChallenge.durationDays} days challenge - Ends on: {format(addDays(getStartDateAsDate(latestActiveChallenge.startDate), latestActiveChallenge.durationDays), 'MMM d, yyyy')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Progress value={getChallengeProgress(latestActiveChallenge)} className="h-2" />
                        <p className="text-sm text-muted-foreground">{Math.round(getChallengeProgress(latestActiveChallenge))}% complete</p>
                    </CardContent>
                </Card>
            </Link>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold text-muted-foreground">No active challenges yet.</h3>
          <p className="text-muted-foreground mt-1">Ready to start a new journey?</p>
          <Button asChild className="mt-4">
            <Link href="/challenges/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Challenge
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

    