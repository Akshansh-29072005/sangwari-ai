import React from 'react';
import {
    User, MapPin, Phone, Mail, CheckCircle, Globe, HelpCircle, Book, HeadphonesIcon, LogOut, Lock, Sun, Moon
} from 'lucide-react';

const ProfileSettings = ({ onBack, isDarkMode, setIsDarkMode, language, setLanguage, t }) => {
    const p = t.profilePage;
    const [activities, setActivities] = React.useState([
        { id: 1, text: 'Logged into CSC Portal', time: '09:00 AM' },
        { id: 2, text: 'Checked eligibility for Mohan Singh', time: '10:15 AM' }
    ]);

    const handleDarkModeToggle = () => {
        const newState = !isDarkMode;
        setIsDarkMode(newState);
        setActivities(prev => [
            { id: Date.now(), text: `Turned ${newState ? 'on' : 'off'} Dark Mode`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
            ...prev
        ].slice(0, 5)); // Keep only last 5 activities
    };

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <div className="discovery-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{p.title}</h2>
                    <p style={{ color: '#64748b' }}>{p.subtitle}</p>
                </div>
                <button className="btn" onClick={onBack} style={{ width: 'fit-content', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', background: 'white' }}>
                    {p.back}
                </button>
            </div>

            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                        <img src="https://i.pravatar.cc/150?u=csc" alt="Rahul Verma" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>Rahul Verma</h3>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>{t.operatorRole}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'y: 1.5rem, x: 2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{p.name} <span style={{ color: '#475569' }}>Rahul Verma</span></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{p.cscId} <span style={{ color: '#475569' }}>CG-CSC-2045</span></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{p.district} <span style={{ color: '#475569' }}>Raipur</span></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{p.mobile} <span style={{ color: '#475569' }}>98XXXXXXX</span></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{p.email} <span style={{ color: '#475569' }}>rahul.verma@cg-isc.</span></div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Language Preferences */}
                <div className="card" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{p.langPrefs}</h4>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                            onClick={() => setLanguage('en')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e293b', fontWeight: 500 }}>
                                <Globe size={18} color="#64748b" /> English
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${language === 'en' ? '#1e40af' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {language === 'en' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e40af' }}></div>}
                                </div>
                                {language === 'en' && (
                                    <div style={{ background: '#0d9488', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle size={12} color="white" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                            onClick={() => setLanguage('hi')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e293b', fontWeight: 500 }}>
                                <Globe size={18} color="#64748b" /> हिंदी
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${language === 'hi' ? '#1e40af' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {language === 'hi' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e40af' }}></div>}
                                </div>
                                {language === 'hi' && (
                                    <div style={{ background: '#0d9488', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle size={12} color="white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Preferences */}
                <div className="card" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{p.sysPrefs}</h4>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                {p.enableNotifs}
                            </div>
                            <div style={{ width: '40px', height: '20px', background: '#0d9488', borderRadius: '10px', position: 'relative' }}>
                                <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>
                                <Moon size={18} color="#1e40af" />
                                {p.darkMode}
                            </div>
                            <div 
                                onClick={handleDarkModeToggle}
                                style={{ 
                                    width: '40px', height: '20px', 
                                    background: isDarkMode ? '#0d9488' : '#cbd5e1', 
                                    borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ 
                                    width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', 
                                    left: isDarkMode ? '22px' : '2px', top: '2px', transition: 'left 0.2s' 
                                }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.9rem' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                {p.autoSave}
                            </div>
                            <div style={{ width: '40px', height: '20px', background: '#0d9488', borderRadius: '10px', position: 'relative' }}>
                                <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="card" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', gridColumn: '2' }}>
                     <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{t.recentActivity}</h4>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activities.map((activity) => (
                            <div key={activity.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ color: '#475569', fontSize: '0.9rem' }}>{activity.text}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{activity.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Help Center */}
                <div className="card" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', gridColumn: '2' }}>
                     <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h4 style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{p.helpCenter}</h4>
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e3a8a', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                            <Book size={18} /> {p.openGuide}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e3a8a', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                            <HeadphonesIcon size={18} /> {p.contactSupport}
                        </div>
                    </div>
                </div>

            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600, flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <User size={18} /> {p.updateProfile}
                </button>
                <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600, flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Lock size={18} /> {p.changePassword}
                </button>
                <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600, flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <LogOut size={18} /> {p.logout}
                </button>
            </div>
            
        </div>
    );
};

export default ProfileSettings;
