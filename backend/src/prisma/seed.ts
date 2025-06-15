import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleData = [
  {
    episode: {
      code: 'EP001',
      airDate: new Date('2023-01-01'),
    },
    odais: [
      {
        text: '新年の抱負を一文字で表すと？',
        choices: [
          { text: '変', pointValue: 3 },
          { text: '逃', pointValue: 8 },
          { text: '寝', pointValue: 5 },
          { text: '食', pointValue: 2 },
          { text: '迷', pointValue: 7 },
        ],
      },
      {
        text: 'AI時代に生き残る職業とは？',
        choices: [
          { text: 'プロ道化師', pointValue: 6 },
          { text: '感情通訳者', pointValue: 9 },
          { text: 'デジタル断食コンサルタント', pointValue: 8 },
          { text: 'ロボットセラピスト', pointValue: 7 },
          { text: '人間らしさ査定員', pointValue: 5 },
        ],
      },
      {
        text: '宇宙人が地球に来て最初に驚くことは？',
        choices: [
          { text: '電車の時刻が正確すぎる', pointValue: 6 },
          { text: 'みんなスマホばかり見ている', pointValue: 4 },
          { text: '猫が人間を支配している', pointValue: 9 },
          { text: 'コンビニの品揃えの豊富さ', pointValue: 5 },
          { text: 'お辞儀の角度にこだわる', pointValue: 7 },
        ],
      },
      {
        text: '100年後の教科書に載る今年の出来事は？',
        choices: [
          { text: 'AIが人間に恋をした年', pointValue: 8 },
          { text: '猫の鳴き声が国際共通語になった年', pointValue: 9 },
          { text: 'リモートワークで家から出なくなった年', pointValue: 3 },
          { text: 'マスクがファッションアイテムになった年', pointValue: 5 },
          { text: '天気予報が100%当たるようになった年', pointValue: 6 },
        ],
      },
      {
        text: '理想の上司の条件とは？',
        choices: [
          { text: '会議中に居眠りしてくれる', pointValue: 7 },
          { text: '失敗を笑いに変えてくれる', pointValue: 8 },
          { text: '定時で帰ることを命令してくれる', pointValue: 9 },
          { text: 'お茶汲みを率先してやってくれる', pointValue: 6 },
          { text: '部下の名前を覚えようとしない', pointValue: 4 },
        ],
      },
    ],
  },
  {
    episode: {
      code: 'EP002',
      airDate: new Date('2023-02-01'),
    },
    odais: [
      {
        text: '寝坊した朝の必殺技は？',
        choices: [
          { text: '時間を巻き戻す', pointValue: 9 },
          { text: '分身の術を使う', pointValue: 8 },
          { text: '目覚まし時計に謝る', pointValue: 6 },
          { text: '昨日の自分を恨む', pointValue: 5 },
          { text: '明日から本気出す', pointValue: 7 },
        ],
      },
      {
        text: '未来のコンビニで売られているもの',
        choices: [
          { text: '3秒で充電できる睡眠', pointValue: 9 },
          { text: '母親の愛情（冷凍食品）', pointValue: 8 },
          { text: 'やる気の素（栄養ドリンク）', pointValue: 7 },
          { text: '時間の無駄遣い（お菓子）', pointValue: 6 },
          { text: '人見知り治療薬', pointValue: 5 },
        ],
      },
      {
        text: '世界で一番難しいことは？',
        choices: [
          { text: '猫に薬を飲ませること', pointValue: 8 },
          { text: 'YouTube動画を1本だけで止めること', pointValue: 9 },
          { text: '電話の最後の挨拶のタイミング', pointValue: 7 },
          { text: 'ポテトチップスの袋を静かに開けること', pointValue: 6 },
          { text: '月曜日を好きになること', pointValue: 5 },
        ],
      },
    ],
  },
];

async function main() {
  console.log('シードデータの投入を開始します...');

  try {
    // 既存のデータをクリア
    await prisma.userAnswer.deleteMany();
    await prisma.session.deleteMany();
    await prisma.choice.deleteMany();
    await prisma.odai.deleteMany();
    await prisma.episode.deleteMany();

    console.log('既存のデータをクリアしました');

    // シードデータを投入
    for (const episodeData of sampleData) {
      // エピソードを作成
      const episode = await prisma.episode.create({
        data: {
          code: episodeData.episode.code,
          airDate: episodeData.episode.airDate,
        },
      });

      console.log(`エピソード ${episode.code} を作成しました`);

      // 各お題と選択肢を作成
      for (const odaiData of episodeData.odais) {
        const odai = await prisma.odai.create({
          data: {
            episodeId: episode.id,
            text: odaiData.text,
          },
        });

        console.log(`  お題「${odai.text}」を作成しました`);

        // 選択肢を作成
        for (const choiceData of odaiData.choices) {
          await prisma.choice.create({
            data: {
              odaiId: odai.id,
              text: choiceData.text,
              pointValue: choiceData.pointValue,
            },
          });
        }

        console.log(`    ${odaiData.choices.length}個の選択肢を作成しました`);
      }
    }

    console.log('✅ シードデータの投入が完了しました！');

    // 投入されたデータの確認
    const episodeCount = await prisma.episode.count();
    const odaiCount = await prisma.odai.count();
    const choiceCount = await prisma.choice.count();

    console.log(`📊 投入されたデータ:`);
    console.log(`   エピソード数: ${episodeCount}`);
    console.log(`   お題数: ${odaiCount}`);
    console.log(`   選択肢数: ${choiceCount}`);
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