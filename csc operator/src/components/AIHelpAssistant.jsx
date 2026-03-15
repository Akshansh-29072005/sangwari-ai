import React from 'react';
import {
    Mic, Send, RefreshCw, FileText, CheckCircle, ShieldAlert, AlertTriangle, BookOpen, Fingerprint, Lock, LogOut, Search
} from 'lucide-react';

const AIHelpAssistant = ({ onBack }) => {

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="discovery-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>AI Help Assistant</h2>
                    <p style={{ color: '#64748b' }}>Ask questions or get guidance for citizen services.</p>
                </div>
                <button className="btn" onClick={onBack} style={{ width: 'fit-content', padding: '0.5rem 1rem', border: '1px solid #e2e8f0', background: 'white' }}>
                    ← Back to Dashboard
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e3a8a', fontWeight: 600 }}>
                        <Mic size={20} /> AI Help Assistant
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 500 }}>
                            <RefreshCw size={14} /> Only
                        </div>
                        <div style={{ cursor: 'pointer', color: '#64748b' }}>•••</div>
                    </div>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '400px', overflowY: 'auto', background: '#ffffff' }}>
                    {/* User Message 1 */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                            <img src="https://i.pravatar.cc/150?u=csc" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '8px', borderTopLeftRadius: '0', maxWidth: '85%', color: '#334155' }}>
                            What documents are required for widow pension?
                        </div>
                    </div>

                    {/* AI Response 1 */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                        <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '8px', borderTopRightRadius: '0', maxWidth: '85%', color: '#065f46', border: '1px solid #d1fae5' }}>
                            <p style={{ marginBottom: '0.75rem', fontWeight: 500 }}>Required documents for Mukhyamantri Widow Pension Scheme:</p>
                            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li>Death certificate of spouse</li>
                                <li>Aadhaar card</li>
                                <li>Income certificate</li>
                                <li>Bank account details</li>
                            </ul>
                        </div>
                    </div>

                    {/* User Message 2 */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                            <img src="https://i.pravatar.cc/150?u=csc" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ background: '#eff6ff', padding: '0.75rem 1rem', borderRadius: '8px', borderTopLeftRadius: '0', maxWidth: '85%', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            विद्युया पेंशन के लिए क्या डॉक्युमेंट चाहिए? <RefreshCw size={14} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#eff6ff', borderRadius: '50%' }}>
                            <Mic size={16} color="#2563eb" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="विद्युया पेंशन के लिए क्या डॉक्युमेंट चाहिए" 
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', color: '#64748b' }} 
                        />
                        <div style={{ position: 'absolute', left: '50px', top: '50%', transform: 'translateY(-50%)' }}>
                            <CheckCircle size={16} color="#94a3b8" />
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
                        Send
                    </button>
                </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Quick Help</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldAlert size={20} color="#059669" />
                    </div>
                    <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.95rem' }}>Scheme Eligibility Rules</div>
                </div>
                
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color="#2563eb" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>Required Documents</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>for Certificates</div>
                    </div>
                </div>
                
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fff7ed', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={20} color="#ea580c" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>How to <span style={{ color: '#b91c1c' }}>File Grievances</span></div>
                    </div>
                </div>
                
                <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fff7ed', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={20} color="#ea580c" />
                    </div>
                    <div style={{ fontWeight: 600, color: '#b91c1c', fontSize: '0.95rem' }}>Fix Application Errors</div>
                </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', background: '#0f766e', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={16} color="white" />
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Application Error Detected</h4>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Ask citizen to upload a valid certificate.</p>
                    </div>
                </div>
                <button className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    Recheck Application
                </button>
            </div>
            
        </div>
    );
};

export default AIHelpAssistant;
