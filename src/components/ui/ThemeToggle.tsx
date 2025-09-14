import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle - toggles :root.light class on documentElement.
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [light, setLight] = useState<boolean>(() => document.documentElement.classList.contains('light'));

  useEffect(() => {
    if (light) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [light]);

  return (
    <button
      type="button"
      aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
      onClick={() => setLight(l => !l)}
      className={`toggle ${light ? 'active' : ''} flex items-center justify-center ${className}`}
      style={{ width: 48, height: 28 }}
    >
      {light ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4 text-white" />}
    </button>
  );
};

export default ThemeToggle;
