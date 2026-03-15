import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Loader2, Info, X } from 'lucide-react';

const RISK_CONFIG = {
  HIGH:   { color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5', icon: '🔴', label: 'HIGH RISK' },
  MEDIUM: { color: '#b45309', bg: '#fffbeb', border: '#fcd34d', icon: '🟡', label: 'MEDIUM RISK' },
  LOW:    { color: '#15803d', bg: '#f0fdf4', border: '#86efac', icon: '🟢', label: 'LOW RISK' },
};

const GaugeArc = ({ probability }) => {
  const pct = Math.min(100, Math.max(0, probability));
  // SVG arc: 0% = left (180°), 100% = right (0°)
  const angle = 180 - (pct / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 80, cy = 80, r = 60;
  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);

  const color = pct >= 65 ? '#b91c1c' : pct >= 40 ? '#b45309' : '#15803d';
  const trackColor = '#e2e8f0';

  return (
    <svg width="160" height="95" viewBox="0 0 160 95">
      {/* Track arc */}
      <path d={`M 20 80 A ${r} ${r} 0 0 1 140 80`} fill="none" stroke={trackColor} strokeWidth="12" strokeLinecap="round" />
      {/* Filled arc */}
      <path d={`M 20 80 A ${r} ${r} 0 0 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      {/* Label */}
      <text x={cx} y={cy + 16} textAnchor="middle" fill={color} fontSize="22" fontWeight="800">{pct}%</text>
    </svg>
  );
};

const RejectionRiskCard = ({ onClose }) => {
  const [form, setForm] = useState({
    age: '',
    income: '',
    doc_completeness: 0.8,
    address_match: 1,
    previous_rejection: 0,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!form.age || !form.income) {
      setError('Please enter Age and Monthly Income.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('http://localhost:8000/application/predict-rejection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(form.age),
          income: parseFloat(form.income),
          doc_completeness: parseFloat(form.doc_completeness),
          address_match: parseInt(form.address_match),
          previous_rejection: parseInt(form.previous_rejection),
        }),
      });
      if (!res.ok) throw new Error('Prediction failed. Please try again.');
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? RISK_CONFIG[result.risk_level] || RISK_CONFIG.MEDIUM : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          borderRadius: '20px 20px 0 0', padding: '1.5rem 1.75rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white' }}>
              <ShieldAlert size={22} />
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Application Risk Predictor</h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              AI-powered rejection probability using XGBoost
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: 'white', display: 'flex' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ padding: '1.75rem' }}>
          {/* Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Applicant Age *</label>
              <input className="input" type="number" min="18" max="100" placeholder="e.g. 42"
                value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                style={{ borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Annual Income (₹) *</label>
              <input className="input" type="number" min="0" placeholder="e.g. 85000"
                value={form.income} onChange={e => setForm({ ...form, income: e.target.value })}
                style={{ borderRadius: '8px' }} />
            </div>
          </div>

          {/* Document completeness slider */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              Document Completeness
              <span style={{ color: form.doc_completeness >= 0.75 ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                {Math.round(form.doc_completeness * 100)}%
              </span>
            </label>
            <input type="range" min="0" max="1" step="0.05"
              value={form.doc_completeness}
              onChange={e => setForm({ ...form, doc_completeness: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: form.doc_completeness >= 0.75 ? '#15803d' : '#b91c1c' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
              <span>Missing docs</span><span>All complete</span>
            </div>
          </div>

          {/* Toggle flags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Aadhaar Address Match', key: 'address_match', yes: 'Matches', no: 'Mismatch' },
              { label: 'Previous Rejection', key: 'previous_rejection', yes: 'No Prior', no: 'Yes (Prior)' },
            ].map(({ label, key, yes, no }) => (
              <div key={key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>{label}</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[{ val: key === 'previous_rejection' ? 0 : 1, txt: yes }, { val: key === 'previous_rejection' ? 1 : 0, txt: no }].map(({ val, txt }) => (
                    <button key={val} onClick={() => setForm({ ...form, [key]: val })} style={{
                      flex: 1, padding: '0.4rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.75rem', transition: 'all 0.2s',
                      background: form[key] === val ? '#1e40af' : '#f1f5f9',
                      color: form[key] === val ? 'white' : '#64748b',
                    }}>{txt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          <button onClick={handleCheck} disabled={loading} style={{
            width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #1e40af, #0891b2)', color: 'white',
            fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            opacity: loading ? 0.75 : 1, marginBottom: '1.5rem'
          }}>
            {loading ? <><Loader2 size={18} className="spin" /> Analyzing...</> : <><ShieldAlert size={18} /> Predict Rejection Risk</>}
          </button>

          {/* Result */}
          {result && (
            <div>
              {/* Gauge + risk badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                <GaugeArc probability={result.rejection_probability_pct} />
                <div style={{
                  marginTop: '0.5rem', padding: '0.5rem 1.5rem',
                  background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                  borderRadius: '20px', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em'
                }}>
                  {cfg.icon} Risk Level: {cfg.label}
                </div>
              </div>

              {/* Reasons */}
              <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: cfg.color, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Info size={15} /> Risk Factors Identified
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {result.reasons.map((r, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: '#1e293b' }}>
                      <AlertTriangle size={15} color={cfg.color} style={{ flexShrink: 0, marginTop: 2 }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {result.risk_level === 'LOW' && (
                <div style={{ marginTop: '0.75rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                  <CheckCircle size={16} /> Application looks strong — recommend submitting.
                </div>
              )}
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .spin { animation: spin 0.8s linear infinite; }
        `}</style>
      </div>
    </div>
  );
};

export default RejectionRiskCard;
