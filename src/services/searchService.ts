// Universal Search Service
import { logError } from '@/lib/logger';

export interface SearchResult {
    id: string;
    type: 'task' | 'chat' | 'warroom' | 'contact' | 'report' | 'document';
    title: string;
    snippet: string; // Highlighted match context
    path: string; // Where to navigate (e.g., '/app/roadmap', '/app/chat/roxy')
    timestamp: string;
    relevance: number; // 0-100 score
    tags?: string[];
}

export interface SearchFilters {
    types?: string[];
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
}

class SearchService {
    /**
     * Search across all user data
     */
    async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ filters })
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            return await response.json();
        } catch (error) {
            logError('Search error:', error);
            return [];
        }
    }

    /**
     * Index an entity for search
     */
    async indexEntity(
        type: SearchResult['type'],
        id: string,
        title: string,
        content: string,
        tags?: string[]
    ): Promise<void> {
        try {
            await fetch('/api/search/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, title, content, tags })
            });
        } catch (error) {
            logError('Indexing error:', error);
        }
    }

    /**
     * Remove entity from search index
     */
    async removeFromIndex(type: SearchResult['type'], id: string): Promise<void> {
        try {
            await fetch('/api/search/index', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id })
            });
        } catch (error) {
            logError('Remove from index error:', error);
        }
    }

    /**
     * Get recent searches
     */
    getRecentSearches(): string[] {
        const recent = localStorage.getItem('recent_searches');
        return recent ? JSON.parse(recent) : [];
    }

    /**
     * Save search to recent
     */
    saveRecentSearch(query: string): void {
        const recent = this.getRecentSearches();
        const updated = [query, ...recent.filter(q => q !== query)].slice(0, 5);
        localStorage.setItem('recent_searches', JSON.stringify(updated));
    }
}

export const searchService = new SearchService();
