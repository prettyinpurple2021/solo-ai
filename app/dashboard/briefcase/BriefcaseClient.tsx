"use client";

import { logError } from "@/lib/logger";
import React, { useState, useEffect } from "react";
import { CyberButton } from "@/components/cyber/CyberButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  FolderPlus,
  FileText,
  Image,
  File,
  Download,
  Share,
  MoreVertical,
  Star,
  Terminal as TerminalIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HudBorder } from "@/components/cyber/HudBorder";
import { useToast } from "@/hooks/use-toast";

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

interface BriefcaseClientProps {
  initialDocuments: any[];
  initialFolders: any[];
}

export default function BriefcaseClient({ initialDocuments, initialFolders }: BriefcaseClientProps) {
  const { toast } = useToast();
  
  const mappedDocs = initialDocuments.map(d => ({
    ...d,
    id: String(d.id),
    name: d.name || 'Untitled',
    fileType: d.fileType || 'unknown',
    size: d.size || 0,
    category: d.category || 'general',
    isFavorite: d.isFavorite || false,
    createdAt: d.createdAt?.toISOString() || new Date().toISOString()
  }));

  const [documents, setDocuments] = useState<Document[]>(mappedDocs);
  const [folders, setFolders] = useState<Folder[]>(initialFolders.map(f => ({
    ...f,
    fileCount: 0,
    totalSize: 0
  })));
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  const handleShare = (doc: any) => {
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

  const handleToggleFavorite = (doc: any) => {
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
    toast({ title: "Upload started", description: "This feature is being hardened." });
  };

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    toast({ title: "Action noted", description: "Folder creation hardening in progress." });
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
          <CyberButton onClick={handleCreateFolder} variant="purple" className="border-neon-purple/30 text-neon-purple">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </CyberButton>
          <label className="cursor-pointer">
            <CyberButton variant="purple" className="bg-gradient-to-r from-neon-purple to-neon-magenta text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </CyberButton>
            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
          </label>
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
    </div>
  );
}
