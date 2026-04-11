'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { upazilas } from '@/lib/upazilaData';

const GENDERS = ['Male', 'Female', 'Other'];
const EDU_OPTIONS = ['MBBS', 'MPH', 'Diploma', 'M Phil', 'FCPS', 'MD/MS', 'Others'];

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        phone: '',
        fullName: '',
        educationalQualification: '',
        age: '',
        gender: '',
        experienceYears: '',
        experienceMonths: '',
        upazila: '',
    });

    const [eduSelection, setEduSelection] = useState('');

    // Searchable Upazila state
    const [searchTerm, setSearchTerm] = useState('');
    const [showUpazilaList, setShowUpazilaList] = useState(false);
    const upazilaRef = useRef(null);

    const filteredUpazilas = upazilas.filter(u => 
        u.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort();

    useEffect(() => {
        const savedPhone = localStorage.getItem('participantPhone');
        const savedName = localStorage.getItem('whitelistedName');

        if (savedPhone || savedName) {
            setForm((prev) => ({ 
                ...prev, 
                phone: savedPhone || '',
                fullName: savedName || ''
            }));
            if (savedName) localStorage.removeItem('whitelistedName');
        }

        // Close dropdown on click outside
        const handleClickOutside = (event) => {
            if (upazilaRef.current && !upazilaRef.current.contains(event.target)) {
                setShowUpazilaList(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpazilaSelect = (name) => {
        updateField('upazila', name);
        setSearchTerm(name);
        setShowUpazilaList(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.phone || !form.fullName || !form.upazila) {
            alert('Please fill in all required fields, including Upazila.');
            return;
        }
        setLoading(true);

        try {
            const payload = {
                ...form,
                age: form.age ? parseInt(form.age) : undefined,
                experienceYears: form.experienceYears ? parseInt(form.experienceYears) : 0,
                experienceMonths: form.experienceMonths ? parseInt(form.experienceMonths) : 0,
            };

            const res = await fetch('/api/participant/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('participantId', data.participant._id);
                localStorage.setItem('participantPhone', payload.phone);
                localStorage.setItem('participantName', payload.fullName);
                router.push('/survey/1');
            } else {
                alert(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            alert('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
            <div style={{ background: 'var(--color-primary-dark)', color: '#fff', padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 1 of 2</p>
                <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.125rem', fontWeight: 600 }}>Participant Registration</h2>
            </div>

            <div className="container-narrow" style={{ paddingTop: '1.5rem', paddingBottom: '7rem' }}>
                <form onSubmit={handleSubmit}>
                    <div className="card animate-slide-up" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>📞</span>
                            <label className="form-label form-label-required" style={{ marginBottom: 0 }}>Contact Number</label>
                        </div>
                        <input
                            type="tel"
                            className="form-input"
                            placeholder="e.g. 01XXXXXXXXX"
                            value={form.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            required
                        />
                        <p className="form-hint">Used only for saving your survey progress</p>
                    </div>

                    <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.05s' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.813rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Personal Profile</h4>
                        <div className="form-group">
                            <label className="form-label form-label-required">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={form.fullName}
                                onChange={(e) => updateField('fullName', e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Age</label>
                                <input type="number" className="form-input" placeholder="Age" min="18" max="100" value={form.age} onChange={(e) => updateField('age', e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Gender</label>
                                <select className="form-select" value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
                                    <option value="">Select</option>
                                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.1s' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.813rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Professional & Academic Info</h4>
                        
                        <div className="form-group">
                            <label className="form-label form-label-required">Educational Qualification</label>
                            <select 
                                className="form-select" 
                                value={eduSelection}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEduSelection(val);
                                    if (val !== 'Others') {
                                        updateField('educationalQualification', val);
                                    } else {
                                        updateField('educationalQualification', '');
                                    }
                                }}
                                required
                            >
                                <option value="">Select Qualification</option>
                                {EDU_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            
                            {eduSelection === 'Others' && (
                                <div className="animate-slide-up" style={{ marginTop: '0.75rem' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Please specify your qualification"
                                        value={form.educationalQualification}
                                        onChange={(e) => updateField('educationalQualification', e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label form-label-required">Experience as UH&FPO(Tenure)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Years"
                                        min="0"
                                        value={form.experienceYears}
                                        onChange={(e) => updateField('experienceYears', e.target.value)}
                                        required
                                    />
                                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Years</span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Months"
                                        min="0"
                                        max="11"
                                        value={form.experienceMonths}
                                        onChange={(e) => updateField('experienceMonths', e.target.value)}
                                        required
                                    />
                                    <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Months</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={upazilaRef}>
                            <label className="form-label form-label-required">Working Upazila</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Start typing Upazila name..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowUpazilaList(true);
                                    if (!e.target.value) updateField('upazila', '');
                                }}
                                onFocus={() => setShowUpazilaList(true)}
                                required
                            />
                            {showUpazilaList && filteredUpazilas.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    background: '#fff',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '0.5rem',
                                    marginTop: '0.25rem',
                                    zIndex: 100,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    {filteredUpazilas.map((name, index) => (
                                        <div
                                            key={`${name}-${index}`}
                                            onClick={() => handleUpazilaSelect(name)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                borderBottom: '1px solid var(--color-surface)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'var(--color-surface)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            {name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid var(--color-border)', padding: '1rem', zIndex: 150 }}>
                <div className="container-narrow">
                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading || !form.phone || !form.fullName || !form.upazila}
                    >
                        {loading ? 'Creating Profile...' : 'Start Survey →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
