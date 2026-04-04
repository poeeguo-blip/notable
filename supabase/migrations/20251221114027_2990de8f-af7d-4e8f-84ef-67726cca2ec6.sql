-- Add position column to folders table for ordering
ALTER TABLE public.folders ADD COLUMN position INTEGER DEFAULT 0;

-- Update existing folders with sequential positions
WITH numbered_folders AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS new_position
  FROM public.folders
)
UPDATE public.folders
SET position = numbered_folders.new_position
FROM numbered_folders
WHERE public.folders.id = numbered_folders.id;