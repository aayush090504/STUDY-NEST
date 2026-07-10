import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { THEMES, COUNTRIES } from '../lib/constants';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Compass, 
  Sparkles, 
  AlertCircle, 
  Globe, 
  Play, 
  Pause, 
  Coffee, 
  Flame, 
  Award, 
  Calendar, 
  CheckSquare, 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Heart, 
  Star, 
  ChevronRight, 
  Volume2, 
  Palette, 
  Moon, 
  Sun, 
  Smartphone, 
  Check 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const Login: React.FC = () => {
  const { user, profile, loginWithEmail, signupWithEmail, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United States');
  
  // Feedback states
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  const currentThemeId = profile?.theme || 'warm-cozy';
  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, displayName, country);
      }
      navigate('/');
    } catch (error: any) {
      console.error("Auth error:", error);
      let errMsg = "An error occurred during authentication.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errMsg = "Invalid email or password combination.";
      } else if (error.code === 'auth/email-already-in-use') {
        errMsg = "An account with this email address already exists.";
      } else if (error.code === 'auth/weak-password') {
        errMsg = "Password is too weak. Please use at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        errMsg = "Please provide a valid email address.";
      }
      setAuthError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      console.error("Google Auth error:", error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        const inIframe = window.self !== window.top;
        if (inIframe) {
          setAuthError("Google sign-in popup was closed or blocked. Because the app is running in a preview iframe, please click 'Open in New Tab' below to log in securely.");
        } else {
          setAuthError("Sign-in popup was closed before completion. Please try again.");
        }
      } else {
        setAuthError("Failed to authenticate with Google. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // State for interactive features preview
  const [activeTab, setActiveTab] = useState<'timer' | 'planner' | 'leveling'>('timer');
  const [demoTimerMinutes, setDemoTimerMinutes] = useState(25);
  const [demoTimerSeconds, setDemoTimerSeconds] = useState(0);
  const [demoTimerRunning, setDemoTimerRunning] = useState(false);
  const [demoSoundVolume, setDemoSoundVolume] = useState({ rain: 60, cafe: 30, campfire: 0 });
  const [activeThemePreview, setActiveThemePreview] = useState('warm-cozy');

  useEffect(() => {
    let interval: any = null;
    if (demoTimerRunning) {
      interval = setInterval(() => {
        if (demoTimerSeconds > 0) {
          setDemoTimerSeconds(s => s - 1);
        } else if (demoTimerMinutes > 0) {
          setDemoTimerMinutes(m => m - 1);
          setDemoTimerSeconds(59);
        } else {
          setDemoTimerRunning(false);
          setDemoTimerMinutes(25);
          setDemoTimerSeconds(0);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [demoTimerRunning, demoTimerMinutes, demoTimerSeconds]);

  // Demo planner tasks list state
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, text: 'Revise Calculus Lecture Notes', cycles: 2, completed: true },
    { id: 2, text: 'Synthesize Literature Review draft', cycles: 4, completed: false },
    { id: 3, text: 'Read Chapter 5 History Textbook', cycles: 1, completed: false },
  ]);

  const toggleDemoTask = (id: number) => {
    setDemoTasks(tasks => tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="flex-1 flex flex-col py-10 px-4 md:px-8 relative overflow-hidden transition-colors duration-500 bg-gradient-to-b from-stone-50 via-amber-50/20 to-stone-50 dark:from-stone-950 dark:via-stone-900/40 dark:to-stone-950">
      
      {/* Background Ambience blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-amber-200/10 dark:bg-amber-900/5 blur-3xl animate-pulse"></div>
        <div className="absolute top-[40%] right-[5%] w-96 h-96 rounded-full bg-indigo-200/10 dark:bg-indigo-950/5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-200/5 dark:bg-emerald-950/5 blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col">
        
        {/* Main upper split view (Showcase Info on Left, Login on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Welcoming Hero & Live Feature Interactive Showcase */}
          <div className="lg:col-span-7 flex flex-col space-y-8 text-left">
            
            <div className="space-y-4">
              {/* App Identity Banner */}
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 dark:bg-amber-500/20 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
                  Your Ultimate Aesthetic Study Sanctuary
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 dark:text-stone-100 leading-[1.1]">
                Step Into <span className="text-amber-600 dark:text-amber-500">StudyNest</span>. <br />
                Find Your Flow.
              </h1>
              
              <p className="text-sm md:text-base text-stone-500 dark:text-stone-400 max-w-xl font-medium leading-relaxed">
                Elevate your focus with customized Pomodoro timers, organic soundscape synthesizers, integrated task roadmaps, and satisfying gamified progress trackers designed to turn study grinds into a peaceful ritual.
              </p>
            </div>

            {/* Quick value props list */}
            <div className="grid grid-cols-2 gap-4 max-w-lg">
              {[
                { icon: Clock, label: 'Custom Pomodoros', desc: 'Paired with aesthetic fonts' },
                { icon: Coffee, label: 'Calming Soundscapes', desc: 'Synthesized directly in-app' },
                { icon: Flame, label: '7-Day Streak Badges', desc: 'Gamify your focus milestones' },
                { icon: Calendar, label: 'Dynamic Calendars', desc: 'Visual task list calendars' },
              ].map((prop, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800/60 rounded-2xl">
                  <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl mt-0.5">
                    <prop.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-800 dark:text-stone-200">{prop.label}</h4>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold">{prop.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Preview Dashboard ("Interactive Screenshot") */}
            <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden max-w-2xl">
              
              {/* Window Header */}
              <div className="px-5 py-3.5 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  <span className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 pl-2">
                    studynest.in/interactive_preview.html
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-[10px] font-black rounded-lg text-amber-600 dark:text-amber-400">
                    LIVE DEMO
                  </span>
                </div>
              </div>

              {/* Showcase switcher buttons */}
              <div className="flex border-b border-stone-150 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/30 p-2 gap-1">
                {[
                  { id: 'timer', label: '⏱️ Pomodoro Timer', desc: 'Focus Module' },
                  { id: 'planner', label: '📅 Study Planner', desc: 'Task Calendar' },
                  { id: 'leveling', label: '🏆 Leveling & Badges', desc: 'Scholar Progression' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2 px-3 rounded-xl transition text-left relative ${
                      activeTab === tab.id 
                        ? 'bg-white dark:bg-stone-800 shadow-sm text-stone-800 dark:text-white border border-stone-200/50 dark:border-stone-700/50' 
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800/50 text-stone-500 dark:text-stone-450'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold">{tab.label}</div>
                    <div className="text-[9px] opacity-70 font-semibold">{tab.desc}</div>
                  </button>
                ))}
              </div>

              {/* Tab Content Canvas */}
              <div className="p-6 min-h-[260px] flex flex-col justify-between bg-stone-50/30 dark:bg-stone-950/20">
                <AnimatePresence mode="wait">
                  
                  {activeTab === 'timer' && (
                    <motion.div
                      key="demo-timer"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      {/* Left: Timer core */}
                      <div className="md:col-span-7 flex flex-col items-center space-y-4">
                        <div className="relative w-36 h-36 rounded-full border-4 border-amber-500/20 flex flex-col items-center justify-center bg-white dark:bg-stone-900 shadow-md">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            DEEP FOCUS
                          </span>
                          <span className="text-3xl font-bold font-mono tracking-tight text-stone-800 dark:text-stone-150">
                            {String(demoTimerMinutes).padStart(2, '0')}:{String(demoTimerSeconds).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] text-stone-400 font-semibold">
                            Warm Cozy theme
                          </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setDemoTimerRunning(!demoTimerRunning)}
                            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                          >
                            {demoTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{demoTimerRunning ? 'Pause' : 'Start'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setDemoTimerRunning(false);
                              setDemoTimerMinutes(25);
                              setDemoTimerSeconds(0);
                            }}
                            className="px-3 py-1.5 bg-stone-150 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 rounded-lg text-xs font-bold transition-all"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Right: Sound Controls mock */}
                      <div className="md:col-span-5 space-y-3.5">
                        <h5 className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center space-x-1">
                          <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                          <span>Soundscape Levels</span>
                        </h5>

                        <div className="space-y-2.5">
                          {[
                            { id: 'rain', label: '🌧️ Gentle Rain', value: demoSoundVolume.rain },
                            { id: 'cafe', label: '☕ Cozy Cafe', value: demoSoundVolume.cafe },
                            { id: 'campfire', label: '🔥 Campfire crackles', value: demoSoundVolume.campfire },
                          ].map((sound) => (
                            <div key={sound.id} className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-stone-600 dark:text-stone-350">
                                <span>{sound.label}</span>
                                <span>{sound.value}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={sound.value}
                                onChange={(e) => {
                                  setDemoSoundVolume(v => ({ ...v, [sound.id]: parseInt(e.target.value) }));
                                }}
                                className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'planner' && (
                    <motion.div
                      key="demo-planner"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>Interactive Task Roadmap</span>
                        </h5>
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                          {demoTasks.filter(t => t.completed).length} of {demoTasks.length} Completed
                        </span>
                      </div>

                      <div className="space-y-2">
                        {demoTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => toggleDemoTask(task.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              task.completed
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-stone-400 dark:text-stone-550 line-through'
                                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-stone-300 dark:hover:border-stone-750'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                task.completed
                                  ? 'bg-emerald-500 border-emerald-600 text-white'
                                  : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950'
                              }`}>
                                {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                              <span className="text-xs font-bold">{task.text}</span>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                                🍅 {task.cycles} Pomodoros
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-[9px] text-stone-400 dark:text-stone-500 italic text-center font-semibold">
                        💡 Click tasks in this demo window to mark them complete!
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'leveling' && (
                    <motion.div
                      key="demo-leveling"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                    >
                      {/* Profile Level card */}
                      <div className="md:col-span-6 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                            Lvl 4
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-stone-800 dark:text-stone-200">Avid Scholar</h5>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">XP Multiplier: 1.2x</p>
                          </div>
                        </div>

                        {/* XP bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold text-stone-400">
                            <span>Progress</span>
                            <span>1,240 / 1,500 XP</span>
                          </div>
                          <div className="w-full h-2 bg-stone-150 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full animate-pulse" style={{ width: '82.6%' }}></div>
                          </div>
                        </div>

                        {/* Active streak */}
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-[10px] font-black">
                          <Flame className="w-4 h-4 fill-amber-500 stroke-none" />
                          <span>7 DAYS CONTINUOUS GRIND</span>
                        </div>
                      </div>

                      {/* Unlocked Badges shelf */}
                      <div className="md:col-span-6 space-y-3">
                        <h5 className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                          🏆 Dynamic Achievement Badges
                        </h5>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { name: 'Consistent Miner', desc: '3-day streak', icon: Award },
                            { name: 'Zen Master', desc: 'Study with sound', icon: Volume2 },
                            { name: 'First Step', desc: 'Completed 1 session', icon: Compass },
                          ].map((badge, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/25 transition text-center space-y-1 flex flex-col items-center">
                              <badge.icon className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-bounce" style={{ animationDelay: `${idx * 0.1}s` }} />
                              <div className="text-[9px] font-black text-stone-800 dark:text-stone-200 truncate w-full">{badge.name}</div>
                              <div className="text-[8px] text-stone-400 dark:text-stone-500 font-bold truncate w-full">{badge.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

          {/* Right Column: Sign In/Sign Up form card */}
          <div className="lg:col-span-5 flex justify-center w-full z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`w-full max-w-md p-8 rounded-3xl ${theme.colors.card} shadow-2xl border ${theme.colors.border} relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] dark:opacity-[0.04] pointer-events-none">
                <Compass className="w-48 h-48 text-amber-500" />
              </div>

              {/* App identity inside card */}
              <div className="flex items-center space-x-2.5 mb-6 justify-center">
                <div className={`p-2.5 rounded-2xl ${theme.colors.primary} text-white shadow`}>
                  <Compass className="w-6 h-6" />
                </div>
                <span className={`text-2xl font-black tracking-tight ${theme.colors.text}`}>
                  StudyNest
                </span>
              </div>

              {/* Toggle switch between sign in & sign up */}
              <div className="flex bg-stone-100 dark:bg-stone-900 rounded-2xl p-1 mb-6 border border-stone-200/50 dark:border-stone-850">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(true);
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
                    isLoginMode 
                      ? `${theme.colors.primary} text-white shadow-md` 
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-250'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(false);
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
                    !isLoginMode 
                      ? `${theme.colors.primary} text-white shadow-md` 
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-250'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Heading */}
              <div className="text-center mb-6">
                <h2 className={`text-xl font-black ${theme.colors.text}`}>
                  {isLoginMode ? 'Welcome Back, Scholar!' : 'Begin Your Study Odyssey'}
                </h2>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 font-semibold mt-1">
                  {isLoginMode ? 'Securely access your study logs and customized rooms.' : 'Craft a personal account to track progress, earn rewards, and secure logs.'}
                </p>
              </div>

              {/* Main Submit Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* User Info inputs for sign up */}
                {!isLoginMode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="Scholar Username"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-stone-850 dark:text-stone-150 shadow-inner"
                      />
                    </div>

                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-stone-400 pointer-events-none" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-700 dark:text-stone-300 font-semibold appearance-none cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name} className="text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Email input */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-stone-850 dark:text-stone-150 shadow-inner"
                  />
                </div>

                {/* Password input */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold text-stone-850 dark:text-stone-150 shadow-inner"
                  />
                </div>

                {/* Auth Error block */}
                {authError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/20 rounded-xl text-[11px] flex items-start space-x-2"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="font-extrabold">{authError}</span>
                  </motion.div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-md transition flex items-center justify-center space-x-2 ${
                    isSubmitting ? 'opacity-50' : `${theme.colors.primary} ${theme.colors.primaryHover}`
                  }`}
                >
                  {isLoginMode ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isSubmitting ? 'Verifying credentials...' : isLoginMode ? 'Access Sanctuary' : 'Deploy My Nest'}</span>
                </button>

              </form>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center text-[10px]">
                <div className="absolute w-full border-t border-stone-200 dark:border-stone-800"></div>
                <span className="relative bg-white dark:bg-stone-900 px-3 text-stone-400 dark:text-stone-500 uppercase font-extrabold tracking-widest">
                  Secure Federated Login
                </span>
              </div>

              {/* Google login */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 transition text-stone-750 dark:text-stone-200 font-extrabold text-xs flex items-center justify-center space-x-2.5 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.41 0-6.173-2.763-6.173-6.173s2.763-6.173 6.173-6.173c1.554 0 2.964.577 4.05 1.529l3.057-3.057C19.143 2.115 15.938 1 12.24 1 6.032 1 1 6.032 1 12.24s5.032 11.24 11.24 11.24c5.84 0 10.92-4.14 10.92-11.24 0-.648-.057-1.32-.173-1.954h-10.748z"
                  />
                </svg>
                <span>Google Instant Account</span>
              </button>

              {/* Iframe Preview Warning */}
              {isInIframe && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 text-stone-700 dark:text-stone-350 text-[11px] font-semibold space-y-2.5">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Google sign-in popups are often blocked or fail inside nested preview iframes. For a seamless sign-in, please open StudyNest in a new tab.
                    </p>
                  </div>
                  <div className="pt-1 flex">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-all shadow-sm space-x-1 animate-pulse"
                    >
                      <span>Open in New Tab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

            </motion.div>
          </div>

        </div>

        {/* Dynamic Showcase of what our app offers ("screenshots" grid / features guide requested) */}
        <div className="mt-24 pt-12 border-t border-stone-200/50 dark:border-stone-800/50">
          
          {/* Section title */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-black text-stone-900 dark:text-stone-100">
              Inside Your Study Sanctuary
            </h2>
            <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 font-semibold leading-relaxed">
              Explore the detailed features built to optimize study cycles, tracking, and rewards. Here's a guided tour of the tools waiting for you.
            </p>
          </div>

          {/* Bento grid showcase / high fidelity screenshots */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Screenshot 1: Custom Pomodoro Timer with paired Fonts */}
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  Modular Module
                </span>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-150">Aesthetic Pomodoro Timer</h3>
                <p className="text-xs text-stone-550 dark:text-stone-400 font-medium leading-relaxed">
                  Tailor your work and resting intervals. Choose from distinct vintage serif, digital mono, or cozy handwritten typefaces.
                </p>
              </div>

              {/* Visual mockup / screenshot */}
              <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-2xl flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[8px] font-mono text-stone-400">FONTS DROPDOWN ACTIVE</div>
                
                {/* Simulated font dropdown options */}
                <div className="w-full flex space-x-1.5 overflow-x-auto pb-1">
                  {['Digital Mono', 'Vintage Serif', 'Minimalist'].map((font, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded text-[8px] font-black whitespace-nowrap border ${
                      i === 0 
                        ? 'bg-amber-500/10 border-amber-500/35 text-amber-600 dark:text-amber-400' 
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-400'
                    }`}>
                      {font}
                    </span>
                  ))}
                </div>

                <div className="w-28 h-28 rounded-full border-4 border-amber-600/30 flex flex-col items-center justify-center bg-white dark:bg-stone-900 relative">
                  <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest pl-0.5">STUDY CYCLE</span>
                  <span className="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-100 font-mono">24:59</span>
                  <div className="absolute bottom-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  </div>
                </div>

                <div className="flex space-x-1.5 text-[9px] font-black uppercase">
                  <span className="px-2 py-1 bg-amber-600 text-white rounded">START</span>
                  <span className="px-2 py-1 bg-stone-200 dark:bg-stone-800 text-stone-500 rounded">SKIP</span>
                </div>
              </div>
            </div>

            {/* Screenshot 2: Real-time Synthesized Audio Mixer */}
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  Organic Audio
                </span>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-150">Synthesized Soundscapes</h3>
                <p className="text-xs text-stone-550 dark:text-stone-400 font-medium leading-relaxed">
                  Avoid repetitive mp3 audio loops. We synthesize organic sound waves in-app, allowing you to mix Rain, Coffee Cafe, and Crackling fire.
                </p>
              </div>

              {/* Visual mockup / screenshot */}
              <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-2xl space-y-3.5 relative">
                <div className="flex items-center justify-between text-[10px] font-black text-stone-500">
                  <span>AMBIENCE SYNTH TRACKS</span>
                  <span className="text-amber-600">MIXER LIVE</span>
                </div>

                <div className="space-y-3">
                  {[
                    { name: '🌧️ Gentle Rain Storm', desc: 'Synthesizing organic pink-noise droplets', val: 75 },
                    { name: '☕ Cafe Chatter', desc: 'Soft murmur, coffee grinder, mug clinks', val: 40 },
                    { name: '🔥 Fireside Cabin Crackles', desc: 'Calming logs snapping, high warmth factor', val: 15 },
                  ].map((track, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40 space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-stone-700 dark:text-stone-200">
                        <span>{track.name}</span>
                        <span className="font-extrabold text-amber-500">{track.val}%</span>
                      </div>
                      <div className="text-[8px] text-stone-400 font-semibold">{track.desc}</div>
                      <div className="w-full h-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600" style={{ width: `${track.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Screenshot 3: Scholar Level progression & Achievements */}
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  Scholar Progression
                </span>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-150">Gamified Progression System</h3>
                <p className="text-xs text-stone-550 dark:text-stone-400 font-medium leading-relaxed">
                  Earn experience points (XP) for each study interval. Maximize streaks, ascend levels, and unlock 24 satisfying achievement badges.
                </p>
              </div>

              {/* Visual mockup / screenshot */}
              <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                      L4
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-stone-700 dark:text-stone-200">Avid Scholar</div>
                      <div className="text-[8px] text-stone-400 font-bold">120 XP to Next Level</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg font-extrabold">
                    <Flame className="w-3 h-3 fill-amber-500 stroke-none" />
                    <span>7 Days Streak</span>
                  </div>
                </div>

                <div className="border-t border-stone-200/50 dark:border-stone-800/50 pt-2 space-y-1.5">
                  <div className="text-[9px] font-black text-stone-400 tracking-wider">LATEST ACHIEVEMENT UNLOCKED</div>
                  <div className="p-2 bg-white dark:bg-stone-900 border border-amber-500/10 rounded-xl flex items-center space-x-2.5">
                    <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                      <Award className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold text-stone-800 dark:text-stone-200">Consistent Miner</div>
                      <div className="text-[8px] text-stone-400 font-semibold">Logged deep focus logs 3 days in a row!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot 4: Integrated Planner & Calendar tasks */}
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  Task Planning
                </span>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-150">Study Planner Calendar</h3>
                <p className="text-xs text-stone-550 dark:text-stone-400 font-medium leading-relaxed">
                  Don't lose track of homework or exam prep. Schedule specific tasks directly to calendar dates with designated estimated cycle goals.
                </p>
              </div>

              {/* Visual mockup / screenshot */}
              <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center text-[10px] font-black text-stone-400">
                  <span>INTEGRATED TASK LIST</span>
                  <span>TODAY</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/30 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center font-bold">✓</span>
                      <span className="font-bold line-through">Math Assignments</span>
                    </div>
                    <span className="text-[8px] bg-stone-100 dark:bg-stone-800 px-1 rounded">2 Cycles</span>
                  </div>

                  <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/30 flex items-center justify-between text-[10px] text-stone-700 dark:text-stone-200">
                    <div className="flex items-center space-x-2">
                      <span className="w-3.5 h-3.5 rounded border border-stone-300 dark:border-stone-750 bg-white dark:bg-stone-950 inline-block"></span>
                      <span className="font-bold">Solve Chemistry Practice Set</span>
                    </div>
                    <span className="text-[8px] bg-stone-100 dark:bg-stone-800 px-1 rounded">3 Cycles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshot 5: Ambient Theme Room Selectors */}
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  Aesthetic Rooms
                </span>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-150">Aesthetic Room Customizer</h3>
                <p className="text-xs text-stone-550 dark:text-stone-400 font-medium leading-relaxed">
                  Switch the vibe at any point. Our dynamic customizer updates layouts with specialized colors matched to Warm Cozy, Dark Academia, and Cyberpunk.
                </p>
              </div>

              {/* Visual mockup / screenshot */}
              <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-2xl space-y-2.5">
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                  SELECT ACTIVE STUDY ROOM
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-black">
                  {[
                    { name: 'Warm Cozy', colors: 'from-amber-100 to-amber-200 text-amber-900' },
                    { name: 'Dark Academia', colors: 'from-stone-800 to-stone-900 text-stone-100 border border-stone-750' },
                    { name: 'Forest Sanctuary', colors: 'from-emerald-800 to-emerald-950 text-emerald-100' },
                    { name: 'Midnight Chill', colors: 'from-slate-800 to-slate-900 text-slate-100' },
                  ].map((rm, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl bg-gradient-to-tr ${rm.colors} flex flex-col justify-between h-14 relative`}>
                      <span>{rm.name}</span>
                      {idx === 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-600 border border-white rounded-full flex items-center justify-center text-[7px] text-white">✓</span>}
                      <span className="text-[7px] opacity-75 font-semibold">AESTHETIC DECOR</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Screenshot 6: Offline & Storage Resilience */}
            <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 rounded-3xl space-y-6 shadow-sm hover:shadow-md transition">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  Secure Data
                </span>
                <h3 className="text-lg font-black text-stone-800 dark:text-stone-150">Durable Cloud Synchronization</h3>
                <p className="text-xs text-stone-550 dark:text-stone-400 font-medium leading-relaxed">
                  Your accounts and planners are synced instantly to Google Firestore, guaranteeing zero loss of study progress or streak details across any browser or device!
                </p>
              </div>

              {/* Visual mockup / screenshot */}
              <div className="p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-2xl flex flex-col items-center justify-center p-6 space-y-3 relative">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full animate-bounce">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-black text-stone-700 dark:text-stone-200">Firestore DB Online</div>
                  <div className="text-[9px] text-stone-400 font-semibold mt-0.5">Continuous auto-backups activated</div>
                </div>
                <div className="w-24 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Trust Badge Footer */}
          <div className="mt-16 text-center text-stone-400 dark:text-stone-500 text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center space-x-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse fill-rose-500 stroke-none" />
            <span>StudyNest is fully optimized for cellular and desktop screens with instant speed indexing.</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
