"use client";

import { useState } from "react";
import type { SanityService } from "@/sanity/lib/types";
import { useInView } from "./useInView";

// フォールバック用データ
const fallbackWebinarList: SanityService[] = [
    { _id: "fs-w1", name: "NFT名刺作成ウェビナー", price: "", category: "webinar" },
    { _id: "fs-w2", name: "AIを使ってLINEスタンプ生成", price: "", category: "webinar" },
    { _id: "fs-w3", name: "AI初心者用ウェビナー", price: "", category: "webinar" },
    { _id: "fs-w4", name: "ChatGPTs、GEMs作成ウェビナー", price: "", category: "webinar" },
    { _id: "fs-w5", name: "AIを使って漫画を作ってみよう", price: "", category: "webinar" },
    { _id: "fs-w6", name: "AIを使って絵本を作ってみよう", price: "", category: "webinar" },
    { _id: "fs-w7", name: "AIを使ってHP/LPを作ってみよう", price: "", category: "webinar" },
    { _id: "fs-w8", name: "AIを使って音楽を作ってみよう", price: "", category: "webinar" },
    { _id: "fs-w9", name: "Antigravity入門", price: "", category: "webinar" },
    { _id: "fs-w10", name: "Google Opal入門", price: "", category: "webinar" },
    { _id: "fs-w11", name: "Codex入門", price: "", category: "webinar" },
    { _id: "fs-w12", name: "Claude Code入門", price: "", category: "webinar" },
    { _id: "fs-w13", name: "Vibe Coding入門", price: "", category: "webinar" },
    { _id: "fs-w14", name: "その他各種ウェビナー", price: "ASK", category: "webinar" },
];

const fallbackDivingMenu: SanityService[] = [
    { _id: "fs-d1", name: "OWD講習", detail: "最短3日間", price: "53,900円", category: "marine" },
    { _id: "fs-d2", name: "AOW講習", detail: "最短2日間", price: "53,900円", category: "marine" },
    { _id: "fs-d3", name: "RED講習", detail: "最短2日間", price: "53,900円", category: "marine" },
    { _id: "fs-d4", name: "EFR講習", detail: "最短1日", price: "22,000円", category: "marine" },
    { _id: "fs-d5", name: "各種SPダイバー講習", detail: "1〜2日", price: "27,500円〜", category: "marine" },
    { _id: "fs-d6", name: "各種プロフェッショナル講習", detail: "", price: "ASK", category: "marine" },
    { _id: "fs-d7", name: "体験ダイビング", detail: "半日", price: "16,500円", category: "marine" },
    { _id: "fs-d8", name: "リフレッシュダイビング", detail: "半日", price: "14,800円", category: "marine" },
    { _id: "fs-d9", name: "2ビーチファンダイビング", detail: "", price: "13,200円", category: "marine" },
    { _id: "fs-d10", name: "2ボートファンダイビング", detail: "", price: "19,800円", category: "marine" },
    { _id: "fs-d11", name: "SUP", detail: "2時間", price: "5,500円", category: "marine" },
    { _id: "fs-d12", name: "シーカヤック", detail: "2時間", price: "5,500円", category: "marine" },
];

interface ServicesProps {
    services?: SanityService[];
}

export default function Services({ services }: ServicesProps) {
    const { ref, isInView } = useInView(0.05);
    const [activeTab, setActiveTab] = useState<"webinar" | "marine">("webinar");

    // Sanityデータがあればカテゴリ分け、なければフォールバック
    const hasData = services && services.length > 0;
    const webinarList = hasData
        ? services.filter((s) => s.category === "webinar")
        : fallbackWebinarList;
    const divingMenu = hasData
        ? services.filter((s) => s.category === "marine")
        : fallbackDivingMenu;

    const isWebinar = activeTab === "webinar";
    const items = isWebinar ? webinarList : divingMenu;

    return (
        <section id="services" className="relative py-28" ref={ref}>
            <div className="mx-auto max-w-4xl px-6">
                {/* Section header */}
                <div
                    className={`mb-12 text-center transition-all duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <span className="eyebrow">Services</span>
                    <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl">
                        サービスメニュー
                    </h2>
                    <p className="mt-3 text-text-secondary">
                        AIウェビナーからダイビング講習まで。新しい学びと体験を提供します。
                    </p>
                </div>

                {/* Tab Switcher */}
                <div
                    className={`mb-10 flex justify-center transition-all delay-200 duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <div
                        className="glass flex gap-1 rounded-full p-1"
                        role="tablist"
                        aria-label="サービスの種類"
                    >
                        <button
                            role="tab"
                            aria-selected={isWebinar}
                            onClick={() => setActiveTab("webinar")}
                            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${isWebinar
                                ? "btn-primary"
                                : "text-text-secondary hover:text-text"
                                }`}
                        >
                            ウェビナー
                        </button>
                        <button
                            role="tab"
                            aria-selected={!isWebinar}
                            onClick={() => setActiveTab("marine")}
                            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${!isWebinar
                                ? "btn-primary"
                                : "text-text-secondary hover:text-text"
                                }`}
                        >
                            マリンアクティビティ
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div
                    className={`transition-all delay-300 duration-700 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <div className="glass glass-sheen rounded-3xl p-7 sm:p-10">
                        <h3 className="mb-1 text-lg font-bold text-primary">
                            {isWebinar
                                ? "ウェブセミナー"
                                : "PADI ダイビング & マリンアクティビティ"}
                        </h3>
                        <p className="mb-6 text-sm text-text-tertiary">
                            {isWebinar
                                ? "匿名参加OK・顔出し不要。40〜80分で最新知識を気軽に身につけられます。"
                                : "都心から日帰りで非日常世界へ。京急三崎口駅からアクセス可能。"}
                        </p>
                        <div className="divide-y divide-border-light">
                            {items.map((item) => (
                                <div
                                    key={item._id}
                                    className="group flex items-center justify-between py-3.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-text-secondary transition-colors group-hover:text-text">
                                            {item.name}
                                        </span>
                                        {item.detail && (
                                            <span className="rounded-full bg-bg-muted px-2 py-0.5 text-xs text-text-tertiary">
                                                {item.detail}
                                            </span>
                                        )}
                                    </div>
                                    {item.price && (
                                        <span className="font-display ml-4 text-sm font-semibold whitespace-nowrap text-marine">
                                            {item.price}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-9 text-center">
                            <a
                                href={
                                    isWebinar
                                        ? "https://aquabit-lab.com/"
                                        : "https://miura-diving.com/"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm"
                            >
                                {isWebinar
                                    ? "詳細はAquaBit LABへ"
                                    : "詳細は三浦 海の学校へ"}
                                <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
