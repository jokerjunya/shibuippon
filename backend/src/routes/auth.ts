import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function authRoutes(fastify: FastifyInstance) {
  // ユーザー登録
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'ユーザー登録',
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 20 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                createdAt: { type: 'string' }
              }
            },
            token: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { username, email, password } = request.body as {
      username: string;
      email?: string;
      password: string;
    };

    try {
      // ユーザー名の重複チェック
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'ユーザー名が既に使用されています' });
      }

      // メールアドレスの重複チェック（提供された場合）
      if (email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email }
        });

        if (existingEmail) {
          return reply.status(400).send({ error: 'メールアドレスが既に使用されています' });
        }
      }

      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);

      // ユーザー作成
      const user = await prisma.user.create({
        data: {
          username,
          email: email || null,
          password: hashedPassword
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true
        }
      });

      // JWT生成
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      reply.status(201).send({ user, token });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'ユーザー登録に失敗しました' });
    }
  });

  // ログイン
  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'ログイン',
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' }
              }
            },
            token: { type: 'string' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body as {
      username: string;
      password: string;
    };

    try {
      // ユーザー検索
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        return reply.status(401).send({ error: 'ユーザー名またはパスワードが間違っています' });
      }

      // パスワード検証
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return reply.status(401).send({ error: 'ユーザー名またはパスワードが間違っています' });
      }

      // JWT生成
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email
      };

      reply.send({ user: userResponse, token });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: 'ログインに失敗しました' });
    }
  });

  // ユーザー情報取得（認証必須）
  fastify.get('/me', {
    schema: {
      tags: ['Auth'],
      summary: '現在のユーザー情報取得',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                createdAt: { type: 'string' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: '認証トークンが必要です' });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true
        }
      });

      if (!user) {
        return reply.status(401).send({ error: 'ユーザーが見つかりません' });
      }

      reply.send({ user });
    } catch (error) {
      fastify.log.error(error);
      reply.status(401).send({ error: '無効な認証トークンです' });
    }
  });
} 