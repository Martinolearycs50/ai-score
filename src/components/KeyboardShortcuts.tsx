'use client';

import { useEffect, useState } from 'react';
import { Search, Home, Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
  onAnalyze?: () => void;
  onHome?: () => void;
}

export default function KeyboardShortcuts({ onAnalyze, onHome }: KeyboardShortcutsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [ctrlPressed, setCtrlPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Track Ctrl/Cmd key state
      if (e.ctrlKey || e.metaKey) {
        setCtrlPressed(true);
      }

      // Handle shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            if (onAnalyze) onAnalyze();
            document.querySelector('input[type="text"]')?.focus();
            break;
          case 'h':
            e.preventDefault();
            if (onHome) onHome();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          case '/':
            e.preventDefault();
            setShowShortcuts(true);
            break;
        }
      }

      // Escape key
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onAnalyze, onHome]);

  const shortcuts = [
    { key: '⌘ + K', description: 'Focus search input', icon: Search },
    { key: '⌘ + H', description: 'Go to home', icon: Home },
    { key: '⌘ + /', description: 'Show shortcuts', icon: Keyboard },
    { key: 'Esc', description: 'Close modals', icon: X }
  ];

  return (
    <>
      {/* Shortcut indicator */}
      <div className={`
        fixed bottom-6 left-6 z-40
        glass rounded-xl px-4 py-2
        smooth-transition
        ${ctrlPressed ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      `}>
        <div className="flex items-center space-x-2 text-sm text-foreground-secondary">
          <Keyboard className="w-4 h-4" />
          <span>Press keys for shortcuts</span>
        </div>
      </div>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          />
          
          {/* Modal */}
          <div className="relative glass-intense rounded-2xl p-8 max-w-md w-full border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-display font-bold text-foreground">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 rounded-lg hover:bg-white/5 smooth-transition"
              >
                <X className="w-5 h-5 text-foreground-secondary" />
              </button>
            </div>
            
            <div className="space-y-4">
              {shortcuts.map((shortcut, index) => {
                const Icon = shortcut.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-accent-cyan" />
                      <span className="text-foreground">{shortcut.description}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {shortcut.key.split(' + ').map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center">
                          {keyIndex > 0 && <span className="mx-1 text-foreground-muted">+</span>}
                          <kbd className="px-2 py-1 text-xs bg-surface-elevated rounded border border-glass-border text-foreground">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-sm text-foreground-secondary text-center">
                Press <kbd className="px-2 py-1 bg-surface-elevated rounded text-xs">Esc</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}