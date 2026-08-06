import React from "react";
import { useAuth } from "../hooks/useAuth";


export const UserProfile: React.FC = () => {

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
        <h1>Perfil do Usuário</h1>
        <p>
          Aqui você pode visualizar e editar suas informações de perfil.
        </p>
        {user && (
          <div className="space-y-2">
            <p>{user.name}</p>
            <p>{user.city}</p>
            <p>Cargo: {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};
