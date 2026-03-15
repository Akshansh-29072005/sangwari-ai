import React, { useState, useEffect } from 'react';
import {
  BarChart2, CheckCircle, AlertTriangle, Clock,
  MapPin, TrendingUp, RefreshCw, Loader2
} from 'lucide-react';

const BASE = 'http://localhost:8000';

// ── Colors ──────────────────────────────────────────────────────────────────
const DEPT_COLORS = [
  '#1e40af','#0891b2','#0d9488','#15803d','#7c3aed',
  '#b91c1c','#b45309','#64748b','#be185d','#6d28d9',
];

const STATUS_COLORS = {
  Resolved:            '#15803d',
  'Under Review':      '#1e40af',
  'Assigned to Officer':'#0891b2',
  Escalated:           '#b91c1c',
  Submitted:           '#64748b',
  Pending:             '#b45309',
  Unknown:             '#94a3b8',
};

const DISTRICT_INTENSITY = (count, max) => {
  const t = max ? count / max : 0;
  if (t >= 0.75) return '#b91c1c';
  if (t >= 0.5)  return '#ea580c';
  if (t >= 0.25) return '#d97706';
  if (t > 0)     return '#4ade80';
  return '#e2e8f0';
};

// ── Tiny Bar Chart (pure SVG/CSS) ────────────────────────────────────────────
const HorizontalBar = ({ label, value, max, color, total }) => {
  const pct = max ? (value / max) * 100 : 0;
  const share = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
        <span style={{ color: '#1e293b', fontWeight: 600, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ color: '#64748b' }}>{value} &nbsp;<span style={{ color: '#94a3b8' }}>({share}%)</span></span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

// ── Donut (SVG) ──────────────────────────────────────────────────────────────
const Donut = ({ slices, size = 130, thickness = 22 }) => {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const circum = 2 * Math.PI * r;
  let offset = 0;
  const total = slices.reduce((s, d) => s + d.value, 0);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {slices.map((sl, i) => {
        const dash = total ? (sl.value / total) * circum : 0;
        const el = (
          <circle key={i} cx={cx} cy={cx} r={r}
            fill="none" stroke={sl.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${circum}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cx} r={r - thickness / 2 - 2} fill="white" />
    </svg>
  );
};

// ── KPI Card ────────────────────────────────────────────────────────────────
const KPICard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div style={{
    background: 'white', borderRadius: '16px', padding: '1.5rem',
    border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  }}>
    <div style={{
      width: 50, height: 50, borderRadius: '14px',
      background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginTop: '0.25rem' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>{subtitle}</div>}
    </div>
  </div>
);

// ── District Heatmap ─────────────────────────────────────────────────────────
const DistrictHeatmap = ({ data }) => {
  const max = data.length ? Math.max(...data.map(d => d.count)) : 1;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
      {data.map((d, i) => {
        const col = DISTRICT_INTENSITY(d.count, max);
        const res_pct = d.count ? Math.round((d.resolved / d.count) * 100) : 0;
        return (
          <div key={i} style={{
            background: col + '28', border: `2px solid ${col}`,
            borderRadius: '12px', padding: '0.85rem', textAlign: 'center',
            transition: 'transform 0.2s', cursor: 'default',
            boxShadow: `0 2px 8px ${col}22`
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
              <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} color={col} />
              {d.district}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: col }}>{d.count}</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{res_pct}% resolved</div>
          </div>
        );
      })}
    </div>
  );
};

// ── Section Card Wrapper ─────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, accentColor = '#1e40af' }) => (
  <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <Icon size={18} color={accentColor} />
      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{title}</h3>
    </div>
    <div style={{ padding: '1.5rem' }}>{children}</div>
  </div>
);

// ── Main Dashboard ───────────────────────────────────────────────────────────
const AnalyticsDashboard = ({ onBack }) => {
  const [overview, setOverview] = useState(null);
  const [byDept, setByDept] = useState([]);
  const [byDistrict, setByDistrict] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = async () => {
    setLoading(true); setError('');
    try {
      const [ov, dept, dist, stat] = await Promise.all([
        fetch(`${BASE}/analytics/overview`).then(r => r.json()),
        fetch(`${BASE}/analytics/by-department`).then(r => r.json()),
        fetch(`${BASE}/analytics/by-district`).then(r => r.json()),
        fetch(`${BASE}/analytics/by-status`).then(r => r.json()),
      ]);
      setOverview(ov);
      setByDept(dept);
      setByDistrict(dist);
      setByStatus(stat);
      setLastRefresh(new Date().toLocaleTimeString('en-IN'));
    } catch (e) {
      setError('Failed to load analytics. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const deptMax = byDept.length ? byDept[0].count : 1;
  const deptTotal = byDept.reduce((s, d) => s + d.count, 0);

  const statusSlices = byStatus.map(s => ({
    value: s.count,
    color: STATUS_COLORS[s.status] || '#94a3b8',
  }));

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
            📊 Grievance Analytics
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Real-time complaint insights across all departments and districts
            {lastRefresh && <span style={{ marginLeft: '0.5rem', color: '#94a3b8' }}>• Updated {lastRefresh}</span>}
          </p>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#1e40af', cursor: 'pointer', fontSize: '0.85rem', padding: 0, fontWeight: 600, marginTop: '0.35rem' }}>
            ← Dashboard
          </button>
        </div>
        <button onClick={fetchAll} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0',
          background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#1e293b'
        }}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading && !overview && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#94a3b8' }}>
          <Loader2 size={32} className="spin" />
        </div>
      )}

      {overview && (
        <>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <KPICard icon={BarChart2}    title="Total Complaints"  value={overview.total_complaints}    subtitle="All time"                color="#1e40af" />
            <KPICard icon={CheckCircle}  title="Resolved"          value={overview.resolved_complaints}  subtitle={`${overview.resolution_rate_pct}% resolution rate`} color="#15803d" />
            <KPICard icon={AlertTriangle} title="Escalated"         value={overview.escalated_complaints} subtitle="SLA breaches"            color="#b91c1c" />
            <KPICard icon={Clock}        title="Avg. Resolution"   value={`${overview.avg_resolution_days}d`} subtitle={`Predicted SLA: ${overview.avg_predicted_sla_days}d`} color="#0891b2" />
            <KPICard icon={TrendingUp}   title="Pending"           value={overview.pending_complaints}   subtitle="Awaiting action"         color="#b45309" />
          </div>

          {/* Department + Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(260px, 320px)', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Department bar chart */}
            <Section title="Complaints by Department" icon={BarChart2} accentColor="#1e40af">
              {byDept.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No data yet — submit a grievance to see breakdown.</div>
              ) : (
                byDept.map((d, i) => (
                  <HorizontalBar
                    key={i}
                    label={d.department}
                    value={d.count}
                    max={deptMax}
                    total={deptTotal}
                    color={DEPT_COLORS[i % DEPT_COLORS.length]}
                  />
                ))
              )}
            </Section>

            {/* Status donut */}
            <Section title="Status Breakdown" icon={CheckCircle} accentColor="#0891b2">
              {byStatus.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No data yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Donut slices={statusSlices} size={140} thickness={24} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{overview.total_complaints}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    {byStatus.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[s.status] || '#94a3b8', flexShrink: 0 }} />
                        <span style={{ flex: 1, color: '#1e293b' }}>{s.status}</span>
                        <span style={{ fontWeight: 700, color: '#475569' }}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          </div>

          {/* District Heatmap */}
          <Section title="District Complaint Heatmap" icon={MapPin} accentColor="#7c3aed">
            <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#64748b' }}>
              {[
                { color: '#b91c1c', label: 'Critical (≥75%)' },
                { color: '#ea580c', label: 'High (≥50%)' },
                { color: '#d97706', label: 'Moderate (≥25%)' },
                { color: '#4ade80', label: 'Low' },
              ].map((l, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: 'inline-block' }} />
                  {l.label}
                </span>
              ))}
            </div>
            {byDistrict.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No district data yet.</div>
            ) : (
              <DistrictHeatmap data={byDistrict} />
            )}
          </Section>
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
