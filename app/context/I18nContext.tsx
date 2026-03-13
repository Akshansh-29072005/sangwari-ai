import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'en' | 'hi';

interface I18nContextType {
  lang: Lang;
  isHindi: boolean;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Onboarding
  'welcome': { en: 'Welcome to Sangwari AI', hi: 'संगवारी AI में आपका स्वागत है' },
  'welcome_desc': { en: 'Your friendly community assistant. Check scheme eligibility, file complaints, and track your applications easily.', hi: 'आपका मित्रवत सामुदायिक सहायक। योजना पात्रता जांचें, शिकायत दर्ज करें, और अपने आवेदनों को आसानी से ट्रैक करें।' },
  'get_started': { en: 'Get Started', hi: 'शुरू करें' },

  // Home
  'my_schemes': { en: 'My Schemes Dashboard', hi: 'मेरी योजनाएं डैशबोर्ड' },
  'eligible_schemes': { en: 'Eligible Schemes', hi: 'पात्र योजनाएं' },
  'registered': { en: 'Registered', hi: 'पंजीकृत' },
  'application_status': { en: 'Application Status', hi: 'आवेदन स्थिति' },
  'grievance_tracking': { en: 'Grievance Tracking', hi: 'शिकायत ट्रैकिंग' },
  'ask_question': { en: 'Ask a question or file a complaint...', hi: 'प्रश्न पूछें या शिकायत दर्ज करें...' },
  'registered_schemes': { en: 'Registered Schemes', hi: 'पंजीकृत योजनाएं' },

  // Profile
  'account_settings': { en: 'Account & Settings', hi: 'खाता और सेटिंग्स' },
  'my_documents': { en: 'My Documents', hi: 'मेरे दस्तावेज' },
  'doc_desc': { en: 'Upload documents once to auto-fill scheme application forms instantly.', hi: 'योजना आवेदन फॉर्म स्वचालित भरने के लिए दस्तावेज अपलोड करें।' },
  'pan_card': { en: 'PAN Card', hi: 'पैन कार्ड' },
  'driving_license': { en: 'Driving License', hi: 'ड्राइविंग लाइसेंस' },
  'income_cert': { en: 'Income Certificate', hi: 'आय प्रमाण पत्र' },
  'uploaded': { en: 'Uploaded', hi: 'अपलोडेड' },
  'preferences': { en: 'Preferences', hi: 'प्राथमिकताएं' },
  'dark_mode': { en: 'Dark Mode', hi: 'डार्क मोड' },
  'hindi_lang': { en: 'हिंदी Language', hi: 'हिंदी भाषा' },
  'change_mpin': { en: 'Change MPIN', hi: 'MPIN बदलें' },
  'faq_support': { en: 'FAQ & Support', hi: 'सहायता एवं FAQ' },
  'logout': { en: 'Logout', hi: 'लॉगआउट' },
  'change_photo': { en: 'Change Photo', hi: 'फोटो बदलें' },

  // Schemes
  'search_schemes': { en: 'Search all government schemes...', hi: 'सभी सरकारी योजनाएं खोजें...' },
  'recommended': { en: 'Recommended for You', hi: 'आपके लिए अनुशंसित' },
  'search_results': { en: 'Search Results', hi: 'खोज परिणाम' },
  'schemes_found': { en: 'schemes found', hi: 'योजनाएं मिलीं' },
  'not_eligible': { en: 'Not Eligible', hi: 'पात्र नहीं' },
  'no_schemes_found': { en: 'No schemes found', hi: 'कोई योजना नहीं मिली' },
  'try_keywords': { en: 'Try different keywords like\n"pension", "housing" or "health"', hi: 'अलग कीवर्ड आज़माएं जैसे\n"पेंशन", "आवास" या "स्वास्थ्य"' },
  'searching': { en: 'Searching schemes...', hi: 'योजनाएं खोज रहे हैं...' },
  'apply_scheme': { en: 'Apply for Scheme', hi: 'योजना के लिए आवेदन करें' },
  'autofill_active': { en: 'Auto-Fill Active', hi: 'ऑटो-फिल सक्रिय' },
  'autofill_desc': { en: 'Fields marked in green have been automatically populated from your Profile documents.', hi: 'हरे रंग से चिह्नित फ़ील्ड आपके प्रोफ़ाइल दस्तावेज़ों से स्वचालित रूप से भरे गए हैं।' },
  'submit_application': { en: 'Submit Application', hi: 'आवेदन जमा करें' },
  'upload_document': { en: 'Upload Document', hi: 'दस्तावेज अपलोड करें' },
  'auto_filled': { en: 'Auto-Filled', hi: 'ऑटो-भरा' },

  // Voice Assistant
  'listening': { en: 'Listening...', hi: 'सुन रहे हैं...' },
  'speak_now': { en: 'Speak now — say anything\nin Hindi or English', hi: 'अब बोलें — हिंदी या\nअंग्रेजी में कुछ भी कहें' },
  'understanding': { en: 'Understanding...', hi: 'समझ रहे हैं...' },
  'show_schemes': { en: 'Show Schemes', hi: 'योजनाएं दिखाएं' },
  'ask_again': { en: 'Ask Again', hi: 'फिर से पूछें' },

  // Auth
  'phone_number': { en: 'Phone Number', hi: 'फोन नंबर' },
  'send_otp': { en: 'Send OTP', hi: 'OTP भेजें' },
  'enter_otp': { en: 'Enter OTP', hi: 'OTP दर्ज करें' },
  'verify': { en: 'Verify', hi: 'सत्यापित करें' },
  'set_mpin': { en: 'Set MPIN', hi: 'MPIN सेट करें' },
  'confirm': { en: 'Confirm', hi: 'पुष्टि करें' },

  // Common
  'since': { en: 'Since', hi: 'से' },
  'active': { en: 'Active', hi: 'सक्रिय' },
  'approved': { en: 'Approved', hi: 'स्वीकृत' },
  'match': { en: 'Match', hi: 'मैच' },
  'eligible': { en: 'Eligible', hi: 'पात्र' },
};

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  isHindi: false,
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
});

export const useI18n = () => useContext(I18nContext);

// Safe storage helper
let AsyncStorageModule: any = null;
async function getStorage() {
  if (AsyncStorageModule) return AsyncStorageModule;
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    AsyncStorageModule = mod.default;
    return AsyncStorageModule;
  } catch { return null; }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    getStorage().then(s => {
      if (s) s.getItem('app_lang').then((v: string | null) => {
        if (v === 'en' || v === 'hi') setLangState(v);
      }).catch(() => {});
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    getStorage().then(s => { if (s) s.setItem('app_lang', l).catch(() => {}); });
  };

  const toggleLang = () => setLang(lang === 'en' ? 'hi' : 'en');

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, isHindi: lang === 'hi', setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}
