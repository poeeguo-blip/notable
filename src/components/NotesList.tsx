import { useState } from "react";
import { Plus, FileText, Trash2, Folder, FolderOpen, MoreVertical, Edit2, GripVertical, Star, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DndContext, DragEndEvent, closestCenter, DragOverlay, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Note {
  id: string;
  title: string;
  updated_at: string;
  folder_id: string | null;
  is_favorite: boolean;
  position: number;
  deleted_at?: string | null;
}

interface Folder {
  id: string;
  name: string;
  position: number;
}

interface NotesListProps {
  notes: Note[];
  folders: Folder[];
  trashedNotes: Note[];
  showTrash: boolean;
  onShowTrashChange: (show: boolean) => void;
  selectedNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onNoteCreate: (folderId?: string) => void;
  onNoteDelete: (id: string) => void;
  onNoteRestore: (id: string) => void;
  onNotePermanentDelete: (id: string) => void;
  onFolderCreate: () => void;
  onFolderRename: (id: string, name: string) => void;
  onFolderDelete: (id: string) => void;
  onNoteMoveToFolder: (noteId: string, folderId: string | null) => void;
  onFolderReorder: (folderId: string, newPosition: number) => void;
  onNoteToggleFavorite: (noteId: string) => void;
  onNoteReorder: (noteId: string, newPosition: number, folderId: string | null) => void;
  onExportAll?: () => void;
}

const SortableFolder = ({
  folder,
  children,
}: {
  folder: Folder;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `folder-${folder.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="flex items-center">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

const SortableNote = ({
  note,
  isSelected,
  onSelect,
  onDelete,
  onToggleFavorite,
}: {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-1 py-1.5 px-2 rounded-md transition-all overflow-hidden",
        "hover:bg-accent/50",
        isSelected && "bg-accent"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={onSelect}>
        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-xs flex items-start gap-1 break-words">
            {note.is_favorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />}
            <span className="break-words whitespace-normal">{note.title || "Untitled"}</span>
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            {format(new Date(note.updated_at), "MMM d, yyyy")}
          </div>
        </div>
      </div>
      <div className="flex items-center shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 shrink-0 transition-opacity",
            note.is_favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Star className={cn("h-3 w-3", note.is_favorite && "text-yellow-500 fill-yellow-500")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const DroppableArea = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "transition-colors rounded-lg",
        isOver && "bg-primary/10 ring-2 ring-primary/50"
      )}
    >
      {children}
    </div>
  );
};

export const NotesList = ({
  notes,
  folders,
  trashedNotes,
  showTrash,
  onShowTrashChange,
  selectedNoteId,
  onNoteSelect,
  onNoteCreate,
  onNoteDelete,
  onNoteRestore,
  onNotePermanentDelete,
  onFolderCreate,
  onFolderRename,
  onFolderDelete,
  onNoteMoveToFolder,
  onFolderReorder,
  onNoteToggleFavorite,
  onNoteReorder,
  onExportAll,
}: NotesListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const unfolderedNotes = notes.filter((note) => !note.folder_id)
    .sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return a.position - b.position;
    });
  const activeNote = notes.find((note) => note.id === activeId);
  const activeFolder = folders.find((folder) => `folder-${folder.id}` === activeId);

  // Sort folders by position
  const sortedFolders = [...folders].sort((a, b) => a.position - b.position);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeIdStr = active.id as string;
    const overId = over.id as string;

    // Check if we're dragging a folder
    if (activeIdStr.startsWith('folder-')) {
      const folderId = activeIdStr.replace('folder-', '');
      
      if (overId.startsWith('folder-')) {
        const overFolderId = overId.replace('folder-', '');
        const overFolder = sortedFolders.find(f => f.id === overFolderId);
        if (overFolder && folderId !== overFolderId) {
          onFolderReorder(folderId, overFolder.position);
        }
      }
      setActiveId(null);
      return;
    }

    // Otherwise it's a note drag
    const noteId = activeIdStr;

    // Check if dropped on a folder
    const folder = folders.find((f) => f.id === overId);
    if (folder) {
      onNoteMoveToFolder(noteId, folder.id);
    } else if (overId === "unfolderedNotes") {
      onNoteMoveToFolder(noteId, null);
    }

    setActiveId(null);
  };

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const startEditingFolder = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const finishEditingFolder = () => {
    if (editingFolderId && editingName.trim()) {
      onFolderRename(editingFolderId, editingName.trim());
    }
    setEditingFolderId(null);
    setEditingName("");
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full border-r border-border bg-card">
        <div className="p-2 border-b border-border space-y-1.5">
          <Button
            onClick={() => onNoteCreate()}
            className="w-full justify-start gap-2 h-8 text-xs"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New Note
          </Button>
          <Button
            onClick={onFolderCreate}
            variant="outline"
            className="w-full justify-start gap-2 h-8 text-xs"
            size="sm"
          >
            <Folder className="h-3.5 w-3.5" />
            New Folder
          </Button>
          {onExportAll && (
            <Button
              onClick={onExportAll}
              variant="outline"
              className="w-full justify-start gap-2 h-8 text-xs"
              size="sm"
            >
              <Download className="h-3.5 w-3.5" />
              Export All Notes
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-1.5 space-y-1">
            {/* Unfolderd Notes Section */}
            <DroppableArea id="unfolderedNotes">
              <Collapsible
                open={openFolders["unfolderedNotes"] !== false}
                onOpenChange={() => toggleFolder("unfolderedNotes")}
              >
                <CollapsibleTrigger
                  className="flex items-center gap-1.5 w-full py-1 px-2 rounded-md hover:bg-accent/50 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium flex-1 text-left">
                    Notes ({unfolderedNotes.length})
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-0.5 mt-0.5">
                  <SortableContext
                    items={unfolderedNotes.map((n) => n.id)}
                    strategy={verticalListSortingStrategy}
                    id="unfolderedNotes"
                  >
                    {unfolderedNotes.map((note) => (
                      <SortableNote
                        key={note.id}
                        note={note}
                        isSelected={selectedNoteId === note.id}
                        onSelect={() => onNoteSelect(note.id)}
                        onDelete={() => onNoteDelete(note.id)}
                        onToggleFavorite={() => onNoteToggleFavorite(note.id)}
                      />
                    ))}
                  </SortableContext>
                </CollapsibleContent>
              </Collapsible>
            </DroppableArea>

            {/* Folders */}
            <SortableContext
              items={sortedFolders.map((f) => `folder-${f.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {sortedFolders.map((folder) => {
                const folderNotes = notes.filter((note) => note.folder_id === folder.id);
                const isOpen = openFolders[folder.id] !== false;

                return (
                  <SortableFolder key={folder.id} folder={folder}>
                    <DroppableArea id={folder.id}>
                      <Collapsible
                        open={isOpen}
                        onOpenChange={() => toggleFolder(folder.id)}
                      >
                        <div className="flex items-center gap-1 group">
                          <CollapsibleTrigger className="flex items-center gap-1.5 flex-1 py-1 px-2 rounded-md hover:bg-accent/50 transition-colors">
                            {isOpen ? (
                              <FolderOpen className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            {editingFolderId === folder.id ? (
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={finishEditingFolder}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") finishEditingFolder();
                                  if (e.key === "Escape") {
                                    setEditingFolderId(null);
                                    setEditingName("");
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-5 text-xs"
                                autoFocus
                              />
                            ) : (
                              <span className="text-xs font-medium flex-1 text-left">
                                {folder.name} ({folderNotes.length})
                              </span>
                            )}
                          </CollapsibleTrigger>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onNoteCreate(folder.id)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => startEditingFolder(folder)}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onFolderDelete(folder.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CollapsibleContent className="space-y-0.5 mt-0.5 ml-4">
                          <SortableContext
                            items={folderNotes.map((n) => n.id)}
                            strategy={verticalListSortingStrategy}
                            id={folder.id}
                          >
                            {folderNotes.map((note) => (
                              <SortableNote
                                key={note.id}
                                note={note}
                                isSelected={selectedNoteId === note.id}
                                onSelect={() => onNoteSelect(note.id)}
                                onDelete={() => onNoteDelete(note.id)}
                                onToggleFavorite={() => onNoteToggleFavorite(note.id)}
                              />
                            ))}
                          </SortableContext>
                        </CollapsibleContent>
                      </Collapsible>
                    </DroppableArea>
                  </SortableFolder>
                );
              })}
            </SortableContext>

            {notes.length === 0 && folders.length === 0 && !showTrash && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Create your first note to get started</p>
              </div>
            )}

            {/* Trash Section */}
            <Collapsible
              open={showTrash}
              onOpenChange={onShowTrashChange}
            >
              <CollapsibleTrigger
                className="flex items-center gap-1.5 w-full py-1 px-2 rounded-md hover:bg-accent/50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium flex-1 text-left">
                  Trash ({trashedNotes.length})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-0.5">
                {trashedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="group relative flex items-center gap-1.5 py-1.5 px-2 rounded-md transition-all hover:bg-accent/50"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate text-muted-foreground">
                        {note.title || "Untitled"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {note.deleted_at && format(new Date(note.deleted_at), "MMM d, yyyy")}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => onNoteRestore(note.id)}
                      title="Restore"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive"
                      onClick={() => onNotePermanentDelete(note.id)}
                      title="Delete permanently"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {trashedNotes.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-xs">Trash is empty</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </div>

      <DragOverlay>
        {activeNote && (
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div className="font-medium text-sm">
                {activeNote.title || "Untitled"}
              </div>
            </div>
          </div>
        )}
        {activeFolder && (
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-3">
              <Folder className="h-4 w-4 text-primary" />
              <div className="font-medium text-sm">
                {activeFolder.name}
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
