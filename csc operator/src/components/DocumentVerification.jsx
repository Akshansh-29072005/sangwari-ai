import React, { useState } from 'react';
import {
    FileText, CheckCircle, AlertCircle, AlertTriangle,
    Upload, ShieldCheck, Info,
    ArrowRight, CornerDownRight, Loader2, Play
} from 'lucide-react';

// Highlights differing characters between two strings
const DiffHighlight = ({ base, other, isOther }) => {
    const a = base.split('');
    const b = other.split('');
    const longer = a.length >= b.length ? a : b;
    const source = isOther ? b : a;
    const compare = isOther ? a : b;

    return (
        <span style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.5px' }}>
            {source.map((char, i) => {
                const isDiff = char !== compare[i];
                return (
                    <span
                        key={i}
                        style={{
                            background: isDiff ? '#fee2e2' : 'transparent',
                            color: isDiff ? '#dc2626' : 'inherit',
                            borderRadius: '2px',
                            fontWeight: isDiff ? 700 : 400,
                            padding: isDiff ? '0 1px' : '0',
                            textDecoration: isDiff ? 'underline wavy #dc2626' : 'none',
                        }}
                    >
                        {char}
                    </span>
                );
            })}
            {/* show extra chars if other is longer */}
            {source.length < compare.length &&
                compare.slice(source.length).map((char, i) => (
                    <span key={`extra-${i}`} style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700, borderRadius: '2px', padding: '0 1px' }}>
                        {char}
                    </span>
                ))
            }
        </span>
    );
};

const SeverityBadge = ({ severity }) => {
    const colors = {
        critical: { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5', icon: '🔴' },
        moderate: { bg: '#fff7ed', color: '#9a3412', border: '#fdba74', icon: '🟠' },
        minor:    { bg: '#fefce8', color: '#854d0e', border: '#fde047', icon: '🟡' },
    };
    const style = colors[severity] || colors.minor;
    return (
        <span style={{
            background: style.bg, color: style.color,
            border: `1px solid ${style.border}`,
            borderRadius: '20px', padding: '0.2rem 0.6rem',
            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
            {style.icon} {severity}
        </span>
    );
};

const DocumentVerification = ({ onBack }) => {
    const [citizenId, setCitizenId] = useState('1234');
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [uploadStatuses, setUploadStatuses] = useState({
        aadhaar: null,
        ration_card: null,
        income_certificate: null
    });

    const handleUpload = async (e, documentType) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadStatuses(prev => ({ ...prev, [documentType]: 'uploading' }));

        try {
            const formData = new FormData();
            formData.append('citizen_id', citizenId);
            formData.append('document_type', documentType);
            formData.append('file', file);
            const response = await fetch('http://localhost:8000/documents/upload', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Upload failed');
            setUploadStatuses(prev => ({ ...prev, [documentType]: 'success' }));
        } catch (error) {
            setUploadStatuses(prev => ({ ...prev, [documentType]: 'error' }));
        }
    };

    const handleVerify = async () => {
        setVerifying(true);
        try {
            const formData = new FormData();
            formData.append('citizen_id', citizenId);
            const response = await fetch('http://localhost:8000/documents/verify', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Verification failed');
            const data = await response.json();
            setVerificationResult(data);
        } catch (error) {
            console.error('Verify Error:', error);
        } finally {
            setVerifying(false);
        }
    };

    const riskPct = verificationResult ? Math.min(100, Math.round(verificationResult.rejection_risk_score * 100)) : 0;
    const hasMismatches = verificationResult?.mismatches?.length > 0;

    const docCards = [
        { key: 'aadhaar', label: 'Aadhaar Card', icon: '🪪', color: '#1e40af' },
        { key: 'ration_card', label: 'Ration Card', icon: '🏠', color: '#065f46' },
        { key: 'income_certificate', label: 'Income Certificate', icon: '📄', color: '#7c3aed' },
    ];

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            {/* Header */}
            <div className="discovery-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(135deg, #1e3a5f, #2d7a8d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            🛡️ Document Verification Engine
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            AI-powered field-level mismatch detection before application submission
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0f9ff', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.85rem' }}>
                            <span style={{ color: '#0369a1', fontWeight: 600 }}>Citizen ID:</span>
                            <input type="text" value={citizenId} onChange={e => setCitizenId(e.target.value)}
                                style={{ width: '60px', border: 'none', outline: 'none', background: 'transparent', fontWeight: 700, color: '#0c4a6e' }} />
                        </div>
                        <button className="btn" onClick={onBack} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            ← Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div className="verification-grid" style={{ gridTemplateColumns: 'minmax(0, 2.5fr) 1fr' }}>
                <div className="portal-left">

                    {/* Upload Cards */}
                    <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(to right, #f0f9ff, #f8fafc)' }}>
                            <Upload size={18} color="#0369a1" />
                            <span style={{ fontWeight: 700, color: '#0c4a6e' }}>Upload Documents for AI Processing</span>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            {docCards.map(({ key, label, icon, color }) => {
                                const status = uploadStatuses[key];
                                return (
                                    <div key={key} style={{
                                        border: `2px dashed ${status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#cbd5e1'}`,
                                        borderRadius: '12px', padding: '1.25rem', textAlign: 'center',
                                        background: status === 'success' ? '#f0fdf4' : '#fafafa',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color, marginBottom: '0.75rem' }}>{label}</div>
                                        {status === 'success' ? (
                                            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                                <CheckCircle size={14} /> Uploaded
                                            </div>
                                        ) : (
                                            <label style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer',
                                                background: color, color: 'white', fontSize: '0.75rem', fontWeight: 600
                                            }}>
                                                {status === 'uploading' ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                                                {status === 'uploading' ? 'Uploading...' : 'Choose File'}
                                                <input type="file" style={{ display: 'none' }} onChange={e => handleUpload(e, key)} accept="image/*" />
                                            </label>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn"
                                onClick={handleVerify}
                                disabled={verifying}
                                style={{
                                    background: 'linear-gradient(135deg, #1e3a5f, #2d7a8d)',
                                    color: 'white', padding: '0.6rem 1.5rem', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(45,122,141,0.3)'
                                }}>
                                {verifying ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="white" />}
                                Run AI Verification
                            </button>
                        </div>
                    </div>

                    {/* Results Table */}
                    {verificationResult && (
                        <div className="card" style={{ overflow: 'hidden' }}>
                            {/* Table header */}
                            <div style={{
                                padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: hasMismatches ? 'linear-gradient(to right, #fef2f2, #fff7ed)' : 'linear-gradient(to right, #f0fdf4, #f8fafc)'
                            }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {hasMismatches ? <AlertTriangle size={18} color="#dc2626" /> : <ShieldCheck size={18} color="#16a34a" />}
                                    <span style={{ color: hasMismatches ? '#991b1b' : '#166534' }}>
                                        {hasMismatches ? 'Mismatches Detected' : 'All Documents Verified'}
                                    </span>
                                </span>
                                <span style={{
                                    background: hasMismatches ? '#fef2f2' : '#f0fdf4',
                                    color: hasMismatches ? '#dc2626' : '#16a34a',
                                    border: `1px solid ${hasMismatches ? '#fca5a5' : '#86efac'}`,
                                    borderRadius: '20px', padding: '0.2rem 0.8rem',
                                    fontSize: '0.75rem', fontWeight: 700
                                }}>
                                    {hasMismatches ? `⚠ ${verificationResult.mismatches.length} issue${verificationResult.mismatches.length > 1 ? 's' : ''} found` : '✓ Clean'}
                                </span>
                            </div>

                            {hasMismatches ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Field</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Reference (Aadhaar)</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Other Document</th>
                                            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Confidence & Severity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {verificationResult.mismatches.map((m, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                                                <td style={{ padding: '1rem', fontWeight: 700, textTransform: 'capitalize', color: '#1e293b' }}>
                                                    {m.field === 'dob' ? '📅 Date of Birth' : m.field === 'name' ? '👤 Name' : m.field === 'address' ? '📍 Address' : `📌 ${m.field}`}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                        <DiffHighlight base={m.values[0]} other={m.values[1]} isOther={false} />
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                                        📄 {m.documents[0].replace(/_/g, ' ')}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{
                                                        background: '#fff5f5', border: '1px solid #fca5a5',
                                                        borderRadius: '6px', padding: '0.4rem 0.6rem',
                                                        display: 'inline-block', marginBottom: '0.25rem'
                                                    }}>
                                                        <DiffHighlight base={m.values[0]} other={m.values[1]} isOther={true} />
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                                        📄 {m.documents[1].replace(/_/g, ' ')}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ marginBottom: '0.4rem' }}>
                                                        <SeverityBadge severity={m.severity} />
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                                                        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{
                                                                width: `${m.similarity_score}%`, height: '100%', borderRadius: '3px',
                                                                background: m.similarity_score > 85 ? '#f59e0b' : '#ef4444'
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
                                                            {m.similarity_score}% match
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                                        {m.guidance}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '3rem', textAlign: 'center' }}>
                                    <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 1rem auto', opacity: 0.7 }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>All Documents Verified ✓</h3>
                                    <p style={{ color: '#64748b' }}>No field-level mismatches were detected by the AI engine.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Correction Guidance */}
                    {verificationResult && hasMismatches && (
                        <div className="card" style={{ marginTop: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #fee2e2', background: 'linear-gradient(to right, #fef2f2, #fff7ed)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={18} /> Correction Guidance for CSC Operator
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#dc2626' }}>
                                    Rejection Risk: {riskPct}%
                                </span>
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', height: '10px', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ width: `${riskPct}%`, background: 'linear-gradient(to right, #f59e0b, #dc2626)', transition: 'width 0.8s ease' }} />
                                    <div style={{ flex: 1, background: '#e2e8f0' }} />
                                </div>
                                {verificationResult.correction_guidance.map((g, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem', background: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #dc2626', marginBottom: '0.5rem' }}>
                                        <CornerDownRight size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <p style={{ fontSize: '0.88rem', color: '#7f1d1d', fontWeight: 500 }}>{g}</p>
                                    </div>
                                ))}
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#fff7ed', borderRadius: '8px', color: '#9a3412', fontSize: '0.82rem', fontWeight: 600 }}>
                                    <AlertTriangle size={15} /> Application submission blocked until all mismatches are resolved.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right sidebar */}
                <div className="portal-right">
                    <div className="sidebar-card">
                        <div className="sidebar-content">
                            {!verificationResult ? (
                                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '1rem' }}>
                                    <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Info size={16} /> How it works
                                    </div>
                                    <ol style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#075985', lineHeight: '1.8' }}>
                                        <li>Upload 3 documents</li>
                                        <li>AI reads text via OCR</li>
                                        <li>Fields compared with RapidFuzz</li>
                                        <li>Mismatches flagged instantly</li>
                                    </ol>
                                </div>
                            ) : hasMismatches ? (
                                <>
                                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertTriangle size={16} /> Rejection Warning
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: '#7f1d1d', lineHeight: '1.6' }}>
                                            Document inconsistencies found. This application has a <strong>{riskPct}% rejection risk</strong>. Please correct documents before submission.
                                        </p>
                                    </div>
                                    <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem' }}>
                                        <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Issues detected</div>
                                        {verificationResult.mismatches.map((m, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < verificationResult.mismatches.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>{m.field}</span>
                                                <SeverityBadge severity={m.severity} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '1rem' }}>
                                    <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShieldCheck size={16} /> AI Approval Ready
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: '#166534', marginBottom: '1rem' }}>
                                        All fields cross-verified cleanly. Safe to submit.
                                    </p>
                                    <button style={{ width: '100%', background: 'linear-gradient(135deg, #16a34a, #059669)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        Submit Application <ArrowRight size={15} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentVerification;
