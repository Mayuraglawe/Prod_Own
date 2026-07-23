import React from 'react';
import styles from './loading-spinner.module.css';

export function LoadingSpinner() {
  return (
    <div className={styles.scene}>
      <div className={styles.ring}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={styles.dotContainer}>
            <div className={styles.dot}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
