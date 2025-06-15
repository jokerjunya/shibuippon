const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Prismaクライアントの初期化
let prisma;

const initPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      ...(process.env.DATABASE_URL && {
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      }),
    });
  }
  return prisma;
};

// CORS ヘッダー
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// エラーレスポンス
const errorResponse = (statusCode, message, details = null) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify({ 
    error: message,
    ...(details && { details })
  }),
});

// 成功レスポンス
const successResponse = (data, statusCode = 200) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(data),
});

// JWT認証ヘルパー
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const getUserFromToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
};

// ルートハンドラー
const handleRequest = async (event) => {
  const { httpMethod, path, queryStringParameters, body, headers } = event;
  
  // パス処理
  let apiPath = path;
  if (apiPath.includes('/.netlify/functions/api')) {
    apiPath = apiPath.replace('/.netlify/functions/api', '');
  }
  if (!apiPath || apiPath === '/') {
    apiPath = '/';
  }

  console.log('🔄 Processing request:', {
    method: httpMethod,
    path: apiPath,
    query: queryStringParameters
  });

  try {
    const db = initPrisma();
    
    // ルーティング
    if (apiPath === '/' && httpMethod === 'GET') {
      return successResponse({
        message: 'Netlify Functions API is working',
        timestamp: new Date().toISOString(),
        version: '2.0'
      });
    }

    if (apiPath === '/api/health' && httpMethod === 'GET') {
      // データベース接続テスト
      await db.$queryRaw`SELECT 1`;
      return successResponse({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    }

    if (apiPath === '/api/daily-challenge' && httpMethod === 'GET') {
      // 今日の日付を取得（JST）
      const today = new Date();
      const todayJST = new Date(today.getTime() + (9 * 60 * 60 * 1000));
      const todayString = todayJST.toISOString().split('T')[0];
      const seed = parseInt(todayString?.replace(/-/g, '') || '20240101', 10);
      
      // 全ての問題を取得
      const allOdais = await db.odai.findMany({
        include: {
          choices: true,
        },
      });

      if (allOdais.length === 0) {
        // データベースが空の場合、自動初期化
        console.log('⚠️ データベースが空です。自動初期化を実行します...');
        await initializeDatabase(db);
        
        // 再取得
        const retryOdais = await db.odai.findMany({
          include: {
            choices: true,
          },
        });
        
        if (retryOdais.length === 0) {
          return errorResponse(500, 'データベースの初期化に失敗しました');
        }
        
        return successResponse({ odais: retryOdais.slice(0, 5) });
      }

      // シード値を使って問題を選択
      const selectedOdais = [];
      for (let i = 0; i < 5 && i < allOdais.length; i++) {
        const index = (seed + i * 17) % allOdais.length;
        const selectedOdai = allOdais[index];
        if (selectedOdai && !selectedOdais.find(odai => odai.id === selectedOdai.id)) {
          selectedOdais.push(selectedOdai);
        }
      }

      return successResponse({ odais: selectedOdais });
    }

    if (apiPath === '/api/sessions' && httpMethod === 'POST') {
      const requestBody = body ? JSON.parse(body) : {};
      const user = getUserFromToken(headers.authorization);

      const session = await db.session.create({
        data: {
          userId: user?.userId || null,
          userAgent: requestBody.userAgent || headers['user-agent'] || null,
        },
      });

      return successResponse({ sessionId: session.id }, 201);
    }

    if (apiPath.match(/^\/api\/sessions\/(\d+)\/answers$/) && httpMethod === 'POST') {
      const sessionId = parseInt(apiPath.match(/^\/api\/sessions\/(\d+)\/answers$/)[1], 10);
      const requestBody = JSON.parse(body);
      const { choiceId } = requestBody;

      // セッションの存在確認
      const session = await db.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return errorResponse(404, 'Session not found');
      }

      // 選択肢の確認とポイント取得
      const choice = await db.choice.findUnique({
        where: { id: choiceId },
      });

      if (!choice) {
        return errorResponse(404, 'Choice not found');
      }

      // 回答を保存
      await db.userAnswer.create({
        data: {
          sessionId,
          choiceId,
          earnedPoint: choice.pointValue,
        },
      });

      // 現在の合計スコアを計算
      const totalScore = await db.userAnswer.aggregate({
        where: { sessionId },
        _sum: { earnedPoint: true },
      });

      return successResponse({
        earnedPoint: choice.pointValue,
        totalScore: totalScore._sum.earnedPoint || 0,
      });
    }

    if (apiPath.match(/^\/api\/sessions\/(\d+)\/result$/) && httpMethod === 'GET') {
      const sessionId = parseInt(apiPath.match(/^\/api\/sessions\/(\d+)\/result$/)[1], 10);

      // セッションの存在確認と回答データを取得
      const session = await db.session.findUnique({
        where: { id: sessionId },
        include: {
          answers: {
            include: {
              choice: {
                include: {
                  odai: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        return errorResponse(404, 'Session not found');
      }

      // このセッションの合計スコア
      const totalScore = session.answers.reduce((sum, answer) => sum + answer.earnedPoint, 0);

      // 全セッションのスコア統計を計算
      const allScores = await db.session.findMany({
        include: {
          answers: true,
        },
      });

      const scores = allScores.map(s => 
        s.answers.reduce((sum, answer) => sum + answer.earnedPoint, 0)
      );

      // 平均と標準偏差を計算
      const mean = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 50;

      const variance = scores.length > 1
        ? scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / (scores.length - 1)
        : 100;

      const stdDev = Math.sqrt(variance);

      // 偏差値を計算
      const zScore = stdDev > 0 
        ? ((totalScore - mean) / stdDev) * 10 + 50 
        : 50;

      // 回答データを整形
      const answers = session.answers.map(answer => ({
        odaiId: answer.choice.odai.id,
        choiceId: answer.choiceId,
        earnedPoint: answer.earnedPoint,
      }));

      return successResponse({
        totalScore,
        zScore: Math.round(zScore * 10) / 10,
        mean: Math.round(mean * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10,
        answers,
      });
    }

    // 404 - エンドポイントが見つからない
    return errorResponse(404, `Endpoint not found: ${httpMethod} ${apiPath}`);

  } catch (error) {
    console.error('❌ API Error:', error);
    return errorResponse(500, 'Internal server error', error.message);
  }
};

// データベース初期化関数
const initializeDatabase = async (db) => {
  console.log('🎭 データベース初期化を開始します...');

  // 既存のデータをクリア
  await db.userAnswer.deleteMany();
  await db.session.deleteMany();
  await db.choice.deleteMany();
  await db.odai.deleteMany();
  await db.episode.deleteMany();

  // IPPONグランプリ実データ
  const ipponData = [
    {
      title: "2017年 春の陣",
      odais: [
        {
          text: "「あ、この人絶対モテないな」と思った瞬間",
          choices: [
            { text: "デートで割り勘の時、1円単位まできっちり計算する", pointValue: 7 },
            { text: "自分の話ばかりして相手の話を全く聞かない", pointValue: 5 },
            { text: "店員さんに横柄な態度を取る", pointValue: 6 },
            { text: "スマホを見ながら「うん、うん」と適当に相槌を打つ", pointValue: 10 }
          ]
        }
      ]
    },
    {
      title: "2018年 夏の陣",
      odais: [
        {
          text: "こんな習字の授業は嫌だ",
          choices: [
            { text: "筆で書くのではなく、筆ペンで書く", pointValue: 4 },
            { text: "お手本が全部ギャル文字", pointValue: 8 },
            { text: "墨汁の代わりにイカスミを使う", pointValue: 6 },
            { text: "先生が「とめ、はね、はらい」を全部ラップで説明する", pointValue: 10 }
          ]
        }
      ]
    },
    {
      title: "2019年 秋の陣",
      odais: [
        {
          text: "絶対に売れないコンビニ弁当の名前",
          choices: [
            { text: "昨日の残り物弁当", pointValue: 6 },
            { text: "店長の気まぐれ弁当", pointValue: 5 },
            { text: "賞味期限ギリギリ弁当", pointValue: 7 },
            { text: "バイトが適当に作った弁当", pointValue: 10 }
          ]
        }
      ]
    },
    {
      title: "2020年 冬の陣",
      odais: [
        {
          text: "こんな運動会は嫌だ",
          choices: [
            { text: "全競技がeスポーツ", pointValue: 7 },
            { text: "応援席がソーシャルディスタンスで1人1人離れすぎている", pointValue: 8 },
            { text: "リレーのバトンがスマホ", pointValue: 6 },
            { text: "校長先生の挨拶がZoom越し", pointValue: 10 }
          ]
        }
      ]
    },
    {
      title: "2021年 春の陣",
      odais: [
        {
          text: "こんな宅配便は嫌だ",
          choices: [
            { text: "配達員が全員忍者の格好", pointValue: 6 },
            { text: "荷物を投げて渡される", pointValue: 5 },
            { text: "受け取りサインが血判", pointValue: 8 },
            { text: "「ピンポーン」の代わりに「ヤッホー」と叫ぶ", pointValue: 10 }
          ]
        }
      ]
    },
    {
      title: "2022年 夏の陣",
      odais: [
        {
          text: "絶対に流行らないSNS",
          choices: [
            { text: "投稿が全部俳句形式", pointValue: 7 },
            { text: "いいねボタンが「まあまあね」ボタン", pointValue: 8 },
            { text: "フォロワーではなく「ストーカー」と表示される", pointValue: 9 },
            { text: "投稿するたびに母親に通知が行く", pointValue: 10 }
          ]
        }
      ]
    },
    {
      title: "2023年 秋の陣",
      odais: [
        {
          text: "こんな美容院は嫌だ",
          choices: [
            { text: "カットしながら美容師が人生相談をしてくる", pointValue: 6 },
            { text: "シャンプーの時に頭皮マッサージが痛すぎる", pointValue: 5 },
            { text: "仕上がりを見せる鏡が歪んでいる", pointValue: 7 },
            { text: "「どんな髪型にしますか？」と聞かれて答えると「無理です」と即答される", pointValue: 10 }
          ]
        }
      ]
    },
    {
      title: "2024年 冬の陣",
      odais: [
        {
          text: "こんな忘年会は嫌だ",
          choices: [
            { text: "乾杯の音頭が毎回同じ人で、毎回5分以上話す", pointValue: 7 },
            { text: "カラオケで上司が演歌を熱唱し続ける", pointValue: 6 },
            { text: "ビンゴ大会の景品が全部上司の手作り", pointValue: 8 },
            { text: "二次会、三次会と続いて、気づいたら朝になっている", pointValue: 10 }
          ]
        }
      ]
    }
  ];

  // データを投入
  for (const episodeData of ipponData) {
    const episode = await db.episode.create({
      data: {
        title: episodeData.title,
        description: `IPPONグランプリ ${episodeData.title}`,
      },
    });

    for (const odaiData of episodeData.odais) {
      const odai = await db.odai.create({
        data: {
          text: odaiData.text,
          episodeId: episode.id,
        },
      });

      for (const choiceData of odaiData.choices) {
        await db.choice.create({
          data: {
            text: choiceData.text,
            pointValue: choiceData.pointValue,
            odaiId: odai.id,
          },
        });
      }
    }
  }

  console.log('✅ データベース初期化完了');
};

// メインハンドラー
exports.handler = async (event, context) => {
  console.log('🔍 Netlify Function called:', {
    method: event.httpMethod,
    path: event.path,
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  });

  // CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    return await handleRequest(event);
  } catch (error) {
    console.error('❌ Handler Error:', error);
    return errorResponse(500, 'Handler error', error.message);
  }
}; 