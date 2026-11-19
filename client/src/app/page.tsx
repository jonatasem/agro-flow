'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const destination = isAuthenticated ? "/dashboard" : "/login";
    router.replace(destination);
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-400 animate-pulse">
        Carregando AgroFlow...
      </p>
    </div>
  );
}