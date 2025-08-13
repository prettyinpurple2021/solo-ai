"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface CalendarEvent {
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

function formatEventTime(start: { dateTime?: string; date?: string }, end: { dateTime?: string; date?: string }) {
  if (start.date) {
    return "All day";
  }
  if (start.dateTime) {
    const startTime = new Date(start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = end.dateTime ? new Date(end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    return `${startTime}${endTime ? ` - ${endTime}` : ''}`;
  }
  return "Time not specified";
}

export function GoogleCalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false); // Start as not connected, set to true after check

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/integrations/google/events');

        if (response.status === 404) {
          setIsConnected(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch calendar events.');
        }

        const data: CalendarEvent[] = await response.json();

        // Filter for today's events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todaysEvents = data.filter(event => {
            const eventStartDate = event.start.dateTime ? new Date(event.start.dateTime) : (event.start.date ? new Date(event.start.date) : null);
            if (!eventStartDate) return false;
            // Adjust all-day events to be comparable
            if (event.start.date) eventStartDate.setUTCHours(0,0,0,0);
            return eventStartDate >= today && eventStartDate < tomorrow;
        });

        setEvents(todaysEvents);

      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <Card className="boss-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" /> Today's Agenda</CardTitle>
          <CardDescription>Loading your Google Calendar events...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="boss-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" /> Today's Agenda</CardTitle>
          <CardDescription>Connect Google Calendar to see your events here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-8">
          <Calendar className="h-16 w-16 text-gray-400 mb-4" />
          <p className="mb-4 font-medium">You haven't connected your Google Calendar yet.</p>
          <Button asChild className="punk-button text-white">
            <Link href="/dashboard/integrations">Connect Now</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
       <Card className="boss-card bg-red-50 border-red-200">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700"><AlertCircle className="h-5 w-5" /> Calendar Error</CardTitle>
            <CardDescription className="text-red-600">Could not load your calendar events.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-red-700">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="boss-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" /> Today's Agenda</CardTitle>
        <CardDescription>Your events from Google Calendar for today.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold text-sm empowering-text">{event.summary}</p>
                  <p className="text-xs text-blue-800">{formatEventTime(event.start, event.end)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="font-semibold">No events on your calendar for today.</p>
              <p className="text-sm text-muted-foreground">Enjoy your free day, boss!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
