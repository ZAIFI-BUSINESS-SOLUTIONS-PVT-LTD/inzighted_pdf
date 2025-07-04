import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS Configuration
  cors: {
    origins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  // PDF Configuration
  pdf: {
    timeout: parseInt(process.env.PDF_TIMEOUT) || 30000,
    cleanupDelay: parseInt(process.env.CLEANUP_DELAY) || 5000,
    tempDir: process.env.TEMP_DIR || './temp',
    baseUrl: process.env.BASE_URL || 'https://inzighted.com'
  },
  
  // Browser Configuration
  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    args: process.env.CHROME_ARGS 
      ? process.env.CHROME_ARGS.split(',')
      : [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
    executablePath: process.env.CHROME_PATH || undefined
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    file: process.env.LOG_FILE || './logs/app.log'
  },
  
  // Security Configuration
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production' ? 100 : 1000 // limit each IP
    }
  }
};

export default config;
