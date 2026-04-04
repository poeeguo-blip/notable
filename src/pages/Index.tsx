import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { User, Session } from "@supabase/supabase-js";
import { NotesList } from "@/components/NotesList";
import { NoteEditor } from "@/components/NoteEditor";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  user_id: string;
  folder_id: string | null;
  is_favorite: boolean;
  position: number;
  deleted_at: string | null;
}

interface Folder {
  id: string;
  name: string;
  user_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchTrashedNotes();
      fetchFolders();
    }
  }, [user]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .is("deleted_at", null)
      .order("is_favorite", { ascending: false })
      .order("position", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch notes",
      });
      return;
    }

    setNotes(data || []);
    if (data && data.length > 0 && !selectedNote) {
      setSelectedNote(data[0]);
    }
  };

  const fetchTrashedNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch trash",
      });
      return;
    }

    setTrashedNotes(data || []);
  };

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch folders",
      });
      return;
    }

    setFolders(data || []);
  };

  const handleNoteCreate = async (folderId?: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({
        title: "Untitled",
        content: "",
        user_id: user.id,
        folder_id: folderId || null,
        is_favorite: false,
        position: 0,
        deleted_at: null,
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create note",
      });
      return;
    }

    // Clear the selected note first so editor resets, then set the new note
    setSelectedNote(null);
    setNotes([data, ...notes]);
    // Use setTimeout to ensure state clears before setting new note
    setTimeout(() => setSelectedNote(data), 0);
  };

  const handleNoteToggleFavorite = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const newFavorite = !note.is_favorite;
    
    const { error } = await supabase
      .from("notes")
      .update({ is_favorite: newFavorite })
      .eq("id", noteId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorite",
      });
      return;
    }

    setNotes(notes.map(n => n.id === noteId ? { ...n, is_favorite: newFavorite } : n));
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, is_favorite: newFavorite });
    }
  };

  const handleNoteReorder = async (noteId: string, newPosition: number, folderId: string | null) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const { error } = await supabase
      .from("notes")
      .update({ position: newPosition })
      .eq("id", noteId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reorder note",
      });
      return;
    }

    setNotes(notes.map(n => n.id === noteId ? { ...n, position: newPosition } : n));
  };

  const handleNoteSelect = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) setSelectedNote(note);
  };

  const handleNoteSave = async (noteId: string, title: string, content: string) => {
    setSaving(true);
    const { error } = await supabase
      .from("notes")
      .update({ title, content })
      .eq("id", noteId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save note",
      });
      setSaving(false);
      return;
    }

    // Save a version snapshot (previous state before this save)
    const previousNote = notes.find(n => n.id === noteId);
    if (previousNote && user) {
      supabase.from("note_versions").insert({
        note_id: noteId,
        user_id: user.id,
        title: previousNote.title,
        content: previousNote.content,
      });
    }

    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? { ...n, title, content, updated_at: new Date().toISOString() }
          : n
      )
    );
    if (selectedNote?.id === noteId) {
      setSelectedNote((prev) => prev ? { ...prev, title, content } : prev);
    }
    setSaving(false);
  };

  const handleNoteDelete = async (id: string) => {
    // Soft delete - move to trash
    const { error } = await supabase
      .from("notes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete note",
      });
      return;
    }

    const deletedNote = notes.find((n) => n.id === id);
    const newNotes = notes.filter((n) => n.id !== id);
    setNotes(newNotes);
    
    if (deletedNote) {
      setTrashedNotes([{ ...deletedNote, deleted_at: new Date().toISOString() }, ...trashedNotes]);
    }
    
    if (selectedNote?.id === id) {
      setSelectedNote(newNotes.length > 0 ? newNotes[0] : null);
    }

    toast({
      title: "Note moved to trash",
      description: "You can restore it from the trash",
    });
  };

  const handleNoteRestore = async (id: string) => {
    const { error } = await supabase
      .from("notes")
      .update({ deleted_at: null })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore note",
      });
      return;
    }

    const restoredNote = trashedNotes.find((n) => n.id === id);
    setTrashedNotes(trashedNotes.filter((n) => n.id !== id));
    
    if (restoredNote) {
      setNotes([{ ...restoredNote, deleted_at: null }, ...notes]);
    }

    toast({
      title: "Note restored",
      description: "The note has been restored",
    });
  };

  const handleNotePermanentDelete = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to permanently delete note",
      });
      return;
    }

    setTrashedNotes(trashedNotes.filter((n) => n.id !== id));

    toast({
      title: "Note permanently deleted",
      description: "The note has been permanently removed",
    });
  };

  const handleFolderCreate = async () => {
    if (!user) return;

    // Calculate the next position (after the last folder)
    const maxPosition = folders.length > 0 
      ? Math.max(...folders.map(f => f.position)) 
      : -1;

    const { data, error } = await supabase
      .from("folders")
      .insert({
        name: "New Folder",
        user_id: user.id,
        position: maxPosition + 1,
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create folder",
      });
      return;
    }

    setFolders([...folders, data]);
    toast({
      title: "Folder created",
      description: "New folder has been created",
    });
  };

  const handleFolderRename = async (id: string, name: string) => {
    const { error } = await supabase
      .from("folders")
      .update({ name })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename folder",
      });
      return;
    }

    setFolders(folders.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleFolderDelete = async (id: string) => {
    const { error } = await supabase.from("folders").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete folder",
      });
      return;
    }

    setFolders(folders.filter((f) => f.id !== id));
    toast({
      title: "Folder deleted",
      description: "Folder has been removed",
    });
  };

  const handleNoteMoveToFolder = async (noteId: string, folderId: string | null) => {
    const { error } = await supabase
      .from("notes")
      .update({ folder_id: folderId })
      .eq("id", noteId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to move note",
      });
      return;
    }

    setNotes(
      notes.map((n) => (n.id === noteId ? { ...n, folder_id: folderId } : n))
    );
  };

  const handleFolderReorder = async (folderId: string, newPosition: number) => {
    const draggedFolder = folders.find(f => f.id === folderId);
    if (!draggedFolder) return;

    const oldPosition = draggedFolder.position;
    if (oldPosition === newPosition) return;

    // Calculate new positions for affected folders
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, position: newPosition };
      }
      
      if (oldPosition < newPosition) {
        // Moving down: shift folders between old and new position up
        if (folder.position > oldPosition && folder.position <= newPosition) {
          return { ...folder, position: folder.position - 1 };
        }
      } else {
        // Moving up: shift folders between new and old position down
        if (folder.position >= newPosition && folder.position < oldPosition) {
          return { ...folder, position: folder.position + 1 };
        }
      }
      return folder;
    });

    // Update local state optimistically
    setFolders(updatedFolders);

    // Update each affected folder in the database
    for (const folder of updatedFolders) {
      const originalFolder = folders.find(f => f.id === folder.id);
      if (originalFolder && originalFolder.position !== folder.position) {
        await supabase
          .from("folders")
          .update({ position: folder.position })
          .eq("id", folder.id);
      }
    }
  };

  const handleExportAll = () => {
    if (notes.length === 0) {
      toast({ title: "No notes to export", description: "Create some notes first" });
      return;
    }

    const sortedNotes = [...notes].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    const notesHtml = sortedNotes.map((note, i) => `
      <div style="page-break-after: ${i < sortedNotes.length - 1 ? 'always' : 'auto'}; margin-bottom: 2em; padding-bottom: 2em; border-bottom: 1px solid #e5e7eb;">
        <h1 style="font-size: 1.8em; margin-bottom: 0.3em;">${note.title || 'Untitled'}</h1>
        <p style="color: #888; font-size: 0.85em; margin-bottom: 1em;">Last updated: ${new Date(note.updated_at).toLocaleString()}${note.is_favorite ? ' ⭐' : ''}</p>
        <div>${note.content || '<p><em>Empty note</em></p>'}</div>
      </div>
    `).join('\n');

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>All Notes Export</title>
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2em; color: #1a1a1a; line-height: 1.6; }
  h1 { font-family: Georgia, serif; }
  img { max-width: 100%; }
  pre { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }
  code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
  blockquote { border-left: 3px solid #ccc; margin-left: 0; padding-left: 1em; color: #555; }
  @media print { div { page-break-inside: avoid; } }
</style>
</head><body>
<h1 style="text-align:center; border-bottom: 2px solid #333; padding-bottom: 0.5em;">All Notes (${sortedNotes.length})</h1>
${notesHtml}
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-notes-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Notes exported", description: `${sortedNotes.length} notes exported as HTML` });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <NotesList
            notes={notes}
            folders={folders}
            trashedNotes={trashedNotes}
            showTrash={showTrash}
            onShowTrashChange={setShowTrash}
            selectedNoteId={selectedNote?.id || null}
            onNoteSelect={handleNoteSelect}
            onNoteCreate={handleNoteCreate}
            onNoteDelete={handleNoteDelete}
            onNoteRestore={handleNoteRestore}
            onNotePermanentDelete={handleNotePermanentDelete}
            onFolderCreate={handleFolderCreate}
            onFolderRename={handleFolderRename}
            onFolderDelete={handleFolderDelete}
            onNoteMoveToFolder={handleNoteMoveToFolder}
            onFolderReorder={handleFolderReorder}
            onNoteToggleFavorite={handleNoteToggleFavorite}
            onNoteReorder={handleNoteReorder}
            onExportAll={handleExportAll}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <NoteEditor
            note={selectedNote}
            onSave={handleNoteSave}
            onLogout={handleLogout}
            saving={saving}
            onRestore={handleNoteSave}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
