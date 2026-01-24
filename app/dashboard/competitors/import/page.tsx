"use client"


export const dynamic = 'force-dynamic'
import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, type DragEvent, type ChangeEvent} from "react"
import { motion} from "framer-motion"
import { useRouter} from "next/navigation"
import { 
  ArrowLeft, Upload, Download, CheckCircle, AlertTriangle, X, Trash2} from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"

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
  keyProducts: string[]
  socialMediaFollowers: { linkedin: number; twitter: number }
  isPublic: boolean
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

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    try {
      setUploading(true)
      
      // Process file immediately

      
      // Parse CSV data with proper CSV parsing to handle quoted fields and commas
      const csvText = await file.text()
      const lines = csvText.split('\n').filter(line => line.trim())
      
      // Proper CSV parsing function that handles quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        let i = 0
        
        while (i < line.length) {
          const char = line[i]
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // Escaped quote
              current += '"'
              i += 2
            } else {
              // Toggle quote state
              inQuotes = !inQuotes
              i++
            }
          } else if (char === ',' && !inQuotes) {
            // Field separator
            result.push(current.trim())
            current = ''
            i++
          } else {
            current += char
            i++
          }
        }
        
        // Add the last field
        result.push(current.trim())
        return result
      }
      
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
      const parsedData: ImportedCompetitor[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const row: any = {}
        
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        
        const issues: string[] = []
        
        // Validate required fields
        if (!row.name || row.name.trim() === '') {
          issues.push('Company name is required')
        }
        
        if (!row.domain || row.domain.trim() === '') {
          issues.push('Domain is required')
        } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})$/.test(row.domain)) {
          issues.push('Invalid domain format')
        }
        
        if (!row.description || row.description.trim() === '') {
          issues.push('Description is required')
        }
        
        if (!row.industry || row.industry.trim() === '') {
          issues.push('Industry is required')
        }
        
        // Validate threat level
        const validThreatLevels = ['low', 'medium', 'high', 'critical']
        if (!validThreatLevels.includes(row.threatlevel?.toLowerCase())) {
          issues.push('Invalid threat level. Must be: low, medium, high, or critical')
        }
        
        // Validate employee count if provided
        if (row.employeecount && isNaN(parseInt(row.employeecount))) {
          issues.push('Employee count must be a number')
        }
        
        const status = issues.length === 0 ? 'valid' : issues.length <= 2 ? 'warning' : 'error'
        
        // Parse key products from CSV (semicolon-separated string to avoid comma conflicts)
        const keyProducts = row.keyproducts 
          ? row.keyproducts.split(';').map((p: string) => p.trim()).filter(Boolean)
          : []
        
        // Parse social media followers (expecting format like "linkedin:1000;twitter:500")
        // Using semicolon delimiter to avoid conflicts with CSV field separators
        const socialMediaFollowers = { linkedin: 0, twitter: 0 }
        if (row.socialmediafollowers) {
          const followers = row.socialmediafollowers.split(';')
          followers.forEach((follower: string) => {
            const trimmedFollower = follower.trim()
            if (trimmedFollower.includes(':')) {
              const [platform, count] = trimmedFollower.split(':').map((s: string) => s.trim())
              if (platform === 'linkedin' && !isNaN(parseInt(count))) {
                socialMediaFollowers.linkedin = parseInt(count)
              } else if (platform === 'twitter' && !isNaN(parseInt(count))) {
                socialMediaFollowers.twitter = parseInt(count)
              }
            }
          })
        }
        
        // Parse isPublic field (expecting "true", "false", "1", "0", "yes", "no")
        const isPublic = row.ispublic 
          ? ['true', '1', 'yes', 'y'].includes(row.ispublic.toLowerCase())
          : false
        
        parsedData.push({
          id: i.toString(),
          name: row.name || '',
          domain: row.domain || '',
          description: row.description || '',
          industry: row.industry || '',
          headquarters: row.headquarters || '',
          employeeCount: row.employeecount ? parseInt(row.employeecount) : null,
          fundingStage: row.fundingstage || '',
          threatLevel: row.threatlevel?.toLowerCase() || 'medium',
          keyProducts,
          socialMediaFollowers,
          isPublic,
          status,
          issues
        })
      }
      
      setImportedData(parsedData)
      
      // Calculate validation results
      const validation: ValidationResult = {
        valid: parsedData.filter(item => item.status === 'valid').length,
        warnings: parsedData.filter(item => item.status === 'warning').length,
        errors: parsedData.filter(item => item.status === 'error').length,
        total: parsedData.length
      }
      
      setValidationResult(validation)
      setActiveTab("review")
      
      // Select all valid and warning items by default
      const validItems = parsedData
        .filter(item => item.status === 'valid' || item.status === 'warning')
        .map(item => item.id)
      setSelectedRows(new Set(validItems))
      
    } catch (error) {
      logError('Error processing file:', error)
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
    setImportedData(prev => {
      const updatedData = prev.filter(item => item.id !== id)
      
      // Recalculate validation using the updated data
      if (updatedData.length > 0) {
        const validation: ValidationResult = {
          valid: updatedData.filter(item => item.status === 'valid').length,
          warnings: updatedData.filter(item => item.status === 'warning').length,
          errors: updatedData.filter(item => item.status === 'error').length,
          total: updatedData.length
        }
        setValidationResult(validation)
      } else {
        setValidationResult({ valid: 0, warnings: 0, errors: 0, total: 0 })
      }
      
      return updatedData
    })
    
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleImport = async () => {
    if (selectedRows.size === 0) return

    try {
      setImporting(true)
      
      // Import selected competitors via API with individual error handling
      const selectedCompetitors = importedData.filter(item => selectedRows.has(item.id))
      const importResults = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      }
      
      for (const competitor of selectedCompetitors) {
        try {
          const response = await fetch('/api/competitors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: competitor.name,
              domain: competitor.domain,
              description: competitor.description,
              industry: competitor.industry,
              headquarters: competitor.headquarters,
              employeeCount: competitor.employeeCount,
              fundingStage: competitor.fundingStage,
              keyProducts: competitor.keyProducts,
              socialMediaFollowers: competitor.socialMediaFollowers,
              isPublic: competitor.isPublic
            })
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${errorText}`)
          }
          
          importResults.successful++
        } catch (error) {
          importResults.failed++
          importResults.errors.push(`${competitor.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          logError(`Failed to import competitor ${competitor.name}:`, error)
        }
      }
      
      // Show import results
      if (importResults.failed > 0) {
        logError(`Import completed with ${importResults.failed} failures:`, importResults.errors)
        // You might want to show a toast or notification here
      }
      
      router.push('/dashboard/competitors')
    } catch (error) {
      logError('Error importing competitors:', error)
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
      valid: 'bg-green-500/20 text-green-500 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      error: 'bg-red-500/20 text-red-500 border-red-500/30'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
              <Button variant="outline" size="sm" className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
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
                <h1 className="text-3xl font-bold font-orbitron text-gradient tracking-wide">Bulk Import Competitors</h1>
              </div>
              <p className="text-gray-400 font-mono">
                Import multiple competitors at once using a CSV file
              </p>
            </div>
          </div>
          {selectedRows.size > 0 && (
            <Button
              onClick={handleImport}
              disabled={importing}
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
            >
              {importing ? <span className="animate-spin mr-2">⟳</span> : <Upload className="w-4 h-4 mr-2" />}
              Import {selectedRows.size} Competitor{selectedRows.size > 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Import Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-dark-bg border border-neon-cyan/30">
            <TabsTrigger value="upload" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">Upload File</TabsTrigger>
            <TabsTrigger value="review" disabled={importedData.length === 0} className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
              Review & Import ({importedData.length})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {/* Instructions */}
            {/* Instructions */}
            <Card className="bg-dark-card border-neon-cyan/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold font-orbitron text-gradient mb-4">Import Instructions</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-neon-cyan mb-2 font-mono">Required Fields:</h4>
                      <ul className="space-y-1 text-sm text-gray-400 font-mono">
                        <li>• <strong className="text-white">name</strong> - Competitor company name</li>
                        <li>• <strong className="text-white">domain</strong> - Website domain (e.g., example.com)</li>
                        <li>• <strong className="text-white">threatLevel</strong> - low, medium, high, or critical</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neon-cyan mb-2 font-mono">Optional Fields:</h4>
                      <ul className="space-y-1 text-sm text-gray-400 font-mono">
                        <li>• <strong className="text-white">description</strong> - Company description</li>
                        <li>• <strong className="text-white">industry</strong> - Industry category</li>
                        <li>• <strong className="text-white">headquarters</strong> - Company location</li>
                        <li>• <strong className="text-white">employeeCount</strong> - Number of employees</li>
                        <li>• <strong className="text-white">fundingStage</strong> - seed, series-a, series-b, etc.</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Download our template to get started with the correct format
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTemplate}
                      className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            {/* File Upload */}
            <Card className="bg-dark-card border-neon-cyan/20">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold font-orbitron text-gradient">Upload CSV File</h3>
                  
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-neon-cyan bg-neon-cyan/10' 
                        : 'border-gray-700 hover:border-gray-600'
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
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {dragActive ? 'Drop your CSV file here' : 'Drag and drop your CSV file'}
                        </h4>
                        <p className="text-gray-400 mb-4">
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
                          <Button
                            variant="purple"
                            size="sm"
                            className="bg-neon-purple text-white hover:bg-neon-purple/80"
                            asChild
                          >
                            <span>Select CSV File</span>
                          </Button>
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
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-cyan"></div>
                        <span className="text-gray-400">Processing file...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            {validationResult && (
              <Card className="bg-dark-card border-neon-cyan/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold font-orbitron text-gradient">Validation Results</h3>
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm" onClick={selectAll} className="border-neon-green/50 text-neon-green hover:bg-neon-green/10">
                        Select All Valid
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAll} className="border-gray-500 text-gray-400 hover:bg-gray-800">
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-dark-bg/50 rounded-lg border border-white/5">
                      <div className="text-2xl font-bold font-mono text-white">
                        {validationResult.total}
                      </div>
                      <div className="text-sm text-gray-400">Total Rows</div>
                    </div>
                    <div className="text-center p-4 bg-dark-bg/50 rounded-lg border border-white/5">
                      <div className="text-2xl font-bold font-mono text-neon-green">
                        {validationResult.valid}
                      </div>
                      <div className="text-sm text-gray-400">Valid</div>
                    </div>
                    <div className="text-center p-4 bg-dark-bg/50 rounded-lg border border-white/5">
                      <div className="text-2xl font-bold font-mono text-neon-yellow">
                        {validationResult.warnings}
                      </div>
                      <div className="text-sm text-gray-400">Warnings</div>
                    </div>
                    <div className="text-center p-4 bg-dark-bg/50 rounded-lg border border-white/5">
                      <div className="text-2xl font-bold font-mono text-neon-red">
                        {validationResult.errors}
                      </div>
                      <div className="text-sm text-gray-400">Errors</div>
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
                                aria-label={`Select ${competitor.name} for import`}
                                className="rounded border-gray-600 bg-dark-bg focus:ring-neon-cyan"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(competitor.status)}
                              <Badge 
                                variant="cyan" 
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
                              <Badge variant="purple" className="ml-2">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => removeRow(competitor.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {selectedRows.size > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      {selectedRows.size} competitor{selectedRows.size > 1 ? 's' : ''} selected for import
                    </p>
                    <Button
                      onClick={handleImport}
                      disabled={importing}
                      className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
                    >
                      {importing ? 'Importing...' : `Import ${selectedRows.size} Competitor${selectedRows.size > 1 ? 's' : ''}`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}