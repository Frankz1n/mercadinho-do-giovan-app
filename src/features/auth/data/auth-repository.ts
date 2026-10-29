import type { AppUser, UserRole } from '@/features/auth/domain/auth';
import { profileDetailsSchema } from '@/features/auth/profile-schema';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
};

function mapProfile(row: ProfileRow): AppUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase('pt-BR');
}

function authErrorMessage(error: { message: string; code?: string } | null, fallback: string) {
  if (!error) {
    return fallback;
  }

  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'Já existe uma conta com este e-mail.';
  }
  if (message.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.';
  }
  return error.message || fallback;
}

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, phone, role, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProfile(data as ProfileRow) : null;
}

export class AuthRepository {
  async getCurrentUser(): Promise<AppUser | null> {
    assertSupabaseConfigured();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!session?.user) {
      return null;
    }

    return fetchProfile(session.user.id);
  }

  async login(email: string, password: string): Promise<AppUser> {
    assertSupabaseConfigured();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (error || !data.user) {
      throw new Error(authErrorMessage(error, 'E-mail ou senha incorretos.'));
    }

    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      throw new Error('Perfil não encontrado. Tente novamente em instantes.');
    }

    return profile;
  }

  async register(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AppUser> {
    assertSupabaseConfigured();

    const email = normalizeEmail(input.email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          name: input.name.trim(),
          phone: input.phone.trim(),
        },
      },
    });

    if (error || !data.user) {
      throw new Error(authErrorMessage(error, 'Não foi possível criar a conta.'));
    }

    if (!data.session) {
      throw new Error(
        'Conta criada. Confirme o e-mail (ou desative a confirmação no Supabase Auth) e faça login.',
      );
    }

    // Garante telefone/nome no profile (trigger já criou a linha).
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: input.name.trim(),
        phone: input.phone.trim(),
        email,
      })
      .eq('id', data.user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const profile = await fetchProfile(data.user.id);
    if (!profile) {
      throw new Error('Conta criada, mas o perfil ainda não está disponível.');
    }

    return profile;
  }

  async recoverPassword(email: string): Promise<{ message: string }> {
    assertSupabaseConfigured();

    const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email));

    if (error) {
      throw new Error(authErrorMessage(error, 'Não foi possível enviar o e-mail de recuperação.'));
    }

    return {
      message:
        'Se existir uma conta com este e-mail, enviamos as instruções de recuperação.',
    };
  }

  async updateProfile(input: { name: string; phone: string }): Promise<AppUser> {
    assertSupabaseConfigured();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session?.user) {
      throw new Error('Faça login para atualizar seus dados.');
    }

    const parsed = profileDetailsSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
    }

    const { name, phone } = parsed.data;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ name, phone })
      .eq('id', session.user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: metaError } = await supabase.auth.updateUser({
      data: { name, phone },
    });

    if (metaError) {
      throw new Error(metaError.message);
    }

    const profile = await fetchProfile(session.user.id);
    if (!profile) {
      throw new Error('Não foi possível carregar o perfil atualizado.');
    }

    return profile;
  }

  async logout(): Promise<void> {
    assertSupabaseConfigured();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }
}

export const authRepository = new AuthRepository();
