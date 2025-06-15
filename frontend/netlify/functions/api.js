const { buildApp } = require('../../../backend/src/app');

let app;

exports.handler = async (event, context) => {
  // Netlify Functions環境での設定
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  
  // デバッグ情報を詳細に出力
  console.log('🔍 Netlify Function called with:', {
    httpMethod: event.httpMethod,
    path: event.path,
    rawUrl: event.rawUrl,
    queryStringParameters: event.queryStringParameters,
    headers: Object.keys(event.headers || {}),
    bodyLength: event.body ? event.body.length : 0,
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  });

  // アプリケーションの初期化（初回のみ）
  if (!app) {
    try {
      console.log('🚀 Initializing Fastify app...');
      app = await buildApp();
      await app.ready();
      console.log('✅ Fastify app initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        body: JSON.stringify({ 
          error: 'Failed to initialize server',
          details: error.message 
        }),
      };
    }
  }

  // CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  // リクエストの変換
  const { httpMethod, path, queryStringParameters, body, headers } = event;
  
  // パス処理の改善
  let apiPath = path;
  
  // Netlify Functionsでは、パスが /.netlify/functions/api/... の形式で来る場合がある
  if (apiPath.includes('/.netlify/functions/api')) {
    apiPath = apiPath.replace('/.netlify/functions/api', '');
  }
  
  // /api プレフィックスを除去
  if (apiPath.startsWith('/api')) {
    apiPath = apiPath.replace(/^\/api/, '');
  }
  
  // 空のパスまたはルートパスの場合
  if (!apiPath || apiPath === '/') {
    apiPath = '/';
  }
  
  // パスが /api/ で始まる場合は、そのまま使用
  if (path.startsWith('/api/')) {
    apiPath = path;
  }
  
  console.log('🔄 Processing request:', {
    method: httpMethod,
    originalPath: path,
    processedPath: apiPath,
    query: queryStringParameters
  });
  
  try {
    const injectUrl = apiPath + (queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : '');
    console.log('📡 Injecting to Fastify:', {
      method: httpMethod,
      url: injectUrl,
      hasBody: !!body
    });

    // シンプルなテスト用レスポンス（ルートパスの場合）
    if (apiPath === '/' && httpMethod === 'GET') {
      console.log('🏠 Returning simple root response');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
        body: JSON.stringify({ 
          message: 'Netlify Functions API is working',
          timestamp: new Date().toISOString(),
          path: apiPath,
          originalPath: path
        }),
      };
    }

    const response = await app.inject({
      method: httpMethod,
      url: injectUrl,
      payload: body,
      headers: headers,
    });

    console.log('📨 Fastify response:', {
      statusCode: response.statusCode,
      contentType: response.headers['content-type'],
      bodyLength: response.payload ? response.payload.length : 0
    });

    return {
      statusCode: response.statusCode,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: response.payload,
    };
  } catch (error) {
    console.error('❌ API request failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
}; 