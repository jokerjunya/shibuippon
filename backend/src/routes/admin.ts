import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

// IPPONグランプリの実際のデータ（seed-ippon.tsから移植）
const ipponData = [
  {
    year: "2017",
    block: "A", 
    odai: "大不幸中の小幸いな事を言ってください",
    answers: [
      { text: "パラシュートは開かないけど富士山は見える", author: "バカリズム", score: "8" },
      { text: "女が絶滅したけどGENKINGは生き残った", author: "若林正恭 (オードリー)", score: "9" },
      { text: "財布を落としたけど中身は空だった", author: "ダミー回答1", score: "6" },
      { text: "コロナになったけど在宅勤務になった", author: "ダミー回答2", score: "7" },
      { text: "電車が遅延したけど嫌いな会議が延期になった", author: "ダミー回答3", score: "5" }
    ]
  },
  {
    year: "2017",
    block: "A",
    odai: "「アメトーーク！」で出演者が集まらなかったテーマ「〇〇芸人」とは？",
    answers: [
      { text: "インフルエンザ芸人", author: "バカリズム", score: "IPPON" },
      { text: "確定申告芸人", author: "ダミー回答1", score: "7" },
      { text: "歯医者予約芸人", author: "ダミー回答2", score: "6" },
      { text: "早起き芸人", author: "ダミー回答3", score: "5" },
      { text: "ダイエット成功芸人", author: "ダミー回答4", score: "8" }
    ]
  },
  {
    year: "2019",
    block: "決勝",
    odai: "〇〇歳までにやっておきたいこと",
    answers: [
      { text: "48歳までにハンコなくしたい", author: "設楽統 (バナナマン)", score: "IPPON" },
      { text: "30歳までに結婚したい", author: "ダミー回答1", score: "6" },
      { text: "40歳までに家を買いたい", author: "ダミー回答2", score: "5" },
      { text: "50歳までに転職したい", author: "ダミー回答3", score: "7" },
      { text: "60歳までに海外旅行したい", author: "ダミー回答4", score: "4" }
    ]
  },
  {
    year: "2022",
    block: "B",
    odai: "写真で一言（柴犬がソファに座る写真）",
    answers: [
      { text: "浮浪者からやり直したかったんだ", author: "川島明 (麒麟)", score: "IPPON" },
      { text: "ここが俺の指定席だ", author: "ダミー回答1", score: "7" },
      { text: "今日も疲れた〜", author: "ダミー回答2", score: "6" },
      { text: "人間になりたかった", author: "ダミー回答3", score: "8" },
      { text: "このソファ高かったのに", author: "ダミー回答4", score: "5" }
    ]
  },
  {
    year: "2023",
    block: "B",
    odai: "漏れそうな時に1分もたせられる意外な方法とは？",
    answers: [
      { text: "ハワイ出身力士をあげてゆく", author: "水川かたまり (空気階段)", score: "8" },
      { text: "九九を逆から言う", author: "ダミー回答1", score: "7" },
      { text: "深呼吸を10回する", author: "ダミー回答2", score: "6" },
      { text: "47都道府県を暗唱する", author: "ダミー回答3", score: "8" },
      { text: "好きな人のことを考える", author: "ダミー回答4", score: "5" }
    ]
  },
  {
    year: "2023",
    block: "決勝",
    odai: "天を駆けるペガサス実際に乗ってみたらガッカリその理由とは？",
    answers: [
      { text: "ワゴンRの方が早い", author: "粗品 (霜降り明星)", score: "IPPON" },
      { text: "シートベルトがない", author: "ダミー回答1", score: "7" },
      { text: "エアコンが効かない", author: "ダミー回答2", score: "6" },
      { text: "馬のにおいがする", author: "ダミー回答3", score: "8" },
      { text: "着陸が下手", author: "ダミー回答4", score: "5" }
    ]
  },
  {
    year: "2024",
    block: "B",
    odai: "一人称が「うち」の人が言いそうな事を言って下さい",
    answers: [
      { text: "うち、年賀状やめてん", author: "博多大吉", score: "IPPON" },
      { text: "うち、今日疲れてん", author: "ダミー回答1", score: "7" },
      { text: "うち、お腹すいた", author: "ダミー回答2", score: "6" },
      { text: "うち、もう帰りたい", author: "ダミー回答3", score: "8" },
      { text: "うち、お金ないねん", author: "ダミー回答4", score: "5" }
    ]
  },
  {
    year: "2024",
    block: "A", 
    odai: "アホなフリして芸能界のことを聞いてちゃってください",
    answers: [
      { text: "さかなくんの話し方って天然ですか、養殖ですか？", author: "田中卓志 (アンガールズ)", score: "IPPON" },
      { text: "卒業？ クビじゃなく？", author: "川島明 (麒麟)", score: "7" },
      { text: "その服高かったんですか？", author: "ダミー回答1", score: "6" },
      { text: "あの人まだ芸能人なんですか？", author: "ダミー回答2", score: "8" },
      { text: "テレビって儲かるんですか？", author: "ダミー回答3", score: "5" }
    ]
  }
];

// 得点を数値に変換する関数
function convertScore(score: string): number {
  if (score === "IPPON") return 10;
  if (score === "-") return 3;
  const numScore = parseInt(score, 10);
  return isNaN(numScore) ? 5 : numScore;
}

const adminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // データベース初期化エンドポイント
  fastify.post('/init-database', {
    schema: {
      description: 'データベースを初期化してシードデータを投入',
      tags: ['admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            stats: {
              type: 'object',
              properties: {
                episodes: { type: 'number' },
                odais: { type: 'number' },
                choices: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      console.log('🎭 データベース初期化を開始します...');

      // 既存のデータをクリア
      await fastify.prisma.userAnswer.deleteMany();
      await fastify.prisma.session.deleteMany();
      await fastify.prisma.choice.deleteMany();
      await fastify.prisma.odai.deleteMany();
      await fastify.prisma.episode.deleteMany();

      console.log('✅ 既存のデータをクリアしました');

      // IPPONデータを投入
      for (let i = 0; i < ipponData.length; i++) {
        const data = ipponData[i];
        if (!data) continue;
        
        // エピソードを作成
        const episodeCode = `${data.year}-${data.block}-${i + 1}`;
        const episode = await fastify.prisma.episode.create({
          data: {
            code: episodeCode,
            airDate: new Date(`${data.year}-01-01`),
          },
        });

        // お題を作成
        const odai = await fastify.prisma.odai.create({
          data: {
            episodeId: episode.id,
            text: data.odai,
          },
        });

        // 選択肢を作成
        for (const answer of data.answers) {
          await fastify.prisma.choice.create({
            data: {
              odaiId: odai.id,
              text: answer.text,
              pointValue: convertScore(answer.score),
            },
          });
        }

        console.log(`📺 エピソード ${episode.code} - お題「${odai.text}」を作成しました`);
      }

      // 投入されたデータの確認
      const episodeCount = await fastify.prisma.episode.count();
      const odaiCount = await fastify.prisma.odai.count();
      const choiceCount = await fastify.prisma.choice.count();

      console.log('🎉 データベース初期化完了！');
      console.log(`📊 投入されたデータ: エピソード${episodeCount}個、お題${odaiCount}個、選択肢${choiceCount}個`);

      return {
        success: true,
        message: 'データベースの初期化が完了しました',
        stats: {
          episodes: episodeCount,
          odais: odaiCount,
          choices: choiceCount,
        },
      };
    } catch (error) {
      console.error('❌ データベース初期化エラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return reply.status(500).send({
        success: false,
        message: `データベース初期化に失敗しました: ${errorMessage}`,
        stats: { episodes: 0, odais: 0, choices: 0 },
      });
    }
  });

  // データベース状態確認エンドポイント
  fastify.get('/database-status', {
    schema: {
      description: 'データベースの状態を確認',
      tags: ['admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            stats: {
              type: 'object',
              properties: {
                episodes: { type: 'number' },
                odais: { type: 'number' },
                choices: { type: 'number' },
                sessions: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // データベース接続テスト
      await fastify.prisma.$queryRaw`SELECT 1`;
      
      // データ数を取得
      const [episodeCount, odaiCount, choiceCount, sessionCount] = await Promise.all([
        fastify.prisma.episode.count(),
        fastify.prisma.odai.count(),
        fastify.prisma.choice.count(),
        fastify.prisma.session.count(),
      ]);

      return {
        connected: true,
        stats: {
          episodes: episodeCount,
          odais: odaiCount,
          choices: choiceCount,
          sessions: sessionCount,
        },
      };
    } catch (error) {
      console.error('❌ データベース状態確認エラー:', error);
      
      return reply.status(500).send({
        connected: false,
        stats: { episodes: 0, odais: 0, choices: 0, sessions: 0 },
      });
    }
  });
};

export default adminRoutes; 