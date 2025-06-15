import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';

// プラグインをインポート
import challengeRoutes from './routes/challenge';
import sessionRoutes from './routes/session';
import { authRoutes } from './routes/auth';

// Netlify Functions環境でのPrisma設定
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  ...(process.env.DATABASE_URL && {
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }),
});

// Fastifyインスタンスを作成
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

// Prismaクライアントをデコレート
fastify.decorate('prisma', prisma);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

// プラグインを登録
async function buildApp() {
  // データベース接続テスト
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Database connection failed: ${errorMessage}`);
  }

  // セキュリティヘッダー
  await fastify.register(helmet);

  // CORS設定
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.com'] 
      : true,
    credentials: true,
  });

  // Swagger設定
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Humor Challenge API',
        description: 'ユーモアテストアプリのAPI',
        version: '1.0.0',
      },
      host: 'localhost:3001',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });

  // ルートを登録
  await fastify.register(challengeRoutes, { prefix: '/api' });
  await fastify.register(sessionRoutes, { prefix: '/api' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });

  // ヘルスチェックエンドポイント
  fastify.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  return fastify;
}

// サーバー起動
async function start() {
  try {
    const app = await buildApp();
    
    const port = Number(process.env.PORT) || 3001;
    const host = process.env.HOST || 'localhost';
    
    await app.listen({ port, host });
    
    console.log(`🚀 Server ready at http://${host}:${port}`);
    console.log(`📚 API documentation at http://${host}:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// アプリケーション開始
if (require.main === module) {
  start();
}

export { buildApp }; 