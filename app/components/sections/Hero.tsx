/**
 * 水面。見出しの三行目「深く潜る。」が水面をまたぐ。
 * 水面より上は HTML の文字、下は GPU が屈折させて描く（DiveWorld / engine）。
 */
export default function Hero() {
    return (
        <section id="surface" className="hero" aria-labelledby="hero-title">
            <div className="wrap">
                <p className="kicker hero__kicker">PADI Course Director × AI Creator</p>
                <h1 id="hero-title" className="hero__title" data-headline>
                    <span className="sr-only">TJ（吉田哲司）— </span>
                    <span className="hero__line">海にも、</span>
                    <span className="hero__line">
                        <span className="hero__ai">AI</span>にも、
                    </span>
                    <span className="hero__line" data-waterline>
                        深く潜る。
                    </span>
                </h1>
                <div className="hero__below veil">
                    <p className="hero__name">
                        TJ<span>吉田 哲司</span>
                    </p>
                    <p className="hero__lead">
                        1997年から、海で人に教えてきた。
                        <br />
                        いまは同じやり方で、AIでもつくり、教えている。
                        <br />
                        PADIコースディレクター ／ AquaBit LAB 代表。
                    </p>
                    <a href="#profile" className="dive-cue">
                        <span className="dive-cue__line" aria-hidden="true" />
                        スクロールで潜降する
                    </a>
                </div>
            </div>
        </section>
    );
}
