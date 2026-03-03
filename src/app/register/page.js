'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DESIGNATIONS = [
    'UHFPO',
    'RMO',
    'Medical Officer',
    'Health Manager',
    'Field-level Supervisor',
    'Other',
];

const AREAS_OF_WORK = ['Facility', 'Field', 'District', 'Upazila'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        phone: '',
        fullName: '',
        designation: '',
        designationOther: '',
        age: '',
        gender: '',
        areaOfWork: '',
        organization: '',
        email: '',
        yearsExperience: '',
    });

    useEffect(() => {
        // Pre-fill phone from localStorage if saved from landing page
        const savedPhone = localStorage.getItem('participantPhone');
        if (savedPhone) {
            setForm((prev) => ({ ...prev, phone: savedPhone }));
        }
    }, []);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.phone || !form.fullName) return;
        setLoading(true);

        try {
            const payload = {
                phone: form.phone.trim(),
                fullName: form.fullName.trim(),
                designation: form.designation === 'Other' ? form.designationOther : form.designation,
                age: form.age ? parseInt(form.age) : undefined,
                gender: form.gender,
                areaOfWork: form.areaOfWork,
                organization: form.organization.trim(),
                email: form.email.trim(),
                yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
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
            {/* Header */}
            <div style={{
                background: 'var(--color-primary-dark)',
                color: '#fff',
                padding: '1.25rem 1.5rem',
                textAlign: 'center',
            }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step 1 of 2</p>
                <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.125rem', fontWeight: 600 }}>Participant Registration</h2>
            </div>

            <div className="container-narrow" style={{ paddingTop: '1.5rem', paddingBottom: '6rem' }}>
                <form onSubmit={handleSubmit}>
                    {/* Phone Number (crucial) */}
                    <div className="card animate-slide-up" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--color-accent)' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label form-label-required">Contact Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                placeholder="e.g. 01XXXXXXXXX"
                                value={form.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                required
                            />
                            <p className="form-hint">This number will be used to save and resume your progress</p>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.05s' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.813rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Personal Information</h4>

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
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Age"
                                    min="18"
                                    max="100"
                                    value={form.age}
                                    onChange={(e) => updateField('age', e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Gender</label>
                                <select className="form-select" value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
                                    <option value="">Select</option>
                                    {GENDERS.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.1s' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '0.813rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Professional Information</h4>

                        <div className="form-group">
                            <label className="form-label">Designation</label>
                            <select className="form-select" value={form.designation} onChange={(e) => updateField('designation', e.target.value)}>
                                <option value="">Select designation</option>
                                {DESIGNATIONS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        {form.designation === 'Other' && (
                            <div className="form-group">
                                <label className="form-label">Specify Designation</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your designation"
                                    value={form.designationOther}
                                    onChange={(e) => updateField('designationOther', e.target.value)}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Area of Work</label>
                            <select className="form-select" value={form.areaOfWork} onChange={(e) => updateField('areaOfWork', e.target.value)}>
                                <option value="">Select area</option>
                                {AREAS_OF_WORK.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Organization Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter organization name"
                                value={form.organization}
                                onChange={(e) => updateField('organization', e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Email address"
                                    value={form.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Years of Experience</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Years"
                                    min="0"
                                    value={form.yearsExperience}
                                    onChange={(e) => updateField('yearsExperience', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Sticky Bottom Button */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                borderTop: '1px solid var(--color-border)',
                padding: '0.875rem 1rem',
                zIndex: 50,
            }}>
                <div className="container-narrow">
                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary btn-block btn-lg"
                        disabled={loading || !form.phone || !form.fullName}
                    >
                        {loading ? 'Creating Profile...' : 'Start Survey →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
