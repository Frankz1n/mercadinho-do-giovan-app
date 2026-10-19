-- Seed do catálogo (rode após a migration). Não cria usuários Auth.
-- Admin: cadastre no app e promova com:
--   update public.profiles set role = 'admin' where email = 'seu@email.com';

insert into public.categories (id, name, visual) values
  ('produce', 'Hortifruti', 'produce'),
  ('pantry', 'Mercearia', 'rice'),
  ('beverages', 'Bebidas', 'milk'),
  ('cleaning', 'Limpeza', 'cleaning')
on conflict (id) do nothing;

insert into public.products (
  id, category_id, name, description, unit_label, price_cents,
  stock_quantity, is_featured, visual, image_url
) values
  ('rice-5kg', 'pantry', 'Arroz tipo 1', 'Arroz branco tipo 1, grãos selecionados para o dia a dia.', 'pacote 5 kg', 2490, 40, true, 'rice', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'),
  ('beans-1kg', 'pantry', 'Feijão carioca', 'Feijão carioca de cozimento rápido, ideal para o almoço.', 'pacote 1 kg', 899, 55, true, 'beans', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80'),
  ('pasta-500g', 'pantry', 'Macarrão espaguete', 'Massa de semolina, cozimento al dente.', 'pacote 500 g', 449, 60, false, 'pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80'),
  ('coffee-500g', 'pantry', 'Café torrado e moído', 'Café tradicional torrado e moído, embalagem familiar.', 'pacote 500 g', 1890, 28, true, 'coffee', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80'),
  ('oil-900ml', 'pantry', 'Óleo de soja', 'Óleo de soja refinado para frituras e refogados.', 'garrafa 900 ml', 699, 45, false, 'rice', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'),
  ('milk-1l', 'beverages', 'Leite integral UHT', 'Leite integral longa vida, caixa de 1 litro.', 'caixa 1 L', 549, 70, true, 'milk', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80'),
  ('eggs-12', 'pantry', 'Ovos brancos', 'Bandeja com uma dúzia de ovos brancos frescos.', 'dúzia', 1290, 35, true, 'eggs', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80'),
  ('cheese-200g', 'pantry', 'Queijo mussarela fatiado', 'Queijo mussarela fatiado para lanches e sanduíches.', 'pacote 200 g', 1490, 18, false, 'milk', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80'),
  ('soda-2l', 'beverages', 'Refrigerante 2L', 'Refrigerante tradicional em garrafa de 2 litros.', 'garrafa 2 L', 999, 40, true, 'milk', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80'),
  ('juice-1l', 'beverages', 'Suco de uva integral', 'Suco de uva 100% integral, sem adição de açúcar.', 'garrafa 1 L', 1490, 22, false, 'produce', 'https://images.unsplash.com/photo-1600271886742-f049cd341b88?auto=format&fit=crop&w=800&q=80'),
  ('water-1_5l', 'beverages', 'Água mineral', 'Água mineral sem gás, garrafa familiar.', 'garrafa 1,5 L', 299, 80, false, 'milk', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80'),
  ('banana-1kg', 'produce', 'Banana prata', 'Banana prata selecionada, bandeja com cerca de 1 kg.', 'bandeja 1 kg', 799, 25, true, 'produce', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80'),
  ('tomato-500g', 'produce', 'Tomate', 'Tomate fresco para saladas e molhos.', 'bandeja 500 g', 649, 22, false, 'produce', 'https://images.unsplash.com/photo-1546470427-e26264be0d16?auto=format&fit=crop&w=800&q=80'),
  ('potato-1kg', 'produce', 'Batata inglesa', 'Batata inglesa lavada, embalagem de 1 kg.', 'pacote 1 kg', 599, 30, false, 'produce', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'),
  ('onion-1kg', 'produce', 'Cebola', 'Cebola amarela selecionada, pacote de 1 kg.', 'pacote 1 kg', 549, 27, false, 'produce', 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=800&q=80'),
  ('detergent-500ml', 'cleaning', 'Detergente neutro', 'Detergente líquido neutro para louças.', 'frasco 500 ml', 279, 50, false, 'cleaning', 'https://images.unsplash.com/photo-1583947215259-38e31bebd861?auto=format&fit=crop&w=800&q=80'),
  ('soap-powder-800g', 'cleaning', 'Sabão em pó', 'Sabão em pó concentrado para máquina e tanque.', 'pacote 800 g', 1290, 20, true, 'cleaning', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80'),
  ('disinfectant-1l', 'cleaning', 'Desinfetante', 'Desinfetante aromático para pisos e superfícies.', 'frasco 1 L', 799, 32, false, 'cleaning', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;

insert into public.baskets (id, name, description, price_cents, image_url) values
  ('basket-basic', 'Cesta básica', 'Arroz, feijão, macarrão e café para a semana.', 6990, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'),
  ('basket-breakfast', 'Cesta café da manhã', 'Leite, café, ovos e banana para começar o dia.', 4290, 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;

insert into public.basket_components (basket_id, product_id, quantity) values
  ('basket-basic', 'rice-5kg', 1),
  ('basket-basic', 'beans-1kg', 2),
  ('basket-basic', 'pasta-500g', 2),
  ('basket-basic', 'coffee-500g', 1),
  ('basket-breakfast', 'milk-1l', 3),
  ('basket-breakfast', 'coffee-500g', 1),
  ('basket-breakfast', 'eggs-12', 1),
  ('basket-breakfast', 'banana-1kg', 1)
on conflict (basket_id, product_id) do nothing;
