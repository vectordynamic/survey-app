'use client';
import { useState, useEffect } from 'react';

export default function QuestionsManagement() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(''); // 'success' or 'error'
    const [clearExisting, setClearExisting] = useState(true);
    const [stats, setStats] = useState({ total: 0, datasets: [] });
    const [questions, setQuestions] = useState([]);
    const [expandedDataset, setExpandedDataset] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // stores ID of item being processed

    useEffect(() => {
        fetchStats();
    }, []);

    const [editForm, setEditForm] = useState(null);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const [statsRes, questionsRes] = await Promise.all([
                fetch('/api/admin/questions/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/questions', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (statsRes.ok && questionsRes.ok) {
                const sData = await statsRes.json();
                const qData = await questionsRes.json();
                setStats(sData);
                setQuestions(qData.questions || []);
            } else {
                setMessage('Failed to load dashboard data. Please log in again.');
                setStatus('error');
            }
        } catch (err) {
            setMessage('Server connection error.');
            setStatus('error');
        }
    };

    const startEditing = (q) => {
        setEditingId(q._id);
        setEditForm({ ...q });
    };

    const handleSaveEdit = async () => {
        if (!editForm) return;
        setActionLoading(editForm._id);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/questions', {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setEditingId(null);
                setEditForm(null);
                fetchStats();
            }
        } catch (err) {
            alert('Failed to save changes');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this specific item?')) return;
        setActionLoading(id);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/questions?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) fetchStats();
        } catch (err) {
            alert('Failed to delete');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddItem = async (dataTitle) => {
        const token = localStorage.getItem('adminToken');
        const newItem = {
            dataTitle,
            datasetName: dataTitle.split(':')[1]?.trim() || dataTitle,
            dataElements: 'New Data Element',
            suggestedDisaggregates: 'None',
        };
        
        try {
            const res = await fetch('/api/admin/questions', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newItem),
            });
            if (res.ok) fetchStats();
        } catch (err) {
            alert('Failed to add item');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls'))) {
            setFile(selectedFile);
            setMessage('');
        } else {
            setFile(null);
            setMessage('Please select a valid Excel file (.xlsx or .xls)');
            setStatus('error');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setMessage('Processing Excel file...');
        setStatus('');

        try {
            const token = localStorage.getItem('adminToken');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('clearExisting', clearExisting);

            const res = await fetch('/api/admin/questions/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setStatus('success');
                setFile(null);
                fetchStats();
            } else {
                setMessage(data.error || 'Upload failed');
                setStatus('error');
            }
        } catch (err) {
            setMessage('Server connection error. Please check your network.');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-content">
            <header className="admin-header">
                <div>
                    <h1>Manage Survey Questions</h1>
                    <p>Upload and organize your research data datasets</p>
                </div>
            </header>

            <div className="admin-grid">
                {/* Upload Section */}
                <div className="card">
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem' }}>Upload New Dataset</h3>
                    
                    <form onSubmit={handleUpload}>
                        <div style={{ 
                            border: '2px dashed var(--color-border)', 
                            borderRadius: '12px', 
                            padding: '2rem', 
                            textAlign: 'center',
                            background: file ? 'var(--color-surface-alt)' : 'transparent',
                            transition: 'all 0.3s',
                            marginBottom: '1.25rem'
                        }}>
                            <input 
                                type="file" 
                                id="excel-upload" 
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="excel-upload" style={{ cursor: 'pointer' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                                    {file ? file.name : 'Click to select Excel file'}
                                </div>
                                <div style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                    Supports .xlsx and .xls formats
                                </div>
                            </label>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={clearExisting}
                                    onChange={(e) => setClearExisting(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Clear all existing questions before uploading</span>
                            </label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', paddingLeft: '1.8rem' }}>
                                Warning: This will permanently remove all current questions from the database.
                            </p>
                        </div>

                        {message && (
                            <div style={{ 
                                padding: '0.875rem', 
                                borderRadius: '8px', 
                                marginBottom: '1.25rem',
                                fontSize: '0.875rem',
                                background: status === 'success' ? '#ECFDF5' : '#FEF2F2',
                                color: status === 'success' ? '#065F46' : '#991B1B',
                                border: `1px solid ${status === 'success' ? '#A7F3D0' : '#FECACA'}`
                            }}>
                                {message}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-block btn-lg"
                            disabled={loading || !file}
                        >
                            {loading ? 'Processing dataset...' : 'Push to Database'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#F9FAFB', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.813rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Format Requirements:</h4>
                        <ul style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)', paddingLeft: '1.25rem', margin: 0, lineHeight: 1.6 }}>
                            <li>Data must start on **Row 5**</li>
                            <li>Columns: **Facility Category**, **Dataset Name**, **Data Elements**, **Suggested Disaggregates**</li>
                            <li>The study title should be on **Row 3**</li>
                        </ul>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="card">
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem' }}>Current Survey Status</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--color-surface-alt)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{stats.total}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Total Questions</div>
                        </div>
                        <div style={{ background: 'var(--color-surface-alt)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{stats.datasets?.length || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Active Datasets</div>
                        </div>
                    </div>

                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.813rem', fontWeight: 600 }}>LOADED DATASETS</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.datasets?.length > 0 ? stats.datasets.map((ds, i) => (
                            <div key={i} className="dataset-group" style={{ 
                                border: '1px solid var(--color-border)', 
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: expandedDataset === ds._id ? '#fff' : 'transparent'
                            }}>
                                <div 
                                    onClick={() => setExpandedDataset(expandedDataset === ds._id ? null : ds._id)}
                                    style={{ 
                                        padding: '0.875rem 1.25rem', 
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        background: expandedDataset === ds._id ? 'var(--color-surface-alt)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ transform: expandedDataset === ds._id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
                                        <div style={{ fontSize: '0.938rem', fontWeight: 600 }}>{ds._id || 'Unnamed Dataset'}</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', background: '#E0F2FE', color: '#0369A1', borderRadius: '20px', fontWeight: 600 }}>
                                        {ds.count} items
                                    </div>
                                </div>

                                {expandedDataset === ds._id && (
                                    <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.813rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                                        <th style={{ padding: '0.75rem 0.5rem', width: '50px' }}>Ord</th>
                                                        <th style={{ padding: '0.75rem 0.5rem' }}>Data Element</th>
                                                        <th style={{ padding: '0.75rem 0.5rem' }}>Suggested Disaggregates</th>
                                                        <th style={{ padding: '0.75rem 0.5rem', width: '90px' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {questions.filter(q => q.dataTitle === ds._id).map((q) => (
                                                        <tr key={q._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                            <td style={{ padding: '0.5rem' }}>
                                                                {editingId === q._id ? (
                                                                    <input 
                                                                        type="number" 
                                                                        className="form-input" 
                                                                        style={{ padding: '0.25rem', fontSize: '0.75rem' }}
                                                                        value={editForm.order}
                                                                        onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
                                                                    />
                                                                ) : q.order}
                                                            </td>
                                                            <td style={{ padding: '0.5rem' }}>
                                                                {editingId === q._id ? (
                                                                    <textarea 
                                                                        className="form-textarea" 
                                                                        style={{ padding: '0.25rem', fontSize: '0.75rem', minHeight: '40px' }}
                                                                        value={editForm.dataElements}
                                                                        onChange={(e) => setEditForm({ ...editForm, dataElements: e.target.value })}
                                                                    />
                                                                ) : q.dataElements}
                                                            </td>
                                                            <td style={{ padding: '0.5rem' }}>
                                                                {editingId === q._id ? (
                                                                    <textarea 
                                                                        className="form-textarea" 
                                                                        style={{ padding: '0.25rem', fontSize: '0.75rem', minHeight: '40px' }}
                                                                        value={editForm.suggestedDisaggregates}
                                                                        onChange={(e) => setEditForm({ ...editForm, suggestedDisaggregates: e.target.value })}
                                                                    />
                                                                ) : q.suggestedDisaggregates}
                                                            </td>
                                                            <td style={{ padding: '0.5rem' }}>
                                                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                                    {editingId === q._id ? (
                                                                        <button 
                                                                            onClick={handleSaveEdit}
                                                                            className="btn btn-primary"
                                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.688rem' }}
                                                                            disabled={actionLoading === q._id}
                                                                        >
                                                                            {actionLoading === q._id ? '...' : 'Save'}
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => startEditing(q)}
                                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                                                                            title="Edit"
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => handleDelete(q._id)}
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                                                                        title="Delete"
                                                                        disabled={actionLoading === q._id}
                                                                    >
                                                                        {actionLoading === q._id ? '...' : '🗑️'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button 
                                                onClick={() => handleAddItem(ds._id)}
                                                className="btn btn-secondary btn-block"
                                                style={{ marginTop: '1rem', padding: '0.5rem', fontSize: '0.75rem', borderStyle: 'dashed' }}
                                            >
                                                + Add New Item to this Dataset
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: '16px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                                <p style={{ fontSize: '0.875rem' }}>No questions loaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
