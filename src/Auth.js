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

export default function Auth({ onLogin, onBack }) {
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
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
    color: 'white', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
    marginBottom: '14px'
  };

  const btnPrimary = {
    width: '100%', background: '#FF6B35', color: 'white', border: 'none',
    padding: '14px', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
    marginBottom: '12px'
  };

  const btnSecondary = {
    width: '100%', background: 'rgba(255,255,255,0.08)', color: 'white',
    border: '1px solid rgba(255,255,255,0.2)', padding: '14px', borderRadius: '30px',
    fontSize: '15px', cursor: 'pointer', marginBottom: '12px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '10px'
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: 'white', fontFamily: 'Arial, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px', marginBottom: '16px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.background='rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}>
              ← Back to Home
            </button>
          )}
          <h1 style={{ color: '#FF6B35', fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>⚡ PathForge</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
            {mode === 'login' ? 'Welcome back!' : mode === 'signup' ? 'Create your account' : 'Login with Phone'}
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px', padding: '32px'
        }}>

          {/* Mode tabs */}
          {mode !== 'phone' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {['login', 'signup'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                  flex: 1, padding: '10px', borderRadius: '20px', border: 'none',
                  background: mode === m ? '#FF6B35' : 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer'
                }}>
                  {m === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>
          )}

          {/* Email/Password Form */}
          {mode !== 'phone' && (
            <>
              {mode === 'signup' && (
                <input style={inputStyle} type="text" placeholder="Your Name"
                  value={name} onChange={e => setName(e.target.value)} />
              )}
              <input style={inputStyle} type="email" placeholder="Email address"
                value={email} onChange={e => setEmail(e.target.value)} />
              <input style={inputStyle} type="password" placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)} />

              {error && <div style={{ color: '#FF6B6B', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}

              <button style={btnPrimary} onClick={handleEmailAuth} disabled={loading}>
                {loading ? '...' : mode === 'login' ? 'Login →' : 'Create Account →'}
              </button>

              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '12px' }}>or</div>

              <button style={btnSecondary} onClick={handleGoogle} disabled={loading}>
                <span style={{ fontSize: '18px' }}>G</span> Continue with Google
              </button>

              {PHONE_OTP_ENABLED ? (
                <button style={btnSecondary} onClick={() => { setMode('phone'); setError(''); }} disabled={loading}>
                  📱 Login with Phone OTP
                </button>
              ) : (
                <div style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px dashed rgba(255,255,255,0.2)',
                  padding: '14px',
                  borderRadius: '30px',
                  fontSize: '14px',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}>
                  📱 Phone OTP (Coming Soon)
                </div>
              )}
            </>
          )}

          {/* Phone OTP Form */}
          {mode === 'phone' && (
            <>
              {!otpSent ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ ...inputStyle, width: '70px', marginBottom: 0, textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>+91</div>
                      <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} type="tel"
                        placeholder="10-digit phone number" value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                    </div>
                  </div>
                  <div id="recaptcha-container" style={{ marginBottom: '12px' }} />
                  {error && <div style={{ color: '#FF6B6B', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}
                  <button style={{ ...btnPrimary, marginTop: '8px' }} onClick={handleSendOTP} disabled={loading || phone.length !== 10}>
                    {loading ? 'Sending...' : 'Send OTP →'}
                  </button>
                </>
              ) : (
                <>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
                    OTP sent to +91 {phone}
                  </p>
                  <input style={inputStyle} type="text" placeholder="Enter 6-digit OTP"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6} />
                  {error && <div style={{ color: '#FF6B6B', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>}
                  <button style={btnPrimary} onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify OTP →'}
                  </button>
                  <button onClick={() => { setOtpSent(false); setOtp(''); }} style={{ ...btnSecondary, marginTop: '4px' }}>
                    ← Change Number
                  </button>
                </>
              )}
              <button onClick={() => { setMode('login'); setError(''); setOtpSent(false); }} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: '13px', cursor: 'pointer', width: '100%', marginTop: '8px'
              }}>← Back to Email Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
