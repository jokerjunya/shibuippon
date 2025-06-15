import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IPPONグランプリの実際のデータ
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

async function main() {
  console.log('🎭 IPPONグランプリのシードデータ投入を開始します...');

  try {
    // 既存のデータをクリア
    await prisma.userAnswer.deleteMany();
    await prisma.session.deleteMany();
    await prisma.choice.deleteMany();
    await prisma.odai.deleteMany();
    await prisma.episode.deleteMany();

    console.log('既存のデータをクリアしました');

    // IPPONデータを投入
    for (let i = 0; i < ipponData.length; i++) {
      const data = ipponData[i];
      if (!data) continue;
      
      // エピソードを作成（年度とブロックとインデックスの組み合わせ）
      const episodeCode = `${data.year}-${data.block}-${i + 1}`;
      const episode = await prisma.episode.create({
        data: {
          code: episodeCode,
          airDate: new Date(`${data.year}-01-01`),
        },
      });

      console.log(`📺 エピソード ${episode.code} を作成しました`);

      // お題を作成
      const odai = await prisma.odai.create({
        data: {
          episodeId: episode.id,
          text: data.odai,
        },
      });

      console.log(`❓ お題「${odai.text}」を作成しました`);

      // 選択肢を作成
      for (const answer of data.answers) {
        await prisma.choice.create({
          data: {
            odaiId: odai.id,
            text: answer.text,
            pointValue: convertScore(answer.score),
          },
        });
      }

      console.log(`✅ ${data.answers.length}個の選択肢を作成しました（作者: ${data.answers[0]?.author}他）`);
    }

    console.log('🎉 IPPONグランプリのシードデータ投入が完了しました！');

    // 投入されたデータの確認
    const episodeCount = await prisma.episode.count();
    const odaiCount = await prisma.odai.count();
    const choiceCount = await prisma.choice.count();

    console.log(`📊 投入されたデータ:`);
    console.log(`   エピソード数: ${episodeCount}`);
    console.log(`   お題数: ${odaiCount}`);
    console.log(`   選択肢数: ${choiceCount}`);

    // 得点分布を確認
    const scoreDistribution = await prisma.choice.groupBy({
      by: ['pointValue'],
      _count: {
        pointValue: true,
      },
      orderBy: {
        pointValue: 'desc',
      },
    });

    console.log(`🎯 得点分布:`);
    scoreDistribution.forEach(item => {
      const label = item.pointValue === 10 ? 'IPPON' : `${item.pointValue}点`;
      console.log(`   ${label}: ${item._count.pointValue}個`);
    });

  } catch (error) {
    console.error('❌ シードデータの投入中にエラーが発生しました:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 