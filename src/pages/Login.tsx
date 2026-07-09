import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { THEMES, COUNTRIES } from '../lib/constants';
import { LogIn, UserPlus, Mail, Lock, User, Compass, Sparkles, AlertCircle, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

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
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError("Failed to authenticate with Google. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-amber-200/10 dark:bg-amber-900/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-indigo-200/10 dark:bg-indigo-900/10 blur-3xl animate-pulse"></div>
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center">
        {/* App Logo greeting */}
        <div className="flex items-center space-x-2.5 mb-6 text-center">
          <div className={`p-2.5 rounded-2xl ${theme.colors.primary} text-white shadow`}>
            <Compass className="w-7 h-7" />
          </div>
          <span className={`text-2xl font-black tracking-tight ${theme.colors.text}`}>
            StudyNest
          </span>
        </div>

        {/* Login/Signup Card */}
        <div className={`w-full p-8 rounded-3xl ${theme.colors.card} shadow-xl backdrop-blur-md`}>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-stone-400">
              {isLoginMode ? 'Welcome back!' : 'Create your nest'}
            </span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>

          <h2 className={`text-2xl font-black text-center mb-6 ${theme.colors.text}`}>
            {isLoginMode ? 'Sign In to Study' : 'Join the Nest'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display name (only in signup) */}
            {!isLoginMode && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Scholar Username"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Country Dropdown selection */}
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none text-stone-600 dark:text-stone-300"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} className="text-stone-800 dark:text-stone-100 bg-white dark:bg-stone-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-semibold">{authError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow transition flex items-center justify-center space-x-2 ${
                isSubmitting ? 'opacity-50' : `${theme.colors.primary} ${theme.colors.primaryHover}`
              }`}
            >
              {isLoginMode ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isSubmitting ? 'Processing...' : isLoginMode ? 'Sign In' : 'Sign Up'}</span>
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6 flex items-center justify-center text-xs">
            <div className="absolute w-full border-t border-stone-200 dark:border-stone-800"></div>
            <span className="relative bg-white dark:bg-stone-900 px-3 text-stone-400 uppercase font-bold tracking-wider text-[10px]">Or</span>
          </div>

          {/* Google OAuth Login */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-750 transition text-stone-700 dark:text-stone-200 font-bold text-sm flex items-center justify-center space-x-2 shadow-sm"
          >
            {/* Google Logo Icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.41 0-6.173-2.763-6.173-6.173s2.763-6.173 6.173-6.173c1.554 0 2.964.577 4.05 1.529l3.057-3.057C19.143 2.115 15.938 1 12.24 1 6.032 1 1 6.032 1 12.24s5.032 11.24 11.24 11.24c5.84 0 10.92-4.14 10.92-11.24 0-.648-.057-1.32-.173-1.954h-10.748z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle Login/Signup Modes link */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setAuthError(null);
              }}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
