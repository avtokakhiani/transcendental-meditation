'use client';

import { useEffect } from 'react';

export function ArticlesHeaderBackground() {
  useEffect(() => {
    const header = document.querySelector('body > header');
    if (!header) return;
    const root = document.documentElement;
    const updateBackground = () => {
      const scrolled = window.scrollY >= header.getBoundingClientRect().height;
      root.style.setProperty(
        '--articles-header-background',
        scrolled ? 'var(--color-cream-100)' : 'transparent',
      );
      root.style.setProperty('--articles-header-ink', scrolled ? 'var(--color-plum-800)' : '#fff');
    };
    updateBackground();
    window.addEventListener('scroll', updateBackground, { passive: true });
    window.addEventListener('resize', updateBackground);
    return () => {
      window.removeEventListener('scroll', updateBackground);
      window.removeEventListener('resize', updateBackground);
      root.style.removeProperty('--articles-header-background');
      root.style.removeProperty('--articles-header-ink');
    };
  }, []);

  return null;
}
