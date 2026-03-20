"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

function useInView(ref: React.RefObject<HTMLElement | null>) {
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsInView(true);
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [ref]);
    return isInView;
}

export default function About() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef);

    return (
        <section id="about" className="relative py-28 bg-bg-subtle" ref={sectionRef}>
            <div className="max-w-4xl mx-auto px-6">
                {/* Section header */}
                <div className={`text-center mb-16 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <span className="text-text-tertiary text-sm font-medium tracking-widest uppercase">
                        About
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-primary">
                        ティージェーについて
                    </h2>
                </div>

                {/* Profile with image */}
                <div className={`max-w-3xl mx-auto mb-20 transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Profile Image */}
                    <div className="flex justify-center mb-10">
                        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <Image
                                src="/tj.PNG"
                                alt="TJ - 吉田哲司"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>

                    <div className="space-y-6 text-base sm:text-lg text-text-secondary leading-relaxed">
                        <p>
                            AIデジタルクリエイターとして、累計<span className="text-primary font-semibold">500名以上</span>が参加するウェビナーを<span className="text-primary font-semibold">50回以上</span>開催。
                            ChatGPTやMidjourney等のAIツールを駆使したクリエイティブワークを得意とし、
                            AquaBit LABとして絵本制作やLINEスタンプデザインなどを手掛けています。
                        </p>
                        <p>
                            <span className="text-primary font-semibold">25年以上</span>の経験を持つダイビングのプロフェッショナルとして、
                            世界最大のダイビング指導団体PADIの<span className="text-primary font-semibold">コースディレクター</span>を務めています。
                            <span className="text-primary font-semibold">1,500名</span>を超える認定ダイバーの育成実績があり、
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
                    <h3 className="text-xl font-bold text-center mb-12 text-primary">
                        キャリアタイムライン
                    </h3>
                    <div className="relative max-w-2xl mx-auto">
                        {/* Timeline line */}
                        <div className="absolute left-0 sm:left-1/2 top-0 bottom-0 w-px bg-border" />

                        {timeline.map((item, i) => (
                            <div
                                key={i}
                                className={`relative flex items-start mb-10 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    } ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                {/* Content card */}
                                <div className={`ml-8 sm:ml-0 sm:w-[calc(50%-24px)] ${i % 2 === 0 ? 'sm:pr-6 sm:text-right' : 'sm:pl-6'}`}>
                                    <span className="text-accent text-sm font-semibold">
                                        {item.year}
                                    </span>
                                    <h4 className="text-base font-bold text-primary mt-1">
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Timeline dot */}
                                <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 w-3 h-3 bg-accent rounded-full -ml-[5px] sm:ml-0 mt-1.5" />

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
