import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
} from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { emptyVault, type VaultData } from '@/types/note';

const VAULT_KEY = '@mojian:vault:v1';
const MASTER_KEY = 'mojian.master-key.v1';
const WEB_PREVIEW_KEY = '@mojian:web-preview-key:v1';
const RECOVERY_KEY = '@mojian:recovery-key:v2';
const AAD = new TextEncoder().encode('mojian-vault-v1');

export class VaultDecryptionError extends Error {
  constructor() {
    super('本机文稿密钥已丢失或密文已损坏');
    this.name = 'VaultDecryptionError';
  }
}

async function getStoredKey(): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(WEB_PREVIEW_KEY);
  return SecureStore.getItemAsync(MASTER_KEY).catch(() => null);
}

async function storeKey(value: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(WEB_PREVIEW_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(MASTER_KEY, value);
}

async function rememberKey(value: string): Promise<void> {
  await AsyncStorage.setItem(RECOVERY_KEY, value);
  await storeKey(value).catch(() => undefined);
}

async function newKey(): Promise<AESEncryptionKey> {
  const generated = (await AESEncryptionKey.generate()) as AESEncryptionKey;
  await rememberKey(await generated.encoded('base64'));
  return generated;
}

async function decryptWithKey(encrypted: string, encodedKey: string): Promise<VaultData> {
  const key = (await AESEncryptionKey.import(encodedKey, 'base64')) as AESEncryptionKey;
  const sealed = AESSealedData.fromCombined(encrypted);
  const bytes = await aesDecryptAsync(sealed, key, { additionalData: AAD });
  const parsed = JSON.parse(new TextDecoder().decode(bytes)) as VaultData;
  if (parsed.version !== 1 || !Array.isArray(parsed.notes)) throw new Error('文稿库版本无法识别');
  return parsed;
}

async function getKeyForSaving(): Promise<AESEncryptionKey> {
  const encoded = (await getStoredKey()) ?? (await AsyncStorage.getItem(RECOVERY_KEY));
  if (!encoded) return newKey();
  await rememberKey(encoded);
  return (await AESEncryptionKey.import(encoded, 'base64')) as AESEncryptionKey;
}

export async function loadVault(): Promise<VaultData> {
  const encrypted = await AsyncStorage.getItem(VAULT_KEY);
  if (!encrypted) return structuredClone(emptyVault);

  const secureKey = await getStoredKey();
  const recoveryKey = await AsyncStorage.getItem(RECOVERY_KEY);
  const candidates = [...new Set([secureKey, recoveryKey].filter((key): key is string => Boolean(key)))];
  for (const candidate of candidates) {
    try {
      const parsed = await decryptWithKey(encrypted, candidate);
      await rememberKey(candidate);
      return parsed;
    } catch {
      // Try the compatibility copy before declaring the vault unreadable.
    }
  }
  throw new VaultDecryptionError();
}

export async function saveVault(vault: VaultData): Promise<void> {
  const key = await getKeyForSaving();
  const bytes = new TextEncoder().encode(JSON.stringify(vault));
  const sealed = await aesEncryptAsync(bytes, key, { additionalData: AAD });
  await AsyncStorage.setItem(VAULT_KEY, await sealed.combined('base64'));
}

export async function destroyVault(): Promise<void> {
  await AsyncStorage.multiRemove([VAULT_KEY, WEB_PREVIEW_KEY, RECOVERY_KEY]);
  if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(MASTER_KEY).catch(() => undefined);
}

