import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { logError } from '@/lib/logger';

export interface PitchDeck {
  id: string;
  userId: string;
  title: string;
  description?: string;
  theme: string;
  thumbnail?: string;
  isPublic: boolean;
  status: 'draft' | 'published';
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export function usePitchDecks() {
  const [decks, setDecks] = useState<PitchDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch('/api/pitch-decks', { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch pitch decks');
      }

      const data = await response.json();
      setDecks(data);
      setError(null);
    } catch (err) {
      logError('Error fetching decks', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load pitch decks');
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (title: string, theme: string = 'modern') => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const id = crypto.randomUUID();
      const response = await fetch('/api/pitch-decks', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id, title, theme, slides: [] }) // Initialize with empty slides
      });

      if (!response.ok) throw new Error('Failed to create deck');

      const data = await response.json();
      toast.success('Pitch deck created');
      await fetchDecks(); // Refresh list
      return data;
    } catch (err) {
      logError('Error creating deck', err);
      toast.error('Failed to create pitch deck');
      throw err;
    }
  };

  const deleteDeck = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
       const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await fetch(`/api/pitch-decks/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) throw new Error('Failed to delete deck');

      toast.success('Pitch deck deleted');
      setDecks(prev => prev.filter(d => d.id !== id));
    } catch (err) {
       logError('Error deleting deck', err);
       toast.error('Failed to delete pitch deck');
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return { decks, loading, error, refresh: fetchDecks, createDeck, deleteDeck };
}
