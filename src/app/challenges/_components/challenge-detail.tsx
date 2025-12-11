
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useChallenges } from '@/context/challenge-context';
import { Challenge, Note, MOODS } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getChallengeProgress, getStartDateAsDate } from '@/lib/helpers';
import { format, differenceInDays, addDays } from 'date-fns';
import { Calendar, Edit, Trash2, Share2, NotebookPen } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChallengeTimer } from '@/components/challenge-timer';

const moodHighlightStyles: { [key: string]: { card: string; border: string } } = {
    '😊': { card: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700' },
    '💪': { card: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' },
    '💡': { card: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700' },
    '😐': { card: 'bg-gray-100 dark:bg-gray-700/30', border: 'border-gray-300 dark:border-gray-600' },
    '😢': { card: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700' },
};

const NoteCard = ({ note, onEdit, onDelete }: { note: Note, onEdit: () => void, onDelete: () => void }) => (
    <Card className={cn('overflow-hidden transition-all hover:shadow-md', moodHighlightStyles[note.mood].card, moodHighlightStyles[note.mood].border)}>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex-1">
                <CardTitle className="text-base font-semibold flex items-center">
                    Note for {format(new Date(note.createdAt), 'PP')} <span className="text-2xl ml-2">{note.mood}</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                    Added on: {format(new Date(note.createdAt), 'p')}
                </p>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                    <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this note. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{note.text}</p>
        </CardContent>
        {note.updatedAt && (
             <CardFooter className="text-xs text-muted-foreground pt-2 pb-3">
                Last updated: {format(new Date(note.updatedAt), 'PPp')}
             </CardFooter>
        )}
    </Card>
);

const NoteEditor = ({ challengeId, onNoteAction }: { challengeId: string; onNoteAction: () => void; }) => {
    const { addNoteToChallenge, updateNoteInChallenge } = useChallenges();
    const [text, setText] = useState('');
    const [mood, setMood] = useState<Note['mood']>('😐');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    const handleSave = () => {
        if (text.trim() === '') return;
        const noteData = { text, mood };

        if (editingNoteId) {
            updateNoteInChallenge(challengeId, editingNoteId, noteData);
        } else {
            addNoteToChallenge(challengeId, { ...noteData, date: format(new Date(), 'yyyy-MM-dd') });
        }
        handleCancel();
        onNoteAction();
    };

    const handleCancel = () => {
        setText('');
        setMood('😐');
        setEditingNoteId(null);
    };

    const startEditing = (note: Note) => {
        if (note && note.id) {
            setText(note.text);
            setMood(note.mood);
            setEditingNoteId(note.id);
            document.getElementById('note-editor-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    
    useEffect(() => {
        const handleEditEvent = (e: Event) => {
            const detail = (e as CustomEvent).detail as Note;
            startEditing(detail);
        };
        document.addEventListener(`edit-note-${challengeId}`, handleEditEvent);
        return () => document.removeEventListener(`edit-note-${challengeId}`, handleEditEvent);
    }, [challengeId]);

    const borderClass = moodHighlightStyles[mood]?.border || 'border-input';

    return (
        <Card id="note-editor-card" className={cn("transition-all border-2", borderClass)}>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <NotebookPen className="h-5 w-5" />
                    {editingNoteId ? 'Edit Note' : 'Add a New Note'}
                </CardTitle>
                <CardDescription>
                    {editingNoteId ? 'Update your thoughts for the selected note.' : 'Log your progress, thoughts, or feelings.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="How was your day? What did you accomplish?"
                    rows={4}
                />
                <div>
                    <Label className="mb-2 block font-medium">Select your mood:</Label>
                    <RadioGroup value={mood} onValueChange={(value) => setMood(value as Note['mood'])} className="flex flex-wrap gap-4">
                        {MOODS.map((m) => (
                            <div key={m} className="flex items-center space-x-2">
                                <RadioGroupItem value={m} id={`mood-${m}`} />
                                <Label htmlFor={`mood-${m}`} className="text-2xl cursor-pointer">{m}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
                {editingNoteId && <Button variant="ghost" onClick={handleCancel}>Cancel Edit</Button>}
                <Button onClick={handleSave} disabled={!text.trim()}>
                    {editingNoteId ? 'Update Note' : 'Save New Note'}
                </Button>
            </CardFooter>
        </Card>
    );
};


export function ChallengeDetailClient({ challengeId }: { challengeId: string }) {
    const { getChallengeById, deleteNoteFromChallenge, loading } = useChallenges();
    const { toast } = useToast();
    const [challenge, setChallenge] = useState<Challenge | undefined>(undefined);
    const [_, setForceUpdate] = useState(0); // State to force re-render

    useEffect(() => {
        setChallenge(getChallengeById(challengeId));
    }, [challengeId, getChallengeById]);

    const notesByDay = useMemo(() => {
        if (!challenge) return {};
        return challenge.notes.reduce((acc, note) => {
            const day = note.date;
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(note);
            return acc;
        }, {} as { [key: string]: Note[] });
    }, [challenge]);

    const sortedDays = useMemo(() => {
        return Object.keys(notesByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }, [notesByDay]);

    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!challenge) {
        return <div className="text-center py-10">Challenge not found.</div>;
    }

    const startDate = getStartDateAsDate(challenge.startDate);
    const progress = getChallengeProgress(challenge);
    
    const handleEditNote = (note: Note) => {
        const event = new CustomEvent(`edit-note-${challenge.id}`, { detail: note });
        document.dispatchEvent(event);
    };

    const handleShare = () => {
        if (!challenge) return;
        const daysCompleted = differenceInDays(new Date(), startDate);
        const progressPercentage = Math.round(progress);
        const summary = `I'm currently on Day ${daysCompleted} of my "${challenge.title}" challenge!
Progress: ${progressPercentage}% complete.
Let's keep going! #TrackFlowNotely`;
        
        navigator.clipboard.writeText(summary).then(() => {
            toast({
                title: "Challenge summary copied to clipboard!",
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast({
                variant: 'destructive',
                title: 'Failed to copy summary',
            });
        });
    };

    const handleNoteAction = () => {
      // Force a re-render by updating state
      setChallenge(getChallengeById(challenge.id));
      setForceUpdate(c => c + 1);
    }
    
    const handleDeleteNote = (noteId: string) => {
        deleteNoteFromChallenge(challenge.id, noteId);
        handleNoteAction();
    }


    return (
        <div className="space-y-8 mt-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-3xl">{challenge.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                <Calendar className="h-4 w-4" />
                                <span>{challenge.durationDays}-day challenge</span>
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share Challenge</span>
                        </Button>
                    </div>
                     <Badge variant={challenge.status === 'completed' ? "secondary" : "default"} className="w-fit mt-2">
                        {challenge.status}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} className="h-2 mb-2" />
                    <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete ({differenceInDays(new Date(), startDate)} of {challenge.durationDays} days)</p>
                    {challenge.status === 'active' && <ChallengeTimer startDate={startDate} durationDays={challenge.durationDays} />}
                </CardContent>
                 <CardFooter className="text-sm text-muted-foreground">
                    From {format(startDate, 'PPP')} to {format(addDays(startDate, challenge.durationDays), 'PPP')}
                </CardFooter>
            </Card>

            <div className="space-y-6">
                <NoteEditor challengeId={challenge.id} onNoteAction={handleNoteAction} />
                
                <div>
                    <h2 className="text-2xl font-headline font-bold mb-4">Your Notes</h2>
                    <div className="space-y-6">
                        {challenge.notes.length === 0 ? (
                             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                <h3 className="text-lg font-semibold text-muted-foreground">No notes yet.</h3>
                                <p className="text-muted-foreground mt-1">Use the editor above to add your first note!</p>
                            </div>
                        ) : (
                           sortedDays.map(day => (
                                <div key={day}>
                                    <h3 className="font-semibold text-lg mb-3 font-headline sticky top-14 bg-background py-2 z-10">
                                        {format(getStartDateAsDate(day), 'EEEE, MMMM d, yyyy')}
                                    </h3>
                                    <div className="space-y-4">
                                        {notesByDay[day].map(note => (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                onEdit={() => handleEditNote(note)}
                                                onDelete={() => handleDeleteNote(note.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                           ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

