'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { GameState, Odai, ResultResponse } from '@/types';
import QuestionCard from '@/components/QuestionCard';
import ResultCard from '@/components/ResultCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScoreDisplay from '@/components/ScoreDisplay';
import IpponAnimation from '@/components/IpponAnimation';
import InstructionPage from '@/components/InstructionPage';
import AnswerFeedback from '@/components/AnswerFeedback';

export default function HomePage() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    sessionId: null,
    currentQuestionIndex: 0,
    answers: [],
    totalScore: 0,
    isCompleted: false,
  });

  const [odais, setOdais] = useState<Odai[]>([]);
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIpponAnimation, setShowIpponAnimation] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    choiceId: number;
    earnedPoint: number;
  } | null>(null);

  // テスト開始時の初期化
  const handleStartTest = () => {
    setShowInstructions(false);
    setIsLoading(true);
    initializeGame();
  };

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🎮 ゲーム初期化を開始します...');

      // まずヘルスチェックを実行
      console.log('🏥 API接続をテスト中...');
      try {
        const healthData = await apiClient.healthCheck();
        console.log('✅ API接続成功:', healthData);
      } catch (healthError) {
        console.error('❌ API接続失敗:', healthError);
        throw new Error(`API接続に失敗しました: ${healthError instanceof Error ? healthError.message : 'Unknown error'}`);
      }

      // デイリーチャレンジの問題を取得
      console.log('📝 デイリーチャレンジを取得中...');
      const challengeData = await apiClient.getDailyChallenge();
      console.log('✅ デイリーチャレンジ取得成功:', challengeData);
      
      if (!challengeData.odais || challengeData.odais.length === 0) {
        throw new Error('問題データが見つかりません。データベースが初期化されていない可能性があります。');
      }
      
      setOdais(challengeData.odais);

      // セッションを作成
      console.log('🔗 セッションを作成中...');
      const sessionData = await apiClient.createSession(navigator.userAgent);
      console.log('✅ セッション作成成功:', sessionData);
      
      setGameState(prev => ({
        ...prev,
        sessionId: sessionData.sessionId,
      }));

      console.log('🎉 ゲーム初期化完了！');

    } catch (err) {
      console.error('❌ ゲーム初期化失敗:', err);
      
      // エラーの詳細を判定
      let errorMessage = 'ゲームの初期化に失敗しました。';
      
      if (err instanceof Error) {
        if (err.message.includes('API接続に失敗しました')) {
          errorMessage = `サーバー接続エラー: ${err.message}`;
        } else if (err.message.includes('問題データが見つかりません')) {
          errorMessage = 'データベースが初期化されていません。管理者にお問い合わせください。';
        } else if (err.message.includes('fetch')) {
          errorMessage = 'サーバーに接続できません。ネットワーク接続を確認してください。';
        } else if (err.message.includes('No odais found')) {
          errorMessage = 'データベースに問題データがありません。データベースの初期化が必要です。';
        } else if (err.message.includes('HTML instead of JSON')) {
          errorMessage = 'APIエンドポイントが見つかりません。Netlify Functionsの設定を確認してください。';
        } else {
          errorMessage = `エラー詳細: ${err.message}`;
        }
      }
      
      setError(errorMessage);
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

      // 回答フィードバックを設定
      setLastAnswer({
        choiceId,
        earnedPoint: answerData.earnedPoint,
      });

      // 回答フィードバック表示
      setShowAnswerFeedback(true);

      // IPPON判定（10点の場合）
      const isIppon = answerData.earnedPoint === 10;
      
      if (isIppon) {
        // IPPONアニメーション表示（1秒後）
        setTimeout(() => {
          setShowIpponAnimation(true);
        }, 1000);
      }

      // 次の問題へ移行または結果表示（IPPONの場合は遅延を追加）
      const transitionDelay = isIppon ? 4000 : 2500; // フィードバック表示時間を考慮
      
      if (gameState.currentQuestionIndex < odais.length - 1) {
        // 次の問題へ
        setTimeout(() => {
          setShowAnswerFeedback(false);
          setLastAnswer(null);
          setGameState(prev => ({
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
          }));
        }, transitionDelay);
      } else {
        // 全問題完了 - 結果を取得
        setTimeout(async () => {
          try {
            setShowAnswerFeedback(false);
            setLastAnswer(null);
            const resultData = await apiClient.getSessionResult(gameState.sessionId!);
            // GameStateのanswersがない場合はAPIから取得したanswersを使用
            if (!resultData.answers) {
              resultData.answers = gameState.answers;
            }
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
    setShowAnswerFeedback(false);
    setLastAnswer(null);
    setIsLoading(true);
    initializeGame();
  };

  // インストラクションページに戻る
  const handleBackToInstructions = () => {
    setShowInstructions(true);
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
    setShowAnswerFeedback(false);
    setLastAnswer(null);
    setIsLoading(false);
  };

  // IPPONアニメーション完了
  const handleIpponAnimationComplete = () => {
    setShowIpponAnimation(false);
  };

  // インストラクションページ表示
  if (showInstructions) {
    return <InstructionPage onStart={handleStartTest} />;
  }

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
    return <ResultCard result={result} onRestart={handleRestart} onBackToInstructions={handleBackToInstructions} />;
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

      {/* 問題カード または 回答フィードバック */}
      {showAnswerFeedback && lastAnswer ? (
        <AnswerFeedback
          selectedChoice={currentOdai.choices.find(choice => choice.id === lastAnswer.choiceId)!}
          earnedPoint={lastAnswer.earnedPoint}
          questionNumber={gameState.currentQuestionIndex + 1}
          totalQuestions={odais.length}
        />
      ) : (
        <QuestionCard
          odai={currentOdai}
          questionNumber={gameState.currentQuestionIndex + 1}
          totalQuestions={odais.length}
          onAnswer={handleAnswer}
          isLoading={isSubmitting}
        />
      )}

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