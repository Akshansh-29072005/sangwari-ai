import React, { useState, useEffect } from 'react';
import { 
    X, ChevronRight, CheckCircle, FileText, User, 
    Home, CreditCard, Phone, Calendar, ShieldCheck 
} from 'lucide-react';

const SchemeApplicationForm = ({ citizen, scheme, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [appId, setAppId] = useState('');

    // Form state auto-filled from props
    const [formData, setFormData] = useState({
        citizen_name: citizen?.name || '',
        mobile_number: citizen?.mobile_number || '',
        aadhaar_number: citizen?.aadhar_number || '',
        service_type: scheme?.scheme_name || 'Scheme Application',
        operator_id: 'CSC-RAIPUR-001',
        department: scheme?.department || 'Social Welfare'
    });

    // Ensure form updates if props change
    useEffect(() => {
        if (citizen || scheme) {
            setFormData({
                citizen_name: citizen?.name || '',
                mobile_number: citizen?.mobile_number || '',
                aadhaar_number: citizen?.aadhar_number || '',
                service_type: scheme?.scheme_name || 'Scheme Application',
                operator_id: 'CSC-RAIPUR-001',
                department: scheme?.department || 'Social Welfare'
            });
        }
    }, [citizen, scheme]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/applications/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setAppId(data.application_id);
                setSubmitted(true);
                setTimeout(() => {
                    onSuccess && onSuccess(data.application_id);
                }, 2000);
            } else {
                alert("Submission failed: " + (data.detail || "Unknown error"));
            }
        } catch (err) {
            console.error("Error submitting application:", err);
            alert("Submission error. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '3rem', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <CheckCircle size={48} color="#10b981" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.5rem' }}>Application Submitted!</h2>
                <p style={{ color: '#065f46', marginBottom: '1.5rem' }}>The application for <strong>{formData.service_type}</strong> has been successfully registered.</p>
                <div style={{ background: '#f0fdf4', border: '1px solid #bdf1d5', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>Tracking ID: {appId}</p>
                    <p style={{ fontSize: '0.8rem', color: '#166534' }}>An SMS notification has been sent to {formData.mobile_number}</p>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Redirecting to tracker...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn" onClick={onBack} style={{ background: '#f1f5f9', color: '#475569', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    <X size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Apply for {scheme?.scheme_name}</h2>
                    <p style={{ color: '#64748b' }}>Complete the application for {citizen?.name}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                <User size={16} /> Full Name
                            </label>
                            <input 
                                type="text" 
                                className="input" 
                                value={formData.citizen_name}
                                onChange={(e) => setFormData({...formData, citizen_name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                <Phone size={16} /> Mobile Number
                            </label>
                            <input 
                                type="text" 
                                className="input" 
                                value={formData.mobile_number}
                                onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                <CreditCard size={16} /> Aadhaar Number
                            </label>
                            <input 
                                type="text" 
                                className="input" 
                                value={formData.aadhaar_number}
                                onChange={(e) => setFormData({...formData, aadhaar_number: e.target.value})}
                                required
                                readOnly
                                style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                <FileText size={16} /> Scheme Selection
                            </label>
                            <input 
                                type="text" 
                                className="input" 
                                value={formData.service_type}
                                readOnly
                                style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '1.25rem', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #1e40af' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck size={18} /> Verified Data from NagarikAI
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                            By submitting this application, you confirm that the citizen meets the eligibility criteria verified by our discovery engine.
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-emerald" 
                        disabled={loading}
                        style={{ width: '100%', padding: '1rem', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, marginTop: '1rem' }}
                    >
                        {loading ? 'Processing...' : 'Submit Application Now'} <ChevronRight size={20} />
                    </button>
                </form>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>Application Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b' }}>Department:</span>
                            <span style={{ fontWeight: 600 }}>{formData.department}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b' }}>Verification:</span>
                            <span style={{ fontWeight: 600, color: '#10b981' }}>Pass (AI Engine)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b' }}>Service SLA:</span>
                            <span style={{ fontWeight: 600 }}>15-20 Days</span>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '0.5rem 0', paddingTop: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                                "Real-time tracking will be enabled immediately after submission."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchemeApplicationForm;
