import React from 'react';
import {
    Users, Search, ChevronRight, CheckCircle,
    AlertCircle, ShieldCheck, FileText, Info,
    Save, Send, Layout
} from 'lucide-react';

const Stepper = () => (
    <div className="stepper">
        <div className="step step-active">
            <div className="step-circle">1</div>
            <span>Search Citizen</span>
        </div>
        <div className="stepper-line"></div>
        <div className="step">
            <div className="step-circle">2</div>
            <span>Select Service</span>
        </div>
        <div className="stepper-line"></div>
        <div className="step">
            <div className="step-circle">3</div>
            <span>Fill Application</span>
        </div>
        <div className="stepper-line"></div>
        <div className="step">
            <div className="step-circle">4</div>
            <span>Verify & Submit</span>
        </div>
    </div>
);

const Sidebar = () => (
    <div className="portal-right">
        <div className="sidebar-card">
            <div className="sidebar-header" style={{ color: '#1e40af' }}>
                <ShieldCheck size={20} /> AI Assistance
            </div>
            <div className="sidebar-content">
                <div className="accordion-item" style={{ borderColor: 'var(--emerald)' }}>
                    <div className="accordion-header" style={{ color: 'var(--emerald)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={16} /> Eligibility Checker
                        </div>
                        <ChevronRight size={16} />
                    </div>
                    <div className="accordion-content">
                        <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Citizen is eligible for:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <CheckCircle size={12} color="var(--emerald)" /> Mukhyamantri Widow Pension
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={12} color="var(--emerald)" /> Farmer crop Insurance
                            </li>
                        </ul>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem' }}>View Scheme Details <ChevronRight size={14} /></button>
                    </div>
                </div>

                <div className="accordion-item" style={{ borderColor: 'var(--orange)' }}>
                    <div className="accordion-header" style={{ color: 'var(--orange)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={16} /> Document Checker
                        </div>
                        <ChevronRight size={16} />
                    </div>
                    <div className="accordion-content">
                        <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Address mismatch detected between Aadhaar and Ration Card.</p>
                        <div style={{ background: '#fff7ed', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: 600 }}>Suggested Fix:</span> Ask applicant to update address or upload address proof.
                        </div>
                    </div>
                </div>

                <div className="accordion-item" style={{ borderColor: '#64748b' }}>
                    <div className="accordion-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layout size={16} /> Rejection Risk Prediction
                        </div>
                        <ChevronRight size={16} />
                    </div>
                    <div className="accordion-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Approval Probability:</span>
                            <span style={{ fontWeight: 700 }}>72%</span>
                        </div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '0.5rem' }}>
                            <div style={{ width: '72%', height: '100%', background: 'var(--orange)', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>Risk Level: <span style={{ color: 'var(--orange)', fontWeight: 600 }}>Medium</span></span>
                    </div>
                </div>

                <div className="sidebar-card" style={{ marginTop: '1rem', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <div className="sidebar-content">
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Pre Submission Validation</h4>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <CheckCircle size={14} color="var(--emerald)" /> Aadhaar uploaded
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <CheckCircle size={14} color="var(--emerald)" /> Application Fields completed
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <AlertCircle size={14} color="var(--orange)" /> Income certificate missing
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={14} color="var(--emerald)" /> Address verified
                            </li>
                        </ul>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button className="btn" style={{ flex: 1, border: '1px solid #cbd5e1', background: 'white' }}>Save Draft</button>
                            <button className="btn btn-primary" style={{ flex: 1 }}>Approve <ChevronRight size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CitizenServicePortal = ({ onBack }) => {
    return (
        <div className="container">
            <div className="portal-header">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Citizen Service – New Application</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Help citizens apply for government schemes and services efficiently.</p>
                <button className="btn" onClick={onBack} style={{ width: 'fit-content', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                    ← Back to Dashboard
                </button>
            </div>

            <Stepper />

            <div className="portal-grid">
                <div className="portal-left">
                    <div className="card">
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#1a8461', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Search size={18} /> Search Citizen
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Search by: <span style={{ color: 'var(--navy)', marginLeft: '0.5rem' }}>● Aadhaar Number</span> <span style={{ marginLeft: '1rem' }}>○ Mobile</span> <span style={{ marginLeft: '1rem' }}>○ Name</span></label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input className="input" defaultValue="1234 5678 9012" />
                                        <button className="btn btn-emerald" style={{ padding: '0.75rem' }}><Search size={18} /></button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <img src="https://i.pravatar.cc/150?u=bharti" alt="Bharti Devi" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Bharti Devi</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Age 56</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Village: Rajpur, District: Raipur</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}><span style={{ fontWeight: 600 }}>Ration Card:</span> Holder</p>
                                </div>
                                <div style={{ marginLeft: 'auto' }}>
                                    <button className="btn btn-emerald">Load Citizen Profile</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="card">
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#1a8461', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Layout size={18} /> Select Government Service
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div className="form-group">
                                    <select className="input" style={{ width: '100%' }}>
                                        <option>Widow Pension</option>
                                        <option>Income Certificate</option>
                                        <option>Caste Certificate</option>
                                    </select>
                                </div>
                                <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #1e40af' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Eligibility Summary</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <CheckCircle size={14} color="var(--emerald)" /> Age 40 years or above
                                        </li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CheckCircle size={14} color="var(--emerald)" /> Ration Card required
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#1a8461', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={18} /> Application Form
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                {['Aadhaar Card', 'Ration Card', 'Income Certificate', 'Passport Photo'].map((doc, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px' }}>
                                            <FileText size={16} color="#64748b" />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', flex: 1 }}>{doc}</span>
                                        {idx === 2 ? <AlertCircle size={16} color="var(--orange)" /> : <CheckCircle size={16} color="var(--emerald)" />}
                                        <ChevronRight size={16} color="#cbd5e1" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', color: '#1a8461', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={18} /> Application Form
                            </div>
                            <ChevronRight size={18} />
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <div className="form-group">
                                <label className="label">Full Name <Info size={12} /></label>
                                <input className="input" defaultValue="Bharti Devi" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="label">Address <Info size={12} /></label>
                                    <input className="input" defaultValue="Village Rajpur, District Raipur" />
                                </div>
                                <div className="form-group">
                                    <label className="label">Income <Info size={12} /></label>
                                    <div style={{ position: 'relative' }}>
                                        <input className="input" defaultValue="25,000" />
                                        <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#94a3b8' }}>INR</span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Occupation <Info size={12} /></label>
                                <select className="input">
                                    <option>Housewife</option>
                                    <option>Self Employed</option>
                                    <option>Farmer</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                <button className="btn" style={{ background: '#f1f5f9' }}><Save size={16} /> Save Draft</button>
                                <button className="btn btn-primary"><Send size={16} /> Submit Application</button>
                            </div>
                        </div>
                    </div>
                </div>

                <Sidebar />
            </div>
        </div>
    );
};

export default CitizenServicePortal;
