// src/hooks/useCrudResource.ts
import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "@/utils/getErrorMessage";

interface CrudService<TItem, TCreate, TUpdate> {
  getAll: () => Promise<TItem[]>;
  create: (payload: TCreate) => Promise<TItem>;
  update: (id: string, payload: TUpdate) => Promise<TItem>;
  delete: (id: string) => Promise<void>;
}

interface CrudMessages {
  loadError: string;
  createError: string;
  updateError: string;
  deleteError: string;
}

export function useCrudResource<
  TItem extends { id: string },
  TCreate,
  TUpdate,
>(service: CrudService<TItem, TCreate, TUpdate>, messages: CrudMessages) {
  const [items, setItems] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await service.getAll();
      setItems(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, messages.loadError));
    } finally {
      setLoading(false);
    }
  }, [service, messages.loadError]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createItem = async (payload: TCreate): Promise<TItem> => {
    try {
      const created = await service.create(payload);
      setItems((prev) => [...prev, created]);
      return created;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, messages.createError), {
        cause: err,
      });
    }
  };

  const updateItem = async (id: string, payload: TUpdate): Promise<TItem> => {
    try {
      const updated = await service.update(id, payload);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, messages.updateError), {
        cause: err,
      });
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      await service.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, messages.deleteError), {
        cause: err,
      });
    }
  };

  return {
    items,
    loading,
    error,
    refetch,
    createItem,
    updateItem,
    deleteItem,
  };
}