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
            const res = await fetch('/api/admin/analytics');
            const data = await res.json();
            setAnalytics(data.analytics || []);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        window.open('/api/admin/export', '_blank');
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-header">
                <h1>Survey Analytics</h1>
                <button onClick={handleExport} className="btn btn-accent">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export CSV
                </button>
            </div>

            {analytics.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
                    <h3 style={{ margin: '0 0 0.375rem' }}>No Data Yet</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                        Analytics will appear here once participants start answering questions.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analytics.map((item) => (
                        <div key={item._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Accordion Header */}
                            <button
                                onClick={() => toggleExpand(item._id)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: 'var(--color-surface-alt)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.813rem',
                                    fontWeight: 700,
                                    color: 'var(--color-primary)',
                                    flexShrink: 0,
                                }}>
                                    {item.order}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                        {item.datasetName || 'Unnamed Dataset'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.dataElements || '—'}
                                    </div>
                                </div>
                                <span className={`badge ${item.totalResponses > 0 ? 'badge-success' : 'badge-warning'}`}>
                                    {item.totalResponses} {item.totalResponses === 1 ? 'response' : 'responses'}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
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
                                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--color-surface-alt)' }}>
                                    {item.totalResponses === 0 ? (
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                                            No responses yet for this question.
                                        </p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                            {/* Average Importance */}
                                            <div style={{ background: 'var(--color-surface-alt)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.688rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                                    Avg. Importance
                                                </div>
                                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                                    {item.avgImportance}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>out of 5</div>
                                                {/* Visual bar */}
                                                <div className="progress-container" style={{ marginTop: '0.5rem', height: 6 }}>
                                                    <div className="progress-fill" style={{ width: `${(item.avgImportance / 5) * 100}%` }} />
                                                </div>
                                            </div>

                                            {/* Feasibility */}
                                            <div style={{ background: 'var(--color-surface-alt)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.688rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                                    Feasibility
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{item.feasibilityYes}</div>
                                                        <div style={{ fontSize: '0.688rem', color: 'var(--color-text-muted)' }}>Yes</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>{item.feasibilityNo}</div>
                                                        <div style={{ fontSize: '0.688rem', color: 'var(--color-text-muted)' }}>No</div>
                                                    </div>
                                                </div>
                                                {/* Visual ratio bar */}
                                                <div style={{ display: 'flex', borderRadius: 99, overflow: 'hidden', height: 6 }}>
                                                    <div style={{
                                                        width: `${item.totalResponses > 0 ? (item.feasibilityYes / item.totalResponses) * 100 : 0}%`,
                                                        background: 'var(--color-success)',
                                                    }} />
                                                    <div style={{
                                                        width: `${item.totalResponses > 0 ? (item.feasibilityNo / item.totalResponses) * 100 : 0}%`,
                                                        background: 'var(--color-danger)',
                                                    }} />
                                                </div>
                                            </div>

                                            {/* Relevance */}
                                            <div style={{ background: 'var(--color-surface-alt)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.688rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                                    Relevance
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{item.relevanceYes}</div>
                                                        <div style={{ fontSize: '0.688rem', color: 'var(--color-text-muted)' }}>Yes</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>{item.relevanceNo}</div>
                                                        <div style={{ fontSize: '0.688rem', color: 'var(--color-text-muted)' }}>No</div>
                                                    </div>
                                                </div>
                                                {/* Visual ratio bar */}
                                                <div style={{ display: 'flex', borderRadius: 99, overflow: 'hidden', height: 6 }}>
                                                    <div style={{
                                                        width: `${item.totalResponses > 0 ? (item.relevanceYes / item.totalResponses) * 100 : 0}%`,
                                                        background: 'var(--color-success)',
                                                    }} />
                                                    <div style={{
                                                        width: `${item.totalResponses > 0 ? (item.relevanceNo / item.totalResponses) * 100 : 0}%`,
                                                        background: 'var(--color-danger)',
                                                    }} />
                                                </div>
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
