const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrencyFromCents(valueInCents: number) {
  return BRL_FORMATTER.format(valueInCents / 100);
}
