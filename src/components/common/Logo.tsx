import React from 'react';

interface LogoProps {
  id?: string;
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({
  id = 'aerokit-logo',
  width = 32,
  className = '',
  style = {},
}) => {
  const height = width * 0.94;
  const a = 'M34 128 70 34Q80 10 90 34l36 94';

  return (
    <svg
      viewBox="0 0 160 150"
      width={width}
      height={height}
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="22"
          y1="14"
          x2="138"
          y2="136"
        >
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.4" stopColor="#d9ecee" />
          <stop offset="0.62" stopColor="#c6ff3d" />
          <stop offset="1" stopColor="#86d800" />
        </linearGradient>
        <linearGradient
          id={`${id}-h`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="10"
          x2="0"
          y2="130"
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask
          id={`${id}-m`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="160"
          height="150"
        >
          <path
            d={a}
            fill="none"
            stroke="#fff"
            strokeWidth="27"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M50 106Q82 76 120 104"
            fill="none"
            stroke="#000"
            strokeWidth="17"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <g mask={`url(#${id}-m)`}>
        <path
          d={a}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="27"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={a}
          transform="translate(-4.5 -1.5)"
          fill="none"
          stroke={`url(#${id}-h)`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path
        d="M52 106Q82 76 118 104"
        fill="none"
        stroke="#b6f52a"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Logo;
