import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "利用規約 | TJ",
    description: "TJ（AquaBit LAB / 三浦海の学校）の利用規約です。",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-bg-subtle">
            <header className="bg-white border-b border-border">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        トップに戻る
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-primary mb-8">利用規約</h1>

                <div className="bg-white border border-border rounded-2xl p-8 space-y-8 text-sm text-text-secondary leading-relaxed">
                    <p>
                        この利用規約（以下「本規約」）は、TJ（以下「当方」）が提供するウェブサイトおよび
                        各種サービス（以下「本サービス」）の利用条件を定めるものです。
                        本サービスをご利用いただくにあたり、本規約に同意したものとみなします。
                    </p>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">第1条（適用範囲）</h2>
                        <p>
                            本規約は、当方が提供するすべてのサービス（ウェビナー、マリンアクティビティ、
                            デジタルコンテンツ、ウェブサイト制作等）に適用されます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">第2条（サービス内容）</h2>
                        <p>当方は、以下のサービスを提供しています。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>ChatGPT・AI活用ウェビナーの開催</li>
                            <li>ダイビング講習・体験ダイビング・各種マリンアクティビティ</li>
                            <li>デジタルクリエイション・Webサイト制作</li>
                            <li>その他、当方が提供するサービス</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">第3条（禁止事項）</h2>
                        <p>ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>法令または公序良俗に違反する行為</li>
                            <li>当方または第三者の知的財産権、プライバシー、名誉等を侵害する行為</li>
                            <li>サービスの運営を妨害する行為</li>
                            <li>虚偽の情報を提供する行為</li>
                            <li>当方のコンテンツを無断で複製、転載、再配布する行為</li>
                            <li>その他、当方が不適切と判断する行為</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">第4条（知的財産権）</h2>
                        <p>
                            本サイトおよび本サービスに関するコンテンツ（テキスト、画像、動画、音声、プログラム等）の
                            知的財産権は、当方または正当な権利者に帰属します。
                            ユーザーは、当方の事前の書面による承諾なく、これらを複製、転載、改変、再配布することはできません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">第5条（免責事項）</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                当方は、本サービスの内容の正確性、完全性、有用性等について保証するものではありません。
                            </li>
                            <li>
                                マリンアクティビティにおいては、自然環境下での活動に伴うリスクがあります。
                                参加者は自身の健康状態を考慮し、自己責任のもとでご参加ください。
                            </li>
                            <li>
                                天候・海況等により、マリンアクティビティの中止または内容変更を行う場合があります。
                            </li>
                            <li>
                                当方は、本サービスの利用により生じた損害について、当方の故意または重大な過失による場合を除き、
                                責任を負いません。
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">第6条（サービスの変更・中止）</h2>
                        <p>
                            当方は、事前の通知なく本サービスの内容を変更、または提供を中止することがあります。
                            これによりユーザーに生じた損害について、当方は責任を負いません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">第7条（規約の変更）</h2>
                        <p>
                            当方は、必要に応じて本規約を変更することがあります。
                            変更後の規約は、本サイトに掲載した時点から効力を生じるものとします。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">第8条（準拠法・管轄）</h2>
                        <p>
                            本規約の解釈にあたっては日本法を準拠法とします。
                            本サービスに関して紛争が生じた場合は、横浜地方裁判所を第一審の専属的合意管轄裁判所とします。
                        </p>
                    </section>

                    <section className="pt-4 border-t border-border">
                        <p className="text-text-tertiary">制定日：2025年1月1日</p>
                        <p className="text-text-tertiary mt-1">TJ（AquaBit LAB / 三浦海の学校）</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
