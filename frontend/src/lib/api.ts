import {
  DailyChallengeResponse,
  Session,
  AnswerResponse,
  ResultResponse,
  ApiError,
} from '@/types';
import Cookies from 'js-cookie';

// 開発環境とモバイルアクセス対応
const getApiBaseUrl = () => {
  // 本番環境（Netlify）の場合
  if (process.env.NODE_ENV === 'production') {
    return '/.netlify/functions';
  }
  
  // 開発環境の場合
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // ブラウザ環境でlocalhost以外からアクセスしている場合（モバイルなど）
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:3001`;
  }
  
  // デフォルト（ローカル開発）
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // 認証トークンを取得
    const token = Cookies.get('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // デイリーチャレンジの問題を取得
  async getDailyChallenge(): Promise<DailyChallengeResponse> {
    return this.fetchApi<DailyChallengeResponse>('/api/daily-challenge');
  }

  // 新しいセッションを作成
  async createSession(userAgent?: string): Promise<Session> {
    return this.fetchApi<Session>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ userAgent }),
    });
  }

  // 回答を送信
  async submitAnswer(sessionId: number, choiceId: number): Promise<AnswerResponse> {
    return this.fetchApi<AnswerResponse>(`/api/sessions/${sessionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ choiceId }),
    });
  }

  // セッション結果を取得
  async getSessionResult(sessionId: number): Promise<ResultResponse> {
    return this.fetchApi<ResultResponse>(`/api/sessions/${sessionId}/result`);
  }

  // ヘルスチェック
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetchApi('/health');
  }
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient();

// SWR用のフェッチャー関数
export const fetcher = async (url: string) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }
  
  return response.json();
};

// カスタムフック用のキー生成関数
export const getApiKey = {
  dailyChallenge: () => '/api/daily-challenge',
  sessionResult: (sessionId: number) => `/api/sessions/${sessionId}/result`,
  health: () => '/health',
}; 