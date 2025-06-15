const { buildApp } = require('../../backend/src/app');

let app;

exports.handler = async (event, context) => {
  // アプリケーションの初期化（初回のみ）
  if (!app) {
    try {
      app = await buildApp();
      await app.ready();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  }

  // リクエストの変換
  const { httpMethod, path, queryStringParameters, body, headers } = event;
  
  try {
    const response = await app.inject({
      method: httpMethod,
      url: path + (queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''),
      payload: body,
      headers: headers,
    });

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.payload,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}; 