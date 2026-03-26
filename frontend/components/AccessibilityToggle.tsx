'use client';

import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  dyslexiaFont: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xl';
  reducedMotion: boolean;
}
import { Accessibility } from 'lucide-react';

export default function AccessibilityToggle() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    dyslexiaFont: false,
    highContrast: false,
    fontSize: 'normal',
    reducedMotion: false,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('zenforge-accessibility');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (s: AccessibilitySettings) => {
    const root = document.documentElement;

    // Dyslexia-friendly font
    if (s.dyslexiaFont) {
      root.style.setProperty('--font-sans', 'OpenDyslexic, Comic Sans MS, sans-serif');
      root.classList.add('dyslexia-font');
    } else {
      root.style.removeProperty('--font-sans');
      root.classList.remove('dyslexia-font');
    }

    // High contrast
    if (s.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.classList.remove('text-lg', 'text-xl');
    if (s.fontSize === 'large') root.classList.add('text-lg');
    if (s.fontSize === 'xl') root.classList.add('text-xl');

    // Reduced motion
    if (s.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('zenforge-accessibility', JSON.stringify(newSettings));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full transition-all duration-200"
        style={{
          padding: '0.45rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: open ? 'hsl(220 80% 75%)' : 'hsl(220 15% 85%)',
          background: open ? 'rgba(80,120,255,0.14)' : 'transparent',
          border: open ? '1px solid rgba(80,120,255,0.28)' : '1px solid transparent',
        }}
        title="Accessibility Settings"
        aria-label="Accessibility Settings"
      >
        <Accessibility size={16} strokeWidth={2.5} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '0.5rem',
          width: '20rem',
          background: 'rgba(14,15,30,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          zIndex: 50,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          fontFamily: "var(--font-outfit), sans-serif",
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}>
          <div className="flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'hsl(220 15% 90%)' }}>Accessibility</h3>
            <button onClick={() => setOpen(false)} style={{ color: 'hsl(220 10% 50%)', fontSize: '1.1rem' }}>&#10005;</button>
          </div>

          {/* Dyslexia Font */}
          <div className="flex items-center justify-between cursor-pointer" onClick={() => updateSetting('dyslexiaFont', !settings.dyslexiaFont)}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'hsl(220 15% 85%)' }}>Dyslexia-Friendly Font</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(220 10% 50%)', marginTop: '2px' }}>OpenDyslexic font for easier reading</div>
            </div>
            <div style={{ width: '2.5rem', height: '1.25rem', borderRadius: '9999px', background: settings.dyslexiaFont ? 'hsl(220 80% 62%)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'all 0.2s ease' }}>
              <div style={{ position: 'absolute', top: '2px', left: settings.dyslexiaFont ? 'calc(100% - 1.125rem - 2px)' : '2px', width: '1rem', height: '1rem', background: '#fff', borderRadius: '50%', transition: 'all 0.2s ease' }} />
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between cursor-pointer" onClick={() => updateSetting('highContrast', !settings.highContrast)}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'hsl(220 15% 85%)' }}>High Contrast</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(220 10% 50%)', marginTop: '2px' }}>Increased contrast for visibility</div>
            </div>
            <div style={{ width: '2.5rem', height: '1.25rem', borderRadius: '9999px', background: settings.highContrast ? 'hsl(220 80% 62%)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'all 0.2s ease' }}>
              <div style={{ position: 'absolute', top: '2px', left: settings.highContrast ? 'calc(100% - 1.125rem - 2px)' : '2px', width: '1rem', height: '1rem', background: '#fff', borderRadius: '50%', transition: 'all 0.2s ease' }} />
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'hsl(220 15% 85%)', marginBottom: '0.5rem' }}>Font Size</div>
            <div className="flex gap-2">
              {(['normal', 'large', 'xl'] as const).map(size => (
                <button key={size} onClick={() => updateSetting('fontSize', size)}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    textAlign: 'center',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                    ...(settings.fontSize === size 
                      ? { background: 'rgba(80,120,255,0.18)', border: '1px solid rgba(80,120,255,0.28)', color: 'hsl(220 80% 75%)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(220 10% 60%)' })
                  }}>
                  {size === 'xl' ? 'Extra Large' : size}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between cursor-pointer" onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'hsl(220 15% 85%)' }}>Reduced Motion</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(220 10% 50%)', marginTop: '2px' }}>Minimize animations</div>
            </div>
            <div style={{ width: '2.5rem', height: '1.25rem', borderRadius: '9999px', background: settings.reducedMotion ? 'hsl(220 80% 62%)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'all 0.2s ease' }}>
              <div style={{ position: 'absolute', top: '2px', left: settings.reducedMotion ? 'calc(100% - 1.125rem - 2px)' : '2px', width: '1rem', height: '1rem', background: '#fff', borderRadius: '50%', transition: 'all 0.2s ease' }} />
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => { updateSetting('dyslexiaFont', false); updateSetting('highContrast', false); updateSetting('fontSize', 'normal'); updateSetting('reducedMotion', false); }}
            style={{
              width: '100%',
              padding: '0.6rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'hsl(220 15% 85%)',
              marginTop: '0.5rem',
              transition: 'background 0.15s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Reset to Default
          </button>
        </div>
      )}
    </div>
  );
}
