import React, { useEffect, useRef } from 'react';

/**
 * Hero3DScene — Interactive 3D Canvas Background
 * Renders small glowing floating bubbles, 3D rotating constellation nodes,
 * connecting neural filaments, and smooth mouse-tracked depth parallax.
 */
const Hero3DScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse coordinates with smooth easing
    let mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Color palette for small glowing bubbles and nodes
    const bubbleColors = [
      { r: 0, g: 240, b: 255, hex: '#00F0FF' },   // Electric Cyan
      { r: 59, g: 130, b: 246, hex: '#3B82F6' },  // Royal Blue
      { r: 168, g: 85, b: 247, hex: '#A855F7' },  // Neon Purple
      { r: 236, g: 72, b: 153, hex: '#EC4899' },  // Neon Pink
      { r: 251, g: 191, b: 36, hex: '#FBBF24' },  // Amber Glow
    ];

    // ==========================================
    // 1. SMALL FLOATING BUBBLES (Ambient Particles)
    // ==========================================
    const numBubbles = 65;
    const bubbles = [];
    for (let i = 0; i < numBubbles; i++) {
      const color = bubbleColors[i % bubbleColors.length];
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 50,
        radius: Math.random() * 3.5 + 1.5, // 1.5px to 5px small bubbles
        baseRadius: Math.random() * 3.5 + 1.5,
        speedY: Math.random() * 0.45 + 0.15,
        speedX: (Math.random() - 0.5) * 0.2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulseOffset: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.55 + 0.25,
        color,
      });
    }

    // ==========================================
    // 2. 3D CONSTELLATION NODES (Geodesic Sphere)
    // ==========================================
    const numNodes = 36;
    const sphereRadius = Math.min(width, height) * 0.35;
    const nodes = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden spiral

    for (let i = 0; i < numNodes; i++) {
      const y = 1 - (i / (numNodes - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const color = bubbleColors[i % bubbleColors.length];

      nodes.push({
        origX: x * sphereRadius,
        origY: y * sphereRadius,
        origZ: z * sphereRadius,
        size: Math.random() * 2.5 + 2.5,
        color,
      });
    }

    let angleX = 0;
    let angleY = 0;
    let time = 0;

    // Scroll integration for dynamic 3D depth and warp effect
    let scrollY = window.scrollY || 0;
    let targetScrollY = scrollY;
    let scrollVelocity = 0;
    let lastScrollY = scrollY;

    const handleScroll = () => {
      targetScrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ==========================================
    // RENDER LOOP
    // ==========================================
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      // Smooth scroll interpolation
      scrollY += (targetScrollY - scrollY) * 0.12;
      scrollVelocity = (scrollY - lastScrollY);
      lastScrollY = scrollY;
      const scrollAbsVelocity = Math.min(Math.abs(scrollVelocity), 30);
      const scrollProgress = Math.min(scrollY / 700, 1.5);

      // Mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const tiltX = (mouse.y - height / 2) * 0.0002;
      const tiltY = (mouse.x - width / 2) * 0.0002;

      // Vertical-only scroll momentum
      angleX += 0.0018 + tiltX * 0.15 + scrollVelocity * 0.002;
      angleY += 0.0035 + tiltY * 0.15;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Dynamic FOV expands vertically as you scroll down
      const fov = 400 + scrollProgress * 50;
      const centerX = width * 0.65;
      const centerY = height * 0.48 + scrollProgress * 30;

      // ----------------------------------------
      // Render Small Floating Bubbles (Pure Vertical Motion)
      // ----------------------------------------
      for (let b of bubbles) {
        // Drift purely upwards with vertical scroll acceleration
        b.y -= (b.speedY + scrollAbsVelocity * 0.4);
        b.x += b.speedX; // Zero horizontal scroll drift

        // Wrap around smoothly
        if (b.y < -30) {
          b.y = height + 30;
          b.x = Math.random() * width;
        }
        if (b.y > height + 30) {
          b.y = -30;
          b.x = Math.random() * width;
        }
        if (b.x < -30) b.x = width + 30;
        if (b.x > width + 30) b.x = -30;

        // Subtle breathing scale modulated by vertical scroll
        const currentRadius = b.baseRadius + Math.sin(time * 2 + b.pulseOffset) * 0.8 + (scrollAbsVelocity * 0.12);
        const currentOpacity = Math.min(1, b.opacity * (0.8 + Math.sin(time + b.pulseOffset) * 0.2) + (scrollAbsVelocity * 0.02));

        // Parallax offset: Pure vertical response to scroll
        const parallaxX = (mouse.x - width / 2) * (15 / b.z);
        const parallaxY = (mouse.y - height / 2) * (15 / b.z) - (scrollY * 0.2);
        const renderX = b.x + parallaxX;
        const renderY = b.y + parallaxY;

        // Soft outer glow halo
        const glow = ctx.createRadialGradient(
          renderX,
          renderY,
          0,
          renderX,
          renderY,
          currentRadius * 3.5
        );
        glow.addColorStop(0, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${currentOpacity})`);
        glow.addColorStop(0.4, `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${currentOpacity * 0.45})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(renderX, renderY, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Bubble core
        ctx.fillStyle = `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, ${currentOpacity * 0.9})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Tiny specular highlight dot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(renderX - currentRadius * 0.3, renderY - currentRadius * 0.3, Math.max(0.6, currentRadius * 0.35), 0, Math.PI * 2);
        ctx.fill();
      }

      // ----------------------------------------
      // Render 3D Constellation Sphere & Filaments
      // ----------------------------------------
      const projected = [];
      for (let node of nodes) {
        let x1 = node.origX * cosY - node.origZ * sinY;
        let z1 = node.origZ * cosY + node.origX * sinY;

        let y2 = node.origY * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.origY * sinX;

        const scale = fov / (fov + z2 + 250);
        const x2D = centerX + x1 * scale;
        const y2D = centerY + y2 * scale;

        projected.push({
          x: x2D,
          y: y2D,
          z: z2,
          scale,
          color: node.color,
          size: node.size * scale,
        });
      }

      // Sort by depth
      projected.sort((a, b) => a.z - b.z);

      // Connecting neural filaments between nodes
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 95 * projected[i].scale;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35 * Math.min(projected[i].scale, projected[j].scale);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Glowing Node Orbs
      for (let p of projected) {
        if (p.scale <= 0) continue;

        const nodeGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        nodeGlow.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.8)`);
        nodeGlow.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.25)`);
        nodeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.size * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full opacity-80" />
    </div>
  );
};

export default Hero3DScene;
