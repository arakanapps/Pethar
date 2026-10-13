import { useState } from 'react';
import { WebBankingDashboard } from '../WebBankingDashboard';
import type { Language } from '../../i18n';
import { redirectToSubdomain } from '../../utils/subdomain';

interface WalletPageProps {
  lang: Language;
}

export const WalletPage = ({ lang }: WalletPageProps) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Direct access to full wallet functionality
  return (
    <div className="min-h-screen bg-slate-950">
      <WebBankingDashboard
        lang={lang}
        setLang={(newLang) => {
          localStorage.setItem('pethar_lang', newLang);
          window.location.reload();
        }}
        theme={theme}
        setTheme={setTheme}
        onExit={() => {
          redirectToSubdomain('');
        }}
      />
    </div>
  );
};