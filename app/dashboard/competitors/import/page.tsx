"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  X,
  Eye,
  Zap,
  Plus,
  Trash2
} from "lucide-react"
import Link from "next/link"

import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { BossButton, ZapButton } from "@/components/ui/boss-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ImportedCompetitor {
  id: string
  name: string
  domain: string
  description: string
  industry: string
  headquarters: string
  employeeCount: number | null
  fundingStage: string
  threatLevel: string
  status: 'valid' | 'warning' | 'error'
  issues: string[]
}

interface ValidationResult {
  valid: number
  warnings: number
  errors: number
  total: number
}

export default function CompetitorImportPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upload")
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importedData, setImportedData] = useState<ImportedCompetitor[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Mock CSV template data
  const csvTemplate = `name,domain,description,industry,headquarters,employeeCount,fundingStage,threatLevel
TechRival Corp,techrival.com,AI-powered productivity platform,Technology,San Francisco CA,150,series-b,high
StartupSlayer,startupslayer.io,Business automation tools,Technology,Austin TX,75,series-a,critical
BizBoost Solutions,bizboost.com,Business management platform,Technology,New York NY,200,series-c,medium`

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }

    try {
      setUploading(true)
      
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock parsed data with validation
      const mockData: ImportedCompetitor[] = [
        {
          id: "1",
          name: "TechRival Corp",
          domain: "techrival.com",
          description: "AI-powered productivity platform",
          industry: "Technology",
          headquarters: "San Francisco, CA",
          employeeCount: 150,
          fundingStage: "series-b",
          threatLevel: "high",
          status: "valid",
          issues: []
        },
        {
          id: "2",
          name: "StartupSlayer",
          domain: "startupslayer.io",
          description: "Business automation tools",
          industry: "Technology",
          headquarters: "Austin, TX",
          employeeCount: 75,
          fundingStage: "series-a",
          threatLevel: "critical",
          status: "valid",
          issues: []
        },
        {
          id: "3",
          name: "Invalid Company",
          domain: "invalid-domain",
          description: "",
          industry: "",
          headquarters: "",
          employeeCount: null,
          fundingStage: "",
          threatLevel: "unknown",
          status: "error",
          issues: [
            "Invalid domain format",
            "Missing description",
            "Missing industry",
            "Invalid threat level"
          ]
        },
        {
          id: "4",
          name: "Warning Company",
          domain: "warning.com",
          description: "Some description",
          industry: "Technology",
          headquarters: "",
          employeeCount: null,
          fundingStage: "",
          threatLevel: "medium",
          status: "warning",
          issues: [
            "Missing headquarters",
            "Missing employee count",
            "Missing funding stage"
          ]
        }
      ]
      
      setImportedData(mockData)
      
      // Calculate validation results
      const validation: ValidationResult = {
        valid: mockData.filter(item => item.status === 'valid').length,
        warnings: mockData.filter(item => item.status === 'warning').length,
        errors: mockData.filter(item => item.status === 'error').length,
        total: mockData.length
      }
      
      setValidationResult(validation)
      setActiveTab("review")
      
      // Select all valid and warning items by default
      const validItems = mockData
        .filter(item => item.status === 'valid' || item.status === 'warning')
        .map(item => item.id)
      setSelectedRows(new Set(validItems))
      
    } catch (error) {
      console.error('Error processing file:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'competitor-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  const selectAll = () => {
    const validItems = importedData
      .filter(item => item.status === 'valid' || item.status === 'warning')
      .map(item => item.id)
    setSelectedRows(new Set(validItems))
  }

  const deselectAll = () => {
    setSelectedRows(new Set())
  }

  const removeRow = (id: string) => {
    setImportedData(prev => prev.filter(item => item.id !== id))
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
    
    // Recalculate validation
    const updatedData = importedData.filter(item => item.id !== id)
    if (updatedData.length > 0) {
      const validation: ValidationResult = {
        valid: updatedData.filter(item => item.status === 'valid').length,
        warnings: updatedData.filter(item => item.status === 'warning').length,
        errors: updatedData.filter(item => item.status === 'error').length,
        total: updatedData.length
      }
      setValidationResult(validation)
    }
  }

  const handleImport = async () => {
    if (selectedRows.size === 0) return

    try {
      setImporting(true)
      
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // TODO: Replace with actual API calls
      // const selectedCompetitors = importedData.filter(item => selectedRows.has(item.id))
      // for (const competitor of selectedCompetitors) {
      //   await fetch('/api/competitors', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify(competitor)
      //   })
      // }
      
      router.push('/dashboard/competitors')
    } catch (error) {
      console.error('Error importing competitors:', error)
    } finally {
      setImporting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      valid: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="min-h-screen gradient-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/competitors">
              <BossButton variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </BossButton>
            </Link>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-12 h-12 gradient-accent rounded-full flex items-center justify-center"
                >
                  <Upload className="w-6 h-6 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gradient">Bulk Import Competitors</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Import multiple competitors at once using a CSV file
              </p>
            </div>
          </div>
          {selectedRows.size > 0 && (
            <ZapButton
              onClick={handleImport}
              loading={importing}
              icon={<Plus className="w-4 h-4" />}
            >
              Import {selectedRows.size} Competitor{selectedRows.size > 1 ? 's' : ''}
            </ZapButton>
          )}
        </div>

        {/* Import Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="review" disabled={importedData.length === 0}>
              Review & Import ({importedData.length})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {/* Instructions */}
            <EmpowermentCard>
              <h3 className="text-xl font-bold text-gradient mb-4">Import Instructions</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Required Fields:</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• <strong>name</strong> - Competitor company name</li>
                      <li>• <strong>domain</strong> - Website domain (e.g., example.com)</li>
                      <li>• <strong>threatLevel</strong> - low, medium, high, or critical</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Optional Fields:</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• <strong>description</strong> - Company description</li>
                      <li>• <strong>industry</strong> - Industry category</li>
                      <li>• <strong>headquarters</strong> - Company location</li>
                      <li>• <strong>employeeCount</strong> - Number of employees</li>
                      <li>• <strong>fundingStage</strong> - seed, series-a, series-b, etc.</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download our template to get started with the correct format
                  </p>
                  <BossButton
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download Template
                  </BossButton>
                </div>
              </div>
            </EmpowermentCard>

            {/* File Upload */}
            <EmpowermentCard>
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gradient">Upload CSV File</h3>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <motion.div
                    animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="mx-auto w-16 h-16 gradient-accent rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        {dragActive ? 'Drop your CSV file here' : 'Drag and drop your CSV file'}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        or click to browse and select a file
                      </p>
                      
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <BossButton
                          variant="primary"
                          size="sm"
                          as="span"
                          icon={<FileText className="w-4 h-4" />}
                        >
                          Select CSV File
                        </BossButton>
                      </label>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Maximum file size: 10MB • Supported format: CSV
                    </p>
                  </motion.div>
                </div>

                {uploading && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      <span className="text-gray-600 dark:text-gray-400">Processing file...</span>
                    </div>
                  </div>
                )}
              </div>
            </EmpowermentCard>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            {validationResult && (
              <EmpowermentCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gradient">Validation Results</h3>
                  <div className="flex items-center space-x-4">
                    <BossButton variant="secondary" size="sm" onClick={selectAll}>
                      Select All Valid
                    </BossButton>
                    <BossButton variant="secondary" size="sm" onClick={deselectAll}>
                      Deselect All
                    </BossButton>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 glass rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {validationResult.total}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResult.valid}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Valid</div>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {validationResult.warnings}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
                  </div>
                  <div className="text-center p-4 glass rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {validationResult.errors}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Threat Level</TableHead>
                        <TableHead>Issues</TableHead>
                        <TableHead className="w-12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedData.map((competitor) => (
                        <TableRow key={competitor.id}>
                          <TableCell>
                            {competitor.status !== 'error' && (
                              <input
                                type="checkbox"
                                checked={selectedRows.has(competitor.id)}
                                onChange={() => toggleRowSelection(competitor.id)}
                                className="rounded border-gray-300"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(competitor.status)}
                              <Badge 
                                variant="outline" 
                                className={getStatusBadge(competitor.status)}
                              >
                                {competitor.status.toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{competitor.name}</TableCell>
                          <TableCell>{competitor.domain}</TableCell>
                          <TableCell>{competitor.industry || '-'}</TableCell>
                          <TableCell>
                            {competitor.threatLevel && (
                              <Badge variant="outline">
                                {competitor.threatLevel.toUpperCase()}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {competitor.issues.length > 0 ? (
                              <div className="space-y-1">
                                {competitor.issues.slice(0, 2).map((issue, index) => (
                                  <div key={index} className="text-xs text-red-600">
                                    {issue}
                                  </div>
                                ))}
                                {competitor.issues.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{competitor.issues.length - 2} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-green-600 text-sm">No issues</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <BossButton
                              variant="secondary"
                              size="sm"
                              onClick={() => removeRow(competitor.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </BossButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {selectedRows.size > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRows.size} competitor{selectedRows.size > 1 ? 's' : ''} selected for import
                    </p>
                    <ZapButton
                      onClick={handleImport}
                      loading={importing}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      {importing ? 'Importing...' : `Import ${selectedRows.size} Competitor${selectedRows.size > 1 ? 's' : ''}`}
                    </ZapButton>
                  </div>
                )}
              </EmpowermentCard>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}