import Image from "next/image";
import type { Work } from "@/app/content";
import LogVideo from "./LogVideo";

/** 作品を「ダイブログ」の体裁で見せるカード（LOG番号・水深・日付・一緒に潜った道具） */
export default function LogCard({
    work,
    no,
    className = "",
    wide = false,
    priority = false,
}: {
    work: Work;
    no: number;
    className?: string;
    wide?: boolean;
    priority?: boolean;
}) {
    const external = /^https?:/.test(work.href);
    const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
    return (
        <article className={`log rv ${wide ? "log--wide" : ""} ${className}`}>
            <a
                href={work.href}
                className="log__media"
                style={{ "--ratio": work.ratio ?? "16 / 10" } as React.CSSProperties}
                aria-label={`${work.title}（${work.linkLabel}）`}
                {...linkProps}
            >
                <Image
                    src={work.image}
                    alt={work.imageAlt}
                    fill
                    sizes={wide ? "(max-width: 760px) 92vw, 58vw" : "(max-width: 620px) 92vw, (max-width: 980px) 46vw, 36vw"}
                    priority={priority}
                />
                {work.video && <LogVideo src={work.video} />}
                {work.icon && (
                    <Image className="log__icon" src={work.icon} alt="" width={58} height={58} />
                )}
            </a>
            <div className="log__body">
                <div className="log__meta" aria-label="ログ">
                    <span>
                        LOG <b>{String(no).padStart(2, "0")}</b>
                    </span>
                    <span>
                        DEPTH <b>{work.depth}</b>
                    </span>
                    <span>{work.date}</span>
                </div>
                <h3 className="log__title">{work.title}</h3>
                <p className="log__kind">{work.kind}</p>
                <p className="log__text">{work.body}</p>
                <dl className="log__buddy">
                    <dt>BUDDY</dt>
                    <dd>{work.buddy.join(" · ")}</dd>
                </dl>
                <div className="log__links">
                    <a className="log__link" href={work.href} {...linkProps}>
                        {work.linkLabel} <span aria-hidden="true">→</span>
                    </a>
                    {work.extra?.map((x) => (
                        <a
                            key={x.href}
                            className="log__link log__link--sub"
                            href={x.href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {x.label}
                        </a>
                    ))}
                </div>
            </div>
        </article>
    );
}
