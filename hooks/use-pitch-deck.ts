import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { PitchDeck } from './use-pitch-decks';
import { logError } from '@/lib/logger';

export interface SlideComponent {
    id: string;
    slideId: string;
    type: 'text' | 'image' | 'chart' | 'shape';
    content: any;
    position: { x: number; y: number; width: number; height: number; rotation?: number };
    style: any;
    animation?: any;
    zIndex: number;
}

export interface Slide {
    id: string;
    deckId: string;
    order: number;
    layout: string;
    title: string;
    notes?: string;
    isVisible: boolean;
    components: SlideComponent[];
}

export interface FullPitchDeck extends PitchDeck {
    slides: Slide[];
}

export function usePitchDeck(id: string) {
    const [deck, setDeck] = useState<FullPitchDeck | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDeck = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/pitch-decks/${id}`, { headers });
            
            if (!response.ok) {
                if (response.status === 404) throw new Error('Deck not found');
                throw new Error('Failed to fetch deck');
            }

            const data = await response.json();
            setDeck(data);
            setError(null);
        } catch (err) {
            logError('Error fetching deck', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            toast.error('Failed to load pitch deck');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDeck();
    }, [fetchDeck]);

    const updateSlide = async (slideId: string, updates: Partial<Slide>) => {
        // Optimistic update
        setDeck(prev => {
            if (!prev) return null;
            return {
                ...prev,
                slides: prev.slides.map(s => s.id === slideId ? { ...s, ...updates } : s)
            };
        });

        try {
            const token = localStorage.getItem('authToken');
            const headers: HeadersInit = { 
                'Content-Type': 'application/json',
            };
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/slides/${slideId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to save slide');
        } catch (err) {
            logError('Error saving slide', err);
            toast.error('Failed to save changes');
            fetchDeck(); // Revert
        }
    };

    const addSlide = async (order?: number) => {
        try {
            const token = localStorage.getItem('authToken');
            const headers: HeadersInit = { 
                'Content-Type': 'application/json',
            };
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/slides', {
                method: 'POST',
                headers,
                body: JSON.stringify({ deckId: id, order })
            });

            if (!response.ok) throw new Error('Failed to add slide');
            
            const newSlide = await response.json();
            // Add to state
             setDeck(prev => {
                if (!prev) return null;
                // If order wasn't specified, append. If it was, insert (logic needed for reordering but simple append for now)
                return {
                    ...prev,
                    slides: [...prev.slides, { ...newSlide, components: [] }]
                };
            });
            return newSlide;
        } catch (err) {
             logError('Error adding slide', err);
             toast.error('Failed to add slide');
        }
    };

    const addComponent = async (slideId: string, type: SlideComponent['type'], content: any) => {
        try {
            const token = localStorage.getItem('authToken');
            const headers: HeadersInit = { 
                'Content-Type': 'application/json',
            };
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }

            // Default position center of 16:9 slide (960x540)
            const position = { x: 380, y: 220, width: 200, height: 100, rotation: 0 };
            
            // Adjust defaults based on type
            if (type === 'image') {
                 position.width = 300;
                 position.height = 200;
            }

            const response = await fetch(`/api/slides/${slideId}/components`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ type, content, position })
            });

            if (!response.ok) throw new Error('Failed to add component');
            
            const newComponent = await response.json();
             
             // Optimistic Update
             setDeck(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    slides: prev.slides.map(s => s.id === slideId ? {
                        ...s,
                        components: [...(s.components || []), newComponent]
                    } : s)
                };
            });
            return newComponent;
        } catch (err) {
             logError('Error adding component', err);
             toast.error('Failed to add element');
        }
    };

    const updateComponent = async (slideId: string, componentId: string, updates: Partial<SlideComponent>) => {
        // Optimistic update
        setDeck(prev => {
            if (!prev) return null;
            return {
                ...prev,
                slides: prev.slides.map(s => s.id === slideId ? {
                    ...s,
                    components: s.components.map(c => c.id === componentId ? { ...c, ...updates } : c)
                } : s)
            };
        });

        // Debounce actual API call? For now direct, assuming robust connection or local state management later
        try {
             const token = localStorage.getItem('authToken');
            const headers: HeadersInit = { 
                'Content-Type': 'application/json',
            };
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }

            // Note: API needs to support component updates specifically or we update the whole slide
            // For now, let's assume we have a granular endpoint or use the slide update one
            // Ideally: PUT /api/slides/:id/components/:compId
            
            const response = await fetch(`/api/slides/${slideId}/components/${componentId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to save component');

        } catch (err) {
            logError('Error saving component', err);
             // toast.error('Failed to save moving element'); // Too noisy for drag
        }
    };

    const deleteComponent = async (slideId: string, componentId: string) => {
         setDeck(prev => {
            if (!prev) return null;
            return {
                ...prev,
                slides: prev.slides.map(s => s.id === slideId ? {
                    ...s,
                    components: s.components.filter(c => c.id !== componentId)
                } : s)
            };
        });

        try {
             const token = localStorage.getItem('authToken');
             const headers: HeadersInit = { 
                'Content-Type': 'application/json',
            };
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }

            await fetch(`/api/slides/${slideId}/components/${componentId}`, {
                headers
            });
        } catch (err) {
            logError('Error deleting component', err);
            toast.error('Failed to delete element');
            fetchDeck(); // Revert
        }
    }

    return { deck, loading, error, refresh: fetchDeck, updateSlide, addSlide, addComponent, updateComponent, deleteComponent };
}
