'use client';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function AdminQuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [saving, setSaving] = useState(false);

    // CSV upload state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [form, setForm] = useState({
        order: '',
        facilityCategory: '',
        datasetName: '',
        dataElements: '',
        suggestedDisaggregates: '',
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch('/api/questions');
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingQuestion(null);
        setForm({
            order: questions.length + 1,
            facilityCategory: '',
            datasetName: '',
            dataElements: '',
            suggestedDisaggregates: '',
        });
        setShowModal(true);
    };

    const openEditModal = (q) => {
        setEditingQuestion(q);
        setForm({
            order: q.order,
            facilityCategory: q.facilityCategory || '',
            datasetName: q.datasetName || '',
            dataElements: q.dataElements || '',
            suggestedDisaggregates: q.suggestedDisaggregates || '',
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingQuestion) {
                // Update
                await fetch('/api/questions', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ _id: editingQuestion._id, ...form, order: parseInt(form.order) }),
                });
            } else {
                // Create
                await fetch('/api/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...form, order: parseInt(form.order) }),
                });
            }
            setShowModal(false);
            fetchQuestions();
        } catch (err) {
            alert('Error saving question');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            await fetch(`/api/questions?id=${id}`, { method: 'DELETE' });
            fetchQuestions();
        } catch (err) {
            alert('Error deleting question');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadResult(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const res = await fetch('/api/questions/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ questions: results.data }),
                    });
                    const data = await res.json();

                    if (data.success) {
                        setUploadResult({
                            success: true,
                            added: data.added,
                            duplicates: data.duplicates,
                            total: results.data.length
                        });
                        fetchQuestions();
                    } else {
                        setUploadResult({ success: false, error: data.error });
                    }
                } catch (err) {
                    setUploadResult({ success: false, error: 'Failed to upload CSV.' });
                } finally {
                    setUploading(false);
                }
            },
            error: (error) => {
                setUploadResult({ success: false, error: error.message });
                setUploading(false);
            }
        });
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Question Management</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => { setShowUploadModal(true); setUploadResult(null); }} className="btn btn-secondary">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload CSV
                    </button>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Question
                    </button>
                </div>
            </div>

            {loading ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem 0' }}>Loading questions...</p>
            ) : questions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                    <h3 style={{ margin: '0 0 0.375rem', fontSize: '1.125rem', fontWeight: 600 }}>No Questions Yet</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: '0 0 1.25rem' }}>
                        Start building your survey by adding questions.
                    </p>
                    <button onClick={openAddModal} className="btn btn-primary">
                        Add Your First Question
                    </button>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>#</th>
                                    <th>Facility Category</th>
                                    <th>Dataset Name</th>
                                    <th>Data Elements</th>
                                    <th style={{ width: 120 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((q) => (
                                    <tr key={q._id}>
                                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{q.order}</td>
                                        <td>{q.facilityCategory || '—'}</td>
                                        <td style={{ fontWeight: 500 }}>{q.datasetName || '—'}</td>
                                        <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {q.dataElements || '—'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                <button
                                                    onClick={() => openEditModal(q)}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '0.375rem 0.625rem' }}
                                                >
                                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q._id)}
                                                    className="btn btn-danger btn-sm"
                                                    style={{ padding: '0.375rem 0.625rem' }}
                                                >
                                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                            <button onClick={() => setShowModal(false)} className="modal-close">×</button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label className="form-label form-label-required">Order Number</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Facility Category</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Primary Health Care"
                                    value={form.facilityCategory}
                                    onChange={(e) => setForm({ ...form, facilityCategory: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dataset Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Maternal Health"
                                    value={form.datasetName}
                                    onChange={(e) => setForm({ ...form, datasetName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Data Elements</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Describe the data elements..."
                                    value={form.dataElements}
                                    onChange={(e) => setForm({ ...form, dataElements: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Suggested Disaggregates</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="e.g. Age, Gender, Location..."
                                    value={form.suggestedDisaggregates}
                                    onChange={(e) => setForm({ ...form, suggestedDisaggregates: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                    {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload CSV Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Bulk Upload Questions (CSV)</h3>
                            <button onClick={() => setShowUploadModal(false)} className="modal-close">×</button>
                        </div>

                        {!uploadResult ? (
                            <div>
                                <div style={{ background: 'var(--color-surface-alt)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>CSV Format Requirements</h4>
                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.813rem', color: 'var(--color-text-secondary)' }}>
                                        Please ensure your CSV file contains the following column headers exactly:
                                    </p>
                                    <code style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'var(--color-surface)', padding: '0.25rem 0.5rem', borderRadius: 4, display: 'block', wordBreak: 'break-all' }}>
                                        order, facilityCategory, datasetName, dataElements, suggestedDisaggregates
                                    </code>
                                </div>

                                <div className="form-group" style={{ textAlign: 'center', padding: '2rem 1rem', border: '2px dashed var(--color-surface-alt)', borderRadius: 8 }}>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                        id="csv-upload"
                                    />
                                    <label htmlFor="csv-upload" className="btn btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                                        {uploading ? 'Processing taking a moment...' : 'Select CSV File'}
                                    </label>
                                    {uploading && <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Uploading and parsing data...</p>}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                {uploadResult.success ? (
                                    <>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                        <h3 style={{ margin: '0 0 1rem', color: 'var(--color-text)' }}>Upload Complete</h3>
                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'var(--color-surface-alt)', padding: '1rem', borderRadius: 8, minWidth: 100 }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{uploadResult.added}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>New Uploaded</div>
                                            </div>
                                            <div style={{ background: 'var(--color-surface-alt)', padding: '1rem', borderRadius: 8, minWidth: 100 }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-warning)' }}>{uploadResult.duplicates}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Duplicates Skipped</div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                                        <h3 style={{ margin: '0 0 1rem', color: 'var(--color-danger)' }}>Upload Failed</h3>
                                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{uploadResult.error}</p>
                                    </>
                                )}
                                <button onClick={() => setShowUploadModal(false)} className="btn btn-primary" style={{ width: '100%' }}>
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
