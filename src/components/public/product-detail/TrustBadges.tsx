import React from 'react';
import { Shield, CheckCircle, Clock, MessageCircle } from 'lucide-react';

const TrustBadges: React.FC = () => (
  <div className="mt-8 grid grid-cols-2 gap-4">
    <div className="flex items-center space-x-2 text-sm text-white/60">
      <Shield className="text-green-500" size={16} />
      <span>Garansi 100%</span>
    </div>
    <div className="flex items-center space-x-2 text-sm text-white/60">
      <CheckCircle className="text-pink-400" size={16} />
      <span>Akun Terverifikasi</span>
    </div>
    <div className="flex items-center space-x-2 text-sm text-white/60">
      <Clock className="text-orange-500" size={16} />
      <span>Proses 24 Jam</span>
    </div>
    <div className="flex items-center space-x-2 text-sm text-white/60">
      <MessageCircle className="text-green-500" size={16} />
      <span>Support 24/7</span>
    </div>
  </div>
);

export default TrustBadges;
