import { AppStep } from '@/types';
import styles from './StepIndicator.module.css';

const STEPS: { id: AppStep; label: string; icon: string }[] = [
  { id: 'upload', label: 'Upload', icon: '↑' },
  { id: 'preview', label: 'Preview', icon: '⊞' },
  { id: 'processing', label: 'Processing', icon: '✦' },
  { id: 'results', label: 'Results', icon: '✓' },
];

const STEP_ORDER: AppStep[] = ['upload', 'preview', 'processing', 'results'];

interface Props {
  currentStep: AppStep;
}

export default function StepIndicator({ currentStep }: Props) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <nav className={styles.nav} aria-label="Import steps">
      <ol className={styles.steps}>
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <li key={step.id} className={styles.stepItem}>
              {idx > 0 && (
                <div
                  className={`${styles.connector} ${isCompleted ? styles.connectorDone : ''}`}
                />
              )}
              <div
                className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className={styles.stepCircle}>
                  {isCompleted ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2,8 6,12 14,4" />
                    </svg>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
