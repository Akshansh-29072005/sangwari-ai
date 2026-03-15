import React, { useState } from 'react';
import { FileText, Send, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const GrievanceForm = ({ onBack, t }) => {
    const [formData, setFormData] = useState({
        citizen_name: '',
        mobile: '',
        district: 'Raipur',
        complaint_text: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:8000/grievance/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit grievance');
            }
            
            const data = await response.json();
            setResult(data);
            
            // Clear form
            setFormData({ citizen_name: '', mobile: '', district: 'Raipur', complaint_text: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate percentage and color for a nice UI
    const getConfidenceUI = (confidence) => {
        const percent = Math.round(confidence * 100);
        let color = '#ef4444'; // Red for low
        if (percent > 60) color = '#eab308'; // Yellow for medium
        if (percent > 85) color = '#22c55e'; // Green for high
        return { percent, color };
    };

    return (
        <div className="container" style={{ maxWidth: '800px', animation: 'fadeIn 0.3s ease-out' }}>
            <div className="discovery-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                        {t.registerGrievance || "Register Grievance"}
                    </h2>
                    <p style={{ color: '#64748b' }}>AI-Powered Department Classification</p>
                </div>
                <button className="btn" onClick={onBack} style={{ width: 'fit-content', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', background: 'white' }}>
                    <ArrowLeft size={16} style={{ display: 'inline', marginRight: '0.5rem' }}/>
                    {t.profilePage?.back || "Back to Dashboard"}
                </button>
            </div>

            {error && (
                <div style={{ padding: '1rem', marginBottom: '1.5rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <AlertTriangle size={20} />
                    {error}
                </div>
            )}

            {result && (
                <div className="card" style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ background: '#22c55e', padding: '0.5rem', borderRadius: '50%', color: 'white' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
                                Grievance Successfully Registered
                            </h3>
                            <p style={{ color: '#15803d', marginBottom: '1rem' }}>Complaint ID: <strong>#{result.grievance_id.split('-')[0]}</strong></p>
                            
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Complaint Routed To:</p>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                                    {result.department} Department
                                </h4>
                                
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#475569' }}>
                                        <span>AI Classification Confidence</span>
                                        <span style={{ fontWeight: 600, color: getConfidenceUI(result.confidence).color }}>
                                            {getConfidenceUI(result.confidence).percent}%
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            background: getConfidenceUI(result.confidence).color, 
                                            width: `${getConfidenceUI(result.confidence).percent}%`,
                                            transition: 'width 1s ease-out'
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#475569' }}>Citizen Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.citizen_name}
                                onChange={(e) => setFormData({...formData, citizen_name: e.target.value})}
                                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }}
                                placeholder="e.g. Ram Kumar"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#475569' }}>Phone Number</label>
                            <input 
                                type="tel" 
                                required
                                value={formData.mobile}
                                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                                style={{ padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }}
                                placeholder="10-digit mobile number"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#475569' }}>Complaint Details (Hindi/English/Chhattisgarhi)</label>
                        <textarea 
                            required
                            rows="4"
                            value={formData.complaint_text}
                            onChange={(e) => setFormData({...formData, complaint_text: e.target.value})}
                            style={{ 
                                padding: '1rem', 
                                border: '1px solid #cbd5e1', 
                                borderRadius: '6px', 
                                fontSize: '1rem',
                                resize: 'vertical'
                            }}
                            placeholder="Type your complaint here. Examples: 'PM Kisan ka paisa nahi mila' or 'Ration card update nahi hua'"
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary" 
                        style={{ 
                            padding: '1rem', 
                            fontSize: '1rem', 
                            fontWeight: 600, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Analyzing with AI...' : (
                            <>
                                <Send size={18} />
                                Submit Grievance
                            </>
                        )}
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '-0.5rem' }}>
                        Our AI engine will automatically route this complaint to the correct government department.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default GrievanceForm; 
