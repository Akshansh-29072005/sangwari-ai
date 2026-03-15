import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo1.png';
import {
  Users, AlertTriangle, MessageSquare, CheckCircle,
  ChevronRight, Bell, MessageCircle, Power, Globe,
  ShieldPlus, Search, UserPlus, ClipboardCheck, MessageSquarePlus, BarChart2
} from 'lucide-react';
import CitizenServicePortal from './components/CitizenServicePortal';
import BeneficiaryDiscovery from './components/BeneficiaryDiscovery';
import DocumentVerification from './components/DocumentVerification';
import ApplicationTracker from './components/ApplicationTracker';
import GrievanceManagement from './components/GrievanceManagement';
import NotificationsAlerts from './components/NotificationsAlerts';
import AIHelpAssistant from './components/AIHelpAssistant';
import ProfileSettings from './components/ProfileSettings';
import SchemeEligibility from './components/SchemeEligibility';
import EligibleCandidates from './components/EligibleCandidates';
import OfficerDashboard from './components/OfficerDashboard';
import CitizenTracker from './components/CitizenTracker';
import SchemeApplicationForm from './components/SchemeApplicationForm';
import RejectionRiskCard from './components/RejectionRiskCard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { translations } from './utils/translations';
import './index.css';


const Header = ({ title, onNavigate, onToggleLanguage, language }) => (
  <header className="header">
    <div className="logo-section">
      <div className="logo-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
        <img src={logoImg} alt="Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
      </div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Sangwari AI</h1>
    </div>
    <div className="user-profile">
      <div style={{ display: 'flex', gap: '1rem', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '1rem' }}>
        <button 
          className="btn" 
          onClick={onToggleLanguage}
          style={{ background: 'transparent', color: 'white', padding: 0 }}
        >
          English | हिंदी
        </button>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => onNavigate('notifications')}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff4d4f', borderRadius: '50%', width: '12px', height: '12px', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</span>
        </div>
        <MessageCircle size={20} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => onNavigate('profile')}>
        <img src="https://i.pravatar.cc/150?u=csc" alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white' }} />
        <span style={{ fontSize: '0.9rem' }}>CSC Operator</span>
        <ChevronRight size={16} />
      </div>
    </div>
  </header>
);

const Dashboard = ({ onNavigate, onShowRejection, t }) => (
  <main className="container">
    <section style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t.welcomeTitle}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t.welcomeSubtitle}</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-emerald" onClick={() => onNavigate('portal')} style={{ padding: '0.8rem 1.5rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)' }}>
          <UserPlus size={20} /> {t.citizenService}
        </button>
        <button className="btn" onClick={() => onNavigate('discovery')} style={{ padding: '0.8rem 1.5rem', background: '#2d7a8d', color: 'white', boxShadow: '0 4px 14px rgba(45, 122, 141, 0.2)' }}>
          <Search size={20} /> {t.beneficiaryDiscovery}
        </button>
        <button className="btn" onClick={() => onNavigate('eligible')} style={{ padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, #15803d, #059669)', color: 'white', boxShadow: '0 4px 14px rgba(21, 128, 61, 0.25)', fontWeight: 700 }}>
          <CheckCircle size={20} /> ✅ {t.eligibleCandidates}
        </button>
      </div>
    </section>


    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
      <span style={{ fontWeight: 600 }}>{t.appsHandled}</span>
    </div>

    <section className="metric-grid">
      <MetricCard
        icon={Users}
        title={t.metrics.eligible.title}
        value={t.metrics.eligible.value}
        subValue={t.metrics.eligible.subValue}
        tags={t.metrics.eligible.tags}
        color="emerald"
        btnText={t.metrics.eligible.btnText}
        onClick={() => onNavigate('eligible')}
      />

      <MetricCard
        icon={MessageSquare}
        title={t.metrics.grievance.title}
        value={t.metrics.grievance.value}
        subValue={t.metrics.grievance.subValue}
        tags={t.metrics.grievance.tags}
        color="orange"
        btnText={t.metrics.grievance.btnText}
        onClick={() => onNavigate('grievance')}
      />
      <MetricCard
        icon={AlertTriangle}
        title={t.metrics.highRisk.title}
        value={t.metrics.highRisk.value}
        subValue={t.metrics.highRisk.subValue}
        tags={t.metrics.highRisk.tags}
        color="red"
        btnText={t.metrics.highRisk.btnText}
        onClick={() => onNavigate('verification')}
      />
    </section>

    <div className="card" style={{ marginTop: '2rem' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardCheck size={20} color="var(--navy)" />
          {t.recentActivity}
        </h3>
        <button className="btn" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.85rem' }}>{t.viewAll}</button>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <CheckCircle size={18} color="var(--emerald)" />
            <span style={{ fontSize: '0.9rem' }}>{t.activity.applicationApproved} <span style={{ fontWeight: 600 }}>#SCHEME001</span></span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.activity.justNow}</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <AlertTriangle size={18} color="var(--orange)" />
            <span style={{ fontSize: '0.9rem' }}>{t.activity.grievanceRaised} <span style={{ fontWeight: 600 }}>#GRV005</span></span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.activity.minAgo(10)}</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={18} color="var(--navy)" />
            <span style={{ fontSize: '0.9rem' }}>{t.activity.newCitizenRegistered} <span style={{ fontWeight: 600 }}>{t.activity.citizenName}</span></span>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.activity.hourAgo(1)}</span>
          </li>
        </ul>
      </div>
    </div>

    <section className="detail-grid">
      <DocumentCheck onFix={() => onNavigate('verification')} t={t} />
      <ApprovalProbability t={t} />
    </section>

    <section className="action-bar">
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#334155', color: 'white', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
          <Globe size={16} /> {t.grievanceTracking}
        </div>
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {[
            { label: t.checkSchemeEligibility, icon: MessageSquare, bg: '#67a474', action: 'eligibility' },
            { label: t.registerGrievance, icon: MessageSquarePlus, bg: '#e54d3b', action: 'grievance' },
            { label: t.officerDashboard, icon: ShieldPlus, bg: '#7c3aed', action: 'officer' },
            { label: t.trackRequest, icon: Globe, bg: '#0891b2', action: 'citizen_track' },
            { label: t.verifyDocuments, icon: ClipboardCheck, bg: '#2b589e', action: 'verification' },
            { label: t.trackApplication, icon: Globe, bg: '#2b589e', action: 'tracker' },
            { label: t.citizenEnrollment, icon: Users, bg: '#1a8461', action: 'portal' },
            { label: 'AI Rejection Risk', icon: AlertTriangle, bg: '#ef4444', action: '__modal_rejection__' },
            { label: 'Analytics', icon: BarChart2, bg: '#6d28d9', action: 'analytics' }
          ].map((item, idx) => (
            <div key={idx}
            onClick={() => {
                if (item.action === '__modal_rejection__') {
                  onShowRejection();
                } else if (item.action) {
                  onNavigate(item.action);
                }
              }}
              style={{
                background: item.bg,
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.8rem',
                fontWeight: 500
              }}>
              <item.icon size={24} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <h4 style={{ color: '#1e40af', fontWeight: 600 }}>{t.aiSuggestedScheme}</h4>
        </div>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.citizenProfileDetected}:</p>
            <p style={{ fontSize: '0.85rem' }}><span style={{ fontWeight: 700 }}>{t.widow} | {t.age(56)} | {t.rationCardHolder}</span></p>
          </div>

          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.suggestedScheme}:</p>
            <div style={{ background: '#f1f5f9', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
              {t.mukhyamantriPension}
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('portal')}>
            {t.startApplication} <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="card" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} color="#1e40af" />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{t.needHelp}</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{t.getInstantSupport}</p>
          </div>
        </div>
        <button className="btn" style={{ width: '100%', background: '#1e40af', color: 'white', justifyContent: 'center', fontWeight: 600, padding: '0.75rem' }} onClick={() => onNavigate('ai_assistant')}>
          {t.askAIAssistant}
        </button>
      </div>
    </section>
  </main>
);

// Helper Components
const MetricCard = ({ icon: Icon, title, value, subValue, tags = [], color, btnText, onClick }) => (
  <div className="card">
    <div style={{ background: `var(--${color})`, color: 'white', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Icon size={20} />
      <span style={{ fontWeight: 500 }}>{title}</span>
    </div>
    <div style={{ padding: '1.25rem' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: `var(--${color})` }}>{value}</span>
        <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{subValue}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        {tags.map((tag, i) => (
          <span key={i}>{tag}{i < tags.length - 1 ? ' | ' : ''}</span>
        ))}
      </div>
      <div style={{ textAlign: 'right' }}>
        <button className={`btn btn-${color}`} onClick={onClick}>{btnText}</button>
      </div>
    </div>
  </div>
);

const DocumentCheck = ({ onFix, t }) => (
  <div className="card" style={{ height: '100%' }}>
    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e40af' }}>
      <Users size={20} />
      <span style={{ fontWeight: 600 }}>{t.documentCheck}</span>
    </div>
    <div style={{ padding: '1.25rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <CheckCircle size={14} color="var(--emerald)" /> {t.aadhaarMismatch}
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <CheckCircle size={14} color="var(--emerald)" /> {t.missingIncomeCert}
        </p>
      </div>
      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--navy)' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.recommendedAction}:</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.askApplicantUpdate}</p>
      </div>
      <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
        <button className="btn btn-primary" onClick={onFix}>{t.fixNow} <ChevronRight size={16} /></button>
      </div>
    </div>
  </div>
);

const ApprovalProbability = ({ t }) => (
  <div className="card" style={{ height: '100%' }}>
    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e40af' }}>
      <Globe size={20} />
      <span style={{ fontWeight: 600 }}>{t.applicationApprovalProbability}</span>
    </div>
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ fontWeight: 600 }}>{t.approvalChance}: <span style={{ fontSize: '1.25rem' }}>62%</span></span>
        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: '62%', height: '100%', background: 'var(--navy)' }}></div>
        </div>
      </div>
      <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{t.riskLevel}: <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{t.medium}</span></p>
      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--navy)' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.aiRecommendation}:</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.verifyAddressFields}</p>
      </div>
      <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
        <button className="btn btn-primary" style={{ background: '#233876' }}>{t.viewGuidance} <ChevronRight size={16} /></button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [page, setPage] = useState('dashboard');
  const [currentCitizen, setCurrentCitizen] = useState(null);
  const [currentScheme, setCurrentScheme] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleApply = (citizen, scheme) => {
    setCurrentCitizen(citizen);
    setCurrentScheme(scheme);
    setPage('apply_form');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const getPageTitle = () => {
    switch (page) {
      case 'eligibility': return t.nav.eligibility;
      case 'portal': return t.nav.portal;
      case 'discovery': return t.nav.discovery;
      case 'verification': return t.nav.verification;
      case 'tracker': return t.nav.tracker;
      case 'citizen_track': return 'Track Your Complaint';
      case 'analytics': return 'Analytics Dashboard';
      case 'grievance': return t.nav.grievance;
      case 'notifications': return t.nav.notifications;
      case 'ai_assistant': return t.nav.aiAssistant;
      case 'profile': return t.nav.profile;
      case 'eligible': return t.nav.eligible;
      case 'officer': return t.nav.officer;
      case 'apply_form': return t.nav.apply;
      default: return t.nav.default;
    }
  };


  return (
    <div className="dashboard">
      <Header 
        title={getPageTitle()} 
        onNavigate={setPage} 
        onToggleLanguage={toggleLanguage}
        language={language}
      />
      {page === 'dashboard' && <Dashboard onNavigate={setPage} onShowRejection={() => setShowRejectionModal(true)} t={t} />}
      {page === 'portal' && <CitizenServicePortal onBack={() => setPage('dashboard')} />}
      {page === 'discovery' && <BeneficiaryDiscovery onBack={() => setPage('dashboard')} />}
      {page === 'verification' && <DocumentVerification onBack={() => setPage('dashboard')} />}
      {page === 'tracker' && <ApplicationTracker onBack={() => setPage('dashboard')} />}
      {page === 'citizen_track' && <CitizenTracker onBack={() => setPage('dashboard')} />}
      {page === 'analytics' && <AnalyticsDashboard onBack={() => setPage('dashboard')} />}
      {page === 'grievance' && <GrievanceManagement onBack={() => setPage('dashboard')} />}
      {page === 'notifications' && <NotificationsAlerts onBack={() => setPage('dashboard')} />}
      {page === 'ai_assistant' && <AIHelpAssistant onBack={() => setPage('dashboard')} />}
      {page === 'profile' && (
        <ProfileSettings 
          onBack={() => setPage('dashboard')} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          language={language}
          setLanguage={setLanguage}
          t={t}
        />
      )}
      {page === 'eligibility' && <SchemeEligibility onBack={() => setPage('dashboard')} onApply={handleApply} />}
      {page === 'eligible' && <EligibleCandidates onBack={() => setPage('dashboard')} />}
      {page === 'officer' && <OfficerDashboard onBack={() => setPage('dashboard')} />}
      {page === 'tracker' && <CitizenTracker onBack={() => setPage('dashboard')} />}
      {page === 'apply_form' && (
        <SchemeApplicationForm
          citizen={currentCitizen}
          scheme={currentScheme}
          onBack={() => setPage('eligibility')}
          onSuccess={() => setPage('notifications')}
        />
      )}
      {showRejectionModal && <RejectionRiskCard onClose={() => setShowRejectionModal(false)} />}
    </div>
  );
};

export default App;
