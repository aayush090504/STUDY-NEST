import React from 'react';
import { useAuth } from '../context/AuthContext';
import { THEMES } from '../lib/constants';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsAndConditions: React.FC = () => {
  const { profile } = useAuth();
  const currentThemeId = profile?.theme || 'warm-cozy';
  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-10">
      <Link to="/" className="inline-flex items-center space-x-1 text-xs font-bold text-stone-500 hover:text-stone-750 mb-6 transition">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Nest</span>
      </Link>

      <div className={`p-8 rounded-3xl ${theme.colors.card} shadow-lg backdrop-blur-md`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2.5 rounded-2xl ${theme.colors.primary} text-white shadow`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className={`text-2xl font-black ${theme.colors.text}`}>Terms & Conditions</h1>
        </div>

        <div className="prose prose-stone dark:prose-invert text-stone-600 dark:text-stone-300 text-sm space-y-4 leading-relaxed">
          <p className="font-bold text-stone-700 dark:text-stone-200">
            Last Updated: July 8, 2026
          </p>

          <p>
            Welcome to StudyNest. By registering an account or using our timers, ambient sound players, or gamification engines, you agree to comply with and be bound by the following Terms & Conditions.
          </p>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">1. Use of Service</h3>
          <p>
            StudyNest is a personal productivity platform designed to help users track their focus work using Pomodoro timers. You agree to use this application only for lawful, personal purposes. Any automation or scripts that generate artificial XP, simulate study logs, or bypass monetization gates are strictly prohibited.
          </p>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">2. Accounts and Authentication</h3>
          <p>
            You are responsible for keeping your email password credentials secure. If you login via Google OAuth, you agree to safeguard that account from unauthorized access. We cannot be held liable for any data loss resulting from insecure credential storage on your device.
          </p>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">3. Subscriptions & Billing Mockup</h3>
          <p>
            Some premium visual themes and ambient loop soundscapes are reserved for paying subscribers. Our subscription flow is designed to integrate with Stripe:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Any premium trial activated now is purely simulated for feedback and development purposes.</li>
            <li>No actual financial cards will be charged during the developer sandbox run.</li>
            <li>We reserve the right to lock subscription-only assets or change trial durations without notice.</li>
          </ul>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">4. Disclaimers & Limitation of Liability</h3>
          <p>
            The StudyNest application is provided "as is", without warranty of any kind. While we do our best to save and back up stats using reliable Firestore databases, we cannot guarantee that streaks or study session entries will never be lost due to network interruptions or browser storage anomalies.
          </p>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">5. Agreement Changes</h3>
          <p>
            We may occasionally update these terms to incorporate new features or reflect changes in billing laws. Your continued use of the Nest after terms have been edited constitutes formal acceptance of those changes.
          </p>
        </div>
      </div>
    </div>
  );
};
export default TermsAndConditions;
