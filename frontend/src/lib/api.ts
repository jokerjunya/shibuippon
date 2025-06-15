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

console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);

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

    console.log('📡 API Request:', {
      url,
      method: config.method || 'GET',
      hasAuth: !!token,
      hasBody: !!config.body
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📨 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        ok: response.ok
      });
      
      if (!response.ok) {
        // レスポンスがJSONかどうかチェック
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData: ApiError = await response.json();
          throw new Error(errorData.error || 'API request failed');
        } else {
          // HTMLレスポンスの場合
          const htmlText = await response.text();
          console.error('❌ Received HTML instead of JSON:', htmlText.substring(0, 200));
          throw new Error(`API returned HTML instead of JSON. Status: ${response.status} ${response.statusText}`);
        }
      }

      // レスポンスがJSONかどうかチェック
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('❌ Non-JSON response:', responseText.substring(0, 200));
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();
      console.log('✅ API Success:', { url, dataKeys: Object.keys(data) });
      return data;
    } catch (error) {
      console.error('❌ API request failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
    return this.fetchApi('/api/health');
  }

  // テスト用エンドポイント
  async testConnection(): Promise<{ message: string; timestamp: string }> {
    return this.fetchApi('/');
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
  health: () => '/api/health',
}; 