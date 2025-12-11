
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useChallenges } from "@/context/challenge-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { getStartDateAsDate } from "@/lib/helpers"
import { getAISuggestions, Suggestion } from "@/ai/flows/challenge-suggestions-flow"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  durationDays: z.coerce.number().int().min(1, {
    message: "Duration must be at least 1 day.",
  }),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
})

type CreateChallengeFormProps = {
  challengeId?: string;
}

export function CreateChallengeForm({ challengeId }: CreateChallengeFormProps) {
  const router = useRouter()
  const { addChallenge, updateChallenge, getChallengeById } = useChallenges();
  const { toast } = useToast();
  const isEditMode = !!challengeId;
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      durationDays: 30,
      startDate: new Date(),
    },
  })
  
  useEffect(() => {
    if (isEditMode && challengeId) {
      const existingChallenge = getChallengeById(challengeId);
      if (existingChallenge) {
        form.reset({
          title: existingChallenge.title,
          durationDays: existingChallenge.durationDays,
          startDate: getStartDateAsDate(existingChallenge.startDate),
        })
      }
    }
  }, [isEditMode, challengeId, getChallengeById, form])

  async function handleGetSuggestions() {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
        const result = await getAISuggestions();
        setSuggestions(result.suggestions);
    } catch (error) {
        console.error("Failed to get AI suggestions", error);
        toast({
            variant: "destructive",
            title: "AI Suggestion Error",
            description: "Could not fetch suggestions from the AI. Please try again."
        })
    } finally {
        setIsSuggesting(false);
    }
  }

  function handleSuggestionClick(suggestion: Suggestion) {
    form.setValue("title", suggestion.title);
    form.setValue("durationDays", suggestion.durationDays);
    setSuggestions([]); // Clear suggestions after selection
    document.getElementById("challenge-title-input")?.focus();
  }


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditMode && challengeId) {
        updateChallenge(challengeId, values);
        toast({
            title: "Challenge Updated",
            description: `"${values.title}" has been updated successfully.`
        });
        router.push('/challenges');
    } else {
        const newChallengeId = addChallenge(values);
        toast({
            title: "Challenge Started!",
            description: `Your new challenge "${values.title}" is underway.`
        });
        router.push(`/challenges/challenge?id=${newChallengeId}`);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle className="font-headline">{isEditMode ? 'Edit Challenge' : 'Start a New Challenge'}</CardTitle>
            <CardDescription>{isEditMode ? 'Update the details of your challenge.' : 'Define your next goal and start tracking your progress.'}</CardDescription>
        </CardHeader>
        <CardContent>
            {!isEditMode && (
                <div className="mb-8 space-y-4">
                     <Button type="button" onClick={handleGetSuggestions} disabled={isSuggesting} variant="outline" className="w-full">
                        {isSuggesting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Ideas...
                            </>
                        ) : (
                             <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Get AI Suggestions
                            </>
                        )}
                    </Button>

                    {suggestions.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {suggestions.map((s, i) => (
                                <Card key={i} className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleSuggestionClick(s)}>
                                    <CardContent className="p-4 text-center">
                                        <p className="font-semibold text-sm">{s.title}</p>
                                        <p className="text-xs text-muted-foreground mt-2">{s.durationDays} days</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Challenge Title</FormLabel>
                        <FormControl>
                        <Input id="challenge-title-input" placeholder="e.g., 30 Days of Code" {...field} />
                        </FormControl>
                        <FormDescription>
                        What goal do you want to accomplish?
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="durationDays"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (in days)</FormLabel>
                            <FormControl>
                            <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Start Challenge'}</Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}

    