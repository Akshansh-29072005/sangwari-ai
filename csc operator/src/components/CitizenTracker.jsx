import React, { useState } from 'react';
import {
  Search, CheckCircle, Clock, AlertTriangle, ArrowRight,
  User, Phone, MapPin, Building2, ShieldCheck, Loader2,
  FileText, ChevronRight
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'Submitted',          label: 'Complaint Submitted',    icon: FileText },
  { key: 'Assigned to Officer', label: 'Assigned to Officer',   icon: User },
  { key: 'Under Investigation', label: 'Under Review',          icon: Clock },
  { key: 'Resolved',           label: 'Resolved',               icon: CheckCircle },
];

const STATUS_CONFIG = {
  'Submitted':           { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' },
  'Assigned to Officer': { color: '#0891b2', bg: '#e0f2fe', border: '#7dd3fc' },
  'Under Investigation': { color: '#1e40af', bg: '#eff6ff', border: '#93c5fd' },
  'Under Review':        { color: '#1e40af', bg: '#eff6ff', border: '#93c5fd' },
  'Documents Requested': { color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  'Escalated':           { color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5' },
  'Resolved':            { color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
};

function getStepIndex(status) {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s.includes('resolv')) return 3;
  if (s.includes('review') || s.includes('investigat')) return 2;
  if (s.includes('assign') || s.includes('officer')) return 1;
  return 0;
}

const GrievanceDetail = ({ data, onBack }) => {
  const cfg = STATUS_CONFIG[data.status] || STATUS_CONFIG['Submitted'];
  const activeStep = getStepIndex(data.status);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        borderRadius: '16px', padding: '2rem', color: 'white',
        marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%'
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complaint ID</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              {data.complaint_id?.substring(0, 16).toUpperCase()}...
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', opacity: 0.85 }}>{data.citizen_name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block', padding: '0.4rem 1rem',
              background: cfg.bg, color: cfg.color,
              border: `1px solid ${cfg.border}`,
              borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem'
            }}>
              {data.status === 'Escalated' && '⚠ '}
              {data.status === 'Resolved' && '✓ '}
              {data.status}
            </span>
            {data.priority && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.75 }}>
                Priority: <strong>{data.priority}</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { icon: Building2, label: data.department || '—' },
            { icon: MapPin,    label: data.district || '—' },
            { icon: User,      label: data.officer || 'Pending Assignment' },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.9 }}>
              <Icon size={14} /> {label}
            </div>
          ))}
        </div>
      </div>

      {/* SLA bar */}
      {data.expected_resolution && (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <ShieldCheck size={20} color="#0891b2" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Expected Resolution</div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>
              {data.expected_resolution} day{data.expected_resolution !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ background: '#e0f2fe', color: '#0891b2', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
            AI-Predicted SLA
          </div>
        </div>
      )}

      {/* Visual Timeline stepper */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '2rem' }}>Complaint Timeline</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute', top: 20, left: '12.5%', right: '12.5%',
            height: 3, background: '#e2e8f0', borderRadius: 2, zIndex: 0
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: 'linear-gradient(90deg, #1e40af, #0891b2)',
              width: `${Math.min(100, (activeStep / (STATUS_STEPS.length - 1)) * 100)}%`,
              transition: 'width 0.6s ease'
            }} />
          </div>

          {STATUS_STEPS.map((step, i) => {
            const done = i <= activeStep;
            const active = i === activeStep;
            const Icon = step.icon;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: done
                    ? (active ? 'linear-gradient(135deg,#1e40af,#0891b2)' : '#1e40af')
                    : 'white',
                  border: `3px solid ${done ? '#1e40af' : '#e2e8f0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? '0 0 0 6px rgba(30,64,175,0.12)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <Icon size={18} color={done ? 'white' : '#94a3b8'} />
                </div>
                <div style={{
                  marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: done ? 700 : 400,
                  color: done ? '#1e293b' : '#94a3b8', textAlign: 'center', lineHeight: 1.3
                }}>
                  {step.label}
                </div>
                {active && (
                  <div style={{
                    marginTop: '0.35rem', fontSize: '0.65rem', color: '#0891b2',
                    background: '#e0f2fe', padding: '0.15rem 0.5rem',
                    borderRadius: '10px', fontWeight: 600
                  }}>Current</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Log */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '1.5rem' }}>Activity Log</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(data.timeline || []).map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                background: i === (data.timeline.length - 1) ? '#1e40af' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2
              }}>
                <CheckCircle size={13} color={i === (data.timeline.length - 1) ? 'white' : '#94a3b8'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{ev.status}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                  by {ev.updated_by} {ev.timestamp ? `• ${new Date(ev.timestamp).toLocaleString('en-IN')}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaint text */}
      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Complaint Details</div>
        <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6 }}>{data.complaint_text}</p>
      </div>

      <button onClick={onBack} style={{
        padding: '0.6rem 1.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0',
        borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b'
      }}>
        ← Track Another
      </button>
    </div>
  );
};

const CitizenTracker = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('id'); // 'id' | 'mobile'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [mobileResults, setMobileResults] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setMobileResults(null);

    try {
      if (searchType === 'mobile') {
        const res = await fetch(`http://localhost:8000/grievance/by-mobile/${query.trim()}`);
        if (!res.ok) throw new Error('No grievances found for this mobile number.');
        setMobileResults(await res.json());
      } else {
        const res = await fetch(`http://localhost:8000/grievance/status/${query.trim()}`);
        if (!res.ok) throw new Error('Grievance not found. Please check your Complaint ID.');
        setResult(await res.json());
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.35rem' }}>
          Track Your Complaint
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Enter your Complaint ID or mobile number to see real-time status &amp; timeline.
        </p>
        <button onClick={onBack} style={{
          marginTop: '0.5rem', background: 'none', border: 'none',
          color: '#1e40af', cursor: 'pointer', fontSize: '0.85rem', padding: 0, fontWeight: 600
        }}>← Back to Dashboard</button>
      </div>

      {/* Search area */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '2rem',
        border: '1px solid #e2e8f0', marginBottom: '2rem', maxWidth: '620px'
      }}>
        {/* Search type toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[['id', 'Complaint ID'], ['mobile', 'Mobile Number']].map(([type, label]) => (
            <button key={type} onClick={() => { setSearchType(type); setQuery(''); setError(''); setResult(null); setMobileResults(null); }} style={{
              padding: '0.45rem 1.1rem', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: searchType === type ? '#1e40af' : '#f1f5f9',
              color: searchType === type ? 'white' : '#64748b',
              border: 'none'
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            {searchType === 'id'
              ? <FileText size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              : <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            }
            <input
              className="input"
              style={{ paddingLeft: 40, borderRadius: '10px', width: '100%' }}
              placeholder={searchType === 'id' ? 'Enter Complaint ID or prefix...' : 'Enter 10-digit mobile number...'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '0 1.25rem', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg,#1e40af,#0891b2)', color: 'white',
              cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
            Track
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
      </div>

      {/* Mobile results list */}
      {mobileResults && (
        <div style={{ maxWidth: '620px' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: '#1e293b' }}>
            {mobileResults.length} complaint{mobileResults.length !== 1 ? 's' : ''} found
          </div>
          {mobileResults.map((g, i) => {
            const cfg = STATUS_CONFIG[g.status] || STATUS_CONFIG['Submitted'];
            return (
              <div key={i} onClick={() => {
                setSearchType('id');
                setQuery(g.complaint_id);
                setTimeout(handleSearch, 50);
                fetch(`http://localhost:8000/grievance/status/${g.complaint_id}`)
                  .then(r => r.json()).then(setResult).catch(() => {});
              }} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '1.25rem', marginBottom: '0.75rem', cursor: 'pointer',
                transition: 'box-shadow 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,64,175,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', fontFamily: 'monospace' }}>
                    {g.complaint_id?.substring(0, 14).toUpperCase()}...
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {g.department} • {g.district}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.complaint_text}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <span style={{ padding: '0.25rem 0.7rem', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {g.status}
                  </span>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full detail view */}
      {result && <GrievanceDetail data={result} onBack={() => { setResult(null); setQuery(''); }} />}

      {/* Empty state */}
      {!result && !mobileResults && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Search size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
          <div style={{ fontWeight: 600, fontSize: '1rem' }}>Enter your Complaint ID or Mobile Number</div>
          <div style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>You can search using the first 8+ characters of your Complaint ID</div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
};

export default CitizenTracker;
