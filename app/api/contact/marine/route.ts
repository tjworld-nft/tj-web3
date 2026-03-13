import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const { name, email, phone, category, date, people, message } =
            await request.json();

        if (!name || !email || !category || !message) {
            return NextResponse.json(
                { error: "必須項目が入力されていません" },
                { status: 400 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: "sv8718.xserver.jp",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"三浦海の学校 お問い合わせ" <${process.env.SMTP_USER}>`,
            to: "info@miura-diving.com",
            replyTo: email,
            subject: `【お問い合わせ】${category} - ${name}様`,
            text: [
                `お名前: ${name}`,
                `メールアドレス: ${email}`,
                `電話番号: ${phone || "未入力"}`,
                `お問い合わせ種別: ${category}`,
                `ご希望日: ${date || "未定"}`,
                `参加人数: ${people || "未定"}`,
                "",
                "【お問い合わせ内容】",
                message,
            ].join("\n"),
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Contact Marine error:", err);
        return NextResponse.json(
            { error: "送信に失敗しました。時間をおいて再度お試しください。" },
            { status: 500 }
        );
    }
}
