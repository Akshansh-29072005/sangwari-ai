import React, { useState, useEffect } from 'react';
import {
    Bell, AlertTriangle, Clock, CheckCircle, Search, Filter, 
    ChevronDown, Info, FileText, UserPlus, FileWarning, HelpCircle, UserCheck, Bot, MessageSquare
} from 'lucide-react';

const NotificationsAlerts = ({ onBack }) => {
    const tabs = ['All Alerts', 'Grievance Alerts', 'Application Status'];
    const [activeTab, setActiveTab] = useState('All Alerts');
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({ total_today: 0, critical: 0, pending: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            // Fetch Notifications
            const notifUrl = activeTab === 'All Alerts' 
                ? 'http://localhost:8000/notifications/all' 
                : `http://localhost:8000/notifications/all?category=${encodeURIComponent(activeTab)}`;
            
            const notifRes = await fetch(notifUrl);
            const notifData = await notifRes.json();
            setNotifications(notifData);

            // Fetch Stats
            const statsRes = await fetch('http://localhost:8000/notifications/stats');
            const statsData = await statsRes.json();
            setStats(statsData);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching notification data:", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [activeTab]);

    const getIcon = (type) => {
        if (type === 'Escalated' || type === 'Critical') return <AlertTriangle size={24} color="#ef4444" fill="#fef2f2" />;
        if (type === 'Resolved' || type === 'RESOLVED') return <CheckCircle size={24} color="#10b981" fill="#ecfdf5" />;
        if (type === 'REGISTERED') return <Info size={24} color="#1e40af" fill="#eff6ff" />;
        return <MessageSquare size={24} color="#64748b" fill="#f8fafc" />;
    };

    const getBorderColor = (type) => {
        if (type === 'Escalated' || type === 'Critical') return '#ef4444';
        if (type === 'Resolved' || type === 'RESOLVED') return '#10b981';
        if (type === 'REGISTERED') return '#1e40af';
        return '#cbd5e1';
    };

    const filteredNotifications = notifications.filter(n => 
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.citizen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.application_id && n.application_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.grievance_id && n.grievance_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="container">
            <div className="discovery-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Notifications & Alerts</h2>
                    <p style={{ color: '#64748b' }}>Monitor important system updates and citizen service events in real-time.</p>
                </div>
                <button className="btn" style={{ background: 'white', color: '#1e3a8a', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <CheckCircle size={16} /> Mark All as Read
                </button>
            </div>

            <div className="grievance-metrics" style={{ marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Bell size={24} fill="currentColor" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>Total Alerts Today</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: '#1e3a8a', lineHeight: 1 }}>{stats.total_today}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <AlertTriangle size={24} fill="currentColor" stroke="white" strokeWidth={1} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>Critical Alerts</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: '#ef4444', lineHeight: 1 }}>{stats.critical}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Clock size={24} fill="white" stroke="#f59e0b" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>Pending Cases</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: '#f59e0b', lineHeight: 1 }}>{stats.pending}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <CheckCircle size={24} fill="currentColor" stroke="white" strokeWidth={1} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>Resolved Today</div>
                        <div style={{ fontSize: '2rem', fontWeight: 600, color: '#10b981', lineHeight: 1 }}>{stats.resolved}</div>
                    </div>
                </div>
            </div>

            <div className="portal-grid">
                <div className="portal-left" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="card" style={{ padding: '1.25rem', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Search Alerts</h3>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type="text" 
                                    className="input" 
                                    placeholder="Search by Mobile, ID, or Message..." 
                                    style={{ paddingLeft: '2.5rem', background: '#ffffff', width: '100%' }} 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: '200px' }}>
                                <select className="input" style={{ appearance: 'none', background: '#ffffff', color: '#475569', paddingRight: '2.5rem' }}>
                                    <option>Alert Type</option>
                                </select>
                                <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                            <div style={{ position: 'relative', flex: 1, maxWidth: '150px' }}>
                                <select className="input" style={{ appearance: 'none', background: '#ffffff', color: '#475569', paddingRight: '2.5rem' }}>
                                    <option>Date</option>
                                </select>
                                <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                        {tabs.map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '99px',
                                    border: '1px solid #e2e8f0',
                                    background: activeTab === tab ? '#ffffff' : '#ffffff',
                                    color: activeTab === tab ? '#1e40af' : '#64748b',
                                    fontWeight: activeTab === tab ? 600 : 500,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    position: 'relative'
                                }}
                            >
                                {tab}
                                {activeTab === tab && <div style={{ position: 'absolute', bottom: '-2px', left: '15%', right: '15%', height: '2px', background: '#1e40af', borderRadius: '2px' }}></div>}
                            </button>
                        ))}
                    </div>

                    {/* Alert List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading real-time notifications...</div>
                        ) : filteredNotifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No notifications found.</div>
                        ) : (
                            filteredNotifications.map((n) => (
                                <div key={n.id} className="card" style={{ display: 'flex', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'visible', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: getBorderColor(n.event_type), zIndex: 1 }}></div>
                                    <div style={{ width: '4px', background: getBorderColor(n.event_type), borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}></div>
                                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', marginLeft: '2px' }}>
                                        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                            <div style={{ flexShrink: 0 }}>{getIcon(n.event_type)}</div>
                                            <div>
                                                <h4 style={{ color: getBorderColor(n.event_type), fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                    {n.event_type} - {n.application_id || n.grievance_id}
                                                </h4>
                                                <p style={{ color: '#334155', fontSize: '0.9rem', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                                                    {n.message}
                                                </p>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                                    Citizen: {n.citizen_name} &bull; <span style={{ color: '#94a3b8' }}>{new Date(n.sent_at).toLocaleString()}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="portal-right" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="card" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>Recent Logs</h3>
                        </div>
                        <div style={{ padding: '0.5rem 1.25rem' }}>
                            {notifications.slice(0, 5).map((n, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.75rem 0', borderBottom: i === 4 ? 'none' : '1px solid #f1f5f9' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: n.event_type === 'Escalated' ? '#fee2e2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {n.event_type === 'Escalated' ? <AlertTriangle size={16} color="#ef4444" /> : <Info size={16} color="#1e40af" />}
                                    </div>
                                    <div>
                                        <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.1rem' }}>{n.event_type}</h5>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.application_id || n.grievance_id} &bull; {new Date(n.sent_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                            {notifications.length === 0 && <p style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>No recent logs.</p>}
                        </div>
                    </div>

                    <div className="card" style={{ border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={24} color="#1e40af" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Need Help?</h4>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Get instant support</p>
                            </div>
                        </div>
                        <button className="btn" style={{ width: '100%', background: '#1e40af', color: 'white', justifyContent: 'center', fontWeight: 600, padding: '0.75rem' }}>
                            Ask AI Assistant
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NotificationsAlerts;
