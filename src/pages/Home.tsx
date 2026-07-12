import React from 'react';
import { useAuth } from '../context/AuthContext';
import { THEMES } from '../lib/constants';
import { Timer } from '../components/Timer';
import { StudyPlanner } from '../components/StudyPlanner';
import { Compass, Sparkles, BookOpen, Palette } from 'lucide-react';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const { user, profile, updateProfile, focusModeEnabled, isTimerActive } = useAuth();
  
  const currentThemeId = profile?.theme || 'warm-cozy';
  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  const isFocusModeActive = focusModeEnabled && isTimerActive;

  return (
    <div className="flex-1 flex flex-col items-center justify-start py-10 px-4 md:px-12 relative overflow-hidden transition-colors duration-500 min-h-screen">
      {/* Dynamic Aesthetic Background Floating Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-amber-200/10 dark:bg-amber-900/10 blur-3xl animate-bounce" style={{ animationDuration: '12s' }}></div>
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full bg-indigo-200/10 dark:bg-indigo-900/10 blur-3xl animate-bounce" style={{ animationDuration: '18s' }}></div>
      </div>

      <div className="z-10 w-full text-center max-w-2xl flex flex-col items-center">
        {/* Welcome Text */}
        {!isFocusModeActive && (
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center space-x-1.5 mb-2.5"
            >
              <Sparkles className={`w-4 h-4 ${theme.colors.accent} animate-pulse`} />
              <span className={`text-xs uppercase tracking-widest font-black ${theme.colors.muted}`}>
                Cozy Productivity Nest
              </span>
              <Sparkles className={`w-4 h-4 ${theme.colors.accent} animate-pulse`} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`text-4xl md:text-5xl font-black tracking-tight ${theme.colors.text}`}
            >
              {user ? (
                <>Welcome Back, <span className="underline decoration-wavy decoration-amber-500/50">{profile?.displayName}</span></>
              ) : (
                'Enter Your Study Nest'
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`text-sm md:text-base mt-2 max-w-md mx-auto ${theme.colors.muted}`}
            >
              {user 
                ? "Your quiet, focused workspace is ready. Select a sound, set your intent, and let's make progress together."
                : "A peaceful space to focus, track your learning journey, and build lasting study habits."}
            </motion.p>
          </div>
        )}

        {/* Core Timer Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full"
        >
          <Timer />
        </motion.div>

        {/* Instant Dashboard Theme Switcher */}
        {user && !isFocusModeActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`w-full max-w-xl mx-auto mt-6 py-4 px-5 rounded-3xl bg-white/50 dark:bg-stone-900/30 backdrop-blur-sm border ${theme.colors.border} flex flex-col items-center justify-between shadow-md`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2 flex items-center space-x-1">
              <Palette className="w-3.5 h-3.5" />
              <span>Nest Aesthetics (Instant Theme Selector)</span>
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {THEMES.map((t) => {
                const isSelected = t.id === currentThemeId;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateProfile({ theme: t.id })}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition flex items-center space-x-1 border ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 font-extrabold'
                        : 'border-transparent bg-stone-100/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${t.colors.primary}`}></span>
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Mini Calendar & Study Planner Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-xl"
          >
            <StudyPlanner />
          </motion.div>
        )}

        {/* Quick Tips */}
        {!isFocusModeActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className={`mt-12 flex items-center space-x-2 text-xs border border-black/5 dark:border-white/5 bg-white/40 dark:bg-stone-900/30 px-4 py-2.5 rounded-full ${theme.colors.muted} max-w-xl`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Tip: Focus mode is active. Earn 1 XP for every 1 minute studied! Plan ahead with your Study Calendar to unlock planner masteries.</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default Home;
