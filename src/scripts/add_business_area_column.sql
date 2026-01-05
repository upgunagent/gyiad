-- Add business_area column to members table if it doesn't exist
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'members' and column_name = 'business_area') then 
    alter table "members" add column "business_area" text; 
  end if; 
end $$;
