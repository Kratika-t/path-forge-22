import React, { useCallback, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const defaultTheme = { 
  pageBg:'transparent', 
  cardBg:'rgba(255, 255, 255, 0.55)', 
  inputBg:'rgba(255, 255, 255, 0.7)', 
  border:'rgba(255, 255, 255, 0.8)', 
  textPrimary:'var(--text-heading)', 
  textMuted:'var(--text-body)', 
  accent:'var(--brand-teal)', 
  accentHover:'var(--brand-yellow)', 
  accentLight:'rgba(0, 212, 170, 0.1)', 
  success:'var(--brand-teal)', 
  warning:'var(--brand-yellow)', 
  error:'var(--brand-coral)' 
};

export default function Auth({ onLogin, onBack, theme = defaultTheme }) {
  const PHONE_OTP_ENABLED = false;
  const [mode, setMode] = useState('login'); // login | signup | phone
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getFriendlyError = useCallback((code) => {
    const errors = {
      'auth/email-already-in-use': 'This email is already registered. Try logging in.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/invalid-phone-number': 'Please enter a valid phone number.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console.',
      'auth/unauthorized-domain': 'Please add localhost:3000 to Firebase Console → Authentication → Sign-in method → Google → Authorized domains',
      'auth/popup-closed-by-user': 'Google sign-in popup was closed before login completed.',
      'auth/account-exists-with-different-credential': 'This email is already linked with another sign-in method.',
      'auth/invalid-app-credential': 'Phone auth app verification failed. Please refresh and try again.',
      'auth/captcha-check-failed': 'reCAPTCHA verification failed. Refresh and try again.',
      'auth/missing-phone-number': 'Please enter a phone number first.',
      'auth/quota-exceeded': 'OTP quota exceeded. Try again later or use a Firebase test number.',
      'auth/billing-not-enabled': 'Phone authentication requires billing enabled for this Firebase project.',
    };
    return errors[code] || 'Something went wrong. Please try again.';
  }, []);

  const setAuthError = useCallback((err, fallback = 'Something went wrong. Please try again.') => {
    const friendly = getFriendlyError(err?.code);
    const codeSuffix = err?.code ? ` (${err.code})` : '';
    setError(`${friendly}${friendly === fallback ? codeSuffix : ''}`);
    if (err) {
      console.error('Auth error:', err);
    }
  }, [getFriendlyError]);

  const saveUserToFirestore = useCallback(async (user, extraData = {}) => {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        name: user.displayName || name || 'User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        createdAt: new Date(),
        ...extraData
      });
    }
    const userData = snap.exists() ? snap.data() : { name: user.displayName || name };
    onLogin(user, userData);
  }, [name, onLogin]);

  useEffect(() => {
    const resolveGoogleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await saveUserToFirestore(result.user);
        }
      } catch (err) {
        setAuthError(err);
      }
    };

    resolveGoogleRedirect();
  }, [saveUserToFirestore, setAuthError]);

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await saveUserToFirestore(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(cred.user);
      }
    } catch (err) {
      setAuthError(err);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(cred.user);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          setAuthError(redirectErr);
        }
      } else {
        setAuthError(err);
      }
    }
    setLoading(false);
  };

  const buildRecaptchaVerifier = () => {
    try {
      return new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      });
    } catch (e) {
      return new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      }, auth);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = buildRecaptchaVerifier();
      } else {
        await window.recaptchaVerifier.render();
      }
      const phoneNum = phone.startsWith('+') ? phone : '+91' + phone;
      const result = await signInWithPhoneNumber(auth, phoneNum, window.recaptchaVerifier);
      setConfirmResult(result);
      setOtpSent(true);
    } catch (err) {
      setAuthError(err);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      if (!confirmResult) {
        setError('Please request OTP first, then verify.');
        setLoading(false);
        return;
      }
      const cred = await confirmResult.confirm(otp);
      await saveUserToFirestore(cred.user);
    } catch (err) {
      setAuthError(err, 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '16px 20px', borderRadius: '15px',
    border: '2px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.7)',
    color: 'var(--text-heading)', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
    marginBottom: '16px', fontWeight: '600', fontFamily: 'var(--font-main)'
  };

  const btnPrimary = {
    width: '100%', border: 'none',
    padding: '16px', borderRadius: '30px', fontSize: '16px', fontWeight: '900',
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
    marginBottom: '15px', textTransform:'uppercase', letterSpacing:'1px'
  };

  const btnSecondary = {
    width: '100%', border: 'none', padding: '16px', borderRadius: '30px',
    fontSize: '15px', cursor: 'pointer', marginBottom: '15px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '12px', fontWeight:'800',
    background: 'rgba(255,255,255,0.6)', color:'var(--text-heading)'
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'transparent',
      color: 'var(--text-body)', fontFamily: 'var(--font-main)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {onBack && (
            <button onClick={onBack} className="pf-glass" style={{ border: 'none', padding: '10px 24px', borderRadius: '25px', cursor: 'pointer', fontSize: '12px', marginBottom: '25px', fontWeight:'900', letterSpacing:'1px' }}>
              ← BACK TO HOME
            </button>
          )}
          <h1 className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', marginBottom: '10px', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>⚡ PathForge</h1>
          <p style={{ color: 'var(--text-body)', fontSize: '17px', fontWeight:'600' }}>
            {mode === 'login' ? 'Welcome back!' : mode === 'signup' ? 'Create your account' : 'Login with Phone'}
          </p>
        </div>

        <div className="pf-glass" style={{ padding: '40px', background:'rgba(255,255,255,0.7)' }}>

          {/* Mode tabs */}
          {mode !== 'phone' && (
            <div className="pf-glass" style={{ display: 'flex', gap: '8px', marginBottom: '30px', padding:'6px', border:'none', background:'rgba(255,255,255,0.4)' }}>
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                  flex: 1, padding: '12px', borderRadius: '20px', border: 'none',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? 'var(--brand-teal)' : 'var(--text-body)', 
                  fontSize: '14px', fontWeight: '900', cursor: 'pointer', transition:'all 0.3s',
                  boxShadow: mode === m ? '0 4px 15px rgba(0,0,0,0.05)' : 'none'
                }}>
                  {m === 'login' ? 'LOGIN' : 'SIGN UP'}
                </button>
              ))}
            </div>
          )}

          {/* Email/Password Form */}
          {mode !== 'phone' && (
            <>
              {mode === 'signup' && (
                <input style={inputStyle} type="text" placeholder="Your Name"
                  className="pf-glass" value={name} onChange={e => setName(e.target.value)} />
              )}
              <input style={inputStyle} type="email" placeholder="Email address"
                className="pf-glass" value={email} onChange={e => setEmail(e.target.value)} />
              <input style={inputStyle} type="password" placeholder="Password"
                className="pf-glass" value={password} onChange={e => setPassword(e.target.value)} />

              {error && <div style={{ color: 'var(--brand-coral)', fontSize: '13px', marginBottom: '15px', textAlign: 'center', fontWeight:'700' }}>{error}</div>}

              <button className={loading ? "" : "pf-glow-btn"} style={{...btnPrimary, background: loading ? 'rgba(0,0,0,0.05)' : 'var(--brand-teal)', color:'white'}} onClick={handleEmailAuth} disabled={loading}>
                {loading ? '...' : mode === 'login' ? 'LOGIN →' : 'CREATE ACCOUNT →'}
              </button>

              <div style={{ textAlign: 'center', color: 'var(--text-body)', fontSize: '13px', marginBottom: '15px', fontWeight:'800', opacity:0.4 }}>OR</div>

              <button className="pf-glass" style={btnSecondary} onClick={handleGoogle} disabled={loading}>
                <span style={{ fontSize: '20px' }}>G</span> CONTINUE WITH GOOGLE
              </button>

              {PHONE_OTP_ENABLED ? (
                <button className="pf-glass" style={btnSecondary} onClick={() => { setMode('phone'); setError(''); }} disabled={loading}>
                  📱 LOGIN WITH PHONE OTP
                </button>
              ) : (
                <div className="pf-glass" style={{
                  width: '100%',
                  color: 'var(--text-body)',
                  border: '2px dashed rgba(0,0,0,0.05) !important',
                  padding: '16px',
                  borderRadius: '30px',
                  fontSize: '14px',
                  textAlign: 'center',
                  marginBottom: '15px',
                  fontWeight:'800',
                  opacity:0.6
                }}>
                  📱 PHONE OTP (COMING SOON)
                </div>
              )}
            </>
          )}

          {/* Phone OTP Form */}
          {mode === 'phone' && (
            <>
              {!otpSent ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="pf-glass" style={{ ...inputStyle, width: '80px', marginBottom: 0, textAlign: 'center', border:'none', background:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>+91</div>
                      <input className="pf-glass" style={{ ...inputStyle, flex: 1, marginBottom: 0 }} type="tel"
                        placeholder="10-digit phone number" value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                    </div>
                  </div>
                  <div id="recaptcha-container" style={{ marginBottom: '15px' }} />
                  {error && <div style={{ color: 'var(--brand-coral)', fontSize: '13px', marginBottom: '15px', textAlign: 'center', fontWeight:'700' }}>{error}</div>}
                  <button className={loading || phone.length !== 10 ? "" : "pf-glow-btn"} style={{ ...btnPrimary, marginTop: '10px', background: loading || phone.length !== 10 ? 'rgba(0,0,0,0.05)' : 'var(--brand-teal)', color:'white' }} onClick={handleSendOTP} disabled={loading || phone.length !== 10}>
                    {loading ? 'SENDING...' : 'SEND OTP →'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ color: 'var(--text-body)', fontSize: '15px', textAlign: 'center', marginBottom: '25px', fontWeight:'600' }}>
                    OTP sent to <strong style={{color:'var(--text-heading)'}}>+91 {phone}</strong>
                  </p>
                  <input className="pf-glass" style={inputStyle} type="text" placeholder="Enter 6-digit OTP"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6} />
                  {error && <div style={{ color: 'var(--brand-coral)', fontSize: '13px', marginBottom: '15px', textAlign: 'center', fontWeight:'700' }}>{error}</div>}
                  <button className={loading || otp.length !== 6 ? "" : "pf-glow-btn"} style={{ ...btnPrimary, background: loading || otp.length !== 6 ? 'rgba(0,0,0,0.05)' : 'var(--brand-teal)', color:'white' }} onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                    {loading ? 'VERIFYING...' : 'VERIFY OTP →'}
                  </button>
                  <button className="pf-glass" onClick={() => { setOtpSent(false); setOtp(''); }} style={{ ...btnSecondary, marginTop: '5px', border:'none' }}>
                    ← CHANGE NUMBER
                  </button>
                </>
              )}
              <button onClick={() => { setMode('login'); setError(''); setOtpSent(false); }} style={{
                background: 'none', border: 'none', color: 'var(--brand-teal)',
                fontSize: '13px', cursor: 'pointer', width: '100%', marginTop: '15px', fontWeight:'900', letterSpacing:'0.5px'
              }}>← BACK TO EMAIL LOGIN</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
