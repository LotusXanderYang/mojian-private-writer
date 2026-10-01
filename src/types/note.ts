export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
};

export type VaultSettings = {
  lockOnBackground: boolean;
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
    lockOnBackground: true,
    preventScreenCapture: true,
  },
};

