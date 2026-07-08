const { parse } = require('csv-parse/sync');

/**
 * Parses a CSV buffer into an array of record objects.
 * Handles various encodings, trims whitespace from headers and values,
 * and skips completely empty rows.
 *
 * @param {Buffer} buffer - The raw CSV file buffer from multer.
 * @returns {{ headers: string[], records: object[] }}
 */
const parseCSV = (buffer) => {
  const content = buffer.toString('utf-8');

  const records = parse(content, {
    columns: true,           // Use first row as column names
    skip_empty_lines: true,
    trim: true,              // Trim whitespace from values
    relax_column_count: true, // Handle rows with inconsistent column counts
    bom: true,               // Handle UTF-8 BOM (common in Excel exports)
  });

  if (!records || records.length === 0) {
    throw Object.assign(new Error('CSV file is empty or has no valid rows.'), { statusCode: 400 });
  }

  const headers = Object.keys(records[0]);

  return { headers, records };
};

module.exports = { parseCSV };
