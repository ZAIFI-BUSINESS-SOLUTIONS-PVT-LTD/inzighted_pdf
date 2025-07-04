# InzightEd PDF Service

A robust Node.js microservice for generating PDF reports from React components using Puppeteer.

## 🏗️ Project Structure

```
pdf_service/
├── src/
│   ├── config/           # Configuration management
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Main application entry
├── docker/              # Docker configuration
├── scripts/             # Development and deployment scripts
├── docs/               # Documentation
├── temp/               # Temporary PDF files
├── logs/               # Application logs
└── package.json        # Dependencies and scripts
```

## 🚀 Quick Start

### Development Mode

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   copy .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   # or use the batch file
   scripts\start-dev.bat
   ```

### Production Mode

1. **Install production dependencies:**
   ```bash
   npm ci --only=production
   ```

2. **Start production server:**
   ```bash
   npm start
   # or use the batch file
   scripts\start-prod.bat
   ```

## 🔧 Configuration

Environment variables can be set in `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment | `development` |
| `ALLOWED_ORIGINS` | CORS origins (comma-separated) | Local origins |
| `PDF_TIMEOUT` | PDF generation timeout (ms) | `30000` |
| `BASE_URL` | InzightEd frontend URL | `https://inzighted.com` |
| `LOG_LEVEL` | Logging level | `debug` (dev), `info` (prod) |

## 📋 API Endpoints

### Generate PDF
```
GET /generate-pdf?studentId=123&testId=Test%201
```

**Parameters:**
- `studentId` (required): Student identifier
- `testId` (required): Test identifier

**Response:** PDF file download

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-04T...",
  "environment": "development",
  "service": "InzightEd PDF Service",
  "version": "1.0.0"
}
```

## 🐳 Docker Deployment

### Development
```bash
npm run docker:dev
```

### Production
```bash
npm run docker:prod
```

## 🧪 Testing

```bash
npm test
```

## 📊 Monitoring

- **Logs:** Check `logs/app.log`
- **Health:** `GET /health`
- **Metrics:** Response times logged

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting
- Input validation
- CORS protection
- Non-root Docker user

## 🛠️ Development

### Adding New Features

1. Add configuration in `src/config/`
2. Create services in `src/services/`
3. Add controllers in `src/controllers/`
4. Update routes in `src/server.js`

### Best Practices

- Use structured logging
- Validate all inputs
- Handle errors gracefully
- Clean up temporary files
- Monitor performance

## 📚 Additional Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)
