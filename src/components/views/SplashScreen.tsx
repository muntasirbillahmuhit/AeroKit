import React from 'react';
import { Logo } from '../common/Logo';
import { Icon } from '../common/Icon';
import { useApp } from '../../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { navigate } = useApp();

  return (
    <>
      <svg
        className="wave"
        viewBox="0 0 300 664"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wv-splash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c6ff3d" stopOpacity="0.85" />
            <stop offset="1" stopColor="#45D9E8" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M-10 120C40 80 90 20 170 0L110 0C60 20 10 70-10 120Z"
          fill="url(#wv-splash)"
        />
        <path
          d="M310 470C240 500 200 560 150 664L310 664Z"
          fill="url(#wv-splash)"
          opacity="0.5"
        />
        <path
          d="M300 40C260 70 250 120 300 170Z"
          fill="#c6ff3d"
          opacity="0.35"
        />
      </svg>

      <div className="body">
        <div className="sp-logo">
          <Logo width={140} id="sp-lg" />
        </div>
        <div className="sp-t">
          Aero<b>Kit</b>
        </div>
        <div className="sp-s">Smart Tools. Everyday.</div>

        <div className="feat">
          <div>
            <Icon name="bolt" size={22} color="var(--ac)" />
            <span>Fast &amp; Reliable</span>
          </div>
          <div>
            <Icon name="shield" size={22} color="var(--ac)" />
            <span>Secure &amp; Private</span>
          </div>
          <div>
            <Icon name="spark" size={22} color="var(--ac)" />
            <span>All-in-One Toolkit</span>
          </div>
        </div>
      </div>

      <button
        className="btn gs"
        onClick={() => navigate('home')}
        type="button"
      >
        <span>Get Started</span>
        <Icon name="arrow" size={17} />
      </button>
    </>
  );
};

export default SplashScreen;
