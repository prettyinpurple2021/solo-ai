import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as ExcelJS from 'exceljs';
import * as cheerio from 'cheerio';
import { parse } from 'node-html-parser';

export interface ParseResult {
  content: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    author?: string;
    title?: string;
    createdDate?: string;
    modifiedDate?: string;
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
      console.error('Document parsing error:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parsing error'
      };
    }
  }

  private static async parsePDF(buffer: Buffer): Promise<ParseResult> {
    try {
      const data = await pdf(buffer);
      
      const content = data.text.substring(0, this.MAX_CONTENT_LENGTH);
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          pageCount: data.numpages,
          wordCount,
          title: data.info?.Title,
          author: data.info?.Author,
          createdDate: data.info?.CreationDate,
          modifiedDate: data.info?.ModDate,
        },
        success: true
      };
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async parseWordDocx(buffer: Buffer): Promise<ParseResult> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      const content = result.value.substring(0, this.MAX_CONTENT_LENGTH);
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
        error: `Word document parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async parseExcel(buffer: Buffer, fileName: string): Promise<ParseResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      let allText = '';
      
      // Extract text from all worksheets
      workbook.eachSheet((worksheet, sheetId) => {
        allText += `Sheet: ${worksheet.name}\n`;
        
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          const rowValues: string[] = [];
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            // Get cell value as string, handling different types
            let cellValue = '';
            if (cell.value !== null && cell.value !== undefined) {
              if (typeof cell.value === 'object' && 'text' in cell.value) {
                // Rich text object
                cellValue = cell.value.text || '';
              } else if (typeof cell.value === 'object' && 'result' in cell.value) {
                // Formula result
                cellValue = String(cell.value.result || '');
              } else {
                // Simple value
                cellValue = String(cell.value);
              }
            }
            rowValues.push(cellValue);
          });
          allText += rowValues.join(',') + '\n';
        });
        
        allText += '\n';
      });
      
      const content = allText.substring(0, this.MAX_CONTENT_LENGTH);
      const wordCount = content.split(/\s+/).filter((word: string) => word.length > 0).length;
      
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
        error: `Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async parseHTML(buffer: Buffer): Promise<ParseResult> {
    try {
      const html = buffer.toString('utf-8');
      const $ = cheerio.load(html);
      
      // Remove script and style elements
      $('script, style').remove();
      
      // Extract text content
      const textContent = $.text();
      const content = textContent.replace(/\s+/g, ' ').trim().substring(0, this.MAX_CONTENT_LENGTH);
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      // Try to extract title
      const title = $('title').text() || $('h1').first().text();
      
      return {
        content,
        metadata: {
          wordCount,
          title: title || undefined,
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
      let text = rtfContent
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
