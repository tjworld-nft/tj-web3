"use client";

import Image from "next/image";
import { useInView } from "./useInView";

const timeline = [
    {
        year: "1997",
        title: "プロダイバーとしてキャリア開始",
        description: "スキューバダイビングのプロフェッショナルとして、海の世界でのキャリアを歩み始める。",
    },
    {
        year: "1999",
        title: "PADIインストラクター取得",
        description: "PADIインストラクター資格を取得。本格的にダイバー育成に携わり始める。",
    },
    {
        year: "2001",
        title: "PADIコースディレクター取得",
        description: "インストラクター育成の最高峰資格を取得。指導者を育てる指導者として活動を開始。",
    },
    {
        year: "2020s",
        title: "AI・デジタルクリエイション",
        description: "AI絵本の出版、ウェビナー開催など、AIを活用したクリエイティブワークを開始。AquaBit LABを設立。",
    },
    {
        year: "現在",
        title: "複数の事業を展開",
        description: "三浦海の学校を拠点にマリン事業を運営しながら、AquaBit LABとしてAI・デジタルクリエイションを展開。Udemy講師としても活動中。",
    },
];

export default function About() {
    const { ref, isInView } = useInView(0.1);

    return (
        <section id="about" className="section-veil relative py-28" ref={ref}>
            <div className="mx-auto max-w-4xl px-6">
                {/* Section header */}
                <div
                    className={`mb-16 text-center transition-all duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <span className="eyebrow">About</span>
                    <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl">
                        ティージェーについて
                    </h2>
                </div>

                {/* Profile with image */}
                <div
                    className={`mx-auto mb-20 max-w-3xl transition-all delay-200 duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    {/* Profile Image */}
                    <div className="mb-10 flex justify-center">
                        <div className="animate-float-slow relative">
                            <div
                                className="absolute -inset-4 rounded-full opacity-70 blur-2xl"
                                style={{
                                    background:
                                        "radial-gradient(circle, rgba(53,215,242,0.35), rgba(124,140,255,0.10) 60%, transparent 72%)",
                                }}
                            />
                            <div className="relative h-40 w-40 overflow-hidden rounded-full border border-marine/30 shadow-[0_20px_60px_-20px_rgba(53,215,242,0.55)] sm:h-48 sm:w-48">
                                <Image
                                    src="/tj.PNG"
                                    alt="TJ - 吉田哲司"
                                    fill
                                    sizes="(max-width: 640px) 160px, 192px"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass glass-sheen space-y-6 rounded-3xl p-7 text-[0.95rem] leading-relaxed text-text-secondary sm:p-10 sm:text-lg">
                        <p>
                            AIデジタルクリエイターとして、累計
                            <strong className="font-semibold text-marine">500名以上</strong>
                            が参加するウェビナーを
                            <strong className="font-semibold text-marine">50回以上</strong>
                            開催。 ChatGPTやMidjourney等のAIツールを駆使したクリエイティブワークを得意とし、
                            AquaBit LABとして絵本制作やLINEスタンプデザインなどを手掛けています。
                        </p>
                        <p>
                            <strong className="font-semibold text-marine">25年以上</strong>
                            の経験を持つダイビングのプロフェッショナルとして、
                            世界最大のダイビング指導団体PADIの
                            <strong className="font-semibold text-marine">
                                コースディレクター
                            </strong>
                            を務めています。
                            <strong className="font-semibold text-marine">1,500名</strong>
                            を超える認定ダイバーの育成実績があり、
                            安全で質の高いダイビング教育を提供しています。
                        </p>
                        <p>
                            現在はUdemyでのオンライン講師としても活動を開始。神奈川県の三浦海の学校を拠点に、6人の子どもたちの父として、
                            次世代のデジタル教育とオーシャンリテラシーの普及に情熱を注いでいます。
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <div>
                    <h3 className="font-display mb-12 text-center text-xl font-bold text-primary">
                        キャリアタイムライン
                    </h3>
                    <div className="relative mx-auto max-w-2xl">
                        {/* Timeline line */}
                        <div
                            className="absolute top-0 bottom-0 left-0 w-px sm:left-1/2"
                            style={{
                                background:
                                    "linear-gradient(180deg, transparent, rgba(53,215,242,0.35) 12%, rgba(124,140,255,0.25) 88%, transparent)",
                            }}
                        />

                        {timeline.map((item, i) => (
                            <div
                                key={item.year}
                                className={`relative mb-10 flex items-start transition-all duration-700 ${isInView
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                                    } ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                                style={{ transitionDelay: `${i * 130}ms` }}
                            >
                                {/* Content card */}
                                <div
                                    className={`ml-8 sm:ml-0 sm:w-[calc(50%-24px)] ${i % 2 === 0 ? "sm:pr-7 sm:text-right" : "sm:pl-7"
                                        }`}
                                >
                                    <span className="font-display text-sm font-semibold text-marine">
                                        {item.year}
                                    </span>
                                    <h4 className="mt-1 text-base font-bold text-primary">
                                        {item.title}
                                    </h4>
                                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Timeline dot */}
                                <div className="absolute top-1.5 left-0 -ml-[5px] h-2.5 w-2.5 rounded-full bg-marine shadow-[0_0_0_4px_rgba(53,215,242,0.14),0_0_16px_rgba(53,215,242,0.8)] sm:left-1/2 sm:ml-0 sm:-translate-x-1/2" />

                                {/* Spacer */}
                                <div className="hidden sm:block sm:w-[calc(50%-24px)]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
