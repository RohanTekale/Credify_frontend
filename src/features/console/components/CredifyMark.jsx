// src/features/console/components/CredifyMark.jsx
// Inline SVG mark mirroring the generated credify-logo.png asset.
import React from 'react';

const CredifyMark = ({ size = 46 }) => {
  const gradId = `credify-g-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ verticalAlign: 'middle' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${gradId})`} />
      <g transform="rotate(-8 32 32)">
        <rect x="13" y="19" width="34" height="24" rx="4" fill="#fff" />
        <rect x="13" y="25" width="34" height="6" fill="#4f46e5" opacity=".85" />
        <rect x="18" y="35" width="9" height="4" rx="2" fill="#4f46e5" opacity=".85" />
      </g>
      <circle cx="45" cy="43" r="10.5" fill="#fff" />
      <path d="M40 43.2l3.4 3.4 6.4-7" stroke="#3b82f6" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default CredifyMark;
