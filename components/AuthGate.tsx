import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { realtimeService } from "../services/realtimeService";
import { useRouter, usePathname } from "next/navigation";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const user = JSON.parse(userStr);
                // Connect realtime service
                realtimeService.connect(user.id || user.stackUserId);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Auth check failed", e);
                setIsAuthenticated(false);
            }
        };

        checkAuth();

        return () => {
            realtimeService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated === false) {
            router.push('/login?from=' + encodeURIComponent(pathname));
        }
    }, [isAuthenticated, router, pathname]);

    if (isAuthenticated === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated === false) {
        return null;
    }

    return <>{children}</>;
}
