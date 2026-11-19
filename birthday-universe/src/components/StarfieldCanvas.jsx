import React, { useEffect, useRef } from 'react';

export default function StarfieldCanvas({ isHyperspace = false, intensity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars & celestial particles
    const starCount = Math.min(180, Math.floor((width * height) / 8000));
    const stars = [];
    const colors = ['#ffffff', '#ffe4e6', '#fecdd3', '#f43f5e', '#fbbf24', '#fda4af'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.3,
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleSpeed: Math.random() * 0.03 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
      });
    }

    // Floating Romantic Rose Petals
    const petalCount = 20;
    const petals = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 6,
        alpha: Math.random() * 0.45 + 0.2,
        vx: Math.random() * 0.8 - 0.2,
        vy: Math.random() * 0.9 + 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        color: Math.random() > 0.4 ? '#f43f5e' : '#e11d48',
      });
    }

    // Interactive Floating Hearts spawned on click or movement
    const floatingHearts = [];

    const handleWindowClick = (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      for (let i = 0; i < 6; i++) {
        floatingHearts.push({
          x: clickX + (Math.random() - 0.5) * 20,
          y: clickY + (Math.random() - 0.5) * 20,
          size: Math.random() * 12 + 10,
          alpha: 1,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -Math.random() * 2.5 - 1.5,
          color: Math.random() > 0.3 ? '#f43f5e' : '#fb7185',
        });
      }
    };

    window.addEventListener('click', handleWindowClick);

    // Shooting stars
    const shootingStars = [];
    const spawnShootingStar = () => {
      if (shootingStars.length < 2 && Math.random() < 0.015) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.3,
          length: Math.random() * 120 + 80,
          speed: Math.random() * 12 + 10,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
          opacity: 1,
          decay: Math.random() * 0.02 + 0.012,
        });
      }
    };

    // Draw heart helper
    const drawHeart = (x, y, size, color, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // Top left curve
      ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, topCurveHeight / 3, 0, size);
      // Top right curve
      ctx.bezierCurveTo(size, topCurveHeight / 3, size / 2, -topCurveHeight, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw rose petal helper
    const drawPetal = (p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Animation Loop
    let lastTime = performance.now();
    const render = (time) => {
      lastTime = time;

      // Dark romantic background with deep burgundy/midnight glow
      ctx.fillStyle = '#050209';
      ctx.fillRect(0, 0, width, height);

      // Deep romantic nebula glows
      const grad1 = ctx.createRadialGradient(
        width * 0.25,
        height * 0.3,
        20,
        width * 0.25,
        height * 0.3,
        width * 0.6
      );
      grad1.addColorStop(0, 'rgba(159, 18, 57, 0.16)');
      grad1.addColorStop(0.6, 'rgba(76, 5, 25, 0.06)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.75,
        height * 0.7,
        20,
        width * 0.75,
        height * 0.7,
        width * 0.55
      );
      grad2.addColorStop(0, 'rgba(88, 28, 135, 0.12)');
      grad2.addColorStop(0.5, 'rgba(190, 24, 93, 0.08)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Draw and update stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (isHyperspace) {
          const cx = width / 2;
          const cy = height / 2;
          const dx = star.x - cx;
          const dy = star.y - cy;
          star.x += (dx * 0.05 + 0.1) * star.z;
          star.y += (dy * 0.05 + 0.1) * star.z;

          ctx.strokeStyle = '#fecdd3';
          ctx.lineWidth = star.radius * 1.5;
          ctx.beginPath();
          ctx.moveTo(star.x - dx * 0.15, star.y - dy * 0.15);
          ctx.lineTo(star.x, star.y);
          ctx.stroke();

          if (star.x < 0 || star.x > width || star.y < 0 || star.y > height) {
            star.x = cx + (Math.random() - 0.5) * 100;
            star.y = cy + (Math.random() - 0.5) * 100;
          }
        } else {
          star.twinklePhase += star.twinkleSpeed;
          star.alpha =
            star.baseAlpha + Math.sin(star.twinklePhase) * (star.baseAlpha * 0.5);

          star.x += star.vx;
          star.y += star.vy;

          if (star.x < 0) star.x = width;
          if (star.x > width) star.x = 0;
          if (star.y < 0) star.y = height;
          if (star.y > height) star.y = 0;

          ctx.save();
          ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha * intensity));
          if (star.radius > 1.3) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = star.color;
          }
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw floating rose petals
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.x += p.vx + Math.sin(time * 0.001 + i) * 0.3;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        drawPetal(p);
      }

      // Handle shooting stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        ctx.save();
        ctx.globalAlpha = s.opacity;

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, 'rgba(244, 63, 94, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.restore();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= s.decay;

        if (s.opacity <= 0 || s.x > width + 200 || s.y > height + 200) {
          shootingStars.splice(i, 1);
        }
      }

      // Handle interactive floating hearts on click
      for (let i = floatingHearts.length - 1; i >= 0; i--) {
        const h = floatingHearts[i];
        drawHeart(h.x, h.y, h.size, h.color, h.alpha);
        h.x += h.vx;
        h.y += h.vy;
        h.alpha -= 0.018;
        h.size *= 0.985;

        if (h.alpha <= 0) {
          floatingHearts.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleWindowClick);
    };
  }, [isHyperspace, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.98 }}
    />
  );
}
