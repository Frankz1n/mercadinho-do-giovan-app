-- Etapa 1 (PLANO-SEGURANCA): autorização sem RLS recursiva em profiles,
-- proteção de campos imutáveis e grants explícitos nas RPCs.

-- ---------------------------------------------------------------------------
-- Perfil: e-mail e role não mudam via UPDATE do cliente autenticado
-- ---------------------------------------------------------------------------

create or replace function public.protect_profile_immutable_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() nulo: caminhos privilegiados (service role / jobs).
  -- Cliente autenticado não pode alterar e-mail, role ou id.
  if auth.uid() is not null then
    if new.id is distinct from old.id then
      raise exception 'ID do perfil é imutável.';
    end if;
    if new.email is distinct from old.email then
      raise exception 'E-mail não pode ser alterado diretamente no perfil.';
    end if;
    if new.role is distinct from old.role then
      raise exception 'Papel do usuário não pode ser alterado por esta operação.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_immutable on public.profiles;
create trigger profiles_protect_immutable
  before update on public.profiles
  for each row
  execute function public.protect_profile_immutable_fields();

-- Política sem subquery recursiva em public.profiles
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- RPCs: garantir que PUBLIC não herda execute
-- ---------------------------------------------------------------------------

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

revoke all on function public.place_order(jsonb, text) from public;
grant execute on function public.place_order(jsonb, text) to authenticated;

revoke all on function public.cancel_order(uuid) from public;
grant execute on function public.cancel_order(uuid) to authenticated;

revoke all on function public.adjust_stock(jsonb) from public;
grant execute on function public.adjust_stock(jsonb) to authenticated;

revoke all on function public.generate_order_code() from public;
-- generate_order_code é auxiliar; não conceder a clientes
revoke all on function public.generate_order_code() from authenticated, anon;
