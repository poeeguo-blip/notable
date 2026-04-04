import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface NoteVersion {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
}

interface NoteVersionHistoryProps {
  noteId: string;
  onRestore: (title: string, content: string) => void;
}

export const NoteVersionHistory = ({ noteId, onRestore }: NoteVersionHistoryProps) => {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && noteId) {
      fetchVersions();
    }
  }, [open, noteId]);

  const fetchVersions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("note_versions")
      .select("id, title, content, created_at")
      .eq("note_id", noteId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setVersions(data);
      setSelectedVersion(null);
    }
    setLoading(false);
  };

  const handleRestore = () => {
    if (!selectedVersion) return;
    onRestore(selectedVersion.title, selectedVersion.content || "");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 h-[60vh]">
          {/* Version list */}
          <ScrollArea className="w-1/3 border rounded-md">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading...</p>
            ) : versions.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No previous versions</p>
            ) : (
              <div className="p-2 space-y-1">
                {versions.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVersion(v)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedVersion?.id === v.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="font-medium truncate">{v.title || "Untitled"}</div>
                    <div className={`text-xs ${selectedVersion?.id === v.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {format(new Date(v.created_at), "MMM d, yyyy h:mm a")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Preview */}
          <div className="flex-1 border rounded-md flex flex-col">
            {selectedVersion ? (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">{selectedVersion.title || "Untitled"}</h3>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(selectedVersion.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedVersion.content || "<p>Empty</p>" }}
                  />
                </ScrollArea>
                <div className="p-3 border-t">
                  <Button size="sm" onClick={handleRestore} className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore this version
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a version to preview
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
