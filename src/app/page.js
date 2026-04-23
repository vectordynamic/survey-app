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
  const [hasReadConsent, setHasReadConsent] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'consent') {
        setIsCheckingSession(false);
        return;
      }
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

  const performLogin = async (phoneToUse) => {
    if (!phoneToUse.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToUse.trim() }),
      });
      const data = await res.json();

      if (res.status === 403) {
        alert(data.message || 'This phone number is not authorized to participate in this study.');
        setLoading(false);
        return;
      }

      if (data.exists) {
        // Save participant info in localStorage
        localStorage.setItem('participantId', data.participant._id);
        localStorage.setItem('participantPhone', phoneToUse.trim());
        localStorage.setItem('participantName', data.participant.fullName);

        if (data.participant.isComplete) {
          alert('You have already completed the survey. Thank you!');
        } else {
          const nextQ = data.participant.lastAnsweredQuestionIndex + 1;
          router.push(`/survey/${nextQ}`);
        }
      } else {
        // New user - go to registration
        localStorage.setItem('participantPhone', phoneToUse.trim());
        if (data.whitelistedName) {
            localStorage.setItem('whitelistedName', data.whitelistedName);
        }
        router.push('/register');
      }
    } catch (err) {
      alert('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleProceed = () => {
    setThankYouPopup(false);
    const savedPhone = localStorage.getItem('participantPhone');
    if (savedPhone) {
      performLogin(savedPhone);
    } else {
      setShowLogin(true);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    performLogin(phone);
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
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            padding: '0.625rem 1.75rem',
            borderRadius: '99px',
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '2rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            📋 PhD Research Study
          </div>
          <h1>Development of a Primary Health Care Oriented Data Utilization Model for District Health Information Software 2 (DHIS2)</h1>
          <p>To Support Decision Making by Primary Level Health Managers in Bangladesh</p>
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
              <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
                Dr. Md. Nazmul Hassan Refat
              </h3>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                Assistant Professor, Department of Public Health & Hospital Administration &<br />
                Head, Department of Public Health Informatics<br />
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
              { label: 'DGHS Permission Letter', icon: '📄', file: 'Permission Letter from DG To UH&FPOS for support in PhD Research.pdf' },
              { label: 'Ministry of Health & Family Welfare (GO)', icon: '🏛️', file: 'Ministry of Health & Family Welfare GO.pdf' },
              { label: 'Ethical Clearance Certificate', icon: '📋', file: 'Certificate of Ethical Clearence_PhD Research_Dr Refat.pdf' },
            ].map((doc, i) => (
              <a
                key={i}
                href={`/${doc.file}`}
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
          <div className="card animate-slide-up" style={{ animationDelay: '0.2s', padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Consent Statement & Study Details
            </h4>
            
            <div 
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop <= clientHeight + 50) {
                  setHasReadConsent(true);
                }
              }}
              style={{ 
                height: 240, 
                overflowY: 'scroll', 
                background: 'var(--color-surface-alt)', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontSize: '0.813rem', 
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
                border: '1px solid var(--color-border)',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <h4 style={{ color: 'var(--color-text)', marginTop: 0, textAlign: 'center', fontSize: '1rem', fontWeight: 700 }}>INFORMED CONSENT FORM</h4>
              <p style={{ textAlign: 'center', fontWeight: 600, marginTop: '-0.5rem', marginBottom: '1.5rem' }}>(ONLINE SURVEY PARTICIPATION)</p>
              
              <h5 style={{ color: 'var(--color-text)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Title of the Study</h5>
              <p style={{ marginTop: 0, marginBottom: '1.25rem' }}>Development of a Primary Health Care Oriented Data Utilization Model for District Health Information Software 2 (DHIS2) to Support Decision Making by Primary Level Health Managers in Bangladesh</p>
              
              <h5 style={{ color: 'var(--color-text)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Name of the Researcher</h5>
              <p style={{ marginTop: 0, marginBottom: '1.25rem' }}>
                <strong>Dr. Md. Nazmul Hassan Refat</strong><br />
                Doctoral Student, Department of Public Health & Informatics, Jahangirnagar University<br />
                Assistant Professor, Department of Public Health & Hospital Administration &<br />
                Head, Department of Public health Informatics, NIPSOM
              </p>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Purpose of the Study</h5>
              <p>The purpose of this study is to design and develop a user-friendly, context-appropriate data utilization model within the District Health Information Software 2 (DHIS2) platform to support evidence-based decision-making by primary-level health managers in Bangladesh, particularly Upazila Health and Family Planning Officers (UH&FPOs).</p>
              <p>This study will focus exclusively on Primary Health Care (PHC)-related data elements, ensuring that the model remains relevant, practical, and aligned with the routine functions and responsibilities at the primary level. The aim is to identify, prioritize, and structure essential PHC data in a way that is accessible and easy to interpret, enabling managers to effectively use system-generated reports for planning, resource allocation, monitoring, and improving service delivery at the Upazila level.</p>
              <p style={{ marginBottom: '1.25rem' }}>This study is conducted solely for academic purposes as part of a PhD research program and has no commercial intent.</p>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Why You Have Been Invited</h5>
              <p style={{ marginBottom: '1.25rem' }}>You have been selected because of your role and experience as an Upazila Health and Family Planning Officer (UH&FPO) involved in primary health care service delivery and/or use of DHIS2 in Bangladesh.</p>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Study Procedures (Online Survey)</h5>
              <p>If you agree to participate, you will be asked to complete a structured questionnaire through a secure online survey application.</p>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                <li>The survey will be accessed via a provided web link or application interface.</li>
                <li>You will be required to log in using your mobile phone number each time you access the survey application.</li>
                <li>You may complete the survey using a computer, tablet, or smartphone.</li>
                <li>The survey will include questions related to data use, prioritization, and decision-making in DHIS2.</li>
                <li>The estimated time required to complete the survey is approximately 20–30 minutes.</li>
              </ul>
              <p>As part of the survey, for each data element, you will be requested to provide the following assessments:</p>
              <ol style={{ paddingLeft: '1.2rem', marginBottom: '1.25rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Importance Rating (4-point Likert Scale):</strong>
                  <ul style={{ listStyleType: 'none', paddingLeft: '0.5rem', marginTop: '0.25rem' }}>
                    <li>• 1 = Not important</li>
                    <li>• 2 = Slightly important</li>
                    <li>• 3 = Important</li>
                    <li>• 4 = Very important</li>
                  </ul>
                </li>
                <li><strong>Feasibility of Data Generation:</strong>
                  <ul style={{ listStyleType: 'none', paddingLeft: '0.5rem', marginTop: '0.25rem' }}>
                    <li>• Yes = The data element is feasible to generate/collect within the existing health system</li>
                    <li>• No = The data element is not feasible to generate/collect within the existing health system and requires additional support</li>
                  </ul>
                </li>
              </ol>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Voluntary Participation</h5>
              <p style={{ marginBottom: '1.25rem' }}>Your participation in this survey is entirely voluntary. You may choose not to participate or may exit the survey at any time before submission without any penalty or consequences.</p>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Risks and Discomforts</h5>
              <p style={{ marginBottom: '1.25rem' }}>This study involves minimal risk. There are no expected physical or psychological risks. You may skip any question you do not wish to answer.</p>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Benefits of Participation</h5>
              <p style={{ marginBottom: '1.25rem' }}>Although there is no direct personal benefit, your participation will contribute to improving data-driven decision-making tools for primary healthcare management in Bangladesh. The findings may support better planning, resource allocation, and service delivery at the Upazila level.</p>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Confidentiality and Data Security</h5>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1.25rem' }}>
                <li>Your responses will be collected anonymously through a secure online system.</li>
                <li>No personally identifiable information will be published or disclosed.</li>
                <li>Data will be stored securely and accessed only by the research team.</li>
                <li>All data will be analyzed in aggregated form for research purposes only.</li>
              </ul>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Right to Withdraw</h5>
              <p style={{ marginBottom: '1.25rem' }}>You have the right to stop participating at any point before submitting the survey. Once submitted, responses may not be withdrawn as they will be anonymized and integrated into the dataset.</p>

              <h5 style={{ color: 'var(--color-text)', fontSize: '0.9rem' }}>Contact Information</h5>
              <p style={{ marginBottom: '2rem' }}>
                If you have any questions or concerns regarding this study, please contact:<br /><br />
                <strong>Dr. Md. Nazmul Hassan Refat</strong><br />
                Mobile: 01711305535<br />
                Email: nazmulhassanrefat@gmail.com
              </p>

              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid var(--color-border)', 
                textAlign: 'center',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }}>
                --- END OF INFORMED CONSENT FORM ---
              </div>
            </div>

            <p style={{ 
              fontSize: '0.75rem', 
              color: hasReadConsent ? 'var(--color-primary)' : 'var(--color-text-muted)', 
              marginBottom: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {hasReadConsent ? '✅ Information reviewed' : '⬇️ Please scroll through the information box to continue'}
            </p>

            <div className="radio-group" style={{ 
              marginBottom: '1.25rem', 
              opacity: hasReadConsent ? 1 : 0.5, 
              pointerEvents: hasReadConsent ? 'auto' : 'none',
              transition: 'all 0.3s'
            }}>
              <label
                className={`radio-card ${consent === 'agree' ? 'active' : ''}`}
                onClick={() => hasReadConsent && handleConsent('agree')}
              >
                <input type="radio" name="consent" checked={consent === 'agree'} readOnly />
                I Agree and wish to participate
              </label>
              <label
                className={`radio-card ${consent === 'disagree' ? 'active' : ''}`}
                onClick={() => hasReadConsent && handleConsent('disagree')}
              >
                <input type="radio" name="consent" checked={consent === 'disagree'} readOnly />
                I Do Not Agree
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
