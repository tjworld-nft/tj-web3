import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "プライバシーポリシー | TJ",
    description: "TJ（AquaBit LAB / 三浦海の学校）のプライバシーポリシーです。",
};

export default function PrivacyPolicyPage() {
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
                <h1 className="text-3xl font-bold text-primary mb-8">プライバシーポリシー</h1>

                <div className="bg-white border border-border rounded-2xl p-8 space-y-8 text-sm text-text-secondary leading-relaxed">
                    <p>
                        TJ（以下「当方」）は、当方が運営するウェブサイト（以下「本サイト」）において、
                        ユーザーの個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
                    </p>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">1. 収集する情報</h2>
                        <p>当方は、以下の情報を収集することがあります。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>氏名</li>
                            <li>メールアドレス</li>
                            <li>電話番号</li>
                            <li>その他、お問い合わせ時にご提供いただく情報</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">2. 利用目的</h2>
                        <p>収集した個人情報は、以下の目的で利用いたします。</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>サービスの提供・運営</li>
                            <li>お問い合わせへの対応</li>
                            <li>ウェビナー・イベントのご案内</li>
                            <li>マリンアクティビティの予約・連絡</li>
                            <li>サービス改善のための分析</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">3. 第三者提供</h2>
                        <p>
                            当方は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">4. 個人情報の管理</h2>
                        <p>
                            当方は、個人情報の正確性および安全性を確保するため、セキュリティ対策を講じ、
                            個人情報の漏洩、滅失、毀損の防止に努めます。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">5. Cookie（クッキー）について</h2>
                        <p>
                            本サイトでは、ユーザー体験の向上やアクセス解析のためにCookieを使用する場合があります。
                            ブラウザの設定によりCookieを無効にすることが可能ですが、一部の機能が利用できなくなる場合があります。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">6. アクセス解析ツール</h2>
                        <p>
                            本サイトでは、Googleアナリティクス等のアクセス解析ツールを使用する場合があります。
                            これらのツールはCookieを使用してデータを収集しますが、個人を特定する情報は含まれません。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">7. 個人情報の開示・訂正・削除</h2>
                        <p>
                            ユーザーは、当方が保有する自身の個人情報について、開示・訂正・削除を請求することができます。
                            ご希望の場合は、LINE公式アカウントよりご連絡ください。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-primary mb-3">8. プライバシーポリシーの変更</h2>
                        <p>
                            当方は、必要に応じて本ポリシーを変更することがあります。
                            変更後のプライバシーポリシーは、本サイトに掲載した時点から効力を生じるものとします。
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
