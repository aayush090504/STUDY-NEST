import React from 'react';
import { useAuth } from '../context/AuthContext';
import { THEMES } from '../lib/constants';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
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
            <Shield className="w-6 h-6" />
          </div>
          <h1 className={`text-2xl font-black ${theme.colors.text}`}>Privacy Policy</h1>
        </div>

        <div className="prose prose-stone dark:prose-invert text-stone-600 dark:text-stone-300 text-sm space-y-4 leading-relaxed">
          <p className="font-bold text-stone-700 dark:text-stone-200">
            Last Updated: July 8, 2026
          </p>

          <p>
            Welcome to StudyNest ("we", "our", "us"). We are deeply committed to respecting and protecting your privacy. This Privacy Policy describes how we collect, use, and process your personal data when you use the StudyNest web application.
          </p>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">1. Data We Collect</h3>
          <p>
            To provide our cozy study timers, history, level progressions, and customization capabilities, we collect certain personal credentials and analytics:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Account Profiles:</strong> Your email address, display username, and Google sign-in credentials.</li>
            <li><strong>Aesthetic Settings:</strong> Custom session default times, theme selection, and alert preferences.</li>
            <li><strong>Productivity Logs:</strong> Focus sessions logged with us (dates, session durations, and optional topic text tag input).</li>
          </ul>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">2. How We Use Your Data</h3>
          <p>
            Your logs and settings are processed exclusively to run the application core:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Displaying statistics, streaks, and progression charts.</li>
            <li>Determining earned badges and levels.</li>
            <li>Saving custom default timers and aesthetic theme preferences across browser sessions.</li>
          </ul>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">3. Data Deletion and Portability (GDPR-Ready)</h3>
          <p>
            We strongly believe in complete user data ownership. Under GDPR and privacy directives, you have the right to erase all your logs. We provide an instant <strong>"Delete My Account"</strong> trigger under Nest Settings. Activating this deletes:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>All saved Study Logs.</li>
            <li>Your user statistics, streak data, and unlocked badges.</li>
            <li>Your Auth login credentials and active profile document.</li>
          </ul>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">4. Third-Party Integrations</h3>
          <p>
            StudyNest uses safe industry-standard platforms to manage state:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Firebase:</strong> Serves our authentication, profile documents, and database log syncs.</li>
            <li><strong>Stripe:</strong> Structured ready-to-run gateway for future premium upgrades (no banking info enters our servers).</li>
          </ul>

          <h3 className="text-base font-bold text-stone-800 dark:text-stone-100 pt-2">5. Contact Info</h3>
          <p>
            If you have any questions or concerns regarding this policy, feel free to contact us at <a href="mailto:support@studynest.co" className="text-indigo-500 hover:underline">support@studynest.co</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPolicy;
