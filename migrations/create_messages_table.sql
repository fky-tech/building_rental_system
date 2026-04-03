-- Migration: Create messages table for SMS logging
-- Run this in Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.messages (
  id         uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id  uuid        REFERENCES public.tenants(id) ON DELETE SET NULL,
  phone      text        NOT NULL,
  message    text        NOT NULL,
  status     text        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'sent', 'failed')),
  error      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by tenant and status
CREATE INDEX IF NOT EXISTS messages_tenant_id_idx ON public.messages (tenant_id);
CREATE INDEX IF NOT EXISTS messages_status_idx    ON public.messages (status);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Owners can view messages for their own tenants
CREATE POLICY "Owners can view their messages"
  ON public.messages FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants
      WHERE owner_id IN (
        SELECT id FROM public.owners WHERE user_id = auth.uid()
      )
    )
  );

-- Only the service role (server-side API routes) can insert/update messages
CREATE POLICY "Service role can manage messages"
  ON public.messages FOR ALL
  USING (auth.role() = 'service_role');
