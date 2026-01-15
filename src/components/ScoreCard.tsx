import React from 'react';
import { motion } from 'framer-motion';

interface ScoreCardProps {
  score: Record<string, number> | null;
}

export default function ScoreCard({ score }: ScoreCardProps) {
  if (!score) return null;
  
  const getScoreColor = (value: number): string => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = (value: number): string => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div 
      className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-bold text-purple-400 mb-3">Score Multidimensionnel</h3>
      <div className="space-y-3">
        {Object.entries(score).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="capitalize text-gray-300">{key}</span>
              <span className={getScoreColor(value)}>{value}/100</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${getScoreBarColor(value)} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
