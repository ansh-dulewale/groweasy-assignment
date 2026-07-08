'use client';

import { useCallback, useState, useRef } from 'react';
import styles from './UploadStep.module.css';

interface Props {
  onFileAccepted: (file: File) => void;
}

const ACCEPTED_TYPES = ['.csv', 'text/csv', 'application/vnd.ms-excel'];

export default function UploadStep({ onFileAccepted }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAccept = useCallback(
    async (file: File) => {
      setLocalError(null);
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setLocalError('Please upload a valid CSV file (.csv extension required).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setLocalError('File size exceeds 10 MB limit. Please use a smaller file.');
        return;
      }
      setIsLoading(true);
      try {
        await onFileAccepted(file);
      } finally {
        setIsLoading(false);
      }
    },
    [onFileAccepted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndAccept(file);
    },
    [validateAndAccept]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndAccept(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  return (
    <div className={`${styles.wrapper} animate-slide-up`}>
      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${isLoading ? styles.loading : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onKeyDown={(e) => e.key === 'Enter' && !isLoading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileInput}
          className={styles.hiddenInput}
          aria-hidden="true"
        />

        <div className={styles.dropContent}>
          {isLoading ? (
            <>
              <div className={styles.loadingIcon}>
                <div className={styles.spinRing} />
              </div>
              <p className={styles.mainText}>Parsing your CSV file…</p>
              <p className={styles.subText}>This will only take a moment</p>
            </>
          ) : (
            <>
              <div className={`${styles.uploadIcon} ${isDragging ? styles.iconBounce : ''}`}>
                <svg viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" />
                  <path d="M32 42V22M22 32l10-10 10 10" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 46h24" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <p className={styles.mainText}>
                {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
              </p>
              <p className={styles.subText}>or click to browse from your computer</p>
              <div className={styles.divider}>
                <span>supports</span>
              </div>
              <div className={styles.formatTags}>
                {['Facebook Leads', 'Google Ads', 'Excel exports', 'Any CSV format'].map((f) => (
                  <span key={f} className={styles.formatTag}>{f}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {localError && (
        <div className={styles.localError} role="alert">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="7" />
            <line x1="8" y1="5" x2="8" y2="8" />
            <circle cx="8" cy="11" r="0.5" fill="currentColor" />
          </svg>
          {localError}
        </div>
      )}

      {/* Info Cards */}
      <div className={styles.infoGrid}>
        {[
          {
            icon: '🧠',
            title: 'AI-Powered Mapping',
            desc: 'Gemini AI intelligently maps any column structure to CRM fields',
          },
          {
            icon: '⚡',
            title: 'Batch Processing',
            desc: 'Records are processed in batches for speed and reliability',
          },
          {
            icon: '🔒',
            title: 'Secure & Private',
            desc: 'Your data is processed in memory and never stored on disk',
          },
        ].map((card) => (
          <div key={card.title} className={styles.infoCard}>
            <span className={styles.infoIcon}>{card.icon}</span>
            <div>
              <h3 className={styles.infoTitle}>{card.title}</h3>
              <p className={styles.infoDesc}>{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
