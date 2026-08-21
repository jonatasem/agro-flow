import React, { useState } from "react";
import { useCollaborator } from "../../hooks/useCollaborator";
import { CreateCollaboratorModal } from "../../components/collaborator/CreateCollaboratorModal";
import { type Collaborator } from "../../services/collaboratorService";
import { getErrorMessage } from "../../utility/getErrorMessage";

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
        const term = search.toLowerCase().trim();
        if (!term) return true;

        const nameMatch = collab.name?.toLowerCase().includes(term);
        const roleMatch = collab.role?.toLowerCase().includes(term);
        const regMatch = collab.registration?.toLowerCase().includes(term);

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
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-800">Colaboradores</h1>
          <p className="text-xs font-semibold text-slate-400">Técnicos, líderes e equipe cadastrada</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-slate-200/80 text-xs text-slate-800 font-medium placeholder-slate-400 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm w-full md:w-64"
          />
          <button
            onClick={refetch}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-xs text-slate-600 rounded-xl transition-colors shadow-sm cursor-pointer"
            title="Atualizar"
          >
            🔄
          </button>
          <button
            onClick={() => {
              setEditingCollaborator(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 whitespace-nowrap cursor-pointer"
          >
            + Colaborador
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 font-bold rounded-xl">
          {typeof error === "string" ? error : "Erro ao carregar colaboradores."}
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Carregando colaboradores...</p>
        </div>
      ) : filteredCollaborators.length === 0 ? (
        <div className="bg-white border border-slate-200/80 p-12 rounded-2xl text-center text-slate-500 text-sm shadow-sm">
          Nenhum colaborador encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCollaborators.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-3 hover:border-slate-300 transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{c.name}</h3>
                  <span className="text-xs text-emerald-700 font-bold block">{c.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  {c.registration && (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200 font-bold">
                      Matrícula: {c.registration}
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1 text-slate-400 hover:text-emerald-600 text-xs transition-colors cursor-pointer"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={deletingId === c.id}
                    className="p-1 text-slate-400 hover:text-red-600 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    title="Excluir"
                  >
                    {deletingId === c.id ? "⏳" : "🗑️"}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                <span>📍 {c.city || "Localidade não informada"}</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                    c.status !== false
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {c.status !== false ? "ATIVO" : "INATIVO"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCollaboratorModal
        key={editingCollaborator?.id || (isModalOpen ? "open" : "closed")}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={refetch}
        initialData={editingCollaborator}
      />
    </div>
  );
};