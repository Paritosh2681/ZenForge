'use client';

import { useState, useEffect } from 'react';

interface AccessibilitySettings {
  dyslexiaFont: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xl';
  reducedMotion: boolean;
}

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
        className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title="Accessibility Settings"
        aria-label="Accessibility Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="7" r="1.5"/><path d="M12 9v3m-3.5 1.5L12 12l3.5 1.5M9 17l1.5-3M15 17l-1.5-3"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-lg z-50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Accessibility</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">&#10005;</button>
          </div>

          {/* Dyslexia Font */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium">Dyslexia-Friendly Font</div>
              <div className="text-xs text-muted-foreground">OpenDyslexic font for easier reading</div>
            </div>
            <button
              onClick={() => updateSetting('dyslexiaFont', !settings.dyslexiaFont)}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.dyslexiaFont ? 'bg-primary' : 'bg-secondary'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.dyslexiaFont ? 'left-5' : 'left-0.5'}`} />
            </button>
          </label>

          {/* High Contrast */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium">High Contrast</div>
              <div className="text-xs text-muted-foreground">Increased contrast for visibility</div>
            </div>
            <button
              onClick={() => updateSetting('highContrast', !settings.highContrast)}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.highContrast ? 'bg-primary' : 'bg-secondary'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.highContrast ? 'left-5' : 'left-0.5'}`} />
            </button>
          </label>

          {/* Font Size */}
          <div>
            <div className="text-sm font-medium mb-1">Font Size</div>
            <div className="flex gap-1">
              {(['normal', 'large', 'xl'] as const).map(size => (
                <button key={size} onClick={() => updateSetting('fontSize', size)}
                  className={`flex-1 py-1.5 text-xs rounded-lg capitalize transition-colors ${
                    settings.fontSize === size ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                  {size === 'xl' ? 'Extra Large' : size}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium">Reduced Motion</div>
              <div className="text-xs text-muted-foreground">Minimize animations</div>
            </div>
            <button
              onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.reducedMotion ? 'bg-primary' : 'bg-secondary'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.reducedMotion ? 'left-5' : 'left-0.5'}`} />
            </button>
          </label>

          {/* Reset */}
          <button
            onClick={() => { updateSetting('dyslexiaFont', false); updateSetting('highContrast', false); updateSetting('fontSize', 'normal'); updateSetting('reducedMotion', false); }}
            className="w-full py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            Reset to Default
          </button>
        </div>
      )}
    </div>
  );
}
