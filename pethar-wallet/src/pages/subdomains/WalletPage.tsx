import { WebBankingDashboard } from '../WebBankingDashboard';
import type { Language } from '../../i18n';
import { redirectToSubdomain } from '../../utils/subdomain';

interface WalletPageProps {
  lang: Language;
}

export const WalletPage = ({ lang }: WalletPageProps) => {
  // Direct access to full wallet functionality in light mode
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <WebBankingDashboard
        lang={lang}
        setLang={(newLang) => {
          localStorage.setItem('pethar_lang', newLang);
          window.location.reload();
        }}
        theme="light"
        setTheme={() => {}}
        onExit={() => {
          redirectToSubdomain('');
        }}
      />
    </div>
  );
};