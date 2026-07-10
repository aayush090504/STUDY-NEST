import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { THEMES, COUNTRIES, FONTS } from '../lib/constants';
import { 
  Settings as SettingsIcon, LogOut, Trash2, Save, Sparkles, Volume2, Bell, Check, Key, Globe, Type
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export const Settings: React.FC = () => {
  const { user, profile, updateProfile, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Settings state variables (initialized with current profile or defaults)
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [timerWorkMinutes, setTimerWorkMinutes] = useState(profile?.timerWorkMinutes || 25);
  const [timerBreakMinutes, setTimerBreakMinutes] = useState(profile?.timerBreakMinutes || 5);
  const [timerLongBreakMinutes, setTimerLongBreakMinutes] = useState(profile?.timerLongBreakMinutes || 15);
  const [timerLongBreakInterval, setTimerLongBreakInterval] = useState(profile?.timerLongBreakInterval || 4);
  const [soundEnabled, setSoundEnabled] = useState(profile?.soundEnabled ?? true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationsEnabled ?? true);
  const [country, setCountry] = useState(profile?.country || 'United States');
  const [timeFont, setTimeFont] = useState(profile?.timeFont || 'font-timer-mono');
  
  // Local state for feedback
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Deletion confirmation overlay state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  const currentThemeId = profile?.theme || 'warm-cozy';
  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Access Settings</h2>
        <p className="text-stone-500 dark:text-stone-400 mt-2 mb-6">
          Please sign in to customize your study defaults, choose aesthetic themes, and adjust study timers.
        </p>
        <button
          onClick={() => navigate('/login')}
          className={`w-full py-3.5 rounded-2xl font-bold text-white text-center shadow-lg hover:shadow-xl transition-all ${theme.colors.primary} ${theme.colors.primaryHover}`}
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfile({
        displayName,
        timerWorkMinutes: Number(timerWorkMinutes),
        timerBreakMinutes: Number(timerBreakMinutes),
        timerLongBreakMinutes: Number(timerLongBreakMinutes),
        timerLongBreakInterval: Number(timerLongBreakInterval),
        soundEnabled,
        notificationsEnabled,
        country,
        timeFont
      });
      setSuccessMsg("Settings saved successfully! ✨");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFontChange = async (fontId: string) => {
    try {
      setTimeFont(fontId);
      await updateProfile({ timeFont: fontId });
    } catch (error) {
      console.error("Error updating font:", error);
    }
  };

  const handleThemeChange = async (themeId: string) => {
    try {
      await updateProfile({ theme: themeId });
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccountSubmit = async () => {
    if (confirmDeleteText !== 'DELETE') {
      alert("Please type 'DELETE' in uppercase to confirm.");
      return;
    }

    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. You might need to sign in again to perform this sensitive action.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8">
      {/* Settings Title */}
      <div className="mb-8">
        <h2 className={`text-3xl font-black ${theme.colors.text} flex items-center space-x-2`}>
          <SettingsIcon className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Nest Settings</span>
        </h2>
        <p className={`text-sm mt-1 ${theme.colors.muted}`}>
          Customize your cozy environment, change timer presets, and manage your account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className={`p-6 rounded-3xl ${theme.colors.card} shadow space-y-6`}>
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <hr className="border-stone-200 dark:border-stone-800" />

            {/* Native Country Selector */}
            <div>
              <div className="flex items-center space-x-1.5 mb-2">
                <Globe className="w-4 h-4 text-amber-500" />
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Native Country & Timezone</label>
              </div>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-stone-700 dark:text-stone-250"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name} className="bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100">
                    {c.name} (GMT timezone)
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1.5 font-medium">
                Changing your country updates your native local clock in the header bar of the Nest instantly.
              </p>
            </div>

            <hr className="border-stone-200 dark:border-stone-800" />

            {/* Timer Durations Grid */}
            <div>
              <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-4">Timer Durations (minutes)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5">Work Session</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={timerWorkMinutes}
                    onChange={(e) => setTimerWorkMinutes(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5">Short Break</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={timerBreakMinutes}
                    onChange={(e) => setTimerBreakMinutes(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5">Long Break</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={timerLongBreakMinutes}
                    onChange={(e) => setTimerLongBreakMinutes(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1.5">Long Break Interval</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={timerLongBreakInterval}
                    onChange={(e) => setTimerLongBreakInterval(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <hr className="border-stone-200 dark:border-stone-800" />

            {/* Toggle options */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">Sound & Alerts</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-stone-600 dark:text-stone-300">UI & Alert Sounds</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 text-amber-600 accent-amber-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-stone-500" />
                  <span className="text-sm text-stone-600 dark:text-stone-300">Browser Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 text-amber-600 accent-amber-500"
                />
              </div>
            </div>

            {/* Alert / Feedback messages */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-xl flex items-center space-x-2">
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 text-rose-600 text-xs font-bold rounded-xl flex items-center space-x-2">
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow flex items-center justify-center space-x-2 ${
                isSaving ? 'opacity-50' : `${theme.colors.primary} ${theme.colors.primaryHover}`
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save All Preferences'}</span>
            </button>
          </form>
        </div>

        {/* Column 2: Theme Selector & Dangerous settings */}
        <div className="space-y-6">
          {/* Theme Selector */}
          <div className={`p-6 rounded-3xl ${theme.colors.card} shadow`}>
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-4 flex items-center space-x-1.5">
              <span>Aesthetic Themes</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {THEMES.map((t) => {
                const isSelected = profile?.theme === t.id;
                
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`w-full p-3.5 rounded-xl text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-sm'
                        : 'border-stone-100 dark:border-stone-850 bg-stone-50/30 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-stone-800 dark:text-stone-200 flex items-center">
                        {t.name}
                      </div>
                      <div className="flex space-x-1 mt-1.5">
                        <span className={`w-3 h-3 rounded-full ${t.colors.primary}`}></span>
                        <span className="w-3 h-3 rounded-full bg-stone-200"></span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 bg-indigo-500 text-white rounded-full">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer Typography Font Selector */}
          <div className={`p-6 rounded-3xl ${theme.colors.card} shadow`}>
            <div className="flex items-center space-x-1.5 mb-2">
              <Type className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-black text-stone-700 dark:text-stone-300">
                Timer Typography
              </h3>
            </div>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mb-4 font-semibold">
              Choose your favorite customized font style face for your timer.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {FONTS.map((f) => {
                const isSelected = (profile?.timeFont || 'font-timer-mono') === f.id;
                
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleFontChange(f.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-xs'
                        : 'border-stone-100 dark:border-stone-850 bg-stone-50/30 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                        {f.name}
                      </div>
                      <div className={`text-xl font-black mt-0.5 ${f.className} text-stone-800 dark:text-stone-100`}>
                        25:00
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 bg-emerald-500 text-white rounded-full">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Actions & Danger Zone */}
          <div className={`p-6 rounded-3xl ${theme.colors.card} shadow space-y-4`}>
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">Account Management</h3>

            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <hr className="border-stone-200 dark:border-stone-800" />

            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Danger Zone</h4>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition font-bold text-xs flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete My Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Account Deletion Confirmation Modal Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-2xl max-w-md w-full"
            >
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">Permanent Account Deletion</h2>
              <p className="text-stone-500 dark:text-stone-400 text-xs mt-2 leading-relaxed">
                This action is <span className="font-bold text-rose-500">irreversible</span>. Wiping your account will permanently delete:
              </p>
              <ul className="list-disc list-inside text-[11px] text-stone-500 dark:text-stone-400 mt-2 space-y-1.5 ml-1">
                <li>Your entire study logs history</li>
                <li>Your XP profile progress and Level {profile?.level} achievements</li>
                <li>All earned milestone badges</li>
                <li>Custom configurations, theme styles, and login credentials</li>
              </ul>

              <div className="mt-5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Type <span className="font-bold text-rose-500">"DELETE"</span> below to confirm:
                </label>
                <input
                  type="text"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/10 focus:outline-none focus:ring-2 focus:ring-rose-500 text-center font-bold tracking-widest text-sm text-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmDeleteText('');
                  }}
                  className="py-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition text-stone-700 dark:text-stone-350 font-bold text-xs text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccountSubmit}
                  disabled={confirmDeleteText !== 'DELETE'}
                  className={`py-3 rounded-xl text-white font-bold text-xs text-center shadow ${
                    confirmDeleteText === 'DELETE' 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-rose-300 cursor-not-allowed'
                  }`}
                >
                  Permanently Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Settings;
