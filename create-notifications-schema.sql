-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  type text not null check (type in ('product','feed_post','system')),
  title text not null,
  body text,
  link_url text,
  is_read boolean not null default false,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies: allow read for all (guests get only global where user_id is null), user can read their own
drop policy if exists notifications_read_own on public.notifications;
create policy notifications_read_own
  on public.notifications for select
  using (
    (auth.uid() is null and user_id is null) or (auth.uid() = user_id) or (user_id is null)
  );

-- Function to insert notification (global)
create or replace function public.insert_global_notification(n_type text, n_title text, n_body text, n_link text)
returns void as $$
begin
  insert into public.notifications (user_id, type, title, body, link_url)
  values (null, n_type, n_title, n_body, n_link);
end; $$ language plpgsql security definer;

-- Trigger on products insert: notify new product
create or replace function public.notify_new_product()
returns trigger as $$
begin
  perform public.insert_global_notification(
    'product',
    'Produk baru: ' || coalesce(new.name, 'Produk'),
    'Lihat produk terbaru kami sekarang!',
    '/products/' || new.id::text
  );
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_notify_new_product on public.products;
create trigger trg_notify_new_product
after insert on public.products
for each row execute function public.notify_new_product();

-- Trigger on feed_posts insert: notify new feed post except reviews
create or replace function public.notify_new_feed_post()
returns trigger as $$
begin
  if coalesce(new.type,'') <> 'review' then
    perform public.insert_global_notification(
      'feed_post',
      coalesce(new.title, 'Postingan baru'),
      left(coalesce(new.content,''), 120),
      '/feed'
    );
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_notify_new_feed_post on public.feed_posts;
create trigger trg_notify_new_feed_post
after insert on public.feed_posts
for each row execute function public.notify_new_feed_post();

-- Per-user notification read tracking for global notifications
create table if not exists public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamp with time zone not null default now(),
  primary key (notification_id, user_id)
);

-- Enable RLS for read receipts
alter table public.notification_reads enable row level security;

-- RLS policies for read receipts
drop policy if exists notification_reads_select_own on public.notification_reads;
create policy notification_reads_select_own
  on public.notification_reads for select
  using (auth.uid() = user_id);

drop policy if exists notification_reads_insert_own on public.notification_reads;
create policy notification_reads_insert_own
  on public.notification_reads for insert
  with check (auth.uid() = user_id);

drop policy if exists notification_reads_delete_own on public.notification_reads;
create policy notification_reads_delete_own
  on public.notification_reads for delete
  using (auth.uid() = user_id);

-- Allow users to update their own notifications' is_read flag
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Helpful index
create index if not exists idx_notification_reads_user on public.notification_reads(user_id);

-- Function: get unread count with minimal egress
create or replace function public.get_unread_notification_count(u_id uuid)
returns integer
language sql
stable
security invoker
as $$
  with user_unread as (
    select count(*)::int as c
    from public.notifications
    where user_id = u_id and is_read = false
  ),
  global_unread as (
    select count(*)::int as c
    from public.notifications n
    where n.user_id is null
      and (
        u_id is null -- guests: all global are considered unread
        or not exists (
          select 1 from public.notification_reads r
          where r.notification_id = n.id and r.user_id = u_id
        )
      )
  )
  select coalesce((select c from user_unread), 0) + coalesce((select c from global_unread), 0);
$$;

-- Function: mark a single notification as read for a user
create or replace function public.mark_notification_read(n_id uuid, u_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  target_user uuid;
begin
  if u_id is null then
    return;
  end if;

  -- If this notification is owned by the user, update is_read flag
  select user_id into target_user from public.notifications where id = n_id limit 1;
  if not found then
    return;
  end if;

  if target_user = u_id then
    update public.notifications set is_read = true where id = n_id and user_id = u_id;
  else
    -- Global notification: record per-user read receipt
    insert into public.notification_reads(notification_id, user_id)
    values (n_id, u_id)
    on conflict (notification_id, user_id) do nothing;
  end if;
end;
$$;

-- Function: mark all notifications as read for a user
create or replace function public.mark_all_notifications_read(u_id uuid)
returns void
language plpgsql
security invoker
as $$
begin
  if u_id is null then
    return;
  end if;

  -- Mark user-specific notifications
  update public.notifications set is_read = true where user_id = u_id and is_read = false;

  -- Insert read receipts for all global notifications not yet marked
  insert into public.notification_reads(notification_id, user_id, read_at)
  select n.id, u_id, now()
  from public.notifications n
  where n.user_id is null
    and not exists (
      select 1 from public.notification_reads r where r.notification_id = n.id and r.user_id = u_id
    );
end;
$$;
