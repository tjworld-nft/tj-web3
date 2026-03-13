"use client";

import { useState } from "react";
import Link from "next/link";

export default function MarineContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        category: "",
        date: "",
        people: "",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/contact/marine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "送信に失敗しました");
            }

            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "送信に失敗しました。時間をおいて再度お試しください。");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-subtle">
            {/* Header */}
            <header className="bg-white border-b border-border">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-marine transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        トップに戻る
                    </Link>
                    <span className="text-xs text-text-tertiary">三浦海の学校</span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* タイトル */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-marine-subtle text-marine px-4 py-1.5 rounded-full text-xs font-medium mb-4">
                        <span>🌊</span> マリンアクティビティ
                    </div>
                    <h1 className="text-3xl font-bold text-primary mb-3">
                        マリン事業 お問い合わせ
                    </h1>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        ダイビング講習・体験ダイビング、SUP、シーカヤックなど<br className="hidden sm:block" />
                        マリンスポーツのご予約・お問い合わせはこちらからどうぞ。
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="bg-white border border-border rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-xl font-bold text-primary mb-3">送信完了</h2>
                        <p className="text-text-secondary text-sm mb-6">
                            お問い合わせありがとうございます。<br />
                            内容を確認のうえ、折り返しご連絡いたします。
                        </p>
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-marine text-sm hover:underline"
                        >
                            フォームに戻る
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}
                        {/* お名前 */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                                お名前 <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="山田 太郎"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-marine/30 focus:border-marine transition-all"
                            />
                        </div>

                        {/* メールアドレス */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                                メールアドレス <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="example@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-marine/30 focus:border-marine transition-all"
                            />
                        </div>

                        {/* 電話番号 */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                                電話番号
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="090-1234-5678"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-marine/30 focus:border-marine transition-all"
                            />
                        </div>

                        {/* お問い合わせ種別 */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-primary mb-2">
                                お問い合わせ種別 <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-marine/30 focus:border-marine transition-all appearance-none"
                            >
                                <option value="">選択してください</option>
                                <option value="体験ダイビング">体験ダイビング</option>
                                <option value="ダイビングライセンス取得">ダイビングライセンス取得</option>
                                <option value="ファンダイビング">ファンダイビング</option>
                                <option value="SUP">SUP</option>
                                <option value="シーカヤック">シーカヤック</option>
                                <option value="スノーケリング">スノーケリング</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>

                        {/* ご希望日・参加人数 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-primary mb-2">
                                    ご希望日
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-marine/30 focus:border-marine transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="people" className="block text-sm font-medium text-primary mb-2">
                                    参加人数
                                </label>
                                <select
                                    id="people"
                                    value={formData.people}
                                    onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-marine/30 focus:border-marine transition-all appearance-none"
                                >
                                    <option value="">選択</option>
                                    <option value="1名">1名</option>
                                    <option value="2名">2名</option>
                                    <option value="3名">3名</option>
                                    <option value="4名">4名</option>
                                    <option value="5名以上">5名以上</option>
                                </select>
                            </div>
                        </div>

                        {/* お問い合わせ内容 */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
                                お問い合わせ内容 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                required
                                rows={5}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="ご希望のアクティビティ、経験レベル、ご質問などお気軽にご記入ください。"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-marine/30 focus:border-marine transition-all resize-none"
                            />
                        </div>

                        {/* 送信ボタン */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl bg-marine text-white font-medium text-sm transition-all duration-300 hover:bg-marine-light hover:shadow-lg hover:shadow-marine/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "送信中..." : "お問い合わせを送信"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
