"use client";

const stats = [
    { number: "29+", label: "年の海の経験" },
    { number: "1,500+", label: "認定ダイバー" },
    { number: "500+", label: "ウェビナー参加者" },
    { number: "50+", label: "ウェビナー開催" },
];

export default function Hero() {
    return (
        <section
            id="hero"
            className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
        >
            {/* テキストの可読性を確保する薄い暗幕 */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(70% 55% at 50% 48%, rgba(2,6,14,0.72) 0%, rgba(2,6,14,0.45) 45%, rgba(2,6,14,0) 78%)",
                }}
            />

            <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center sm:py-28">
                {/* Badge */}
                <div className="animate-fade-in-up">
                    <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs tracking-wide text-text-secondary sm:text-sm">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-marine opacity-70" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-marine" />
                        </span>
                        <span className="font-display tracking-[0.18em]">SINCE 1997</span>
                        <span className="hidden text-text-tertiary sm:inline">|</span>
                        <span className="hidden sm:inline">
                            PADI コースディレクター × AI クリエイター
                        </span>
                    </span>
                </div>

                {/* Main heading */}
                <h1 className="animate-fade-in-up-delayed mt-8">
                    <span className="block text-[2.75rem] leading-[1.08] font-bold tracking-tight text-glow sm:text-6xl md:text-7xl lg:text-[5rem]">
                        <span className="text-white">海</span>
                        <span className="text-text-secondary">と</span>
                        <span className="text-gradient">AI</span>
                        <span className="text-text-secondary">で、</span>
                        <br />
                        <span className="text-white">未来を創る</span>
                    </span>
                </h1>

                {/* Description */}
                <p className="animate-fade-in-up-delayed-2 mx-auto mt-7 max-w-2xl text-[0.95rem] leading-relaxed text-text-secondary sm:mt-8 sm:text-lg">
                    PADIコースディレクターとして25年以上の海の経験。
                    <br className="hidden sm:block" />
                    AquaBit LAB代表としてAI・デジタルクリエイションを展開。
                    <br className="hidden sm:block" />
                    それぞれの分野で、新しい価値を創り続けています。
                </p>

                {/* Stats */}
                <div className="animate-fade-in-up-delayed-2 mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-4 sm:gap-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="glass glass-sheen rounded-2xl px-3 py-4 text-center"
                        >
                            <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                                {stat.number}
                            </div>
                            <div className="mt-1 text-[0.7rem] text-text-tertiary sm:text-xs">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="animate-fade-in-up-delayed-3 mt-9 flex flex-col justify-center gap-3 sm:mt-11 sm:flex-row sm:gap-4">
                    <a
                        href="#works"
                        onClick={(e) => {
                            e.preventDefault();
                            document
                                .getElementById("works")
                                ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base"
                    >
                        実績を見る
                        <span aria-hidden="true">↓</span>
                    </a>
                    <a
                        href="https://miura-diving.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-medium"
                    >
                        <span aria-hidden="true">🌊</span> マリン事業
                    </a>
                    <a
                        href="https://aquabit-lab.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-medium"
                    >
                        <span aria-hidden="true">🤖</span> AI事業
                    </a>
                </div>
            </div>

            {/* Scroll hint */}
            <div className="pointer-events-none absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
                <div className="flex flex-col items-center gap-2">
                    <span className="font-display text-[0.6rem] tracking-[0.32em] text-text-tertiary">
                        SCROLL
                    </span>
                    <span className="relative block h-9 w-px overflow-hidden bg-border">
                        <span className="animate-scroll-hint absolute inset-x-0 top-0 block h-4 bg-marine" />
                    </span>
                </div>
            </div>
        </section>
    );
}
