import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { THEMES, COUNTRIES } from '../lib/constants';
import { Compass, BarChart2, Settings, Flame, LogIn, LogOut, Award, Clock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout, focusModeEnabled, isTimerActive } = useAuth();
  const location = useLocation();
  
  const currentThemeId = profile?.theme || 'warm-cozy';
  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  const isFocusModeActive = focusModeEnabled && isTimerActive;

  const userCountry = profile?.country || 'United States';
  const countryObj = COUNTRIES.find(c => c.name === userCountry) || COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0];
  const timezone = countryObj?.timezone || 'America/New_York';

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    if (!user) return;
    const updateTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        setTimeStr(formatter.format(now));
      } catch (err) {
        setTimeStr(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const timerId = setInterval(updateTime, 1000);
    return () => clearInterval(timerId);
  }, [user, timezone]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`w-full py-4 px-6 md:px-12 flex justify-between items-center z-10 transition-colors duration-500`}>
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl ${theme.colors.primary} text-white shadow-md flex items-center justify-center`}>
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${theme.colors.text}`}>
            StudyNest
          </span>
        </Link>

        {user && timeStr && (
          <div className="hidden md:flex items-center space-x-1.5 bg-stone-100/70 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800/80 px-3 py-1.5 rounded-full text-xs font-semibold font-mono text-stone-500 dark:text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="opacity-75">{userCountry}:</span>
            <span className={`${theme.colors.accent} font-extrabold`}>{timeStr}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-1 md:space-x-4">
        {user ? (
          <>
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition ${
                isActive('/') 
                  ? `${theme.colors.primary} text-white` 
                  : `${theme.colors.text} hover:bg-black/5 dark:hover:bg-white/5`
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Timer</span>
            </Link>

            {!isFocusModeActive && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition ${
                    isActive('/dashboard') 
                      ? `${theme.colors.primary} text-white` 
                      : `${theme.colors.text} hover:bg-black/5 dark:hover:bg-white/5`
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
                </Link>

                <Link
                  to="/settings"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-xl transition ${
                    isActive('/settings') 
                      ? `${theme.colors.primary} text-white` 
                      : `${theme.colors.text} hover:bg-black/5 dark:hover:bg-white/5`
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Settings</span>
                </Link>
              </>
            )}

            {/* Streak & XP Badges for logged in user */}
            <div className="flex items-center space-x-2 pl-2 border-l border-black/10 dark:border-white/10 ml-2">
              {profile?.currentStreak > 0 && (
                <div className="flex items-center space-x-1 text-amber-500 bg-amber-500/10 px-2..5 py-1 rounded-full text-xs font-semibold" title={`Daily Streak: ${profile.currentStreak} days`}>
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{profile.currentStreak}</span>
                </div>
              )}
              <div className="hidden md:flex items-center space-x-1 bg-indigo-500/10 text-indigo-500 px-2.5 py-1 rounded-full text-xs font-semibold">
                <Award className="w-3.5 h-3.5" />
                <span>Lvl {profile?.level || 1}</span>
              </div>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className={`flex items-center space-x-1 px-4 py-2 rounded-xl transition ${theme.colors.primary} text-white hover:opacity-90`}
          >
            <LogIn className="w-4 h-4" />
            <span className="text-sm font-medium">Join Nest</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
