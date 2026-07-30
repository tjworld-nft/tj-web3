const legalLinks = [
    { href: "/privacy-policy", label: "プライバシーポリシー" },
    { href: "/tokushoho", label: "特定商取引法" },
    { href: "/terms", label: "利用規約" },
];

const siteLinks = [
    { href: "https://miura-diving.com/", label: "三浦 海の学校" },
    { href: "https://aquabit-lab.com/", label: "AquaBit LAB" },
    { href: "https://tj-music.com/", label: "TJ Music" },
];

export default function Footer() {
    return (
        <footer className="section-veil-solid relative z-10 border-t border-border-light py-12">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <span className="font-display text-lg font-bold text-primary">TJ</span>
                        <p className="mt-2 max-w-xs text-xs leading-relaxed text-text-tertiary">
                            海とAIで、未来を創る。
                            <br />
                            PADIコースディレクター × AIデジタルクリエイター
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 text-sm sm:items-end">
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-text-tertiary sm:justify-end">
                            {siteLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-colors hover:text-marine"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-text-tertiary sm:justify-end">
                            {legalLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="transition-colors hover:text-text"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rule-glow mt-9" />

                <div className="mt-5 text-xs text-text-tertiary">
                    © {new Date().getFullYear()} TJ / AquaBit LAB
                </div>
            </div>
        </footer>
    );
}
