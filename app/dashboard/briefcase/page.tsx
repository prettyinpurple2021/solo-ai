"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SavedTemplatesList } from "@/components/templates/saved-templates-list"
import {
  Upload,
  FolderPlus,
  Search,
  FileText,
  FileImage,
  File,
  Folder,
  MoreHorizontal,
  Download,
  Trash2,
  Shield,
  HardDrive,
  Clock,
} from "lucide-react"

export default function Briefcase() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("root")
  const [activeTab, setActiveTab] = useState<"files" | "templates">("files")

  const folders = [
    { id: "contracts", name: "Contracts", count: 12, encrypted: true },
    { id: "financial", name: "Financial Records", count: 8, encrypted: true },
    { id: "marketing", name: "Marketing Assets", count: 24, encrypted: false },
    { id: "legal", name: "Legal Documents", count: 6, encrypted: true },
    { id: "projects", name: "Project Files", count: 18, encrypted: false },
  ]

  const files = [
    {
      id: 1,
      name: "Business Plan 2024.pdf",
      type: "pdf",
      size: "2.4 MB",
      modified: "2 hours ago",
      encrypted: true,
      folder: "root",
    },
    {
      id: 2,
      name: "Logo Design Final.png",
      type: "image",
      size: "1.2 MB",
      modified: "1 day ago",
      encrypted: false,
      folder: "marketing",
    },
    {
      id: 3,
      name: "Q4 Financial Report.xlsx",
      type: "spreadsheet",
      size: "856 KB",
      modified: "3 days ago",
      encrypted: true,
      folder: "financial",
    },
    {
      id: 4,
      name: "Client Contract Template.docx",
      type: "document",
      size: "124 KB",
      modified: "1 week ago",
      encrypted: true,
      folder: "contracts",
    },
    {
      id: 5,
      name: "Marketing Strategy.pptx",
      type: "presentation",
      size: "3.1 MB",
      modified: "2 weeks ago",
      encrypted: false,
      folder: "marketing",
    },
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return FileImage
      case "pdf":
      case "document":
      case "spreadsheet":
      case "presentation":
        return FileText
      default:
        return File
    }
  }

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedFolder === "root" || file.folder === selectedFolder),
  )

  const storageUsed = 45 // GB
  const storageTotal = 100 // GB
  const storagePercentage = (storageUsed / storageTotal) * 100

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Briefcase</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Briefcase</h1>
            <p className="text-muted-foreground">Secure document storage and organization</p>
          </div>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>Create a new folder to organize your documents.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input placeholder="Folder name" />
                </div>
                <DialogFooter>
                  <Button>Create Folder</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Storage Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storageUsed} GB</div>
              <Progress value={storagePercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{storageTotal - storageUsed} GB remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <File className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{files.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encrypted Files</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{files.filter((f) => f.encrypted).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">files this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === "files" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("files")}
          >
            <File className="w-4 h-4 mr-2" />
            Files
          </Button>
          <Button
            variant={activeTab === "templates" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("templates")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
        </div>

        {activeTab === "files" && (
          <>
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Folder className="mr-2 h-4 w-4" />
                    {selectedFolder === "root" ? "All Files" : folders.find((f) => f.id === selectedFolder)?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedFolder("root")}>All Files</DropdownMenuItem>
                  {folders.map((folder) => (
                    <DropdownMenuItem key={folder.id} onClick={() => setSelectedFolder(folder.id)}>
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}

        {activeTab === "files" && (
          <>
            {/* Folders Grid */}
            {selectedFolder === "root" && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Folders</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {folders.map((folder) => (
                    <Card
                      key={folder.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Folder className="h-8 w-8 text-blue-500" />
                          {folder.encrypted && <Shield className="h-4 w-4 text-green-500" />}
                        </div>
                        <h4 className="font-medium truncate">{folder.name}</h4>
                        <p className="text-sm text-muted-foreground">{folder.count} files</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Files List */}
            <div>
              <h3 className="text-lg font-semibold mb-3">{selectedFolder === "root" ? "Recent Files" : "Files"}</h3>
              <div className="space-y-2">
                {filteredFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type)
                  return (
                    <Card key={file.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{file.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.modified}</span>
                                {file.encrypted && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Shield className="h-3 w-3 text-green-500" />
                                      <span className="text-green-600">Encrypted</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === "templates" && (
          <SavedTemplatesList />
        )}
      </div>
    </SidebarInset>
  )
}
