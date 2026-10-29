-- Seed do catálogo (rode após as migrations). Não cria usuários Auth.
-- Admin: cadastre no app e promova com:
--   update public.profiles set role = 'admin' where email = 'seu@email.com';
--
-- Estoque: ao vender uma cesta, o RPC place_order desconta cada componente.

insert into public.categories (id, name, visual) values
  ('produce', 'Hortifruti', 'produce'),
  ('pantry', 'Mercearia', 'rice'),
  ('beverages', 'Bebidas', 'milk'),
  ('cleaning', 'Limpeza', 'cleaning'),
  ('hygiene', 'Higiene', 'cleaning')
on conflict (id) do nothing;

insert into public.products (
  id, category_id, name, description, unit_label, price_cents,
  stock_quantity, is_featured, visual, image_url, is_active
) values
  ('rice-5kg', 'pantry', 'Arroz 5kg', 'Arroz tipo 1, pacote de 5 kg.', 'pacote 5 kg', 2490, 80, true, 'rice', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80', true),
  ('beans-1kg', 'pantry', 'Feijão 1kg', 'Feijão carioca, pacote de 1 kg.', 'pacote 1 kg', 899, 100, false, 'beans', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80', true),
  ('flour-yellow-1kg', 'pantry', 'Farinha amarela 1kg', 'Farinha de milho amarela, pacote de 1 kg.', 'pacote 1 kg', 599, 60, false, 'rice', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80', true),
  ('sugar-2kg', 'pantry', 'Açúcar 2kg', 'Açúcar cristal, pacote de 2 kg.', 'pacote 2 kg', 799, 70, true, 'rice', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80', true),
  ('coffee-coamo', 'pantry', 'Café Coamo', 'Café Coamo torrado e moído, 500 g.', 'pacote 500 g', 1890, 50, true, 'coffee', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80', true),
  ('quirera-500g', 'pantry', 'Quirerinha 500g', 'Quirerinha (quirera de milho), pacote de 500 g.', 'pacote 500 g', 499, 45, false, 'rice', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80', true),
  ('oil-900ml', 'pantry', 'Óleo de soja', 'Óleo de soja refinado, garrafa 900 ml.', 'garrafa 900 ml', 699, 80, true, 'rice', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80', true),
  ('milk-1l', 'beverages', 'Leite 1L', 'Leite integral UHT, caixa de 1 litro.', 'caixa 1 L', 549, 100, true, 'milk', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80', true),
  ('tomato-sauce', 'pantry', 'Molho de tomate', 'Molho de tomate tradicional.', 'unidade', 349, 70, true, 'pasta', 'https://images.unsplash.com/photo-1546470427-e26264be0d16?auto=format&fit=crop&w=800&q=80', true),
  ('salt-1kg', 'pantry', 'Sal 1kg', 'Sal refinado, pacote de 1 kg.', 'pacote 1 kg', 299, 90, true, 'rice', 'https://images.unsplash.com/photo-1518110925495-5fe2dda71e27?auto=format&fit=crop&w=800&q=80', true),
  ('wheat-1kg', 'pantry', 'Trigo 1kg', 'Farinha de trigo, pacote de 1 kg.', 'pacote 1 kg', 549, 55, true, 'rice', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80', true),
  ('wafer', 'pantry', 'Wafer', 'Biscoito wafer.', 'pacote', 399, 40, true, 'pasta', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80', true),
  ('pasta-500g', 'pantry', 'Macarrão 500g', 'Macarrão espaguete, pacote de 500 g.', 'pacote 500 g', 449, 70, true, 'pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80', true),
  ('eggs-30', 'pantry', 'Cartela de ovos 30 und', 'Cartela com 30 ovos.', 'cartela 30 und', 2290, 35, false, 'eggs', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80', true),
  ('soda-coke-2l', 'beverages', 'Coca-Cola 2L', 'Refrigerante Coca-Cola, garrafa de 2 litros.', 'garrafa 2 L', 1099, 40, true, 'milk', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', true),
  ('margarine-250g', 'pantry', 'Margarina 250g', 'Margarina cremosa, pote de 250 g.', 'pote 250 g', 499, 40, true, 'milk', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80', true),
  ('softener-ype-2l', 'cleaning', 'Amaciante Ypê 2L', 'Amaciante Ypê, galão de 2 litros.', 'galão 2 L', 1290, 40, true, 'cleaning', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80', true),
  ('disinfectant-2l', 'cleaning', 'Desinfetante 2L', 'Desinfetante aromático, galão de 2 litros.', 'galão 2 L', 999, 40, true, 'cleaning', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80', true),
  ('detergent-ype', 'cleaning', 'Detergente Ypê', 'Detergente líquido Ypê para louças.', 'frasco 500 ml', 279, 80, true, 'cleaning', 'https://images.unsplash.com/photo-1583947215259-38e31bebd861?auto=format&fit=crop&w=800&q=80', true),
  ('bleach-1l', 'cleaning', 'Água sanitária 1L', 'Água sanitária, frasco de 1 litro.', 'frasco 1 L', 449, 60, true, 'cleaning', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80', true),
  ('soap-powder-800g', 'cleaning', 'Sabão em pó', 'Sabão em pó para máquina e tanque.', 'pacote 800 g', 1290, 35, true, 'cleaning', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80', true),
  ('laundry-bar', 'cleaning', 'Sabão em barra', 'Sabão em barra para lavagem.', 'unidade', 399, 50, true, 'cleaning', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80', true),
  ('toilet-paper-4', 'hygiene', 'Papel higiênico 4 rolos', 'Pacote com 4 rolos de papel higiênico.', 'pacote 4 rolos', 699, 60, true, 'cleaning', 'https://images.unsplash.com/photo-1584556812952-905ffd0c036a?auto=format&fit=crop&w=800&q=80', true),
  ('soap-unit', 'hygiene', 'Sabonete', 'Sabonete em barra.', 'unidade', 249, 100, true, 'cleaning', 'https://images.unsplash.com/photo-1600857544200-b2f666a9e2ec?auto=format&fit=crop&w=800&q=80', true),
  ('toothpaste', 'hygiene', 'Creme dental', 'Creme dental tradicional.', 'unidade', 449, 70, false, 'cleaning', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80', true),
  ('toothpaste-colgate', 'hygiene', 'Creme dental Colgate', 'Creme dental Colgate.', 'unidade', 549, 60, true, 'cleaning', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80', true)
on conflict (id) do nothing;

insert into public.baskets (id, name, description, price_cents, image_url, is_active) values
  ('basket-120', 'Cesta básica', 'Cesta essencial com mercearia, limpeza e higiene.', 12000, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80', true),
  ('basket-150', 'Cesta básica plus', 'Cesta ampliada com mais leite, higiene e limpeza.', 15000, 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80', true),
  ('basket-210', 'Cesta família', 'Cesta completa com ovos, refrigerante e mais itens para a família.', 21000, 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80', true)
on conflict (id) do nothing;

insert into public.basket_components (basket_id, product_id, quantity) values
  ('basket-120', 'rice-5kg', 1),
  ('basket-120', 'beans-1kg', 2),
  ('basket-120', 'flour-yellow-1kg', 1),
  ('basket-120', 'sugar-2kg', 1),
  ('basket-120', 'coffee-coamo', 1),
  ('basket-120', 'quirera-500g', 1),
  ('basket-120', 'oil-900ml', 1),
  ('basket-120', 'milk-1l', 1),
  ('basket-120', 'tomato-sauce', 1),
  ('basket-120', 'salt-1kg', 1),
  ('basket-120', 'softener-ype-2l', 1),
  ('basket-120', 'toilet-paper-4', 1),
  ('basket-120', 'detergent-ype', 1),
  ('basket-120', 'bleach-1l', 1),
  ('basket-120', 'soap-unit', 2),
  ('basket-120', 'toothpaste', 1),
  ('basket-150', 'rice-5kg', 1),
  ('basket-150', 'beans-1kg', 2),
  ('basket-150', 'sugar-2kg', 1),
  ('basket-150', 'flour-yellow-1kg', 1),
  ('basket-150', 'coffee-coamo', 1),
  ('basket-150', 'salt-1kg', 1),
  ('basket-150', 'oil-900ml', 1),
  ('basket-150', 'wheat-1kg', 1),
  ('basket-150', 'milk-1l', 2),
  ('basket-150', 'tomato-sauce', 1),
  ('basket-150', 'wafer', 1),
  ('basket-150', 'softener-ype-2l', 1),
  ('basket-150', 'disinfectant-2l', 1),
  ('basket-150', 'soap-unit', 2),
  ('basket-150', 'detergent-ype', 2),
  ('basket-150', 'toothpaste-colgate', 2),
  ('basket-150', 'toilet-paper-4', 2),
  ('basket-150', 'bleach-1l', 1),
  ('basket-150', 'laundry-bar', 1),
  ('basket-210', 'eggs-30', 1),
  ('basket-210', 'rice-5kg', 1),
  ('basket-210', 'beans-1kg', 2),
  ('basket-210', 'pasta-500g', 1),
  ('basket-210', 'salt-1kg', 1),
  ('basket-210', 'flour-yellow-1kg', 1),
  ('basket-210', 'sugar-2kg', 2),
  ('basket-210', 'coffee-coamo', 1),
  ('basket-210', 'milk-1l', 2),
  ('basket-210', 'quirera-500g', 1),
  ('basket-210', 'wheat-1kg', 1),
  ('basket-210', 'wafer', 1),
  ('basket-210', 'soda-coke-2l', 1),
  ('basket-210', 'oil-900ml', 2),
  ('basket-210', 'tomato-sauce', 2),
  ('basket-210', 'margarine-250g', 1),
  ('basket-210', 'soap-powder-800g', 1),
  ('basket-210', 'softener-ype-2l', 1),
  ('basket-210', 'toilet-paper-4', 2),
  ('basket-210', 'bleach-1l', 1),
  ('basket-210', 'detergent-ype', 2),
  ('basket-210', 'laundry-bar', 1),
  ('basket-210', 'disinfectant-2l', 1),
  ('basket-210', 'soap-unit', 2),
  ('basket-210', 'toothpaste', 1)
on conflict (basket_id, product_id) do nothing;
