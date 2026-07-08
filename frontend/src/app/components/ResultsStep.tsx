'use client';

import { useState } from 'react';
import { CRMRecord, ExtractionResult, SkippedRecord } from '@/types';
import styles from './ResultsStep.module.css';

interface Props {
  results: ExtractionResult;
  onReset: () => void;
}

type ActiveTab = 'imported' | 'skipped';

const CRM_STATUS_META: Record<string, { label: string; cls: string }> = {
  GOOD_LEAD_FOLLOW_UP: { label: 'Follow Up', cls: 'badge-green' },
  DID_NOT_CONNECT: { label: 'No Connect', cls: 'badge-yellow' },
  BAD_LEAD: { label: 'Bad Lead', cls: 'badge-red' },
  SALE_DONE: { label: 'Sale Done', cls: 'badge-blue' },
};

const CRM_FIELDS: { key: keyof CRMRecord; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'country_code', label: 'Country Code' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'crm_status', label: 'Status' },
  { key: 'crm_note', label: 'Note' },
  { key: 'lead_owner', label: 'Owner' },
  { key: 'data_source', label: 'Source' },
  { key: 'created_at', label: 'Created At' },
  { key: 'possession_time', label: 'Possession' },
  { key: 'description', label: 'Description' },
];

function downloadJSON(data: object[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderCell(field: keyof CRMRecord, value: string | null) {
  if (field === 'crm_status' && value) {
    const meta = CRM_STATUS_META[value] || { label: value, cls: 'badge-purple' };
    return <span className={`badge ${meta.cls}`}>{meta.label}</span>;
  }
  if (!value) return <span className={styles.nullCell}>—</span>;
  return <span className={styles.cellText} title={value}>{value}</span>;
}

export default function ResultsStep({ results, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('imported');
  const { summary, extracted, skipped } = results;

  const successRate = summary.totalInput > 0
    ? Math.round((summary.totalImported / summary.totalInput) * 100)
    : 0;

  return (
    <div className={`${styles.wrapper} animate-slide-up`}>

      {/* ─── Success Banner ─── */}
      <div className={styles.successBanner}>
        <div className={styles.successIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="8,12 11,15 16,9" />
          </svg>
        </div>
        <div>
          <h2 className={styles.successTitle}>Import Complete!</h2>
          <p className={styles.successSub}>
            Gemini AI successfully processed your CSV in {summary.totalBatches} batch{summary.totalBatches !== 1 ? 'es' : ''}.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onReset} id="import-another-btn" style={{ marginLeft: 'auto' }}>
          Import Another
        </button>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <span className={styles.statNum}>{summary.totalInput.toLocaleString()}</span>
          <span className={styles.statLbl}>Total Input</span>
        </div>
        <div className={`${styles.statCard} ${styles.statImported}`}>
          <svg viewBox="0 0 20 20" fill="currentColor" className={styles.statIcon}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className={styles.statNum}>{summary.totalImported.toLocaleString()}</span>
          <span className={styles.statLbl}>Imported</span>
        </div>
        <div className={`${styles.statCard} ${styles.statSkipped}`}>
          <svg viewBox="0 0 20 20" fill="currentColor" className={styles.statIcon}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className={styles.statNum}>{summary.totalSkipped.toLocaleString()}</span>
          <span className={styles.statLbl}>Skipped</span>
        </div>
        <div className={`${styles.statCard} ${styles.statRate}`}>
          <span className={styles.statNum}>{successRate}%</span>
          <span className={styles.statLbl}>Success Rate</span>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className={styles.tabsArea}>
        <div className={styles.tabList} role="tablist">
          <button
            role="tab"
            id="tab-imported"
            aria-selected={activeTab === 'imported'}
            className={`${styles.tab} ${activeTab === 'imported' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('imported')}
          >
            <span className="badge badge-green">{summary.totalImported}</span>
            Imported Records
          </button>
          <button
            role="tab"
            id="tab-skipped"
            aria-selected={activeTab === 'skipped'}
            className={`${styles.tab} ${activeTab === 'skipped' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('skipped')}
          >
            <span className="badge badge-red">{summary.totalSkipped}</span>
            Skipped Records
          </button>
        </div>

        {/* Download button */}
        <button
          className="btn btn-secondary"
          id="download-btn"
          onClick={() => {
            if (activeTab === 'imported') {
              downloadJSON(extracted, 'crm_imported.json');
            } else {
              downloadJSON(skipped, 'crm_skipped.json');
            }
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M8 2v8M5 7l3 4 3-4M2 13h12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download JSON
        </button>
      </div>

      {/* ─── Imported Table ─── */}
      {activeTab === 'imported' && (
        <div className={styles.tableContainer} role="tabpanel" aria-labelledby="tab-imported">
          {extracted.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <p>No records were imported.</p>
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.table} aria-label="Imported CRM records">
                <thead>
                  <tr>
                    <th className={`${styles.th} ${styles.rowNum}`}>#</th>
                    {CRM_FIELDS.map((f) => (
                      <th key={f.key} className={styles.th}>{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {extracted.map((record, i) => (
                    <tr key={i} className={styles.tr}>
                      <td className={`${styles.td} ${styles.rowNum}`}>{i + 1}</td>
                      {CRM_FIELDS.map((f) => (
                        <td key={f.key} className={styles.td}>
                          {renderCell(f.key, record[f.key] as string | null)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Skipped Table ─── */}
      {activeTab === 'skipped' && (
        <div className={styles.tableContainer} role="tabpanel" aria-labelledby="tab-skipped">
          {skipped.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎉</span>
              <p>No records were skipped — all rows had valid contact info!</p>
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.table} aria-label="Skipped records">
                <thead>
                  <tr>
                    <th className={`${styles.th} ${styles.rowNum}`}>#</th>
                    <th className={styles.th}>Skip Reason</th>
                    {Object.keys(skipped[0]?.raw || {}).map((k) => (
                      <th key={k} className={styles.th}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skipped.map((item: SkippedRecord, i) => (
                    <tr key={i} className={`${styles.tr} ${styles.skippedRow}`}>
                      <td className={`${styles.td} ${styles.rowNum}`}>{i + 1}</td>
                      <td className={styles.td}>
                        <span className="badge badge-red">{item.reason}</span>
                      </td>
                      {Object.values(item.raw || {}).map((v, vi) => (
                        <td key={vi} className={styles.td}>
                          <span className={styles.cellText} title={String(v)}>{String(v) || '—'}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
