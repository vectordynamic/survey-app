'use client';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function ParticipantsManagement() {
    const [whitelist, setWhitelist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [manualPhone, setManualPhone] = useState('');
    const [manualName, setManualName] = useState('');

    useEffect(() => {
        fetchWhitelist();
    }, []);

    const fetchWhitelist = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/whitelist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.whitelist) {
                setWhitelist(data.whitelist);
            }
        } catch (err) {
            console.error('Failed to fetch whitelist', err);
        } finally {
            setLoading(false);
        }
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();
        if (!manualPhone.trim()) return;

        setUploading(true);
        setMessage('Adding participant...');

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/whitelist', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                    },
                body: JSON.stringify({ 
                    participants: [{ 
                        phone: manualPhone.trim(), 
                        name: manualName.trim() 
                    }] 
                })
                });
            const data = await res.json();
            if (data.success) {
                setMessage(`Successfully added ${manualPhone}`);
                setManualPhone('');
                setManualName('');
                fetchWhitelist();
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (err) {
            setMessage('Failed to add participant. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage('Parsing CSV...');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const participants = results.data.map(row => ({
                    phone: row.phone || row.Phone || row['phone number'] || row['Phone Number'],
                    name: row.name || row.Name || row['full name'] || row['Full Name'] || ''
                })).filter(p => p.phone);

                if (participants.length === 0) {
                    setMessage('Error: No valid phone numbers found in CSV.');
                    setUploading(false);
                    return;
                }

                try {
                    setMessage(`Uploading ${participants.length} participants...`);
                    const token = localStorage.getItem('adminToken');
                    const res = await fetch('/api/admin/whitelist', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ participants })
                    });
                    const data = await res.json();
                    if (data.success) {
                        setMessage(data.message);
                        fetchWhitelist();
                    } else {
                        setMessage(`Error: ${data.error}`);
                    }
                } catch (err) {
                    setMessage('Upload failed. Please try again.');
                } finally {
                    setUploading(false);
                }
            },
            error: (err) => {
                setMessage(`CSV Parsing Error: ${err.message}`);
                setUploading(false);
            }
        });
    };

    const deleteParticipant = async (id) => {
        if (!confirm('Are you sure you want to remove this participant from the whitelist?')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/whitelist?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchWhitelist();
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const filteredWhitelist = whitelist.filter(p => 
        p.phone.includes(searchTerm) || (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container-fluid" style={{ padding: '2rem' }}>
            <div className="admin-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Authorized Participants</h1>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Manage the list of phone numbers allowed to participate in the survey.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Manual Add Form */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(58,124,165,0.1)', color: 'var(--color-primary)', borderRadius: '8px' }}>
                            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Add Manually</h4>
                    </div>
                    <form onSubmit={handleManualAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Phone Number</label>
                            <input 
                                type="tel" 
                                className="form-input" 
                                placeholder="e.g. 01XXXXXXXXX" 
                                required 
                                value={manualPhone}
                                onChange={(e) => setManualPhone(e.target.value)}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Participant Name (Optional)</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="John Doe" 
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={uploading}>
                            {uploading && manualPhone ? 'Adding...' : 'Add Participant'}
                        </button>
                    </form>
                </div>

                {/* CSV Upload tool */}
                <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(58,124,165,0.1)', color: 'var(--color-primary)', borderRadius: '8px' }}>
                            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Bulk Upload (CSV)</h4>
                    </div>
                    <div style={{ background: 'var(--color-surface-alt)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px dashed var(--color-border)' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            <strong>CSV Format:</strong> Ensure your file has a header row. 
                            Recognized headers: <code style={{ color: 'var(--color-primary)', fontWeight: 600 }}>phone</code>, <code style={{ color: 'var(--color-primary)', fontWeight: 600 }}>name</code>.
                        </p>
                    </div>
                    <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ fontSize: '0.813rem', width: '100%' }}
                    />
                    {message && (
                        <p style={{ 
                            marginTop: '1rem', 
                            fontSize: '0.75rem', 
                            color: message.startsWith('Error') ? 'var(--color-error)' : 'var(--color-primary)',
                            fontWeight: 500,
                            padding: '0.5rem',
                            background: message.startsWith('Error') ? 'rgba(185,28,28,0.05)' : 'rgba(58,124,165,0.05)',
                            borderRadius: '4px'
                        }}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <input 
                        type="text"
                        placeholder="Search by name or phone..."
                        className="form-input"
                        style={{ maxWidth: 300 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
                        Total: {filteredWhitelist.length} authorized
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Added Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div className="admin-spinner" style={{ margin: '0 auto 1rem' }}></div>
                                        <span>Loading whitelist...</span>
                                    </td>
                                </tr>
                            ) : filteredWhitelist.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                        No authorized participants found.
                                    </td>
                                </tr>
                            ) : (
                                filteredWhitelist.map((p) => (
                                    <tr key={p._id}>
                                        <td style={{ fontWeight: 500 }}>{p.name || 'N/A'}</td>
                                        <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{p.phone}</td>
                                        <td style={{ fontSize: '0.813rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                onClick={() => deleteParticipant(p._id)}
                                                style={{ 
                                                    padding: '0.375rem 0.75rem', 
                                                    borderRadius: '6px', 
                                                    border: '1px solid #fee2e2', 
                                                    background: '#fff', 
                                                    color: '#991b1b',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
