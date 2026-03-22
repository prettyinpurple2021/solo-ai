"use client"

import type { ThemeProviderProps } from "next-themes"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Add holographic theme support to the document
    const updateThemeColors = () => {
      const root = document.documentElement;
      const isAggressive = root.classList.contains('aggressive');
      
      if (isAggressive) {
        // Aggressive theme: stronger holographic effects
        root.style.setProperty('--holo-bg', 'rgba(0, 0, 0, 0.9)');
        root.style.setProperty('--holo-border', 'rgba(182, 33, 255, 0.5)');
        root.style.setProperty('--holo-glow', 'rgba(182, 33, 255, 0.8)');
        root.style.setProperty('--holo-text', 'rgba(255, 255, 255, 1)');
      } else {
        // Balanced theme: refined holographic effects
        root.style.setProperty('--holo-bg', 'rgba(0, 0, 0, 0.8)');
        root.style.setProperty('--holo-border', 'rgba(182, 33, 255, 0.3)');
        root.style.setProperty('--holo-glow', 'rgba(182, 33, 255, 0.5)');
        root.style.setProperty('--holo-text', 'rgba(255, 255, 255, 0.9)');
      }
    };

    // Initial setup
    updateThemeColors();

    // Listen for theme changes
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <NextThemesProvider 
      {...props}
      attribute="class" 
      themes={['balanced', 'aggressive']}
      defaultTheme="balanced" 
      storageKey="solosuccess-theme"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
