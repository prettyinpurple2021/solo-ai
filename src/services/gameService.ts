import { UserProgress, ToastMessage } from "../types";
import { storageService } from "./storageService";

const RANKS = [
    { level: 1, title: "Garage Hacker" },
    { level: 5, title: "Bootstrapped Believer" },
    { level: 10, title: "Seed Stage Strategist" },
    { level: 20, title: "Series A Architect" },
    { level: 35, title: "Market Disruptor" },
    { level: 50, title: "Unicorn Visionary" },
    { level: 75, title: "Industry Titan" },
    { level: 100, title: "IPO God" }
];

const BASE_XP = 100;
const EXPONENT = 1.5;

export const getLevelFromXP = (xp: number) => {
    return Math.floor(Math.pow(xp / BASE_XP, 1 / EXPONENT)) + 1;
};

export const getXPForLevel = (level: number) => {
    return Math.floor(BASE_XP * Math.pow(level - 1, EXPONENT));
};

export const getRankTitle = (level: number) => {
    const rank = [...RANKS].reverse().find(r => level >= r.level);
    return rank ? rank.title : RANKS[0].title;
};

export const getUserProgress = async (): Promise<UserProgress> => {
    const data = await storageService.getUserProgress();
    const level = getLevelFromXP(data.currentXP || 0);
    const nextLevelXP = getXPForLevel(level + 1);

    return {
        level,
        currentXP: data.currentXP || 0,
        nextLevelXP,
        rankTitle: getRankTitle(level),
        totalActions: data.totalActions || 0,
        achievements: data.achievements || []
    };
};

export const addXP = async (amount: number): Promise<{ progress: UserProgress, leveledUp: boolean }> => {
    const current = await getUserProgress();
    const newXP = current.currentXP + amount;

    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > current.level;

    const newData: UserProgress = {
        ...current,
        currentXP: newXP,
        level: newLevel,
        totalActions: current.totalActions + 1,
        rankTitle: getRankTitle(newLevel),
        nextLevelXP: getXPForLevel(newLevel + 1)
    };

    await storageService.saveUserProgress(newData);

    return {
        progress: newData,
        leveledUp
    };
};

// Simple Event Bus for Toasts
type ToastListener = (toast: ToastMessage) => void;
let listeners: ToastListener[] = [];

export const subscribeToToasts = (listener: ToastListener) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
};

export const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'xp' = 'info', xpAmount?: number, arg_UserProgress?: UserProgress) => {
    const toast: ToastMessage = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        type,
        xpAmount
    };
    listeners.forEach(l => l(toast));
};