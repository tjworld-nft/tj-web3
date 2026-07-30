"use client";

import Image from "next/image";
import { useInView } from "./useInView";

const LINE_ICON_PATH =
    "M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314";

export default function Contact() {
    const { ref, isInView } = useInView(0.1);

    return (
        <section id="contact" className="relative py-28" ref={ref}>
            <div className="mx-auto max-w-4xl px-6">
                {/* Section header */}
                <div
                    className={`mb-14 text-center transition-all duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <span className="eyebrow">Contact</span>
                    <h2 className="mt-4 text-3xl font-bold text-primary sm:text-4xl">
                        お問い合わせ
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-text-secondary">
                        LINE公式アカウントからお気軽にお問い合わせください。
                    </p>
                </div>

                {/* LINE公式アカウント */}
                <div
                    className={`transition-all delay-300 duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        }`}
                >
                    <div className="glass-strong glass-sheen relative overflow-hidden rounded-3xl p-8 text-center sm:p-10">
                        {/* LINE グリーンのグロー */}
                        <div
                            className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
                            style={{
                                background:
                                    "radial-gradient(circle, rgba(6,199,85,0.45), transparent 70%)",
                            }}
                        />

                        <div className="relative flex flex-col items-center justify-center gap-8 sm:flex-row">
                            {/* QR Code */}
                            <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl bg-white p-2 shadow-[0_18px_50px_-18px_rgba(6,199,85,0.6)] sm:h-48 sm:w-48">
                                <Image
                                    src="/line-qr.png"
                                    alt="LINE公式アカウント QRコード"
                                    fill
                                    sizes="(max-width: 640px) 160px, 192px"
                                    className="object-contain p-1"
                                />
                            </div>

                            {/* LINE Info */}
                            <div className="text-center sm:text-left">
                                <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
                                    <svg
                                        className="h-8 w-8"
                                        viewBox="0 0 24 24"
                                        fill="#06C755"
                                        aria-hidden="true"
                                    >
                                        <path d={LINE_ICON_PATH} />
                                    </svg>
                                    <h3 className="text-xl font-bold text-[#3ce07f]">
                                        LINE公式アカウント
                                    </h3>
                                </div>
                                <p className="mb-6 max-w-sm text-sm leading-relaxed text-text-secondary">
                                    最新のウェビナー情報やマリンアクティビティの
                                    お知らせをお届けします。お気軽にご登録ください！
                                </p>
                                <a
                                    href="https://lin.ee/obePsOF"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#06C755] px-6 py-3 text-sm font-semibold text-[#04240f] shadow-[0_12px_34px_-12px_rgba(6,199,85,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0ade63]"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d={LINE_ICON_PATH} />
                                    </svg>
                                    友だち追加する
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
