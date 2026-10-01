import AsyncStorage from '@react-native-async-storage/async-storage';
import { AESEncryptionKey, AESSealedData, aesDecryptAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { emptyVault, type VaultData } from '@/types/note';

const PRIMARY_KEY = '@mojian:vault:plain:v2';
const BACKUP_KEY = '@mojian:vault:plain-backup:v2';
const STAGING_KEY = '@mojian:vault:plain-staging:v2';

const LEGACY_VAULT_KEY = '@mojian:vault:v1';
const LEGACY_MASTER_KEY = 'mojian.master-key.v1';
const LEGACY_WEB_KEY = '@mojian:web-preview-key:v1';
const LEGACY_RECOVERY_KEY = '@mojian:recovery-key:v2';
const LEGACY_AAD = new TextEncoder().encode('mojian-vault-v1');

type VaultEnvelope = {
  format: 2;
  savedAt: number;
  vault: VaultData;
};

export class LegacyVaultMigrationError extends Error {
  constructor() {
    super('旧版文稿无法迁移');
    this.name = 'LegacyVaultMigrationError';
  }
}

function isVaultData(value: unknown): value is VaultData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<VaultData>;
  return candidate.version === 1 && Array.isArray(candidate.notes) && Boolean(candidate.settings);
}

function parseEnvelope(raw: string | null): VaultEnvelope | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<VaultEnvelope>;
    if (parsed.format !== 2 || typeof parsed.savedAt !== 'number' || !isVaultData(parsed.vault)) return null;
    return parsed as VaultEnvelope;
  } catch {
    return null;
  }
}

async function loadPlainVault(): Promise<VaultEnvelope | null> {
  const records = await AsyncStorage.multiGet([PRIMARY_KEY, BACKUP_KEY, STAGING_KEY]);
  return records
    .map(([, raw]) => parseEnvelope(raw))
    .filter((item): item is VaultEnvelope => item !== null)
    .sort((a, b) => b.savedAt - a.savedAt)[0] ?? null;
}

async function legacyKeyCandidates(): Promise<string[]> {
  const [recoveryKey, webKey] = await AsyncStorage.multiGet([LEGACY_RECOVERY_KEY, LEGACY_WEB_KEY]);
  const secureKey = Platform.OS === 'web'
    ? null
    : await SecureStore.getItemAsync(LEGACY_MASTER_KEY).catch(() => null);
  return [...new Set([secureKey, recoveryKey[1], webKey[1]].filter((key): key is string => Boolean(key)))];
}

async function migrateLegacyVault(encrypted: string): Promise<VaultData> {
  for (const encodedKey of await legacyKeyCandidates()) {
    try {
      const key = (await AESEncryptionKey.import(encodedKey, 'base64')) as AESEncryptionKey;
      const sealed = AESSealedData.fromCombined(encrypted);
      const bytes = await aesDecryptAsync(sealed, key, { additionalData: LEGACY_AAD });
      const parsed = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
      if (isVaultData(parsed)) return parsed;
    } catch {
      // Try every remaining legacy copy before reporting that migration is unavailable.
    }
  }
  throw new LegacyVaultMigrationError();
}

async function removeLegacyStorage(): Promise<void> {
  await AsyncStorage.multiRemove([LEGACY_VAULT_KEY, LEGACY_WEB_KEY, LEGACY_RECOVERY_KEY]);
  if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(LEGACY_MASTER_KEY).catch(() => undefined);
}

export async function loadVault(): Promise<VaultData> {
  const plain = await loadPlainVault();
  if (plain) {
    await saveVault(plain.vault);
    await removeLegacyStorage();
    return plain.vault;
  }

  const encrypted = await AsyncStorage.getItem(LEGACY_VAULT_KEY);
  if (encrypted) {
    const migrated = await migrateLegacyVault(encrypted);
    await saveVault(migrated);
    await removeLegacyStorage();
    return migrated;
  }

  await removeLegacyStorage();
  return structuredClone(emptyVault);
}

export async function saveVault(vault: VaultData): Promise<void> {
  const serialized = JSON.stringify({ format: 2, savedAt: Date.now(), vault } satisfies VaultEnvelope);
  let recoverableWriteSucceeded = false;

  try {
    await AsyncStorage.setItem(STAGING_KEY, serialized);
    recoverableWriteSucceeded = true;
  } catch {
    // Continue: the primary slot may still be writable.
  }

  try {
    await AsyncStorage.setItem(PRIMARY_KEY, serialized);
    recoverableWriteSucceeded = true;
    await AsyncStorage.setItem(BACKUP_KEY, serialized).catch(() => undefined);
    await AsyncStorage.removeItem(STAGING_KEY).catch(() => undefined);
  } catch {
    // A valid staging copy is enough for loadVault to recover on the next launch.
  }

  if (!recoverableWriteSucceeded) throw new Error('本机存储暂时不可写');
}

export async function destroyVault(): Promise<void> {
  await AsyncStorage.multiRemove([
    PRIMARY_KEY,
    BACKUP_KEY,
    STAGING_KEY,
    LEGACY_VAULT_KEY,
    LEGACY_WEB_KEY,
    LEGACY_RECOVERY_KEY,
  ]);
  if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(LEGACY_MASTER_KEY).catch(() => undefined);
}
