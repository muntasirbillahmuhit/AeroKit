import React from 'react';
import { Icon } from './Icon';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  showBack = true,
  rightAction,
}) => {
  const { navigateBack } = useApp();

  const handleBack = () => {
    if (onBack) onBack();
    else navigateBack();
  };

  return (
    <div className="hd">
      {showBack && (
        <button
          className="ib"
          onClick={handleBack}
          aria-label="Back"
          type="button"
          title="Back"
        >
          <Icon name="back" size={18} />
        </button>
      )}
      <span className="truncate">{title}</span>
      <span className="sp" />
      {rightAction}
    </div>
  );
};

export default Header;
