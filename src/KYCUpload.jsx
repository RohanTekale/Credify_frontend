// src/KYCUpload.jsx — Premium KYC Upload component
// WHY: Original had plain gray box with no visual cues about what to upload or its status
// WHY: Added drag-and-drop zone — fintech standard for document upload
// WHY: Added file preview, upload progress, and status states
import React, { useState, useRef } from 'react';
import { Upload, FileCheck, AlertCircle, Shield, ArrowRight, X } from 'lucide-react';
import api from './services/api';

export default function KYCUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.size < 10 * 1024 * 1024) setFile(f); // 10MB limit
  };

  const upload = async () => {
    if (!file) return;
    setStatus('uploading');
    const formData = new FormData();
    formData.append('document', file);
    try {
      await api.post('/auth/kyc/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => { setFile(null); setStatus('idle'); };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, paddingTop:88 }}>
      <div style={{ width:'100%', maxWidth:460 }}>

        <div className="animate-fade-up text-center mb-8">
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(59,97,245,0.15)', border:'1px solid rgba(59,97,245,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Shield size={24} color="var(--brand-400)" />
          </div>
          <h1 style={{ fontSize:26, marginBottom:8 }}>Identity Verification</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:14, lineHeight:1.6 }}>
            Upload a government-issued ID to verify your identity. Your data is encrypted and never shared.
          </p>
        </div>

        <div className="glass-card animate-fade-up delay-100" style={{ padding:28 }}>
          {status === 'success' ? (
            <div className="animate-fade-in text-center" style={{ padding:'16px 0' }}>
              <FileCheck size={48} color="#10b981" style={{ margin:'0 auto 16px' }} />
              <h3 style={{ fontSize:18, marginBottom:8 }}>Document Submitted!</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:20 }}>
                We'll review your document within 24 hours and notify you by email.
              </p>
              <span className="badge badge-success" style={{ fontSize:12, padding:'5px 14px' }}>Under Review</span>
            </div>
          ) : (
            <>
              {/* Drag Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${drag ? 'var(--brand-500)' : file ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius:12, padding:'36px 24px', textAlign:'center', cursor:'pointer',
                  background: drag ? 'rgba(59,97,245,0.06)' : file ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
                  transition:'all 200ms ease', marginBottom:20,
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display:'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                  <div>
                    <FileCheck size={32} color="#10b981" style={{ margin:'0 auto 10px' }} />
                    <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{file.name}</p>
                    <p style={{ fontSize:11, color:'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={28} color="var(--text-muted)" style={{ margin:'0 auto 12px' }} />
                    <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>Drop your document here</p>
                    <p style={{ fontSize:12, color:'var(--text-muted)' }}>or click to browse · JPG, PNG, PDF · Max 10MB</p>
                  </div>
                )}
              </div>

              {status === 'error' && (
                <div className="animate-fade-in flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontSize:13 }}>
                  <AlertCircle size={15} />
                  Upload failed. Please try again.
                </div>
              )}

              <div style={{ display:'flex', gap:10 }}>
                {file && (
                  <button className="btn-secondary" style={{ fontSize:13 }} onClick={reset}>
                    <X size={14} /> Clear
                  </button>
                )}
                <button
                  className="btn-primary"
                  style={{ flex:1, fontSize:14, opacity: !file ? 0.5 : 1 }}
                  disabled={!file || status === 'uploading'}
                  onClick={upload}
                >
                  {status === 'uploading' ? (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.7s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                      </svg>
                      Uploading…
                    </span>
                  ) : (
                    <>Submit Document <ArrowRight size={15} /></>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="animate-fade-up delay-200 text-center mt-6" style={{ fontSize:11, color:'var(--text-muted)' }}>
          <Shield size={11} style={{ display:'inline', marginRight:4 }} />
          Your document is encrypted with AES-256 and stored securely.
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
