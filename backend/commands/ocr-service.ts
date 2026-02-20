import * as fs from 'fs';
import * as path from 'path';
import { createWorker } from 'tesseract.js';
import nlp from 'compromise';

/**
 * OCR Service for extracting text from images using Tesseract.js
 */
export class OcrService {
  private static instance: OcrService;
  private worker: any = null;

  private constructor() {}

  static getInstance(): OcrService {
    if (!OcrService.instance) {
      OcrService.instance = new OcrService();
    }
    return OcrService.instance;
  }

  /**
   * Initialize the OCR worker
   */
  async initialize(): Promise<void> {
    if (!this.worker) {
      console.log('Initializing OCR worker...');
      this.worker = await createWorker('deu+eng'); // German + English
    }
  }

  /**
   * Perform OCR on an image file and return extracted text
   */
  async recognizeImage(imagePath: string): Promise<string> {
    try {
      if (!this.worker) {
        await this.initialize();
      }

      console.log(`Running OCR on: ${imagePath}`);
      const {
        data: { text },
      } = await this.worker.recognize(imagePath);
      return text;
    } catch (error: any) {
      console.error(`OCR error for ${imagePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Perform OCR on all images and return combined text
   */
  async recognizeImages(imagePaths: string[]): Promise<string> {
    try {
      if (!this.worker) {
        await this.initialize();
      }

      const allTexts: string[] = [];

      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        console.log(
          `[OCR] Processing image ${i + 1}/${imagePaths.length}: ${path.basename(imagePath)}`,
        );
        console.log(`[OCR] Starting text recognition...`);

        const {
          data: { text },
        } = await this.worker.recognize(imagePath);

        console.log(
          `[OCR] Extracted ${text.length} characters from page ${i + 1}`,
        );
        allTexts.push(text);
      }

      console.log(
        `[OCR] Text extraction complete. Total length: ${allTexts.join('').length} chars`,
      );
      return allTexts.join('\n---PAGE BREAK---\n');
    } catch (error: any) {
      console.error('OCR error:', error.message);
      throw error;
    }
  }

  /**
   * Save extracted text to a file
   */
  async saveTextToFile(
    imagePaths: string[],
    outputPdfPath: string,
  ): Promise<string> {
    const extractedText = await this.recognizeImages(imagePaths);
    const textFilePath = outputPdfPath.replace(/\.pdf$/i, '.txt');

    console.log(`Saving OCR text to: ${textFilePath}`);
    fs.writeFileSync(textFilePath, extractedText, 'utf-8');

    // Analyze the extracted text
    console.log('[OCR Analysis] Starting text analysis...');
    const analysis = this.analyzeText(extractedText);

    console.log('\n=== OCR TEXT ANALYSIS RESULTS ===');
    console.log(`Sender: ${analysis.sender}`);
    console.log(
      `People detected: ${analysis.people?.length > 0 ? analysis.people.join(', ') : 'None'}`,
    );
    console.log(
      `Organizations detected: ${analysis.organizations?.length > 0 ? analysis.organizations.join(', ') : 'None'}`,
    );
    console.log(
      `Locations detected: ${analysis.places?.length > 0 ? analysis.places.join(', ') : 'None'}`,
    );
    console.log(
      `Dates found: ${analysis.dates?.length > 0 ? analysis.dates.join(', ') : 'None'}`,
    );
    console.log(
      `Websites: ${analysis.websites?.length > 0 ? analysis.websites.join(', ') : 'None'}`,
    );
    console.log(
      `Email addresses: ${analysis.emails?.length > 0 ? analysis.emails.join(', ') : 'None'}`,
    );
    console.log(
      `Domains found: ${analysis.domains?.length > 0 ? analysis.domains.join(', ') : 'None'}`,
    );
    console.log(`Subject: ${analysis.subject}`);
    console.log(`Keywords: ${analysis.keywords?.join(', ')}`);
    console.log('\n--- Text Statistics ---');
    console.log(`Total characters: ${analysis.statistics?.totalCharacters}`);
    console.log(`Total lines: ${analysis.statistics?.totalLines}`);
    console.log(`Total sentences: ${analysis.statistics?.totalSentences}`);
    console.log(
      `Average line length: ${analysis.statistics?.averageLineLength} chars`,
    );
    console.log('================================\n');

    return textFilePath;
  }

  /**
   * Extract dates from text in various formats
   */
  private extractDates(text: string): string[] {
    const dates: string[] = [];

    // German date format: DD.MM.YYYY or DD.MM.YY
    const germanDatePattern = /\b(\d{1,2})[.\s]+(\d{1,2})[.\s]+(\d{2,4})\b/g;
    let match;
    while ((match = germanDatePattern.exec(text)) !== null) {
      dates.push(match[0]);
    }

    // ISO format: YYYY-MM-DD
    const isoDatePattern = /\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/g;
    while ((isoDatePattern.lastIndex = 0), (match = isoDatePattern.exec(text)) !== null) {
      const dateStr = match[0];
      if (!dates.includes(dateStr)) {
        dates.push(dateStr);
      }
    }

    // English/US format: MM/DD/YYYY or M/D/YY
    const usDatePattern = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/g;
    while ((usDatePattern.lastIndex = 0), (match = usDatePattern.exec(text)) !== null) {
      const dateStr = match[0];
      if (!dates.includes(dateStr)) {
        dates.push(dateStr);
      }
    }

    // German month names: January - Dezember
    const monthNames = [
      'januar|february|märz|april|mai|juni|juli|august|september|oktober|november|dezember',
      'jan|feb|mär|apr|mai|jun|jul|aug|sep|okt|nov|dez',
      'january|february|march|april|may|june|july|august|september|october|november|december',
      'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec',
    ].join('|');
    const monthDatePattern = new RegExp(
      `\\b(\\d{1,2})\\s+(${monthNames})\\s+(\\d{4}|\\d{2})\\b`,
      'gi',
    );
    while ((match = monthDatePattern.exec(text)) !== null) {
      const dateStr = match[0];
      if (!dates.includes(dateStr)) {
        dates.push(dateStr);
      }
    }

    // Remove duplicates and return unique dates
    return Array.from(new Set(dates));
  }

  /**
   * Extract URLs, websites, and email domains from text
   */
  private extractWebsitesAndEmails(text: string): { websites: string[]; emails: string[]; domains: string[] } {
    const websites: string[] = [];
    const emails: string[] = [];
    const domains = new Set<string>();

    // Extract URLs with http(s) protocol
    const urlPattern = /https?:\/\/[^\s]+/gi;
    let match;
    while ((match = urlPattern.exec(text)) !== null) {
      let url = match[0].replace(/[.,;:!?)]+$/, ''); // Remove trailing punctuation
      if (!websites.includes(url)) {
        websites.push(url);
        // Extract domain from URL
        try {
          let domain = new URL(url).hostname;
          if (domain) {
            domain = domain.split('/')[0]; // Remove any path components
            domains.add(domain);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }

    // Extract www. addresses
    const wwwPattern = /www\.[^\s,;:!?()[\]{}]+/gi;
    while ((match = wwwPattern.exec(text)) !== null) {
      let url = match[0].replace(/[.,;:!?)]+$/, ''); // Remove trailing punctuation
      // Remove path from www address
      const pathIndex = url.indexOf('/');
      if (pathIndex > 0) {
        url = url.substring(0, pathIndex);
      }
      if (!websites.includes(url)) {
        websites.push(url);
        // Extract domain without www.
        let domain = url.replace(/^www\./, '').replace(/^https?:\/\//, '');
        // Remove any remaining path
        const domainPathIndex = domain.indexOf('/');
        if (domainPathIndex > 0) {
          domain = domain.substring(0, domainPathIndex);
        }
        if (domain) domains.add(domain);
      }
    }

    // Extract email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    while ((match = emailPattern.exec(text)) !== null) {
      const email = match[0].toLowerCase();
      if (!emails.includes(email)) {
        emails.push(email);
        // Extract domain from email and remove any trailing slashes/paths
        let domain = email.split('@')[1];
        if (domain) {
          domain = domain.split('/')[0]; // Remove path if present
          domains.add(domain);
        }
      }
    }

    return {
      websites: websites,
      emails: emails,
      domains: Array.from(domains),
    };
  }

  /**
   * Analyze extracted text for sender and other information
   */
  private analyzeText(text: string): any {
    try {
      // Basic sender extraction using regex patterns (with German umlaut support)
      const senderPatterns = [
        /(?:from|sender|von|absender|von:|sender:)\s*[:\s]*([^\n]+)/gi,
        /^([\wäöüßÄÖÜ\s.,\-']+)\s*$/m, // Name at beginning with umlaut support
        /^([A-Z][\wäöüßÄÖÜ]+\s+[A-Z][\wäöüßÄÖÜ]+)/m, // Multi-word names with umlauts
      ];

      let sender = 'Unknown';
      for (const pattern of senderPatterns) {
        const match = text.match(pattern);
        if (match) {
          let extracted = match[1]?.trim() || 'Unknown';
          // Clean up the extracted sender
          extracted = extracted
            .split('\n')[0]
            .substring(0, 100)
            .trim();
          if (extracted.length > 2) {
            sender = extracted;
            break;
          }
        }
      }

      // Use compromise for NLP analysis
      const doc = nlp(text);

      // Extract entities (compromise handles basic entity extraction)
      const people = doc
        .people()
        .out('array')
        .filter((p: string) => p.length > 2);
      const organizations = doc
        .organizations()
        .out('array')
        .filter((o: string) => o.length > 2);
      const places = doc
        .places()
        .out('array')
        .filter((p: string) => p.length > 2);

      // Get word frequency - extract meaningful terms
      const allWords = text
        .toLowerCase()
        .split(/[\s\n.,;:!?()[\]{}"'\-]+/)
        .filter(
          (word) =>
            word.length > 3 && 
            !['that', 'this', 'with', 'from', 'have', 'been'].includes(word),
        );

      // Extract dates from text
      const dates = this.extractDates(text);

      // Extract websites, emails, and domains
      const webData = this.extractWebsitesAndEmails(text);

      // Count word frequency
      const wordFreqMap = new Map<string, number>();
      allWords.forEach((word) => {
        wordFreqMap.set(word, (wordFreqMap.get(word) || 0) + 1);
      });

      // Get top 10 most frequent words
      const wordFreq = Array.from(wordFreqMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

      // Calculate text statistics
      const sentences = doc.sentences().length;
      const characterCount = text.length;
      const lineCount = text.split('\n').length;

      // Extract subject line (usually first meaningful line with minimum length)
      const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 5);
      const subject = lines.length > 0 
        ? lines[0].substring(0, 100) 
        : 'N/A';

      return {
        sender: sender,
        people: people.length > 0 ? people : [],
        organizations: organizations.length > 0 ? organizations : [],
        places: places.length > 0 ? places : [],
        dates: dates.length > 0 ? dates : [],
        websites: webData.websites.length > 0 ? webData.websites : [],
        emails: webData.emails.length > 0 ? webData.emails : [],
        domains: webData.domains.length > 0 ? webData.domains : [],
        keywords: wordFreq,
        statistics: {
          totalCharacters: characterCount,
          totalLines: lineCount,
          totalSentences: sentences,
          averageLineLength:
            characterCount > 0
              ? Math.round(characterCount / lineCount)
              : 0,
        },
        subject: subject,
      };
    } catch (error: any) {
      console.error('[OCR Analysis] Error during text analysis:', error.message);
      return {
        sender: 'Unknown',
        error: error.message,
      };
    }
  }

  /**
   * Cleanup the OCR worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      console.log('Terminating OCR worker...');
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

// Lazy singleton export
let instance: OcrService | null = null;

export function getOcrService(): OcrService {
  if (!instance) {
    instance = OcrService.getInstance();
  }
  return instance;
}
