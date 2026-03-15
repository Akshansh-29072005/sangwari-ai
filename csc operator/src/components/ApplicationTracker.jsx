import React, { useState, useEffect } from 'react';
import {
    Briefcase, Clock, CheckCircle, XCircle, Search,
    Filter, ChevronRight, User, FileText, Building2,
    AlertTriangle, Phone, Mail, Download, Edit3, MessageSquare, X,
    ArrowRight,
    MoreVertical,
    Plus
} from 'lucide-react';

const ApplicationTracker = ({ onBack }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [appHistory, setAppHistory] = useState([]);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Registration Form State
    const [formData, setFormData] = useState({
        citizen_name: '',
        mobile_number: '',
        service_type: 'Income Certificate',
        operator_id: 'CSC-RAIPUR-001'
    });

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:8000/applications');
            const data = await res.json();
            setApplications(data);
            if (data.length > 0 && !selectedApp) {
                handleSelectApp(data[0]);
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleSelectApp = async (app) => {
        setSelectedApp(app);
        try {
            const res = await fetch(`http://localhost:8000/applications/${app.id}/timeline`);
            const data = await res.json();
            setAppHistory(data);
        } catch (err) {
            console.error("Error fetching timeline:", err);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/applications/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error("Registration failed");
            
            setShowRegisterModal(false);
            setFormData({ citizen_name: '', mobile_number: '', service_type: 'Income Certificate', operator_id: 'CSC-RAIPUR-001' });
            fetchApplications();
        } catch (err) {
            alert("Registration failed");
        }
    };

    const getStatusClass = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('approved') || s.includes('resolved')) return 'status-approved';
        if (s.includes('rejected')) return 'status-rejected';
        if (s.includes('review') || s.includes('investigation')) return 'status-review';
        return 'status-pending';
    };

    return (
        <div className="container">
            <div className="discovery-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Application Tracker & SLA Monitor</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Track real-time citizen applications and monitor service delivery deadlines.</p>
                    <button className="btn" onClick={onBack} style={{ width: 'fit-content', padding: '0.25rem 0' }}>
                        ← Back to Dashboard
                    </button>
                </div>
                <button className="btn btn-emerald" onClick={() => setShowRegisterModal(true)}>
                    <Plus size={18} /> Register New Service
                </button>
            </div>

            <div className="tracker-metrics">
                <div className="metric-thumb" style={{ background: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Briefcase size={20} />
                        <div className="value">{applications.length}</div>
                    </div>
                    <h4>Total Lifelong Requests</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Active applications in system</p>
                </div>
                <div className="metric-thumb" style={{ background: '#f97316' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Clock size={20} />
                        <div className="value">{applications.filter(a => a.status === 'Submitted' || a.status === 'Pending').length}</div>
                    </div>
                    <h4>Awaiting Processing</h4>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', marginTop: '0.5rem' }}>
                        <div style={{ width: '40%', height: '100%', background: 'white', borderRadius: '2px' }}></div>
                    </div>
                </div>
                <div className="metric-thumb" style={{ background: '#10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <CheckCircle size={20} />
                        <div className="value">{applications.filter(a => a.status === 'Approved').length}</div>
                    </div>
                    <h4>Success Completion</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Approved & Issued</p>
                </div>
                <div className="metric-thumb" style={{ background: '#ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <AlertTriangle size={20} />
                        <div className="value">{applications.filter(a => a.is_delayed).length}</div>
                    </div>
                    <h4>Critical SLA Breaches</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Delayed applications flagged</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div className="filter-bar" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '6px', flex: 1 }}>
                        <Search size={18} color="#64748b" style={{ marginRight: '0.5rem' }} />
                        <input 
                            type="text" 
                            placeholder="Search by Applicant Name or ID..." 
                            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.9rem' }} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="select-filter"><option>Status</option></select>
                    <select className="select-filter"><option>Department</option></select>
                </div>
            </div>

            <div className="tracker-grid">
                <div className="portal-left">
                    <div className="card shadow-sm">
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                            <span>Live Application Queue</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Refreshing in real-time</span>
                        </div>
                        <div className="table-container" style={{ border: 'none', maxHeight: '500px', overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading applications...</div>
                            ) : (
                                <table style={{ width: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                                        <tr>
                                            <th>ID</th>
                                            <th>Citizen</th>
                                            <th>Service</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>SLA Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.filter(a => a.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.includes(searchTerm)).map((app, idx) => (
                                            <tr key={idx} onClick={() => handleSelectApp(app)} style={{ cursor: 'pointer', background: selectedApp?.id === app.id ? '#f0f9ff' : 'transparent' }}>
                                                <td style={{ fontWeight: 600, color: '#1a8461' }}>{app.id}</td>
                                                <td>{app.citizen_name}</td>
                                                <td>{app.service}</td>
                                                <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.department}</td>
                                                <td><span className={`status-badge ${getStatusClass(app.status)}`}>{app.status}</span></td>
                                                <td>
                                                    {app.is_delayed ? (
                                                        <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                            <AlertTriangle size={12} /> DELAYED
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#059669', fontSize: '0.75rem' }}>ON-TIME</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                <div className="portal-right">
                    {selectedApp ? (
                        <div className="sidebar-card">
                            <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} />
                                    <span>{selectedApp.id}</span>
                                </div>
                                <span className={`status-badge ${getStatusClass(selectedApp.status)}`} style={{ fontSize: '0.7rem' }}>{selectedApp.status}</span>
                            </div>
                            <div className="sidebar-content">
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                        {selectedApp.citizen_name[0]}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedApp.citizen_name}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedApp.service}</p>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Lifecycle Timeline</h4>
                                    <div className="timeline" style={{ paddingLeft: '0.5rem' }}>
                                        {appHistory.map((h, i) => (
                                            <div key={i} style={{ position: 'relative', paddingLeft: '1.5rem', paddingBottom: '1.5rem', borderLeft: i === appHistory.length - 1 ? 'none' : '2px solid #e2e8f0' }}>
                                                <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: i === 0 ? '#10b981' : '#3b82f6', border: '2px solid white' }}></div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{h.status}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>by {h.updated_by} • {new Date(h.timestamp).toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ background: selectedApp.is_delayed ? '#fef2f2' : '#f0fdf4', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${selectedApp.is_delayed ? '#ef4444' : '#10b981'}`, marginBottom: '1.5rem' }}>
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedApp.is_delayed ? '#b91c1c' : '#065f46', marginBottom: '0.5rem' }}>
                                        {selectedApp.is_delayed ? <AlertTriangle size={16} /> : <CheckCircle size={16} />} 
                                        {selectedApp.is_delayed ? 'Escalated to Senior Officer' : 'Service delivery is on track'}
                                    </h5>
                                    <p style={{ fontSize: '0.75rem', color: selectedApp.is_delayed ? '#991b1b' : '#064e3b' }}>
                                        {selectedApp.is_delayed ? 'This application exceeded the SLA. Citizen notified.' : 'Application is currently within the expected resolution time.'}
                                    </p>
                                </div>

                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Citizen Contact</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                        <Phone size={16} color="#1e40af" />
                                        <span style={{ fontSize: '0.85rem', flex: 1 }}>+91 {selectedApp.mobile}</span>
                                        <button className="btn btn-emerald" style={{ padding: '0.4rem 0.8rem', background: '#2d7a8d' }}>SMS Sent</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                            <div>
                                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>Select an application to view lifecycle details and SLA status</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Modal */}
            {showRegisterModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>New Service Registration</h3>
                            <X size={20} cursor="pointer" onClick={() => setShowRegisterModal(false)} />
                        </div>
                        <form onSubmit={handleRegister}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Citizen Full Name</label>
                                <input 
                                    className="select-filter" 
                                    style={{ width: '100%', background: '#f8fafc' }} 
                                    placeholder="e.g. Rahul Sharma"
                                    required
                                    value={formData.citizen_name}
                                    onChange={e => setFormData({...formData, citizen_name: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Mobile Number (for SMS)</label>
                                <input 
                                    className="select-filter" 
                                    style={{ width: '100%', background: '#f8fafc' }} 
                                    placeholder="10 digit number"
                                    required
                                    value={formData.mobile_number}
                                    onChange={e => setFormData({...formData, mobile_number: e.target.value})}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Service Type</label>
                                <select 
                                    className="select-filter" 
                                    style={{ width: '100%', background: '#f8fafc' }}
                                    value={formData.service_type}
                                    onChange={e => setFormData({...formData, service_type: e.target.value})}
                                >
                                    <option>Income Certificate</option>
                                    <option>Caste Certificate</option>
                                    <option>Widow Pension</option>
                                    <option>Farmer Insurance</option>
                                    <option>Birth Certificate</option>
                                </select>
                            </div>
                            <button className="btn btn-emerald" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                                Submit to Government Portal
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationTracker;
