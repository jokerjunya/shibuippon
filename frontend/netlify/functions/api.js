const { buildApp } = require('../../../backend/src/app');

let app;

exports.handler = async (event, context) => {
  // アプリケーションの初期化（初回のみ）
  if (!app) {
    try {
      console.log('Initializing Fastify app...');
      app = await buildApp();
      await app.ready();
      console.log('Fastify app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
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
  
  // パスから /api を除去（Netlify Functions では不要）
  const apiPath = path.replace(/^\/api/, '') || '/';
  
  console.log('Processing request:', {
    method: httpMethod,
    originalPath: path,
    apiPath: apiPath,
    query: queryStringParameters
  });
  
  try {
    const response = await app.inject({
      method: httpMethod,
      url: apiPath + (queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''),
      payload: body,
      headers: headers,
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
    console.error('API request failed:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 