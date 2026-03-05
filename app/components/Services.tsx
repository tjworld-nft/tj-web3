"use client";

import { useEffect, useRef, useState } from "react";
import type { SanityService } from "@/sanity/lib/types";

// フォールバック用データ
const fallbackWebinarList: SanityService[] = [
    { _id: "fs-w1", name: "NFT名刺作成ウェビナー", price: "29,800円〜", category: "webinar" },
    { _id: "fs-w2", name: "AI × CANVAでLINEスタンプ作成", price: "3,300円〜", category: "webinar" },
    { _id: "fs-w3", name: "AI × CANVAでLOGO作成", price: "3,300円〜", category: "webinar" },
    { _id: "fs-w4", name: "ChatGPT初心者向けウェビナー", price: "3,300円〜", category: "webinar" },
    { _id: "fs-w5", name: "ChatGPTs作成ウェビナー", price: "29,800円〜", category: "webinar" },
    { _id: "fs-w6", name: "AI × CANVAで漫画作成", price: "3,300円〜", category: "webinar" },
    { _id: "fs-w7", name: "AI × CANVAで絵本作成", price: "29,800円〜", category: "webinar" },
    { _id: "fs-w8", name: "CANVAで簡単WEBサイト作成", price: "29,800円〜", category: "webinar" },
    { _id: "fs-w9", name: "CANVAで簡単LP作成", price: "29,800円〜", category: "webinar" },
    { _id: "fs-w10", name: "その他各種ウェビナー", price: "ASK", category: "webinar" },
];

const fallbackDivingMenu: SanityService[] = [
    { _id: "fs-d1", name: "OWD講習", detail: "最短3日間", price: "53,900円", category: "marine" },
    { _id: "fs-d2", name: "AOW講習", detail: "最短2日間", price: "53,900円", category: "marine" },
    { _id: "fs-d3", name: "RED講習", detail: "最短2日間", price: "53,900円", category: "marine" },
    { _id: "fs-d4", name: "EFR講習", detail: "最短1日", price: "22,000円", category: "marine" },
    { _id: "fs-d5", name: "各種SPダイバー講習", detail: "1〜2日", price: "27,500円〜", category: "marine" },
    { _id: "fs-d6", name: "各種プロフェッショナル講習", detail: "", price: "ASK", category: "marine" },
    { _id: "fs-d7", name: "体験ダイビング", detail: "半日", price: "16,500円", category: "marine" },
    { _id: "fs-d8", name: "リフレッシュダイビング", detail: "半日", price: "13,200円", category: "marine" },
    { _id: "fs-d9", name: "2ビーチファンダイビング", detail: "", price: "13,200円", category: "marine" },
    { _id: "fs-d10", name: "2ボートファンダイビング", detail: "", price: "19,800円", category: "marine" },
    { _id: "fs-d11", name: "SUP", detail: "2時間", price: "5,500円", category: "marine" },
    { _id: "fs-d12", name: "シーカヤック", detail: "2時間", price: "5,500円", category: "marine" },
];

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

interface ServicesProps {
    services?: SanityService[];
}

export default function Services({ services }: ServicesProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef);
    const [activeTab, setActiveTab] = useState<"webinar" | "marine">("webinar");

    // Sanityデータがあればカテゴリ分け、なければフォールバック
    const hasData = services && services.length > 0;
    const webinarList = hasData
        ? services.filter((s) => s.category === "webinar")
        : fallbackWebinarList;
    const divingMenu = hasData
        ? services.filter((s) => s.category === "marine")
        : fallbackDivingMenu;

    return (
        <section id="services" className="relative py-28 bg-bg-subtle" ref={sectionRef}>
            <div className="max-w-4xl mx-auto px-6">
                {/* Section header */}
                <div className={`text-center mb-12 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <span className="text-text-tertiary text-sm font-medium tracking-widest uppercase">
                        Services
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-primary">
                        サービスメニュー
                    </h2>
                    <p className="text-text-secondary mt-3">
                        AIウェビナーからダイビング講習まで。新しい学びと体験を提供します。
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className={`flex justify-center mb-10 transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-white rounded-full p-1 border border-border flex gap-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab("webinar")}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === "webinar"
                                ? "bg-primary text-white"
                                : "text-text-secondary hover:text-text"
                                }`}
                        >
                            ウェビナー
                        </button>
                        <button
                            onClick={() => setActiveTab("marine")}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === "marine"
                                ? "bg-primary text-white"
                                : "text-text-secondary hover:text-text"
                                }`}
                        >
                            マリンアクティビティ
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className={`transition-all duration-700 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {activeTab === "webinar" ? (
                        <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 shadow-sm">
                            <h3 className="text-lg font-bold text-primary mb-1">
                                ウェブセミナー
                            </h3>
                            <p className="text-sm text-text-tertiary mb-6">
                                匿名参加OK・顔出し不要。40〜80分で最新知識を気軽に身につけられます。
                            </p>
                            <div className="divide-y divide-border-light">
                                {webinarList.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex items-center justify-between py-3.5 group"
                                    >
                                        <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
                                            {item.name}
                                        </span>
                                        <span className="text-sm font-semibold text-primary whitespace-nowrap ml-4">
                                            {item.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 text-center">
                                <a
                                    href="https://forms.gle/vTCGCPsn4rhhLqmW6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-8 py-3.5 rounded-full bg-primary text-white font-medium text-sm transition-all duration-300 hover:bg-primary-light hover:scale-[1.02]"
                                >
                                    ウェビナーのお問い合わせ
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-border p-8 sm:p-10 shadow-sm">
                            <h3 className="text-lg font-bold text-primary mb-1">
                                PADI ダイビング &amp; マリンアクティビティ
                            </h3>
                            <p className="text-sm text-text-tertiary mb-6">
                                都心から日帰りで非日常世界へ。京急三崎口駅からアクセス可能。
                            </p>
                            <div className="divide-y divide-border-light">
                                {divingMenu.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex items-center justify-between py-3.5 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
                                                {item.name}
                                            </span>
                                            {item.detail && (
                                                <span className="text-xs text-text-tertiary">{item.detail}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-primary whitespace-nowrap ml-4">
                                            {item.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 text-center">
                                <a
                                    href="https://forms.gle/QNBWCMy12rk9XAkbA"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-8 py-3.5 rounded-full bg-primary text-white font-medium text-sm transition-all duration-300 hover:bg-primary-light hover:scale-[1.02]"
                                >
                                    マリンアクティビティのお問い合わせ
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
