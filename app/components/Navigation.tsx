"use client";

import { useState, useEffect } from "react";

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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

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

        window.addEventListener("scroll", handleScroll);
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
                : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <a
                    href="#hero"
                    onClick={(e) => {
                        e.preventDefault();
                        handleNavClick("#hero");
                    }}
                    className="text-xl font-bold tracking-tight text-primary"
                >
                    TJ
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.href);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeSection === item.href.replace("#", "")
                                ? "text-accent bg-accent-subtle"
                                : "text-text-secondary hover:text-text hover:bg-bg-muted"
                                }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
                    aria-label="メニュー"
                >
                    <span
                        className={`w-5 h-0.5 bg-primary transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                            }`}
                    />
                    <span
                        className={`w-5 h-0.5 bg-primary transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                            }`}
                    />
                    <span
                        className={`w-5 h-0.5 bg-primary transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                            }`}
                    />
                </button>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden transition-all duration-500 overflow-hidden ${isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="bg-white shadow-lg mx-4 mt-4 rounded-2xl p-4 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.href);
                            }}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeSection === item.href.replace("#", "")
                                ? "text-accent bg-accent-subtle"
                                : "text-text-secondary hover:text-text hover:bg-bg-muted"
                                }`}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
}
