import React, { useState, useEffect } from 'react';
import TurnstileWidget from './TurnstileWidget';

interface FirstVisitVerificationProps {
  children: React.ReactNode;
}

/**
 * First Visit Verification Component
 * Shows Turnstile verification on first visit to prevent bot traffic
 * Stores verification in localStorage to avoid repeated challenges
 */
const FirstVisitVerification: React.FC<FirstVisitVerificationProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if Turnstile is configured
  const turnstileSiteKey = process.env.REACT_APP_TURNSTILE_SITE_KEY;
  const isEnabled = !!turnstileSiteKey;

  useEffect(() => {
    // If Turnstile is not configured, skip verification
    if (!isEnabled) {
      setIsVerified(true);
      setIsLoading(false);
      return;
    }

    // Check if user has been verified before
    const verificationData = localStorage.getItem('turnstile_verification');
    if (verificationData) {
      try {
        const data = JSON.parse(verificationData);
        const expiryTime = new Date(data.expiresAt).getTime();
        const now = new Date().getTime();

        // Check if verification is still valid (24 hours)
        if (expiryTime > now) {
          setIsVerified(true);
          setIsLoading(false);
          return;
        } else {
          // Expired, remove old verification
          localStorage.removeItem('turnstile_verification');
        }
      } catch (error) {
        console.error('Error parsing verification data:', error);
        localStorage.removeItem('turnstile_verification');
      }
    }

    setIsLoading(false);
  }, [isEnabled]);

  const handleTurnstileSuccess = async (token: string) => {
    setIsVerifying(true);
    setVerificationError('');

    try {
      // Verify token with backend
      const response = await fetch('/api/auth?action=verify-first-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ turnstile_token: token }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setVerificationError(data.error || 'Verification failed. Please try again.');
        setIsVerifying(false);
        return;
      }

      // Store verification with expiry (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      localStorage.setItem('turnstile_verification', JSON.stringify({
        verified: true,
        verifiedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      }));

      setIsVerified(true);
      setIsVerifying(false);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError('Network error. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleTurnstileError = () => {
    setVerificationError('Verification failed. Please refresh the page.');
  };

  const handleTurnstileExpire = () => {
    setVerificationError('Verification expired. Please try again.');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Show verification screen if not verified
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-black border border-gray-700 rounded-2xl p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Verifikasi Keamanan
              </h1>
              <p className="text-white/70 text-sm">
                Mohon selesaikan verifikasi untuk melanjutkan ke website
              </p>
            </div>

            {/* Error Message */}
            {verificationError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm text-center">{verificationError}</p>
              </div>
            )}

            {/* Turnstile Widget */}
            <div className="mb-6">
              <TurnstileWidget
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
                onExpire={handleTurnstileExpire}
                className="flex justify-center"
              />
            </div>

            {/* Verifying State */}
            {isVerifying && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                <p className="text-white/70 text-sm">Memverifikasi...</p>
              </div>
            )}

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-white/50 text-xs text-center">
                Verifikasi ini membantu melindungi website dari bot dan traffic otomatis.
                Anda hanya perlu melakukan ini sekali dalam 24 jam.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is verified, show the app
  return <>{children}</>;
};

export default FirstVisitVerification;
