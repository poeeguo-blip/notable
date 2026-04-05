import { useState, useCallback } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { NotesList } from "@/components/NotesList";
import { NoteEditor } from "@/components/NoteEditor";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/useNotes";
import { useFolders } from "@/hooks/useFolders";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const {
    notes,
    trashedNotes,
    showTrash,
    setShowTrash,
    addNote,
    deleteNote,
    restoreNote,
    permanentlyDeleteNote,
    updateNote,
  } = useNotes();

  const {
    folders,
    addFolder,
    renameFolder,
    deleteFolder,
    moveNoteToFolder,
    reorderFolders,
  } = useFolders();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNoteSave = useCallback(
    async (noteId, content, title) => {
      setSaving(true);
      try {
        await updateNote(noteId, content, title);
      } finally {
        setSaving(false);
      }
    },
    [updateNote]
  );

  const handleNoteCreate = useCallback(async () => {
    const newNote = await addNote();
    if (newNote) {
      setSelectedNote(newNote);
    }
  }, [addNote]);

  const handleNoteDelete = useCallback(
    async (noteId) => {
      await deleteNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    },
    [deleteNote, selectedNote]
  );

  const handleNoteRestore = useCallback(
    async (noteId) => {
      await restoreNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    },
    [restoreNote, selectedNote]
  );

  const handleNotePermanentDelete = useCallback(
    async (noteId) => {
      await permanentlyDeleteNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    },
    [permanentlyDeleteNote, selectedNote]
  );

  const handleFolderCreate = useCallback(async () => {
    await addFolder();
  }, [addFolder]);

  const handleFolderRename = useCallback(
    async (folderId, newName) => {
      await renameFolder(folderId, newName);
    },
    [renameFolder]
  );

  const handleFolderDelete = useCallback(
    async (folderId) => {
      await deleteFolder(folderId);
    },
    [deleteFolder]
  );

  const handleNoteMoveToFolder = useCallback(
    async (noteId, folderId) => {
      await moveNoteToFolder(noteId, folderId);
    },
    [moveNoteToFolder]
  );

  const handleFolderReorder = useCallback(
    async (folderId, newPosition) => {
      await reorderFolders(folderId, newPosition);
    },
    [reorderFolders]
  );

  const handleNoteToggleFavorite = useCallback(async (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      await updateNote(noteId, note.content, note.title, !note.is_favorite);
    }
  }, [notes, updateNote]);

  const handleNoteReorder = useCallback(
    async (noteId, newPosition) => {
      // This would require implementing reorder logic in useNotes
    },
    []
  );

  const handleExportAll = useCallback(async () => {
    const allNotes = notes.filter((n) => !n.is_deleted);
    const jsonString = JSON.stringify(allNotes, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [notes]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="w-1/4 border-r flex flex-col overflow-hidden bg-background">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-background">
            <h1 className="text-lg font-semibold">Notes</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs"
            >
              Logout
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-auto">
            <NotesList
              notes={notes}
              folders={folders}
              trashedNotes={trashedNotes}
              showTrash={showTrash}
              onShowTrashChange={setShowTrash}
              selectedNoteId={selectedNote?.id || null}
              onNoteSelect={setSelectedNote}
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
          </div>
        </div>

        {/* Desktop Editor */}
        <div className="w-3/4 flex flex-col overflow-hidden">
          {selectedNote ? (
            <>
              <div className="px-4 py-3 border-b bg-background h-14 flex items-center justify-between">
                <h2 className="text-sm font-semibold truncate">
                  {selectedNote.title || "Untitled"}
                </h2>
                {saving && (
                  <span className="text-xs text-muted-foreground">
                    Saving...
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <NoteEditor
                  note={selectedNote}
                  onSave={handleNoteSave}
                  onLogout={handleLogout}
                  saving={saving}
                  onRestore={handleNoteSave}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select a note to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout - Fullscreen, either list OR editor */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        {selectedNote ? (
          // Mobile: Fullscreen Note Editor
          <>
            {/* Mobile Header with Back Button */}
            <div className="flex items-center gap-3 px-3 py-3 border-b bg-background h-14">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedNote(null)}
                title="Back to notes list"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </Button>
              <h2 className="text-sm font-semibold flex-1 truncate">
                {selectedNote.title || "Untitled"}
              </h2>
              {saving && (
                <span className="text-xs text-muted-foreground">
                  Saving...
                </span>
              )}
            </div>

            {/* Fullscreen Note Editor */}
            <div className="flex-1 overflow-hidden">
              <NoteEditor
                note={selectedNote}
                onSave={handleNoteSave}
                onLogout={handleLogout}
                saving={saving}
                onRestore={handleNoteSave}
              />
            </div>
          </>
        ) : (
          // Mobile: Notes List
          <>
            {/* Mobile Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-background h-14">
              <h1 className="text-lg font-semibold">Notes</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs"
              >
                Logout
              </Button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-hidden">
              <NotesList
                notes={notes}
                folders={folders}
                trashedNotes={trashedNotes}
                showTrash={showTrash}
                onShowTrashChange={setShowTrash}
                selectedNoteId={selectedNote?.id || null}
                onNoteSelect={setSelectedNote}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
