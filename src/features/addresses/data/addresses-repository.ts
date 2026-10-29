import type { Address, AddressDraft } from '@/features/addresses/domain/address';
import { digitsOnly } from '@/features/addresses/data/via-cep';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';

type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    zipCode: row.zip_code,
    street: row.street,
    number: row.number,
    complement: row.complement,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeDraft(draft: AddressDraft) {
  const zipCode = digitsOnly(draft.zipCode);
  const state = draft.state.trim().toUpperCase();

  if (zipCode.length !== 8) {
    throw new Error('Informe um CEP válido.');
  }
  if (!draft.street.trim()) {
    throw new Error('Informe a rua.');
  }
  if (!draft.number.trim()) {
    throw new Error('Informe o número.');
  }
  if (!draft.neighborhood.trim()) {
    throw new Error('Informe o bairro.');
  }
  if (!draft.city.trim()) {
    throw new Error('Informe a cidade.');
  }
  if (state.length !== 2) {
    throw new Error('Informe a UF com 2 letras.');
  }

  return {
    label: draft.label.trim() || 'Casa',
    zip_code: `${zipCode.slice(0, 5)}-${zipCode.slice(5)}`,
    street: draft.street.trim(),
    number: draft.number.trim(),
    complement: draft.complement.trim(),
    neighborhood: draft.neighborhood.trim(),
    city: draft.city.trim(),
    state,
    is_default: draft.isDefault,
    updated_at: new Date().toISOString(),
  };
}

export class AddressesRepository {
  async listByUser(userId: string): Promise<Address[]> {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as AddressRow[]).map(mapAddress);
  }

  async getById(addressId: string): Promise<Address | null> {
    assertSupabaseConfigured();

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapAddress(data as AddressRow) : null;
  }

  async create(userId: string, draft: AddressDraft): Promise<Address> {
    assertSupabaseConfigured();

    const payload = normalizeDraft(draft);
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        ...payload,
        user_id: userId,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Não foi possível salvar o endereço.');
    }

    return mapAddress(data as AddressRow);
  }

  async update(addressId: string, draft: AddressDraft): Promise<Address> {
    assertSupabaseConfigured();

    const payload = normalizeDraft(draft);
    const { data, error } = await supabase
      .from('addresses')
      .update(payload)
      .eq('id', addressId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Não foi possível atualizar o endereço.');
    }

    return mapAddress(data as AddressRow);
  }

  async remove(addressId: string): Promise<void> {
    assertSupabaseConfigured();

    const { error } = await supabase.from('addresses').delete().eq('id', addressId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async setDefault(addressId: string): Promise<void> {
    assertSupabaseConfigured();

    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', addressId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const addressesRepository = new AddressesRepository();
