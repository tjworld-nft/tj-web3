import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
    try {
        const { name, email, company, category, message } = await request.json();

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
            from: `"AquaBit LAB お問い合わせ" <${process.env.SMTP_USER}>`,
            to: "info@aquabit-lab.com",
            replyTo: email,
            subject: `【お問い合わせ】${category} - ${name}様`,
            text: [
                `お名前: ${name}`,
                `メールアドレス: ${email}`,
                `会社名: ${company || "個人"}`,
                `お問い合わせ種別: ${category}`,
                "",
                "【お問い合わせ内容】",
                message,
            ].join("\n"),
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Contact AI error:", err);
        return NextResponse.json(
            { error: "送信に失敗しました。時間をおいて再度お試しください。" },
            { status: 500 }
        );
    }
}
