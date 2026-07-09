import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudyLogs } from '../firebase';
import { StudyLog, Badge } from '../types';
import { THEMES, BADGES } from '../lib/constants';
import { 
  Trophy, Flame, Clock, BookOpen, ChevronRight, Calendar, Star, Compass, AlertCircle, Flag, Sparkles, Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const currentThemeId = profile?.theme || 'warm-cozy';
  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  useEffect(() => {
    async function fetchLogs() {
      if (user) {
        setLoadingLogs(true);
        try {
          const fetchedLogs = await getStudyLogs(user.uid);
          setLogs(fetchedLogs);
        } catch (error) {
          console.error("Error fetching study logs:", error);
        } finally {
          setLoadingLogs(false);
        }
      }
    }
    fetchLogs();
  }, [user]);

  // If not logged in, show login CTA
  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Unlock Dashboard</h2>
        <p className="text-stone-500 dark:text-stone-400 mt-2 mb-6">
          Log in or create a free account to track your study streaks, earn badges, log focus sessions, and level up your productivity!
        </p>
        <Link
          to="/login"
          className={`w-full py-3.5 rounded-2xl font-bold text-white text-center shadow-lg hover:shadow-xl transition-all ${theme.colors.primary} ${theme.colors.primaryHover}`}
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  // --- STATS CALCULATIONS ---
  const totalMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const totalHoursStr = (totalMinutes / 60).toFixed(1);
  const averageSessionLength = logs.length > 0 ? Math.round(totalMinutes / logs.length) : 0;
  
  // Calculate sessions this week (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const sessionsThisWeek = logs.filter(log => new Date(log.createdAt) >= oneWeekAgo).length;

  // Level progress bar calculations (100 XP per level)
  const xpInCurrentLevel = (profile?.xp || 0) % 100;
  const xpPercent = xpInCurrentLevel; // since 100 is max, this is directly the percentage!

  // --- HEATMAP CALENDAR GENERATION ---
  // Create an array representing the last 28 days
  const last28Days = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    // Sum duration studied on this day
    const minutesStudied = logs
      .filter(log => log.createdAt.startsWith(dateString))
      .reduce((sum, log) => sum + log.durationMinutes, 0);
      
    return { date: dateString, dayLabel: d.getDate(), minutesStudied };
  }).reverse(); // chronological order

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
      {/* Profile Overview Card */}
      <div className={`p-6 md:p-8 rounded-3xl ${theme.colors.card} shadow-lg mb-8 backdrop-blur-md relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl ${theme.colors.primary} text-white font-extrabold flex items-center justify-center text-2xl shadow`}>
              {profile?.level || 1}
            </div>
            <div>
              <h2 className={`text-2xl font-black ${theme.colors.text}`}>Level {profile?.level || 1} Scholar</h2>
              <p className={`text-xs ${theme.colors.muted} uppercase tracking-wider font-bold mt-0.5`}>
                {profile?.xp || 0} XP Total • {(profile?.level || 1) * 100 - (profile?.xp || 0)} XP to next level
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1.5 text-amber-500">
                <Flame className="w-6 h-6 fill-current animate-bounce" />
                <span className="text-2xl font-black">{profile?.currentStreak || 0}</span>
              </div>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Current Streak</p>
            </div>
            
            <div className="h-8 w-px bg-stone-200 dark:bg-stone-700"></div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1.5 text-stone-500 dark:text-stone-300">
                <Trophy className="w-5 h-5" />
                <span className="text-2xl font-black">{profile?.longestStreak || 0}</span>
              </div>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Longest Streak</p>
            </div>
          </div>
        </div>

        {/* XP Level Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-semibold mb-2 text-stone-500 dark:text-stone-400">
            <span>Level {profile?.level || 1}</span>
            <span>{xpInCurrentLevel} / 100 XP</span>
            <span>Level {(profile?.level || 1) + 1}</span>
          </div>
          <div className="w-full h-3 bg-stone-150 dark:bg-stone-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${theme.colors.primary} rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className={`p-5 rounded-2xl ${theme.colors.card} shadow flex items-center space-x-4`}>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-black ${theme.colors.text}`}>{totalHoursStr} hrs</div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Total Focused Study</p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${theme.colors.card} shadow flex items-center space-x-4`}>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-black ${theme.colors.text}`}>{sessionsThisWeek}</div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Sessions This Week</p>
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${theme.colors.card} shadow flex items-center space-x-4`}>
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-black ${theme.colors.text}`}>{averageSessionLength} mins</div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Average Session</p>
          </div>
        </div>
      </div>

      {/* Calendar Heatmap Block */}
      <div className={`p-6 rounded-3xl ${theme.colors.card} shadow mb-8`}>
        <h3 className={`text-lg font-bold mb-4 ${theme.colors.text} flex items-center space-x-2`}>
          <Calendar className="w-5 h-5" />
          <span>Last 28 Days Activity Grid</span>
        </h3>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid grid-cols-7 gap-2.5 max-w-md w-full">
            {last28Days.map((day, idx) => {
              let bgClass = 'bg-stone-100 dark:bg-stone-800';
              if (day.minutesStudied > 0 && day.minutesStudied < 25) {
                bgClass = 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400';
              } else if (day.minutesStudied >= 25 && day.minutesStudied < 60) {
                bgClass = 'bg-amber-300 dark:bg-amber-800 text-amber-900';
              } else if (day.minutesStudied >= 60) {
                bgClass = 'bg-amber-500 text-white';
              }
              
              return (
                <div
                  key={idx}
                  className={`aspect-square flex flex-col items-center justify-center text-[10px] font-bold rounded-lg transition-all ${bgClass}`}
                  title={`${day.date}: ${day.minutesStudied} mins studied`}
                >
                  <span>{day.dayLabel}</span>
                  {day.minutesStudied > 0 && (
                    <span className="text-[8px] opacity-75 font-normal">{day.minutesStudied}m</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col space-y-2 text-xs text-stone-400 font-medium">
            <span className="font-bold uppercase tracking-wider text-stone-500 dark:text-stone-300 text-[10px]">Intensity Guide</span>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-stone-100 dark:bg-stone-800 border dark:border-stone-700 rounded"></span>
              <span>No study logs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-amber-100 dark:bg-amber-900/30 rounded"></span>
              <span>Short break/work (&lt;25m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-amber-300 rounded"></span>
              <span>Core study (25m - 60m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-amber-500 rounded"></span>
              <span>Deep focus (&gt;=60m)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Badges Section */}
        <div className="md:col-span-2">
          <div className={`p-6 rounded-3xl ${theme.colors.card} shadow h-full`}>
            <h3 className={`text-lg font-bold mb-5 ${theme.colors.text} flex items-center space-x-2`}>
              <Star className="w-5 h-5 fill-current text-indigo-500" />
              <span>Milestone Badges ({profile?.badges?.length || 0} / {BADGES.length})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {BADGES.map((badge) => {
                const isUnlocked = profile?.badges?.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/10 border-indigo-100 dark:border-indigo-900 shadow-sm' 
                        : 'bg-stone-50/50 dark:bg-stone-900/30 border-stone-100 dark:border-stone-850 opacity-40 hover:opacity-60'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl mb-2 ${
                      isUnlocked ? 'bg-indigo-500 text-white shadow-md' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                    }`}>
                      {badge.id === 'first-step' && '🧭'}
                      {badge.id.startsWith('streak') && '🔥'}
                      {badge.id.startsWith('studious') && '📚'}
                      {badge.id === 'night-owl' && '🦉'}
                      {badge.id === 'early-bird' && '🌅'}
                      {badge.id === 'globe-trotter' && '🌐'}
                      {badge.id === 'deep-thinker' && '🧠'}
                      {badge.id === 'speed-demon' && '⚡'}
                      {badge.id === 'task-slayer' && '⚔️'}
                      {badge.id === 'planner-master' && '📅'}
                      {badge.id === 'grandmaster' && '👑'}
                      {badge.id === 'monk-mode' && '🧘'}
                      {badge.id === 'knowledge-sponge' && '🧽'}
                      {badge.id === 'scholarly-century' && '💯'}
                      {badge.id === 'zen-master' && '🎵'}
                      {badge.id === 'weekend-warrior' && '🛡️'}
                      {badge.id === 'creative-genius' && '🎨'}
                      {badge.id === 'customizer' && '✍️'}
                      {badge.id === 'perfectionist' && '🎯'}
                    </div>
                    <div className="text-xs font-black text-stone-800 dark:text-stone-200">{badge.name}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5 max-w-[120px] leading-tight font-medium">
                      {badge.description}
                    </div>
                    <div className="mt-2.5 px-2 py-0.5 bg-black/5 dark:bg-white/5 text-[9px] rounded-full font-bold uppercase tracking-wider text-stone-500">
                      {badge.condition}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Study History list view */}
        <div>
          <div className={`p-6 rounded-3xl ${theme.colors.card} shadow h-full flex flex-col`}>
            <h3 className={`text-lg font-bold mb-4 ${theme.colors.text} flex items-center space-x-2`}>
              <Clock className="w-5 h-5" />
              <span>Study Session Log</span>
            </h3>

            {loadingLogs ? (
              <div className="flex-1 flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <AlertCircle className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-2" />
                <div className="text-sm font-bold text-stone-600 dark:text-stone-300">No logs yet</div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 max-w-[150px] mx-auto">
                  Complete your first focus session to start tracking.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 max-h-[360px] space-y-3.5">
                {logs.map((log) => (
                  <div 
                    key={log.logId}
                    className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/5 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-black text-stone-800 dark:text-stone-200 truncate max-w-[120px]">
                          {log.subject}
                        </div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-600">{log.durationMinutes} mins</div>
                        <div className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full inline-block font-semibold mt-1">
                          +{log.xpGained} XP
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon & Report Flag Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coming Soon Card */}
        <div className={`p-5 rounded-3xl ${theme.colors.card} border ${theme.colors.border} shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles className="w-24 h-24 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className={`text-sm font-black uppercase tracking-wider ${theme.colors.text}`}>
                Coming Soon
              </h4>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              We are constantly crafting new features to perfect your sanctuary! Stay tuned for <strong className="text-stone-700 dark:text-stone-300 font-bold">new levels</strong>, gorgeous <strong className="text-stone-700 dark:text-stone-300 font-bold">cozy themes</strong>, rare <strong className="text-stone-700 dark:text-stone-300 font-bold">custom badges</strong>, immersive <strong className="text-stone-700 dark:text-stone-300 font-bold">ambient sounds</strong>, and smart <strong className="text-stone-700 dark:text-stone-300 font-bold">AI help features</strong>.
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500">
            <span>✨ Leveling Up StudyNest</span>
          </div>
        </div>

        {/* Report / Complaint Feedback Card */}
        <div className={`p-5 rounded-3xl ${theme.colors.card} border ${theme.colors.border} shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Flag className="w-24 h-24 text-rose-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                <Flag className="w-4 h-4" />
              </div>
              <h4 className={`text-sm font-black uppercase tracking-wider ${theme.colors.text}`}>
                Report Concern
              </h4>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Encountered a bug, distraction, or have a suggestion? Flag your concern directly with our developer. We value your complaints and feedback!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold">
              Direct: aayush.bhatia2013@gmail.com
            </span>
            <a
              href="mailto:aayush.bhatia2013@gmail.com?subject=StudyNest%20Complaint%20or%20Bug%20Report&body=Hi%20Aayush%2C%0A%0AI%20am%20using%20StudyNest%20and%20wanted%20to%20report%20a%20concern%20or%20share%20some%20feedback%3A%0A%0A-%20Type%20of%20issue%3A%20%5BComplaint%20%2F%20Bug%20%2F%20Suggestion%5D%0A-%20Description%3A%20%5BPlease%20write%20your%20message%20here%5D%0A%0AThank%20you%20for%20building%20this%20cozy%20nest!"
              className={`flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xs`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Flag Concern</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
