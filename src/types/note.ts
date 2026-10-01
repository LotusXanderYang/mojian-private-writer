export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
};

export type VaultSettings = {
  preventScreenCapture: boolean;
};

export type VaultData = {
  version: 1;
  notes: Note[];
  settings: VaultSettings;
};

export const emptyVault: VaultData = {
  version: 1,
  notes: [],
  settings: {
    preventScreenCapture: true,
  },
};

