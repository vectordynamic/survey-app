'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [consent, setConsent] = useState(null); // null | 'agree' | 'disagree'
  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [thankYouPopup, setThankYouPopup] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const savedPhone = localStorage.getItem('participantPhone');
      if (savedPhone) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: savedPhone }),
          });
          const data = await res.json();
          if (data.exists) {
            if (data.participant.isComplete) {
              // clear if already completed so they don't get stuck
              localStorage.removeItem('participantPhone');
            } else {
              const nextQ = data.participant.lastAnsweredQuestionIndex + 1;
              router.push(`/survey/${nextQ}`);
              return; // Keep loading state true while routing
            }
          }
        } catch (err) {
          console.error('Session auto-resume failed', err);
        }
      }
      setIsCheckingSession(false);
    };
    checkExistingSession();
  }, [router]);

  const handleConsent = (value) => {
    setConsent(value);
    if (value === 'agree') {
      setThankYouPopup(true);
    }
  };

  const handleProceed = () => {
    setThankYouPopup(false);
    setShowLogin(true);
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();

      if (data.exists) {
        // Save participant info in localStorage
        localStorage.setItem('participantId', data.participant._id);
        localStorage.setItem('participantPhone', phone.trim());
        localStorage.setItem('participantName', data.participant.fullName);

        if (data.participant.isComplete) {
          alert('You have already completed the survey. Thank you!');
        } else {
          const nextQ = data.participant.lastAnsweredQuestionIndex + 1;
          router.push(`/survey/${nextQ}`);
        }
      } else {
        // New user - go to registration
        localStorage.setItem('participantPhone', phone.trim());
        router.push('/register');
      }
    } catch (err) {
      alert('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="admin-spinner" style={{ margin: '0 auto 1rem', width: 40, height: 40, borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Resuming your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      {/* Hero Section */}
      <div className="landing-hero">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.12)',
            padding: '0.375rem 1rem',
            borderRadius: '99px',
            fontSize: '0.75rem',
            fontWeight: 500,
            marginBottom: '1.25rem',
            letterSpacing: '0.03em',
          }}>
            📋 PhD Research Study
          </div>
          <h1>DHIS2 Data Utilization Model Research Survey</h1>
          <p>Primary Health Care Data Utilization Survey — Collecting structured feedback from health professionals in Bangladesh</p>
        </div>
      </div>

      <div className="container-narrow" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        {/* Researcher Profile */}
        <div className="card animate-slide-up" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              NR
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
                Dr. Md. Nazmul Hassan Refat
              </h3>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Assistant Professor & Head, Dept. of Public Health Informatics<br />
                National Institute of Preventive and Social Medicine (NIPSOM)
              </p>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Doctoral Student</strong>, Department of Public Health & Informatics<br />
              Jahangirnagar University, Savar, Dhaka.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Contact Information:</strong><br />
              Cell Phone: 01711305535<br />
              Email: <a href="mailto:nazmulhassanrefat@gmail.com" style={{ color: 'var(--color-primary)' }}>nazmulhassanrefat@gmail.com</a>, <a href="mailto:asst.prof1.phha@nipsom.gov.bd" style={{ color: 'var(--color-primary)' }}>asst.prof1.phha@nipsom.gov.bd</a>
            </p>
          </div>
        </div>

        {/* PDF Document Links */}
        <div className="card animate-slide-up" style={{ marginBottom: '1rem', animationDelay: '0.1s' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Research Documents
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Research Context & Background', icon: '📄' },
              { label: 'Participant Information Sheet', icon: '📋' },
              { label: 'Consent Form & Guidelines', icon: '📝' },
            ].map((doc, i) => (
              <a
                key={i}
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                  fontSize: '0.875rem',
                  transition: 'all 0.15s',
                  background: '#fff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.background = 'rgba(58,124,165,0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{doc.icon}</span>
                <span style={{ fontWeight: 450 }}>{doc.label}</span>
                <svg style={{ marginLeft: 'auto', width: 16, height: 16, color: 'var(--color-text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Consent Section */}
        {!showLogin && (
          <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Consent to Participate
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 1rem' }}>
              By agreeing, you consent to participate in this research study. Your responses will be used solely
              for academic research purposes and will remain confidential.
            </p>
            <div className="radio-group" style={{ marginBottom: '1rem' }}>
              <label
                className={`radio-card ${consent === 'agree' ? 'active' : ''}`}
                onClick={() => handleConsent('agree')}
              >
                <input type="radio" name="consent" checked={consent === 'agree'} readOnly />
                I Agree
              </label>
              <label
                className={`radio-card ${consent === 'disagree' ? 'active' : ''}`}
                onClick={() => handleConsent('disagree')}
              >
                <input type="radio" name="consent" checked={consent === 'disagree'} readOnly />
                I Disagree
              </label>
            </div>

            {consent === 'disagree' && (
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--color-surface-alt)',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
              }}>
                Thank you for visiting. We appreciate your time.
              </div>
            )}
          </div>
        )}

        {/* Phone Login Section */}
        {showLogin && (
          <div className="card animate-slide-up">
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Enter Your Phone Number
            </h4>
            <p style={{ fontSize: '0.813rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
              Use your phone number to start the survey or resume where you left off.
            </p>
            <form onSubmit={handlePhoneLogin}>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Thank You Popup */}
      {thankYouPopup && (
        <div className="modal-overlay" onClick={() => { }}>
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(74,140,111,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.75rem',
            }}>
              🎉
            </div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Thank You!</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              Thank you for consenting to participate in this PhD research. Your professional expertise
              will contribute significantly to this study.
            </p>
            <button onClick={handleProceed} className="btn btn-primary btn-block btn-lg">
              Proceed to Survey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
