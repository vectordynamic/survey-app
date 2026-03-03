'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SurveyPage() {
    const router = useRouter();
    const params = useParams();
    const questionIndex = parseInt(params.questionIndex);

    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [participantId, setParticipantId] = useState('');

    const [formData, setFormData] = useState({
        importance: 0,
        feasibility: null,
        relevance: null,
        comment: '',
    });

    // Load questions and responses
    useEffect(() => {
        const pid = localStorage.getItem('participantId');
        if (!pid) {
            router.push('/');
            return;
        }
        setParticipantId(pid);

        async function loadData() {
            try {
                const [qRes, rRes] = await Promise.all([
                    fetch('/api/questions'),
                    fetch(`/api/survey/submit?participantId=${pid}`),
                ]);
                const qData = await qRes.json();
                const rData = await rRes.json();

                setQuestions(qData.questions || []);

                // Map responses by questionId for quick lookup
                const respMap = {};
                (rData.responses || []).forEach((r) => {
                    respMap[r.questionId] = r;
                });
                setResponses(respMap);
            } catch (err) {
                console.error('Error loading survey data:', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    // Load saved answer for current question
    useEffect(() => {
        if (questions.length === 0) return;
        const currentQ = questions[questionIndex - 1];
        if (!currentQ) return;

        const saved = responses[currentQ._id];
        if (saved) {
            setFormData({
                importance: saved.importance || 0,
                feasibility: saved.feasibility,
                relevance: saved.relevance,
                comment: saved.comment || '',
            });
        } else {
            setFormData({ importance: 0, feasibility: null, relevance: null, comment: '' });
        }
    }, [questionIndex, questions, responses]);

    const currentQuestion = questions[questionIndex - 1];
    const totalQuestions = questions.length;
    const progressPercent = totalQuestions > 0 ? ((questionIndex) / totalQuestions) * 100 : 0;

    const handleSave = useCallback(async (navigateTo) => {
        if (!currentQuestion || !participantId) return;
        setSaving(true);
        try {
            const res = await fetch('/api/survey/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participantId,
                    questionId: currentQuestion._id,
                    ...formData,
                }),
            });

            if (res.ok) {
                // Update local responses
                setResponses((prev) => ({
                    ...prev,
                    [currentQuestion._id]: { ...formData, questionId: currentQuestion._id },
                }));

                if (navigateTo === 'next') {
                    if (questionIndex >= totalQuestions) {
                        alert('🎉 Congratulations! You have completed the survey. Thank you!');
                        router.push('/');
                    } else {
                        router.push(`/survey/${questionIndex + 1}`);
                    }
                } else if (navigateTo === 'prev') {
                    if (questionIndex > 1) {
                        router.push(`/survey/${questionIndex - 1}`);
                    }
                } else if (navigateTo === 'exit') {
                    router.push('/');
                } else if (typeof navigateTo === 'number') {
                    router.push(`/survey/${navigateTo}`);
                }
            }
        } catch (err) {
            alert('Error saving. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [currentQuestion, participantId, formData, questionIndex, totalQuestions, router]);

    const isQuestionAnswered = (qId) => {
        return responses[qId] !== undefined;
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading survey...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
                <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
                    <h3 style={{ margin: '0 0 0.5rem' }}>No Questions Found</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>The survey has no questions yet. Please contact the researcher.</p>
                    <button onClick={() => router.push('/')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
            {/* Top Navigation Bar */}
            <div style={{
                position: 'sticky',
                top: 0,
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0.75rem 1rem',
                zIndex: 50,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: 600, margin: '0 auto' }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                            color: 'var(--color-text-secondary)', display: 'flex',
                        }}
                    >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                                Question {questionIndex} of {totalQuestions}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {Math.round(progressPercent)}%
                            </span>
                        </div>
                        <div className="progress-container">
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowMap(!showMap)}
                        style={{
                            background: showMap ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                            border: '1px solid ' + (showMap ? 'var(--color-primary)' : 'var(--color-border)'),
                            borderRadius: '8px',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: showMap ? '#fff' : 'var(--color-text-secondary)',
                            display: 'flex',
                            transition: 'all 0.15s',
                        }}
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Question Map Drawer */}
            {showMap && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '280px',
                    maxWidth: '85vw',
                    background: '#fff',
                    borderLeft: '1px solid var(--color-border)',
                    boxShadow: '-8px 0 30px rgba(0,0,0,0.08)',
                    zIndex: 100,
                    padding: '1.25rem',
                    overflowY: 'auto',
                    animation: 'slideFromRight 0.2s ease',
                }}>
                    <style>{`@keyframes slideFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>Question Map</h4>
                        <button onClick={() => setShowMap(false)} className="modal-close">×</button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.688rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-success)' }} /> Completed
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-primary)' }} /> Current
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, border: '1px solid var(--color-border)' }} /> Pending
                        </span>
                    </div>
                    <div className="question-grid">
                        {questions.map((q, i) => (
                            <button
                                key={q._id}
                                className={`question-grid-btn ${isQuestionAnswered(q._id) ? 'completed' : ''} ${i + 1 === questionIndex ? 'active' : ''}`}
                                onClick={() => {
                                    setShowMap(false);
                                    handleSave(i + 1);
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {showMap && (
                <div
                    onClick={() => setShowMap(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 99,
                    }}
                />
            )}

            {/* Main Content */}
            <div style={{ flex: 1, padding: '1.25rem 1rem', maxWidth: 600, margin: '0 auto', width: '100%' }}>
                {/* Context Card (Read-Only) */}
                <div className="card animate-slide-up" style={{
                    marginBottom: '1rem',
                    background: 'var(--color-surface-alt)',
                    borderLeft: '3px solid var(--color-accent)',
                }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Question Context
                    </h4>
                    <div style={{ display: 'grid', gap: '0.625rem' }}>
                        {[
                            { label: 'Facility Category', value: currentQuestion.facilityCategory },
                            { label: 'Dataset Name', value: currentQuestion.datasetName },
                            { label: 'Data Elements', value: currentQuestion.dataElements },
                            { label: 'Suggested Disaggregates', value: currentQuestion.suggestedDisaggregates },
                        ].map((item, i) => (
                            <div key={i}>
                                <span style={{ fontSize: '0.688rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {item.label}
                                </span>
                                <p style={{ margin: '0.125rem 0 0', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.5 }}>
                                    {item.value || '—'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Importance Rating */}
                <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.05s' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.625rem' }}>
                        1. Importance <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.813rem' }}>(Rate 1 to 5)</span>
                    </label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                className={`star-btn ${formData.importance >= num ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, importance: num })}
                                type="button"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.688rem', color: 'var(--color-text-muted)' }}>
                        <span>Not Important</span>
                        <span>Very Important</span>
                    </div>
                </div>

                {/* Feasibility */}
                <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.1s' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.625rem' }}>
                        2. Feasibility of Data Generation
                    </label>
                    <div className="radio-group">
                        <label
                            className={`radio-card ${formData.feasibility === true ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, feasibility: true })}
                        >
                            <input type="radio" name="feasibility" checked={formData.feasibility === true} readOnly />
                            Yes
                        </label>
                        <label
                            className={`radio-card ${formData.feasibility === false ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, feasibility: false })}
                        >
                            <input type="radio" name="feasibility" checked={formData.feasibility === false} readOnly />
                            No
                        </label>
                    </div>
                </div>

                {/* Relevance */}
                <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.15s' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.625rem' }}>
                        3. Practical Relevance for Decision-Making
                    </label>
                    <div className="radio-group">
                        <label
                            className={`radio-card ${formData.relevance === true ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, relevance: true })}
                        >
                            <input type="radio" name="relevance" checked={formData.relevance === true} readOnly />
                            Yes
                        </label>
                        <label
                            className={`radio-card ${formData.relevance === false ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, relevance: false })}
                        >
                            <input type="radio" name="relevance" checked={formData.relevance === false} readOnly />
                            No
                        </label>
                    </div>
                </div>

                {/* Comments */}
                <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.2s' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.625rem' }}>
                        4. Comments <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: '0.813rem' }}>(Optional)</span>
                    </label>
                    <textarea
                        className="form-textarea"
                        placeholder="Add any additional comments or feedback..."
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        rows={3}
                    />
                </div>
            </div>

            {/* Footer Navigation */}
            <div style={{
                position: 'sticky',
                bottom: 0,
                background: 'rgba(255,255,255,0.97)',
                backdropFilter: 'blur(8px)',
                borderTop: '1px solid var(--color-border)',
                padding: '0.75rem 1rem',
                zIndex: 50,
            }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => handleSave('prev')}
                            disabled={questionIndex <= 1 || saving}
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => handleSave('next')}
                            disabled={saving}
                            className="btn btn-primary"
                            style={{ flex: 2 }}
                        >
                            {saving ? 'Saving...' : questionIndex >= totalQuestions ? 'Complete Survey ✓' : 'Next Question →'}
                        </button>
                    </div>
                    <button
                        onClick={() => handleSave('exit')}
                        disabled={saving}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.5rem',
                            marginTop: '0.375rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.813rem',
                            textDecoration: 'underline',
                        }}
                    >
                        Save & Exit
                    </button>
                </div>
            </div>
        </div>
    );
}
