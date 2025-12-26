-- Admins can delete requests
create policy "Admins can delete requests"
  on public.requests for delete
  using ( 
    (select is_admin from public.members where id = auth.uid()) = true 
  );
