import React from 'react';
import {
    Users, AlertTriangle, GraduationCap,
    MapPin, Smartphone, Mail, Phone, X, CheckCircle, BadgeCheck
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const ShieldPlus = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const BeneficiaryDiscovery = ({ onBack }) => {
    const [allBeneficiaries, setAllBeneficiaries] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedCitizen, setSelectedCitizen] = React.useState(null);

    // Filters
    const [schemeFilter, setSchemeFilter] = React.useState('All');
    const [districtFilter, setDistrictFilter] = React.useState('All');
    const [priorityFilter, setPriorityFilter] = React.useState('All');

    // Pagination
    const [currentPage, setCurrentPage] = React.useState(1);

    React.useEffect(() => {
        fetch('http://localhost:8000/beneficiaries/all')
            .then(res => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (data.data) {
                    const fetched = data.data.map(b => ({
                        ...b,
                        avatar: `https://i.pravatar.cc/150?u=${b.id}`
                    }));
                    setAllBeneficiaries(fetched);
                }
            })
            .catch(err => {
                console.error(err);
                setError('Could not connect to backend. Ensure API is running on port 8000.');
            })
            .finally(() => setLoading(false));
    }, []);

    // Derived filter options from real data
    const schemes = ['All', ...new Set(allBeneficiaries.map(b => b.scheme).filter(Boolean))];
    const districts = ['All', ...new Set(allBeneficiaries.map(b => b.district).filter(Boolean))];

    // Filtered list
    const filtered = allBeneficiaries.filter(b => {
        const matchScheme = schemeFilter === 'All' || b.scheme === schemeFilter;
        const matchDistrict = districtFilter === 'All' || b.district === districtFilter;
        const matchPriority = priorityFilter === 'All'
            ? true
            : priorityFilter === 'High' ? b.status.includes('Eligible') || b.status.includes('Pending')
            : b.status.includes('Enrolled');
        return matchScheme && matchDistrict && matchPriority;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const highPriority = allBeneficiaries.filter(b => b.status.includes('Pending') || b.status.includes('Eligible')).length;
    const uniqueSchemes = [...new Set(allBeneficiaries.map(b => b.scheme).filter(s => s && s !== 'N/A'))];

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Generate page buttons
    const pageButtons = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pageButtons.push(i);
    } else {
        pageButtons.push(1);
        if (currentPage > 3) pageButtons.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pageButtons.push(i);
        if (currentPage < totalPages - 2) pageButtons.push('...');
        pageButtons.push(totalPages);
    }

    const statusColor = (status) => {
        if (status?.includes('Eligible') || status?.includes('Pending')) return '#f97316';
        if (status?.includes('Enrolled')) return '#10b981';
        return '#6b7280';
    };

    return (
        <div className="container">
            <div className="discovery-header">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🔍 Beneficiary Discovery Engine</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    AI proactively identifies citizens eligible for government schemes but not yet enrolled.
                </p>
                <button className="btn" onClick={onBack} style={{ width: 'fit-content', padding: '0.25rem 0' }}>
                    ← Back to Dashboard
                </button>
            </div>

            {/* Stats Cards */}
            <section className="metric-grid" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ borderLeft: '4px solid #1a8461' }}>
                    <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#1a8461' }}>
                            <Users size={20} /> <span style={{ fontWeight: 600 }}>AI Detected Beneficiaries</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{loading ? '...' : `${allBeneficiaries.length.toLocaleString()} Citizens`}</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Potential scheme eligibility detected.</p>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--orange)' }}>
                    <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--orange)' }}>
                            <AlertTriangle size={20} /> <span style={{ fontWeight: 600 }}>High Priority Citizens</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{loading ? '...' : `${highPriority.toLocaleString()} Cases`}</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Immediate enrollment recommended.</p>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#3b82f6' }}>
                            <GraduationCap size={20} /> <span style={{ fontWeight: 600 }}>Schemes Identified</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {loading ? <span>Loading...</span> : uniqueSchemes.slice(0, 4).map(s => (
                                <span key={s} className="badge badge-navy" style={{ fontSize: '0.72rem' }}>{s}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="discovery-grid">
                {/* Left Panel - Table */}
                <div className="portal-left">
                    <div className="card">
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
                            Beneficiary List
                            <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                                Showing {filtered.length.toLocaleString()} of {allBeneficiaries.length.toLocaleString()} records
                            </span>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            {/* Live Filter Bar */}
                            <div className="filter-bar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                <select
                                    className="select-filter"
                                    value={schemeFilter}
                                    onChange={e => { setSchemeFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    {schemes.map(s => <option key={s} value={s}>{s === 'All' ? 'All Schemes' : s}</option>)}
                                </select>
                                <select
                                    className="select-filter"
                                    value={districtFilter}
                                    onChange={e => { setDistrictFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    {districts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>)}
                                </select>
                                <select
                                    className="select-filter"
                                    value={priorityFilter}
                                    onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                                >
                                    <option value="All">All Priorities</option>
                                    <option value="High">High Priority</option>
                                    <option value="Enrolled">Enrolled</option>
                                </select>
                                {(schemeFilter !== 'All' || districtFilter !== 'All' || priorityFilter !== 'All') && (
                                    <button
                                        className="btn btn-red"
                                        style={{ fontSize: '0.8rem' }}
                                        onClick={() => { setSchemeFilter('All'); setDistrictFilter('All'); setPriorityFilter('All'); setCurrentPage(1); }}
                                    >
                                        Clear Filters <X size={14} />
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Citizen Name</th>
                                            <th>District</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                            <th>Income (₹)</th>
                                            <th>Detected Scheme</th>
                                            <th>Flag</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>⏳ Loading AI Discoveries...</td></tr>
                                        ) : paginated.length === 0 ? (
                                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No citizens match the selected filters.</td></tr>
                                        ) : (
                                            paginated.map((b) => (
                                                <tr
                                                    key={b.id}
                                                    onClick={() => setSelectedCitizen(b)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        background: selectedCitizen?.id === b.id ? '#f0fdf4' : undefined,
                                                        borderLeft: selectedCitizen?.id === b.id ? '3px solid #10b981' : '3px solid transparent'
                                                    }}
                                                >
                                                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                        <img src={b.avatar} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                                        <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{b.name}</span>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem' }}>{b.district}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>{b.age}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>{b.gender}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>₹{b.annual_income?.toLocaleString()}</td>
                                                    <td><span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>{b.scheme}</span></td>
                                                    <td>
                                                        {(b.status?.includes('Eligible') || b.status?.includes('Pending')) ? (
                                                            <span style={{ color: '#f97316', fontSize: '0.72rem', fontWeight: 700, background: '#fff7ed', padding: '2px 6px', borderRadius: '12px', border: '1px solid #fed7aa' }}>Proactive</span>
                                                        ) : (
                                                            <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700, background: '#f0fdf4', padding: '2px 6px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                                                                <CheckCircle size={10} style={{ marginRight: '2px' }} />Enrolled
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn"
                                                            style={{ background: '#2d7a8d', color: 'white', padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedCitizen(b); }}
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}>
                                    <button className="btn" style={{ border: '1px solid #e2e8f0', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>‹ Prev</button>
                                    {pageButtons.map((p, i) => (
                                        p === '...'
                                            ? <span key={`ellipsis-${i}`} style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0 4px' }}>…</span>
                                            : <button key={p} className="btn" onClick={() => handlePageChange(p)} style={{ background: p === currentPage ? '#1e3a5f' : 'white', color: p === currentPage ? 'white' : '#334155', border: '1px solid #e2e8f0', minWidth: '32px', justifyContent: 'center', fontSize: '0.8rem' }}>{p}</button>
                                    ))}
                                    <button className="btn" style={{ border: '1px solid #e2e8f0', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next ›</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Citizen Detail */}
                <div className="portal-right">
                    <div className="card">
                        <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600 }}>Citizen Details</span>
                            {selectedCitizen && <X size={18} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setSelectedCitizen(null)} />}
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            {!selectedCitizen ? (
                                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
                                    <Users size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p style={{ fontSize: '0.9rem' }}>Click on any citizen in the table to view their full details.</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <img src={selectedCitizen.avatar} alt="" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedCitizen.name}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Age: {selectedCitizen.age} · {selectedCitizen.gender}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <MapPin size={13} /> {selectedCitizen.district}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Citizen Info Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                                        <div style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Annual Income</div>
                                            <div style={{ fontWeight: 600 }}>₹{selectedCitizen.annual_income?.toLocaleString()}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Status</div>
                                            <div style={{ fontWeight: 600, color: statusColor(selectedCitizen.status) }}>{selectedCitizen.status}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>Citizen ID</div>
                                            <div style={{ fontWeight: 600 }}>#{selectedCitizen.id}</div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                                            <div style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>District</div>
                                            <div style={{ fontWeight: 600 }}>{selectedCitizen.district}</div>
                                        </div>
                                    </div>

                                    {/* AI Reasoning */}
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--emerald)', marginBottom: '1.5rem' }}>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <ShieldPlus size={16} /> AI Eligibility Reasoning
                                        </h4>
                                        <p style={{ fontSize: '0.83rem', marginBottom: '0.4rem' }}>
                                            <strong>Scheme:</strong> <span style={{ color: '#1e40af' }}>{selectedCitizen.scheme}</span>
                                        </p>
                                        {selectedCitizen.reason ? (
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                {(() => {
                                                    try {
                                                        const parsed = JSON.parse(selectedCitizen.reason);
                                                        return parsed.reason || selectedCitizen.reason;
                                                    } catch { return selectedCitizen.reason; }
                                                })()}
                                            </p>
                                        ) : (
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Citizen is enrolled based on submitted application data.</p>
                                        )}
                                        {(selectedCitizen.status?.includes('Eligible') || selectedCitizen.status?.includes('Pending')) && (
                                            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#f97316', fontWeight: 600 }}>
                                                <AlertTriangle size={13} /> Proactive Detection — Not Yet Enrolled
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <Smartphone size={16} color="#1e40af" />
                                            <span style={{ fontSize: '0.9rem', flex: 1 }}>Mobile on file — contact via CSC portal</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn btn-primary" style={{ flex: 1 }}><Mail size={15} /> Send SMS</button>
                                            <button className="btn btn-emerald" style={{ flex: 1, background: '#2d7a8d' }}><Phone size={15} /> Call</button>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        📣 You may be eligible for the <strong>{selectedCitizen.scheme}</strong>. Please visit your nearest CSC center for enrollment.
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                                        <button className="btn" style={{ flex: 1, background: 'white', border: '1px solid #cbd5e1' }}>Save Draft</button>
                                        <button className="btn btn-primary" style={{ flex: 1 }}>Submit Application</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeneficiaryDiscovery;
