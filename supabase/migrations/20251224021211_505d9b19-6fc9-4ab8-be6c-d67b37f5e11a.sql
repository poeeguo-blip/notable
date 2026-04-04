-- Add is_favorite and position columns to notes table
ALTER TABLE public.notes 
ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN position INTEGER DEFAULT 0;

-- Create index for faster sorting
CREATE INDEX idx_notes_position ON public.notes(position);
CREATE INDEX idx_notes_favorite ON public.notes(is_favorite);