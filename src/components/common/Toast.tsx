import React from 'react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <div
      className={`toast ${toastMessage ? 'on' : ''}`}
      role="status"
      aria-live="polite"
    >
      {toastMessage}
    </div>
  );
};

export default Toast;
