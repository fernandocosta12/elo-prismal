-- Aplicada em 18/10/2026 pelo SQL Editor do Supabase.
-- Corrida passa a contar como treino do dia direto no Happy, sem criar um "treino fantasma".
-- (O gatilho antigo podia falhar se já existisse um treino livre não concluído no mesmo dia.)
create or replace function public.check_and_award_happy(_user_id uuid, _date date) returns void language plpgsql security definer set search_path to 'public' as $$
declare
  _profile record; _workout_done boolean := false; _calories_total numeric := 0; _water_total integer := 0;
  _water_goal integer; _nutrition_done boolean := false; _water_done boolean := false; _goal text;
begin
  select weight, daily_calories, goal into _profile from public.profiles where user_id = _user_id;
  if _profile is null then return; end if;
  select exists(select 1 from public.workouts where user_id = _user_id and scheduled_date = _date and completed = true)
      or exists(select 1 from public.run_logs where user_id = _user_id and date = _date)
    into _workout_done;
  select coalesce(sum(calories), 0) into _calories_total from public.meal_logs where user_id = _user_id and (meal_time at time zone 'America/Sao_Paulo')::date = _date;
  if _profile.daily_calories is not null and _profile.daily_calories > 0 then
    _goal := lower(coalesce(_profile.goal, ''));
    if _goal in ('perda_de_peso','emagrecimento','perda_peso','perda de peso','perder peso','cutting','deficit','déficit') then
      _nutrition_done := _calories_total >= _profile.daily_calories * 0.5 and _calories_total <= _profile.daily_calories * 1.0;
    elsif _goal in ('manutencao','manutenção','manter','maintenance') then
      _nutrition_done := _calories_total >= _profile.daily_calories * 0.9 and _calories_total <= _profile.daily_calories * 1.1;
    else
      _nutrition_done := _calories_total >= _profile.daily_calories * 0.9;
    end if;
  end if;
  select coalesce(sum(amount_ml), 0) into _water_total from public.water_logs where user_id = _user_id and date = _date;
  if _profile.weight is not null and _profile.weight > 0 then
    _water_goal := ceil(_profile.weight * 35);
    _water_done := _water_total >= _water_goal;
  end if;
  insert into public.happy_logs (user_id, date, workout_done, nutrition_done, water_done)
  values (_user_id, _date, _workout_done, _nutrition_done, _water_done)
  on conflict (user_id, date) do update set workout_done = excluded.workout_done, nutrition_done = excluded.nutrition_done, water_done = excluded.water_done;
end; $$;
revoke execute on function public.check_and_award_happy(uuid, date) from public, anon, authenticated;

create or replace function public.trigger_run_check_happy() returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if tg_op = 'DELETE' then
    perform public.check_and_award_happy(old.user_id, old.date);
    return old;
  end if;
  perform public.check_and_award_happy(new.user_id, new.date);
  return new;
end; $$;
revoke execute on function public.trigger_run_check_happy() from public, anon, authenticated;
drop trigger if exists run_logs_check_happy on public.run_logs;
create trigger run_logs_check_happy after insert or update or delete on public.run_logs for each row execute function public.trigger_run_check_happy();

-- Usuário pode apagar treinos próprios (o original não permitia)
create policy "own_delete" on public.workouts for delete to authenticated using (auth.uid() = user_id);
