-- Migration: Add retry_count column for SMS retry tracking
-- Run this in Supabase SQL editor AFTER create_messages_table.sql

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.messages.retry_count IS
  'Number of times this message has been retried after initial failure. Max retries = 2.';
