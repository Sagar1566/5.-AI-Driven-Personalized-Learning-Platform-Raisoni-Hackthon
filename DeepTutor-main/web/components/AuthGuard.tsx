"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, initialized } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!initialized) return;

        if (!isAuthenticated && pathname !== "/login") {
            router.push("/login");
        } else if (isAuthenticated && pathname === "/login") {
            router.push("/");
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, initialized, pathname, router]);

    // Show loading while checking auth state or initializing
    if (!initialized || (isChecking && !isAuthenticated && pathname !== "/login")) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // If unauthenticated and on login page, verify checking is done or just render
    if (!isAuthenticated && pathname === "/login") {
        return <>{children}</>;
    }

    // If authenticated and on login page, we are redirecting, so show loading
    if (isAuthenticated && pathname === "/login") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return <>{children}</>;
}
