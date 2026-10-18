import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AppUser, Session, StoredUser } from '@/features/auth/domain/auth';
import { hashSecret } from '@/lib/hash';
import { readJson, writeJson } from '@/lib/storage';

const USERS_KEY = '@mercadinho/users';
const SESSION_KEY = 'mercadinho.session';

const ADMIN_EMAIL = 'giovan@mercadinho.local';
const ADMIN_PASSWORD = 'giovan123';

function toPublicUser(user: StoredUser): AppUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

async function readSession(): Promise<Session | null> {
  try {
    if (Platform.OS === 'web') {
      return readJson<Session | null>(SESSION_KEY, null);
    }

    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

async function writeSession(session: Session | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (!session) {
      const { removeKey } = await import('@/lib/storage');
      await removeKey(SESSION_KEY);
      return;
    }
    await writeJson(SESSION_KEY, session);
    return;
  }

  if (!session) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

async function ensureSeedUsers(): Promise<StoredUser[]> {
  const users = await readJson<StoredUser[]>(USERS_KEY, []);
  const hasAdmin = users.some((user) => user.email === ADMIN_EMAIL);

  if (hasAdmin) {
    return users;
  }

  const admin: StoredUser = {
    id: 'user-admin-giovan',
    name: 'Giovan',
    email: ADMIN_EMAIL,
    phone: '(11) 90000-0000',
    role: 'admin',
    passwordHash: await hashSecret(ADMIN_PASSWORD),
    createdAt: new Date().toISOString(),
  };
  const nextUsers = [...users, admin];
  await writeJson(USERS_KEY, nextUsers);
  return nextUsers;
}

function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase('pt-BR');
}

export class AuthRepository {
  async getCurrentUser(): Promise<AppUser | null> {
    const users = await ensureSeedUsers();
    const session = await readSession();
    if (!session) {
      return null;
    }

    const user = users.find((entry) => entry.id === session.userId);
    return user ? toPublicUser(user) : null;
  }

  async login(email: string, password: string): Promise<AppUser> {
    const users = await ensureSeedUsers();
    const normalizedEmail = normalizeEmail(email);
    const passwordHash = await hashSecret(password);
    const user = users.find(
      (entry) => entry.email === normalizedEmail && entry.passwordHash === passwordHash,
    );

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    await writeSession({ userId: user.id });
    return toPublicUser(user);
  }

  async register(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AppUser> {
    const users = await ensureSeedUsers();
    const normalizedEmail = normalizeEmail(input.email);

    if (users.some((entry) => entry.email === normalizedEmail)) {
      throw new Error('Já existe uma conta com este e-mail.');
    }

    const user: StoredUser = {
      id: `user-${Date.now()}`,
      name: input.name.trim(),
      email: normalizedEmail,
      phone: input.phone.trim(),
      role: 'customer',
      passwordHash: await hashSecret(input.password),
      createdAt: new Date().toISOString(),
    };

    await writeJson(USERS_KEY, [...users, user]);
    await writeSession({ userId: user.id });
    return toPublicUser(user);
  }

  async recoverPassword(email: string): Promise<{ temporaryPassword: string }> {
    const users = await ensureSeedUsers();
    const normalizedEmail = normalizeEmail(email);
    const index = users.findIndex((entry) => entry.email === normalizedEmail);

    if (index < 0) {
      throw new Error('Não encontramos uma conta com este e-mail.');
    }

    const temporaryPassword = `temp${Math.floor(1000 + Math.random() * 9000)}`;
    const nextUsers = [...users];
    nextUsers[index] = {
      ...nextUsers[index],
      passwordHash: await hashSecret(temporaryPassword),
    };
    await writeJson(USERS_KEY, nextUsers);

    return { temporaryPassword };
  }

  async logout(): Promise<void> {
    await writeSession(null);
  }
}

export const authRepository = new AuthRepository();

export const LOCAL_ADMIN_HINT = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
};
