import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
            <path d="M8 22L14 10L18 18L21 13L24 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <h1 className={styles.title}>
            <span className="gradient-text">GrowEasy</span> CRM Importer
          </h1>
          <p className={styles.subtitle}>AI-powered CSV to CRM data extraction</p>
        </div>
      </div>

      <div className={styles.badge}>
        <span className={styles.dot} />
        Powered by Gemini AI
      </div>
    </header>
  );
}
