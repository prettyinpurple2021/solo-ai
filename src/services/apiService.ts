import { logError } from '@/lib/logger';

// ... (imports)

// ... (imports)
// This abstracts all backend API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface GenerateRequest {
    prompt: string;
    systemInstruction: string;
    model?: string;
    history?: Array<{ role: 'user' | 'model'; text: string }>;
    temperature?: number;
    maxOutputTokens?: number;
}

interface GenerateResponse {
    text: string;
}

export const apiService = {
    /**
     * Generate AI content via backend proxy
     * This keeps the API key secure on the server side
     */
    async generate(request: GenerateRequest): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Generation failed');
            }

            const data: GenerateResponse = await response.json();
            return data.text;
        } catch (error) {
            logError('API Service Error:', error);
            throw error;
        }
    },

    /**
     * Health check to verify backend is accessible
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            const data = await response.json();
            return data.status === 'ok';
        } catch (error) {
            logError('Health check failed:', error);
            return false;
        }
    },
    async post<T = unknown>(endpoint: string, body: unknown): Promise<T> {
        try {
            const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            logError('API Service Error:', error);
            throw error;
        }
    },
    async get<T = unknown>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            logError('API Service Error:', error);
            throw error;
        }
    },
};
