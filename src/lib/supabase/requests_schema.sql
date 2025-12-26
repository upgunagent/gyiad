-- Create Requests Table
create table public.requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.members(id) on delete cascade not null,
  subject text not null,
  message text not null,
  status text default 'pending' check (status in ('pending', 'replied')),
  admin_reply text,
  created_at timestamptz default now(),
  replied_at timestamptz
);

-- RLS Policies
alter table public.requests enable row level security;

-- Users can view their own requests
create policy "Users can view own requests"
  on public.requests for select
  using ( auth.uid() = user_id );

-- Users can insert their own requests
create policy "Users can insert own requests"
  on public.requests for insert
  with check ( auth.uid() = user_id );

-- Admins can view all requests
create policy "Admins can view all requests"
  on public.requests for select
  using ( 
    (select is_admin from public.members where id = auth.uid()) = true 
  );

-- Admins can update requests (to reply)
create policy "Admins can update requests"
  on public.requests for update
  using ( 
    (select is_admin from public.members where id = auth.uid()) = true 
  );
