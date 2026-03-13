"use client";

import { useState } from "react";
import Link from "next/link";

export default function AIContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        category: "",
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
            const res = await fetch("/api/contact/ai", {
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
                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        トップに戻る
                    </Link>
                    <span className="text-xs text-text-tertiary">AquaBit LAB</span>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* タイトル */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-accent-subtle text-accent px-4 py-1.5 rounded-full text-xs font-medium mb-4">
                        <span>✨</span> ウェビナー / AI事業
                    </div>
                    <h1 className="text-3xl font-bold text-primary mb-3">
                        AI事業 お問い合わせ
                    </h1>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        ChatGPT・AI活用ウェビナーの開催依頼、デジタルクリエイション、<br className="hidden sm:block" />
                        Webサイト制作などのご相談はこちらからお気軽にどうぞ。
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
                            className="text-accent text-sm hover:underline"
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
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
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
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                            />
                        </div>

                        {/* 会社名 */}
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-primary mb-2">
                                会社名・団体名
                            </label>
                            <input
                                id="company"
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="株式会社〇〇（個人の場合は空欄可）"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
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
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none"
                            >
                                <option value="">選択してください</option>
                                <option value="ウェビナー開催依頼">ウェビナー開催依頼</option>
                                <option value="AI活用コンサルティング">AI活用コンサルティング</option>
                                <option value="Webサイト制作">Webサイト制作</option>
                                <option value="デジタルクリエイション">デジタルクリエイション</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>

                        {/* お問い合わせ内容 */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
                                お問い合わせ内容 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                required
                                rows={6}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="ご希望の内容、日程、予算感などお気軽にご記入ください。"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-subtle text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
                            />
                        </div>

                        {/* 送信ボタン */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-xl bg-accent text-white font-medium text-sm transition-all duration-300 hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "送信中..." : "お問い合わせを送信"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
