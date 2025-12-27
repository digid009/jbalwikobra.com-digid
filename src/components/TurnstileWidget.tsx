import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

/**
 * Cloudflare Turnstile captcha widget component
 * Provides bot protection for forms
 */
const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onSuccess,
  onError,
  onExpire,
  className = ''
}) => {
  const siteKey = process.env.REACT_APP_TURNSTILE_SITE_KEY;

  // If site key is not configured, render nothing
  // This allows the app to work without Turnstile if needed
  if (!siteKey) {
    console.warn('Turnstile site key not configured. Captcha will not be displayed.');
    return null;
  }

  return (
    <div className={`turnstile-container ${className}`}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={() => {
          console.error('Turnstile verification failed');
          if (onError) onError();
        }}
        onExpire={() => {
          console.warn('Turnstile token expired');
          if (onExpire) onExpire();
        }}
        options={{
          theme: 'dark',
          size: 'normal',
        }}
      />
    </div>
  );
};

export default TurnstileWidget;
