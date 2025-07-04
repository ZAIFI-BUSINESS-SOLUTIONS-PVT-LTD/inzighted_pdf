import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PdfService {
  constructor() {
    this.browser = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      logger.info('Initializing PDF service...');
      
      // Ensure temp directory exists
      if (!fs.existsSync(config.pdf.tempDir)) {
        fs.mkdirSync(config.pdf.tempDir, { recursive: true });
      }
      
      this.browser = await puppeteer.launch({
        headless: config.puppeteer.headless,
        args: config.puppeteer.args,
        executablePath: config.puppeteer.executablePath
      });
      
      this.isInitialized = true;
      logger.info('PDF service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize PDF service', { error: error.message });
      throw error;
    }
  }

  async generatePdf(studentId, testId) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    let page = null;
    
    try {
      logger.info('Starting PDF generation', { studentId, testId });
      
      page = await this.browser.newPage();
      
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 800 });
      
      // Build report URL
      const reportURL = `${config.pdf.baseUrl}/report?studentId=${encodeURIComponent(studentId)}&testId=${encodeURIComponent(testId)}`;
      logger.debug('Navigating to report URL', { url: reportURL });
      
      // Navigate to the page
      await page.goto(reportURL, {
        waitUntil: 'networkidle0',
        timeout: config.pdf.timeout
      });
      
      // Wait for React app to be ready
      logger.debug('Waiting for React app to be ready...');
      await page.waitForFunction(
        "window.__PDF_READY__ === true",
        {
          timeout: 15000,
          polling: 500
        }
      );
      
      // Generate PDF
      logger.debug('Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      // Save to temp file
      const filename = `inzighted_report_${studentId}_${testId}_${Date.now()}.pdf`;
      const filePath = path.join(config.pdf.tempDir, filename);
      
      fs.writeFileSync(filePath, pdfBuffer);
      
      const duration = Date.now() - startTime;
      logger.info('PDF generated successfully', {
        studentId,
        testId,
        duration: `${duration}ms`,
        filename,
        size: `${(pdfBuffer.length / 1024).toFixed(2)}KB`
      });
      
      return { filePath, filename, buffer: pdfBuffer };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('PDF generation failed', {
        studentId,
        testId,
        duration: `${duration}ms`,
        error: error.message
      });
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async cleanup(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return;
    
    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
        logger.debug('Temporary PDF file cleaned up', { filePath });
      } catch (error) {
        logger.warn('Could not clean up PDF file', { filePath, error: error.message });
      }
    }, config.pdf.cleanupDelay);
  }

  async shutdown() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      logger.info('PDF service shut down');
    }
  }
}

export default new PdfService();
