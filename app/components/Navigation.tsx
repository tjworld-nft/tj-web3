"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const navItems = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Works", href: "#works" },
    { label: "Books", href: "#books" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
];

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            const scrollable =
                document.documentElement.scrollHeight - window.innerHeight;
            setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);

            const sections = navItems.map((item) => item.href.replace("#", ""));
            for (const section of sections.reverse()) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 150) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleNavClick = (href: string) => {
        setIsMobileMenuOpen(false);
        const el = document.querySelector(href);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${isScrolled
                ? "border-b border-border-light bg-[#03070f]/72 py-3 backdrop-blur-xl"
                : "border-b border-transparent bg-transparent py-6"
                }`}
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
                {/* Logo */}
                <a
                    href="#hero"
                    onClick={(e) => {
                        e.preventDefault();
                        handleNavClick("#hero");
                    }}
                    className="group flex items-center gap-2.5 text-xl font-bold tracking-tight text-primary"
                >
                    <span className="relative h-8 w-8 overflow-hidden rounded-full border border-border ring-1 ring-marine/0 transition-all duration-500 group-hover:ring-marine/60">
                        <Image
                            src="/tj.PNG"
                            alt="TJ"
                            fill
                            sizes="32px"
                            className="object-cover"
                        />
                    </span>
                    <span className="font-display">TJ</span>
                </a>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.href);
                            }}
                            className={`font-display rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${activeSection === item.href.replace("#", "")
                                ? "bg-marine-subtle text-marine"
                                : "text-text-secondary hover:bg-bg-muted hover:text-text"
                                }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="relative flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
                    aria-label="メニュー"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span
                        className={`h-0.5 w-5 bg-text transition-all duration-300 ${isMobileMenuOpen ? "translate-y-2 rotate-45" : ""
                            }`}
                    />
                    <span
                        className={`h-0.5 w-5 bg-text transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                            }`}
                    />
                    <span
                        className={`h-0.5 w-5 bg-text transition-all duration-300 ${isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                            }`}
                    />
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`overflow-hidden transition-all duration-500 md:hidden ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="glass-strong mx-4 mt-4 flex flex-col gap-1 rounded-2xl p-4">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.href);
                            }}
                            className={`font-display rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${activeSection === item.href.replace("#", "")
                                ? "bg-marine-subtle text-marine"
                                : "text-text-secondary hover:bg-bg-muted hover:text-text"
                                }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Scroll progress */}
            <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-px origin-left bg-gradient-to-r from-marine to-accent transition-transform duration-150 ease-out"
                style={{ width: "100%", transform: `scaleX(${progress})` }}
            />
        </nav>
    );
}
