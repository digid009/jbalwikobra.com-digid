import React from 'react';

interface Props {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  delay?: number;
}

const MobileFeatureCard: React.FC<Props> = ({ icon: Icon, title, description, delay = 0 }) => (
  <div
    className="interactive-card rounded-2xl p-6 transition-all duration-300 group anim-fade-scale"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-14 h-14 bg-gradient-to-br from-pink-600 via-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200 border border-pink-500/30 shadow-inner">
      <Icon className="text-white" size={28} />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2 leading-tight tracking-wide">{title}</h3>
    <p className="text-tertiary text-sm leading-relaxed">{description}</p>
  </div>
);

export default React.memo(MobileFeatureCard);
