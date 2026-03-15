import React, { useState, useEffect } from 'react';
import {
    MessageSquare, AlertTriangle, CheckCircle, ArrowUpRight,
    User, ShieldAlert, Upload, FileText, Phone, Search,
    ChevronRight, Save, Send, Trash2, Calendar, ClipboardList,
    Camera, Info, X, Mic, CalendarDays, Folder, Image, BookOpen,
    Lock, FileKey, FileCheck, FileWarning, BadgeAlert, FileDigit
} from 'lucide-react';

const GrievanceManagement = ({ onBack }) => {
    const [grievances, setGrievances] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [formData, setFormData] = useState({
        citizenName: '',
        mobile: '',
        aadhaar: '',
        district: 'Raipur', // default
        complaintText: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [timeline, setTimeline] = useState(null);

    const viewTimeline = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/grievances/${id}/timeline`);
            setTimeline(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchGrievances();

        const ws = new WebSocket('ws://localhost:8000/ws/grievances');
        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.event === 'NEW_GRIEVANCE') {
                fetchGrievances(); // Refresh list to get full data
            } else if (msg.event === 'STATUS_UPDATE') {
                fetchGrievances();
            }
        };

        return () => ws.close();
    }, []);

    const fetchGrievances = async () => {
        try {
            const res = await fetch('http://localhost:8000/grievances');
            const data = await res.json();
            setGrievances(data);
            
            const clsRes = await fetch('http://localhost:8000/grievance-clusters');
            const clsData = await clsRes.json();
            setClusters(clsData);
        } catch (error) {
            console.error("Failed to fetch grievances", error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.citizenName || !formData.mobile || !formData.complaintText) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:8000/grievance/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    citizen_name: formData.citizenName,
                    mobile: formData.mobile,
                    aadhaar_number: formData.aadhaar,
                    district: formData.district,
                    complaint_text: formData.complaintText
                })
            });
            const data = await res.json();
            setAiAnalysis({
                department: data.department,
                confidence: data.confidence,
                id: data.grievance_id,
                isDuplicate: data.is_duplicate,
            });
            setFormData({ citizenName: '', mobile: '', aadhaar: '', district: 'Raipur', complaintText: '' });
            fetchGrievances(); // refresh clusters and grievances list
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Under Review': return 'status-review';
            case 'Submitted': return 'status-submitted';
            case 'Resolved': return 'status-approved';
            case 'Pending': return 'status-pending';
            default: return '';
        }
    };

    return (
        <div className="container">
            {/* Timeline Modal */}
            {timeline && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '12px', width: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>Complaint Timeline</h3>
                            <button onClick={() => setTimeline(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b' }}>✕</button>
                        </div>
                        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#1e3a8a' }}>{timeline.citizen_name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{timeline.district} • {timeline.department}</div>
                            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', lineHeight: 1.5 }}>{timeline.complaint_text}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', background: timeline.sla_breached ? '#fef2f2' : '#f0fdf4', color: timeline.sla_breached ? '#b91c1c' : '#15803d', border: `1px solid ${timeline.sla_breached ? '#fca5a5' : '#86efac'}`, fontWeight: 600, fontSize: '0.8rem' }}>
                                {timeline.sla_breached ? '⚠ SLA Breached' : '✓ Within SLA'} — {timeline.days_elapsed}d / {timeline.expected_resolution_time}d
                            </span>
                            <span style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', background: '#f1f5f9', color: '#1e293b', fontWeight: 600, fontSize: '0.8rem' }}>{timeline.status}</span>
                        </div>
                        <div>
                            {(timeline.timeline || []).map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: idx === (timeline.timeline.length - 1) ? '#1e3a8a' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                                        <CheckCircle size={12} color={idx === (timeline.timeline.length - 1) ? 'white' : '#94a3b8'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{step.status}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>by {step.updated_by} • {step.updated_at ? new Date(step.updated_at).toLocaleString() : '—'}</div>
                                    </div>
                                </div>
                            ))}
                            {(timeline.escalations || []).map((esc, idx) => (
                                <div key={idx} style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem' }}>
                                    <div style={{ fontWeight: 600, color: '#b91c1c', fontSize: '0.85rem' }}>⚠ Escalated to {esc.escalated_to}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{esc.reason}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className="discovery-header">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Grievance Management</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Register and track citizen complaints related to government services.</p>
                <button className="btn" onClick={onBack} style={{ width: 'fit-content', padding: '0.25rem 0' }}>
                    ← Back to Dashboard
                </button>
            </div>

            <div className="grievance-metrics">
                <div className="grievance-metric-card" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={18} color="#0f766e" fill="#0f766e" />
                        <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>Total Complaints</div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: '#1e3a8a' }}>{Array.isArray(grievances) ? grievances.length : 0}</div>
                </div>
                <div className="grievance-metric-card" style={{ background: '#fff7ed', border: '1px solid #fdba74', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={18} color="#c2410c" fill="#c2410c" />
                        <div style={{ fontSize: '0.9rem', color: '#c2410c', fontWeight: 600 }}>Pending Complaints</div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: '#c2410c' }}>{Array.isArray(grievances) ? grievances.filter(g => g.status === 'Pending').length : 0}</div>
                </div>
                <div className="grievance-metric-card" style={{ background: '#f0fdf4', border: '1px solid #86efac', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} color="#15803d" />
                        <div style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 600 }}>Resolved Complaints</div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: '#15803d' }}>{Array.isArray(grievances) ? grievances.filter(g => g.status === 'Resolved').length : 0}</div>
                </div>
                <div className="grievance-metric-card" style={{ background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowUpRight size={20} color="#b91c1c" strokeWidth={3} />
                        <div style={{ fontSize: '0.9rem', color: '#b91c1c', fontWeight: 600 }}>Escalated</div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 600, color: '#b91c1c' }}>{Array.isArray(grievances) ? grievances.filter(g => g.status === 'Escalated').length : 0}</div>
                </div>
            </div>

            <div className="portal-grid">
                <div className="portal-left">
                    <div className="card">
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
                            Register New Grievance
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div className="grievance-form-grid">
                                <div>
                                    <div className="form-group">
                                        <label className="label">Citizen Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                            <input type="text" className="input" placeholder="Name" style={{ paddingLeft: '36px', background: '#f8fafc' }} value={formData.citizenName} onChange={e => setFormData({...formData, citizenName: e.target.value})} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="label">Mobile Number</label>
                                            <div style={{ position: 'relative' }}>
                                                <Phone size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                                <input type="text" className="input" placeholder="10-digit number" style={{ paddingLeft: '36px' }} value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Aadhaar Number <span style={{color:'#64748b', fontWeight:'normal'}}>(optional)</span></label>
                                            <input type="text" className="input" placeholder="1234 5678 9012" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label className="label">Service / Scheme Related to complaint</label>
                                        <div style={{ position: 'relative' }}>
                                          <textarea className="input" placeholder="Describe the issue faced by the citizen..." style={{ minHeight: '80px', resize: 'vertical', paddingRight: '3rem' }} value={formData.complaintText} onChange={e => setFormData({...formData, complaintText: e.target.value})}></textarea>
                                          <div style={{ position: 'absolute', right: '12px', bottom: '12px', background: '#64748b', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Mic size={14} color="white" />
                                          </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af' }}>
                                      <FileDigit size={16} /> Upload Supporting Documents
                                    </label>
                                    <div className="grievance-upload-grid">
                                        <div className="upload-box" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.25rem', display: 'flex' }}>
                                                <FileText size={28} color="#f97316" fill="#fff7ed" />
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Complaint Proof</div>
                                                <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                    <CheckCircle size={12} /> Document uploaded
                                                </div>
                                            </div>
                                        </div>
                                        <div className="upload-box" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.25rem', display: 'flex' }}>
                                                <ClipboardList size={28} color="#60a5fa" fill="#eff6ff" />
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Application Receipt</div>
                                            </div>
                                        </div>
                                        <div className="upload-box" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.25rem', display: 'flex' }}>
                                                <Camera size={28} color="#94a3b8" />
                                            </div>
                                            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Photographs</div>
                                                <button style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b' }}>
                                                    <span>↑</span> Upload
                                                </button>
                                            </div>
                                        </div>
                                        <div className="upload-box" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.25rem', display: 'flex' }}>
                                                <Folder size={28} color="#94a3b8" fill="#f8fafc" />
                                            </div>
                                            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Other Supporting Files</div>
                                                <button style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b' }}>
                                                    <span>↑</span> Upload
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                          <button className="btn" onClick={handleSubmit} disabled={isSubmitting} style={{ background: '#f8fafc', color: '#1e3a8a', border: '1px solid #e2e8f0', fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}>
                                              <Lock size={14} color="#1e3a8a" /> {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
                                          </button>
                                          <button className="btn" style={{ background: 'transparent', color: '#0f172a', fontWeight: '600', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                                              Save Draft
                                          </button>
                                        </div>
                                        <button className="btn" style={{ background: '#e06151', color: 'white', fontSize: '0.85rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            Contact Citizen <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: '1.5rem' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '1.1rem', color: '#1e293b' }}>
                            Grievance List
                        </div>
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '1rem' }}>Grievance ID</th>
                                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '1rem' }}>Citizen Name</th>
                                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '1rem' }}>Complaint Type</th>
                                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '1rem' }}>Department</th>
                                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '1rem' }}>Submission Date</th>
                                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '1rem' }}>Status</th>
                                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '1rem' }}>Action</th>
                                        <th style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', padding: '1rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grievances && Array.isArray(grievances) && grievances.map((grv, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ fontWeight: 600, color: '#64748b', padding: '1rem' }} title={grv.id}>{String(grv.id).substring(0, 8)}...</td>
                                            <td style={{ fontWeight: 600, color: '#1e293b', padding: '1rem' }}>{grv.citizen_name}</td>
                                            <td style={{ padding: '1rem', color: '#475569' }}>{grv.category}</td>
                                            <td style={{ fontSize: '0.85rem', color: '#475569', padding: '1rem' }}>{grv.department}</td>
                                            <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{new Date(grv.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem', 
                                                    padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: '600', fontSize: '0.75rem',
                                                    background: grv.status === 'Escalated' ? '#fef2f2' :
                                                                grv.status === 'Under Investigation' ? '#eff6ff' :
                                                                grv.status === 'Resolved' ? '#f0fdf4' :
                                                                grv.status === 'Documents Requested' ? '#f5f3ff' : '#fff7ed',
                                                    color: grv.status === 'Escalated' ? '#b91c1c' :
                                                           grv.status === 'Under Investigation' ? '#1e40af' :
                                                           grv.status === 'Resolved' ? '#15803d' :
                                                           grv.status === 'Documents Requested' ? '#6d28d9' : '#c2410c'
                                                }}>
                                                    {grv.status === 'Escalated' && <span>⚠</span>}
                                                    {grv.status === 'Resolved' && <span>✓</span>}
                                                    {grv.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button className="btn" onClick={() => viewTimeline(grv.id)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#1e3a8a' }}>View Timeline</button>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button className="btn" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, color: '#475569' }}>Update Status</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="portal-right">
                    <div className="sidebar-card">
                        <div className="sidebar-header" style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e293b' }}>AI Complaint Analysis</span>
                            <X size={18} color="#94a3b8" style={{ cursor: 'pointer' }} />
                        </div>
                        <div className="sidebar-content" style={{ padding: '1.25rem' }}>
                            {aiAnalysis ? (
                                <>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '56px', height: '56px', overflow: 'hidden', borderRadius: '6px' }}>
                                            <img src="https://i.pravatar.cc/150?u=aianalysis" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem', textAlign: 'right' }}>Complaint Successfully Filed</h4>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', textAlign: 'right' }}>Routed Department:</p>
                                            <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, textAlign: 'right' }}>{aiAnalysis.department}</p>
                                            {aiAnalysis.isDuplicate && (
                                                <span style={{ display: 'inline-block', float: 'right', marginTop: '0.5rem', padding: '0.2rem 0.5rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                    Semantic Duplicate Detected
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '1rem 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#1e3a8a', fontWeight: 600, fontSize: '0.85rem' }}>
                                            <FileDigit size={16} /> NLP Routing Engine
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                                                <BookOpen size={16} color="#10b981" /> Classification Confidence:<span style={{ color: '#1e293b' }}>{Math.round(aiAnalysis.confidence * 100)}%</span>
                                            </span>
                                        </div>
                                        <div className="accuracy-bar" style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', position: 'relative' }}>
                                            <div className="accuracy-fill" style={{ width: `${Math.min(100, Math.max(0, aiAnalysis.confidence * 100))}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #10b981 80%, #f59e0b 100%)', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>

                                    <div style={{ background: '#fff7ed', padding: '1.25rem', borderRadius: '8px', border: '1px solid #ffedd5', marginBottom: '1.5rem' }}>
                                        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c2410c', marginBottom: '0.5rem' }}>
                                            <CheckCircle size={18} color="#f97316" /> Status update
                                        </h5>
                                        <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>Grievance submitted via queue.</p>
                                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>Assigned ID:</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{aiAnalysis.id.substring(0, 8)}...</div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                                    Fill out the form and submit a grievance to see real-time AI classification and routing.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-card" style={{ marginTop: '1.5rem' }}>
                        <div className="sidebar-header" style={{ justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
                                <AlertTriangle size={18} color="#b91c1c" /> Semantic Clusters
                            </span>
                        </div>
                        <div className="sidebar-content" style={{ padding: '1.25rem' }}>
                            {clusters.length > 0 ? clusters.map((c, i) => (
                                <div key={i} style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>{c.primary_grievance}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                        <span>Complaints linked: <strong style={{ color: '#0f172a' }}>{c.complaint_count}</strong></span>
                                        <span>Village: <strong>Raipur</strong></span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        Department: {c.department}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>
                                    No duplicate clusters detected yet. Submit similar grievances to cluster them.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrievanceManagement;
