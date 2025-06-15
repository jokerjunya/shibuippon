import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const challengeRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // デイリーチャレンジを取得するエンドポイント
  fastify.get('/daily-challenge', {
    schema: {
      description: 'デイリーチャレンジの問題を取得',
      tags: ['challenge'],
      response: {
        200: {
          type: 'object',
          properties: {
            odais: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  text: { type: 'string' },
                  choices: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        text: { type: 'string' },
                        pointValue: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // 今日の日付を取得（JST）
      const today = new Date();
      const todayJST = new Date(today.getTime() + (9 * 60 * 60 * 1000));
      const todayString = todayJST.toISOString().split('T')[0];

      // シード値として今日の日付を使用してランダムな問題を選択
      const seed = parseInt(todayString.replace(/-/g, ''), 10);
      
      // 全ての問題を取得
      const allOdais = await fastify.prisma.odai.findMany({
        include: {
          choices: true,
        },
      });

      if (allOdais.length === 0) {
        return reply.status(404).send({ error: 'No odais found' });
      }

      // 決定論的にランダムな5問を選択
      const selectedOdais = [];
      for (let i = 0; i < 5 && i < allOdais.length; i++) {
        const index = (seed + i * 17) % allOdais.length;
        const selectedOdai = allOdais[index];
        
        // 重複チェック
        if (!selectedOdais.find(odai => odai.id === selectedOdai.id)) {
          selectedOdais.push(selectedOdai);
        }
      }

      // 不足分を補完
      while (selectedOdais.length < 5 && selectedOdais.length < allOdais.length) {
        const remainingOdais = allOdais.filter(
          odai => !selectedOdais.find(selected => selected.id === odai.id)
        );
        if (remainingOdais.length > 0) {
          selectedOdais.push(remainingOdais[0]);
        } else {
          break;
        }
      }

      return {
        odais: selectedOdais.map(odai => ({
          id: odai.id,
          text: odai.text,
          choices: odai.choices.map(choice => ({
            id: choice.id,
            text: choice.text,
            pointValue: choice.pointValue,
          })),
        })),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
};

export default challengeRoutes; 