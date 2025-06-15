'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { GameState, Odai, ResultResponse } from '@/types';
import QuestionCard from '@/components/QuestionCard';
import ResultCard from '@/components/ResultCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScoreDisplay from '@/components/ScoreDisplay';
import IpponAnimation from '@/components/IpponAnimation';

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>({
    sessionId: null,
    currentQuestionIndex: 0,
    answers: [],
    totalScore: 0,
    isCompleted: false,
  });

  const [odais, setOdais] = useState<Odai[]>([]);
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIpponAnimation, setShowIpponAnimation] = useState(false);

  // 初期化：デイリーチャレンジの問題とセッションを取得
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // デイリーチャレンジの問題を取得
      const challengeData = await apiClient.getDailyChallenge();
      setOdais(challengeData.odais);

      // セッションを作成
      const sessionData = await apiClient.createSession(navigator.userAgent);
      setGameState(prev => ({
        ...prev,
        sessionId: sessionData.sessionId,
      }));

    } catch (err) {
      console.error('Game initialization failed:', err);
      setError('ゲームの初期化に失敗しました。ページを再読み込みしてください。');
    } finally {
      setIsLoading(false);
    }
  };

  // 回答を送信
  const handleAnswer = async (choiceId: number) => {
    if (!gameState.sessionId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // 回答を送信
      const answerData = await apiClient.submitAnswer(gameState.sessionId, choiceId);

      // 回答をゲーム状態に追加
      const newAnswer = {
        odaiId: odais[gameState.currentQuestionIndex].id,
        choiceId,
        earnedPoint: answerData.earnedPoint,
      };

      setGameState(prev => ({
        ...prev,
        answers: [...prev.answers, newAnswer],
        totalScore: answerData.totalScore,
      }));

      // IPPON判定（10点の場合）
      const isIppon = answerData.earnedPoint === 10;
      
      if (isIppon) {
        // IPPONアニメーション表示（200ms後）
        setTimeout(() => {
          setShowIpponAnimation(true);
        }, 200);
      }

      // 次の問題へ移行または結果表示（IPPONの場合は遅延を追加）
      const transitionDelay = isIppon ? 2700 : 1500; // IPPON演出時間を考慮
      
      if (gameState.currentQuestionIndex < odais.length - 1) {
        // 次の問題へ
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
          }));
        }, transitionDelay);
      } else {
        // 全問題完了 - 結果を取得
        setTimeout(async () => {
          try {
            const resultData = await apiClient.getSessionResult(gameState.sessionId!);
            setResult(resultData);
            setGameState(prev => ({
              ...prev,
              isCompleted: true,
            }));
          } catch (err) {
            console.error('Failed to get result:', err);
            setError('結果の取得に失敗しました。');
          }
        }, transitionDelay);
      }

    } catch (err) {
      console.error('Answer submission failed:', err);
      setError('回答の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ゲームを再開
  const handleRestart = () => {
    setGameState({
      sessionId: null,
      currentQuestionIndex: 0,
      answers: [],
      totalScore: 0,
      isCompleted: false,
    });
    setResult(null);
    setError(null);
    setShowIpponAnimation(false);
    initializeGame();
  };

  // IPPONアニメーション完了
  const handleIpponAnimationComplete = () => {
    setShowIpponAnimation(false);
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner />
        <p className="text-gray-600">今日の問題を準備中...</p>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="card text-center">
        <div className="text-red-500 mb-4">
          <span className="text-4xl block mb-2">⚠️</span>
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button
          onClick={handleRestart}
          className="btn-primary"
        >
          もう一度試す
        </button>
      </div>
    );
  }

  // 結果表示
  if (gameState.isCompleted && result) {
    return <ResultCard result={result} onRestart={handleRestart} />;
  }

  // 問題表示
  const currentOdai = odais[gameState.currentQuestionIndex];
  if (!currentOdai) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">問題が見つかりません。</p>
        <button onClick={handleRestart} className="btn-primary mt-4">
          リトライ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ゲーム進行状況 */}
              <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🎭 IPPONチャレンジ</h2>
          <ScoreDisplay score={gameState.totalScore} />
        </div>
        
        {/* プログレスバー */}
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${((gameState.currentQuestionIndex + 1) / odais.length) * 100}%` 
            }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>問題 {gameState.currentQuestionIndex + 1} / {odais.length}</span>
          <span>今日のチャレンジ</span>
        </div>
      </div>

      {/* 問題カード */}
      <QuestionCard
        odai={currentOdai}
        questionNumber={gameState.currentQuestionIndex + 1}
        totalQuestions={odais.length}
        onAnswer={handleAnswer}
        isLoading={isSubmitting}
      />

      {/* 今日のヒント */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-blue-500 text-xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">今日のヒント</h3>
            <p className="text-blue-800 text-sm">
              面白い回答ほど高得点！一番笑える選択肢を選んでみてください。
            </p>
          </div>
        </div>
      </div>

      {/* IPPONアニメーション */}
      <IpponAnimation 
        show={showIpponAnimation} 
        onComplete={handleIpponAnimationComplete} 
      />
    </div>
  );
} 