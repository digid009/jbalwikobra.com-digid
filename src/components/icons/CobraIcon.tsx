import React from 'react';

interface CobraIconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/* Simplified stylized cobra head icon to match Lucide style */
const CobraIcon: React.FC<CobraIconProps> = ({ size = 22, className = '', strokeWidth = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Hood */}
    <path d="M5 9c0-4 3-7 7-7s7 3 7 7c0 2.2-.9 4.2-2.4 5.6-1 .9-1.6 2.1-1.6 3.4v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1c0-1.3-.6-2.5-1.6-3.4A7.8 7.8 0 0 1 5 9Z" />
    {/* Eyes */}
    <circle cx="10" cy="10" r="1" />
    <circle cx="14" cy="10" r="1" />
    {/* Fangs / tongue */}
    <path d="M12 12v3" />
    <path d="M10.5 15.5 12 17l1.5-1.5" />
  </svg>
);

export default CobraIcon;
