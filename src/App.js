import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import Auth from './Auth';
import Quiz from './Quiz';
import OnboardingQuiz from './onboarding/OnboardingQuiz';
import GeoCompany from './GeoCompany';
import SkillMap from './SkillMap';
import EmployabilityScore from './EmployabilityScore';
import AILearningPath from './AILearningPath';
import ATSResume from './ATSResume';
import BiasMentoring from './BiasMentoring';
import CommunityFeed from './CommunityFeed';
import RewardHub from './RewardHub';
import IndustryDashboard from './IndustryDashboard';
import Certifications from './Certifications';
import AIInterview from './AIInterview';
import CustomCursor from './components/CustomCursor';
import ParticleBackground from './components/ParticleBackground';
import { performIndustryAudit } from './gemini';
import ProjectAuditor from './ProjectAuditor';
import './App.css';

const getProfileStorageKey = (uid) => `pathforge_user_profile_${uid}`;

const VALID_APP_PAGES = new Set([
  'home', 'dashboard', 'onboarding', 'quiz', 'geo', 'skillmap', 'score', 'learning',
  'mentoring', 'resume', 'community', 'profile', 'rewards', 'interview', 'industry', 'certifications', 'audit'
]);

const theme = {
  dark: {
    pageBg: 'var(--bg-base)',
    cardBg: 'var(--glass-bg)',
    inputBg: 'rgba(255, 255, 255, 0.6)',
    border: 'var(--glass-border)',
    textPrimary: 'var(--text-heading)',
    textMuted: 'var(--text-body)',
    accent: 'var(--brand-teal)',
    accentHover: 'var(--brand-yellow)',
    accentLight: 'rgba(0, 212, 170, 0.2)',
    success: '#057642',
    warning: 'var(--brand-yellow)',
    error: 'var(--brand-coral)',
  },
  light: {
    pageBg: 'var(--bg-base)',
    cardBg: 'var(--glass-bg)',
    inputBg: 'rgba(255, 255, 255, 0.6)',
    border: 'var(--glass-border)',
    textPrimary: 'var(--text-heading)',
    textMuted: 'var(--text-body)',
    accent: 'var(--brand-teal)',
    accentHover: 'var(--brand-yellow)',
    accentLight: 'rgba(0, 212, 170, 0.2)',
    success: '#057642',
    warning: 'var(--brand-yellow)',
    error: 'var(--brand-coral)',
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState(() => {
    const saved = window.history.state?.page;
    return saved || 'home';
  });
  const [isAuthMode, setIsAuthMode] = useState(false); // Toggle for landing vs login/signup
  const [userData, setUserData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('PATHFORGE_THEME');
    return saved ? saved === 'dark' : true;
  });
  const hasProfile = Boolean(userData?.skill);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('PATHFORGE_THEME', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setUserData(null);
        setAuthLoading(false);
        return;
      }

      try {
        const savedProfile = localStorage.getItem(getProfileStorageKey(u.uid));
        const localProfile = savedProfile ? JSON.parse(savedProfile) : null;
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        const remoteProfile = snap.exists() ? snap.data() : null;
        const merged = { ...remoteProfile, ...localProfile };

        if (Object.keys(merged).length > 0) {
          setUserData(merged);
        } else {
          setUserData(null);
        }
      } catch (e) {
        setUserData(null);
      } finally {
        setAuthLoading(false);
        setDataLoaded(true);
      }
    });
    return unsub;
  }, []);

  // Fix stale or invalid history state (prevents blank routes after deploys or old bookmarks)
  useEffect(() => {
    if (authLoading || !user) return;
    const p = window.history.state?.page;
    if (p && !VALID_APP_PAGES.has(p)) {
      const fallback = userData?.skill ? 'dashboard' : 'home';
      window.history.replaceState({ page: fallback }, '', window.location.pathname);
      setPage(fallback);
    }
  }, [authLoading, user, userData?.skill]);

  // Browser back/forward support
  useEffect(() => {
    const handlePopState = (e) => {
      const targetPage = e.state?.page || 'home';
      setPage(targetPage);
    };
    window.addEventListener('popstate', handlePopState);
    // Set initial state if none
    if (!window.history.state?.page) {
      window.history.replaceState({ page: 'home' }, '', window.location.pathname);
    }

    // Protection: If profile exists, skip onboarding    // Cross-browser history handling
    return () => window.removeEventListener('popstate', handlePopState);
  }, [page, hasProfile, dataLoaded, user]);

  const handleLogin = (firebaseUser, firestoreData) => {
    setUser(firebaseUser);
    setUserData(prev => ({ ...prev, ...firestoreData }));
  };

  const persistUserData = async (mergedData) => {
    setUserData(mergedData);
    if (user?.uid) {
      localStorage.setItem(getProfileStorageKey(user.uid), JSON.stringify(mergedData));
      await setDoc(doc(db, 'users', user.uid), mergedData, { merge: true });
    }
  };

  const handleProgressUpdate = async (partialProgress) => {
    const merged = { ...userData, ...partialProgress };
    await persistUserData(merged);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setPage('home');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '30px', position: 'relative', overflow: 'hidden' }}>
        <ParticleBackground />
        <CustomCursor />
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
          <div className="pf-float" style={{ fontSize: '64px', filter: 'drop-shadow(0 10px 20px rgba(245,166,35,0.3))' }}>⚡</div>
          <div className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>PathForge</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700' }}>Initializing your future</div>
          <div style={{ width: '200px', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--brand-yellow), var(--brand-coral), var(--brand-teal))', borderRadius: '10px', animation: 'shimmerText 2s linear infinite', backgroundSize: '200% auto' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isAuthMode) return <><CustomCursor /><ParticleBackground /><div className="pf-page-enter"><Auth onLogin={handleLogin} onBack={() => setIsAuthMode(false)} /></div></>;
    return <LandingPage onAuth={() => setIsAuthMode(true)} />;
  }

  const navigateTo = (targetPage) => {
    window.history.pushState({ page: targetPage }, '', window.location.pathname);
    setPage(targetPage);
  };
  const goBack = () => {
    // For dashboard features, go back to dashboard instead of browser history
    const dashboardPages = ['geo', 'skillmap', 'score', 'learning', 'mentoring', 'resume', 'community', 'profile', 'rewards', 'interview', 'industry', 'certifications', 'audit'];
    if (dashboardPages.includes(page)) {
      navigateTo('dashboard');
    } else {
      window.history.back();
    }
  };
  const displayName = user.displayName || userData?.name || user.email?.split('@')[0] || 'User';


  const SubPageWrapper = ({ children }) => (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <CustomCursor />
      <ParticleBackground />
      <div className="pf-page-enter" style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );

  if (page === 'onboarding') return <SubPageWrapper><OnboardingQuiz onBack={goBack} onComplete={async (data) => { const merged = { ...userData, ...data }; await persistUserData(merged); setPage('dashboard'); }} /></SubPageWrapper>;
  if (page === 'quiz') return <SubPageWrapper><Quiz onComplete={async (data) => { const merged = { ...userData, ...data }; await persistUserData(merged); setPage('dashboard'); }} /></SubPageWrapper>;
  if (page === 'geo') return <SubPageWrapper><GeoCompany userData={userData} onBack={goBack} onNext={() => navigateTo('skillmap')} onProgressUpdate={handleProgressUpdate} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'skillmap') return <SubPageWrapper><SkillMap userData={userData} onBack={goBack} onNext={() => navigateTo('score')} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'score') return <SubPageWrapper><EmployabilityScore userData={userData} onBack={goBack} onNext={() => navigateTo('learning')} onProgressUpdate={handleProgressUpdate} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'learning') return <SubPageWrapper><AILearningPath userData={userData} onBack={goBack} onNext={() => navigateTo('score')} onProgressUpdate={handleProgressUpdate} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'mentoring') return <SubPageWrapper><BiasMentoring userData={userData} onBack={goBack} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'resume') return <SubPageWrapper><ATSResume userData={{ ...userData, email: user.email, phone: user.phoneNumber }} onBack={goBack} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'community') return <SubPageWrapper><CommunityFeed user={user} userData={userData} onBack={goBack} onGoToProfile={() => navigateTo('profile')} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'profile') return <SubPageWrapper><ProfilePage user={user} userData={userData} onBack={goBack} persistUserData={persistUserData} handleLogout={handleLogout} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'rewards') return <SubPageWrapper><RewardHub userData={userData} onBack={goBack} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'interview') return <SubPageWrapper><AIInterview userData={userData} onBack={goBack} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'industry') return <SubPageWrapper><IndustryDashboard onBack={goBack} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'certifications') return <SubPageWrapper><Certifications userData={userData} onBack={goBack} onProgressUpdate={handleProgressUpdate} theme={darkMode ? theme.dark : theme.light} /></SubPageWrapper>;
  if (page === 'audit') {
    return (
      <SubPageWrapper>
        <ProjectAuditor 
          onBack={goBack} 
          theme={darkMode ? theme.dark : theme.light}
          onComplete={async (results) => {
            const skipIdx = (results.skipToWeek || 1) - 1;
            const currentModules = userData?.learningProgress?.modules || {};
            const nextModules = { ...currentModules };
            
            // Mark skipped weeks as "Mastered"
            for (let i = 0; i < skipIdx; i++) {
              nextModules[i] = { 
                completed: true, 
                courseDone: true, 
                testPassed: true, 
                testScore: 100 
              };
            }

            const updated = { 
              ...userData, 
              remediationWeeks: results.remediationWeeks, 
              projectAuditScore: results.score,
              learningProgress: {
                ...userData?.learningProgress,
                modules: nextModules,
                completedCount: Object.values(nextModules).filter(m => m.completed).length,
                percent: Math.max(userData?.learningProgress?.percent || 0, results.score)
              },
              auditReport: {
                ...userData?.auditReport,
                readinessLevel: results.depth,
                readinessPercent: results.score
              }
            };
            navigateTo('learning');
            await persistUserData(updated);
          }} 
        />
      </SubPageWrapper>
    );
  }

  if (page === 'dashboard') {
    const auditScore = userData?.projectAuditScore || 0;
    const moduleProgress = userData?.learningProgress?.modules || {};
    const ldone = Object.values(moduleProgress).filter(m => m.completed).length;
    const ltotal = userData?.learningProgress?.total || 6;
    
    // Prioritize the Strict Audit Score for the Employability Index
    const lpct = auditScore > 0 ? auditScore : Math.round((ldone / ltotal) * 100);

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-main)', display: 'flex', overflow: 'hidden' }}>
        <CustomCursor />
        <ParticleBackground />

        {/* Sidebar */}
        <aside className="pf-glass" style={{ width: '280px', margin: '20px', padding: '35px 20px', display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative', zIndex: 10, borderRadius: '30px' }}>
          <div style={{ paddingLeft: '15px' }}>
            <h1 className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>⚡ PathForge</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'dashboard', label: 'Overview', icon: '📊' },
              { id: 'learning', label: 'AI Roadmap', icon: '🚀' },
              { id: 'interview', label: 'Mock Interview', icon: '🎥' },
              { id: 'audit', label: 'Project Audit', icon: '🛡️' },
              { id: 'geo', label: 'Company Search', icon: '📍' },
              { id: 'resume', label: 'ATS Resume', icon: '📄' },
              { id: 'community', label: 'Community', icon: '🌐' },
              { id: 'skillmap', label: 'Skill DNA', icon: '🧬' },
              { id: 'certifications', label: 'Certifications', icon: '🎓' },
              { id: 'rewards', label: 'Reward Hub', icon: '🏆' },
              { id: 'profile', label: 'Settings', icon: '⚙️' },
            ].map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderRadius: '18px', border: 'none', background: page === item.id ? 'var(--brand-yellow)' : 'transparent', color: page === item.id ? 'white' : 'var(--text-body)', cursor: 'pointer', fontSize: '14px', fontWeight: '700', transition: 'all 0.3s var(--transition-smooth)', textAlign: 'left', width: '100%' }}
                onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <span style={{ fontSize: '18px', opacity: page === item.id ? 1 : 0.8 }}>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: '10px' }}>
            <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '15px', border: '1px solid var(--brand-coral)', background: 'transparent', color: 'var(--brand-coral)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-coral)'; e.currentTarget.style.color = 'white'; }}>
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main tabIndex={0} style={{ flex: 1, padding: '40px 60px', position: 'relative', zIndex: 1, overflowY: 'auto', outline: 'none' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px', color: 'var(--text-heading)' }}>Candidate Dashboard</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '8px', fontWeight: '500' }}>Welcome back, {displayName}. Your career pulse is active.</p>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button onClick={() => navigateTo('home')} className="pf-glass" style={{ color: 'var(--text-body)', padding: '12px 28px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', borderRadius: '20px' }}>Exit to Landing</button>
              <div 
                onClick={() => navigateTo('profile')}
                style={{ width: '54px', height: '54px', borderRadius: '18px', background: 'var(--brand-coral)', border: '2px solid white', overflow: 'hidden', boxShadow: '0 10px 25px rgba(255,107,107,0.2)', cursor: 'pointer', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
              >
                {userData?.profilePhoto ? <img src={userData.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>}
              </div>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            {/* Employability Score Widget */}
            <div 
              onClick={() => navigateTo('learning')}
              className="pf-glass"
              style={{ padding: '35px', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Employability Index</span>
                <span style={{ fontSize: '28px', background: 'rgba(0, 212, 170, 0.1)', padding: '10px', borderRadius: '15px' }}>📈</span>
              </div>
              <div className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', marginBottom: '10px' }}>{lpct}%</div>
              <div style={{ fontSize: '14px', color: 'var(--brand-teal)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-teal)' }}></span>
                {ldone}/{ltotal} modules verified
              </div>
            </div>

            {/* AI Auditor Widget */}
            <div className="pf-glass" style={{ padding: '35px', position: 'relative', background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,107,107,0.05)) !important' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--brand-coral)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>AI Industry Audit</div>
              <div style={{ fontSize: '22px', fontWeight: '900', marginBottom: '12px', color: 'var(--text-heading)', lineHeight: '1.3' }}>Industry Readiness <br/>Status</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>Scan your progress against live market trends.</p>
              <button 
                onClick={() => navigateTo('audit')}
                className="pf-glow-btn"
                style={{ width: '100%', padding: '14px', fontSize: '14px' }}
              >
                Start AI Audit ⚡
              </button>
            </div>

            {/* Maturity Widget */}
            <div className="pf-glass" style={{ padding: '35px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Skill Maturity</span>
                <span style={{ fontSize: '28px', background: 'rgba(245, 166, 35, 0.1)', padding: '10px', borderRadius: '15px' }}>🧬</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-heading)', marginBottom: '10px' }}>{userData?.auditReport?.readinessLevel || 'Assessment Pending'}</div>
              <div style={{ fontSize: '14px', color: 'var(--brand-yellow)', fontWeight: '700' }}>AI-Verified Talent Profile</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
            {/* Pipeline Section */}
            <div className="pf-glass" style={{ padding: '35px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900', margin: 0, color: 'var(--text-heading)' }}>Career Pipeline</h3>
                <button 
                  onClick={async () => {
                    setAuditLoading(true);
                    const result = await performIndustryAudit(userData);
                    setAuditLoading(false);
                    if (result) setAuditResult(result);
                  }}
                  className="pf-glow-btn"
                  style={{ padding: '10px 22px', fontSize: '13px' }}>
                  {auditLoading ? 'Auditing...' : 'Run New Audit ⚡'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '🧬', name: 'Skill DNA Assessment', status: userData?.learningProgress?.percent > 0 ? 'Verified' : 'Pending', color: userData?.learningProgress?.percent > 0 ? '#057642' : 'var(--brand-teal)', action: () => navigateTo('skillmap') },
                  { icon: '🚀', name: 'Learning Path Execution', status: lpct > 50 ? 'Advanced' : 'In Progress', color: 'var(--brand-yellow)', action: () => navigateTo('learning') },
                  { icon: '🎥', name: 'AI Mock Interview', status: 'Available', color: 'var(--brand-coral)', action: () => navigateTo('interview') },
                  { icon: '🎯', name: 'Industry Mentoring', status: 'Active', color: '#9B59B6', action: () => navigateTo('mentoring') },
                ].map((row, i) => (
                  <div key={i} onClick={row.action} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '24px', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(10px)'; e.currentTarget.style.borderColor = 'var(--brand-teal)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <span style={{ fontSize: '26px', background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>{row.icon}</span>
                      <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-heading)' }}>{row.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: row.color, fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>● {row.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="pf-glass" style={{ padding: '35px', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-yellow)) !important', color: 'white !important' }}>
                <h4 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '16px', color: 'white' }}>AI Career Coach</h4>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', marginBottom: '28px' }}>
                  "Based on your current progress, you are outperforming 85% of candidates in the {userData?.skill?.title || 'domain'}. Focus on Video Introduction to seal the deal."
                </p>
                <button onClick={() => navigateTo('interview')} style={{ width: '100%', padding: '18px', fontWeight: '900', cursor: 'pointer', background: 'white', color: 'var(--text-heading)', border: 'none', borderRadius: '20px', fontSize: '15px', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  Start Video Intro
                </button>
              </div>

              <div className="pf-glass" style={{ padding: '30px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '16px', color: 'var(--text-heading)' }}>Network Activity</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,0,0,0.05)' }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '60%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', marginBottom: '4px' }}></div>
                        <div style={{ width: '40%', height: '6px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI AUDIT MODAL (DASHBOARD) */}
          {auditResult && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(253,252,248,0.4)', backdropFilter: 'blur(30px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div className="pf-glass" style={{ padding: '50px', maxWidth: '680px', width: '100%', textAlign: 'center', border: '1px solid var(--brand-teal) !important', animation: 'cardEntrance 0.5s var(--transition-bounce)' }}>
                <div style={{ fontSize: '70px', marginBottom: '24px' }}>🤖</div>
                <h3 className="pf-shimmer-text" style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-1px' }}>AI Industry Verdict</h3>
                <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-heading)', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '3px' }}>{auditResult.verdict}</div>
                
                <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '30px', padding: '35px', marginBottom: '40px', textAlign: 'left', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                  <p style={{ fontSize: '16px', color: 'var(--text-body)', lineHeight: '1.8', margin: 0, fontWeight: '500' }}>{auditResult.analysis}</p>
                  
                  <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>Hiring Likelihood</span>
                      <span style={{ fontSize: '26px', fontWeight: '900', color: '#057642' }}>{auditResult.hiringLikelihood}%</span>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>Actionable Gap</span>
                      <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--brand-teal)' }}>{auditResult.criticalMissingSkill}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setAuditResult(null)} className="pf-glow-btn" style={{ padding: '18px 60px', fontSize: '16px' }}>
                  Acknowledge Verdict
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-main)', position: 'relative', overflowX: 'hidden' }}>
      <CustomCursor />
      <ParticleBackground />
      
      {/* Glassmorphism sticky nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'var(--glass-blur)', background: 'rgba(255, 255, 255, 0.7)', borderBottom: '1px solid var(--glass-border)', animation: 'navSlideDown 0.8s var(--transition-smooth) both' }}>
        <h1 className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: '900', letterSpacing: '-1.5px', margin: 0 }}>⚡ PathForge</h1>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-heading)', textDecoration: 'none', fontSize: '15px', fontWeight: '700', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--brand-yellow)'} onMouseLeave={e => e.target.style.color = 'var(--text-heading)'}>Features</a>
          <a href="#howitworks" style={{ color: 'var(--text-heading)', textDecoration: 'none', fontSize: '15px', fontWeight: '700', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--brand-yellow)'} onMouseLeave={e => e.target.style.color = 'var(--text-heading)'}>How it Works</a>
          <button onClick={() => navigateTo('dashboard')} className="pf-glow-btn" style={{ padding: '10px 24px', fontSize: '14px' }}>📋 Dashboard</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigateTo('profile')} className="pf-glass" style={{ padding: '8px 20px', fontSize: '14px', color: 'var(--text-heading)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--glass-border) !important', background: 'rgba(255,255,255,0.5) !important' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', overflow: 'hidden', border: '2px solid white' }}>
              {userData?.profilePhoto ? <img src={userData.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
            </div>
            <span style={{ fontWeight: '800' }}>{displayName}</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '110px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div className="pf-page-enter" style={{ display: 'inline-block', padding: '10px 26px', marginBottom: '35px', fontSize: '14px', color: 'var(--brand-teal)', fontWeight: '800', background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.3)', borderRadius: '30px', animation: 'badgePop 0.8s var(--transition-bounce) both' }}>
          🚀 Smart Mentoring System for Skill Mapping & Employability
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 7vw, 76px)', fontWeight: '900', lineHeight: '1', marginBottom: '28px', animation: 'heroTextReveal 0.9s var(--transition-smooth) both 0.2s', letterSpacing: '-2px', color: 'var(--text-heading)' }}>
          Welcome back,<br />
          <span className="pf-shimmer-text">{displayName}!</span>
        </h1>
        <p style={{ fontSize: '20px', color: 'var(--text-body)', maxWidth: '650px', margin: '0 auto 48px', lineHeight: '1.7', animation: 'heroTextReveal 0.9s var(--transition-smooth) both 0.4s', fontWeight: '500' }}>
          {userData?.skill ? `Continue your ${userData.skill.title} transformation where you left off.` : 'Begin your career transformation with our AI-powered skill assessment.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'heroTextReveal 0.9s var(--transition-smooth) both 0.5s' }}>
          <button onClick={() => {
            if (!userData?.skill) {
              navigateTo('onboarding');
            } else {
              navigateTo('dashboard');
            }
          }} className="pf-glow-btn" style={{ padding: '22px 55px', fontSize: '19px' }}>
            {userData?.skill ? '📋 Open Dashboard' : '🚀 Start Your Journey →'}
          </button>
        </div>
      </div>

      {/* Stats section */}
      <div className="pf-glass" style={{ display: 'flex', justifyContent: 'center', gap: '80px', padding: '60px 20px', flexWrap: 'wrap', position: 'relative', zIndex: 1, borderRadius: '0 !important', borderLeft: 'none !important', borderRight: 'none !important', background: 'rgba(255,255,255,0.4) !important' }}>
        {[
          { num: 'AI-DRIVEN', label: 'Skills Assessment', desc: 'Deep technical stack evaluation' },
          { num: 'PERSONALIZED', label: 'Learning Paths', desc: 'Custom roadmaps for your goals' },
          { num: 'EXPERT-LED', label: 'Industry Mentorship', desc: 'Guidance from working professionals' },
          { num: 'HIRING-READY', label: 'Career Deployment', desc: 'Verified profiles for hiring partners' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', animation: `cardEntrance 0.8s var(--transition-smooth) both ${0.1 * i}s` }}>
            <div className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '900', letterSpacing: '-1px' }}>{s.num}</div>
            <div style={{ color: 'var(--text-heading)', marginTop: '10px', fontSize: '15px', fontWeight: '800' }}>{s.label}</div>
            <div style={{ color: 'var(--text-body)', marginTop: '6px', fontSize: '13px', maxWidth: '160px', margin: '6px auto 0', fontWeight: '500' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* How it Works section */}
      <div id="howitworks" style={{ padding: '120px 40px 80px', textAlign: 'center', position: 'relative', zIndex: 1, background: 'var(--bg-alt)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,52px)', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1.5px', color: 'var(--text-heading)' }}>
          Your <span className="pf-shimmer-text">Career Roadmap</span>
        </h2>
        <p style={{ color: 'var(--text-body)', fontSize: '17px', marginBottom: '70px', maxWidth: '650px', margin: '0 auto 70px', fontWeight: '500' }}>Follow these key steps to maximize your employability and secure your dream role.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'Skills Assessment', desc: 'Comprehensive analysis of your current technical abilities and identifies key areas for improvement.', icon: '🎯' },
            { step: '02', title: 'Learning Path', desc: 'A structured, step-by-step guide to mastering the skills needed for your target role.', icon: '🚀' },
            { step: '03', title: 'Expert Mentorship', desc: 'Direct access to industry professionals for career guidance and technical feedback.', icon: '🧬' },
            { step: '04', title: 'Job Placement', desc: 'Direct connection with hiring managers at companies looking for pre-vetted talent.', icon: '💼' }
          ].map((s, i) => (
            <div key={i} className="pf-glass" style={{ padding: '50px 35px', textAlign: 'left', position: 'relative', animation: `cardEntrance 0.7s var(--transition-smooth) both ${i * 0.1}s` }}>
              <div style={{ position: 'absolute', top: '15px', right: '25px', fontSize: '100px', fontWeight: '900', color: 'rgba(245,166,35,0.06)', fontFamily: 'var(--font-display)', lineHeight: '1', zIndex: 0 }}>{s.step}</div>
              <div style={{ fontSize: '38px', marginBottom: '24px', position: 'relative', zIndex: 1, background: 'rgba(245,166,35,0.1)', display: 'inline-flex', padding: '14px', borderRadius: '18px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', marginBottom: '14px', color: 'var(--text-heading)', position: 'relative', zIndex: 1 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '15px', lineHeight: '1.7', position: 'relative', zIndex: 1, fontWeight: '500' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" style={{ padding: '120px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,52px)', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1.5px', color: 'var(--text-heading)' }}>
          Everything you need to <span className="pf-shimmer-text">get hired</span>
        </h2>
        <p style={{ color: 'var(--text-body)', fontSize: '17px', marginBottom: '60px', fontWeight: '500' }}>Click any card to explore the feature</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: '🧬', title: 'Skills Assessment', desc: 'Identify your technical strengths and critical skill gaps through a comprehensive evaluation mapped to current industry standards.', action: () => navigateTo('skillmap'), color: 'rgba(155,89,182,0.1)' },
            { icon: '📍', title: 'Company Search', desc: 'Discover local and remote career opportunities from our network of partner companies hiring for your specific expertise.', action: () => navigateTo('geo'), color: 'rgba(5,118,66,0.1)' },
            { icon: '🤖', title: 'Personalized Roadmap', desc: 'Follow a structured, week-by-week curriculum tailored to your career goals, featuring curated projects and certification milestones.', action: () => navigateTo('learning'), color: 'rgba(52,152,219,0.1)' },
            { icon: '🎯', title: 'Industry Mentoring', desc: 'Connect with experienced professionals for direct feedback, mock interviews, and career guidance tailored to your growth areas.', action: () => navigateTo('mentoring'), color: 'rgba(204,16,22,0.1)' },
            { icon: '📊', title: 'Job Readiness Score', desc: 'Track your employability in real-time with a dynamic score that updates as you complete modules, projects, and assessments.', action: () => navigateTo('score'), color: 'rgba(245,197,24,0.1)' },
            { icon: '📄', title: 'Resume Builder', desc: 'Generate a high-impact, ATS-optimized resume that automatically highlights your verified skills and platform-validated projects.', action: () => navigateTo('resume'), color: 'rgba(26,188,156,0.1)' },
            { icon: '🌐', title: 'Community Feed', desc: 'Collaborate with a network of driven learners, share daily milestones, and gain inspiration from peer-led technical projects.', action: () => navigateTo('community'), color: 'rgba(10,102,194,0.1)' },
          ].map((f, i) => (
            <div key={i} onClick={f.action} tabIndex={0} role="button" className="pf-glass"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') f.action(); }}
              style={{ padding: '40px', textAlign: 'left', cursor: 'pointer', animation: `cardEntrance 0.7s var(--transition-smooth) both ${i * 0.08}s`, outline: 'none' }}
            >
              <div style={{ fontSize: '40px', marginBottom: '24px', display: 'inline-flex', padding: '16px', borderRadius: '20px', background: f.color }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', marginBottom: '14px', color: 'var(--text-heading)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-body)', lineHeight: '1.7', fontSize: '15px', fontWeight: '500' }}>{f.desc}</p>
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-yellow)', fontSize: '14px', fontWeight: '900' }}>Open Feature <span style={{ fontSize: '18px' }}>→</span></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '80px 40px', marginTop: '100px', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.3)', position: 'relative', zIndex: 1, borderRadius: '40px 40px 0 0' }}>
          <div className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '900', marginBottom: '12px' }}>⚡ PathForge</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: '600', letterSpacing: '0.3px' }}>Built by Team Neural Nexus · NIET Greater Noida · Innovate-X-NIET 1.0</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            {['🧬', '📍', '🤖', '🎯', '📊', '📄', '🌐'].map((e, i) => (
              <span key={i} style={{ fontSize: '20px', opacity: 0.6, transition: 'all 0.3s' }}
                onMouseEnter={ev => { ev.target.style.opacity = '1'; ev.target.style.transform = 'translateY(-6px) scale(1.4)'; }}
                onMouseLeave={ev => { ev.target.style.opacity = '0.6'; ev.target.style.transform = 'translateY(0) scale(1)'; }}
              >{e}</span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ─── Image Cropper Modal Component ─── */
function ImageCropperModal({ imageSrc, cropShape, aspectRatio, onCropDone, onCancel }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropSize = 200;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      // Center the image
      const containerW = 360;
      const containerH = 360;
      const imgScale = Math.max(cropSize / img.width, cropSize / img.height) * 1.2;
      setScale(imgScale);
      setPosition({
        x: (containerW - img.width * imgScale) / 2,
        y: (containerH - img.height * imgScale) / 2,
      });
    };
    img.src = imageSrc;
  }, [imageSrc, cropSize]);

  useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = 360, h = 360;
    canvas.width = w;
    canvas.height = h;

    // Draw the image
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(imgRef.current, position.x, position.y, imgRef.current.width * scale, imgRef.current.height * scale);

    // Draw overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    // Cut out crop area
    const cropX = (w - cropSize * aspectRatio) / 2;
    const cropY = (h - cropSize) / 2;
    const cropW = cropSize * aspectRatio;
    const cropH = cropSize;

    ctx.save();
    ctx.beginPath();
    if (cropShape === 'circle') {
      ctx.arc(w / 2, h / 2, cropSize / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(cropX, cropY, cropW, cropH);
    }
    ctx.clip();
    ctx.drawImage(imgRef.current, position.x, position.y, imgRef.current.width * scale, imgRef.current.height * scale);
    ctx.restore();

    // Draw crop border
    ctx.strokeStyle = '#0A66C2';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    if (cropShape === 'circle') {
      ctx.arc(w / 2, h / 2, cropSize / 2, 0, Math.PI * 2);
    } else {
      ctx.rect(cropX, cropY, cropW, cropH);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Grid lines inside crop area
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);
    if (cropShape !== 'circle') {
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cropX + (cropW / 3) * i, cropY);
        ctx.lineTo(cropX + (cropW / 3) * i, cropY + cropH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cropX, cropY + (cropH / 3) * i);
        ctx.lineTo(cropX + cropW, cropY + (cropH / 3) * i);
        ctx.stroke();
      }
    }
  }, [imgLoaded, scale, position, cropSize, aspectRatio, cropShape]);

  const handleMouseDown = (e) => {
    setDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left - position.x, y: e.clientY - rect.top - position.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({ x: touch.clientX - rect.left - position.x, y: touch.clientY - rect.top - position.y });
  };

  const handleTouchMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    setPosition({
      x: touch.clientX - rect.left - dragStart.x,
      y: touch.clientY - rect.top - dragStart.y,
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const handleCrop = () => {
    if (!imgRef.current) return;
    const outputCanvas = document.createElement('canvas');
    const w = 360, h = 360;
    const cropX = (w - cropSize * aspectRatio) / 2;
    const cropY = (h - cropSize) / 2;
    const cropW = cropSize * aspectRatio;
    const cropH = cropSize;
    const outputSize = cropShape === 'circle' ? 400 : (aspectRatio > 1 ? 800 : 400);
    const outW = cropShape === 'circle' ? outputSize : outputSize * aspectRatio;
    const outH = outputSize;
    outputCanvas.width = outW;
    outputCanvas.height = outH;
    const ctx = outputCanvas.getContext('2d');

    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(outW / 2, outH / 2, outW / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const scaleRatioX = outW / cropW;
    const scaleRatioY = outH / cropH;
    ctx.drawImage(
      imgRef.current,
      (position.x - cropX) * scaleRatioX,
      (position.y - cropY) * scaleRatioY,
      imgRef.current.width * scale * scaleRatioX,
      imgRef.current.height * scale * scaleRatioY
    );

    const result = outputCanvas.toDataURL('image/jpeg', 0.75);
    onCropDone(result);
  };

  const modalOverlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)', zIndex: 10000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)',
  };

  const modalBox = {
    background: 'linear-gradient(135deg, #1a1a3e, #2a2a5e)',
    borderRadius: '20px', padding: '24px', width: '420px', maxWidth: '95vw',
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  };

  return (
    <div style={modalOverlay} onClick={onCancel}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#0A66C2', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>✂️ Crop Image</h3>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>

        <div
          ref={containerRef}
          style={{
            width: '360px', height: '360px', margin: '0 auto', borderRadius: '12px',
            overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab', position: 'relative',
            background: '#111', maxWidth: '100%',
          }}
        >
          <canvas
            ref={canvasRef}
            width={360} height={360}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>

        {/* Zoom slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0', padding: '0 10px' }}>
          <span style={{ fontSize: '18px' }}>🔍</span>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            style={{
              flex: 1, height: '6px', borderRadius: '3px',
              accentColor: '#0A66C2', cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', minWidth: '40px' }}>{Math.round(scale * 100)}%</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', margin: '0 0 16px' }}>
          Drag to reposition · Scroll or slide to zoom
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
          }}>Cancel</button>
          <button onClick={handleCrop} style={{
            flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #0A66C2, #FF9A6C)', color: 'white', cursor: 'pointer',
            fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255,107,53,0.4)',
          }}>✂️ Crop & Save</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Page Component ─── */
function ProfilePage({ user, userData, onBack, persistUserData, handleLogout }) {
  const displayName = user.displayName || userData?.name || user.email?.split('@')[0] || 'User';
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [themePref, setThemePref] = useState('dark');
  const [primaryColor, setPrimaryColor] = useState('var(--brand-yellow)');
  const [fontSize, setFontSize] = useState('medium');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const updateTheme = (newTheme) => {
    setThemePref(newTheme);
    localStorage.setItem('pathforge_theme', newTheme);
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem('pathforge_primary_color', color);
  };

  const updateFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('pathforge_font_size', size);
  };

  const toggleAnimations = () => {
    const newValue = !animationsEnabled;
    setAnimationsEnabled(newValue);
    localStorage.setItem('pathforge_animations_enabled', newValue.toString());
  };
  const [form, setForm] = useState({
    name: userData?.name || displayName,
    college: userData?.college || '',
    city: userData?.city || '',
    bio: userData?.bio || '',
  });
  const [profilePhoto, setProfilePhoto] = useState(userData?.profilePhoto || null);
  const [coverPhoto, setCoverPhoto] = useState(userData?.coverPhoto || null);
  const [saving, setSaving] = useState(false);

  // Cropper state
  const [cropperImage, setCropperImage] = useState(null);
  const [cropperTarget, setCropperTarget] = useState(null); // 'profile' or 'cover'


  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperImage(reader.result);
      setCropperTarget('profile');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperImage(reader.result);
      setCropperTarget('cover');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropDone = async (croppedDataUrl) => {
    if (cropperTarget === 'profile') {
      setProfilePhoto(croppedDataUrl);
      await persistUserData({ ...userData, profilePhoto: croppedDataUrl });
    } else {
      setCoverPhoto(croppedDataUrl);
      await persistUserData({ ...userData, coverPhoto: croppedDataUrl });
    }
    setCropperImage(null);
    setCropperTarget(null);
  };

  const handleCropCancel = () => {
    setCropperImage(null);
    setCropperTarget(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await persistUserData({
        ...userData,
        name: form.name,
        college: form.college,
        city: form.city,
        bio: form.bio,
        profilePhoto: profilePhoto,
        coverPhoto: coverPhoto,
      });
      setEditMode(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.08)',
    background: 'rgba(255,255,255,0.7)',
    color: 'var(--text-heading)',
    fontSize: '15px',
    fontWeight: '500',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  };

  const labelStyle = { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-main)', padding: '40px 20px' }}>

      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropperModal
          imageSrc={cropperImage}
          cropShape={cropperTarget === 'profile' ? 'circle' : 'rect'}
          aspectRatio={cropperTarget === 'profile' ? 1 : 1.6}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}

      <div style={{ maxWidth: '650px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={onBack} className="pf-glass" style={{ padding: '10px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', borderRadius: '20px' }}>← Back</button>
            <h1 className="pf-shimmer-text" style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>My Profile</h1>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid var(--brand-coral)', background: 'transparent', color: 'var(--brand-coral)', fontWeight: '700', cursor: 'pointer' }}>Sign Out</button>
        </div>

        {/* Profile Card */}
        <div className="pf-glass" style={{ overflow: 'hidden', border: '1px solid var(--glass-border) !important', background: 'rgba(255,255,255,0.4) !important' }}>

          {/* Cover Photo */}
          <div
            onClick={() => coverInputRef.current?.click()}
            style={{
              height: '160px',
              background: coverPhoto ? `url(${coverPhoto}) center/cover no-repeat` : 'linear-gradient(135deg, var(--brand-yellow), var(--brand-coral), var(--brand-teal))',
              position: 'relative', cursor: 'pointer',
              transition: 'opacity 0.3s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <div style={{
              position: 'absolute', bottom: '15px', right: '15px',
              background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '6px 16px',
              fontSize: '12px', color: 'var(--text-heading)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>📷 {coverPhoto ? 'Change Cover' : 'Add Cover'}</div>
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />

          {/* Avatar & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-60px', padding: '0 30px 40px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '120px', height: '120px', borderRadius: '50%',
                border: '6px solid var(--bg-base)',
                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : 'rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              {!profilePhoto && <span style={{ fontSize: '48px', color: 'var(--text-muted)' }}>👤</span>}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '6px', textAlign: 'center',
                fontSize: '11px', color: 'white', fontWeight: '800', textTransform: 'uppercase'
              }}>Edit</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />

            <h2 style={{ marginTop: '20px', fontSize: '28px', fontWeight: '900', color: 'var(--text-heading)', letterSpacing: '-0.5px' }}>{form.name}</h2>
            {form.bio && <p style={{ color: 'var(--text-body)', fontSize: '16px', marginTop: '8px', textAlign: 'center', maxWidth: '450px', lineHeight: '1.6', fontWeight: '500' }}>{form.bio}</p>}

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {form.city && (
                <span className="pf-glass" style={{ fontSize: '13px', fontWeight: '700', padding: '6px 16px', borderRadius: '15px' }}>📍 {form.city}</span>
              )}
              {form.college && (
                <span className="pf-glass" style={{ fontSize: '13px', fontWeight: '700', padding: '6px 16px', borderRadius: '15px' }}>🎓 {form.college}</span>
              )}
            </div>

            {userData?.skill && (
              <div className="pf-glow-btn" style={{ marginTop: '24px', padding: '10px 24px', fontSize: '14px', textTransform: 'none' }}>
                {userData.skill.icon} Mastered: {userData.skill.title}
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Section */}
        <div className="pf-glass" style={{ marginTop: '24px', padding: '35px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>Profile Details</h3>
            {!editMode && (
              <button onClick={() => setEditMode(true)} className="pf-glass" style={{ padding: '8px 20px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', color: 'var(--brand-teal)', border: '1px solid var(--brand-teal) !important' }}>✏️ Edit Profile</button>
            )}
          </div>

          {editMode ? (
            <div className="pf-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              </div>
              <div>
                <label style={labelStyle}>College / University</label>
                <input style={inputStyle} value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="e.g. NIET Greater Noida" />
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Delhi, India" />
              </div>
              <div>
                <label style={labelStyle}>Bio / Headline</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Aspiring Frontend Developer..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button onClick={handleSave} disabled={saving} className="pf-glow-btn" style={{ flex: 1, padding: '16px' }}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button onClick={() => setEditMode(false)} className="pf-glass" style={{ padding: '16px 30px', fontWeight: '800' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[{ label: 'Name', value: form.name }, { label: 'College', value: form.college || '—' }, { label: 'City', value: form.city || '—' }, { label: 'Bio', value: form.bio || '—' }, { label: 'Email', value: user.email || '—' }].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '700' }}>{row.label}</span>
                  <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-heading)', textAlign: 'right', maxWidth: '70%' }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Settings */}
        <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>🎨 Theme Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Theme Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>🌙 Dark Mode</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Switch between light and dark themes</div>
              </div>
              <button
                onClick={() => updateTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
                  background: theme === 'dark' ? '#0A66C2' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'left 0.3s',
                  left: theme === 'dark' ? '24px' : '4px',
                }} />
              </button>
            </div>

            {/* Primary Color */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>🎨 Primary Color</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Customize app accent color</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['#0A66C2', '#3498DB', '#057642', '#9B59B6', '#CC1016', '#F5C518'].map(color => (
                  <button
                    key={color}
                    onClick={() => updatePrimaryColor(color)}
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%', border: primaryColor === color ? '2px solid white' : '2px solid transparent',
                      background: color, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>📝 Font Size</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Adjust text size for better readability</div>
              </div>
              <select
                value={fontSize}
                onChange={(e) => updateFontSize(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="small" style={{ background: '#2c3e50' }}>Small</option>
                <option value="medium" style={{ background: '#2c3e50' }}>Medium</option>
                <option value="large" style={{ background: '#2c3e50' }}>Large</option>
              </select>
            </div>

            {/* Animations Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>✨ Animations</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Enable/disable UI animations</div>
              </div>
              <button
                onClick={toggleAnimations}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
                  background: animationsEnabled ? '#057642' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'left 0.3s',
                  left: animationsEnabled ? '24px' : '4px',
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Settings / Actions */}
        <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>⚙️ General Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Toggle: Email Notifications */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>🔔 Email Notifications</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Get notified about weekly progress</div>
              </div>
              <button
                onClick={async () => {
                  const val = !(userData?.settings?.emailNotif);
                  await persistUserData({ ...userData, settings: { ...userData?.settings, emailNotif: val } });
                }}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
                  background: userData?.settings?.emailNotif ? '#057642' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'left 0.3s',
                  left: userData?.settings?.emailNotif ? '24px' : '4px',
                }} />
              </button>
            </div>

            {/* Toggle: Daily Reminders */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>⏰ Daily Study Reminders</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Reminder to continue your learning path</div>
              </div>
              <button
                onClick={async () => {
                  const val = !(userData?.settings?.dailyReminder);
                  await persistUserData({ ...userData, settings: { ...userData?.settings, dailyReminder: val } });
                }}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
                  background: userData?.settings?.dailyReminder ? '#057642' : 'rgba(255,255,255,0.15)',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: 'left 0.3s',
                  left: userData?.settings?.dailyReminder ? '24px' : '4px',
                }} />
              </button>
            </div>

            {/* Export Profile Data */}
            <button
              onClick={() => {
                const exportData = { name: form.name, email: user.email, college: form.college, city: form.city, bio: form.bio, skill: userData?.skill, learningProgress: userData?.learningProgress, exportedAt: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pathforge_profile_${form.name.replace(/\s+/g, '_')}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', background: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.3)', borderRadius: '12px', cursor: 'pointer', color: '#3498DB', fontWeight: 'bold', fontSize: '14px', textAlign: 'left' }}
            >
              <span>📥 Export My Data</span>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(52,152,219,0.7)' }}>Download JSON</span>
            </button>

            {/* Reset Learning Progress */}
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to reset all learning progress? This cannot be undone.')) {
                  const cleared = { ...userData };
                  delete cleared.learningProgress;
                  await persistUserData(cleared);
                  alert('Learning progress has been reset.');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '12px', cursor: 'pointer', color: '#FFA500', fontWeight: 'bold', fontSize: '14px', textAlign: 'left' }}
            >
              <span>🔄 Reset Learning Progress</span>
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'rgba(255,165,0,0.6)' }}>Start fresh</span>
            </button>

            {/* Remove Profile Photo */}
            {profilePhoto && (
              <button
                onClick={async () => {
                  if (window.confirm('Remove your profile photo?')) {
                    setProfilePhoto(null);
                    await persistUserData({ ...userData, profilePhoto: null });
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', fontSize: '14px', textAlign: 'left' }}
              >
                <span>🗑️ Remove Profile Photo</span>
              </button>
            )}

            {/* Remove Cover Photo */}
            {coverPhoto && (
              <button
                onClick={async () => {
                  if (window.confirm('Remove your cover photo?')) {
                    setCoverPhoto(null);
                    await persistUserData({ ...userData, coverPhoto: null });
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', fontSize: '14px', textAlign: 'left' }}
              >
                <span>🖼️ Remove Cover Photo</span>
              </button>
            )}

            {/* Sign Out */}
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: 'rgba(255,75,75,0.1)', color: '#FF4B4B', border: '1px solid rgba(255,75,75,0.3)', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
              🚪 Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}



/* ─── Landing Page Component ─── */
function LandingPage({ onAuth }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-main)', position: 'relative', overflow: 'hidden' }}>
      <CustomCursor />
      <ParticleBackground />

      {/* Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'var(--glass-blur)', background: 'rgba(255, 255, 255, 0.7)', borderBottom: '1px solid var(--glass-border)', animation: 'navSlideDown 0.8s var(--transition-smooth) both' }}>
        <h1 className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: '900', letterSpacing: '-1.5px', margin: 0 }}>⚡ PathForge</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={onAuth} style={{ background: 'transparent', color: 'var(--text-heading)', border: '1px solid var(--text-muted)', padding: '12px 30px', borderRadius: '30px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-yellow)'; e.currentTarget.style.color = 'var(--brand-yellow)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-heading)'; }}>
            Login
          </button>
          <button onClick={onAuth} className="pf-glow-btn" style={{ padding: '12px 30px', fontSize: '15px' }}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '120px 20px 100px', position: 'relative', zIndex: 1 }}>
        <div className="pf-page-enter" style={{ display: 'inline-block', background: 'rgba(245, 166, 35, 0.1)', border: '1px solid rgba(245, 166, 35, 0.3)', borderRadius: '30px', padding: '10px 28px', marginBottom: '40px', fontSize: '14px', color: 'var(--brand-yellow)', fontWeight: '800', animation: 'badgePop 0.8s var(--transition-bounce) both', textTransform: 'uppercase', letterSpacing: '1px' }}>
          🚀 The Future of AI-Powered Career Growth
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 9vw, 92px)', fontWeight: '900', lineHeight: '1', marginBottom: '32px', animation: 'heroTextReveal 0.9s var(--transition-smooth) both 0.2s', letterSpacing: '-3px', color: 'var(--text-heading)' }}>
          Forge Your Path to<br />
          <span className="pf-shimmer-text">Career Excellence.</span>
        </h1>
        <p style={{ fontSize: '22px', color: 'var(--text-body)', maxWidth: '750px', margin: '0 auto 56px', lineHeight: '1.7', animation: 'heroTextReveal 0.9s var(--transition-smooth) both 0.4s', fontWeight: '500' }}>
          PathForge combines advanced AI mentoring, real-time skill mapping, and direct corporate connections to transform your professional journey.
        </p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', animation: 'heroTextReveal 0.9s var(--transition-smooth) both 0.6s' }}>
          <button onClick={onAuth} className="pf-glow-btn" style={{ padding: '24px 60px', fontSize: '20px' }}>
            Get Started Now →
          </button>
          <a href="#about" className="pf-glass" style={{ padding: '22px 50px', fontSize: '19px', fontWeight: '800', cursor: 'pointer', textDecoration: 'none', color: 'var(--text-heading)', display: 'flex', alignItems: 'center' }}>
            Learn More
          </a>
        </div>
      </div>

      {/* Stats Section */}
      <div className="pf-glass" style={{ display: 'flex', justifyContent: 'center', gap: '80px', padding: '80px 20px', borderRadius: '0 !important', borderLeft: 'none !important', borderRight: 'none !important', flexWrap: 'wrap', position: 'relative', zIndex: 1, background: 'rgba(255, 255, 255, 0.4) !important' }}>
        {[
          { num: 'AI-FIRST', label: 'Skills Assessment', desc: 'Precision gap identification' },
          { num: 'STRUCTURED', label: 'Career Roadmaps', desc: 'Weekly learning milestones' },
          { num: 'MERIT-BASED', label: 'Industry Mentorship', desc: 'Direct access to practitioners' },
          { num: 'OUTCOME-READY', label: 'Corporate Hiring', desc: 'Automated talent matching' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', animation: `cardEntrance 0.8s var(--transition-smooth) both ${0.1 * i}s` }}>
            <div className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: '900', letterSpacing: '-2px' }}>{s.num}</div>
            <div style={{ color: 'var(--text-heading)', marginTop: '12px', fontSize: '17px', fontWeight: '800' }}>{s.label}</div>
            <div style={{ color: 'var(--text-body)', marginTop: '8px', fontSize: '14px', maxWidth: '180px', margin: '8px auto 0', lineHeight: '1.5' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* How it Works Section */}
      <div id="howitworks" style={{ padding: '140px 20px 100px', textAlign: 'center', position: 'relative', zIndex: 1, background: 'var(--bg-alt)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,52px)', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1.5px', color: 'var(--text-heading)' }}>
          The <span className="pf-shimmer-text">PathForge</span> Journey
        </h2>
        <p style={{ color: 'var(--text-body)', fontSize: '18px', marginBottom: '80px', maxWidth: '700px', margin: '0 auto 80px', fontWeight: '500' }}>Our proven 4-step framework to bridge the gap between education and employment.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'DNA Mapping', desc: 'Advanced AI analysis to pinpoint your unique skill proficiencies and growth potential.', icon: '🎯' },
            { step: '02', title: 'Adaptive Roadmaps', desc: 'Dynamic learning trajectories calibrated to current market demand.', icon: '🤖' },
            { step: '03', title: 'Expert Mentorship', desc: 'Direct access to practitioners for outcome-oriented technical guidance.', icon: '🧬' },
            { step: '04', title: 'Corporate Matching', desc: 'Automated alignment with hiring partners seeking your specific talent profile.', icon: '🤝' }
          ].map((s, i) => (
            <div key={i} className="pf-glass" style={{ padding: '50px 35px', textAlign: 'left', position: 'relative', animation: `cardEntrance 0.7s var(--transition-smooth) both ${i * 0.1}s` }}>
              <div style={{ position: 'absolute', top: '20px', right: '35px', fontSize: '50px', fontWeight: '900', color: 'rgba(245, 166, 35, 0.08)', fontFamily: 'var(--font-display)' }}>{s.step}</div>
              <div style={{ fontSize: '42px', marginBottom: '24px', background: 'white', display: 'inline-flex', padding: '15px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', marginBottom: '14px', color: 'var(--text-heading)' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '15px', lineHeight: '1.7', fontWeight: '500' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div id="about" style={{ maxWidth: '1200px', margin: '140px auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
        <div style={{ animation: 'fadeSlideIn 1.2s var(--transition-smooth) both' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '900', marginBottom: '32px', letterSpacing: '-1.5px', color: 'var(--text-heading)' }}>Bridging the <br /><span className="pf-shimmer-text">Employability Gap</span></h2>
          <p style={{ color: 'var(--text-body)', fontSize: '19px', lineHeight: '1.8', marginBottom: '40px', fontWeight: '500' }}>
            Traditional education often focuses on theory, leaving graduates unprepared for the job market. PathForge helps you bridge this gap by identifying your technical strengths and connecting you directly with the right training and hiring partners.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { t: 'Skills Assessment', d: 'Identify exactly where you stand and what you need to learn next.' },
              { t: 'Industry Mentoring', d: 'Connect with experienced professionals for one-on-one guidance.' },
              { t: 'Direct Hiring', d: 'Get discovered by companies looking for your specific technical profile.' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--brand-teal)', fontSize: '24px', marginTop: '2px' }}>✅</div>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '18px', color: 'var(--text-heading)' }}>{item.t}</div>
                  <div style={{ color: 'var(--text-body)', fontSize: '15px', marginTop: '4px', fontWeight: '500' }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pf-glass" style={{ padding: '60px', position: 'relative', animation: 'fadeSlideIn 1.2s var(--transition-smooth) both 0.3s', background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(0,212,170,0.05)) !important' }}>
          <div style={{ position: 'absolute', top: '-30px', left: '-30px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(245, 166, 35, 0.2) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '12px', color: 'var(--brand-teal)', fontWeight: '900', marginBottom: '20px', letterSpacing: '3px', textTransform: 'uppercase' }}>Built for Impact</div>
            <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '24px', color: 'var(--text-heading)', letterSpacing: '-1px' }}>Revenue-Ready Ecosystem</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '17px', lineHeight: '1.8', fontWeight: '500' }}>
              Our dual-engine model partners with Fortune 500 giants to deliver high-potential, pre-vetted talent. By bridging the gap between student ambition and corporate necessity, we've built a sustainable, revenue-generating ecosystem for the future of work.
            </p>
            <button onClick={onAuth} className="pf-glow-btn" style={{ marginTop: '40px', padding: '20px 50px', fontSize: '17px' }}>
              Join the Ecosystem
            </button>
          </div>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '80px 40px', borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '15px', fontWeight: '600', position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.3)' }}>
        <div className="pf-shimmer-text" style={{ fontSize: '24px', fontWeight: '900', marginBottom: '12px' }}>⚡ PathForge</div>
        Built by Team Neural Nexus · NIET Greater Noida · Innovate-X-NIET 1.0
      </footer>
    </div>
  );
}

export default App;