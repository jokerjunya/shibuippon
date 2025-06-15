'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnswerFeedbackProps {
  selectedChoice: {
    id: number;
    text: string;
    pointValue: number;
  };
  earnedPoint: number;
  questionNumber: number;
  totalQuestions: number;
}

export default function AnswerFeedback({
  selectedChoice,
  earnedPoint,
  questionNumber,
  totalQuestions,
}: AnswerFeedbackProps) {
  // 得点に基づく評価を取得
  const getScoreEvaluation = (points: number) => {
    if (points === 10) return {
      emoji: '🏆',
      title: 'IPPON！',
      message: '完璧な回答です！',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    };
    if (points >= 8) return {
      emoji: '🔥',
      title: '素晴らしい！',
      message: '高得点の回答です',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    };
    if (points >= 6) return {
      emoji: '👍',
      title: 'いいですね！',
      message: '良い回答です',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    };
    if (points >= 4) return {
      emoji: '😊',
      title: 'まずまず',
      message: '平均的な回答です',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
    return {
      emoji: '🤔',
      title: '惜しい！',
      message: '次回に期待です',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const evaluation = getScoreEvaluation(earnedPoint);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
    >
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
            問題 {questionNumber} / {totalQuestions}
          </div>
          <div className="text-gray-500 text-sm">
            回答完了
          </div>
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`text-6xl mb-2 ${evaluation.color}`}
        >
          {evaluation.emoji}
        </motion.div>
        
        <h2 className={`text-2xl font-bold mb-1 ${evaluation.color}`}>
          {evaluation.title}
        </h2>
        <p className="text-gray-600">{evaluation.message}</p>
      </div>

      {/* 選択した回答の表示 */}
      <div className={`${evaluation.bgColor} ${evaluation.borderColor} border rounded-lg p-4 mb-4`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-medium text-sm">
            ✓
          </div>
          <div className="flex-1">
            <p className="text-gray-900 font-medium leading-relaxed mb-2">
              {selectedChoice.text}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">あなたの選択</span>
              <div className="flex items-center space-x-2">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                  className={`text-lg font-bold ${evaluation.color}`}
                >
                  {earnedPoint}pt
                </motion.span>
                {earnedPoint === 10 && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium"
                  >
                    🏆 IPPON
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 次の問題への案内 */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <div className="loading-spinner w-4 h-4"></div>
          <span className="text-sm">
            {questionNumber < totalQuestions ? '次の問題を準備中...' : '結果を計算中...'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}