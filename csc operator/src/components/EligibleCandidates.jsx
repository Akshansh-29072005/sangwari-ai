import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, Loader2, Search, Filter, Download, RefreshCw, ChevronDown, ChevronUp, UserCheck, Clock, AlertCircle, XCircle, Bell, Send, Check } from 'lucide-react';

const SCHEME_COLORS = {
    'Old Age Pension':            { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', icon: '👴' },
    'Widow Pension':              { bg: '#fdf4ff', border: '#d8b4fe', text: '#7e22ce', icon: '👩‍👧' },
    'Civil Service Income Benefits':{ bg: '#f0fdf4', border: '#86efac', text: '#15803d', icon: '🏛️' },
    'Scholarships':               { bg: '#fff7ed', border: '#fdba74', text: '#c2410c', icon: '🎓' },
    'Family Assistance Scheme':   { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', icon: '🏠' },
};

const SCHEME_IDS = [
    { id: null, label: 'All Schemes' },
    { id: 1, label: '👴 Old Age Pension' },
    { id: 2, label: '👩‍👧 Widow Pension' },
    { id: 3, label: '🏛️ Civil Service' },
    { id: 4, label: '🎓 Scholarships' },
    { id: 5, label: '🏠 Family Assistance' },
];

const CASTE_FILTERS = [null, 'SC', 'ST', 'OBC', 'General'];

const SummaryCard = ({ label, value, color, icon }) => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: `1px solid #f1f5f9`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{label}</div>
        </div>
    </div>
);

const CandidateRow = ({ c, expanded, onToggle, onNotify }) => {
    const [notifying, setNotifying] = useState(false);
    const scheme = SCHEME_COLORS[c.scheme_name] || { bg: '#f8fafc', border: '#e2e8f0', text: '#475569', icon: '📋' };
    return (
        <React.Fragment>
            <tr
                onClick={onToggle}
                style={{ cursor: 'pointer', background: expanded ? '#f8fafc' : 'white', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
            >
                <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{c.full_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ID: {c.citizen_id} · {c.mobile_number}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                    {c.age}y · {c.gender}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#475569' }}>
                    <div>{c.district}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{c.village_or_city}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ background: scheme.bg, color: scheme.text, border: `1px solid ${scheme.border}`, borderRadius: '20px', padding: '0.25rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        {scheme.icon} {c.scheme_name}
                    </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#475569' }}>
                    ₹{Number(c.annual_income).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                    {c.already_enrolled ? (
                        <span style={{ background: '#f0fdf4', color: '#16a34a', border:'1px solid #86efac', borderRadius:'20px', padding:'0.2rem 0.6rem', fontSize:'0.72rem', fontWeight:700 }}>✓ Enrolled</span>
                    ) : (
                        <span style={{ background: '#fef9c3', color: '#a16207', border:'1px solid #fde047', borderRadius:'20px', padding:'0.2rem 0.6rem', fontSize:'0.72rem', fontWeight:700 }}>⏳ Pending</span>
                    )}
                    {c.has_anomaly_flag && (
                        <span style={{ background: '#fef2f2', color: '#dc2626', border:'1px solid #fca5a5', borderRadius:'20px', padding:'0.2rem 0.6rem', fontSize:'0.72rem', fontWeight:700, display:'block', marginTop:'0.25rem' }}>⚠ Anomaly</span>
                    )}
                    {c.notified && (
                        <span style={{ background: '#e0f2fe', color: '#0369a1', border:'1px solid #7dd3fc', borderRadius:'20px', padding:'0.2rem 0.6rem', fontSize:'0.72rem', fontWeight:700, display:'block', marginTop:'0.25rem' }}>✉ Notified</span>
                    )}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {!c.notified && !c.already_enrolled && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setNotifying(true); onNotify(c.citizen_id, c.scheme_id).finally(() => setNotifying(false)); }}
                                disabled={notifying}
                                title="Send Notification"
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            >
                                {notifying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} color="#64748b" />}
                            </button>
                        )}
                        <div style={{ color: '#94a3b8' }}>
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={7} style={{ padding: '0 1rem 1rem 1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', borderTop: `2px solid ${scheme.border}`, paddingTop: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Personal Details</div>
                                <div style={{ fontSize: '0.82rem', lineHeight: 1.8 }}>
                                    <strong>DOB:</strong> {c.dob}<br />
                                    <strong>Caste:</strong> {c.caste}<br />
                                    <strong>Occupation:</strong> {c.occupation}<br />
                                    <strong>Aadhaar:</strong> {c.aadhar_number?.replace(/(\d{4})/g, '$1 ').trim()}<br />
                                    <strong>Mobile:</strong> {c.mobile_number}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Address</div>
                                <div style={{ fontSize: '0.82rem', lineHeight: 1.8, color: '#475569' }}>
                                    {c.address}<br />
                                    {c.village_or_city}, {c.district}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginTop: '0.75rem', marginBottom: '0.4rem' }}>Eligibility Rules Matched</div>
                                <div>
                                    {c.matched_rules.map((rule, i) => (
                                        <span key={i} style={{ display: 'inline-block', background: scheme.bg, color: scheme.text, border: `1px solid ${scheme.border}`, borderRadius: '4px', padding: '0.15rem 0.4rem', fontSize: '0.72rem', marginRight: '0.25rem', marginBottom: '0.25rem', fontFamily: 'monospace' }}>
                                            {rule}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>Scheme Details</div>
                                <div style={{ background: scheme.bg, border: `1px solid ${scheme.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.82rem', color: scheme.text }}>
                                    <strong>{scheme.icon} {c.scheme_name}</strong>
                                    <p style={{ marginTop: '0.4rem', opacity: 0.9 }}>{c.scheme_description}</p>
                                    <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', opacity: 0.8 }}>Dept: {c.scheme_department}</div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
};

const EligibleCandidates = ({ onBack }) => {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [search, setSearch] = useState('');
    const [schemeFilter, setSchemeFilter] = useState(null);
    const [casteFilter, setCasteFilter] = useState(null);
    const [enrollFilter, setEnrollFilter] = useState('all'); // all | pending | enrolled
    const [expandedId, setExpandedId] = useState(null);
    const [page, setPage] = useState(1);
    const perPage = 20;

    const fetchCandidates = async (sid = schemeFilter, cf = casteFilter) => {
        setLoading(true);
        try {
            let url = `http://localhost:8000/eligible-candidates`;
            const params = new URLSearchParams();
            if (sid) params.append('scheme_id', sid);
            if (cf) params.append('caste', cf);
            if (params.toString()) url += '?' + params.toString();
            const r = await fetch(url);
            const json = await r.json();
            setData(json.data || []);
            setSummary(json.summary || {});
            setPage(1);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const onNotify = async (citizenId, schemeId) => {
        try {
            await fetch('http://localhost:8000/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ citizen_id: citizenId, scheme_id: schemeId })
            });
            await fetchCandidates();
        } catch (e) { console.error(e); }
    };

    const [broadcasting, setBroadcasting] = useState(false);
    const onBroadcast = async () => {
        if (!schemeFilter) {
            alert("Please select a specific scheme to broadcast notifications.");
            return;
        }
        setBroadcasting(true);
        try {
            await fetch('http://localhost:8000/notifications/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheme_id: schemeFilter })
            });
            await fetchCandidates();
        } catch (e) { console.error(e); }
        finally { setBroadcasting(false); }
    };

    const runEngine = async () => {
        setRunning(true);
        try {
            await fetch('http://localhost:8000/eligible-candidates/run', { method: 'POST' });
            await fetchCandidates();
        } catch (e) { console.error(e); }
        finally { setRunning(false); }
    };

    useEffect(() => { runEngine(); }, []);

    const filtered = data.filter(c => {
        if (search && !c.full_name.toLowerCase().includes(search.toLowerCase()) && !String(c.citizen_id).includes(search) && !c.district.toLowerCase().includes(search.toLowerCase())) return false;
        if (enrollFilter === 'pending' && c.already_enrolled) return false;
        if (enrollFilter === 'enrolled' && !c.already_enrolled) return false;
        return true;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    const exportCSV = () => {
        const headers = ['citizen_id','full_name','age','gender','dob','caste','district','village_or_city','occupation','annual_income','aadhar_number','mobile_number','scheme_name','eligibility_status','already_enrolled','has_anomaly_flag'];
        const rows = filtered.map(c => headers.map(h => `"${c[h] ?? ''}"`).join(','));
        const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'eligible_candidates.csv'; a.click();
    };

    return (
        <div className="container" style={{ maxWidth: '1300px' }}>
            {/* Header */}
            <div className="discovery-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #1e3a5f, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ✅ Eligible Candidates
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Auto-generated list from real citizen data — all scheme eligibility rules applied
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button onClick={onBack} className="btn" style={{ fontSize: '0.85rem' }}>← Dashboard</button>
                        <button onClick={exportCSV} className="btn" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                            <Download size={14} /> Export CSV
                        </button>
                        <button onClick={runEngine} disabled={running} style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d7a8d)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                            {running ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            {running ? 'Scanning...' : 'Re-run Engine'}
                        </button>
                        {schemeFilter && (
                            <button onClick={onBroadcast} disabled={broadcasting} style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                                {broadcasting ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                                {broadcasting ? 'Notifying...' : 'Notify All Eligible'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    <SummaryCard label="Total Eligible" value={summary.total_eligible?.toLocaleString()} color="#1d4ed8" icon="👥" />
                    <SummaryCard label="Pending Enrollment" value={summary.not_yet_enrolled?.toLocaleString()} color="#c2410c" icon="⏳" />
                    <SummaryCard label="Already Enrolled" value={summary.already_enrolled?.toLocaleString()} color="#16a34a" icon="✅" />
                    <SummaryCard label="Anomaly Flagged" value={summary.anomaly_flagged?.toLocaleString()} color="#dc2626" icon="⚠️" />
                </div>
            )}

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search name, ID, district..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            style={{ width: '100%', paddingLeft: '30px', padding: '0.5rem 0.75rem 0.5rem 30px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
                        />
                    </div>

                    {/* Scheme Filter */}
                    <select value={schemeFilter ?? ''} onChange={e => { const v = e.target.value ? Number(e.target.value) : null; setSchemeFilter(v); fetchCandidates(v, casteFilter); }}
                        style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', background: 'white', cursor: 'pointer' }}>
                        {SCHEME_IDS.map(s => <option key={s.id ?? 'all'} value={s.id ?? ''}>{s.label}</option>)}
                    </select>

                    {/* Caste Filter */}
                    <select value={casteFilter ?? ''} onChange={e => { const v = e.target.value || null; setCasteFilter(v); fetchCandidates(schemeFilter, v); }}
                        style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', background: 'white', cursor: 'pointer' }}>
                        {CASTE_FILTERS.map(c => <option key={c ?? 'all'} value={c ?? ''}>{c ? `Caste: ${c}` : 'All Castes'}</option>)}
                    </select>

                    {/* Enrollment Filter */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {[['all', 'All'], ['pending', '⏳ Pending'], ['enrolled', '✅ Enrolled']].map(([v, l]) => (
                            <button key={v} onClick={() => { setEnrollFilter(v); setPage(1); }}
                                style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                    borderColor: enrollFilter === v ? '#1d4ed8' : '#e2e8f0',
                                    background: enrollFilter === v ? '#eff6ff' : 'white',
                                    color: enrollFilter === v ? '#1d4ed8' : '#475569' }}>
                                {l}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                        {total.toLocaleString()} results
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                        <p>Scanning all citizens against scheme rules...</p>
                    </div>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    {['Citizen', 'Age / Gender', 'District', 'Eligible Scheme', 'Income (₹)', 'Status', ''].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paged.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No eligible candidates found for the selected filters</td></tr>
                                ) : paged.map(c => (
                                    <CandidateRow
                                        key={`${c.citizen_id}-${c.scheme_id}`}
                                        c={c}
                                        expanded={expandedId === `${c.citizen_id}-${c.scheme_id}`}
                                        onToggle={() => setExpandedId(prev => prev === `${c.citizen_id}-${c.scheme_id}` ? null : `${c.citizen_id}-${c.scheme_id}`)}
                                        onNotify={onNotify}
                                    />
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderTop: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                    Showing {((page-1)*perPage)+1}–{Math.min(page*perPage, total)} of {total}
                                </span>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                                        style={{ padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: page===1?'#f8fafc':'white', cursor: page===1?'default':'pointer', fontSize: '0.8rem' }}>
                                        ← Prev
                                    </button>
                                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                                        const pg = page <= 4 ? i+1 : page + i - 3;
                                        if (pg < 1 || pg > totalPages) return null;
                                        return (
                                            <button key={pg} onClick={() => setPage(pg)}
                                                style={{ padding: '0.3rem 0.6rem', border: '1px solid', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
                                                    borderColor: pg===page?'#1d4ed8':'#e2e8f0', background: pg===page?'#1d4ed8':'white', color: pg===page?'white':'#475569', fontWeight: pg===page?700:400 }}>
                                                {pg}
                                            </button>
                                        );
                                    })}
                                    <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                                        style={{ padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: page===totalPages?'#f8fafc':'white', cursor: page===totalPages?'default':'pointer', fontSize: '0.8rem' }}>
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EligibleCandidates;
