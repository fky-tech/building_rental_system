-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. profiles table (Auth mapping)
create table public.profiles (
    id uuid references auth.users not null primary key,
    full_name text not null,
    phone text,
    role text check (role in ('admin', 'owner')) default 'owner',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. owners table
create table public.owners (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) not null,
    status text default 'active' check (status in ('active', 'inactive')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. buildings table
create table public.buildings (
    id uuid default uuid_generate_v4() primary key,
    owner_id uuid references public.owners(id) not null,
    name text not null,
    city text,
    sub_city text,
    address text,
    slug text unique not null,
    description text,
    status text default 'active' check (status in ('active', 'inactive')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. rooms table
create table public.rooms (
    id uuid default uuid_generate_v4() primary key,
    building_id uuid references public.buildings(id) not null,
    room_number text not null,
    floor_number integer,
    room_type text check (room_type in ('office', 'shop', 'single', 'double', 'studio', 'apartment')),
    rent_amount numeric not null,
    status text default 'available' check (status in ('available', 'occupied', 'maintenance')),
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. tenants table
create table public.tenants (
    id uuid default uuid_generate_v4() primary key,
    owner_id uuid references public.owners(id) not null,
    full_name text not null,
    phone text,
    id_number text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. leases table
create table public.leases (
    id uuid default uuid_generate_v4() primary key,
    room_id uuid references public.rooms(id) not null,
    tenant_id uuid references public.tenants(id) not null,
    start_date date not null,
    end_date date,
    monthly_rent numeric not null,
    payment_due_day integer not null check (payment_due_day between 1 and 31),
    status text default 'active' check (status in ('active', 'ended')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. payments table
create table public.payments (
    id uuid default uuid_generate_v4() primary key,
    owner_id uuid references public.owners(id) not null,
    lease_id uuid references public.leases(id),
    amount numeric not null,
    payment_date date not null,
    due_date date,
    month integer not null,
    year integer not null,
    transaction_id text unique,
    sender_identifier text,
    payment_method text check (payment_method in ('bank', 'telebirr', 'cash')),
    status text default 'unassigned' check (status in ('unassigned', 'pending', 'verified')),
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.owners enable row level security;
alter table public.buildings enable row level security;
alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.payments enable row level security;

-- Setup Admin helper
create or replace function public.is_admin() returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- Policies for Profiles
create policy "Admins can do everything on profiles" on public.profiles for all using (public.is_admin());
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);

-- Policies for Owners
create policy "Admins can do everything on owners" on public.owners for all using (public.is_admin());
create policy "Owners can view their own owner record" on public.owners for select using (user_id = auth.uid());

-- Policies for Buildings
create policy "Admins can do everything on buildings" on public.buildings for all using (public.is_admin());
create policy "Owners can manager their buildings" on public.buildings for all using (
    owner_id in (select id from public.owners where user_id = auth.uid())
);
create policy "Public can view active buildings" on public.buildings for select using (status = 'active');

-- Policies for Rooms
create policy "Admins can do everything on rooms" on public.rooms for all using (public.is_admin());
create policy "Owners can manage their rooms" on public.rooms for all using (
    building_id in (select id from public.buildings where owner_id in (select id from public.owners where user_id = auth.uid()))
);
create policy "Public can view available rooms" on public.rooms for select using (status = 'available');

-- Policies for Tenants
create policy "Admins can do everything on tenants" on public.tenants for all using (public.is_admin());
create policy "Owners can manage their tenants" on public.tenants for all using (
    owner_id in (select id from public.owners where user_id = auth.uid())
);

-- Policies for Leases
create policy "Admins can do everything on leases" on public.leases for all using (public.is_admin());
create policy "Owners can manage their leases" on public.leases for all using (
    room_id in (select id from public.rooms where building_id in (
        select id from public.buildings where owner_id in (select id from public.owners where user_id = auth.uid())
    ))
);

-- Policies for Payments
create policy "Admins can do everything on payments" on public.payments for all using (public.is_admin());
create policy "Owners can manage their payments" on public.payments for all using (
    owner_id in (select id from public.owners where user_id = auth.uid())
);

-- SQL snippet to add must_change_password column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;
