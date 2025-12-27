import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining } from '../utils/helpers';
import { Clock } from 'lucide-react';

interface FlashSaleTimerProps {
  endTime: string;
  className?: string;
  compact?: boolean;
  variant?: 'card' | 'inline' | 'detail'; // Added 'detail' variant
}

const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({ 
  endTime, 
  className = '',
  compact = false,
  variant = 'inline'
}) => {
  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(endTime);
      setTimeRemaining(remaining);
      
      if (remaining.isExpired) {
        clearInterval(timer as any);
      }
    }, 1000);

    return () => clearInterval(timer as any);
  }, [endTime]);

  if (timeRemaining.isExpired) {
    if (variant === 'card') {
      return (
        <div className={`w-full flex items-center justify-center gap-1.5 text-pink-600 bg-white rounded-lg py-1.5 text-[10px] font-semibold tracking-wide ${className}`}>
          <Clock className="w-3 h-3" />
          <span>Berakhir</span>
        </div>
      );
    }
    
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black text-pink-400 text-xs font-semibold border border-pink-400/60 backdrop-blur-sm ${className}`}>
        <Clock size={12} className="text-pink-400" />
        <span>BERAKHIR</span>
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className={`flex space-x-3 ${className}`}>
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
            {timeRemaining.days.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-red-300 mt-1 block">Hari</span>
        </div>
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
            {timeRemaining.hours.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-red-300 mt-1 block">Jam</span>
        </div>
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
            {timeRemaining.minutes.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-red-300 mt-1 block">Menit</span>
        </div>
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
            {timeRemaining.seconds.toString().padStart(2, '0')}
          </div>
          <span className="text-xs text-red-300 mt-1 block">Detik</span>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`w-full flex items-center justify-center gap-1.5 text-pink-600 bg-white rounded-lg py-1.5 text-[10px] font-semibold tracking-wide ${className}`}>
        <Clock className="w-3 h-3" />
        <span className="truncate">
          {timeRemaining.days > 0 && `${timeRemaining.days}h `}
          {`${timeRemaining.hours.toString().padStart(2,'0')}:${timeRemaining.minutes.toString().padStart(2,'0')}:${timeRemaining.seconds.toString().padStart(2,'0')}`}
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black text-pink-400 text-xs font-bold border border-pink-400/60 backdrop-blur-sm shadow-lg ${className}`}>
        <Clock size={10} className="text-pink-400" />
        <span className="text-pink-400">
          {timeRemaining.days > 0 ? (
            `${timeRemaining.days}d ${timeRemaining.hours.toString().padStart(2, '0')}:${timeRemaining.minutes.toString().padStart(2, '0')}`
          ) : (
            `${timeRemaining.hours.toString().padStart(2, '0')}:${timeRemaining.minutes.toString().padStart(2, '0')}:${timeRemaining.seconds.toString().padStart(2, '0')}`
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-pink-400 border border-pink-400/60 backdrop-blur-sm shadow-lg ${className}`}>
      <Clock size={14} className="text-pink-400" />
      <div className="flex items-center gap-1 text-sm font-bold">
        {timeRemaining.days > 0 && (
          <>
            <span className="tabular-nums">{timeRemaining.days}</span>
            <span className="text-pink-300 text-xs">d</span>
          </>
        )}
        <span className="tabular-nums">{timeRemaining.hours.toString().padStart(2, '0')}</span>
        <span className="text-pink-300">:</span>
        <span className="tabular-nums">{timeRemaining.minutes.toString().padStart(2, '0')}</span>
        <span className="text-pink-300">:</span>
        <span className="tabular-nums">{timeRemaining.seconds.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default FlashSaleTimer;
