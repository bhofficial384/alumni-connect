import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Compass, Cake, Mail, Image, Settings, Star } from 'lucide-react';

export default function NavigationPill({ onOpenPersonalize, progress }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      setIsVisible(window.scrollY > 250);

      const sections = ['hero', 'story', 'reasons', 'open-when', 'gallery', 'letter', 'cake', 'universe', 'final-secret'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  const navItems = [
    { id: 'hero', label: 'Birthday', icon: Sparkles },
    { id: 'story', label: 'Our Story', icon: Heart },
    { id: 'reasons', label: '20 Reasons', icon: Heart },
    { id: 'open-when', label: 'Open When', icon: Mail },
    { id: 'gallery', label: 'Photos', icon: Image },
    { id: 'letter', label: 'Letter', icon: Heart },
    { id: 'cake', label: 'Wish', icon: Cake },
    { id: 'universe', label: 'Universe', icon: Star },
    { id: 'final-secret', label: 'Secret', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-fit">
      <nav className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-full glass-panel-love border border-rose-400/30 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`relative flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-cinzel transition-all duration-300 ${
                isActive
                  ? 'bg-rose-600/30 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)] border border-rose-400/50'
                  : 'text-rose-300/60 hover:text-rose-100 hover:bg-white/5'
              }`}
              title={item.label}
            >
              <Icon className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline font-medium">{item.label}</span>
            </button>
          );
        })}

        <div className="w-[1px] h-4 bg-rose-900 mx-1" />

        {/* Personalize Button */}
        <button
          onClick={onOpenPersonalize}
          className="p-1.5 rounded-full text-rose-300/70 hover:text-rose-100 hover:bg-rose-500/20 transition-colors"
          title="Personalize Names, Dates & Photos"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </nav>
    </div>
  );
}
