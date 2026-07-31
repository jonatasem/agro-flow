import React, { useState } from "react";
import { useCollaborator } from "../hooks/useCollaborator";
import { CreateCollaboratorModal } from "../components/CreateCollaboratorModal";
import { type Collaborator } from "../services/collaboratorService";
import { getErrorMessage } from "../../../utility/getErrorMessage";

export const CollaboratorsPage: React.FC = () => {
  const {
    collaborators,
    loading,
    error,
    refetch,
    deleteCollaborator,
  } = useCollaborator();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredCollaborators = Array.isArray(collaborators)
    ? collaborators.filter((collab) => {
        const term = search.toLowerCase();
        const nameMatch = collab.name?.toLowerCase().includes(term);
        const roleMatch = collab.role?.toLowerCase().includes(term);
        const regMatch = collab.registration
          ? collab.registration.toLowerCase().includes(term)
          : false;

        return nameMatch || roleMatch || regMatch;
      })
    : [];

    const handleDelete = async (id: string, name: string) => {
      if (!window.confirm(`Tem certeza que deseja excluir o colaborador "${name}"?`)) {
        return;
      }

      try {
        setDeletingId(id);
        await deleteCollaborator(id);
      } catch (err: unknown) {
        alert(getErrorMessage(err, "Erro ao excluir colaborador."));
      } finally {
        setDeletingId(null);
      }
    };

  const handleEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCollaborator(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">Colaboradores</h1>
          <p className="text-xs text-slate-400">Técnicos, líderes e equipe cadastrada</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 w-full md:w-64"
          />
          <button
            onClick={refetch}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl transition-colors"
            title="Atualizar"
          >
            🔄
          </button>
          <button
            onClick={() => {
              setEditingCollaborator(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            + Colaborador
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
          {typeof error === "string" ? error : "Erro ao carregar colaboradores."}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
          Carregando colaboradores...
        </div>
      ) : filteredCollaborators.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
          Nenhum colaborador encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCollaborators.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 hover:border-slate-700 transition-colors shadow-lg"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{c.name}</h3>
                  <span className="text-xs text-indigo-300 font-medium">{c.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  {c.registration && (
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      Matrícula: {c.registration}
                    </span>
                  )}
                  {/* Botões de Ação */}
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1 text-slate-400 hover:text-indigo-400 text-xs transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={deletingId === c.id}
                    className="p-1 text-slate-400 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {deletingId === c.id ? "⏳" : "🗑️"}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span>📍 {c.city || "Localidade não informada"}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    c.status !== false
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                      : "bg-red-950 text-red-400 border border-red-800/40"
                  }`}
                >
                  {c.status !== false ? "ATIVO" : "INATIVO"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      <CreateCollaboratorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={refetch}
        initialData={editingCollaborator}
      />
    </div>
  );
};
