
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Challenge, Note } from '@/types';
import { format } from 'date-fns';
import { getStartDateAsDate } from '@/lib/helpers';

interface ChallengeContextType {
  challenges: Challenge[];
  loading: boolean;
  addChallenge: (challenge: Omit<Challenge, 'id' | 'status' | 'isArchived' | 'notes' | 'startDate'> & { startDate: Date }) => string;
  updateChallenge: (id: string, challengeData: Partial<Omit<Challenge, 'id' | 'startDate'>> & { startDate?: Date }) => void;
  deleteChallenge: (challengeId: string) => void;
  getChallengeById: (id: string) => Challenge | undefined;
  addNoteToChallenge: (challengeId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNoteInChallenge: (challengeId: string, noteId: string, noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'date'>>) => void;
  deleteNoteFromChallenge: (challengeId: string, noteId: string) => void;
  archiveChallenge: (challengeId: string) => void;
  unarchiveChallenge: (challengeId: string) => void;
  duplicateChallenge: (challengeId: string) => void;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export const ChallengeProvider = ({ children }: { children: ReactNode }) => {
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>('challenges', []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateChallengeStatuses = () => {
      let challengesUpdated = false;
      const updatedChallenges = challenges.map(challenge => {
        if (challenge.status === 'active') {
          const startDate = getStartDateAsDate(challenge.startDate);
          const endDate = new Date(startDate.getTime() + challenge.durationDays * 24 * 60 * 60 * 1000);
          if (Date.now() > endDate.getTime()) {
            challengesUpdated = true;
            return { ...challenge, status: 'completed' as 'completed' };
          }
        }
        return challenge;
      });

      if (challengesUpdated) {
        setChallenges(updatedChallenges);
      }
    };
    
    try {
      if (challenges && challenges.length > 0) {
        updateChallengeStatuses();
      }
    } catch(error) {
      console.error("Error during initial status update:", error);
    } finally {
      setLoading(false);
    }
    
    const intervalId = setInterval(updateChallengeStatuses, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
    
  }, [challenges, setChallenges]);


  const addChallenge = (challengeData: Omit<Challenge, 'id' | 'status' | 'isArchived' | 'notes' | 'startDate'> & { startDate: Date }) => {
    const newId = crypto.randomUUID();
    const newChallenge: Challenge = {
      ...challengeData,
      id: newId,
      startDate: format(challengeData.startDate, 'yyyy-MM-dd'),
      status: 'active',
      isArchived: false,
      notes: [],
    };
    setChallenges(prev => [...prev, newChallenge]);
    return newId;
  };

  const updateChallenge = (id: string, challengeData: Partial<Omit<Challenge, 'id' | 'startDate'>> & { startDate?: Date }) => {
    setChallenges(prev =>
      prev.map(c => {
        if (c.id === id) {
          const { startDate, ...restOfData } = challengeData;
          
          let updatedChallenge = { ...c, ...restOfData };
  
          if (startDate) {
            updatedChallenge.startDate = format(startDate, 'yyyy-MM-dd');
          }
  
          const newStartDate = getStartDateAsDate(updatedChallenge.startDate);
          const newEndDate = new Date(newStartDate.getTime() + updatedChallenge.durationDays * 24 * 60 * 60 * 1000);
          
          if (new Date() > newEndDate) {
            updatedChallenge.status = 'completed';
          } else {
            updatedChallenge.status = 'active';
          }
  
          return updatedChallenge;
        }
        return c;
      })
    );
  };
  
  const deleteChallenge = (challengeId: string) => {
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
  };
  
  const getChallengeById = (id: string) => {
    return challenges.find(c => c.id === id);
  };

  const addNoteToChallenge = (challengeId: string, noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      ...noteData,
      createdAt: Date.now(),
    };
    setChallenges(prev => 
      prev.map(c => 
        c.id === challengeId 
          ? { ...c, notes: [...c.notes, newNote].sort((a,b) => b.createdAt - a.createdAt) }
          : c
      )
    );
  };

  const updateNoteInChallenge = (challengeId: string, noteId: string, noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'date'>>) => {
    setChallenges(prev =>
      prev.map(c => {
        if (c.id === challengeId) {
          const updatedNotes = c.notes.map(n =>
            n.id === noteId ? { ...n, ...noteData, updatedAt: Date.now() } : n
          ).sort((a,b) => b.createdAt - a.createdAt);
          return { ...c, notes: updatedNotes };
        }
        return c;
      })
    );
  };

  const deleteNoteFromChallenge = (challengeId: string, noteId: string) => {
    setChallenges(prev => 
      prev.map(c => 
        c.id === challengeId
          ? { ...c, notes: c.notes.filter(n => n.id !== noteId) }
          : c
      )
    );
  }

  const archiveChallenge = (challengeId: string) => {
    setChallenges(prev =>
      prev.map(c => (c.id === challengeId ? { ...c, isArchived: true } : c))
    );
  };

  const unarchiveChallenge = (challengeId: string) => {
    setChallenges(prev =>
      prev.map(c => (c.id === challengeId ? { ...c, isArchived: false } : c))
    );
  };

  const duplicateChallenge = (challengeId: string) => {
    const original = challenges.find(c => c.id === challengeId);
    if (!original) return;

    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      title: `${original.title} (Copy)`,
      durationDays: original.durationDays,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
      isArchived: false,
      notes: [], // Still not copying notes, will address later
    };
    setChallenges(prev => [...prev, newChallenge]);
  };


  return (
    <ChallengeContext.Provider value={{ 
      challenges, 
      loading,
      addChallenge,
      updateChallenge,
      deleteChallenge,
      getChallengeById,
      addNoteToChallenge,
      updateNoteInChallenge,
      deleteNoteFromChallenge,
      archiveChallenge,
      unarchiveChallenge,
      duplicateChallenge,
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenges = () => {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenges must be used within a ChallengeProvider');
  }
  return context;
};
