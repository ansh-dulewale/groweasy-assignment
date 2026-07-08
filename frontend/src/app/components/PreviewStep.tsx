'use client';

import { PreviewResult } from '@/types';
import styles from './PreviewStep.module.css';

interface Props {
  preview: PreviewResult;
  fileName: string;
  onConfirm: () => void;
  onBack: () => void;
}

export default function PreviewStep({ preview, fileName, onConfirm, onBack }: Props) {
  const { headers, records, totalRows } = preview;

  return (
    <div className={`${styles.wrapper} animate-slide-up`}>
      {/* Meta Bar */}
      <div className={styles.metaBar}>
        <div className={styles.fileInfo}>
          <div className={styles.fileIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div>
            <p className={styles.fileName}>{fileName}</p>
            <p className={styles.fileStats}>
              <span className="badge badge-purple">{totalRows.toLocaleString()} rows</span>
              <span className="badge badge-blue">{headers.length} columns</span>
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn btn-secondary" onClick={onBack} id="back-btn">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Change File
          </button>
          <button className="btn btn-primary" onClick={onConfirm} id="confirm-import-btn">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polygon points="5,3 14,8 5,13" fill="currentColor" />
            </svg>
            Confirm & Import
          </button>
        </div>
      </div>

      {/* Preview Section Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>CSV Preview</h2>
        <p className={styles.sectionSub}>
          Review your data below. Showing {Math.min(records.length, 100)} of {totalRows} rows.
          AI mapping will begin after confirmation.
        </p>
      </div>

      {/* Scrollable Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableScroll}>
          <table className={styles.table} role="grid" aria-label="CSV preview table">
            <thead>
              <tr>
                <th className={`${styles.th} ${styles.rowNum}`}>#</th>
                {headers.map((h) => (
                  <th key={h} className={styles.th} title={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 100).map((row, rIdx) => (
                <tr key={rIdx} className={styles.tr}>
                  <td className={`${styles.td} ${styles.rowNum}`}>{rIdx + 1}</td>
                  {headers.map((h) => (
                    <td key={h} className={styles.td} title={row[h] || ''}>
                      <span className={styles.cellContent}>
                        {row[h] || <span className={styles.empty}>—</span>}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalRows > 100 && (
        <p className={styles.truncNote}>
          Showing first 100 rows for preview. All {totalRows} rows will be processed during import.
        </p>
      )}

      {/* Bottom Action */}
      <div className={styles.bottomAction}>
        <div className={styles.aiNote}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 3a1 1 0 110 2 1 1 0 010-2zm0 4a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z" />
          </svg>
          <span>Gemini AI will intelligently map your columns to CRM fields and skip any rows missing both email and mobile.</span>
        </div>
        <button className="btn btn-primary" onClick={onConfirm} id="confirm-import-btn-bottom" style={{ minWidth: 180 }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <polygon points="5,3 14,8 5,13" fill="currentColor" />
          </svg>
          Confirm & Import
        </button>
      </div>
    </div>
  );
}
