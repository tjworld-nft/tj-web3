import DiveWorld from "./components/dive/DiveWorld";
import DiveComputer from "./components/dive/DiveComputer";
import DepthRail from "./components/dive/DepthRail";
import TopBar from "./components/dive/TopBar";
import Hero from "./components/sections/Hero";
import Profile from "./components/sections/Profile";
import Marine from "./components/sections/Marine";
import Limit from "./components/sections/Limit";
import Words from "./components/sections/Words";
import Library from "./components/sections/Library";
import Abyss from "./components/sections/Abyss";
import Footer from "./components/Footer";

/**
 * ページ全体が一本のダイビング。水面から潜り始め、40mを越えるとAI（言葉の海）へ。
 * 各セクションの data-depth がその場所の水深（背景の色・HUDの表示はここから決まる）。
 */
export default function Home() {
    return (
        <>
            <a className="skip-link" href="#profile">
                本文へスキップ
            </a>
            <DiveWorld />
            <TopBar />
            <DepthRail />
            <DiveComputer />
            <main className="page">
                <Hero />
                <Profile />
                <Marine />
                <Limit />
                <Words />
                <Library />
                <Abyss />
            </main>
            <Footer />
        </>
    );
}
