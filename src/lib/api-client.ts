import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions if used
});

// Add interceptor to include auth token if available (e.g. from NextAuth session or localStorage)
apiClient.interceptors.request.use((config) => {
    // If we have a way to get the token synchronously, add it here.
    // Since NextAuth session is async, we might pass the token in individual requests or use a stronger pattern later.
    // For now, we'll assume the backend handles auth via shared cookies or we pass headers explicitly in the hook.
    return config;
});

export const endpoints = {
    health: '/api/health',
    auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        me: '/api/auth/me',
    },
    billing: {
        createCheckoutSession: '/api/billing/checkout',
        subscription: '/api/billing/subscription',
        portal: '/api/billing/portal',
        cancelSubscription: '/api/billing/cancel-subscription',
        reactivateSubscription: '/api/billing/reactivate-subscription',
    },
    stripe: {
        createCheckoutSession: '/api/billing/checkout',
        subscription: '/api/billing/subscription',
        usage: '/api/stripe/usage',
        customerPortal: '/api/billing/portal',
    },
    ai: {
        generate: '/api/generate',
        chat: '/api/chat',
    },
    briefcase: {
        base: '/api/unified-briefcase',
    }
};
