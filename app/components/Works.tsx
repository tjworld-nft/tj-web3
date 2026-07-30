"use client";

import Image from "next/image";
import type { SanityWork } from "@/sanity/lib/types";
import { urlFor } from "@/sanity/lib/image";
import { useInView } from "./useInView";

// フォールバック用データ
const fallbackMarineWorks = [
    {
        _id: "fw-m1",
        title: "三浦海の学校",
        description: "PADIコースディレクターとして運営するダイビングスクール。体験ダイビングからプロフェッショナル養成まで。",
        link: "https://miura-diving.com",
        tags: ["PADI", "ダイビング", "三浦"],
        category: "marine" as const,
        localImage: "/umigaku.jpeg",
    },
    {
        _id: "fw-m2",
        title: "ダイバー育成実績",
        description: "1997年から25年以上、国内外で1,500名を超える認定ダイバーを育成。安全で質の高い教育を提供。",
        tags: ["1,500名+", "25年以上", "国内外"],
        category: "marine" as const,
        localImage: "/diving.png",
    },
    {
        _id: "fw-m3",
        title: "マリンアクティビティ",
        description: "SUP、シーカヤックなどのマリンスポーツ体験。都心から日帰りで非日常世界へ。",
        link: "https://miura-diving.com",
        tags: ["SUP", "シーカヤック", "体験"],
        category: "marine" as const,
        localImage: "/kayak.png",
    },
];

const fallbackAiWorks = [
    {
        _id: "fw-a1",
        title: "AquaBit LAB",
        description: "AIとデジタルスキルの普及を目指すラボ。テクノロジーと創造性の融合を探求。",
        link: "https://aquabit-lab.com",
        tags: ["AI", "Lab"],
        category: "ai" as const,
        localImage: "/aqua.png",
    },
    {
        _id: "fw-a2",
        title: "Webサイト・LP制作",
        description: "AI活用によるモダンなWebサイト・ランディングページの制作。バイブコーディングを実践。",
        tags: ["Web制作", "LP", "AI活用"],
        category: "ai" as const,
        localImage: "/hp.png",
    },
    {
        _id: "fw-a3",
        title: "AIウェビナー（50回以上開催）",
        description: "ChatGPT、CANVA×AI、NFT名刺作成、AI絵本制作など多彩なテーマで500名以上が参加。",
        tags: ["500名+", "50回+"],
        category: "ai" as const,
        localImage: "/webinar2.png",
    },
    {
        _id: "fw-a4",
        title: "AI音楽制作",
        description: "AIツールを活用したオリジナル楽曲制作。新しい音楽制作の可能性を追求。",
        link: "https://tj-music.com/",
        tags: ["AI音楽", "作曲"],
        category: "ai" as const,
        localImage: "/x-kurage.png",
    },
    {
        _id: "fw-a5",
        title: "AI漫画制作",
        description: "AI×CANVAを使った漫画制作。ウェビナーでもノウハウを提供中。",
        tags: ["漫画", "CANVA"],
        category: "ai" as const,
        localImage: "/manga.png",
    },
    {
        _id: "fw-a6",
        title: "AIゲーム制作",
        description: "AIを活用したゲーム開発。プログラミングとクリエイティブの融合。",
        tags: ["ゲーム開発", "AI活用"],
        category: "ai" as const,
        localImage: "/game.png",
    },
    {
        _id: "fw-a7",
        title: "サムネイル制作",
        description: "YouTube等のサムネイル制作。AIを活用した目を引くビジュアル作成。",
        tags: ["サムネイル", "デザイン"],
        category: "ai" as const,
        localImage: "/samune.png",
    },
    {
        _id: "fw-a8",
        title: "LINEスタンプ制作",
        description: "AI×CANVAでオリジナルLINEスタンプを制作。販売中。",
        link: "https://store.line.me/stickershop/author/4627048/ja",
        tags: ["LINEスタンプ", "クリエイティブ"],
        category: "ai" as const,
        localImage: "/line.png",
    },
    {
        _id: "fw-a9",
        title: "AIエージェント活用",
        description: "業務自動化やAIエージェントを活用した効率的なワークフロー構築。",
        tags: ["AI Agent", "自動化"],
        category: "ai" as const,
        localImage: "/openclaw.png",
    },
];

type WorkItem = SanityWork & { localImage?: string };

function WorkCard({
    work,
    index,
    isInView,
}: {
    work: WorkItem;
    index: number;
    isInView: boolean;
}) {
    const isMarine = work.category === "marine";
    const imageSrc = work.image
        ? urlFor(work.image).width(600).height(340).url()
        : work.localImage || "";

    const card = (
        <div
            className={`glass glass-sheen hover-lift group flex h-full flex-col rounded-2xl p-6 transition-all duration-500 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
            style={{ transitionDelay: `${index * 55}ms` }}
        >
            {/* Optional image */}
            {imageSrc && (
                <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-xl bg-bg-muted ring-1 ring-border-light">
                    <Image
                        src={imageSrc}
                        alt={work.title}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#03070f]/70 via-transparent to-transparent" />
                </div>
            )}

            <h4
                className={`mb-3 text-base font-bold text-primary transition-colors ${isMarine ? "group-hover:text-marine" : "group-hover:text-accent-light"
                    }`}
            >
                {work.title}
            </h4>
            <p className="flex-grow text-sm leading-relaxed text-text-secondary">
                {work.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
                {work.tags?.map((tag) => (
                    <span
                        key={tag}
                        className={`rounded-full px-2.5 py-1 text-xs ${isMarine
                            ? "bg-marine-subtle text-marine"
                            : "bg-accent-subtle text-accent-light"
                            }`}
                    >
                        {tag}
                    </span>
                ))}
            </div>
            {work.link && (
                <div className="mt-4 border-t border-border-light pt-4">
                    <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-300 group-hover:gap-2.5 ${isMarine ? "text-marine" : "text-accent-light"
                            }`}
                    >
                        サイトを見る <span aria-hidden="true">→</span>
                    </span>
                </div>
            )}
        </div>
    );

    if (work.link) {
        return (
            <a href={work.link} target="_blank" rel="noopener noreferrer" className="block">
                {card}
            </a>
        );
    }

    return card;
}

interface WorksProps {
    works?: SanityWork[];
}

export default function Works({ works }: WorksProps) {
    const { ref, isInView } = useInView(0.05);

    // Sanityデータがあればカテゴリ分け、なければフォールバック
    const hasData = works && works.length > 0;
    const marineWorks: WorkItem[] = hasData
        ? works.filter((w) => w.category === "marine")
        : fallbackMarineWorks;
    const aiWorks: WorkItem[] = hasData
        ? works.filter((w) => w.category === "ai")
        : fallbackAiWorks;

    return (
        <section id="works" className="relative py-28" ref={ref}>
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div
                    className={`mb-16 text-center transition-all duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <span className="eyebrow">Works</span>
                    <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl">
                        実績・制作物
                    </h2>
                </div>

                {/* Marine Section */}
                <div className="mb-20">
                    <div className="mb-7">
                        <h3 className="font-display text-lg font-bold text-marine">
                            Marine Business
                            <span className="ml-2 text-sm font-normal text-text-tertiary">
                                — マリン事業
                            </span>
                        </h3>
                        <div className="rule-glow mt-3" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {marineWorks.map((work, i) => (
                            <WorkCard
                                key={work._id}
                                work={work}
                                index={i}
                                isInView={isInView}
                            />
                        ))}
                    </div>
                </div>

                {/* AI Section */}
                <div>
                    <div className="mb-7">
                        <h3 className="font-display text-lg font-bold text-accent-light">
                            AquaBit LAB
                            <span className="ml-2 text-sm font-normal text-text-tertiary">
                                — AI・クリエイティブ
                            </span>
                        </h3>
                        <div
                            className="mt-3 h-px"
                            style={{
                                background:
                                    "linear-gradient(90deg, rgba(124,140,255,0.5), rgba(53,215,242,0.2), transparent)",
                            }}
                        />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {aiWorks.map((work, i) => (
                            <WorkCard
                                key={work._id}
                                work={work}
                                index={i + marineWorks.length}
                                isInView={isInView}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
