-- Home mostra só is_featured: destaca os 21 produtos com packshot local.
-- Demais itens das cestas continuam ativos no catálogo/categorias.

update public.products
set is_featured = false, updated_at = now()
where id in (
  'beans-1kg',
  'flour-yellow-1kg',
  'quirera-500g',
  'eggs-30',
  'toothpaste'
);

update public.products
set is_featured = true, is_active = true, updated_at = now()
where id in (
  'rice-5kg',
  'sugar-2kg',
  'coffee-coamo',
  'oil-900ml',
  'milk-1l',
  'tomato-sauce',
  'salt-1kg',
  'wheat-1kg',
  'wafer',
  'pasta-500g',
  'soda-coke-2l',
  'margarine-250g',
  'softener-ype-2l',
  'disinfectant-2l',
  'detergent-ype',
  'bleach-1l',
  'soap-powder-800g',
  'laundry-bar',
  'toilet-paper-4',
  'soap-unit',
  'toothpaste-colgate'
);
