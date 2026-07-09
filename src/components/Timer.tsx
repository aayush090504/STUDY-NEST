import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { THEMES, AMBIENT_SOUNDS, FONTS } from '../lib/constants';
import { ambientPlayer } from '../lib/audio';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Coffee, 
  Flame, 
  Compass, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  StopCircle, 
  BookOpen, 
  Brain,
  CheckCircle2,
  Type,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Timer: React.FC = () => {
  const { 
    user, 
    profile, 
    logSession, 
    updateProfile, 
    focusModeEnabled, 
    setFocusModeEnabled, 
    setIsTimerActive 
  } = useAuth();
  
  // Custom Timer defaults from User Profile or fallback to standard (25/5/15/4)
  const workDurationDefault = profile?.timerWorkMinutes || 25;
  const breakDurationDefault = profile?.timerBreakMinutes || 5;
  const longBreakDurationDefault = profile?.timerLongBreakMinutes || 15;
  const longBreakIntervalDefault = profile?.timerLongBreakInterval || 4;
  const initialThemeId = profile?.theme || 'warm-cozy';
  const theme = THEMES.find(t => t.id === initialThemeId) || THEMES[0];

  // Modes: 'pomodoro' | 'stopwatch'
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');

  // Pomodoro states
  const [sessionType, setSessionType] = useState<'work' | 'break' | 'long-break'>('work');
  const [timeLeft, setTimeLeft] = useState(workDurationDefault * 60);
  
  // Stopwatch states
  const [stopwatchTime, setStopwatchTime] = useState(0); // in seconds
  
  // Core status
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [subject, setSubject] = useState('');
  
  // Focus Prompt Modal states
  const [showFocusPrompt, setShowFocusPrompt] = useState(false);
  const [promptSubject, setPromptSubject] = useState('');

  // Study Card / Log Modal states
  const [showLogModal, setShowLogModal] = useState(false);
  const [logSubject, setLogSubject] = useState('');
  const [logMinutes, setLogMinutes] = useState(1);
  const [isSavingLog, setIsSavingLog] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  // Audio state
  const [selectedSoundId, setSelectedSoundId] = useState(profile?.ambientSound || 'none');
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Level up and badge unlocking overlay notifications
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [badgesUnlockedMessage, setBadgesUnlockedMessage] = useState<string[]>([]);

  const intervalRef = useRef<any>(null);

  // Suggestions for Focus Goal Prompt
  const FOCUS_SUGGESTIONS = [
    { label: '💻 Coding', text: 'Coding Practice' },
    { label: '📚 Reading', text: 'Book Reading' },
    { label: '📝 Writing', text: 'Essay Writing' },
    { label: '🧪 Science', text: 'Science Study' },
    { label: '🎨 Art', text: 'Creative Art' },
    { label: '📐 Math', text: 'Math Practice' }
  ];

  // Dynamic document title update
  useEffect(() => {
    if (timerMode === 'pomodoro') {
      const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const secs = (timeLeft % 60).toString().padStart(2, '0');
      const label = sessionType === 'work' ? 'Focus' : 'Break';
      document.title = isRunning ? `(${mins}:${secs}) ${label} | StudyNest` : 'StudyNest - Your Cozy Study Space';
    } else {
      const hrs = Math.floor(stopwatchTime / 3600);
      const mins = Math.floor((stopwatchTime % 3600) / 60).toString().padStart(2, '0');
      const secs = (stopwatchTime % 60).toString().padStart(2, '0');
      const timeStr = hrs > 0 ? `${hrs}:${mins}:${secs}` : `${mins}:${secs}`;
      document.title = isRunning ? `(⏱️ ${timeStr}) Stopwatch | StudyNest` : 'StudyNest - Your Cozy Study Space';
    }
  }, [timeLeft, stopwatchTime, isRunning, sessionType, timerMode]);

  // Synchronize global timer active state
  useEffect(() => {
    if (setIsTimerActive) {
      setIsTimerActive(isRunning && !(timerMode === 'pomodoro' && (sessionType === 'break' || sessionType === 'long-break')));
    }
    return () => {
      if (setIsTimerActive) {
        setIsTimerActive(false);
      }
    };
  }, [isRunning, timerMode, sessionType, setIsTimerActive]);

  // Reset timer if profile settings change
  useEffect(() => {
    if (timerMode === 'pomodoro' && !isRunning) {
      const mins = sessionType === 'work' 
        ? workDurationDefault 
        : sessionType === 'break' 
          ? breakDurationDefault 
          : longBreakDurationDefault;
      setTimeLeft(mins * 60);
    }
  }, [workDurationDefault, breakDurationDefault, longBreakDurationDefault, profile, timerMode]);

  // Handle ambient sound changes
  useEffect(() => {
    if (isAmbientPlaying) {
      ambientPlayer.play(selectedSoundId, ambientVolume);
    } else {
      ambientPlayer.stop();
    }
    return () => {
      ambientPlayer.stop();
    };
  }, [selectedSoundId, isAmbientPlaying]);

  // Adjust volume on the fly
  useEffect(() => {
    if (isAmbientPlaying) {
      ambientPlayer.setVolume(ambientVolume);
    }
  }, [ambientVolume]);

  // Handle Mode Change (Reset state cleanly)
  const handleModeChange = (newMode: 'pomodoro' | 'stopwatch') => {
    if (isRunning) {
      const confirmChange = window.confirm("Your current session is running. Do you want to switch modes and reset the session?");
      if (!confirmChange) return;
    }
    
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimerMode(newMode);
    
    if (newMode === 'pomodoro') {
      setSessionType('work');
      setTimeLeft(workDurationDefault * 60);
    } else {
      setStopwatchTime(0);
    }
  };

  // Triggered when user attempts to start the timer/stopwatch
  const handlePlayClick = () => {
    if (isRunning) {
      // Pause
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      // Starting: check if focusing subject is filled
      if (!subject.trim()) {
        setShowFocusPrompt(true);
      } else {
        startSessionLoop();
      }
    }
  };

  // Submit focus goal modal
  const handleFocusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptSubject.trim()) return;
    setSubject(promptSubject.trim());
    setShowFocusPrompt(false);
    setTimeout(() => {
      startSessionLoop(promptSubject.trim());
    }, 100);
  };

  // Actually start the interval loops
  const startSessionLoop = (overrideSubject?: string) => {
    const currentSubject = overrideSubject || subject || 'General Study';
    setIsRunning(true);
    
    if (timerMode === 'pomodoro') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleSessionComplete(currentSubject);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      intervalRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    }
  };

  // Handle Pomodoro complete
  const handleSessionComplete = async (activeSubject: string) => {
    setIsRunning(false);
    ambientPlayer.playSessionEndBell();

    if (sessionType === 'work') {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      
      // XP formula: 1 min = 1 XP
      const xpGained = workDurationDefault;
      
      if (user) {
        try {
          const res = await logSession(workDurationDefault, activeSubject, xpGained);
          if (res.levelUp) {
            setLevelUpMessage(`🎉 Level Up! You've reached Level ${res.newLevel}!`);
          }
          if (res.badgesUnlocked.length > 0) {
            setBadgesUnlockedMessage(res.badgesUnlocked);
          }
        } catch (error) {
          console.error("Error logging study session:", error);
        }
      }

      // Transition to break
      if (nextCount > 0 && nextCount % longBreakIntervalDefault === 0) {
        setSessionType('long-break');
        setTimeLeft(longBreakDurationDefault * 60);
      } else {
        setSessionType('break');
        setTimeLeft(breakDurationDefault * 60);
      }
    } else {
      // Break is complete, transition back to work
      setSessionType('work');
      setTimeLeft(workDurationDefault * 60);
    }
  };

  // Handle click on Tick / Complete button
  const handleTickClick = () => {
    // If running, pause the timer first so progress doesn't drift
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }

    // Calculate pre-populated minutes
    let prepopulatedMins = 0;
    if (timerMode === 'pomodoro') {
      const elapsedSecs = (workDurationDefault * 60) - timeLeft;
      prepopulatedMins = parseFloat((elapsedSecs / 60).toFixed(1));
    } else {
      prepopulatedMins = parseFloat((stopwatchTime / 60).toFixed(1));
    }

    // Set fallback if they worked a tiny bit but it rounds to 0
    if (prepopulatedMins <= 0 && (stopwatchTime > 0 || (timerMode === 'pomodoro' && timeLeft < workDurationDefault * 60))) {
      prepopulatedMins = 0.1;
    }

    setLogSubject(subject || '');
    setLogMinutes(prepopulatedMins || 1);
    setLogError(null);
    setShowLogModal(true);
  };

  // Submit the logged session study card
  const handleLogModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logMinutes <= 0) {
      setLogError("Please enter a valid study duration of at least 0.1 minutes.");
      return;
    }

    setIsSavingLog(true);
    setLogError(null);

    // XP formula: 1 min = 1 XP
    const xpGained = Math.max(1, Math.round(logMinutes));

    if (user) {
      try {
        const res = await logSession(logMinutes, logSubject || 'General Study', xpGained);
        
        // Level-up or badge popups
        if (res.levelUp) {
          setLevelUpMessage(`🎉 Level Up! You've reached Level ${res.newLevel}!`);
        }
        if (res.badgesUnlocked.length > 0) {
          setBadgesUnlockedMessage(res.badgesUnlocked);
        }

        // Reset and close
        setShowLogModal(false);
        setSubject('');
        setLogSubject('');
        
        if (timerMode === 'pomodoro') {
          setSessionType('work');
          setTimeLeft(workDurationDefault * 60);
        } else {
          setStopwatchTime(0);
        }
      } catch (error: any) {
        console.error("Error logging study session:", error);
        setLogError(error.message || "Failed to save study session. Please try again.");
      } finally {
        setIsSavingLog(false);
      }
    } else {
      setLogError("You must be logged in to save your sessions.");
      setIsSavingLog(false);
    }
  };

  const skipSession = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    
    if (sessionType === 'work') {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      if (nextCount > 0 && nextCount % longBreakIntervalDefault === 0) {
        setSessionType('long-break');
        setTimeLeft(longBreakDurationDefault * 60);
      } else {
        setSessionType('break');
        setTimeLeft(breakDurationDefault * 60);
      }
    } else {
      setSessionType('work');
      setTimeLeft(workDurationDefault * 60);
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    if (timerMode === 'pomodoro') {
      const mins = sessionType === 'work' 
        ? workDurationDefault 
        : sessionType === 'break' 
          ? breakDurationDefault 
          : longBreakDurationDefault;
      setTimeLeft(mins * 60);
    } else {
      setStopwatchTime(0);
    }
  };

  const handleAmbientPlayToggle = () => {
    setIsAmbientPlaying(!isAmbientPlaying);
  };

  const handleSoundChange = (soundId: string) => {
    setSelectedSoundId(soundId);
    if (!isAmbientPlaying && soundId !== 'none') {
      setIsAmbientPlaying(true);
    }
  };

  // Pomodoro Progress calculations
  const totalSeconds = (sessionType === 'work' 
    ? workDurationDefault 
    : sessionType === 'break' 
      ? breakDurationDefault 
      : longBreakDurationDefault) * 60;
  
  const percentage = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const currentFontClass = profile?.timeFont || 'font-timer-mono';
  const isFocusActiveInTimer = focusModeEnabled && isRunning && !(timerMode === 'pomodoro' && (sessionType === 'break' || sessionType === 'long-break'));

  // Formatting stopwatch display: HH:MM:SS or MM:SS
  const formatStopwatch = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto px-4">
      {/* Mode Switcher Tabs */}
      {!isFocusActiveInTimer && (
        <div className="w-full flex justify-center space-x-2 mb-6 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/5 max-w-[280px]">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-black tracking-wide transition-all flex items-center justify-center space-x-1 ${
              timerMode === 'pomodoro'
                ? `${theme.colors.primary} text-white shadow-sm`
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Timer</span>
          </button>
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-black tracking-wide transition-all flex items-center justify-center space-x-1 ${
              timerMode === 'stopwatch'
                ? `${theme.colors.primary} text-white shadow-sm`
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Stopwatch</span>
          </button>
        </div>
      )}

      {/* Focus Subject Input/Indicator */}
      <div className="w-full mb-6">
        {isFocusActiveInTimer ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-2"
          >
            <span className={`text-[11px] uppercase tracking-widest font-black ${theme.colors.muted} block mb-1 animate-pulse`}>
              Current Focus
            </span>
            <h2 className={`text-lg md:text-xl font-extrabold tracking-tight ${theme.colors.text}`}>
              {subject.trim() ? subject : 'Cozy Study Flow'}
            </h2>
          </motion.div>
        ) : (
          <div className="relative flex items-center">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={timerMode === 'pomodoro' ? "What are we working on? (e.g. History prep...)" : "Stopwatch goal? (e.g. Reading novel...)"}
              className={`w-full px-5 py-4 rounded-2xl text-center shadow-inner text-xs md:text-sm font-semibold outline-none transition-all duration-300 bg-white/75 dark:bg-stone-850/80 focus:bg-white dark:focus:bg-stone-900 border ${theme.colors.border}`}
            />
            {subject && (
              <button 
                onClick={() => setSubject('')}
                className="absolute right-4 text-xs font-black text-stone-400 hover:text-stone-600 transition"
                title="Clear intent"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Card View */}
      <div className={`w-full py-10 px-8 rounded-3xl ${theme.colors.card} shadow-xl flex flex-col items-center text-center relative overflow-hidden backdrop-blur-md border ${theme.colors.border} transition-all duration-500 ${isFocusActiveInTimer ? 'py-14 shadow-2xl' : ''}`}>
        {/* Session Badge Indicator */}
        <div className="mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${timerMode}-${sessionType}`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                timerMode === 'stopwatch'
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : sessionType === 'work' 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
              }`}
            >
              {timerMode === 'stopwatch' ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Stopwatch focus mode</span>
                </>
              ) : sessionType === 'work' ? (
                <>
                  <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>Deep Focus Session</span>
                </>
              ) : (
                <>
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Rest & Recover</span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Circular Clock Face */}
        <div className={`relative flex items-center justify-center transition-all duration-500 ${
          isFocusActiveInTimer 
            ? 'w-80 h-80 md:w-[340px] md:h-[340px] my-8' 
            : 'w-64 h-64 my-6'
        }`}>
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="110"
              className="stroke-black/5 dark:stroke-white/5"
              strokeWidth="8"
              fill="transparent"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="110"
              className="stroke-current"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="691"
              strokeDashoffset={timerMode === 'pomodoro' ? (691 - (691 * percentage) / 100) : isRunning ? (691 - (691 * (stopwatchTime % 60)) / 60) : 691}
              style={{
                stroke: theme.id === 'cyberpunk-study' ? '#eab308' : undefined,
                color: theme.id !== 'cyberpunk-study' ? theme.colors.primary.replace('bg-', 'text-') : undefined
              }}
            />
          </svg>

          {/* Time digits display inside circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {timerMode === 'pomodoro' ? (
              <span className={`${isFocusActiveInTimer ? 'text-7xl md:text-8xl' : 'text-6xl'} font-black tracking-tighter transition-all duration-500 ${theme.colors.text} ${currentFontClass}`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            ) : (
              <span className={`${isFocusActiveInTimer ? 'text-6xl md:text-7xl' : 'text-5xl'} font-black tracking-tighter transition-all duration-500 ${theme.colors.text} ${currentFontClass}`}>
                {formatStopwatch(stopwatchTime)}
              </span>
            )}
            <span className={`text-xs mt-1.5 font-medium ${theme.colors.muted}`}>
              {isRunning ? 'Flow state active' : 'Nest is resting'}
            </span>
          </div>
        </div>

        {/* Controls Layout */}
        <div className="flex items-center space-x-6 z-10">
          <button
            onClick={resetTimer}
            className={`p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200`}
            title="Reset"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          <button
            onClick={handlePlayClick}
            className={`p-5 rounded-full ${theme.colors.primary} ${theme.colors.primaryHover} text-white shadow-lg transform transition active:scale-95`}
            title={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Complete / Tick Button available in both modes */}
          <button
            onClick={handleTickClick}
            className={`p-3 rounded-full transition-all ${
              timerMode === 'pomodoro'
                ? (sessionType === 'work' && ((workDurationDefault * 60) - timeLeft) >= 5
                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 scale-110'
                  : 'text-stone-300 dark:text-stone-700 cursor-not-allowed')
                : (stopwatchTime >= 5
                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 scale-110'
                  : 'text-stone-300 dark:text-stone-700 cursor-not-allowed')
            }`}
            title="Complete & Log Session"
            disabled={
              timerMode === 'pomodoro'
                ? (sessionType !== 'work' || ((workDurationDefault * 60) - timeLeft) < 5)
                : stopwatchTime < 5
            }
          >
            <CheckCircle2 className="w-6 h-6" />
          </button>

          {timerMode === 'pomodoro' && (
            <button
              onClick={skipSession}
              className={`p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200`}
              title="Skip Session"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Instant Typography Selector */}
        {!isFocusActiveInTimer && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1 bg-stone-100/50 dark:bg-stone-900/40 p-1.5 rounded-2xl border border-stone-200/20 max-w-sm w-full">
            <div className="flex items-center space-x-1 px-1.5 text-stone-400 dark:text-stone-500">
              <Type className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">Font:</span>
            </div>
            <div className="flex items-center space-x-1">
              {FONTS.map((f) => {
                const isSelected = currentFontClass === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => updateProfile?.({ timeFont: f.id })}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      isSelected
                        ? `${theme.colors.primary} text-white shadow-xs scale-105`
                        : 'bg-white/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-750'
                    }`}
                    title={`Change timer font to ${f.name}`}
                  >
                    <span className={f.className}>Aa</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Focus Mode Toggle */}
        {!isFocusActiveInTimer && (
          <div className="mt-4 flex items-center justify-between bg-stone-100/50 dark:bg-stone-900/40 p-3 rounded-2xl border border-stone-200/20 max-w-sm w-full">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${focusModeEnabled ? 'bg-amber-500/15 text-amber-500 animate-pulse' : 'bg-stone-250 dark:bg-stone-800 text-stone-400'}`}>
                <EyeOff className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 block leading-tight">Focus Mode</span>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-medium block leading-none">Hides distractors when running</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFocusModeEnabled?.(!focusModeEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                focusModeEnabled ? theme.colors.primary : 'bg-stone-250 dark:bg-stone-750'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  focusModeEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* Pomodoro Session dots (only shown in pomodoro) */}
        {timerMode === 'pomodoro' && !isFocusActiveInTimer && (
          <div className="mt-8 flex items-center space-x-1">
            {[...Array(longBreakIntervalDefault)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < (completedSessions % longBreakIntervalDefault)
                    ? `${theme.colors.primary} scale-110 shadow-sm`
                    : 'bg-stone-200 dark:bg-stone-700'
                }`}
              />
            ))}
            <span className={`text-xs ml-2 font-medium ${theme.colors.muted}`}>
              ({completedSessions % longBreakIntervalDefault}/{longBreakIntervalDefault} until long break)
            </span>
          </div>
        )}

        {/* Stopwatch hints */}
        {timerMode === 'stopwatch' && !isFocusActiveInTimer && (
          <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-6 max-w-xs leading-normal">
            * 1 minute of focusing gives 1 XP. Press the green check button when paused to save!
          </p>
        )}
      </div>

      {/* Ambient Sound Player Panel */}
      {!isFocusActiveInTimer && (
        <>
          <div className={`w-full mt-6 py-5 px-6 rounded-3xl ${theme.colors.card} shadow-lg backdrop-blur-md flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 border ${theme.colors.border}`}>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAmbientPlayToggle}
                className={`p-2.5 rounded-2xl ${
                  isAmbientPlaying 
                    ? `${theme.colors.primary} text-white` 
                    : 'bg-black/5 dark:bg-white/5 text-stone-600 dark:text-stone-300'
                } transition`}
              >
                {isAmbientPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <div className="text-left">
                <div className={`text-sm font-bold ${theme.colors.text}`}>Cozy Ambience</div>
                <div className="text-xs text-stone-400 dark:text-stone-500 font-semibold">
                  {isAmbientPlaying 
                    ? AMBIENT_SOUNDS.find(s => s.id === selectedSoundId)?.name 
                    : 'Sound player muted'}
                </div>
              </div>
            </div>

            {/* Ambient Selector Buttons */}
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1">
              {AMBIENT_SOUNDS.map((sound) => {
                const isSelected = selectedSoundId === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundChange(sound.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isSelected
                        ? `${theme.colors.primary} text-white`
                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-stone-600 dark:text-stone-300'
                    }`}
                    title={sound.name}
                  >
                    {sound.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Slider */}
          {isAmbientPlaying && (
            <div className="w-full px-2 mt-3 flex items-center space-x-3">
              <VolumeX className="w-4 h-4 text-stone-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <Volume2 className="w-4 h-4 text-stone-400" />
            </div>
          )}

          {/* Coming Soon Section in Timer Area */}
          <div className={`w-full mt-6 p-4 rounded-3xl ${theme.colors.card} border ${theme.colors.border} shadow-xs relative overflow-hidden flex flex-col justify-between`}>
            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
              <Sparkles className="w-16 h-16 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className={`text-xs font-black uppercase tracking-wider ${theme.colors.text}`}>
                  Coming Soon
                </h4>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed text-left">
                We are constantly crafting new features to perfect your sanctuary! Stay tuned for <strong className="text-stone-700 dark:text-stone-300 font-bold">new levels</strong>, gorgeous <strong className="text-stone-700 dark:text-stone-300 font-bold">cozy themes</strong>, rare <strong className="text-stone-700 dark:text-stone-300 font-bold">custom badges</strong>, immersive <strong className="text-stone-700 dark:text-stone-300 font-bold">ambient sounds</strong>, and smart <strong className="text-stone-700 dark:text-stone-300 font-bold">AI help features</strong>.
              </p>
            </div>
          </div>
        </>
      )}

      {/* BEFORE-TIMER FOCUS PROMPT INTENT MODAL */}
      <AnimatePresence>
        {showFocusPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-stone-850 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-black/5"
            >
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black text-stone-800 dark:text-stone-100">Set your Intent</h3>
              <p className="text-stone-400 dark:text-stone-400 text-xs mt-1.5 mb-6 font-semibold">
                What is your core focus target for this study session?
              </p>

              <form onSubmit={handleFocusSubmit} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics chapter 2, Reading classic novels..."
                  value={promptSubject}
                  onChange={(e) => setPromptSubject(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                  autoFocus
                />

                {/* Focus Suggestion tags */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {FOCUS_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setPromptSubject(s.text)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-500/10 hover:text-amber-500 text-[10px] font-black text-stone-500 dark:text-stone-400 transition"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-3 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFocusPrompt(false);
                      setPromptSubject('');
                    }}
                    className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-stone-750 text-stone-500 text-xs font-extrabold hover:bg-stone-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-3 rounded-xl text-white text-xs font-black shadow-sm transition ${
                      promptSubject.trim() ? `${theme.colors.primary} hover:opacity-90` : 'bg-stone-300 dark:bg-stone-800 cursor-not-allowed'
                    }`}
                    disabled={!promptSubject.trim()}
                  >
                    Begin Study Loop
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STUDY CARD LOG MODAL (Log Study Session) */}
      <AnimatePresence>
        {showLogModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-left"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-stone-850 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full border border-black/5"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>

              <h3 className="text-xl font-black text-center text-stone-800 dark:text-stone-100">Study Session Summary</h3>
              <p className="text-stone-400 dark:text-stone-400 text-center text-xs mt-1.5 mb-6 font-semibold">
                Complete and log your study card to save your progress!
              </p>

              {logError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
                  {logError}
                </div>
              )}

              <form onSubmit={handleLogModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                    What did you read/study today?
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Reading biology book, React hooks practice..."
                    value={logSubject}
                    onChange={(e) => setLogSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  {/* Suggestions tags for Log Modal */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {FOCUS_SUGGESTIONS.slice(0, 4).map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setLogSubject(s.text)}
                        className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-500/10 hover:text-emerald-500 text-[10px] font-bold text-stone-500 dark:text-stone-400 transition"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-50 dark:bg-stone-900/40 p-3.5 rounded-2xl border border-stone-200/20 dark:border-stone-750/30 flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Calculated Study Time
                  </span>
                  <span className="text-sm font-black text-stone-800 dark:text-stone-100">
                    {logMinutes} minutes
                  </span>
                </div>

                {/* XP Reward Preview Box */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                      <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-stone-800 dark:text-stone-200 text-left">Earn Experience Points</div>
                      <div className="text-[10px] text-stone-400 font-semibold text-left">1 XP per 1 minute studied</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-amber-500">+{Math.max(1, Math.round(logMinutes))} XP</div>
                    <div className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Estimated</div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLogModal(false);
                      setLogError(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-stone-200 dark:border-stone-750 text-stone-500 dark:text-stone-400 text-xs font-extrabold hover:bg-stone-50 dark:hover:bg-stone-800/50 transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingLog}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-sm transition flex items-center justify-center space-x-1.5 text-center"
                  >
                    {isSavingLog ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Log Session</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gamification Level-Up Overlay */}
      <AnimatePresence>
        {levelUpMessage && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl shadow-2xl max-w-md text-center flex flex-col items-center border border-amber-100">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce">
                👑
              </div>
              <h2 className="text-2xl font-black text-amber-600 mb-2">Level Up!</h2>
              <p className="text-stone-600 dark:text-stone-300 text-lg mb-6">{levelUpMessage}</p>
              <button
                onClick={() => setLevelUpMessage(null)}
                className="w-full py-3 rounded-2xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition"
              >
                Continue Flow
              </button>
            </div>
          </motion.div>
        )}

        {badgesUnlockedMessage.length > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-stone-850 p-8 rounded-3xl shadow-2xl max-w-md text-center flex flex-col items-center border border-indigo-100">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-full flex items-center justify-center text-4xl mb-4 animate-pulse">
                🏆
              </div>
              <h2 className="text-2xl font-black text-indigo-600 mb-2">Milestone Badge!</h2>
              <p className="text-stone-600 dark:text-stone-300 mb-6">
                You've unlocked the milestone badge:<br />
                <span className="font-bold text-indigo-500">
                  {badgesUnlockedMessage.map(id => id.replace('-', ' ').toUpperCase()).join(', ')}
                </span>
              </p>
              <button
                onClick={() => setBadgesUnlockedMessage([])}
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
              >
                Claim Trophy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
