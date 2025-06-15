'use client';

import React from 'react';
import { QuestionCardProps } from '@/types';

export default function QuestionCard({
  odai,
  questionNumber,
  totalQuestions,
  onAnswer,
  isLoading = false,
}: QuestionCardProps) {
  return (
    <div className="card animate-fade-in">
      {/* 問題ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
            問題 {questionNumber} / {totalQuestions}
          </div>
          <div className="text-gray-500 text-sm">
            🎭 IPPONグランプリ風
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-4 border-l-4 border-yellow-400">
          <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
            {odai.text}
          </h2>
        </div>

        <p className="text-sm text-gray-600 text-center">
          💭 最も面白い回答を選んでください
        </p>
      </div>

      {/* 選択肢 */}
      <div className="space-y-3">
        {odai.choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => onAnswer(choice.id)}
            disabled={isLoading}
            className={`choice-button ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center font-medium text-sm">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 font-medium leading-relaxed">
                  {choice.text}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    クリックして回答
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ローディング状態 */}
      {isLoading && (
        <div className="mt-6 flex items-center justify-center space-x-2 text-primary-600">
          <div className="loading-spinner w-5 h-5"></div>
          <span className="text-sm">回答を送信中...</span>
        </div>
      )}

      {/* IPPONグランプリ風のヒント */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-red-500">🔥</span>
            <span className="text-sm font-medium text-red-800">IPPONを狙え！</span>
          </div>
          <p className="text-xs text-red-700">
            最高得点のIPPON（10点）を狙って、一番笑える回答を選択しよう！
          </p>
        </div>
      </div>
    </div>
  );
} 