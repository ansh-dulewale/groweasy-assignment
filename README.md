# GrowEasy AI-Powered CSV Importer

An AI-powered CRM data importer that intelligently extracts lead information from **any CSV format** using Google Gemini AI.

## ✨ Features

- **Drag & Drop Upload** — Drop any CSV file or click to browse
- **Smart AI Mapping** — Gemini AI maps any column names to CRM fields
- **Live Preview** — See your raw CSV before processing (sticky headers, scroll)
- **Batch Processing** — Records processed in batches of 20 with retry logic
- **Progress Indicators** — Animated AI processing screen with real-time status
- **Results Dashboard** — Success/skipped counts, tabbed view, JSON download
- **Dark Mode** — Premium dark UI with glassmorphism and micro-animations
- **Error Handling** — Graceful errors on both frontend and backend

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, CSS Modules |
| Backend | Node.js, Express.js |
| AI | Google Gemini 1.5 Flash |
| File Upload | Multer (memory storage) |
| CSV Parsing | csv-parse |

## 📁 Project Structure

```
groweasy-assignment/
├── backend/
│   ├── src/
│   │   ├── routes/upload.js       # API endpoints
│   │   ├── services/
│   │   │   ├── csvParser.js       # CSV parsing logic
│   │   │   └── aiExtractor.js     # Gemini AI extraction + batching
│   │   └── middleware/
│   │       └── errorHandler.js    # Global error handler
│   ├── server.js                  # Express entry point
│   ├── .env                       # Backend environment (add your API key)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/        # All UI components
    │   │   ├── globals.css        # Design system
    │   │   ├── layout.tsx
    │   │   └── page.tsx           # Main app page
    │   ├── lib/api.ts             # Backend API calls
    │   └── types/index.ts         # TypeScript types
    ├── .env.local
    └── package.json
```

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd groweasy-assignment
```

### 2. Set up the Backend
```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

Edit `backend/.env`:
```
GEMINI_API_KEY=your_actual_gemini_api_key
PORT=5000
```

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

### 4. Open the app
Navigate to **http://localhost:3000** in your browser.

## 📤 API Endpoints

### `POST /api/preview`
Upload a CSV file for raw preview (no AI).

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{
  "success": true,
  "headers": ["Name", "Email", "Phone", "..."],
  "records": [...],
  "totalRows": 42
}
```

### `POST /api/upload-and-extract`
Upload a CSV file for AI-powered CRM extraction.

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalInput": 42,
    "totalImported": 38,
    "totalSkipped": 4,
    "totalBatches": 3
  },
  "extracted": [...CRMRecord[]],
  "skipped": [...{ reason, raw }]
}
```

### `GET /health`
Health check endpoint.

## 🧠 AI Extraction Rules

The Gemini AI follows these rules during extraction:

1. **Skip** records with neither email nor mobile number
2. **CRM Status** must be one of: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`
3. **Data Source** must be one of: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots`
4. **Multiple emails** → first is primary, rest go to `crm_note`
5. **Multiple phones** → first is primary, rest go to `crm_note`
6. **Dates** must be JavaScript `new Date()` parseable
7. **Batch size** is 20 records per AI call with up to 3 retries

## 📧 Submission

- **Position:** Software Developer Intern
- **Email:** varun@groweasy.ai
