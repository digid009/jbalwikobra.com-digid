import React from 'react';
import { Clock } from 'lucide-react';

interface TimeRemaining { days: number; hours: number; minutes: number; seconds: number; isExpired?: boolean; }
interface Props { timeRemaining: TimeRemaining | null; }

const FlashSaleTimer: React.FC<Props> = ({ timeRemaining }) => {
  if (!timeRemaining || timeRemaining.isExpired) return null;
  return (
    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
      <div className="flex items-center space-x-2 text-red-300 font-semibold mb-2">
        <Clock size={20} />
        <span>Flash Sale berakhir dalam:</span>
      </div>
      <div className="flex space-x-3">
        {(['days','hours','minutes','seconds'] as const).map(k => (
          <div key={k} className="text-center">
            <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg font-mono tracking-wide shadow-sm">
              {timeRemaining[k].toString().padStart(2,'0')}
            </div>
            <span className="text-xs text-red-300 mt-1 block">{k === 'days' ? 'Hari' : k === 'hours' ? 'Jam' : k === 'minutes' ? 'Menit' : 'Detik'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSaleTimer;
