import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// リクエストスキーマの定義
const createSessionSchema = z.object({
  userAgent: z.string().optional(),
});

// ユーザー認証ヘルパー関数
function getUserFromToken(authHeader?: string): { userId: number } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch {
    return null;
  }
}

const submitAnswerSchema = z.object({
  choiceId: z.number(),
});

type CreateSessionRequest = FastifyRequest<{
  Body: z.infer<typeof createSessionSchema>;
}>;

type SubmitAnswerRequest = FastifyRequest<{
  Params: { id: string };
  Body: z.infer<typeof submitAnswerSchema>;
}>;

type GetResultRequest = FastifyRequest<{
  Params: { id: string };
}>;

const sessionRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 新しいセッションを作成
  fastify.post('/sessions', {
    schema: {
      description: '新しいセッションを作成',
      tags: ['session'],
      body: {
        type: 'object',
        properties: {
          userAgent: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            sessionId: { type: 'number' },
          },
        },
      },
    },
  }, async (request: CreateSessionRequest, reply: FastifyReply) => {
    try {
      const { userAgent } = createSessionSchema.parse(request.body);
      
      // ユーザー認証チェック（オプション）
      const user = getUserFromToken(request.headers.authorization);

      const session = await fastify.prisma.session.create({
        data: {
          userId: user?.userId || null,
          userAgent: userAgent || request.headers['user-agent'] || null,
        },
      });

      return reply.status(201).send({
        sessionId: session.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid request body' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // 回答を送信
  fastify.post('/sessions/:id/answers', {
    schema: {
      description: '回答を送信',
      tags: ['session'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          choiceId: { type: 'number' },
        },
        required: ['choiceId'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            earnedPoint: { type: 'number' },
            totalScore: { type: 'number' },
          },
        },
      },
    },
  }, async (request: SubmitAnswerRequest, reply: FastifyReply) => {
    try {
      const sessionId = parseInt(request.params.id, 10);
      const { choiceId } = submitAnswerSchema.parse(request.body);

      // セッションの存在確認
      const session = await fastify.prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return reply.status(404).send({ error: 'Session not found' });
      }

      // 選択肢の確認とポイント取得
      const choice = await fastify.prisma.choice.findUnique({
        where: { id: choiceId },
      });

      if (!choice) {
        return reply.status(404).send({ error: 'Choice not found' });
      }

      // 回答を保存
      await fastify.prisma.userAnswer.create({
        data: {
          sessionId,
          choiceId,
          earnedPoint: choice.pointValue,
        },
      });

      // 現在の合計スコアを計算
      const totalScore = await fastify.prisma.userAnswer.aggregate({
        where: { sessionId },
        _sum: { earnedPoint: true },
      });

      return {
        earnedPoint: choice.pointValue,
        totalScore: totalScore._sum.earnedPoint || 0,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid request' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // セッション結果を取得（偏差値含む）
  fastify.get('/sessions/:id/result', {
    schema: {
      description: 'セッション結果と偏差値を取得',
      tags: ['session'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            totalScore: { type: 'number' },
            zScore: { type: 'number' },
            mean: { type: 'number' },
            stdDev: { type: 'number' },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  odaiId: { type: 'number' },
                  choiceId: { type: 'number' },
                  earnedPoint: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: GetResultRequest, reply: FastifyReply) => {
    try {
      const sessionId = parseInt(request.params.id, 10);

      // セッションの存在確認と回答データを取得
      const session = await fastify.prisma.session.findUnique({
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
        return reply.status(404).send({ error: 'Session not found' });
      }

      // このセッションの合計スコア
      const totalScore = session.answers.reduce((sum, answer) => sum + answer.earnedPoint, 0);

      // 全セッションのスコア統計を計算
      const allScores = await fastify.prisma.session.findMany({
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
        : 50; // デフォルト値

      const variance = scores.length > 1
        ? scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / (scores.length - 1)
        : 100; // デフォルト値

      const stdDev = Math.sqrt(variance);

      // 偏差値を計算 (z = (x - μ) / σ * 10 + 50)
      const zScore = stdDev > 0 
        ? ((totalScore - mean) / stdDev) * 10 + 50 
        : 50; // 標準偏差が0の場合のデフォルト値

      // 回答データを整形
      const answers = session.answers.map(answer => ({
        odaiId: answer.choice.odai.id,
        choiceId: answer.choiceId,
        earnedPoint: answer.earnedPoint,
      }));

      return {
        totalScore,
        zScore: Math.round(zScore * 10) / 10, // 小数点第1位まで
        mean: Math.round(mean * 10) / 10,
        stdDev: Math.round(stdDev * 10) / 10,
        answers,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
};

export default sessionRoutes; 