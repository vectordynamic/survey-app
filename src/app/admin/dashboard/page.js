'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const url = window.location.origin;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="admin-header">
                <h1>Dashboard</h1>
                <button onClick={handleCopyLink} className="btn btn-accent btn-sm">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.697a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.53" />
                    </svg>
                    {copied ? 'Copied!' : 'Copy Survey Link'}
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats?.totalParticipants || 0}</div>
                    <div className="stat-label">Total Participants</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats?.completedSurveys || 0}</div>
                    <div className="stat-label">Completed Surveys</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats?.incompleteSurveys || 0}</div>
                    <div className="stat-label">Incomplete Surveys</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats?.totalQuestions || 0}</div>
                    <div className="stat-label">Total Questions</div>
                </div>
            </div>

            {/* Recent Participants */}
            <div className="card">
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Recent Participants</h3>
                {stats?.recentParticipants?.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Designation</th>
                                    <th>Phone</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentParticipants.map((p) => (
                                    <tr key={p._id}>
                                        <td style={{ fontWeight: 500 }}>{p.fullName || '—'}</td>
                                        <td>{p.designation || '—'}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.813rem' }}>{p.phone}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div className="progress-container" style={{ width: 80, height: 6 }}>
                                                    <div className="progress-fill" style={{
                                                        width: `${stats.totalQuestions > 0 ? (p.lastAnsweredQuestionIndex / stats.totalQuestions) * 100 : 0}%`,
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {p.lastAnsweredQuestionIndex}/{stats.totalQuestions}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.isComplete ? 'badge-success' : 'badge-warning'}`}>
                                                {p.isComplete ? 'Complete' : 'In Progress'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                        No participants registered yet.
                    </p>
                )}
            </div>
        </div>
    );
}
