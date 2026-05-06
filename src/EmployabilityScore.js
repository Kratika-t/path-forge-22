import React, { useState, useEffect, useMemo } from 'react';

const tasksBySkill = {
  'Frontend Development': [
    { id: 1, task: 'Complete HTML & CSS basics', points: 10, category: 'Learning' },
    { id: 2, task: 'Build your first React component', points: 15, category: 'Project' },
    { id: 3, task: 'Complete JavaScript fundamentals course', points: 20, category: 'Course' },
    { id: 4, task: 'Build a personal portfolio website', points: 25, category: 'Project' },
    { id: 5, task: 'Learn Tailwind CSS', points: 10, category: 'Learning' },
    { id: 6, task: 'Push project to GitHub', points: 10, category: 'Action' },
    { id: 7, task: 'Apply to 3 frontend internships', points: 10, category: 'Action' },
  ],
  'Backend Development': [
    { id: 1, task: 'Learn Node.js basics', points: 10, category: 'Learning' },
    { id: 2, task: 'Build a REST API with Express', points: 20, category: 'Project' },
    { id: 3, task: 'Connect MongoDB to your project', points: 15, category: 'Project' },
    { id: 4, task: 'Complete SQL fundamentals course', points: 15, category: 'Course' },
    { id: 5, task: 'Deploy backend on Render', points: 10, category: 'Action' },
    { id: 6, task: 'Push project to GitHub', points: 10, category: 'Action' },
    { id: 7, task: 'Apply to 3 backend internships', points: 10, category: 'Action' },
  ],
  'Artificial Intelligence': [
    { id: 1, task: 'Complete Python basics course', points: 10, category: 'Course' },
    { id: 2, task: 'Learn NumPy and Pandas', points: 15, category: 'Learning' },
    { id: 3, task: 'Build your first ML model', points: 25, category: 'Project' },
    { id: 4, task: 'Complete a Kaggle competition', points: 20, category: 'Project' },
    { id: 5, task: 'Learn TensorFlow basics', points: 15, category: 'Learning' },
    { id: 6, task: 'Push project to GitHub', points: 10, category: 'Action' },
    { id: 7, task: 'Apply to 3 AI internships', points: 10, category: 'Action' },
  ],
  'Data Science': [
    { id: 1, task: 'Complete Python for Data Science course', points: 15, category: 'Course' },
    { id: 2, task: 'Learn data visualization with Matplotlib', points: 10, category: 'Learning' },
    { id: 3, task: 'Complete SQL for Data Analysis', points: 15, category: 'Course' },
    { id: 4, task: 'Build a data analysis project', points: 25, category: 'Project' },
    { id: 5, task: 'Create a Tableau/Power BI dashboard', points: 15, category: 'Project' },
    { id: 6, task: 'Push project to GitHub', points: 10, category: 'Action' },
    { id: 7, task: 'Apply to 3 data analyst internships', points: 10, category: 'Action' },
  ],
  'Cyber Security': [
    { id: 1, task: 'Complete Networking fundamentals', points: 15, category: 'Course' },
    { id: 2, task: 'Learn Linux basics', points: 10, category: 'Learning' },
    { id: 3, task: 'Complete ethical hacking course', points: 25, category: 'Course' },
    { id: 4, task: 'Practice on TryHackMe platform', points: 20, category: 'Project' },
    { id: 5, task: 'Get CEH or CompTIA Security+ cert', points: 20, category: 'Action' },
    { id: 6, task: 'Document your findings on GitHub', points: 10, category: 'Action' },
  ],
  'default': [
    { id: 1, task: 'Complete a beginner course in your skill', points: 15, category: 'Course' },
    { id: 2, task: 'Build your first project', points: 20, category: 'Project' },
    { id: 3, task: 'Connect with a mentor on PathForge', points: 15, category: 'Action' },
    { id: 4, task: 'Add your project to portfolio', points: 15, category: 'Project' },
    { id: 5, task: 'Apply to 3 internships', points: 15, category: 'Action' },
    { id: 6, task: 'Push project to GitHub', points: 10, category: 'Action' },
    { id: 7, task: 'Get mentor endorsement', points: 10, category: 'Action' },
  ]
};

const getCategoryColors = (theme) => ({
  Learning: 'var(--brand-teal)',
  Project: 'var(--brand-yellow)',
  Course: 'var(--brand-teal)',
  Action: '#057642',
});

function getScoreLabel(score) {
  if (score === 0) return { label: 'Not Started', color: 'var(--text-body)', emoji: '😴' };
  if (score < 20) return { label: 'Just Beginning', color: 'var(--brand-coral)', emoji: '🌱' };
  if (score < 40) return { label: 'Building Up', color: 'var(--brand-yellow)', emoji: '📚' };
  if (score < 60) return { label: 'Getting There', color: 'var(--brand-yellow)', emoji: '🔥' };
  if (score < 80) return { label: 'Almost Ready', color: '#057642', emoji: '💪' };
  return { label: 'Job Ready!', color: '#057642', emoji: '🚀' };
}

const defaultTheme = {
  pageBg: 'var(--bg-base)',
  cardBg: 'var(--glass-bg)',
  inputBg: 'rgba(255, 255, 255, 0.6)',
  border: 'var(--glass-border)',
  textPrimary: 'var(--text-heading)',
  textMuted: 'var(--text-body)',
  accent: 'var(--brand-teal)',
  accentHover: 'var(--brand-yellow)',
  accentLight: 'rgba(0, 212, 170, 0.2)',
  success: 'var(--brand-teal)',
  warning: 'var(--brand-yellow)',
  error: 'var(--brand-coral)',
};

export default function EmployabilityScore({ userData, onBack, onNext, onProgressUpdate, theme = defaultTheme }) {
  const currentTheme = theme || defaultTheme;
  const skillName = userData?.skill?.title || 'default';
  const tasks = tasksBySkill[skillName] || tasksBySkill['default'];
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);

  const [completed, setCompleted] = useState(() => userData?.employabilityProgress?.completed || {});
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedScore(prev => {
        if (prev === score) {
          clearInterval(timer);
          return prev;
        }
        return prev + (score > prev ? 1 : -1);
      });
    }, 15);
    return () => clearInterval(timer);
  }, [score]);
  const modulesPassed = userData?.learningProgress?.completedCount || 0;
  const totalModules = userData?.learningProgress?.total || 0;
  const learningPct = totalModules ? Math.round((modulesPassed / totalModules) * 100) : 0;

  const courseTaskIds = useMemo(
    () => tasks.filter((t) => t.category === 'Course').map((t) => t.id),
    [tasks]
  );
  const autoCompletedCourseCount = courseTaskIds.length
    ? Math.round((learningPct / 100) * courseTaskIds.length)
    : 0;
  const autoCompletedCourses = useMemo(
    () => courseTaskIds.slice(0, autoCompletedCourseCount).reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {}),
    [courseTaskIds, autoCompletedCourseCount]
  );
  const effectiveCompleted = useMemo(
    () => ({ ...completed, ...autoCompletedCourses }),
    [completed, autoCompletedCourses]
  );

  useEffect(() => {
    const earned = tasks
      .filter(t => effectiveCompleted[t.id])
      .reduce((sum, t) => sum + t.points, 0);
    const checklistPct = Math.round((earned / totalPoints) * 100);
    const blended = Math.round((checklistPct * 0.7) + (learningPct * 0.3));
    setScore(blended);
  }, [effectiveCompleted, tasks, totalPoints, learningPct]);

  const [verifying, setVerifying] = useState(null);
  const [evidenceModal, setEvidenceModal] = useState(null);
  const [evidenceValue, setEvidenceValue] = useState('');

  const toggleTask = async (task) => {
    if (completed[task.id] || courseTaskIds.includes(task.id) || verifying === task.id) return;

    if (['Project', 'Action'].includes(task.category)) {
      setEvidenceModal(task);
      return;
    }

    setVerifying(task.id);
    const dwellMs = task.category === 'Learning' ? 45 * 1000 : 2500;
    setTimeout(async () => {
      const nextCompleted = { ...completed, [task.id]: true };
      setCompleted(nextCompleted);
      setVerifying(null);
      if (onProgressUpdate) {
        const nextEffectiveCompleted = { ...nextCompleted, ...autoCompletedCourses };
        const earned = tasks.filter(t => nextEffectiveCompleted[t.id]).reduce((s, t) => s + t.points, 0);
        onProgressUpdate({ employabilityProgress: { completed: nextCompleted, earnedPoints: earned } });
      }
    }, dwellMs);
  };

  const handleSubmitEvidence = async () => {
    if (!evidenceValue.trim()) return alert("Please provide proof (Link/Description) to verify this task.");
    const task = evidenceModal;
    setVerifying(task.id);
    setEvidenceModal(null);
    setTimeout(async () => {
      const nextCompleted = { ...completed, [task.id]: true };
      setCompleted(nextCompleted);
      setVerifying(null);
      setEvidenceValue('');
      if (onProgressUpdate) {
        const nextEffectiveCompleted = { ...nextCompleted, ...autoCompletedCourses };
        const earned = tasks.filter(t => nextEffectiveCompleted[t.id]).reduce((s, t) => s + t.points, 0);
        onProgressUpdate({ employabilityProgress: { completed: nextCompleted, earnedPoints: earned } });
      }
    }, 4000);
  };

  const { label, color, emoji } = getScoreLabel(animatedScore);
  const circumference = 2 * Math.PI * 54;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-main)', padding: '80px 20px' }}>
      
      {/* EVIDENCE MODAL */}
      {evidenceModal && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(253, 252, 248, 0.4)', backdropFilter: 'blur(40px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div className="pf-glass modal-content" style={{ padding:'80px', maxWidth:'750px', width:'100%', textAlign:'center', background:'white !important', borderRadius:'60px', border:'none', boxShadow:'0 50px 150px rgba(0,0,0,0.12)', animation: 'modalFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ fontSize:'100px', marginBottom: '40px', animation: 'pf-pulse 2s infinite' }}>📁</div>
            <h3 style={{ fontSize:'48px', fontWeight:'900', margin:'0 0 25px', fontFamily: 'var(--font-display)', color: 'var(--text-heading)', letterSpacing:'-2.5px' }}>Verify Action</h3>
            <p style={{ color: 'var(--text-muted)', fontSize:'20px', marginBottom:'50px', fontWeight: '800' }}>Provide evidence for: <b style={{ color: 'var(--brand-teal)' }}>{evidenceModal.task}</b></p>
            <input 
              type="text" 
              placeholder="Enter GitHub URL or Link to Proof..." 
              value={evidenceValue} 
              onChange={e => setEvidenceValue(e.target.value)}
              className="pf-glass"
              style={{ width:'100%', padding:'30px', borderRadius:'25px', background: 'rgba(0,0,0,0.02) !important', border:'none !important', color: 'var(--text-heading)', marginBottom:'50px', fontWeight: '700', fontSize:'18px', outline:'none', boxShadow:'inset 0 2px 15px rgba(0,0,0,0.03) !important' }}
            />
            <div style={{ display:'flex', gap:'25px' }}>
              <button onClick={() => setEvidenceModal(null)} className="pf-glass" style={{ flex:1, padding:'25px', cursor:'pointer', fontWeight: '900', border:'none', background:'rgba(0,0,0,0.05) !important', letterSpacing:'2px', borderRadius:'25px', textTransform:'uppercase', fontSize:'14px' }}>CANCEL</button>
              <button onClick={handleSubmitEvidence} className="pf-glow-btn" style={{ flex:1, padding:'25px', fontWeight:'900', cursor:'pointer', border:'none', textTransform:'uppercase', letterSpacing:'2px', borderRadius:'25px', fontSize:'14px' }}>SUBMIT PROOF</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', maxWidth: '1300px', margin: '0 auto 80px' }}>
        <button onClick={onBack} className="pf-glass" style={{ border:'none', padding: '16px 35px', cursor: 'pointer', fontSize: '13px', fontWeight: '900', borderRadius:'25px', letterSpacing:'1.5px', textTransform:'uppercase' }}>BACK</button>
        <h1 className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', fontFamily:'var(--font-display)', margin:0, letterSpacing:'-1px' }}>⚡ PathForge Dashboard</h1>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '100px' }}>
          <h2 style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-3.5px', fontFamily: 'var(--font-display)', color:'var(--text-heading)', lineHeight:1.1, margin:0 }}>
            <span className="pf-shimmer-text">{userData?.name || 'Your'}'s Proof of Work</span>
          </h2>
          <div style={{ color: 'var(--text-muted)', marginTop: '25px', fontWeight: '900', fontSize:'26px', letterSpacing:'2px', opacity:0.6 }}>🚀 {skillName.toUpperCase()} • 📍 INDUSTRY READY STATUS</div>
        </div>

        {/* Score Card Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px', marginBottom: '80px' }}>
          <div className="pf-glass" style={{ padding: '80px', display: 'flex', flexDirection:'column', alignItems: 'center', justifyContent: 'center', gap: '50px', background:'white !important', borderRadius:'60px', border:'none', boxShadow:'0 40px 100px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'relative', width: '280px', height: '280px' }}>
              <svg style={{ transform: 'rotate(-90deg)', width: '280px', height: '280px' }}>
                <circle cx="140" cy="140" r="130" fill="none" stroke="rgba(0,0,0,0.02)" strokeWidth="24" />
                <circle cx="140" cy="140" r="130" fill="none" stroke={color} strokeWidth="24" strokeDasharray={2 * Math.PI * 130} strokeDashoffset={2 * Math.PI * 130 - (animatedScore / 100) * (2 * Math.PI * 130)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.16, 1, 0.3, 1)', filter:`drop-shadow(0 0 25px ${color}66)` }} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '84px', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-3px', lineHeight:1 }}>{animatedScore}%</div>
                <div style={{ fontSize: '56px', marginTop:'10px' }}>{emoji}</div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '900', color: color, textTransform: 'uppercase', letterSpacing: '4px', fontFamily: 'var(--font-display)', lineHeight:1 }}>{label}</div>
              <div style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '15px', fontWeight: '900', letterSpacing:'2px' }}>EMPLOYABILITY SCORE</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
            {[
              { label: 'Tasks Completed', value: `${tasks.filter(t => effectiveCompleted[t.id]).length} / ${tasks.length}`, color: 'var(--brand-teal)', icon:'🎯' },
              { label: 'Current Skill Track', value: skillName, color: 'var(--brand-teal)', icon:'🛠️' },
              { label: 'Learning Velocity', value: `${learningPct}%`, color: 'var(--brand-yellow)', icon:'⚡' },
              { label: 'Target Destination', value: 'Industry Verified', color: 'var(--brand-teal)', icon:'🏁' },
            ].map((stat, i) => (
              <div key={stat.label} className="pf-glass" style={{ padding: '30px 45px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background:'white !important', borderRadius:'35px', border:'none', boxShadow:'0 15px 40px rgba(0,0,0,0.03)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'25px' }}>
                  <span style={{ fontSize:'36px', filter:'drop-shadow(0 5px 15px rgba(0,0,0,0.05))' }}>{stat.icon}</span>
                  <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'2px' }}>{stat.label}</span>
                </div>
                <span style={{ fontSize: '26px', fontWeight: '900', color: stat.color, fontFamily: 'var(--font-display)', letterSpacing:'-0.5px' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="pf-glass" style={{ padding: '70px', background:'white !important', borderRadius:'60px', border:'none', boxShadow:'0 50px 150px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '60px', display: 'flex', alignItems: 'center', gap: '25px', fontFamily: 'var(--font-display)', color: 'var(--text-heading)', letterSpacing:'-2px' }}>
            ✅ Performance Roadmap <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-muted)', opacity: 0.4, letterSpacing:'2px', marginLeft:'auto' }}>VERIFY SKILLS TO ASCEND</span>
          </h3>
          <div style={{ display: 'grid', gap: '30px' }}>
            {tasks.map((t) => {
              const isAuto = courseTaskIds.includes(t.id);
              const isDone = effectiveCompleted[t.id];
              const isVerifying = verifying === t.id;
              const catColor = getCategoryColors(currentTheme)[t.category] || 'var(--brand-teal)';

              return (
                <div key={t.id} onClick={() => toggleTask(t)} className="pf-glass task-item" style={{ 
                  padding: '45px 55px', display: 'flex', alignItems: 'center', gap: '45px', 
                  borderLeft: isDone ? `15px solid var(--brand-teal) !important` : `15px solid ${catColor} !important`,
                  cursor: isDone || isAuto || isVerifying ? 'default' : 'pointer', 
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)', 
                  opacity: isVerifying ? 0.7 : 1,
                  background: isDone ? 'rgba(0, 212, 170, 0.04) !important' : 'rgba(0,0,0,0.01) !important',
                  borderRadius:'40px',
                  border:'none',
                  position:'relative',
                  overflow:'hidden'
                }}>
                  <div className="pf-glass" style={{ 
                    width: '56px', height: '56px', borderRadius: '18px', border: 'none', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? 'var(--brand-teal)' : 'white !important', color: isDone ? '#FFFFFF' : 'var(--text-muted)', fontSize: '28px', fontWeight:'900', boxShadow: isDone ? '0 10px 25px rgba(0, 212, 170, 0.3)' : '0 5px 15px rgba(0,0,0,0.03)' 
                  }}>
                    {isDone ? '✓' : ''}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '26px', fontWeight: '900', color: isDone ? 'var(--brand-teal)' : 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-1px' }}>{t.task}</div>
                    <div style={{ fontSize: '17px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: '700', opacity:0.8 }}>
                      {isVerifying
                        ? (t.category === 'Learning' ? '⏳ Engagement timer active (~45s) — stay focused…' : '🔍 AI Verifying your submission…')
                        : isAuto ? 'Auto-updated via PathForge Learning Engine' : t.category === 'Learning' ? 'Click to start; completes after focused engagement session' : 'Requires Proof of Work verification'}
                    </div>
                  </div>
                  <div className="pf-glass" style={{ padding:'12px 30px', borderRadius:'20px', fontSize: '18px', fontWeight: '900', color: catColor, fontFamily: 'var(--font-display)', background:'white !important', border:'none', letterSpacing:'1.5px', boxShadow:'0 10px 25px rgba(0,0,0,0.03) !important' }}>+{t.points} PTS</div>
                </div>
              );
            })}
          </div>
        </div>

        {onNext && (
          <div style={{ textAlign: 'center', marginTop: '100px', marginBottom: '120px' }}>
            <button onClick={onNext} className="pf-glow-btn" style={{ padding: '28px 100px', fontSize: '22px', fontWeight: '900', cursor: 'pointer', borderRadius:'50px', textTransform:'uppercase', letterSpacing:'3px', border:'none' }}>
              Explore AI Learning Path →
            </button>
          </div>
        )}

        {animatedScore >= 80 && (
          <div className="pf-glass job-ready-banner" style={{
            marginTop: '60px', textAlign: 'center', padding: '100px 50px',
            border: 'none', background: 'white !important', borderRadius:'60px', animation:'pf-fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) both', boxShadow:'0 60px 150px rgba(0, 212, 170, 0.15)'
          }}>
            <div style={{ fontSize: '120px', marginBottom: '40px', animation:'pf-pulse 2s infinite' }}>🎉</div>
            <div style={{ fontSize: '64px', fontWeight: '900', color: 'var(--brand-teal)', fontFamily: 'var(--font-display)', letterSpacing:'-3px', lineHeight:1 }}>OFFICIALLY JOB READY!</div>
            <div style={{ color: 'var(--text-muted)', marginTop: '30px', fontWeight: '800', fontSize:'26px', lineHeight:1.6, maxWidth:'800px', margin:'30px auto 0' }}>
              Your Proof of Work is verified. Your ATS-optimized profile is now live for hiring partners.
            </div>
          </div>
        )}
      </div>
      <style>{`
        .task-item:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 40px 100px rgba(0,0,0,0.06) !important; z-index: 10; }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.9) translateY(60px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
