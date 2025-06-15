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
      const seed = parseInt(todayString?.replace(/-/g, '') || '20240101', 10);
      
      // 全ての問題を取得
      const allOdais = await fastify.prisma.odai.findMany({
        include: {
          choices: true,
        },
      });

      if (allOdais.length === 0) {
        // データベースが空の場合、自動初期化を試行
        console.log('⚠️ データベースが空です。自動初期化を試行します...');
        
        try {
          // 管理者APIを内部呼び出し
          const initResponse = await fastify.inject({
            method: 'POST',
            url: '/api/admin/init-database',
          });
          
          if (initResponse.statusCode === 200) {
            console.log('✅ データベース自動初期化成功');
            
            // 再度データを取得
            const retryOdais = await fastify.prisma.odai.findMany({
              include: {
                choices: true,
              },
            });
            
            if (retryOdais.length > 0) {
              // 成功した場合、再帰的に処理を続行
              const seed = parseInt(todayString?.replace(/-/g, '') || '20240101', 10);
              const selectedOdais: typeof retryOdais = [];
              
              for (let i = 0; i < 5 && i < retryOdais.length; i++) {
                const index = (seed + i * 17) % retryOdais.length;
                const selectedOdai = retryOdais[index];
                
                if (selectedOdai && !selectedOdais.find(odai => odai.id === selectedOdai.id)) {
                  selectedOdais.push(selectedOdai);
                }
              }
              
              while (selectedOdais.length < 5 && selectedOdais.length < retryOdais.length) {
                const remainingOdais = retryOdais.filter(
                  odai => !selectedOdais.find(selected => selected.id === odai.id)
                );
                if (remainingOdais.length > 0 && remainingOdais[0]) {
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
            }
          }
        } catch (initError) {
          console.error('❌ データベース自動初期化失敗:', initError);
        }
        
        return reply.status(404).send({ 
          error: 'No odais found. Database initialization failed. Please contact administrator.' 
        });
      }

      // 決定論的にランダムな5問を選択
      const selectedOdais: typeof allOdais = [];
      for (let i = 0; i < 5 && i < allOdais.length; i++) {
        const index = (seed + i * 17) % allOdais.length;
        const selectedOdai = allOdais[index];
        
        // 重複チェック
        if (selectedOdai && !selectedOdais.find(odai => odai.id === selectedOdai.id)) {
          selectedOdais.push(selectedOdai);
        }
      }

      // 不足分を補完
      while (selectedOdais.length < 5 && selectedOdais.length < allOdais.length) {
        const remainingOdais = allOdais.filter(
          odai => !selectedOdais.find(selected => selected.id === odai.id)
        );
        if (remainingOdais.length > 0 && remainingOdais[0]) {
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