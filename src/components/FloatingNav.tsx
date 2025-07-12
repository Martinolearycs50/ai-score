'use client';

import { useState, useEffect } from 'react';
import { Home, Search, BarChart, HelpCircle } from 'lucide-react';

interface FloatingNavProps {
  onScrollTo?: (section: string) => void;
}

export default function FloatingNav({ onScrollTo }: FloatingNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > 100);
      
      // Determine active section based on scroll position
      const sections = ['home', 'features', 'results', 'footer'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      }) || 'home';
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'features', icon: Search, label: 'Features' },
    { id: 'results', icon: BarChart, label: 'Results' },
    { id: 'help', icon: HelpCircle, label: 'Help' }
  ];

  const handleNavClick = (sectionId: string) => {
    if (onScrollTo) {
      onScrollTo(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!isVisible) return null;

  return (
    <nav className={`
      fixed right-6 top-1/2 -translate-y-1/2 z-50
      glass-intense rounded-2xl p-3
      smooth-transition
      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
    `}>
      <div className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                relative group p-3 rounded-xl smooth-transition
                ${isActive 
                  ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white glow-cyan' 
                  : 'text-foreground-secondary hover:text-foreground hover:bg-white/5'
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent-cyan rounded-full"></div>
              )}
              
              {/* Tooltip */}
              <div className="
                absolute right-full mr-3 top-1/2 -translate-y-1/2
                px-3 py-2 bg-surface-elevated text-foreground text-sm font-medium
                rounded-lg border border-glass-border
                opacity-0 group-hover:opacity-100 pointer-events-none
                smooth-transition whitespace-nowrap
              ">
                {item.label}
                <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-surface-elevated border-y-4 border-y-transparent"></div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Background blur effect */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-glass-bg backdrop-blur-xl border border-glass-border"></div>
    </nav>
  );
}