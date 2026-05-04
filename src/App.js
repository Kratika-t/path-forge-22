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
  'mentoring', 'resume', 'community', 'profile', 'rewards', 'interview', 'industry', 'audit', 'certifications',
]);

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
  const hasProfile = Boolean(userData?.skill);

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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', position: 'relative', overflow: 'hidden' }}>
        <ParticleBackground />
        <CustomCursor />
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '52px', animation: 'floatY 2s ease-in-out infinite' }}>⚡</div>
          <div className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800' }}>PathForge</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Loading your journey...</div>
          <div style={{ width: '160px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #FF6B35, #FF9A6C)', borderRadius: '2px', animation: 'shimmerText 1.5s linear infinite', backgroundSize: '200% auto' }} />
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
    <div style={{ position: 'relative' }}>
      <CustomCursor />
      <ParticleBackground />
      <div className="pf-page-enter" style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );

  if (page === 'onboarding') return <SubPageWrapper><OnboardingQuiz onBack={goBack} onComplete={async (data) => { const merged = { ...userData, ...data }; await persistUserData(merged); setPage('dashboard'); }} /></SubPageWrapper>;
  if (page === 'quiz') return <SubPageWrapper><Quiz onComplete={async (data) => { const merged = { ...userData, ...data }; await persistUserData(merged); setPage('dashboard'); }} /></SubPageWrapper>;
  if (page === 'geo') return <SubPageWrapper><GeoCompany userData={userData} onBack={goBack} onNext={() => navigateTo('skillmap')} onProgressUpdate={handleProgressUpdate} /></SubPageWrapper>;
  if (page === 'skillmap') return <SubPageWrapper><SkillMap userData={userData} onBack={goBack} onNext={() => navigateTo('score')} /></SubPageWrapper>;
  if (page === 'score') return <SubPageWrapper><EmployabilityScore userData={userData} onBack={goBack} onNext={() => navigateTo('learning')} onProgressUpdate={handleProgressUpdate} /></SubPageWrapper>;
  if (page === 'learning') return <SubPageWrapper><AILearningPath userData={userData} onBack={goBack} onNext={() => navigateTo('score')} onProgressUpdate={handleProgressUpdate} /></SubPageWrapper>;
  if (page === 'mentoring') return <SubPageWrapper><BiasMentoring userData={userData} onBack={goBack} /></SubPageWrapper>;
  if (page === 'resume') return <SubPageWrapper><ATSResume userData={{ ...userData, email: user.email, phone: user.phoneNumber }} onBack={goBack} /></SubPageWrapper>;
  if (page === 'community') return <SubPageWrapper><CommunityFeed user={user} userData={userData} onBack={goBack} onGoToProfile={() => navigateTo('profile')} /></SubPageWrapper>;
  if (page === 'profile') return <SubPageWrapper><ProfilePage user={user} userData={userData} onBack={goBack} persistUserData={persistUserData} handleLogout={handleLogout} /></SubPageWrapper>;
  if (page === 'rewards') return <SubPageWrapper><RewardHub userData={userData} onBack={goBack} /></SubPageWrapper>;
  if (page === 'interview') return <SubPageWrapper><AIInterview userData={userData} onBack={goBack} /></SubPageWrapper>;
  if (page === 'industry') return <SubPageWrapper><IndustryDashboard onBack={goBack} /></SubPageWrapper>;
  if (page === 'certifications') return <SubPageWrapper><Certifications userData={userData} onBack={goBack} onProgressUpdate={handleProgressUpdate} /></SubPageWrapper>;
  if (page === 'audit') {
    return (
      <SubPageWrapper>
        <ProjectAuditor 
          onBack={goBack} 
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
      <div style={{ minHeight: '100vh', background: '#0a0a0c', color: 'white', fontFamily: 'var(--font-main)', display: 'flex', overflow: 'hidden' }}>
        <CustomCursor />
        <ParticleBackground />

        {/* Sidebar */}
        <aside style={{ width: '280px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative', zIndex: 10 }}>
          <div style={{ paddingLeft: '10px' }}>
            <h1 className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '900', margin: 0 }}>⚡ PathForge</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'dashboard', label: 'Overview', icon: '📊' },
              { id: 'learning', label: 'AI Roadmap', icon: '🚀' },
              { id: 'interview', label: 'Mock Interview', icon: '🎥' },
              { id: 'audit', label: 'Project Audit', icon: '🛡️' },
              { id: 'geo', label: 'Company Search', icon: '📍' },
              { id: 'mentoring', label: 'Mentorship', icon: '🎯' },
              { id: 'community', label: 'Community', icon: '🌐' },
              { id: 'skillmap', label: 'Skill DNA', icon: '🧬' },
              { id: 'certifications', label: 'Certifications', icon: '🎓' },
              { id: 'rewards', label: 'Reward Hub', icon: '🏆' },
              { id: 'profile', label: 'Settings', icon: '⚙️' },
            ].map(item => (
              <button key={item.id} onClick={() => navigateTo(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '14px', border: 'none', background: page === item.id ? 'rgba(255,107,53,0.15)' : 'transparent', color: page === item.id ? '#FF6B35' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '14px', fontWeight: '700', transition: 'all 0.2s', textAlign: 'left', width: '100%' }}
                onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = 'transparent'; }}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main tabIndex={0} style={{ flex: 1, padding: '40px 60px', position: 'relative', zIndex: 1, overflowY: 'auto', outline: 'none' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>Candidate Dashboard</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginTop: '6px' }}>Welcome back, {displayName}. Your career pulse is active.</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={() => navigateTo('home')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>Exit to Landing</button>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.4)', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                {userData?.profilePhoto ? <img src={userData.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>}
              </div>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '50px' }}>
            {/* Employability Score Widget */}
            <div 
              onClick={() => navigateTo('learning')}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(15px)', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Employability Index</span>
                <span style={{ fontSize: '24px' }}>📈</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>{lpct}%</div>
              <div style={{ fontSize: '13px', color: '#FF6B35', fontWeight: '700' }}>{ldone}/{ltotal} modules verified</div>
            </div>

            {/* AI Auditor Widget */}
            <div style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,255,255,0.03) 100%)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(15px)', position: 'relative' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#FF6B35', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>AI Industry Audit</div>
              <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: 'white' }}>Industry Readiness <br/>Status</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>Scan your progress against live market trends.</p>
              <button 
                onClick={() => navigateTo('audit')}
                style={{ width: '100%', padding: '12px', borderRadius: '14px', background: '#FF6B35', color: 'white', border: 'none', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255,107,53,0.2)' }}
              >
                Start AI Audit ⚡
              </button>
            </div>

            {/* Maturity Widget */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(15px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Skill Maturity</span>
                <span style={{ fontSize: '24px' }}>🧬</span>
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>{userData?.auditReport?.readinessLevel || 'Assessment Pending'}</div>
              <div style={{ fontSize: '13px', color: '#9B59B6', fontWeight: '700' }}>AI-Verified Talent</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
            {/* Pipeline Section */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Career Pipeline</h3>
                <button 
                  onClick={async () => {
                    setAuditLoading(true);
                    const result = await performIndustryAudit(userData);
                    setAuditLoading(false);
                    if (result) setAuditResult(result);
                  }}
                  style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', color: '#FF6B35', padding: '10px 20px', borderRadius: '14px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
                  {auditLoading ? 'Auditing...' : 'Run New Audit ⚡'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[
                  { icon: '🧬', name: 'Skill DNA Assessment', status: userData?.learningProgress?.percent > 0 ? 'Verified' : 'Pending', color: userData?.learningProgress?.percent > 0 ? '#2ECC71' : '#FF6B35', action: () => navigateTo('skillmap') },
                  { icon: '🚀', name: 'Learning Path Execution', status: lpct > 50 ? 'Advanced' : 'In Progress', color: '#3498DB', action: () => navigateTo('learning') },
                  { icon: '🎥', name: 'AI Mock Interview', status: 'Available', color: '#E67E22', action: () => navigateTo('interview') },
                  { icon: '🎯', name: 'Industry Mentoring', status: 'Active', color: '#9B59B6', action: () => navigateTo('mentoring') },
                ].map((row, i) => (
                  <div key={i} onClick={row.action} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(8px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      <span style={{ fontSize: '24px' }}>{row.icon}</span>
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>{row.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: row.color, fontWeight: '800', textTransform: 'uppercase' }}>● {row.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(155,89,182,0.15))', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '28px', padding: '32px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>AI Career Coach</h4>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '24px' }}>
                  "Based on your current progress, you are outperforming 85% of candidates in the {userData?.skill?.title || 'domain'}. Focus on Video Introduction to seal the deal."
                </p>
                <button onClick={() => navigateTo('interview')} style={{ width: '100%', background: '#FF6B35', border: 'none', padding: '16px', borderRadius: '16px', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 25px rgba(255,107,53,0.3)' }}>Start Video Intro</button>
              </div>
            </div>
          </div>

          {/* AI AUDIT MODAL (DASHBOARD) */}
          {auditResult && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ background: 'linear-gradient(145deg, #1a1a1c, #121214)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '32px', padding: '50px', maxWidth: '650px', width: '100%', textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', animation: 'modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div style={{ fontSize: '60px', marginBottom: '24px' }}>🤖</div>
                <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px', color: '#FF6B35', letterSpacing: '-0.5px' }}>AI Industry Verdict</h3>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>{auditResult.verdict}</div>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', marginBottom: '32px', textAlign: 'left' }}>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', margin: 0 }}>{auditResult.analysis}</p>
                  
                  <div style={{ marginTop: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '15px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>Hiring Likelihood</span>
                      <span style={{ fontSize: '22px', fontWeight: '900', color: '#2ECC71' }}>{auditResult.hiringLikelihood}%</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '15px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '4px' }}>Actionable Gap</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#FF6B35' }}>{auditResult.criticalMissingSkill}</span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setAuditResult(null)} style={{ background: '#FF6B35', color: 'white', border: 'none', padding: '16px 50px', borderRadius: '40px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,107,53,0.3)' }}>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: 'var(--font-main)', position: 'relative', overflowX: 'hidden' }}>
      <CustomCursor />
      <ParticleBackground />
      {/* Glassmorphism sticky nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 60px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '12px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', background: 'rgba(15,12,41,0.7)', animation: 'navSlideDown 0.6s ease both' }}>
        <h1 className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>⚡ PathForge</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#FF6B35'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}>Features</a>
          <a href="#howitworks" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#FF6B35'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}>How it Works</a>
          <button onClick={() => navigateTo('dashboard')} style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,107,53,0.1))', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.5)', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,53,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,107,53,0.1))'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >📋 Dashboard</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigateTo('profile')} style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.35)', borderRadius: '20px', padding: '8px 16px', fontSize: '14px', color: '#FF6B35', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,53,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,53,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{userData?.profilePhoto ? <img src={userData.profilePhoto} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} /> : '👤'}</span>
            {displayName}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '90px 20px 70px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(155,89,182,0.15))', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '30px', padding: '8px 22px', marginBottom: '28px', fontSize: '13px', color: '#FF9A6C', fontWeight: '600', backdropFilter: 'blur(8px)', animation: 'badgePop 0.7s ease both 0.2s' }}>
          🚀 Smart Mentoring System for Skill Mapping & Employability
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 70px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', animation: 'heroTextReveal 0.8s ease both 0.3s', letterSpacing: '-1px' }}>
          Welcome back,<br />
          <span className="pf-shimmer-text">{displayName}!</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6', animation: 'heroTextReveal 0.8s ease both 0.4s' }}>
          {userData?.skill ? `Continue your ${userData.skill.title} transformation where you left off.` : 'Begin your career transformation with our AI-powered skill assessment.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'heroTextReveal 0.8s ease both 0.5s' }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => {
              if (!userData?.skill) {
                navigateTo('onboarding');
              } else {
                navigateTo('dashboard');
              }
            }} className="pf-glow-btn" style={{ background: 'linear-gradient(135deg, #FF6B35, #FF9A6C)', color: 'white', border: 'none', padding: '18px 44px', borderRadius: '30px', fontSize: '17px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 30px rgba(255,107,53,0.4)' }}>
              {userData?.skill ? '📋 Open Dashboard' : '🚀 Start Your Journey →'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', padding: '44px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 1 }}>
        {[
          { num: 'AI-DRIVEN', label: 'Skills Assessment', desc: 'Deep technical stack evaluation' },
          { num: 'PERSONALIZED', label: 'Learning Paths', desc: 'Custom roadmaps for your goals' },
          { num: 'EXPERT-LED', label: 'Industry Mentorship', desc: 'Guidance from working professionals' },
          { num: 'HIRING-READY', label: 'Career Deployment', desc: 'Verified profiles for hiring partners' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', animation: `countUp 0.6s ease both ${0.1 * i}s` }}>
            <div className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: '900' }}>{s.num}</div>
            <div style={{ color: 'white', marginTop: '6px', fontSize: '14px', fontWeight: '700' }}>{s.label}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontSize: '11px', maxWidth: '140px', margin: '4px auto 0' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* How it Works section */}
      <div id="howitworks" style={{ padding: '100px 40px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.5px' }}>
          Your <span className="pf-shimmer-text">Career Roadmap</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>Follow these key steps to maximize your employability and secure your dream role.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'Skills Assessment', desc: 'Comprehensive analysis of your current technical abilities and identifies key areas for improvement.', icon: '🎯' },
            { step: '02', title: 'Learning Path', desc: 'A structured, step-by-step guide to mastering the skills needed for your target role.', icon: '🚀' },
            { step: '03', title: 'Expert Mentorship', desc: 'Direct access to industry professionals for career guidance and technical feedback.', icon: '🧬' },
            { step: '04', title: 'Job Placement', desc: 'Direct connection with hiring managers at companies looking for pre-vetted talent.', icon: '💼' }
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px 30px', textAlign: 'left', position: 'relative', animation: `cardEntrance 0.6s ease both ${i * 0.1}s`, backdropFilter: 'blur(10px)' }}>
              <div style={{ position: 'absolute', top: '20px', right: '30px', fontSize: '40px', fontWeight: '900', color: 'rgba(255,107,53,0.1)', fontFamily: 'var(--font-display)' }}>{s.step}</div>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: 'white' }}>{s.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid with 3D tilt cards */}
      <div id="features" style={{ padding: '90px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Everything you need to <span className="pf-shimmer-text">get hired</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', marginBottom: '52px' }}>Click any card to explore the feature</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { icon: '🧬', title: 'Skills Assessment', desc: 'Identify your technical strengths and critical skill gaps through a comprehensive evaluation mapped to current industry standards.', action: () => navigateTo('skillmap'), color: '#9B59B6' },
            { icon: '📍', title: 'Company Search', desc: 'Discover local and remote career opportunities from our network of partner companies hiring for your specific expertise.', action: () => navigateTo('geo'), color: '#2ECC71' },
            { icon: '🤖', title: 'Personalized Roadmap', desc: 'Follow a structured, week-by-week curriculum tailored to your career goals, featuring curated projects and certification milestones.', action: () => navigateTo('learning'), color: '#3498DB' },
            { icon: '🎯', title: 'Industry Mentoring', desc: 'Connect with experienced professionals for direct feedback, mock interviews, and career guidance tailored to your growth areas.', action: () => navigateTo('mentoring'), color: '#E74C3C' },
            { icon: '📊', title: 'Job Readiness Score', desc: 'Track your employability in real-time with a dynamic score that updates as you complete modules, projects, and assessments.', action: () => navigateTo('score'), color: '#F39C12' },
            { icon: '📄', title: 'Resume Builder', desc: 'Generate a high-impact, ATS-optimized resume that automatically highlights your verified skills and platform-validated projects.', action: () => navigateTo('resume'), color: '#1ABC9C' },
            { icon: '🌐', title: 'Community Feed', desc: 'Collaborate with a network of driven learners, share daily milestones, and gain inspiration from peer-led technical projects.', action: () => navigateTo('community'), color: '#FF6B35' },
          ].map((f, i) => (
            <div key={i} onClick={f.action} tabIndex={0} role="button"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') f.action(); }}
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '20px', padding: '30px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.3s, box-shadow 0.3s', animation: `cardEntrance 0.6s ease both ${i * 0.08}s`, backdropFilter: 'blur(10px)', perspective: '800px', transformStyle: 'preserve-3d', outline: 'none' }}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                e.currentTarget.style.transform = `perspective(800px) rotateX(${-y / 18}deg) rotateY(${x / 18}deg) translateZ(8px) scale(1.02)`;
                e.currentTarget.style.borderColor = `${f.color}70`;
                e.currentTarget.style.boxShadow = `0 20px 50px ${f.color}25, 0 0 0 1px ${f.color}30`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '16px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: 'rgba(255,255,255,0.95)' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.65', fontSize: '14px' }}>{f.desc}</p>
              <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '6px', color: f.color, fontSize: '13px', fontWeight: '700' }}>Open <span style={{ fontSize: '16px' }}>→</span></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '48px 40px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 1 }}>
          <div className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>⚡ PathForge</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', letterSpacing: '0.3px' }}>Built by Team Neural Nexus · NIET Greater Noida · Innovate-X-NIET 1.0</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            {['🧬', '📍', '🤖', '🎯', '📊', '📄', '🌐'].map((e, i) => (
              <span key={i} style={{ fontSize: '16px', opacity: 0.4, transition: 'opacity 0.2s, transform 0.2s' }}
                onMouseEnter={ev => { ev.target.style.opacity = '1'; ev.target.style.transform = 'translateY(-4px) scale(1.3)'; }}
                onMouseLeave={ev => { ev.target.style.opacity = '0.4'; ev.target.style.transform = 'translateY(0) scale(1)'; }}
              >{e}</span>
            ))}
          </div>
        </div>
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
    ctx.strokeStyle = '#FF6B35';
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
          <h3 style={{ color: '#FF6B35', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>✂️ Crop Image</h3>
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
              accentColor: '#FF6B35', cursor: 'pointer',
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
            background: 'linear-gradient(135deg, #FF6B35, #FF9A6C)', color: 'white', cursor: 'pointer',
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
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.06)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: 'Arial, sans-serif', padding: '30px 20px' }}>

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

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
          <button onClick={onBack} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
          <h1 style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 'bold' }}>⚡ My Profile</h1>
        </div>

        {/* Profile Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>

          {/* Cover Photo */}
          <div
            onClick={() => coverInputRef.current?.click()}
            style={{
              height: '120px',
              background: coverPhoto ? `url(${coverPhoto}) center/cover no-repeat` : 'linear-gradient(135deg, #FF6B35, #FF9A6C, #302b63)',
              position: 'relative', cursor: 'pointer',
            }}
          >
            <div style={{
              position: 'absolute', bottom: '8px', right: '10px',
              background: 'rgba(0,0,0,0.55)', borderRadius: '16px', padding: '4px 12px',
              fontSize: '11px', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px',
            }}>📷 {coverPhoto ? 'Change Cover' : 'Add Cover'}</div>
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-50px', padding: '0 24px 24px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100px', height: '100px', borderRadius: '50%',
                border: '4px solid #1a1a3e',
                background: profilePhoto ? `url(${profilePhoto}) center/cover no-repeat` : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
              }}
            >
              {!profilePhoto && <span style={{ fontSize: '36px', color: 'rgba(255,255,255,0.4)' }}>👤</span>}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.6)', padding: '4px', textAlign: 'center',
                fontSize: '10px', color: 'white', fontWeight: 'bold',
              }}>📷 Edit</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />

            <h2 style={{ marginTop: '14px', fontSize: '22px', fontWeight: 'bold' }}>{form.name}</h2>
            {form.bio && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '4px', textAlign: 'center' }}>{form.bio}</p>}

            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {form.city && (
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {form.city}</span>
              )}
              {form.college && (
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>🎓 {form.college}</span>
              )}
            </div>

            {userData?.skill && (
              <div style={{ marginTop: '12px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#FF6B35' }}>
                {userData.skill.icon} {userData.skill.title}
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Section */}
        <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Profile Details</h3>
            {!editMode && (
              <button onClick={() => setEditMode(true)} style={{ background: 'rgba(255,107,53,0.15)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.4)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>✏️ Edit</button>
            )}
          </div>

          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Aspiring Frontend Developer..." />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, background: '#FF6B35', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button onClick={() => setEditMode(false)} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[{ label: 'Name', value: form.name }, { label: 'College', value: form.college || '—' }, { label: 'City', value: form.city || '—' }, { label: 'Bio', value: form.bio || '—' }, { label: 'Email', value: user.email || '—' }].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{row.label}</span>
                  <span style={{ fontSize: '14px' }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings / Actions */}
        <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>⚙️ Settings</h3>
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
                  background: userData?.settings?.emailNotif ? '#2ECC71' : 'rgba(255,255,255,0.15)',
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
                  background: userData?.settings?.dailyReminder ? '#2ECC71' : 'rgba(255,255,255,0.15)',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: 'var(--font-main)', position: 'relative', overflow: 'hidden' }}>
      <CustomCursor />
      <ParticleBackground />

      {/* Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 60px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(24px)', background: 'rgba(15,12,41,0.7)', animation: 'navSlideDown 0.6s ease both' }}>
        <h1 className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>⚡ PathForge</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={onAuth} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 24px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.5)'; e.currentTarget.style.color = '#FF6B35'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}>
            Login
          </button>
          <button onClick={onAuth} className="pf-glow-btn" style={{ background: 'linear-gradient(135deg, #FF6B35, #FF9A6C)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '25px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 15px rgba(255,107,53,0.3)' }}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '100px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div className="pf-page-enter" style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(155,89,182,0.1))', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '30px', padding: '8px 24px', marginBottom: '32px', fontSize: '14px', color: '#FF9A6C', fontWeight: '600', animation: 'badgePop 0.8s ease both' }}>
          🚀 The Future of AI-Powered Career Growth
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 8vw, 84px)', fontWeight: '900', lineHeight: '1.05', marginBottom: '28px', animation: 'heroTextReveal 0.8s ease both 0.2s', letterSpacing: '-2px' }}>
          Forge Your Path to<br />
          <span className="pf-shimmer-text">Career Excellence.</span>
        </h1>
        <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0 auto 48px', lineHeight: '1.7', animation: 'heroTextReveal 0.8s ease both 0.4s' }}>
          PathForge combines advanced AI mentoring, real-time skill mapping, and direct corporate connections to transform your professional journey.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', animation: 'heroTextReveal 0.8s ease both 0.6s' }}>
          <button onClick={onAuth} className="pf-glow-btn" style={{ background: 'linear-gradient(135deg, #FF6B35, #FF9A6C)', color: 'white', border: 'none', padding: '20px 50px', borderRadius: '35px', fontSize: '18px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,107,53,0.4)' }}>
            Get Started Now →
          </button>
          <a href="#about" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '20px 40px', borderRadius: '35px', fontSize: '18px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', backdropFilter: 'blur(10px)', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
            Learn More
          </a>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '80px', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {[
          { num: 'AI-FIRST', label: 'Skills Assessment', desc: 'Precision gap identification' },
          { num: 'STRUCTURED', label: 'Career Roadmaps', desc: 'Weekly learning milestones' },
          { num: 'MERIT-BASED', label: 'Industry Mentorship', desc: 'Direct access to practitioners' },
          { num: 'OUTCOME-READY', label: 'Corporate Hiring', desc: 'Automated talent matching' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', animation: `countUp 0.8s ease both ${0.1 * i}s` }}>
            <div className="pf-shimmer-text" style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: '900' }}>{s.num}</div>
            <div style={{ color: 'white', marginTop: '8px', fontSize: '15px', fontWeight: '700' }}>{s.label}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontSize: '12px', maxWidth: '160px', margin: '6px auto 0' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* How it Works Section */}
      <div id="howitworks" style={{ padding: '100px 20px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.5px' }}>
          The <span className="pf-shimmer-text">PathForge</span> Journey
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>Our proven 4-step framework to bridge the gap between education and employment.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'DNA Mapping', desc: 'Advanced AI analysis to pinpoint your unique skill proficiencies and growth potential.', icon: '🎯' },
            { step: '02', title: 'Adaptive Roadmaps', desc: 'Dynamic learning trajectories calibrated to current market demand.', icon: '🤖' },
            { step: '03', title: 'Expert Mentorship', desc: 'Direct access to practitioners for outcome-oriented technical guidance.', icon: '🧬' },
            { step: '04', title: 'Corporate Matching', desc: 'Automated alignment with hiring partners seeking your specific talent profile.', icon: '🤝' }
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px 30px', textAlign: 'left', position: 'relative', animation: `cardEntrance 0.6s ease both ${i * 0.1}s`, backdropFilter: 'blur(10px)' }}>
              <div style={{ position: 'absolute', top: '20px', right: '30px', fontSize: '40px', fontWeight: '900', color: 'rgba(255,107,53,0.1)', fontFamily: 'var(--font-display)' }}>{s.step}</div>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>{s.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div id="about" style={{ maxWidth: '1100px', margin: '100px auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
        <div style={{ animation: 'fadeSlideIn 1s ease both' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '800', marginBottom: '24px' }}>Bridging the <span className="pf-shimmer-text">Employability Gap</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', lineHeight: '1.8', marginBottom: '32px' }}>
            Traditional education often focuses on theory, leaving graduates unprepared for the job market. PathForge helps you bridge this gap by identifying your technical strengths and connecting you directly with the right training and hiring partners.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { t: 'Skills Assessment', d: 'Identify exactly where you stand and what you need to learn next.' },
              { t: 'Industry Mentoring', d: 'Connect with experienced professionals for one-on-one guidance.' },
              { t: 'Direct Hiring', d: 'Get discovered by companies looking for your specific technical profile.' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ color: '#FF6B35', fontSize: '18px', marginTop: '2px' }}>✅</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{item.t}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{item.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', padding: '40px', position: 'relative', animation: 'fadeSlideIn 1s ease both 0.3s' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '11px', color: '#FF6B35', fontWeight: '800', marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>Built for Revenue</div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Revenue-Ready Ecosystem</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: '1.7' }}>
              Our dual-engine model partners with Fortune 500 giants to deliver high-potential, pre-vetted talent. By bridging the gap between student ambition and corporate necessity, we've built a sustainable, revenue-generating ecosystem for the future of work.
            </p>
            <button onClick={onAuth} style={{ marginTop: '32px', background: 'white', color: '#0f0c29', border: 'none', padding: '14px 30px', borderRadius: '15px', fontWeight: '800', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Join the Ecosystem
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '60px 40px', borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
        ⚡ PathForge — Built by Team Neural Nexus · NIET Greater Noida
      </div>
    </div>
  );
}

export default App;