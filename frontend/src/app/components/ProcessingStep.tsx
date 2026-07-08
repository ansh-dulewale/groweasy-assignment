'use client';

import { useEffect, useState } from 'react';
import styles from './ProcessingStep.module.css';

interface Props {
  totalRows: number;
}

const PROCESSING_MESSAGES = [
  'Analyzing CSV structure and column headers…',
  'Mapping columns to CRM fields with Gemini AI…',
  'Extracting lead names, emails, and phone numbers…',
  'Normalizing dates and country codes…',
  'Inferring CRM status from disposition data…',
  'Aggregating notes and overflow data…',
  'Filtering records missing contact information…',
  'Validating extracted data quality…',
  'Finalizing your CRM records…',
];

export default function ProcessingStep({ totalRows }: Props) {
  const [messageIdx, setMessageIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIdx((i) => (i + 1) % PROCESSING_MESSAGES.length);
    }, 2800);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);

    return () => {
      clearInterval(msgInterval);
      clearInterval(dotInterval);
    };
  }, []);

  const estimatedBatches = Math.ceil(totalRows / 20);

  return (
    <div className={`${styles.wrapper} animate-fade-in`}>
      {/* Animated AI Brain */}
      <div className={styles.brainContainer}>
        <div className={styles.outerRing} />
        <div className={styles.middleRing} />
        <div className={styles.innerCircle}>
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M20 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM10 20c0-5.5 4.5-10 10-10s10 4.5 10 10c0 3.3-1.6 6.2-4 8v2a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2c-2.4-1.8-4-4.7-4-8z"
              stroke="#818cf8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3" fill="rgba(129,140,248,0.4)" />
          </svg>
        </div>

        {/* Orbiting dots */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={styles.orbitDot}
            style={{ '--orbit-delay': `${i * 0.5}s` } as React.CSSProperties}
          />
        ))}
      </div>

      <div className={styles.textArea}>
        <h2 className={styles.title}>AI Processing Your Data</h2>
        <p className={styles.message}>
          {PROCESSING_MESSAGES[messageIdx]}<span className={styles.dots}>{dots}</span>
        </p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{totalRows.toLocaleString()}</span>
          <span className={styles.statLabel}>Total rows</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{estimatedBatches}</span>
          <span className={styles.statLabel}>AI batch{estimatedBatches !== 1 ? 'es' : ''}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>20</span>
          <span className={styles.statLabel}>Records/batch</span>
        </div>
      </div>

      {/* Progress bar (indeterminate) */}
      <div className={styles.progressTrack}>
        <div className={styles.progressBar} />
      </div>

      <p className={styles.hint}>
        Processing time depends on CSV size. Please keep this tab open.
      </p>
    </div>
  );
}
