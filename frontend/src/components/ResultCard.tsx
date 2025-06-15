'use client';

import React from 'react';
import { ResultCardProps } from '@/types';

export default function ResultCard({ result, onRestart }: ResultCardProps) {
  // 偏差値に基づく評価を取得（IPPON風）
  const getScoreEvaluation = (zScore: number) => {
    if (zScore >= 70) return { emoji: '🏆', title: 'IPPON王', message: 'あなたは真のIPPON芸人です！', color: 'text-yellow-500' };
    if (zScore >= 60) return { emoji: '🔥', title: 'IPPON級', message: '素晴らしいセンスをお持ちです', color: 'text-red-500' };
    if (zScore >= 55) return { emoji: '👏', title: '座布団3枚', message: '良いセンスをお持ちです', color: 'text-purple-500' };
    if (zScore >= 45) return { emoji: '😊', title: '座布団1枚', message: '平均的なセンスです', color: 'text-blue-500' };
    if (zScore >= 35) return { emoji: '🤔', title: '頑張れ', message: 'まだまだ伸びしろがあります', color: 'text-orange-500' };
    return { emoji: '💪', title: '特訓あるのみ', message: '明日はきっと良い結果が出ます！', color: 'text-gray-500' };
  };

  const evaluation = getScoreEvaluation(result.zScore);

  // 偏差値バーの幅を計算
  const getBarWidth = (score: number) => {
    const minScore = 20;
    const maxScore = 80;
    const clampedScore = Math.max(minScore, Math.min(maxScore, score));
    return ((clampedScore - minScore) / (maxScore - minScore)) * 100;
  };

  return (
    <div className="space-y-6">
      {/* メイン結果カード */}
      <div className="card text-center animate-bounce-in">
        <div className="mb-6">
          <div className={`text-6xl mb-4 ${evaluation.color}`}>
            {evaluation.emoji}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎭 IPPON判定結果！
          </h2>
          <p className="text-gray-600">
            今日のIPPONチャレンジが完了しました
          </p>
        </div>

        {/* スコア表示 */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 合計スコア */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">合計スコア</p>
              <p className="score-display">{result.totalScore}</p>
              <p className="text-xs text-gray-500">ポイント</p>
            </div>

            {/* 偏差値 */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">笑の偏差値</p>
              <p className="z-score-display">{result.zScore}</p>
              <p className="text-xs text-gray-500">偏差値</p>
            </div>
          </div>
        </div>

        {/* 評価 */}
        <div className={`mb-6 ${evaluation.color}`}>
          <h3 className="text-xl font-bold mb-2">{evaluation.title}</h3>
          <p className="text-gray-700">{evaluation.message}</p>
        </div>

        {/* 偏差値バー */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>20</span>
            <span className="font-medium text-gray-700">あなたの偏差値: {result.zScore}</span>
            <span>80</span>
          </div>
          <div className="progress-bar h-4">
            <div 
              className="progress-fill h-full relative" 
              style={{ width: `${getBarWidth(result.zScore)}%` }}
            >
              <div className="absolute right-0 top-0 h-full w-1 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              全国平均: {result.mean}
            </span>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="btn-primary w-full"
          >
            🔄 もう一度チャレンジ
          </button>
          
          <div className="text-xs text-gray-500">
            明日の新しい問題をお楽しみに！
          </div>
        </div>
      </div>

      {/* 統計情報カード */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-center">📊 詳細統計</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-primary-600">{result.totalScore}</p>
            <p className="text-sm text-gray-600">獲得ポイント</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-secondary-600">{result.mean}</p>
            <p className="text-sm text-gray-600">全国平均</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">{result.stdDev}</p>
            <p className="text-sm text-gray-600">標準偏差</p>
          </div>
        </div>
      </div>

      {/* シェア促進カード */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 text-center">
        <h3 className="font-semibold mb-2">結果をシェアしよう！</h3>
        <p className="text-sm text-gray-600 mb-4">
          今日の笑の偏差値は <strong>{result.zScore}</strong> でした！
        </p>
        <div className="text-xs text-gray-500">
          #ユーモアテストアプリ #笑の偏差値 #デイリーチャレンジ
        </div>
      </div>
    </div>
  );
} 