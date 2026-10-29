export type ViaCepResult = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatZipCode(value: string): string {
  const digits = digitsOnly(value).slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function lookupZipCode(zipCode: string): Promise<ViaCepResult> {
  const cep = digitsOnly(zipCode);
  if (cep.length !== 8) {
    throw new Error('Informe um CEP com 8 dígitos.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP.');
  }

  const payload = (await response.json()) as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };

  if (payload.erro) {
    throw new Error('CEP não encontrado.');
  }

  return {
    street: payload.logradouro?.trim() ?? '',
    neighborhood: payload.bairro?.trim() ?? '',
    city: payload.localidade?.trim() ?? '',
    state: (payload.uf ?? '').trim().toUpperCase(),
  };
}
