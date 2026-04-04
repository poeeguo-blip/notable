-- Add deleted_at column for soft delete (trash feature)
ALTER TABLE public.notes ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for filtering deleted notes
CREATE INDEX idx_notes_deleted_at ON public.notes(deleted_at);