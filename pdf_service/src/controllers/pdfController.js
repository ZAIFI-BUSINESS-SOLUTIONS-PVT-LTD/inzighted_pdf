import pdfService from '../services/pdfService.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

export const generatePdf = async (req, res) => {
  const { studentId, testId } = req.query;
  
  try {
    logger.info('PDF generation request received', { studentId, testId });
    
    const result = await pdfService.generatePdf(studentId, testId);
    
    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.buffer.length);
    
    // Send the PDF
    res.send(result.buffer);
    
    // Schedule cleanup if in production
    if (config.nodeEnv === 'production') {
      pdfService.cleanup(result.filePath);
    }
    
    logger.info('PDF sent successfully', { studentId, testId, filename: result.filename });
    
  } catch (error) {
    logger.error('PDF generation request failed', {
      studentId,
      testId,
      error: error.message
    });
    
    const isDevelopment = config.nodeEnv === 'development';
    
    res.status(500).json({
      error: 'PDF Generation Failed',
      message: 'Unable to generate PDF report',
      ...(isDevelopment && { details: error.message })
    });
  }
};

export const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    service: 'InzightEd PDF Service',
    version: process.env.npm_package_version || '1.0.0'
  });
};
