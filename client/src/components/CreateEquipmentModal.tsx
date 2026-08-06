import React, { useState } from "react";
import { api } from "../services/api";
import { getErrorMessage } from "../utility/getErrorMessage";

interface ModalProps {
  isOpen: boolean;       
  onClose: () => void;   
  onSuccess: () => void; 
}

export const CreateEquipmentModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fleet, setFleet] = useState("");
  const [name, setName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fleet.trim() || !name.trim()) return;

    try {
      setLoading(true);
      setError("");
      
      await api.post("/equipment", { fleet, name });
      
      setFleet("");
      setName("");
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao cadastrar equipamento."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md space-y-5 shadow-2xl animate-slide-in">
        
        {/* Cabeçalho do modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-800">Novo Equipamento</h2>
            <p className="text-xs text-slate-400">Cadastrar maquinário agrícola na frota</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Alerta visual de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Frota / Prefixo *</label>
            <input
              type="text"
              required
              placeholder="Ex: 4022"
              value={fleet}
              onChange={(e) => setFleet(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nome / Modelo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Trator John Deere 6115J"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 font-bold rounded-xl transition-all"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-600/15 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Cadastrar Equipamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};