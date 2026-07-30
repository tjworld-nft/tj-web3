"use client";

import Image from "next/image";
import type { SanityBook } from "@/sanity/lib/types";
import { urlFor } from "@/sanity/lib/image";
import { useInView } from "./useInView";

// フォールバック用のハードコードデータ（Sanityにデータがない場合に使用）
const fallbackBooks = [
    {
        _id: "fb-1",
        title: "ダイビングのはじめ方",
        subtitle: "「私にはムリ・・」から「潜りたい」に変わる",
        image: null,
        localImage: "/books/start-diving.png",
        link: "https://amzn.to/40BBpqn",
    },
    {
        _id: "fb-2",
        title: "はじめてのセルフダイビング",
        subtitle: "いつもの海がもっと輝き出す！自由と安全を楽しむための第一歩",
        image: null,
        localImage: "/books/self-diving.png",
        link: "https://amzn.to/4003YO7",
    },
    {
        _id: "fb-3",
        title: "今日から始めるごきげんスノーケリング",
        subtitle: "プロが教える安心安全テクニック＆おすすめスポットガイド",
        image: null,
        localImage: "/books/snorkel.png",
        link: "https://amzn.to/44ToUbh",
    },
    {
        _id: "fb-4",
        title: "60代からのダイビング入門",
        subtitle: "海に一歩、人生にひと花 —「年だから」と言わない",
        image: null,
        localImage: "/books/senior-diver.png",
        link: "https://amzn.to/40z9qaN",
    },
    {
        _id: "fb-5",
        title: "AIは、あなたの「魔法の杖」",
        subtitle: "知識ゼロ・パソコン苦手でも大丈夫！今日から使えるAI超入門",
        image: null,
        localImage: "/books/ai.png",
        link: "https://amzn.to/45TGvBY",
    },
    {
        _id: "fb-6",
        title: "はじめてのSUP",
        subtitle: "ドキドキの初体験からワンちゃんとの水上散歩まで",
        image: null,
        localImage: "/books/sup.png",
        link: "https://amzn.to/3TSlwYL",
    },
    {
        _id: "fb-7",
        title: "やさしいシーカヤック入門",
        subtitle: "大切な人と、海の上で過ごす時間",
        image: null,
        localImage: "/books/kayac.png",
        link: "https://amzn.to/4nxWYCa",
    },
    {
        _id: "fb-8",
        title: "マリンアクティビティ完全ガイド",
        subtitle: "親子で楽しむ！プロが教える海の遊び方",
        image: null,
        localImage: "/books/marine.png",
        link: "https://amzn.to/44LzvpB",
    },
    {
        _id: "fb-9",
        title: "ブランクダイバー復活ガイド",
        subtitle: "半年以上潜っていない人のためのReActivate完全ロードマップ",
        image: null,
        localImage: "/books/brank-diver.png",
        link: "https://amzn.to/44eH3kD",
    },
    {
        _id: "fb-10",
        title: "水中で学ぶマインドフルネス",
        subtitle: "Amazonスポーツの売れ筋ランキング1位獲得",
        image: null,
        localImage: "/books/maindfulness.png",
        link: "https://amzn.to/3I9PdlI",
        badge: "Amazon 1位",
    },
    {
        _id: "fb-11",
        title: "うみがめになったぜん君の大冒険",
        subtitle: "Amazon AI絵本ランキング2位獲得。海を守る小さな勇者の物語",
        image: null,
        localImage: "/books/zenkun.png",
        link: "https://amzn.to/4ny1P6k",
        badge: "Amazon 2位",
    },
    {
        _id: "fb-12",
        title: "おかしだいすき みーちゃん",
        subtitle: "AI絵本。Kindle Unlimitedで読み放題",
        image: null,
        localImage: "/books/mi-chan.png",
        link: "https://amzn.to/3TmIyqI",
    },
];

type BookItem = SanityBook & { localImage?: string };

interface BooksProps {
    books?: SanityBook[];
}

export default function Books({ books }: BooksProps) {
    const { ref, isInView } = useInView(0.05);

    // Sanityデータがあればそちらを使い、なければフォールバック
    const displayBooks: BookItem[] = books && books.length > 0 ? books : fallbackBooks;

    return (
        <section id="books" className="section-veil relative py-28" ref={ref}>
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div
                    className={`mb-16 text-center transition-all duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <span className="eyebrow">Books</span>
                    <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl">
                        著書一覧
                    </h2>
                    <p className="mt-3 text-text-secondary">
                        ダイビング・マリンスポーツからAIまで。Kindle Unlimitedで読み放題の書籍も。
                    </p>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {displayBooks.map((book, i) => (
                        <a
                            key={book._id}
                            href={book.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group transition-all duration-500 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                }`}
                            style={{ transitionDelay: `${i * 50}ms` }}
                        >
                            <div className="hover-lift relative aspect-3/4 overflow-hidden rounded-xl border border-border bg-bg-muted">
                                <Image
                                    src={
                                        book.image
                                            ? urlFor(book.image).width(300).height(400).url()
                                            : (book as BookItem).localImage || ""
                                    }
                                    alt={book.title}
                                    fill
                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#03070f]/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                {book.badge && (
                                    <div className="absolute top-2 left-2 rounded-md bg-gradient-to-r from-marine to-accent px-2 py-1 text-xs font-bold text-[#02121b]">
                                        {book.badge}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3">
                                <h4 className="line-clamp-2 text-sm leading-tight font-bold text-primary transition-colors group-hover:text-marine">
                                    {book.title}
                                </h4>
                                <p className="mt-1 line-clamp-2 text-xs leading-snug text-text-tertiary">
                                    {book.subtitle}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
