/**
 * サイトに載せる文章・実績・リンクはすべてここに集約する。
 * 数字は「実際に確認できるもの」だけを載せる（作らない）。
 *   - 1,500名+ / ウェビナー50回+ / 参加500名+ … 本人確認済みの実績値
 *   - アプリ2本 … App Store で公開中（Blue Logbook / いまメシ）
 *   - アルバム3枚・魚歌19曲 … tj-music.com・各配信サービス
 *   - まんが22話 … miura-diving.com/manga/
 *   - 著書12冊 … 下の books の件数
 *   - LINEスタンプ・絵文字47セット … LINE STORE の作者ページの件数（2026-09-27確認）
 */

export const SITE_URL = "https://www.tj-web3.com";

export const LINKS = {
    line: "https://lin.ee/obePsOF",
    marine: "https://miura-diving.com/",
    aquabit: "https://aquabit-lab.com/",
    music: "https://tj-music.com/",
    spotifyArtist: "https://open.spotify.com/artist/15LulfyOQ38iy3H7ce7Ivr",
    appleMusicArtist:
        "https://music.apple.com/jp/artist/%E3%83%86%E3%82%A3%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%BC/1821365578",
    lineStickers: "https://store.line.me/stickershop/author/4627048/ja",
    blueLogbook: "https://apps.apple.com/jp/app/id6806158093",
    imameshi: "https://apps.apple.com/jp/app/id6806607641",
    manga: "https://miura-diving.com/manga/",
    winterFilm: "https://miura-diving.com/winter-diving/",
    pvFilm: "https://miura-diving.com/#film",
    instructor: "https://miura-diving.com/instructor/",
    seaLife: "https://miura-diving.com/sea-life/",
} as const;

/** プロフィールの数字（盛らない・作らない） */
export const STATS = [
    { value: "1997", unit: "", label: "プロダイバーになった年" },
    { value: "1,500", unit: "+", label: "認定したダイバー" },
    { value: "50", unit: "+", label: "AIウェビナー開催" },
    { value: "12", unit: "冊", label: "著書（Kindle ほか）" },
    { value: "47", unit: "", label: "LINEスタンプ・絵文字" },
    { value: "3", unit: "枚", label: "配信中のアルバム" },
    { value: "22", unit: "話", label: "解説まんが" },
    { value: "2", unit: "本", label: "App Store のアプリ" },
] as const;

/**
 * キャリアのダイブプロファイル。
 * depth はグラフ上の「深さ」（数字の意味ではなく、潜っていく感じを描くための相対値）。
 */
export const CAREER = [
    { year: "1997", title: "オーストラリアでプロダイバーに", depth: 0.08 },
    { year: "1999", title: "PADIインストラクター", depth: 0.2 },
    { year: "2001", title: "PADIコースディレクター", note: "インストラクターを育てる立場へ", depth: 0.34 },
    { year: "2010s", title: "三浦の海をホームに", note: "城ヶ島・宮川湾", depth: 0.46 },
    { year: "2020s", title: "AIでつくり、AIを教える", note: "ウェビナー・AquaBit LAB", depth: 0.7 },
    { year: "2026", title: "アプリ・アルバム・まんが", note: "いま、いちばん深い所", depth: 0.94 },
] as const;

export type Work = {
    id: string;
    title: string;
    kind: string;
    /** 「いつ」— 年月だけ。日付は書かない */
    date: string;
    body: string;
    image: string;
    imageAlt: string;
    /** 画像の縦横比（CSS aspect-ratio） */
    ratio?: string;
    href: string;
    linkLabel: string;
    /** 一緒に潜ったもの（使った道具）。ログブックの "BUDDY" 欄 */
    buddy: string[];
    /** 水深の値（ログの "DEPTH"）。どの海域にある作品か */
    depth: string;
    video?: string;
    icon?: string;
    extra?: { label: string; href: string }[];
};

/** 40m ─ 海とAIがまざる層（ハロクライン）にある作品 */
export const FUSION_WORKS: Work[] = [
    {
        id: "uo-uta",
        title: "魚歌 ─ UO-UTA ─",
        kind: "AI Music / 3rd Album",
        date: "2026.07",
        body: "海の生き物を一匹ずつ主役にして、その暮らしを歌にした全19曲。アカテガニのスカ、ネコザメのスウィング。ジャンルの境界を泳ぎ渡るアルバム。",
        image: "/works/uo-uta.webp",
        imageAlt: "アルバム「魚歌 - UO-UTA -」のジャケット。海中を泳ぐダイバーと音符",
        ratio: "1 / 1",
        href: LINKS.music,
        linkLabel: "試聴する（tj-music.com）",
        buddy: ["Suno", "画像生成AI"],
        depth: "38m",
        extra: [
            { label: "Spotify", href: LINKS.spotifyArtist },
            { label: "Apple Music", href: LINKS.appleMusicArtist },
        ],
    },
    {
        id: "manga",
        title: "まんがで読むダイビング",
        kind: "AI Manga / 全22話",
        date: "2026.08 –",
        body: "「泳げないけど大丈夫？」「ひとりで行っていい？」── 申し込む前の不安に、1話3分のまんがで先回りして答える。作画はAI、監修はコースディレクター。動画版つき。",
        image: "/works/manga-collage.webp",
        imageAlt: "「まんがで読むダイビング」の表紙6話ぶん。クラゲの帽子をかぶった案内役のクララ",
        ratio: "1 / 1",
        href: LINKS.manga,
        linkLabel: "読む（miura-diving.com）",
        buddy: ["画像生成AI", "Claude", "音声合成AI"],
        depth: "39m",
    },
    {
        id: "bluelogbook",
        title: "Blue Logbook",
        kind: "iOS App",
        date: "2026.09",
        body: "潜った海を、ぜんぶ手のひらに。ダイバーのためのログブックアプリ。紙のログブックはそのままに、スマホにも残せるように。",
        image: "/works/bluelogbook.webp",
        imageAlt: "ダイビングのログブックアプリ「Blue Logbook」のApp Store公開のお知らせ",
        href: LINKS.blueLogbook,
        linkLabel: "App Store で見る",
        buddy: ["Flutter", "Claude Code", "Codex"],
        depth: "40m",
    },
    {
        id: "miura-site",
        title: "三浦 海の学校",
        kind: "Web / WebGPU",
        date: "2026.09",
        body: "写真の「海の部分だけ」が波打つトップページ。水面は2次元の波動方程式をGPUで解いて描いている。スクロールすると水深が増えていく下層ページ。",
        image: "/works/miura-diving-site.webp",
        imageAlt: "三浦 海の学校のWebサイトのトップページ",
        href: LINKS.marine,
        linkLabel: "サイトを見る",
        buddy: ["WebGPU", "three.js", "Claude Code"],
        depth: "41m",
    },
    {
        id: "pv",
        title: "粒子で描くPV",
        kind: "Film / 98 sec",
        date: "2026.09",
        body: "26万の粒子が集まって、波になり、ダイバーになり、魚になる。自作シェーダと実写を重ねた、三浦 海の学校のプロモーション映像。",
        image: "/works/pv-poster.webp",
        imageAlt: "三浦 海の学校のプロモーション映像のタイトル画面",
        video: "https://miura-diving.com/video/home/umigaku-pv-2026-teaser.mp4",
        href: LINKS.pvFilm,
        linkLabel: "映像を見る",
        buddy: ["Remotion", "three.js", "音楽生成AI"],
        depth: "42m",
    },
    {
        id: "winter",
        title: "海の季節は、終わらない。",
        kind: "Data Cinema / 62 sec",
        date: "2026.09",
        body: "気象庁の水温と気温の平年値が、そのまま構図になる映像。「寒くなったらダイビングはおしまい」を、データで静かにくつがえす。",
        image: "/works/winter-poster.webp",
        imageAlt: "データシネマ「海の季節は、終わらない。」の一場面。水温の曲線が水面になっている",
        href: LINKS.winterFilm,
        linkLabel: "映像を見る",
        buddy: ["気象庁オープンデータ", "Remotion", "GLSL"],
        depth: "43m",
    },
];

/** 言葉の海（AI）で作ってきたもの */
export const AI_WORKS: Work[] = [
    {
        id: "aquabit",
        title: "AquaBit LAB",
        kind: "Studio & School",
        date: "Now",
        body: "AIを「使う」から「創る」へ。AI学習サロン（Discordで個別サポート）、Vibe Coding講座、制作とAI導入の支援。海とAIの二つの事業の母体。",
        image: "/works/aquabit-lab-site.webp",
        imageAlt: "AquaBit LAB のWebサイト",
        href: LINKS.aquabit,
        linkLabel: "AquaBit LAB へ",
        buddy: ["Claude Code", "Codex", "Discord"],
        depth: "120m",
    },
    {
        id: "imameshi",
        title: "いまメシ",
        kind: "iOS App",
        date: "2026.09",
        body: "旅先で「今どこで食べるか」を30秒で決める。「家族4人で1500円くらい」とことばで探せて、対応機種ではiPhoneの中のAIが条件に読みかえる。",
        image: "/works/imameshi-screen-ai.webp",
        imageAlt: "iOSアプリ「いまメシ」の検索画面",
        ratio: "3 / 4",
        icon: "/works/imameshi-icon.webp",
        href: LINKS.imameshi,
        linkLabel: "App Store で見る",
        buddy: ["SwiftUI", "Foundation Models", "Claude Code"],
        depth: "180m",
    },
    {
        id: "tj-music",
        title: "TJ Music",
        kind: "AI Music / 3 Albums",
        date: "2025 –",
        body: "Dive Drive Collection、Certification Symphony、そして魚歌。ダイバーの気分とCカードの思い出と海の生き物を、AIと一緒に曲にしてきた。",
        image: "/works/tj-music-site.webp",
        imageAlt: "TJ Music のWebサイト。アルバム「魚歌」",
        href: LINKS.music,
        linkLabel: "tj-music.com",
        buddy: ["Suno", "WebGL2"],
        depth: "240m",
        extra: [
            { label: "Spotify", href: LINKS.spotifyArtist },
            { label: "Apple Music", href: LINKS.appleMusicArtist },
        ],
    },
    {
        id: "line-stamps",
        title: "LINEスタンプ",
        kind: "Illustration / 47 sets",
        date: "Now",
        body: "ゆるふわの海の生き物、クラゲ女子、戦国武将まで、ストアに並ぶのは47セット。企画から申請までの流れは、講座でも教えている。",
        image: "/works/line-stamps.webp",
        imageAlt: "TJが制作したLINEスタンプの一覧",
        href: LINKS.lineStickers,
        linkLabel: "ストアで見る",
        buddy: ["画像生成AI", "Canva"],
        depth: "310m",
    },
    {
        id: "agents",
        title: "AIエージェントと働く",
        kind: "Operations",
        date: "2026 –",
        body: "Discordに常駐するAIエージェント、ブログ・動画・SNSを手伝うAIの“スタッフ”。小さな海のお店を、AIのチームと一緒に回している。",
        image: "/works/ai-agent.webp",
        imageAlt: "AIエージェントを表すイラスト",
        href: LINKS.aquabit,
        linkLabel: "相談する",
        buddy: ["OpenClaw", "Claude Code", "Codex"],
        depth: "380m",
    },
];

/** 教えられること（ウェビナー・講座のテーマ） */
export const TOPICS = [
    "Claude Code 入門",
    "Codex 入門",
    "Vibe Coding 入門",
    "Antigravity 入門",
    "Google Opal 入門",
    "AIでHP・LPを作る",
    "AIで音楽を作る",
    "AIで漫画を作る",
    "AIで絵本を作る",
    "AIでLINEスタンプを作る",
    "ChatGPTs・Gems を作る",
    "NFT名刺を作る",
    "AI初心者のための一歩目",
] as const;

/** 言葉の海を漂うことば（背景の発光プランクトンになる） */
export const SEA_WORDS = [
    "海", "光", "潜", "泡", "波", "魚", "月", "創", "言", "夢", "学", "声", "歌", "潮", "青",
    "AI", "Claude", "Codex", "WebGPU", "GLSL", "Suno", "Flutter", "Swift", "Remotion",
    "prompt", "token", "{ }", "</>", "=>", "01", "∞", "λ", "Δ", "✦",
    "クラゲ", "ことば", "ひかり", "うみ",
] as const;

export type Book = {
    title: string;
    subtitle: string;
    image: string;
    link: string;
    badge?: string;
    shelf: "sea" | "ai" | "picture";
};

export const BOOKS: Book[] = [
    { title: "ダイビングのはじめ方", subtitle: "「私にはムリ・・」から「潜りたい」に変わる", image: "/books/start-diving.png", link: "https://amzn.to/40BBpqn", shelf: "sea" },
    { title: "はじめてのセルフダイビング", subtitle: "自由と安全を楽しむための第一歩", image: "/books/self-diving.png", link: "https://amzn.to/4003YO7", shelf: "sea" },
    { title: "今日から始めるごきげんスノーケリング", subtitle: "プロが教える安心安全テクニック", image: "/books/snorkel.png", link: "https://amzn.to/44ToUbh", shelf: "sea" },
    { title: "60代からのダイビング入門", subtitle: "海に一歩、人生にひと花", image: "/books/senior-diver.png", link: "https://amzn.to/40z9qaN", shelf: "sea" },
    { title: "ブランクダイバー復活ガイド", subtitle: "半年以上潜っていない人のためのロードマップ", image: "/books/brank-diver.png", link: "https://amzn.to/44eH3kD", shelf: "sea" },
    { title: "水中で学ぶマインドフルネス", subtitle: "Amazonスポーツ売れ筋ランキング1位", image: "/books/maindfulness.png", link: "https://amzn.to/3I9PdlI", badge: "Amazon 1位", shelf: "sea" },
    { title: "マリンアクティビティ完全ガイド", subtitle: "親子で楽しむ、プロが教える海の遊び方", image: "/books/marine.png", link: "https://amzn.to/44LzvpB", shelf: "sea" },
    { title: "はじめてのSUP", subtitle: "ドキドキの初体験から、ワンちゃんとの水上散歩まで", image: "/books/sup.png", link: "https://amzn.to/3TSlwYL", shelf: "sea" },
    { title: "やさしいシーカヤック入門", subtitle: "大切な人と、海の上で過ごす時間", image: "/books/kayac.png", link: "https://amzn.to/4nxWYCa", shelf: "sea" },
    { title: "AIは、あなたの「魔法の杖」", subtitle: "知識ゼロでも大丈夫。今日から使えるAI超入門", image: "/books/ai.png", link: "https://amzn.to/45TGvBY", shelf: "ai" },
    { title: "うみがめになったぜん君の大冒険", subtitle: "Amazon AI絵本ランキング2位", image: "/books/zenkun.png", link: "https://amzn.to/4ny1P6k", badge: "Amazon 2位", shelf: "picture" },
    { title: "おかしだいすき みーちゃん", subtitle: "AI絵本。Kindle Unlimited で読み放題", image: "/books/mi-chan.png", link: "https://amzn.to/3TmIyqI", shelf: "picture" },
];

/** 「AIに聞く」ボタン。訪問者が自分のAIでTJのことを調べられるようにする */
export const ASK_AI_PROMPT = `TJ（吉田哲司）について知りたいです。まず ${SITE_URL}/llms.txt と ${SITE_URL}/ を読んでください。
そのうえで、私の目的（AIを学びたい／制作や講演を頼みたい／ダイビングを始めたい など）を先に1つ質問してから、
TJに頼めること・頼めないことを率直に整理してください。
料金や空き状況など最新の情報は、LINE公式アカウント（${LINKS.line}）で確認するよう案内してください。`;

export const ASK_AI_TARGETS = [
    { name: "ChatGPT", href: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
    { name: "Claude", href: (q: string) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
    { name: "Perplexity", href: (q: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}` },
] as const;
