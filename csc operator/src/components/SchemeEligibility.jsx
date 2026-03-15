import React from 'react';
import {
    Search, CheckCircle, XCircle, AlertTriangle, User, MapPin,
    IndianRupee, ShieldCheck, FileText, ChevronRight, X, Loader,
    BadgeCheck, BadgeX, Info
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Shimmer skeleton
// ─────────────────────────────────────────────────────────────────
const Shimmer = ({ w, h }) => (
    <div style={{
        width: w || '100%', height: h || '14px', borderRadius: '6px',
        background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
    }} />
);

// ─────────────────────────────────────────────────────────────────
// Rule row — shows each criterion as pass/fail
// ─────────────────────────────────────────────────────────────────
const RuleRow = ({ rule }) => {
    const { field, operator, required, actual, passed } = rule;
    const humanField = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.45rem 0.65rem', borderRadius: '6px',
            background: passed ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${passed ? '#bbf7d0' : '#fecaca'}`,
            fontSize: '0.78rem',
            transition: 'all 0.2s'
        }}>
            {passed
                ? <CheckCircle size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                : <XCircle    size={14} color="#dc2626" style={{ flexShrink: 0 }} />}
            <span style={{ flex: 1, color: '#374151', fontWeight: 500 }}>
                {humanField}
                <span style={{ color: '#9ca3af', fontWeight: 400 }}> {operator} {required}</span>
            </span>
            <span style={{
                fontWeight: 700,
                color: passed ? '#16a34a' : '#dc2626',
                fontSize: '0.75rem',
                background: passed ? '#dcfce7' : '#fee2e2',
                padding: '1px 6px', borderRadius: '10px'
            }}>
                {actual}
            </span>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Scheme card — always rendered, collapsed rules expandable
// ─────────────────────────────────────────────────────────────────
const SchemeCard = ({ scheme, idx, onApply }) => {
    const [open, setOpen] = React.useState(scheme.all_eligible || scheme.pass_count > 0);
    const { scheme_name, department, description, rules, all_eligible, pass_count, total_rules, enrollment_status } = scheme;

    const pct = total_rules > 0 ? Math.round((pass_count / total_rules) * 100) : 0;
    const borderColor = all_eligible ? '#10b981' : pct >= 50 ? '#f97316' : '#ef4444';
    const bgHeader   = all_eligible ? '#f0fdf4' : pct >= 50 ? '#fff7ed' : '#fef2f2';

    const statusBadge = {
        enrolled:    { text: '✅ Enrolled',         color: '#10b981', bg: '#f0fdf4' },
        proactive:   { text: '🔔 Proactive Match',  color: '#f97316', bg: '#fff7ed' },
        not_applied: { text: '📋 Not Applied',       color: '#64748b', bg: '#f1f5f9' },
    }[enrollment_status];

    return (
        <div className="card" style={{
            borderLeft: `4px solid ${borderColor}`,
            animation: `fadeUp 0.35s ease ${idx * 0.06}s both`,
            overflow: 'hidden'
        }}>
            {/* Card Header */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    background: bgHeader, padding: '0.85rem 1rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    userSelect: 'none'
                }}
            >
                {all_eligible
                    ? <BadgeCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
                    : <BadgeX    size={20} color={pct >= 50 ? '#f97316' : '#ef4444'} style={{ flexShrink: 0 }} />
                }
                <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1px' }}>{scheme_name}</p>
                    <p style={{ fontSize: '0.72rem', color: '#64748b' }}>{department}</p>
                </div>

                {/* Progress bar */}
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: borderColor, marginBottom: '3px' }}>
                        {pass_count}/{total_rules} rules
                    </div>
                    <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: borderColor, transition: 'width 0.6s ease' }} />
                    </div>
                </div>

                <span style={{
                    ...statusBadge, fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap'
                }}>{statusBadge.text}</span>

                <ChevronRight size={16} color="#94a3b8" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
            </div>

            {/* Expanded Body */}
            {open && (
                <div style={{ padding: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.85rem', lineHeight: 1.5 }}>{description}</p>

                    {rules.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No specific rules defined for this scheme.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {rules.map((r, i) => <RuleRow key={i} rule={r} />)}
                        </div>
                    )}

                    {all_eligible && enrollment_status !== 'enrolled' && (
                        <button 
                            className="btn btn-emerald" 
                            style={{ width: '100%', justifyContent: 'center', marginTop: '0.85rem' }}
                            onClick={(e) => { e.stopPropagation(); onApply && onApply(scheme); }}
                        >
                            Apply Now <ChevronRight size={15} />
                        </button>
                    )}
                    {enrollment_status === 'enrolled' && (
                        <div style={{ marginTop: '0.85rem', padding: '0.5rem 0.75rem', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, textAlign: 'center' }}>
                            ✅ Already receiving benefits under this scheme
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────
const SchemeEligibility = ({ onBack, onApply }) => {
    const [query, setQuery]         = React.useState('');
    const [searchType, setSearchType] = React.useState('name');
    const [loading, setLoading]     = React.useState(false);
    const [citizen, setCitizen]     = React.useState(null);
    const [schemes, setSchemes]     = React.useState([]);
    const [error, setError]         = React.useState('');
    const [searched, setSearched]   = React.useState(false);
    const [filter, setFilter]       = React.useState('all'); // all | eligible | partial | ineligible

    const placeholders = {
        name:    'Enter citizen full name (e.g. Ramesh Kumar)…',
        aadhaar: 'Enter 12-digit Aadhaar number (e.g. 838637940265)…',
        mobile:  'Enter 10-digit mobile number…',
        citizen_id: 'Enter internal citizen ID (e.g. 15)…'
    };

    const handleCheck = async () => {
        if (!query.trim()) { setError('Please enter a search value.'); return; }
        setError(''); setLoading(true); setSearched(true); setCitizen(null); setSchemes([]);

        try {
            const encQ = encodeURIComponent(query.trim());
            // Pass search_by as query param so backend routes correctly
            const res = await fetch(
                `http://localhost:8000/citizen/evaluate/${encQ}?search_by=${searchType}`
            );
            if (res.status === 404) {
                setError(`No citizen found matching "${query}" (searched by ${searchType}). Try a different value.`);
                return;
            }
            if (!res.ok) throw new Error(`API error ${res.status}`);

            const data = await res.json();
            setCitizen(data.citizen);
            setSchemes(data.schemes || []);
        } catch (e) {
            setError('Could not connect to backend API. Ensure the server is running on port 8000.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = e => { if (e.key === 'Enter') handleCheck(); };

    const eligibleCount     = schemes.filter(s => s.all_eligible).length;
    const partialCount      = schemes.filter(s => !s.all_eligible && s.pass_count > 0).length;
    const ineligibleCount   = schemes.filter(s => s.pass_count === 0).length;

    const filteredSchemes = schemes.filter(s => {
        if (filter === 'eligible')   return s.all_eligible;
        if (filter === 'partial')    return !s.all_eligible && s.pass_count > 0;
        if (filter === 'ineligible') return s.pass_count === 0;
        return true;
    });

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            <style>{`
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            {/* ── Header ── */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <ShieldCheck size={24} color="#1a8461" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Scheme Eligibility Checker
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Search any citizen to see <strong>all government schemes</strong> with rule-level eligibility breakdown — what they qualify for and why.
                </p>
                <button className="btn" onClick={onBack} style={{ width: 'fit-content', padding: '0.25rem 0', marginTop: '0.5rem' }}>
                    ← Back to Dashboard
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.75rem', alignItems: 'start' }}>

                {/* ── Left Panel: Search + Citizen Card ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Search box */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                            <Search size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Search Citizen
                        </h3>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                            {[['name','By Name'],['aadhaar','By Aadhaar'],['citizen_id', 'By Citizen ID'],['mobile','By Mobile']].map(([t,l]) => (
                                <button key={t} onClick={() => { setSearchType(t); setQuery(''); }}
                                    style={{
                                        padding: '0.3rem 0.65rem', borderRadius: '20px', border: '1px solid',
                                        fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500,
                                        background: searchType === t ? '#1e3a5f' : 'white',
                                        color: searchType === t ? 'white' : '#334155',
                                        borderColor: searchType === t ? '#1e3a5f' : '#e2e8f0'
                                    }}>{l}</button>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                            <input
                                type="text" value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholders[searchType]}
                                style={{
                                    width: '100%', padding: '0.7rem 2.2rem 0.7rem 0.9rem',
                                    borderRadius: '8px', border: error ? '1px solid #ef4444' : '1px solid #e2e8f0',
                                    fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', background: '#f8fafc'
                                }}
                            />
                            {query && <button onClick={() => { setQuery(''); setCitizen(null); setSchemes([]); setSearched(false); setError(''); }}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={15} color="#94a3b8" />
                            </button>}
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.55rem 0.8rem', marginBottom: '0.85rem', color: '#dc2626', fontSize: '0.8rem' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button className="btn btn-emerald" onClick={handleCheck} disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.95rem' }}>
                            {loading
                                ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Evaluating…</>
                                : <><ShieldCheck size={15} /> Check Eligibility</>}
                        </button>
                    </div>

                    {/* Citizen summary card */}
                    {loading && (
                        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Shimmer h="16px" w="60%" />
                            <Shimmer h="12px" w="80%" />
                            <Shimmer h="12px" w="50%" />
                            <Shimmer h="12px" w="70%" />
                        </div>
                    )}

                    {!loading && citizen && (
                        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981', animation: 'fadeUp 0.3s ease' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a8461', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={15} /> Citizen Found
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.45rem 0.85rem', fontSize: '0.83rem' }}>
                                {[
                                    [<User size={12}/>,      'Name',     citizen.name],
                                    [<MapPin size={12}/>,    'District', citizen.district],
                                    [<IndianRupee size={12}/>,'Income',  `₹${citizen.annual_income?.toLocaleString()}`],
                                    [null,                   'Age',      `${citizen.age} yrs`],
                                    [null,                   'Gender',   citizen.gender],
                                    [null,                   'Caste',    citizen.caste || 'N/A'],
                                    [null,                   'Occupation', citizen.occupation],
                                ].map(([icon, label, val], i) => (
                                    <React.Fragment key={i}>
                                        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>{icon}{label}:</span>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{val}</span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    {!loading && schemes.length > 0 && (
                        <div className="card" style={{ padding: '1rem' }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '0.6rem' }}>📊 Eligibility Summary</p>
                            {[
                                ['#10b981', `${eligibleCount} Fully Eligible`],
                                ['#f97316', `${partialCount} Partially Eligible`],
                                ['#ef4444', `${ineligibleCount} Not Eligible`],
                            ].map(([color, label]) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '0.8rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right Panel: Scheme Cards ── */}
                <div>
                    {!searched && !loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px', color: 'var(--text-secondary)', textAlign: 'center', gap: '1rem' }}>
                            <ShieldCheck size={56} style={{ opacity: 0.12 }} />
                            <p>Search by <strong>Name</strong>, <strong>Aadhaar number</strong>, or <strong>Mobile</strong> and click <strong>Check Eligibility</strong> to see all scheme evaluations with rule-level pass/fail breakdown.</p>
                        </div>
                    )}

                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[0,1,2,3].map(i => (
                                <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                                    <Shimmer h="18px" w="55%" />
                                    <Shimmer h="10px" w="35%" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                        <Shimmer h="28px" /><Shimmer h="28px" /><Shimmer h="28px" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && schemes.length > 0 && (
                        <>
                            {/* Filter bar */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                                    <FileText size={13} style={{ verticalAlign: 'middle' }} /> {schemes.length} schemes evaluated
                                </span>
                                <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
                                    {[
                                        ['all',        'All Schemes',    '#64748b'],
                                        ['eligible',   '✅ Eligible',    '#10b981'],
                                        ['partial',    '⚠️ Partial',     '#f97316'],
                                        ['ineligible', '❌ Ineligible',  '#ef4444'],
                                    ].map(([key, label, col]) => (
                                        <button key={key} onClick={() => setFilter(key)}
                                            style={{
                                                padding: '0.3rem 0.7rem', borderRadius: '20px', border: '1px solid',
                                                fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500,
                                                background: filter === key ? col : 'white',
                                                color: filter === key ? 'white' : '#334155',
                                                borderColor: filter === key ? col : '#e2e8f0'
                                            }}>{label}</button>
                                    ))}
                                </div>
                            </div>

                            {filteredSchemes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    No schemes match the selected filter.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {filteredSchemes.map((s, i) => (
                                        <SchemeCard 
                                            key={s.scheme_id} 
                                            scheme={s} 
                                            idx={i} 
                                            onApply={(sch) => onApply && onApply(citizen, sch)} 
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchemeEligibility;
