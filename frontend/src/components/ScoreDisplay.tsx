'use client';

import React from 'react';
import { ScoreDisplayProps } from '@/types';

export default function ScoreDisplay({ 
  score,
  isAnimated = false
}: ScoreDisplayProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <span className="text-yellow-500">⭐</span>
        <span className="text-sm text-gray-600">スコア:</span>
      </div>
      <div 
        className={`
          text-2xl font-bold text-primary-600
          ${isAnimated ? 'animate-bounce-in' : ''}
        `}
      >
        {score}
      </div>
    </div>
  );
} 