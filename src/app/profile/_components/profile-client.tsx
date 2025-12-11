
"use client";

import React, { useMemo } from 'react';
import { useChallenges } from '@/context/challenge-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Mood, Note } from '@/types';
import { Archive, CheckCircle, ListChecks, NotebookText } from 'lucide-react';

const moodAnalysisCategories = {
    Positive: { moods: ['😊', '💪', '💡'], color: 'hsl(var(--chart-2))' },
    Neutral: { moods: ['😐'], color: 'hsl(var(--chart-4))' },
    Negative: { moods: ['😢'], color: 'hsl(var(--chart-5))' },
};

export function ProfileClient() {
  const { challenges, loading } = useChallenges();

  const stats = useMemo(() => {
    const allNotes = challenges.flatMap(c => c.notes);
    return {
      active: challenges.filter(c => c.status === 'active' && !c.isArchived).length,
      completed: challenges.filter(c => c.status === 'completed' && !c.isArchived).length,
      archived: challenges.filter(c => c.isArchived).length,
      totalNotes: allNotes.length,
    };
  }, [challenges]);

  const weeklyNotesChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        date: d.toISOString().split('T')[0],
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
        notes: 0,
      };
    }).reverse();

    const allNotes = challenges.flatMap(c => c.notes);
    allNotes.forEach(note => {
      const day = last7Days.find(d => d.date === note.date);
      if (day) {
        day.notes += 1;
      }
    });

    return last7Days.map(d => ({ date: d.shortDate, notes: d.notes}));
  }, [challenges]);

  const moodAnalysisChartData = useMemo(() => {
    const allNotes = challenges.flatMap(c => c.notes);
    const moodCounts = { Positive: 0, Neutral: 0, Negative: 0 };

    allNotes.forEach(note => {
      if (moodAnalysisCategories.Positive.moods.includes(note.mood)) moodCounts.Positive++;
      else if (moodAnalysisCategories.Neutral.moods.includes(note.mood)) moodCounts.Neutral++;
      else if (moodAnalysisCategories.Negative.moods.includes(note.mood)) moodCounts.Negative++;
    });

    return Object.entries(moodCounts).map(([name, value]) => ({ name, value, fill: moodAnalysisCategories[name as keyof typeof moodCounts].color }));
  }, [challenges]);

  if (loading) {
    return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
  }

  const statCards = [
    { title: "Active Challenges", value: stats.active, icon: ListChecks },
    { title: "Completed Challenges", value: stats.completed, icon: CheckCircle },
    { title: "Archived Challenges", value: stats.archived, icon: Archive },
    { title: "Total Notes", value: stats.totalNotes, icon: NotebookText },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(stat => (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
            </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Weekly Note Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyNotesChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="notes" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Mood Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie data={moodAnalysisChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                        );
                    }}>
                        {moodAnalysisChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                     <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    