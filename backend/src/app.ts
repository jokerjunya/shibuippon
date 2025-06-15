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

const prisma = new PrismaClient();

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