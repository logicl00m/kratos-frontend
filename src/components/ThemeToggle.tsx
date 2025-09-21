import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '32px',
        borderRadius: '999px',
        backgroundColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
        border: '1px solid',
        borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        padding: '2px',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span
        style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transform: theme === 'dark' ? 'translateX(16px)' : 'translateX(-16px)',
          transition: 'transform 0.3s ease',
        }}
      >
        {theme === 'light' ? (
          <Sun size={16} style={{ color: '#fbbf24' }} />
        ) : (
          <Moon size={16} style={{ color: '#60a5fa' }} />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;