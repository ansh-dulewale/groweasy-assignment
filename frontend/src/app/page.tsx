'use client';

import { useState, useCallback } from 'react';
import { AppStep, ExtractionResult, PreviewResult } from '@/types';
import { previewCSV, extractCRM } from '@/lib/api';
import UploadStep from './components/UploadStep';
import PreviewStep from './components/PreviewStep';
import ProcessingStep from './components/ProcessingStep';
import ResultsStep from './components/ResultsStep';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import styles from './page.module.css';

export default function Home() {
  const [step, setStep] = useState<AppStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [results, setResults] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1 → 2: Upload and preview
  const handleFileAccepted = useCallback(async (acceptedFile: File) => {
    setError(null);
    setFile(acceptedFile);
    try {
      const data = await previewCSV(acceptedFile);
      setPreview(data);
      setStep('preview');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to preview file.');
    }
  }, []);

  // Step 2 → 3 → 4: Confirm and extract
  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setError(null);
    setStep('processing');
    try {
      const data = await extractCRM(file);
      setResults(data);
      setStep('results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI extraction failed.');
      setStep('preview'); // go back to preview on error
    }
  }, [file]);

  // Reset the whole flow
  const handleReset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Header />
        <StepIndicator currentStep={step} />

        {error && (
          <div className={styles.errorBanner} role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">✕</button>
          </div>
        )}

        <div className={styles.content}>
          {step === 'upload' && (
            <UploadStep onFileAccepted={handleFileAccepted} />
          )}
          {step === 'preview' && preview && (
            <PreviewStep
              preview={preview}
              fileName={file?.name || ''}
              onConfirm={handleConfirm}
              onBack={handleReset}
            />
          )}
          {step === 'processing' && (
            <ProcessingStep totalRows={preview?.totalRows || 0} />
          )}
          {step === 'results' && results && (
            <ResultsStep results={results} onReset={handleReset} />
          )}
        </div>
      </div>
    </main>
  );
}
