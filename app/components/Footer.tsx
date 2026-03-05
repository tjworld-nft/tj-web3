export default function Footer() {
    return (
        <footer className="py-10 border-t border-border">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm font-bold text-primary">TJ</span>

                    <div className="flex flex-wrap justify-center gap-6 text-sm text-text-tertiary">
                        <a
                            href="https://tj-web3.com/privacy-policy"
                            className="hover:text-text transition-colors"
                        >
                            プライバシーポリシー
                        </a>
                        <a
                            href="https://tj-web3.com/tokusyoho"
                            className="hover:text-text transition-colors"
                        >
                            特定商取引法
                        </a>
                        <a
                            href="https://tj-web3.com/tandc"
                            className="hover:text-text transition-colors"
                        >
                            利用規約
                        </a>
                    </div>

                    <div className="text-xs text-text-tertiary">
                        © {new Date().getFullYear()} TJ
                    </div>
                </div>
            </div>
        </footer>
    );
}
