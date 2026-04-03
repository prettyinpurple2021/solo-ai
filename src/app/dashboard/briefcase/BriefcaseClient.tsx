"use client";

import { logError } from "@/lib/logger";
import React, { useRef, useState } from "react";
import { CyberButton } from "@/components/cyber/CyberButton";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Grid3X3,
  List,
  FolderPlus,
  FileText,
  Image,
  File,
  Star,
  Terminal as TerminalIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { HudBorder } from "@/components/cyber/HudBorder";
import { useToast } from "@/hooks/use-toast";
import { createFolderAction } from "./actions";

interface Document {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  size: number;
  fileUrl?: string;
  category: string;
  description?: string;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  lastAccessed?: string;
  createdAt: string;
  updatedAt: string;
  folderId?: number;
}

interface Folder {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  fileCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
}

/** Shape of each document row returned by the upload API. */
interface UploadApiDocResult {
  id: string | number;
  name?: string | null;
  type?: string | null;
  size?: number | null;
  downloadUrl?: string | null;
  category?: string | null;
  description?: string | null;
  tags?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Shape of the upload API response body. */
interface UploadApiResponse {
  results?: UploadApiDocResult[];
  failed?: number;
  errors?: string[];
  error?: string;
}

/** Raw DB row shape passed from the server page component. */
interface RawDocumentRow {
  id: string | number;
  name?: string | null;
  fileType?: string | null;
  size?: number | null;
  category?: string | null;
  isFavorite?: boolean | null;
  createdAt?: Date | string | null;
  [key: string]: unknown;
}

interface RawFolderRow {
  id: string | number;
  name?: string | null;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  [key: string]: unknown;
}

interface BriefcaseClientProps {
  initialDocuments: RawDocumentRow[];
  initialFolders: RawFolderRow[];
}

/** Derive a MIME type string from a file extension. */
function mimeTypeFromExtension(ext: string): string {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    csv: "text/csv",
    zip: "application/zip",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

export default function BriefcaseClient({ initialDocuments, initialFolders }: BriefcaseClientProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mappedDocs: Document[] = initialDocuments.map((d) => ({
    id: String(d.id),
    name: d.name || 'Untitled',
    originalName: (d.originalName as string | undefined) || d.name || 'Untitled',
    fileType: d.fileType || 'unknown',
    mimeType: mimeTypeFromExtension(d.fileType || ''),
    size: d.size || 0,
    fileUrl: (d.fileUrl as string | undefined) || undefined,
    category: d.category || 'general',
    description: (d.description as string | undefined) || undefined,
    tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
    isFavorite: d.isFavorite || false,
    isPublic: (d.isPublic as boolean | undefined) || false,
    downloadCount: (d.downloadCount as number | undefined) || 0,
    viewCount: (d.viewCount as number | undefined) || 0,
    createdAt: d.createdAt instanceof Date
      ? d.createdAt.toISOString()
      : d.createdAt || new Date().toISOString(),
    updatedAt: (d.updatedAt as string | undefined) || new Date().toISOString(),
    folderId: (d.folderId as number | undefined) || undefined,
  }));

  const [documents, setDocuments] = useState<Document[]>(mappedDocs);
  const [folders, setFolders] = useState<Folder[]>(initialFolders.map((f) => ({
    id: Number(f.id),
    name: f.name || 'Untitled',
    description: f.description ?? undefined,
    color: f.color || '#8B5CF6',
    icon: f.icon ?? undefined,
    fileCount: 0,
    totalSize: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })));

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Folder creation dialog state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderCreating, setFolderCreating] = useState(false);

  const handleFolderDialogChange = (open: boolean) => {
    setFolderDialogOpen(open);
    if (!open) setFolderName("");
  };

  const getFolderColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      "#8B5CF6": "bg-neon-purple",
      "#EC4899": "bg-neon-magenta",
      "#6366F1": "bg-indigo-500",
      "#F59E0B": "bg-neon-orange",
      "#10B981": "bg-neon-lime",
      "#EF4444": "bg-red-500",
      "#06B6D4": "bg-neon-cyan",
      "#3B82F6": "bg-blue-500",
      "#F97316": "bg-neon-orange",
      "#84CC16": "bg-neon-lime",
      "#A855F7": "bg-neon-purple",
      "#F43F5E": "bg-neon-magenta",
    };
    return colorMap[color] || "bg-gray-500";
  };

  const handleShare = (doc: Document) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: doc.name,
          text: `Check out this file: ${doc.name}`,
          url: window.location.href,
        })
        .catch((error) => logError("Error sharing", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Link copied to clipboard",
      });
    }
  };

  const handleToggleFavorite = (doc: Document) => {
    const newStatus = !doc.isFavorite;
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, isFavorite: newStatus } : d))
    );
    toast({
      title: newStatus ? "Added to Favorites" : "Removed from Favorites",
      description: `${doc.name} status updated.`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      const response = await fetch("/api/briefcases/upload", {
        method: "PUT",
        body: formData,
      });

      const result: UploadApiResponse = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to upload files");
      }

      const uploadedDocs = Array.isArray(result.results)
        ? result.results.map((doc: UploadApiDocResult): Document => {
            const ext = (doc.type || "").toLowerCase();
            return {
              id: String(doc.id),
              name: doc.name || "Untitled",
              originalName: doc.name || "Untitled",
              fileType: ext || "unknown",
              mimeType: mimeTypeFromExtension(ext),
              size: Number(doc.size || 0),
              fileUrl: doc.downloadUrl ?? undefined,
              category: doc.category || "uncategorized",
              description: doc.description ?? undefined,
              tags: Array.isArray(doc.tags) ? doc.tags : [],
              isFavorite: false,
              isPublic: false,
              downloadCount: 0,
              viewCount: 0,
              createdAt: doc.createdAt || new Date().toISOString(),
              updatedAt: doc.updatedAt || new Date().toISOString(),
              folderId: undefined,
            };
          })
        : [];

      if (uploadedDocs.length > 0) {
        setDocuments((prev) => [...uploadedDocs, ...prev]);
      }

      // Surface partial failures so users know some files were not saved.
      const failedCount = result.failed ?? 0;
      if (failedCount > 0) {
        toast({
          title: `Uploaded ${uploadedDocs.length} file${uploadedDocs.length === 1 ? "" : "s"} (${failedCount} failed)`,
          description: result.errors?.join("; ") || "Some files could not be uploaded.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload complete",
          description: `Uploaded ${uploadedDocs.length} file${uploadedDocs.length === 1 ? "" : "s"}.`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      // Reset so selecting same file again retriggers onChange
      event.target.value = "";
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setFolderCreating(true);
    try {
      const result = await createFolderAction(folderName.trim());
      if (!result.success || !result.folder) {
        throw new Error(result.error || "Failed to create folder");
      }
      const folder = result.folder;
      setFolders((prev) => [
        {
          id: Number(folder.id),
          name: folder.name,
          description: folder.description ?? undefined,
          color: folder.color || "#8B5CF6",
          icon: folder.icon ?? undefined,
          fileCount: Number(folder.file_count || 0),
          totalSize: Number(folder.total_size || 0),
          createdAt: folder.created_at || new Date().toISOString(),
          updatedAt: folder.updated_at || new Date().toISOString(),
        },
        ...prev,
      ]);
      toast({ title: "Folder created", description: `"${folderName.trim()}" is ready.` });
      setFolderDialogOpen(false);
      setFolderName("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create folder";
      toast({ title: "Folder creation failed", description: message, variant: "destructive" });
    } finally {
      setFolderCreating(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf": return <FileText className="w-5 h-5 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png": return <Image className="w-5 h-5 text-blue-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const categories = ["all", ...new Set(documents.map((doc) => doc.category))];

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden p-6">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-neon-purple/10 border border-neon-purple/30 rounded-none">
            <TerminalIcon className="w-8 h-8 text-neon-purple" />
          </div>
          <div>
            <h1 className="text-5xl font-orbitron font-black tracking-tighter text-white uppercase italic">
              Brief<span className="text-neon-purple">Case</span>
            </h1>
            <p className="text-purple-200 font-mono uppercase text-xs tracking-[0.2em] font-bold">
              Secure Repository // v1.0.4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CyberButton onClick={() => setFolderDialogOpen(true)} variant="purple" className="border-neon-purple/30 text-neon-purple">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </CyberButton>
          <CyberButton
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="purple"
            className="bg-gradient-to-r from-neon-purple to-neon-magenta text-white"
          >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
          </CyberButton>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <HudBorder className="p-4">
            <p className="text-sm text-gray-400 font-mono">Total Files</p>
            <p className="text-2xl font-orbitron font-bold text-white">{documents.length}</p>
          </HudBorder>
          <HudBorder className="p-4">
            <p className="text-sm text-gray-400 font-mono">Folders</p>
            <p className="text-2xl font-orbitron font-bold text-white">{folders.length}</p>
          </HudBorder>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search missions..."
            className="bg-dark-card border-neon-cyan/30 text-white font-mono"
          />
          <div className="flex items-center gap-2">
            <CyberButton variant={viewMode === "grid" ? "purple" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="w-4 h-4" />
            </CyberButton>
            <CyberButton variant={viewMode === "list" ? "purple" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
              <List className="w-4 h-4" />
            </CyberButton>
          </div>
        </div>

        {/* Documents */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-2"}>
          {filteredDocuments.map((doc) => (
            <HudBorder key={doc.id} variant="hover" className="p-4">
              <div className="flex items-center justify-between mb-2">
                {getFileIcon(doc.fileType)}
                <Star className={`w-4 h-4 cursor-pointer ${doc.isFavorite ? 'text-neon-orange fill-current' : 'text-gray-500'}`} onClick={() => handleToggleFavorite(doc)} />
              </div>
              <h3 className="font-orbitron font-bold text-sm text-white truncate">{doc.name}</h3>
              <p className="text-xs text-gray-400 font-mono">{formatFileSize(doc.size)} • {doc.category}</p>
            </HudBorder>
          ))}
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={handleFolderDialogChange}>
        <DialogContent className="bg-dark-card border border-neon-purple/30 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron uppercase tracking-wider">New Folder</DialogTitle>
          </DialogHeader>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateFolder() } }}
            placeholder="Folder name..."
            className="bg-dark-bg border-neon-cyan/30 text-white font-mono"
            autoFocus
          />
          <DialogFooter className="gap-2">
            <CyberButton variant="ghost" onClick={() => handleFolderDialogChange(false)} disabled={folderCreating}>
              Cancel
            </CyberButton>
            <CyberButton
              variant="purple"
              onClick={handleCreateFolder}
              disabled={!folderName.trim() || folderCreating}
            >
              {folderCreating ? "Creating…" : "Create"}
            </CyberButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
