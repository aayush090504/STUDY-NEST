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
  EyeOff,
  Sliders,
  Check
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
  const [isMixMode, setIsMixMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('studynest_mix_mode');
      return saved === 'true';
    } catch (e) {}
    return false;
  });
  const [trackVolumes, setTrackVolumes] = useState<{ [key: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('studynest_track_volumes');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      rain: 0,
      cafe: 0,
      campfire: 0,
      nebula: 0,
    };
  });

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

  // Persistent storage and reactive updates for Mixer Mode
  useEffect(() => {
    localStorage.setItem('studynest_track_volumes', JSON.stringify(trackVolumes));
  }, [trackVolumes]);

  useEffect(() => {
    localStorage.setItem('studynest_mix_mode', isMixMode ? 'true' : 'false');
  }, [isMixMode]);

  // Handle ambient sound changes and mixing
  useEffect(() => {
    if (!isAmbientPlaying) {
      ambientPlayer.stop();
      return;
    }

    // Set master volume
    ambientPlayer.setVolume(ambientVolume);

    if (isMixMode) {
      // Set individual tracks
      Object.keys(trackVolumes).forEach((trackId) => {
        ambientPlayer.setTrackVolume(trackId, trackVolumes[trackId]);
      });
    } else {
      // Single sound mode: Only play selected sound
      const tracksList = ['rain', 'cafe', 'campfire', 'nebula'];
      tracksList.forEach((trackId) => {
        if (trackId === selectedSoundId) {
          ambientPlayer.setTrackVolume(trackId, 1.0);
        } else {
          ambientPlayer.setTrackVolume(trackId, 0.0);
        }
      });
    }
  }, [isAmbientPlaying, isMixMode, selectedSoundId, trackVolumes, ambientVolume]);

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

  const handleFontChange = async (fontId: string) => {
    try {
      if (updateProfile) {
        await updateProfile({ timeFont: fontId });
      }
    } catch (error) {
      console.error("Error updating font:", error);
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
      {/* Main Cozy Timer Display Card */}
      <div className={`w-full p-6 md:p-8 rounded-3xl ${theme.colors.card} shadow-lg border ${theme.colors.border} flex flex-col items-center justify-center relative overflow-hidden mb-6 z-10`}>
        {/* Decorative subtle ambient pattern */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/5 opacity-30"></div>
        
        {/* Timer Mode Toggle Buttons (only show when not running) */}
        {!isRunning && (
          <div className="flex bg-stone-100/80 dark:bg-stone-900/50 p-1 rounded-2xl mb-6 border border-stone-200/20 dark:border-stone-850/20">
            <button
              onClick={() => handleModeChange('pomodoro')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                timerMode === 'pomodoro'
                  ? `${theme.colors.primary} text-white shadow-md`
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pomodoro Timer</span>
            </button>
            <button
              onClick={() => handleModeChange('stopwatch')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                timerMode === 'stopwatch'
                  ? `${theme.colors.primary} text-white shadow-md`
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stopwatch</span>
            </button>
          </div>
        )}

        {/* Active Subject Focus Header */}
        {timerMode === 'pomodoro' && (
          <div className="mb-4 text-center">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              sessionType === 'work'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}>
              {sessionType === 'work' ? '💻 Work Session' : sessionType === 'break' ? '☕ Short Break' : '🏝️ Long Break'}
            </span>
            {subject ? (
              <div className={`mt-2 text-xs font-bold ${theme.colors.text} opacity-80 flex items-center justify-center space-x-1`}>
                <span>Focusing on:</span>
                <span className="font-extrabold underline decoration-amber-500/40">{subject}</span>
              </div>
            ) : (
              <div className="mt-2 text-xs font-bold text-stone-400 dark:text-stone-500">
                Set your target before starting
              </div>
            )}
          </div>
        )}
        {timerMode === 'stopwatch' && (
          <div className="mb-4 text-center">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              ⏱️ Continuous Study
            </span>
            {subject ? (
              <div className={`mt-2 text-xs font-bold ${theme.colors.text} opacity-80 flex items-center justify-center space-x-1`}>
                <span>Focusing on:</span>
                <span className="font-extrabold underline decoration-indigo-500/40">{subject}</span>
              </div>
            ) : (
              <div className="mt-2 text-xs font-bold text-stone-400 dark:text-stone-500">
                Track continuous study sessions
              </div>
            )}
          </div>
        )}

        {/* Main Time Display Digit Block */}
        <div className="relative my-4 flex items-center justify-center w-64 h-64">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="114"
              className="stroke-stone-200/30 dark:stroke-stone-800/40"
              strokeWidth="10"
              fill="transparent"
            />
            {timerMode === 'pomodoro' && (
              <motion.circle
                cx="128"
                cy="128"
                r="114"
                className={sessionType === 'work' ? 'stroke-amber-500' : 'stroke-emerald-500'}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 114}
                animate={{
                  strokeDashoffset: (2 * Math.PI * 114) * (1 - percentage / 100)
                }}
                transition={{ duration: 1, ease: "linear" }}
                strokeLinecap="round"
              />
            )}
            {timerMode === 'stopwatch' && isRunning && (
              <circle
                cx="128"
                cy="128"
                r="114"
                className="stroke-indigo-500 animate-pulse"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="20 10"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Digits Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl md:text-6xl font-black select-none tracking-tight tabular-nums ${currentFontClass} ${theme.colors.text}`}>
              {timerMode === 'pomodoro' 
                ? `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`
                : formatStopwatch(stopwatchTime)
              }
            </span>
            
            {/* Minor state display / completed items */}
            {timerMode === 'pomodoro' && completedSessions > 0 && (
              <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>{completedSessions} {completedSessions === 1 ? 'Cycle' : 'Cycles'} Done</span>
              </div>
            )}
          </div>
        </div>

        {/* Core Action Controller Buttons */}
        <div className="flex items-center justify-center gap-4 mt-2">
          {/* Reset Button */}
          <button
            onClick={resetTimer}
            disabled={!isRunning && (timerMode === 'pomodoro' ? timeLeft === workDurationDefault * 60 : stopwatchTime === 0)}
            className={`p-3 rounded-2xl border transition-all ${
              !isRunning && (timerMode === 'pomodoro' ? timeLeft === workDurationDefault * 60 : stopwatchTime === 0)
                ? 'border-transparent bg-stone-100/40 dark:bg-stone-900/20 text-stone-300 dark:text-stone-750 cursor-not-allowed'
                : 'border-stone-200 dark:border-stone-850 bg-white/80 dark:bg-stone-900/60 text-stone-600 dark:text-stone-300 hover:scale-105 active:scale-95 shadow-sm'
            }`}
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Main Start / Pause Trigger */}
          <button
            onClick={handlePlayClick}
            className={`p-5 rounded-full text-white shadow-lg transition-all transform hover:scale-110 active:scale-95 ${
              isRunning 
                ? 'bg-stone-850 hover:bg-stone-900 dark:bg-stone-100 dark:text-stone-900' 
                : `${theme.colors.primary} hover:opacity-90`
            }`}
            title={isRunning ? "Pause" : "Start Session"}
          >
            {isRunning ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
          </button>

          {/* Completion / Log Session study card button */}
          {(timerMode === 'stopwatch' || sessionType === 'work') && (
            <button
              onClick={handleTickClick}
              disabled={timerMode === 'pomodoro' ? timeLeft === workDurationDefault * 60 : stopwatchTime === 0}
              className={`p-3 rounded-2xl border transition-all ${
                (timerMode === 'pomodoro' ? timeLeft === workDurationDefault * 60 : stopwatchTime === 0)
                  ? 'border-transparent bg-stone-100/40 dark:bg-stone-900/20 text-stone-300 dark:text-stone-750 cursor-not-allowed'
                  : 'border-emerald-200/40 dark:border-emerald-900/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95 shadow-xs font-black'
              }`}
              title="Complete and Log Session"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}

          {/* Skip Session Button (Only Pomodoro Break/Work) */}
          {timerMode === 'pomodoro' && isRunning && (
            <button
              onClick={skipSession}
              className="p-3 rounded-2xl border border-stone-200 dark:border-stone-850 bg-white/80 dark:bg-stone-900/60 text-stone-600 dark:text-stone-300 hover:scale-105 active:scale-95 shadow-sm"
              title="Skip Current Phase"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Subject Edit Input (only visible when not running) */}
        {!isRunning && (
          <div className="w-full mt-6 max-w-sm">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What are we studying? (e.g. History)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  theme.colors.border
                } bg-stone-50/50 dark:bg-stone-900/40 text-stone-800 dark:text-stone-100`}
              />
              {subject && (
                <button
                  onClick={() => setSubject('')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {!isFocusActiveInTimer && (
        <>
          {/* Timer Typography Font Selector */}
          <div className={`w-full mt-6 p-6 rounded-3xl ${theme.colors.card} shadow-lg border ${theme.colors.border}`}>
            <div className="flex items-center space-x-1.5 mb-2">
              <Type className={`w-5 h-5 ${theme.colors.accent}`} />
              <h3 className={`text-sm font-black ${theme.colors.text}`}>Timer Typography</h3>
            </div>
            <p className={`text-[11px] mb-4 font-semibold opacity-70 ${theme.colors.text}`}>
              Choose your favorite customized font style face for your timer.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FONTS.map((f) => {
                const isSelected = (profile?.timeFont || 'font-timer-mono') === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFontChange(f.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col justify-between h-full ${
                      isSelected
                        ? `border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-xs scale-102`
                        : `border-stone-200/40 dark:border-stone-800/40 bg-stone-100/10 dark:bg-stone-900/10 hover:bg-stone-100/20 dark:hover:bg-stone-900/20 ${theme.colors.text} opacity-80 hover:opacity-100`
                    }`}
                  >
                    <div className={`text-[9px] font-black uppercase tracking-wider ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'opacity-60'}`}>
                      {f.name.replace(' (Rounded)', '')}
                    </div>
                    <div className={`text-lg font-black mt-1.5 ${f.className} ${isSelected ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                      25:00
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 p-0.5 bg-amber-500 text-white rounded-full">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`w-full mt-6 p-6 rounded-3xl ${theme.colors.card} shadow-lg border ${theme.colors.border}`}>
          {/* Header Block */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/50 dark:border-stone-800/50">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAmbientPlayToggle}
                className={`p-2.5 rounded-2xl ${
                  isAmbientPlaying 
                    ? `${theme.colors.primary} text-white` 
                    : 'bg-black/5 dark:bg-white/5 text-stone-600 dark:text-stone-300'
                } transition-all`}
                title={isAmbientPlaying ? "Mute All" : "Play Ambience"}
              >
                {isAmbientPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <div className="text-left">
                <div className={`text-sm font-bold ${theme.colors.text}`}>Cozy Ambience</div>
                <div className="text-xs text-stone-400 dark:text-stone-500 font-semibold">
                  {isAmbientPlaying 
                    ? (isMixMode ? "Custom Soundtrack Mix" : AMBIENT_SOUNDS.find(s => s.id === selectedSoundId)?.name)
                    : 'Sound player muted'}
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-stone-100 dark:bg-stone-900/60 p-1 rounded-xl self-start sm:self-center">
              <button
                onClick={() => setIsMixMode(false)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                  !isMixMode
                    ? `${theme.colors.primary} text-white shadow-xs`
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                Single Preset
              </button>
              <button
                onClick={() => setIsMixMode(true)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all flex items-center space-x-1 ${
                  isMixMode
                    ? `${theme.colors.primary} text-white shadow-xs`
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Ambient Mixer</span>
              </button>
            </div>
          </div>

          {/* Sub-panels based on mode */}
          <div className="mt-5 space-y-4">
            {!isMixMode ? (
              /* Single Mode Presets */
              <div className="flex flex-wrap gap-2 justify-start items-center">
                {AMBIENT_SOUNDS.map((sound) => {
                  const isSelected = selectedSoundId === sound.id;
                  return (
                    <button
                      key={sound.id}
                      onClick={() => {
                        handleSoundChange(sound.id);
                        if (!isAmbientPlaying) setIsAmbientPlaying(true);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? `${theme.colors.primary} text-white`
                          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-stone-600 dark:text-stone-300'
                      }`}
                      title={sound.name}
                    >
                      {sound.id === 'rain' && '🌧️ '}
                      {sound.id === 'cafe' && '☕ '}
                      {sound.id === 'campfire' && '🔥 '}
                      {sound.id === 'nebula' && '🌌 '}
                      {sound.id === 'none' && '🔇 '}
                      {sound.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Mixer Mode Sliders */
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-400 dark:text-stone-500">
                    Mix levels (Web Audio Synthesizer)
                  </span>
                  <button 
                    onClick={() => setTrackVolumes({ rain: 0, cafe: 0, campfire: 0, nebula: 0 })}
                    className="text-[10px] text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-350 font-black"
                  >
                    Mute All Tracks
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'rain', label: '🌧️ Gentle Rain', value: trackVolumes.rain },
                    { id: 'cafe', label: '☕ Cozy Cafe Piano', value: trackVolumes.cafe },
                    { id: 'campfire', label: '🔥 Campfire crackles', value: trackVolumes.campfire },
                    { id: 'nebula', label: '🌌 Space Nebula Synth', value: trackVolumes.nebula },
                  ].map((track) => (
                    <div key={track.id} className="p-3 bg-stone-100/30 dark:bg-stone-900/20 rounded-2xl border border-stone-200/20 dark:border-stone-800/20 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-350">
                        <span>{track.label}</span>
                        <span>{Math.round(track.value * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={track.value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setTrackVolumes(prev => ({ ...prev, [track.id]: val }));
                          if (!isAmbientPlaying) {
                            setIsAmbientPlaying(true);
                          }
                        }}
                        className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Master Volume Control */}
            {isAmbientPlaying && (
              <div className="pt-3 border-t border-stone-200/40 dark:border-stone-800/40 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-stone-400">
                  <span>Master Volume</span>
                  <span>{Math.round(ambientVolume * 100)}%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <VolumeX className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVolume}
                    onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <Volume2 className="w-4 h-4 text-stone-400 shrink-0" />
                </div>
              </div>
            )}
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
