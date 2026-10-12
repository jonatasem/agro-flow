'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

//Verifica o estado de autenticação e redireciona o utilizador adequadamente.
export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Aguarda o carregamento inicial da autenticação para evitar redirecionamentos prematuros
    if (!loading) {
      if (isAuthenticated) {
        router.replace("/dashboard"); 
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  // Ecrã de carregamento temporário enquanto valida a sessão
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-400 animate-pulse">
        A carregar AgroFlow...
      </p>
    </div>
  );
}