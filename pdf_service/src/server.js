import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import logger from './utils/logger.js';
import { requestLogger, errorHandler, notFound } from './middleware/logging.js';
import { validatePdfRequest } from './middleware/validation.js';
import { generatePdf, healthCheck, generateBulkPdfZip, generateStudentSelfPdf, generateTeacherSelfPdf } from './controllers/pdfController.js';
import pdfService from './services/pdfService.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, mobile apps)
    if (!origin) return callback(null, true);
    if (config.cors.origins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: config.cors.credentials,
  optionsSuccessStatus: config.cors.optionsSuccessStatus
};
app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit(config.security.rateLimit);
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(requestLogger);

// Routes
app.get('/health', healthCheck);
app.get('/generate-pdf', validatePdfRequest, generatePdf);
app.post('/generate-bulk-pdf', generateBulkPdfZip);
app.get('/generate-student-pdf', generateStudentSelfPdf);
app.get('/generate-teacher-pdf', generateTeacherSelfPdf);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize PDF service and start server
const startServer = async () => {
  try {
    logger.info('Starting InzightEd PDF Service...');
    
    // Initialize PDF service
    await pdfService.initialize();
    
    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        environment: config.nodeEnv,
        port: config.port
      });
    });
    
    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      
      server.close(async () => {
        try {
          await pdfService.shutdown();
          logger.info('Server shut down complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error: error.message });
          process.exit(1);
        }
      });
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();
