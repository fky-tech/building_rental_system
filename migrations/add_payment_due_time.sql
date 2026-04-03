-- Migration: Add payment_due_time column to leases table
-- Run this in Supabase SQL editor

ALTER TABLE public.leases
  ADD COLUMN IF NOT EXISTS payment_due_time TIME DEFAULT '09:00:00';

COMMENT ON COLUMN public.leases.payment_due_time IS
  'Time of day (HH:MM:SS) at which the SMS reminder should be sent on the payment_due_day.';
