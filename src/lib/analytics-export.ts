import { logError, logInfo,} from '@/lib/logger'
import { z } from 'zod'
import { jsPDF } from 'jspdf'
import ExcelJS from 'exceljs'

// Export format types
export const ExportFormatSchema = z.enum(['pdf', 'excel', 'csv', 'json'])
export type ExportFormat = z.infer<typeof ExportFormatSchema>

// Export configuration
export const ExportConfigSchema = z.object({
  format: ExportFormatSchema,
  includeCharts: z.boolean().default(true),
  includeData: z.boolean().default(true),
  includeMetadata: z.boolean().default(true),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  filters: z.record(z.unknown()).optional(),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'corporate']).default('light'),
    colors: z.array(z.string()).optional(),
    logo: z.string().optional(),
    companyName: z.string().optional()
  }).optional(),
  compression: z.boolean().default(false),
  password: z.string().optional(),
  maxRows: z.number().optional()
})

export type ExportConfig = z.infer<typeof ExportConfigSchema>

// Analytics data types
export interface AnalyticsData {
  id: string
  type: 'metric' | 'dimension' | 'calculated'
  name: string
  value: number | string
  metadata?: Record<string, unknown>
  timestamp: Date
}

export interface ChartData {
  id: string
  type: string
  title: string
  data: unknown[]
  config: Record<string, unknown>
  metadata: {
    created: Date
    updated: Date
    dataSource: string
  }
}

export interface ReportData {
  title: string
  description: string
  generatedAt: Date
  generatedBy: string
  data: AnalyticsData[]
  charts: ChartData[]
  metadata: {
    totalRecords: number
    dateRange: { start: Date; end: Date }
    filters: Record<string, unknown>
  }
}

/**
 * Analytics Export Service
 */
export class AnalyticsExportService {
  private static instance: AnalyticsExportService
  private exportQueue: Map<string, ExportJob> = new Map()
  private maxConcurrentExports = 5
  private activeExports = 0

  private constructor() {
    // Initialize export service
    logInfo('Analytics Export Service initialized')
  }

  public static getInstance(): AnalyticsExportService {
    if (!AnalyticsExportService.instance) {
      AnalyticsExportService.instance = new AnalyticsExportService()
    }
    return AnalyticsExportService.instance
  }

  /**
   * Export analytics data
   */
  async exportData(
    reportData: ReportData,
    config: ExportConfig,
    userId: string
  ): Promise<{ jobId: string; status: string; message: string }> {
    const jobId = crypto.randomUUID()
    
    try {
      // Validate configuration
      const validatedConfig = ExportConfigSchema.parse(config)
      
      // Check export limits
      if (this.activeExports >= this.maxConcurrentExports) {
        throw new Error('Export queue is full. Please try again later.')
      }

      // Create export job
      const job: ExportJob = {
        id: jobId,
        userId,
        status: 'pending',
        format: validatedConfig.format,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        progress: 0,
        error: null,
        result: null
      }

      this.exportQueue.set(jobId, job)
      this.activeExports++

      // Process export asynchronously
      this.processExport(jobId, reportData, validatedConfig)
        .catch(error => {
          logError('Export processing failed:', error)
          this.updateJobStatus(jobId, 'failed', error.message)
        })

      return {
        jobId,
        status: 'pending',
        message: 'Export job created successfully'
      }

    } catch (error) {
      logError('Export creation failed:', error)
      throw error
    }
  }

  /**
   * Process export job
   */
  private async processExport(
    jobId: string,
    reportData: ReportData,
    config: ExportConfig
  ): Promise<void> {
    const job = this.exportQueue.get(jobId)
    if (!job) return

    try {
      this.updateJobStatus(jobId, 'processing', null, 10)
      
      // Prepare data based on configuration
      const processedData = await this.prepareData(reportData, config)
      this.updateJobStatus(jobId, 'processing', null, 30)

      // Generate export based on format
      let result: ExportResult
      
      switch (config.format) {
        case 'pdf':
          result = await this.exportToPDF(processedData, config, jobId)
          break
        case 'excel':
          result = await this.exportToExcel(processedData, config, jobId)
          break
        case 'csv':
          result = await this.exportToCSV(processedData, config, jobId)
          break
        case 'json':
          result = await this.exportToJSON(processedData, config, jobId)
          break
        default:
          throw new Error(`Unsupported export format: ${config.format}`)
      }

      this.updateJobStatus(jobId, 'completed', null, 100, result)
      
      // Clean up after 1 hour
      setTimeout(() => {
        this.exportQueue.delete(jobId)
        this.activeExports--
      }, 60 * 60 * 1000)

    } catch (error) {
      logError('Export processing error:', error)
      this.updateJobStatus(jobId, 'failed', error instanceof Error ? error.message : 'Unknown error')
      this.activeExports--
    }
  }

  /**
   * Prepare data for export
   */
  private async prepareData(reportData: ReportData, config: ExportConfig): Promise<ProcessedData> {
    let data = reportData.data
    let charts = reportData.charts

    // Apply date range filter
    if (config.dateRange) {
      data = data.filter(item => 
        item.timestamp >= config.dateRange!.start && 
        item.timestamp <= config.dateRange!.end
      )
    }

    // Apply custom filters
    if (config.filters) {
      data = this.applyFilters(data, config.filters)
    }

    // Filter charts if not including them
    if (!config.includeCharts) {
      charts = []
    }

    return {
      title: reportData.title,
      description: reportData.description,
      generatedAt: reportData.generatedAt,
      generatedBy: reportData.generatedBy,
      data: config.includeData ? data : [],
      charts: charts,
      metadata: {
        totalRecords: data.length,
        dateRange: (config.dateRange || { start: new Date(0), end: new Date() }) as { start: Date; end: Date },
        filters: config.filters || {},
        exportConfig: config
      }
    }
  }

  /**
   * Apply filters to data
   */
  private applyFilters(data: AnalyticsData[], filters: Record<string, unknown>): AnalyticsData[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        const itemValue = item.metadata?.[key];
        
        if (typeof value === 'string') {
          return String(itemValue ?? '').toLowerCase().includes(value.toLowerCase())
        }
        if (typeof value === 'number') {
          return itemValue === value
        }
        if (Array.isArray(value)) {
          return value.includes(itemValue)
        }
        return true
      })
    })
  }

  /**
   * Export to PDF
   */
  private async exportToPDF(data: ProcessedData, config: ExportConfig, jobId: string): Promise<ExportResult> {
    try {
      const doc = new jsPDF()
      let y = 20

      // Title
      doc.setFontSize(22)
      doc.text(data.title, 20, y)
      y += 10

      // Description
      doc.setFontSize(12)
      doc.text(data.description, 20, y)
      y += 10

      // Metadata
      doc.setFontSize(10)
      doc.text(`Generated: ${data.generatedAt.toLocaleString()}`, 20, y)
      y += 20

      // Data Table
      if (data.data.length > 0) {
        doc.setFontSize(14)
        doc.text('Data Report', 20, y)
        y += 10

        doc.setFontSize(10)
        // Header
        doc.text('Name', 20, y)
        doc.text('Value', 80, y)
        doc.text('Type', 130, y)
        doc.text('Timestamp', 160, y)
        y += 7
        doc.line(20, y, 190, y)
        y += 10

        // Rows
        // Rows
        const maxRows = config.maxRows || 1000
        const displayedData = data.data.slice(0, maxRows)
        for (const item of displayedData) {
          if (y > 270) {
            doc.addPage()
            y = 20
          }
          doc.text(item.name.substring(0, 30), 20, y)
          doc.text(item.value.toString().substring(0, 20), 80, y)
          doc.text(item.type, 130, y)
          doc.text(item.timestamp.toISOString().split('T')[0], 160, y)
          y += 10
        }

        if (data.data.length > maxRows) {
          if (y > 270) {
            doc.addPage()
            y = 20
          }
          y += 5
          doc.setFontSize(9)
          doc.setTextColor(100, 100, 100)
          doc.text(`Showing ${maxRows} of ${data.data.length} records. Results truncated.`, 20, y)
          doc.setTextColor(0, 0, 0)
        }
      }

      const pdfBase64 = doc.output('datauristring').split(',')[1]
      
      return {
        format: 'pdf',
        filename: `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdfBase64,
        size: Math.round((pdfBase64.length * 3) / 4), // Approximate bytes
        mimeType: 'application/pdf',
        downloadUrl: `/api/analytics/export/download/${jobId}`
      }
    } catch (error) {
      logError('PDF Generation Error:', error)
      throw error
    }
  }

  /**
   * Export to Excel
   */
  private async exportToExcel(data: ProcessedData, config: ExportConfig, jobId: string): Promise<ExportResult> {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Analytics Data')

      // Add report header
      worksheet.addRow([data.title])
      worksheet.addRow([data.description])
      worksheet.addRow([`Generated: ${data.generatedAt.toLocaleString()}`])
      worksheet.addRow([])

      // Add column headers row
      const headerRow = worksheet.addRow(['Name', 'Value', 'Type', 'Timestamp', 'Metadata'])
      headerRow.font = { bold: true }
      
      // Set column widths
      worksheet.getColumn(1).width = 30
      worksheet.getColumn(2).width = 20
      worksheet.getColumn(3).width = 15
      worksheet.getColumn(4).width = 25
      worksheet.getColumn(5).width = 40

      // Add data rows
      data.data.forEach(item => {
        worksheet.addRow([
          item.name,
          item.value,
          item.type,
          item.timestamp.toISOString(),
          JSON.stringify(item.metadata || {})
        ])
      })

      // Add chart info sheet if charts included
      if (config.includeCharts && data.charts.length > 0) {
        const chartSheet = workbook.addWorksheet('Charts Info')
        chartSheet.columns = [
          { header: 'Chart Title', key: 'title', width: 30 },
          { header: 'Type', key: 'type', width: 20 },
          { header: 'Data Source', key: 'source', width: 30 }
        ]
        data.charts.forEach(chart => {
          chartSheet.addRow({
            title: chart.title,
            type: chart.type,
            source: chart.metadata.dataSource
          })
        })
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const excelBase64 = Buffer.from(buffer).toString('base64')
      
      return {
        format: 'excel',
        filename: `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`,
        content: excelBase64,
        size: buffer.byteLength,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        downloadUrl: `/api/analytics/export/download/${jobId}`
      }
    } catch (error) {
      logError('Excel Generation Error:', error)
      throw error
    }
  }

  /**
   * Generate CSV content
   */
  private generateCSVContent(data: ProcessedData): string {
    const headers = ['Name', 'Value', 'Type', 'Timestamp', 'Metadata']
    const rows = data.data.map(item => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.value.toString().replace(/"/g, '""')}"`,
      item.type,
      item.timestamp.toISOString(),
      `"${JSON.stringify(item.metadata || {}).replace(/"/g, '""')}"`
    ])
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
  }

  /**
   * Export to CSV
   */
  private async exportToCSV(data: ProcessedData, _config: ExportConfig, jobId: string): Promise<ExportResult> {
    const csvContent = this.generateCSVContent(data)
    
    return {
      format: 'csv',
      filename: `analytics-report-${new Date().toISOString().split('T')[0]}.csv`,
      content: csvContent,
      size: csvContent.length,
      mimeType: 'text/csv',
      downloadUrl: `/api/analytics/export/download/${jobId}`
    }
  }

  /**
   * Export to JSON
   */
  private async exportToJSON(data: ProcessedData, _config: ExportConfig, jobId: string): Promise<ExportResult> {
    const jsonContent = JSON.stringify(data, null, 2)
    
    return {
      format: 'json',
      filename: `analytics-report-${new Date().toISOString().split('T')[0]}.json`,
      content: jsonContent,
      size: jsonContent.length,
      mimeType: 'application/json',
      downloadUrl: `/api/analytics/export/download/${jobId}`
    }
  }



  /**
   * Update job status
   */
  private updateJobStatus(
    jobId: string,
    status: ExportJobStatus,
    error: string | null = null,
    progress: number = 0,
    result: ExportResult | null = null
  ): void {
    const job = this.exportQueue.get(jobId)
    if (!job) return

    job.status = status
    job.progress = progress
    job.error = error
    job.result = result

    if (status === 'processing' && !job.startedAt) {
      job.startedAt = new Date()
    }

    if (status === 'completed' || status === 'failed') {
      job.completedAt = new Date()
    }

    this.exportQueue.set(jobId, job)
    logInfo(`Export job ${jobId} status updated:`, { status, progress, error })
  }

  /**
   * Get export job status
   */
  getExportStatus(jobId: string): ExportJob | null {
    return this.exportQueue.get(jobId) || null
  }

  /**
   * Get user's export jobs
   */
  getUserExports(userId: string): ExportJob[] {
    return Array.from(this.exportQueue.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Cancel export job
   */
  cancelExport(jobId: string, userId: string): boolean {
    const job = this.exportQueue.get(jobId)
    if (!job || job.userId !== userId) return false

    if (job.status === 'pending' || job.status === 'processing') {
      this.updateJobStatus(jobId, 'cancelled')
      this.activeExports--
      return true
    }

    return false
  }
}

// Types for export system
interface ExportJob {
  id: string
  userId: string
  status: ExportJobStatus
  format: ExportFormat
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
  progress: number
  error: string | null
  result: ExportResult | null
}

type ExportJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

interface ExportResult {
  format: ExportFormat
  filename: string
  content: string // Base64 encoded for binary formats, plain text for CSV/JSON
  size: number
  mimeType: string
  downloadUrl: string
}

interface ProcessedData {
  title: string
  description: string
  generatedAt: Date
  generatedBy: string
  data: AnalyticsData[]
  charts: ChartData[]
  metadata: {
    totalRecords: number
    dateRange: { start: Date; end: Date }
    filters: Record<string, any>
    exportConfig: ExportConfig
  }
}

// Export singleton instance
export const analyticsExportService = AnalyticsExportService.getInstance()

