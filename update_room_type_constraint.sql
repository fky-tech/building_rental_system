-- Drop the existing constraint
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_room_type_check;

-- Add the new constraint with all supported room types
ALTER TABLE public.rooms ADD CONSTRAINT rooms_room_type_check CHECK (room_type IN ('office', 'shop', 'single', 'double', 'studio', 'apartment'));
