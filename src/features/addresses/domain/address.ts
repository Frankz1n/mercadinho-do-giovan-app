export type Address = {
  id: string;
  userId: string;
  label: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressDraft = {
  label: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
};

export function formatAddressLine(address: Address): string {
  const complement = address.complement.trim()
    ? `, ${address.complement.trim()}`
    : '';
  return `${address.street}, ${address.number}${complement}`;
}

export function formatAddressCity(address: Address): string {
  return `${address.neighborhood} · ${address.city}/${address.state} · CEP ${address.zipCode}`;
}
