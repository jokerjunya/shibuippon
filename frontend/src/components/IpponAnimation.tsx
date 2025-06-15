'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface IpponAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export default function IpponAnimation({ show, onComplete }: IpponAnimationProps) {
  const [showFrames, setShowFrames] = useState(false);
  const [showIppon, setShowIppon] = useState(false);

  // Web Audio APIで効果音を生成
  const playIpponSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 明るい「パーン！」音を生成
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 高めの周波数で華やかな音
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      // 音量エンベロープ
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.type = 'triangle';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('効果音の再生に失敗しました:', error);
    }
  };

  // コンフェッティ演出
  const fireConfetti = () => {
    const count = 80;
    const defaults = {
      origin: { y: 0.6 },
      spread: 60,
      gravity: 0.8,
    };

    // 金色系のコンフェッティ
    confetti({
      ...defaults,
      particleCount: count * 0.6,
      colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520'],
    });

    // 少し遅延して追加のコンフェッティ
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: count * 0.4,
        colors: ['#FFFF00', '#FFE55C', '#FFC125'],
        angle: 60,
      });
    }, 100);

    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: count * 0.3,
        colors: ['#FFD700', '#FFDF00'],
        angle: 120,
      });
    }, 200);
  };

  useEffect(() => {
    if (show) {
      // フレーム演出開始
      setShowFrames(true);
      
      // 200ms後にIPPONテキスト表示
      const ipponTimer = setTimeout(() => {
        setShowIppon(true);
      }, 200);

      // 250ms後に効果音再生
      const soundTimer = setTimeout(() => {
        playIpponSound();
      }, 250);

      // 200ms後にコンフェッティ
      const confettiTimer = setTimeout(() => {
        fireConfetti();
      }, 200);

      // 1200ms後に演出完了
      const completeTimer = setTimeout(() => {
        setShowFrames(false);
        setShowIppon(false);
        onComplete();
      }, 1200);

      return () => {
        clearTimeout(ipponTimer);
        clearTimeout(soundTimer);
        clearTimeout(confettiTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 背景オーバーレイ */}
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* フレーム演出 */}
      <AnimatePresence>
        {showFrames && (
          <>
            {/* 上のバー */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-2 bg-red-600 shadow-lg"
              initial={{ scaleY: 0, transformOrigin: 'top' }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: 'easeOut',
                delay: 0 
              }}
            />
            
            {/* 下のバー */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-2 bg-red-600 shadow-lg"
              initial={{ scaleY: 0, transformOrigin: 'bottom' }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: 'easeOut',
                delay: 0.05 
              }}
            />
            
            {/* 左のバー */}
            <motion.div
              className="absolute top-0 bottom-0 left-0 w-2 bg-red-600 shadow-lg"
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: 'easeOut',
                delay: 0.1 
              }}
            />
            
            {/* 右のバー */}
            <motion.div
              className="absolute top-0 bottom-0 right-0 w-2 bg-red-600 shadow-lg"
              initial={{ scaleX: 0, transformOrigin: 'right' }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: 'easeOut',
                delay: 0.15 
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* IPPONテキスト */}
      <AnimatePresence>
        {showIppon && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1.0] }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.33, 1.13, 0.68, 1.03],
                times: [0, 0.4, 1]
              }}
            >
              <h1 
                className="text-8xl md:text-9xl font-black text-white select-none"
                style={{
                  textShadow: `
                    0 0 10px #FF0000,
                    0 0 20px #FF0000,
                    0 0 30px #FF0000,
                    0 0 40px #FF0000,
                    4px 4px 0px #CC0000,
                    8px 8px 0px #990000,
                    -2px -2px 0px #FF3333,
                    -4px -4px 0px #CC0000
                  `,
                  WebkitTextStroke: '3px #CC0000'
                }}
              >
                IPPON!
              </h1>
              
              {/* 金色の装飾 */}
              <motion.div
                className="flex justify-center items-center mt-4 space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                <span className="text-2xl text-yellow-400 font-bold">★</span>
                <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 追加のエフェクト - 光のフラッシュ */}
      <AnimatePresence>
        {showIppon && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.15,
              delay: 0.1,
              times: [0, 0.3, 1]
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 