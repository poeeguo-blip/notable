import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogOut, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RichTextEditor } from "@/components/RichTextEditor";
import { NoteVersionHistory } from "@/components/NoteVersionHistory";

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteEditorProps {
  note: Note | null;
  onSave: (noteId: string, title: string, content: string) => Promise<void>;
  onLogout: () => void;
  saving: boolean;
  onRestore?: (noteId: string, title: string, content: string) => void;
}

export const NoteEditor = ({ note, onSave, onLogout, saving, onRestore }: NoteEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const noteIdRef = useRef<string | null>(null);
  const titleRef = useRef("");
  const contentRef = useRef("");
  const hasChangesRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save previous note when switching and reset state
  useEffect(() => {
    // Clear any pending auto-save timer immediately
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Save the previous note if it had unsaved changes
    if (noteIdRef.current && hasChangesRef.current && note?.id !== noteIdRef.current) {
      onSave(noteIdRef.current, titleRef.current, contentRef.current);
    }

    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setHasChanges(false);
      noteIdRef.current = note.id;
      titleRef.current = note.title || "";
      contentRef.current = note.content || "";
      hasChangesRef.current = false;
    } else {
      setTitle("");
      setContent("");
      setHasChanges(false);
      noteIdRef.current = null;
      titleRef.current = "";
      contentRef.current = "";
      hasChangesRef.current = false;
    }
  }, [note?.id]);

  useEffect(() => {
    if (!noteIdRef.current || !hasChangesRef.current) return;

    const currentNoteId = noteIdRef.current;
    timerRef.current = setTimeout(() => {
      if (hasChangesRef.current && currentNoteId === noteIdRef.current) {
        onSave(currentNoteId, titleRef.current, contentRef.current);
        setHasChanges(false);
        hasChangesRef.current = false;
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [title, content]);

  const handleSave = async () => {
    if (!noteIdRef.current) return;
    await onSave(noteIdRef.current, titleRef.current, contentRef.current);
    setHasChanges(false);
    hasChangesRef.current = false;
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
    hasChangesRef.current = true;
    titleRef.current = value;
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
    hasChangesRef.current = true;
    contentRef.current = value;
  };

  if (!note) {
    return (
      <div className="flex flex-col h-full">
      <div className="border-b border-border p-4 flex justify-between items-center bg-card">
          <div></div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">Select a note or create a new one</p>
            <p className="text-sm">Your thoughts await...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4 flex justify-between items-center gap-4 bg-card">
        <div className="flex items-center gap-2 flex-1">
          {hasChanges && !saving && (
            <span className="text-xs text-muted-foreground">Unsaved changes</span>
          )}
          {saving && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Save className="h-3 w-3 animate-pulse" />
              Saving...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          <NoteVersionHistory
            noteId={note.id}
            onRestore={(title, content) => {
              handleTitleChange(title);
              handleContentChange(content);
              if (onRestore) {
                onRestore(note.id, title, content);
              }
            }}
          />
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-6">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="text-4xl font-serif border-none focus-visible:ring-0 px-0 h-auto py-2"
          />
          <RichTextEditor content={content} onChange={handleContentChange} />
        </div>
      </div>
    </div>
  );
};
