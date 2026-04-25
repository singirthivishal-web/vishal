import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendValue, colorClass }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-surface border border-surfaceHighlight rounded-2xl p-6 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full`} />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-textMuted font-medium text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-textMain mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} bg-opacity-20`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 text-sm">
        {trend === 'up' ? (
          <span className="text-success font-medium bg-success/10 px-2 py-0.5 rounded-md">+{trendValue}</span>
        ) : trend === 'down' ? (
          <span className="text-danger font-medium bg-danger/10 px-2 py-0.5 rounded-md">-{trendValue}</span>
        ) : null}
        <span className="text-textMuted">{subtitle}</span>
      </div>
    </motion.div>
  );
}
