import { logError } from '@/lib/logger'
// @ts-ignore
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import ExcelJS from 'exceljs'


export interface ParseResult {
  content: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    author?: string;
    title?: string;
    createdDate?: string;
    modifiedDate?: string;
    sheetCount?: number;
    rowCount?: number;
    columnCount?: number;
    format?: string;
  };
  success: boolean;
  error?: string;
}

export class DocumentParser {
  private static readonly MAX_CONTENT_LENGTH = 50000; // Limit content to 50k chars for performance
  private static readonly SUPPORTED_MIME_TYPES = [
    // PDF
    'application/pdf',
    // Microsoft Word
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    // Microsoft Excel
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv',
    // PowerPoint
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
    // Text files
    'text/plain',
    'text/markdown',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'text/xml',
    'application/xml',
    // Rich text
    'application/rtf',
    'text/rtf',
  ];

  static isSupportedMimeType(mimeType: string): boolean {
    return this.SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase());
  }

  static async parseDocument(buffer: Buffer, mimeType: string, fileName: string): Promise<ParseResult> {
    try {
      const normalizedMimeType = mimeType.toLowerCase();

      // PDF Documents
      if (normalizedMimeType === 'application/pdf') {
        return await this.parsePDF(buffer);
      }

      // Microsoft Word Documents
      if (normalizedMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await this.parseWordDocx(buffer);
      }

      // Microsoft Excel Documents
      if (normalizedMimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        normalizedMimeType === 'application/vnd.ms-excel' ||
        normalizedMimeType === 'text/csv' ||
        fileName.toLowerCase().endsWith('.xlsx') ||
        fileName.toLowerCase().endsWith('.xls') ||
        fileName.toLowerCase().endsWith('.csv')) {
        return await this.parseExcel(buffer, fileName);
      }

      // Text-based files
      if (normalizedMimeType.startsWith('text/') ||
        normalizedMimeType === 'application/json' ||
        normalizedMimeType === 'application/javascript' ||
        normalizedMimeType === 'application/xml') {
        return await this.parseTextFile(buffer, normalizedMimeType);
      }

      // HTML files
      if (normalizedMimeType === 'text/html') {
        return await this.parseHTML(buffer);
      }

      // RTF files
      if (normalizedMimeType === 'application/rtf' || normalizedMimeType === 'text/rtf') {
        return await this.parseRTF(buffer);
      }

      return {
        content: '',
        success: false,
        error: `Unsupported file type: ${mimeType}`
      };

    } catch (error) {
      logError('Document parsing error:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  }

  private static async parsePDF(buffer: Buffer): Promise<ParseResult> {
    try {
      // @ts-ignore
      const parsed = await pdf(buffer)
      const content = parsed.text.substring(0, this.MAX_CONTENT_LENGTH).trim()
      const words = content.split(/\s+/).filter(Boolean).length

      return {
        content,
        metadata: {
          pageCount: parsed.numpages,
          wordCount: words,
          author: parsed.info?.Author,
          title: parsed.info?.Title,
          createdDate: parsed.info?.CreationDate,
          modifiedDate: parsed.info?.ModDate,
          format: 'pdf',
        },
        success: true,
      }
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  private static async parseWordDocx(buffer: Buffer): Promise<ParseResult> {
    try {
      const result = await mammoth.extractRawText({ buffer })
      const content = result.value.substring(0, this.MAX_CONTENT_LENGTH).trim()
      const wordCount = content.split(/\s+/).filter(Boolean).length

      return {
        content,
        metadata: {
          wordCount,
          format: 'docx',
        },
        success: true,
      }
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `Word document parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  private static async parseExcel(buffer: Buffer, fileName: string): Promise<ParseResult> {
    try {
      const lowerFile = fileName.toLowerCase()

      if (lowerFile.endsWith('.csv') || lowerFile.endsWith('.tsv')) {
        const text = buffer.toString('utf-8')
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
        const preview = lines.slice(0, 200)
        const content = preview.join('\n').substring(0, this.MAX_CONTENT_LENGTH)

        const columnCount = preview.reduce((max, line) => {
          const columns = line.split(lowerFile.endsWith('.tsv') ? '\t' : ',')
          return Math.max(max, columns.length)
        }, 0)

        return {
          content,
          metadata: {
            wordCount: content.split(/\s+/).filter(Boolean).length,
            sheetCount: 1,
            rowCount: preview.length,
            columnCount,
            format: lowerFile.endsWith('.tsv') ? 'tsv' : 'csv',
          },
          success: true,
        }
      }

      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(Buffer.from(buffer) as any)

      const rows: string[] = []
      let rowCount = 0
      let columnCount = 0

      workbook.worksheets.forEach((sheet) => {
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rows.length >= 1000) {
            return
          }

          const rawValues = Array.isArray(row.values)
            ? row.values
            : Object.values(row.values ?? {})

          const values = rawValues
            .slice(1)
            .map((value: unknown) =>
              typeof value === 'object' && value !== null
                ? JSON.stringify(value)
                : String(value ?? '').trim(),
            )
            .filter((value: string) => value.length > 0)
          if (values.length === 0) {
            return
          }

          rows.push(`${sheet.name} | Row ${rowNumber}: ${values.join(' | ')}`)
          rowCount += 1
          columnCount = Math.max(columnCount, values.length)
        })
      })

      const content = rows.join('\n').substring(0, this.MAX_CONTENT_LENGTH)

      return {
        content,
        metadata: {
          wordCount: content.split(/\s+/).filter(Boolean).length,
          sheetCount: workbook.worksheets.length,
          rowCount,
          columnCount,
          format: 'xlsx',
        },
        success: true,
      }
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `Spreadsheet parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  private static async parseHTML(buffer: Buffer): Promise<ParseResult> {
    try {
      const html = buffer.toString('utf-8');

      // Simple HTML text extraction without cheerio
      let content = html
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
        .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove styles
        .replace(/<[^>]*>/g, ' ') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .substring(0, this.MAX_CONTENT_LENGTH);

      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

      // Extract title with regex
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : undefined;

      return {
        content,
        metadata: {
          wordCount,
          title,
        },
        success: true
      };
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `HTML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async parseTextFile(buffer: Buffer, mimeType: string): Promise<ParseResult> {
    try {
      // Try different encodings
      let content = '';

      try {
        content = buffer.toString('utf-8');
      } catch {
        try {
          content = buffer.toString('latin1');
        } catch {
          content = buffer.toString('ascii');
        }
      }

      content = content.substring(0, this.MAX_CONTENT_LENGTH);
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

      return {
        content,
        metadata: {
          wordCount,
        },
        success: true
      };
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `Text file parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async parseRTF(buffer: Buffer): Promise<ParseResult> {
    try {
      const rtfContent = buffer.toString('utf-8');

      // Basic RTF text extraction (remove RTF control codes)
      const text = rtfContent
        .replace(/\{\\[^}]*\}/g, '') // Remove RTF groups
        .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
        .replace(/[{}]/g, '') // Remove remaining braces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      const content = text.substring(0, this.MAX_CONTENT_LENGTH);
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

      return {
        content,
        metadata: {
          wordCount,
        },
        success: true
      };
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `RTF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  static getEstimatedProcessingTime(fileSizeBytes: number, mimeType: string): number {
    // Estimate processing time in milliseconds based on file size and type
    const sizeMB = fileSizeBytes / (1024 * 1024);

    switch (mimeType.toLowerCase()) {
      case 'application/pdf':
        return Math.min(sizeMB * 2000, 30000); // 2 seconds per MB, max 30 seconds
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return Math.min(sizeMB * 1000, 15000); // 1 second per MB, max 15 seconds
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return Math.min(sizeMB * 1500, 20000); // 1.5 seconds per MB, max 20 seconds
      default:
        return Math.min(sizeMB * 500, 10000); // 0.5 seconds per MB, max 10 seconds
    }
  }
}

export default DocumentParser;
