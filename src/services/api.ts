import { logError } from "@/lib/logger";

const API_URL = '/api';

export const api = {
    async get(endpoint: string) {
        try {
            const res = await fetch(`${API_URL}${endpoint}`);
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            return await res.json();
        } catch (e) {
            logError(`GET ${endpoint} failed`, e);
            return null;
        }
    },

    async post(endpoint: string, data: any) {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            return await res.json();
        } catch (e) {
            logError(`POST ${endpoint} failed`, e);
            return null;
        }
    },

    async delete(endpoint: string) {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
            return await res.json();
        } catch (e) {
            logError(`DELETE ${endpoint} failed`, e);
            return null;
        }
    }
};
