const express = require('express');
const multer = require('multer');
const { parseCSV } = require('../services/csvParser');
const { extractCRMData } = require('../services/aiExtractor');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// ─── Multer Configuration ──────────────────────────────────────────────────────

// Store file in memory (no disk writes needed)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only CSV files by mimetype or extension
  const isCsv =
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.originalname.toLowerCase().endsWith('.csv');

  if (isCsv) {
    cb(null, true);
  } else {
    cb(Object.assign(new Error('Only CSV files are accepted.'), { statusCode: 400 }));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/upload-and-extract
 *
 * Accepts a CSV file upload, parses it, sends records through the Gemini AI
 * in batches, and returns the structured CRM extraction result.
 */
router.post(
  '/upload-and-extract',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please provide a CSV file with the field name "file".',
      });
    }

    // Step 1: Parse the CSV
    const { headers, records } = parseCSV(req.file.buffer);

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'The uploaded CSV file contains no records.',
      });
    }

    // Step 2: AI Extraction
    const { extracted, skipped, totalBatches } = await extractCRMData(records, headers);

    // Step 3: Return structured response
    res.json({
      success: true,
      summary: {
        totalInput: records.length,
        totalImported: extracted.length,
        totalSkipped: skipped.length,
        totalBatches,
      },
      extracted,
      skipped,
    });
  })
);

/**
 * POST /api/preview
 *
 * Accepts a CSV file and returns the raw parsed records for preview.
 * No AI processing is done here — matches Step 2 of the frontend flow.
 */
router.post(
  '/preview',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded.',
      });
    }

    const { headers, records } = parseCSV(req.file.buffer);

    res.json({
      success: true,
      headers,
      records,
      totalRows: records.length,
    });
  })
);

module.exports = router;
