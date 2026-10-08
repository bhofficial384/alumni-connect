import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * NavbarLogo3D — Interactive 3D Canvas Logo Element
 * Renders an animated 3D geodesic polyhedral crystal surrounded by dual
 * gyroscopic orbital rings with glowing singularity core and mouse tracking.
 */
const NavbarLogo3D = ({ isHovered = false }) => {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const size = 42;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // 3D Polyhedron Vertices (Dual Pyramidal Octahedron)
    const baseVertices = [
      { x: 0, y: -14, z: 0 },   // Top apex
      { x: 0, y: 14, z: 0 },    // Bottom apex
      { x: -11, y: 0, z: -11 }, // Equatorial 1
      { x: 11, y: 0, z: -11 },  // Equatorial 2
      { x: 11, y: 0, z: 11 },   // Equatorial 3
      { x: -11, y: 0, z: 11 },  // Equatorial 4
    ];

    // Edges connecting vertices
    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5], // Top pyramid
      [1, 2], [1, 3], [1, 4], [1, 5], // Bottom pyramid
      [2, 3], [3, 4], [4, 5], [5, 2], // Equator ring
    ];

    let rotX = 0.35;
    let rotY = 0.5;
    let rotZ = 0;
    let speedMult = 1;
    let targetSpeedMult = 1;

    // Track mouse over canvas/parent
    let mouseTiltX = 0;
    let mouseTiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetTiltX = (e.clientY - cy) * 0.02;
      targetTiltY = (e.clientX - cx) * 0.02;
      targetSpeedMult = 2.2;
    };

    const handleMouseLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
      targetSpeedMult = 1;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Smooth interpolation
      speedMult += (targetSpeedMult - speedMult) * 0.08;
      mouseTiltX += (targetTiltX - mouseTiltX) * 0.1;
      mouseTiltY += (targetTiltY - mouseTiltY) * 0.1;

      rotY += 0.022 * speedMult + mouseTiltY * 0.05;
      rotX += 0.012 * speedMult + mouseTiltX * 0.05;
      rotZ += 0.008 * speedMult;

      const cx = size / 2;
      const cy = size / 2;
      const fov = 110;

      // Color scheme based on Dark/Light mode
      const primaryRgb = isDark ? '59, 130, 246' : '37, 99, 235';     // Blue
      const accentRgb = isDark ? '6, 182, 212' : '14, 165, 233';      // Cyan
      const glowRgb = isDark ? '168, 85, 247' : '124, 58, 237';       // Purple / Violet

      // Rotation matrix math
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // Project vertices to 2D
      const projected = baseVertices.map((v) => {
        // Y rotation
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.z * cosY + v.x * sinY;

        // X rotation
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + v.y * sinX;

        // Z rotation
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = y2 * cosZ + x1 * sinZ;

        const scale = fov / (fov + z2 + 40);
        return {
          x: cx + x3 * scale,
          y: cy + y3 * scale,
          z: z2,
          scale,
        };
      });

      // 1. Draw outer 3D Gyroscope Ring
      const ringRadius = 17;
      const ringSteps = 24;
      ctx.beginPath();
      for (let i = 0; i <= ringSteps; i++) {
        const theta = (i / ringSteps) * Math.PI * 2;
        const rx = Math.cos(theta) * ringRadius;
        const rz = Math.sin(theta) * ringRadius;

        // Tilt ring by fixed angle + animation
        const ringAngle = rotY * 0.7;
        const x1 = rx * Math.cos(ringAngle) - rz * Math.sin(ringAngle);
        const z1 = rz * Math.cos(ringAngle) + rx * Math.sin(ringAngle);
        const y2 = Math.sin(theta) * 4 * Math.cos(rotX * 0.5);

        const scale = fov / (fov + z1 + 40);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${accentRgb}, ${isDark ? 0.35 : 0.45})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Draw Polyhedron Edges
      edges.forEach(([i1, i2]) => {
        const p1 = projected[i1];
        const p2 = projected[i2];
        const avgZ = (p1.z + p2.z) / 2;

        // Depth-based opacity & line width
        const alpha = Math.max(0.18, Math.min(0.9, 0.55 + (avgZ / 30) * 0.4));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${primaryRgb}, ${alpha})`;
        ctx.lineWidth = Math.max(0.8, 1.2 * ((p1.scale + p2.scale) / 2));
        ctx.stroke();
      });

      // 3. Draw Vertices (Gleaming diamond nodes)
      projected.forEach((p) => {
        const nodeAlpha = Math.max(0.3, Math.min(1, 0.65 + (p.z / 25) * 0.45));
        ctx.fillStyle = `rgba(${accentRgb}, ${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, 1.8 * p.scale), 0, Math.PI * 2);
        ctx.fill();

        if (p.z > 2) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.6, 0.9 * p.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Center Singularity Core (Glowing pulsating core)
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.25;
      const coreRadius = Math.max(0.5, 3.5 * pulse);
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(0.5, coreRadius * 2.5));
      coreGlow.addColorStop(0, `rgba(${glowRgb}, ${isDark ? 0.9 : 0.8})`);
      coreGlow.addColorStop(0.5, `rgba(${primaryRgb}, 0.3)`);
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx, cy, 1.4, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isDark]);

  return (
    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-[1.5px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 shadow-lg shadow-blue-500/25 group-hover:shadow-purple-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0 overflow-hidden">
      {/* Specular glass backdrop */}
      <div className="absolute inset-[1px] rounded-[10px] bg-[#07090E]/90 dark:bg-[#07090E]/90 light:bg-slate-900/90 backdrop-blur-md" />
      <canvas ref={canvasRef} className="relative z-10 w-full h-full pointer-events-none" />
    </div>
  );
};

export default React.memo(NavbarLogo3D);
