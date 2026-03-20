"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SanityWork } from "@/sanity/lib/types";
import { urlFor } from "@/sanity/lib/image";

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

function useInView(ref: React.RefObject<HTMLElement | null>) {
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsInView(true);
            },
            { threshold: 0.05 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return isInView;
}

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
            className={`bg-white rounded-2xl p-6 h-full flex flex-col border border-border transition-all duration-500 hover:shadow-md hover:-translate-y-1 group ${isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            style={{ transitionDelay: `${index * 60}ms` }}
        >
            {/* Optional image */}
            {imageSrc && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-bg-muted">
                    <Image
                        src={imageSrc}
                        alt={work.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <h4 className={`text-base font-bold mb-3 transition-colors ${isMarine ? "text-primary group-hover:text-marine" : "text-primary group-hover:text-accent"
                }`}>
                {work.title}
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed flex-grow">
                {work.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
                {work.tags?.map((tag) => (
                    <span
                        key={tag}
                        className={`text-xs px-2.5 py-1 rounded-full ${isMarine ? "bg-marine-subtle text-marine" : "bg-accent-subtle text-accent"
                            }`}
                    >
                        {tag}
                    </span>
                ))}
            </div>
            {work.link && (
                <div className="mt-4 pt-4 border-t border-border-light">
                    <span className={`text-sm font-medium transition-colors ${isMarine ? "text-marine" : "text-accent"
                        }`}>
                        サイトを見る →
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
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef);

    // Sanityデータがあればカテゴリ分け、なければフォールバック
    const hasData = works && works.length > 0;
    const marineWorks: WorkItem[] = hasData
        ? works.filter((w) => w.category === "marine")
        : fallbackMarineWorks;
    const aiWorks: WorkItem[] = hasData
        ? works.filter((w) => w.category === "ai")
        : fallbackAiWorks;

    return (
        <section id="works" className="relative py-28" ref={sectionRef}>
            <div className="max-w-6xl mx-auto px-6">
                {/* Section header */}
                <div className={`text-center mb-16 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <span className="text-text-tertiary text-sm font-medium tracking-widest uppercase">
                        Works
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-primary">
                        実績・制作物
                    </h2>
                </div>

                {/* Marine Section */}
                <div className="mb-20">
                    <h3 className="text-lg font-bold text-marine mb-6 pb-3 border-b border-border">
                        Marine Business — マリン事業
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {marineWorks.map((work, i) => (
                            <WorkCard key={work._id} work={work} index={i} isInView={isInView} />
                        ))}
                    </div>
                </div>

                {/* AI Section */}
                <div>
                    <h3 className="text-lg font-bold text-accent mb-6 pb-3 border-b border-border">
                        AquaBit LAB — AI・クリエイティブ
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {aiWorks.map((work, i) => (
                            <WorkCard key={work._id} work={work} index={i + marineWorks.length} isInView={isInView} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
