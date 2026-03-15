import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, CheckCircle, AlertTriangle, Clock, ArrowUpRight,
    ChevronRight, Search, FileText, Activity, XCircle
} from 'lucide-react';

const STATUS_COLORS = {
    'Pending': { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
    'Under Investigation': { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' },
    'Documents Requested': { bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd' },
    'Escalated': { bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5' },
    'Resolved': { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
};

const VALID_STATUSES = [
    'Pending',
    'Under Investigation',
    'Documents Requested',
    'Escalated',
    'Resolved'
];

const OfficerDashboard = ({ onBack }) => {
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timeline, setTimeline] = useState(null); // selected grievance for timeline view
    const [updatingId, setUpdatingId] = useState(null);
    const [slaResult, setSlaResult] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/grievances/departments/list')
            .then(r => r.json())
            .then(data => {
                setDepartments(data);
                if (data.length > 0) setSelectedDept(data[0].department);
            })
            .catch(() => {});
    }, []);

    const fetchDeptGrievances = useCallback(async (dept) => {
        if (!dept) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/grievances/department/${encodeURIComponent(dept)}`);
            const data = await res.json();
            setGrievances(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedDept) fetchDeptGrievances(selectedDept);
    }, [selectedDept, fetchDeptGrievances]);

    // WebSocket — live updates
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/grievances');
        ws.onmessage = () => { if (selectedDept) fetchDeptGrievances(selectedDept); };
        return () => ws.close();
    }, [selectedDept, fetchDeptGrievances]);

    const updateStatus = async (grievance_id, newStatus) => {
        setUpdatingId(grievance_id);
        try {
            await fetch(`http://localhost:8000/grievances/${grievance_id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchDeptGrievances(selectedDept);
        } catch (e) {
            console.error(e);
        } finally {
            setUpdatingId(null);
        }
    };

    const viewTimeline = async (grievance_id) => {
        try {
            const res = await fetch(`http://localhost:8000/grievances/${grievance_id}/timeline`);
            const data = await res.json();
            setTimeline(data);
        } catch (e) { console.error(e); }
    };

    const runSlaCheck = async () => {
        setSlaResult(null);
        try {
            const res = await fetch('http://localhost:8000/grievances/check-sla', { method: 'POST' });
            const data = await res.json();
            setSlaResult(data);
            fetchDeptGrievances(selectedDept);
        } catch (e) { console.error(e); }
    };

    const counts = {
        total: grievances.length,
        pending: grievances.filter(g => g.status === 'Pending').length,
        investigating: grievances.filter(g => g.status === 'Under Investigation').length,
        escalated: grievances.filter(g => g.status === 'Escalated').length,
        resolved: grievances.filter(g => g.status === 'Resolved').length,
    };

    return (
        <div className="container">
            {/* Timeline modal */}
            {timeline && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '12px', width: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>Complaint Timeline</h3>
                            <button onClick={() => setTimeline(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><XCircle size={20} /></button>
                        </div>

                        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1rem', marginBottom: '0.25rem' }}>{timeline.citizen_name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{timeline.district} • {timeline.department}</div>
                            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', lineHeight: 1.5 }}>{timeline.complaint_text}</div>
                        </div>

                        {/* SLA badge */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                            <div style={{ background: timeline.sla_breached ? '#fef2f2' : '#f0fdf4', border: `1px solid ${timeline.sla_breached ? '#fca5a5' : '#86efac'}`, borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: timeline.sla_breached ? '#b91c1c' : '#15803d' }}>
                                {timeline.sla_breached ? '⚠ SLA Breached' : '✓ Within SLA'} — {timeline.days_elapsed}d elapsed / {timeline.expected_resolution_time}d SLA
                            </div>
                            <div style={{ ...STATUS_COLORS[timeline.status], background: STATUS_COLORS[timeline.status]?.bg, border: `1px solid ${STATUS_COLORS[timeline.status]?.border}`, borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
                                {timeline.status}
                            </div>
                        </div>

                        {/* Timeline steps */}
                        <div style={{ position: 'relative' }}>
                            {timeline.timeline && timeline.timeline.map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === timeline.timeline.length - 1 ? '#1e3a8a' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CheckCircle size={14} color={idx === timeline.timeline.length - 1 ? 'white' : '#94a3b8'} />
                                        </div>
                                        {idx < timeline.timeline.length - 1 && <div style={{ width: '2px', flex: 1, background: '#e2e8f0', minHeight: '24px' }} />}
                                    </div>
                                    <div style={{ paddingBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{step.status}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            by {step.updated_by} • {step.updated_at ? new Date(step.updated_at).toLocaleString() : '—'}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {timeline.escalations && timeline.escalations.length > 0 && timeline.escalations.map((esc, idx) => (
                                <div key={idx} style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem' }}>
                                    <div style={{ fontWeight: 600, color: '#b91c1c', fontSize: '0.85rem' }}>⚠ Escalated to {esc.escalated_to}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{esc.reason}</div>
                                </div>
                            ))}
                        </div>

                        {/* Quick actions */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['Under Investigation', 'Documents Requested', 'Resolved'].map(s => (
                                <button key={s} onClick={() => { updateStatus(timeline.id, s); setTimeline(null); }} style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: `1px solid ${STATUS_COLORS[s]?.border || '#e2e8f0'}`, background: STATUS_COLORS[s]?.bg || '#f8fafc', color: STATUS_COLORS[s]?.color || '#475569', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="discovery-header">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Officer Dashboard</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Manage assigned complaints, update statuses, and monitor SLA compliance.</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    <button className="btn" onClick={onBack} style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>← Back</button>
                    <button onClick={runSlaCheck} style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', color: '#b91c1c', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertTriangle size={14} /> Run SLA Check
                    </button>
                    {slaResult && (
                        <div style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#fff7ed', border: '1px solid #fdba74', color: '#c2410c', fontWeight: 600, fontSize: '0.85rem' }}>
                            {slaResult.escalated} complaints escalated
                        </div>
                    )}
                </div>
            </div>

            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total', value: counts.total, color: '#1e3a8a', bg: '#f1f5f9' },
                    { label: 'Pending', value: counts.pending, color: '#c2410c', bg: '#fff7ed' },
                    { label: 'Investigating', value: counts.investigating, color: '#1e40af', bg: '#eff6ff' },
                    { label: 'Escalated', value: counts.escalated, color: '#b91c1c', bg: '#fef2f2' },
                    { label: 'Resolved', value: counts.resolved, color: '#15803d', bg: '#f0fdf4' },
                ].map((m, i) => (
                    <div key={i} style={{ background: m.bg, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{m.label}</div>
                    </div>
                ))}
            </div>

            {/* Department selector */}
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={16} /> Department:</span>
                <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="input" style={{ minWidth: '260px', padding: '0.4rem 0.75rem' }}>
                    {departments.map(d => (
                        <option key={d.department} value={d.department}>{d.department} ({d.count})</option>
                    ))}
                </select>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{grievances.length} complaints loaded</span>
            </div>

            {/* Grievance table */}
            <div className="card">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '1rem', color: '#1e293b', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Activity size={16} color="#1e3a8a" /> Grievances — {selectedDept}
                </div>
                <div className="table-container" style={{ border: 'none' }}>
                    <table>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['ID', 'Citizen', 'District', 'Category', 'Status', 'SLA', 'Actions'].map(h => (
                                    <th key={h} style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', padding: '0.75rem 1rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading...</td></tr>
                            ) : grievances.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No complaints found for this department.</td></tr>
                            ) : grievances.map((g, idx) => {
                                const sc = STATUS_COLORS[g.status] || {};
                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: g.sla_breached && g.status !== 'Resolved' ? '#fffbeb' : 'white' }}>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#64748b', fontSize: '0.8rem' }} title={g.id}>{String(g.id).substring(0, 6)}...</td>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{g.citizen_name}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>{g.district}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem' }}>{g.category}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontWeight: 600, fontSize: '0.75rem' }}>
                                                {g.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                                            {g.sla_breached && g.status !== 'Resolved'
                                                ? <span style={{ color: '#b91c1c', fontWeight: 600 }}>⚠ {g.days_elapsed}d / {g.expected_resolution_time}d</span>
                                                : <span style={{ color: '#64748b' }}>{g.days_elapsed}d / {g.expected_resolution_time}d</span>
                                            }
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                                <button onClick={() => viewTimeline(g.id)} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e3a8a', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Timeline</button>
                                                {g.status === 'Pending' && (
                                                    <button disabled={updatingId === g.id} onClick={() => updateStatus(g.id, 'Under Investigation')} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #93c5fd', background: '#eff6ff', color: '#1e40af', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        {updatingId === g.id ? '...' : 'Investigate'}
                                                    </button>
                                                )}
                                                {g.status !== 'Resolved' && g.status !== 'Pending' && (
                                                    <button disabled={updatingId === g.id} onClick={() => updateStatus(g.id, 'Documents Requested')} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #c4b5fd', background: '#f5f3ff', color: '#6d28d9', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        {updatingId === g.id ? '...' : 'Docs Needed'}
                                                    </button>
                                                )}
                                                {g.status !== 'Resolved' && (
                                                    <button disabled={updatingId === g.id} onClick={() => updateStatus(g.id, 'Resolved')} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #86efac', background: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        {updatingId === g.id ? '...' : '✓ Resolve'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OfficerDashboard;
