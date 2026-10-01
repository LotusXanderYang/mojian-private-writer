import { randomUUID } from 'expo-crypto';
import { createContext, type PropsWithChildren, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { destroyVault, loadVault, saveVault } from '@/lib/crypto-store';
import { emptyVault, type Note, type VaultData, type VaultSettings } from '@/types/note';

type NotesContextValue = {
  vault: VaultData;
  ready: boolean;
  error: string | null;
  createNote: () => Promise<string>;
  updateNote: (id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'pinned'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<VaultSettings>) => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: PropsWithChildren) {
  const [vault, setVault] = useState<VaultData>(emptyVault);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vaultRef = useRef<VaultData>(emptyVault);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    loadVault()
      .then((loaded) => {
        vaultRef.current = loaded;
        setVault(loaded);
      })
      .catch(() => setError('无法读取现有文稿。旧版密钥可能已被系统清除；为避免覆盖原密文，墨笺没有自动创建新密钥。'))
      .finally(() => setReady(true));
  }, []);

  const commit = useCallback(async (mutate: (current: VaultData) => VaultData) => {
    const nextVault = mutate(vaultRef.current);
    vaultRef.current = nextVault;
    setVault(nextVault);
    saveQueue.current = saveQueue.current.then(() => saveVault(nextVault));
    await saveQueue.current;
  }, []);

  const createNote = useCallback(async () => {
    const now = Date.now();
    const id = randomUUID();
    await commit((current) => ({
      ...current,
      notes: [{ id, title: '', body: '', createdAt: now, updatedAt: now, pinned: false }, ...current.notes],
    }));
    return id;
  }, [commit]);

  const updateNote = useCallback(
    async (id: string, patch: Partial<Pick<Note, 'title' | 'body' | 'pinned'>>) => {
      await commit((current) => ({
        ...current,
        notes: current.notes.map((note) => note.id === id ? { ...note, ...patch, updatedAt: Date.now() } : note),
      }));
    },
    [commit],
  );

  const deleteNote = useCallback(async (id: string) => {
    await commit((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }));
  }, [commit]);

  const updateSettings = useCallback(async (patch: Partial<VaultSettings>) => {
    await commit((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }, [commit]);

  const clearAll = useCallback(async () => {
    await saveQueue.current;
    await destroyVault();
    const reset = structuredClone(emptyVault);
    vaultRef.current = reset;
    setVault(reset);
    await saveVault(reset);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ vault, ready, error, createNote, updateNote, deleteNote, updateSettings, clearAll }),
    [vault, ready, error, createNote, updateNote, deleteNote, updateSettings, clearAll],
  );

  return <NotesContext value={value}>{children}</NotesContext>;
}

export function useNotes() {
  const context = use(NotesContext);
  if (!context) throw new Error('useNotes 必须在 NotesProvider 内使用');
  return context;
}

