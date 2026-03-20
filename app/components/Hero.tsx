"use client";

import Image from "next/image";

export default function Hero() {
    return (
        <section
            id="hero"
            className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
        >
            {/* Background Image */}
            <Image
                src="/hero.png"
                alt="海とAIの世界"
                fill
                className="object-cover object-center"
                priority
                quality={90}
            />

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
                {/* Badge */}
                <div className="animate-fade-in-up">
                    <span className="inline-block px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-sm text-white/90 mb-6 sm:mb-8 tracking-wide border border-white/20">
                        Since 1997
                    </span>
                </div>

                {/* Main heading */}
                <h1 className="animate-fade-in-up-delayed">
                    <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight drop-shadow-lg">
                        海とAIで、
                        <br />
                        未来を創る
                    </span>
                </h1>

                {/* Description */}
                <p className="animate-fade-in-up-delayed-2 mt-6 sm:mt-8 text-base sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                    PADIコースディレクターとして25年以上の海の経験。
                    <br className="hidden sm:block" />
                    AquaBit LAB代表としてAI・デジタルクリエイションを展開。
                    <br className="hidden sm:block" />
                    それぞれの分野で、新しい価値を創り続けています。
                </p>

                {/* Stats */}
                <div className="animate-fade-in-up-delayed-2 mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-2xl mx-auto">
                    {[
                        { number: "29+", label: "年の経験" },
                        { number: "1,500+", label: "認定ダイバー" },
                        { number: "500+", label: "ウェビナー参加者" },
                        { number: "50+", label: "ウェビナー開催" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                                {stat.number}
                            </div>
                            <div className="text-xs sm:text-sm text-white/70 mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="animate-fade-in-up-delayed-2 mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="#works"
                        onClick={(e) => {
                            e.preventDefault();
                            document
                                .getElementById("works")
                                ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-gray-900 font-medium text-base transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] hover:shadow-lg"
                    >
                        実績を見る
                    </a>
                    <a
                        href="https://miura-diving.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/40 text-white font-medium text-base transition-all duration-300 hover:bg-white/10 hover:border-white/60 hover:scale-[1.02] backdrop-blur-sm"
                    >
                        🌊 マリン事業はこちら
                    </a>
                    <a
                        href="https://aquabit-lab.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/40 text-white font-medium text-base transition-all duration-300 hover:bg-white/10 hover:border-white/60 hover:scale-[1.02] backdrop-blur-sm"
                    >
                        🤖 AI事業はこちら
                    </a>
                </div>
            </div>
        </section>
    );
}
