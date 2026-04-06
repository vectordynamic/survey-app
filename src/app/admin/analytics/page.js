'use client';
import { useState, useEffect } from 'react';

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data.analytics || []);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const token = localStorage.getItem('adminToken');
        window.open(`/api/admin/export?token=${token}`, '_blank');
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Analyzing records...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-header">
                <div>
                    <h1>Survey Analytics</h1>
                    <p>Quantitative and qualitative research insights</p>
                </div>
                <button onClick={handleExport} className="btn btn-accent btn-lg">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ marginRight: '0.5rem' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download Full CSV
                </button>
            </div>

            {analytics.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                    <h3 style={{ margin: '0 0 0.5rem' }}>Pending Data Aggregation</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.938rem', maxWidth: 400, margin: '0 auto' }}>
                        Quantitative analysis will be available once the first participant submits their responses.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analytics.map((item) => (
                        <div key={item._id} className="card" style={{ padding: 0, overflow: 'hidden', border: expandedId === item._id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
                            {/* Accordion Header */}
                            <button
                                onClick={() => toggleExpand(item._id)}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem 1.5rem',
                                    background: expandedId === item._id ? 'var(--color-surface-alt)' : 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: expandedId === item._id ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.938rem',
                                    fontWeight: 700,
                                    color: expandedId === item._id ? '#fff' : 'var(--color-primary)',
                                    flexShrink: 0,
                                }}>
                                    {item.order}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.125rem' }}>
                                        {item.datasetName || 'Unnamed Dataset'}
                                    </div>
                                    <div style={{ fontSize: '0.813rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.dataElements || '—'}
                                    </div>
                                </div>
                                <span className={`badge ${item.totalResponses > 0 ? 'badge-success' : 'badge-warning'}`} style={{ padding: '0.375rem 0.75rem', borderRadius: 20 }}>
                                    {item.totalResponses} {item.totalResponses === 1 ? 'response' : 'responses'}
                                </span>
                                <svg
                                    width="20"
                                    height="20"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    style={{
                                        transition: 'transform 0.2s',
                                        transform: expandedId === item._id ? 'rotate(180deg)' : 'rotate(0)',
                                        color: 'var(--color-text-muted)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {/* Accordion Body */}
                            {expandedId === item._id && (
                                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                                    {item.totalResponses === 0 ? (
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                                            No participant data collected for this specific element.
                                        </p>
                                    ) : (
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                                {/* Importance Metric */}
                                                <div style={{ background: 'var(--color-surface-alt)', borderRadius: 16, padding: '1.25rem', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                                        Average Importance
                                                    </div>
                                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                                                        {item.avgImportance}
                                                    </div>
                                                    <div style={{ fontSize: '0.813rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Weighted score out of 4</div>
                                                    <div className="progress-container" style={{ marginTop: '1rem', height: 8, background: '#E2E8F0' }}>
                                                        <div className="progress-fill" style={{ width: `${(item.avgImportance / 4) * 100}%` }} />
                                                    </div>
                                                </div>

                                                {/* Feasibility Metric */}
                                                <div style={{ background: 'var(--color-surface-alt)', borderRadius: 16, padding: '1.25rem', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                                        Feasibility of Generation
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '0.75rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-success)' }}>{item.feasibilityYes}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>YES</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-danger)' }}>{item.feasibilityNo}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>NO</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', borderRadius: 99, overflow: 'hidden', height: 8, background: '#E2E8F0' }}>
                                                        <div style={{
                                                            width: `${(item.feasibilityYes / item.totalResponses) * 100}%`,
                                                            background: 'var(--color-success)',
                                                        }} />
                                                        <div style={{
                                                            width: `${(item.feasibilityNo / item.totalResponses) * 100}%`,
                                                            background: 'var(--color-danger)',
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Qualitative Section: Comments with Participant Names */}
                                            <div style={{ marginTop: '2rem' }}>
                                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span>💬</span> Participant Comments & Qualitative Feedback
                                                </h4>
                                                {item.comments && item.comments.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {item.comments.map((comment, idx) => (
                                                            <div key={idx} style={{ 
                                                                padding: '1rem', 
                                                                background: '#fff', 
                                                                borderRadius: '12px', 
                                                                border: '1px solid var(--color-border)',
                                                                fontSize: '0.875rem'
                                                            }}>
                                                                <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                                                    {comment.participantName}
                                                                </div>
                                                                <div style={{ color: 'var(--color-text)', lineHeight: 1.5 }}>
                                                                    {comment.text}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ padding: '1.5rem', background: 'var(--color-surface-alt)', borderRadius: '12px', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}>
                                                        No qualitative feedback provided for this element.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
