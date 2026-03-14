import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "特定商取引法に基づく表記 | TJ",
    description: "TJ（AquaBit LAB / 三浦海の学校）の特定商取引法に基づく表記です。",
};

export default function TokushohoPage() {
    const items = [
        { label: "販売事業者", value: "TJ（吉田哲司）" },
        { label: "運営責任者", value: "吉田哲司" },
        { label: "所在地", value: "請求があった際に遅滞なく開示いたします" },
        { label: "電話番号", value: "請求があった際に遅滞なく開示いたします" },
        { label: "メールアドレス", value: "LINE公式アカウントよりお問い合わせください" },
        { label: "販売URL", value: "https://tj-web3.com" },
        {
            label: "販売価格",
            value: "各サービスページに記載の料金に準じます（税込表示）",
        },
        {
            label: "商品代金以外の必要料金",
            value: "インターネット接続料金、通信料金等はお客様のご負担となります",
        },
        {
            label: "お支払い方法",
            value: "銀行振込、各種電子決済（サービスにより異なります）",
        },
        {
            label: "お支払い時期",
            value: "サービスお申し込み時、または当方が指定する期日までにお支払いください",
        },
        {
            label: "商品の引き渡し時期",
            value: "ウェビナー：開催日当日 / マリンアクティビティ：予約日当日 / デジタルコンテンツ：決済確認後速やかに提供",
        },
        {
            label: "返品・キャンセルについて",
            value: "ウェビナー：開催3日前までのキャンセルは全額返金。それ以降のキャンセルは返金不可。\nマリンアクティビティ：開催3日前までのキャンセルは全額返金。前日・当日のキャンセルは料金の100%をキャンセル料としていただきます。天候等によりやむを得ず中止となった場合は全額返金または日程変更にて対応いたします。\nデジタルコンテンツ：その性質上、提供後の返品・返金はお受けできません。",
        },
        {
            label: "動作環境",
            value: "オンラインサービスをご利用の場合、インターネット環境およびZoom等のビデオ会議ツールが必要です",
        },
    ];

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
                <h1 className="text-3xl font-bold text-primary mb-8">特定商取引法に基づく表記</h1>

                <div className="bg-white border border-border rounded-2xl overflow-hidden">
                    {items.map((item, i) => (
                        <div
                            key={item.label}
                            className={`flex flex-col sm:flex-row ${i !== items.length - 1 ? "border-b border-border" : ""}`}
                        >
                            <div className="sm:w-48 flex-shrink-0 bg-bg-subtle px-6 py-4 text-sm font-medium text-primary">
                                {item.label}
                            </div>
                            <div className="px-6 py-4 text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
