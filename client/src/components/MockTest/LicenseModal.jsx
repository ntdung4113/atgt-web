import React from 'react';
const LICENSES = ['A1', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D2', 'D', 'BE', 'C1E', 'CE', 'D1E', 'D2E', 'DE'];
const LICENSE_INFO = {
    A1: { count: 25, min: 21, time: 19 },
    A: { count: 25, min: 23, time: 19 },
    B1: { count: 25, min: 23, time: 19 },
    B: { count: 30, min: 27, time: 20 },
    C1: { count: 35, min: 32, time: 22 },
    C: { count: 40, min: 36, time: 24 },
    D1: { count: 45, min: 41, time: 26 },
    D2: { count: 45, min: 41, time: 26 },
    D: { count: 45, min: 41, time: 26 },
    BE: { count: 45, min: 41, time: 26 },
    C1E: { count: 45, min: 41, time: 26 },
    CE: { count: 45, min: 41, time: 26 },
    D1E: { count: 45, min: 41, time: 26 },
    D2E: { count: 45, min: 41, time: 26 },
    DE: { count: 45, min: 41, time: 26 },
};

export default function LicenseModal({ open, license, setLicense, onStart }) {
    if (!open) return null;
    const info = LICENSE_INFO[license];
    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s'
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 18,
                padding: '40px 36px 32px 36px',
                minWidth: 340,
                maxWidth: 420,
                boxShadow: '0 8px 32px #0003',
                textAlign: 'center',
                animation: 'modalPop .25s cubic-bezier(.4,2,.6,1)'
            }}>
                <h1 style={{ color: '#1976d2', marginBottom: 18, fontSize: 28, fontWeight: 800 }}>Chọn hạng bằng</h1>
                <p style={{ color: '#555', marginBottom: 24, fontSize: 16 }}>Vui lòng chọn hạng bằng để bắt đầu thi thử. Thông tin đề thi sẽ hiển thị bên dưới.</p>
                <select value={license} onChange={e => setLicense(e.target.value)} style={{ padding: 10, borderRadius: 8, fontSize: 18, marginBottom: 22, width: '80%' }}>
                    {LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <div style={{ marginBottom: 22, fontSize: 17, color: '#333', background: '#f5f5f5', borderRadius: 8, padding: 16 }}>
                    Số câu hỏi: <b>{info.count}</b><br />
                    Số câu cần đúng: <b>{info.min}</b><br />
                    Thời gian: <b>{info.time} phút</b>
                </div>
                <button onClick={onStart} style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '14px 40px',
                    fontWeight: 700,
                    fontSize: 19,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #1976d233'
                }}>Bắt đầu</button>
            </div>
            <style>
                {`@keyframes modalPop {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }`}
            </style>
        </div>
    );
}
