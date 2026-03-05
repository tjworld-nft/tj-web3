"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;
            color: string;

            constructor(canvasWidth: number, canvasHeight: number) {
                this.x = Math.random() * canvasWidth;
                this.y = Math.random() * canvasHeight;
                this.size = Math.random() * 3 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = -(Math.random() * 0.5 + 0.1);
                this.opacity = Math.random() * 0.5 + 0.1;
                this.color =
                    Math.random() > 0.5
                        ? `rgba(0, 212, 255, ${this.opacity})`
                        : `rgba(14, 165, 233, ${this.opacity})`;
            }

            update(canvasWidth: number, canvasHeight: number) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.y < -10) {
                    this.y = canvasHeight + 10;
                    this.x = Math.random() * canvasWidth;
                }
                if (this.x < -10) this.x = canvasWidth + 10;
                if (this.x > canvasWidth + 10) this.x = -10;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            resize();
            const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
            particles = Array.from(
                { length: count },
                () => new Particle(canvas.width, canvas.height)
            );
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.update(canvas.width, canvas.height);
                p.draw(ctx);
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.05 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        init();
        animate();

        window.addEventListener("resize", () => {
            resize();
        });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    );
}
