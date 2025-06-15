'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface InstructionPageProps {
  onStart: () => void;
}

export default function InstructionPage({ onStart }: InstructionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            😄
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">ユーモアテストアプリ</h1>
          <p className="text-xl opacity-90">あなたの「笑の偏差値」を測定しよう！</p>
        </div>

        {/* メインコンテンツ */}
        <div className="p-8">
          {/* アプリの概要 */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              このアプリについて
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                このアプリは、テレビ番組「IPPONグランプリ」の実際の大喜利問題を使用して、
                あなたのユーモアセンスを統計的に測定するWebアプリケーションです。
              </p>
              <p className="text-gray-700 leading-relaxed">
                プロの芸人たちの回答から選択することで、あなたの笑いの感性を
                <strong className="text-primary-600">「笑の偏差値」</strong>として数値化します。
              </p>
            </div>
          </motion.section>

          {/* 遊び方 */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-3xl mr-3">🎮</span>
              遊び方
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</span>
                  <h3 className="font-semibold text-gray-800">問題を読む</h3>
                </div>
                <p className="text-gray-600">IPPONグランプリの実際の大喜利問題が出題されます</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</span>
                  <h3 className="font-semibold text-gray-800">回答を選択</h3>
                </div>
                <p className="text-gray-600">プロ芸人の回答から最も面白いと思うものを選択</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</span>
                  <h3 className="font-semibold text-gray-800">得点獲得</h3>
                </div>
                <p className="text-gray-600">選択した回答に応じて1〜10点の得点を獲得</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">4</span>
                  <h3 className="font-semibold text-gray-800">偏差値計算</h3>
                </div>
                <p className="text-gray-600">全ユーザーの成績と比較して「笑の偏差値」を算出</p>
              </div>
            </div>
          </motion.section>

          {/* 特徴 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-3xl mr-3">✨</span>
              アプリの特徴
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📺</div>
                <h3 className="font-semibold mb-2">本物のデータ</h3>
                <p className="text-sm text-gray-600">IPPONグランプリの実際の問題と芸人の回答を使用</p>
              </div>
              
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-semibold mb-2">統計的分析</h3>
                <p className="text-sm text-gray-600">偏差値による科学的なユーモア測定</p>
              </div>
              
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-semibold mb-2">特別演出</h3>
                <p className="text-sm text-gray-600">満点時のIPPONアニメーション</p>
              </div>
            </div>
          </motion.section>

          {/* 開発目的 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-3xl mr-3">💡</span>
              なぜ作ったのか
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                「笑い」は主観的なものですが、多くの人が共感する「面白さ」には一定のパターンがあります。
                このアプリは、プロの芸人の回答を基準として、あなたの笑いの感性を客観的に測定することを目的としています。
              </p>
              <p className="text-gray-700 leading-relaxed">
                また、IPPONグランプリの素晴らしい回答を再び楽しみながら、
                自分のユーモアセンスを向上させるきっかけになれば幸いです。
              </p>
            </div>
          </motion.section>

          {/* スタートボタン */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
            >
              <span className="mr-3">🚀</span>
              テストを開始する
            </button>
            <p className="text-gray-500 mt-4 text-sm">
              ※ アカウント登録すると成績が保存されます
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 