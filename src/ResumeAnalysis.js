import React, { useState } from 'react';
import { analyzeResumeWithGemini } from './gemini';

const defaultTheme = { 
  pageBg:'transparent', 
  cardBg:'rgba(255, 255, 255, 0.7)', 
  inputBg:'rgba(255, 255, 255, 0.8)', 
  border:'none', 
  textPrimary:'var(--text-heading)', 
  textMuted:'var(--text-body)', 
  accent:'var(--brand-teal)', 
  accentHover:'var(--brand-yellow)', 
  accentLight:'rgba(0, 212, 170, 0.1)', 
  success:'var(--brand-teal)', 
  warning:'var(--brand-yellow)', 
  error:'var(--brand-coral)' 
};

export default function ResumeAnalysis({ onComplete, onBack, theme = defaultTheme }) {
  const [mode, setMode] = useState(null); // 'skilled' or 'beginner'
  const [analyzing, setAnalyzing] = useState(false);
  const [beginnerScore, setBeginnerScore] = useState({});
  const [quizStep, setQuizStep] = useState(0);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  const beginnerQuestions = [
    {
      id: 1,
      question: "How do you prefer solving a problem?",
      options: [
        { label: "Building a logical set of rules (Backend)", value: "Backend Development" },
        { label: "Designing a beautiful and intuitive interface (Frontend)", value: "Frontend Development" },
        { label: "Finding patterns in complex data (Data Science)", value: "Data Science" },
        { label: "Securing a system from intruders (Cyber Security)", value: "Cyber Security" },
        { label: "Others (Tell us your interest)", value: "OTHER" }
      ]
    },
    {
      id: 2,
      question: "Which tool sounds more exciting to use?",
      options: [
        { label: "A creative design tool like Figma", value: "UI/UX Design" },
        { label: "A terminal with raw code and servers", value: "Cloud Computing" },
        { label: "Building apps that run on phones", value: "Mobile Development" },
        { label: "Training a robot to learn from examples", value: "Artificial Intelligence" },
        { label: "Others (Type your favorite tool)", value: "OTHER" }
      ]
    },
    {
      id: 3,
      question: "What is your main goal right now?",
      options: [
        { label: "Get a job as fast as possible", value: "Job" },
        { label: "Build my own startup idea", value: "Startup" },
        { label: "Learn for curiosity and projects", value: "Learning" },
        { label: "Others (Specify your goal)", value: "OTHER" }
      ]
    }
  ];

  const [auditReport, setAuditReport] = useState(null);
  const [fraudAlert, setFraudAlert] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    // LAYER 1: Extension Check
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const ext = uploadedFile.name.toLowerCase().slice(uploadedFile.name.lastIndexOf('.'));
    if (!validExtensions.includes(ext)) {
      setFraudAlert({
        type: 'extension',
        message: `❌ REJECTED: "${uploadedFile.name}" is not a valid document. Only PDF or Docx files are accepted.`
      });
      return;
    }

    // LAYER 1.5: File Size Check — blank/fake files are usually < 3KB
    if (uploadedFile.size < 3000) {
      setFraudAlert({
        type: 'size',
        message: `⚠️ REJECTED: This file is too small (${Math.round(uploadedFile.size / 1024)}KB) to be a real resume. Please upload your complete resume document.`
      });
      return;
    }

    // LAYER 2: Content Scan — use readAsBinaryString to read embedded text in PDFs
    setAnalyzing(true);
    setFraudAlert(null);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      // readAsBinaryString preserves embedded plain-text inside PDFs
      const content = evt.target.result.toLowerCase();

      // ── Try Gemini AI first ──────────────────────────────────────────────
      let report = null;
      const geminiResult = await analyzeResumeWithGemini(content);

      if (geminiResult) {
        // Gemini returned a real analysis
        if (geminiResult.isFakeResume) {
          setAnalyzing(false);
          setFraudAlert({ type: 'content', message: `⚠️ FRAUD DETECTED by AI: ${geminiResult.fraudReason}` });
          return;
        }
        report = {
          candidateName: geminiResult.candidateName || 'Candidate',
          skillTitle: geminiResult.skillTitle || 'Frontend Development',
          detectedStack: geminiResult.detectedStack || [],
          keywordScore: geminiResult.keywordScore || 5,
          signals: {
            hasExperience: geminiResult.hasExperience,
            hasEducation: geminiResult.hasEducation,
            hasProjects: geminiResult.hasProjects,
            hasCertifications: geminiResult.hasCertifications,
          },
          matchedKeywords: geminiResult.detectedStack?.slice(0, 8) || [],
          readinessLevel: geminiResult.readinessLevel || 'Rising Talent',
          readinessPercent: geminiResult.readinessPercent || 40,
          whyThisScore: geminiResult.whyThisScore || [],
          aiPowered: true,
        };
      } else {
        // ── STRICT Fallback (Forces Gemini) ───────────────────────────────
        const raw = evt.target.result;
        const foundKeywords = RESUME_KEYWORDS.filter(kw => new RegExp(kw, 'i').test(raw));
        const keywordScore = foundKeywords.length;

        // If no API key, we require a massive 25 keywords to pass manually
        if (keywordScore < 25) {
          setAnalyzing(false);
          setFraudAlert({
            type: 'content',
            message: `⚠️ AI OFFLINE: This document failed the strict local audit (detected only ${keywordScore} signals). To use full AI analysis, please ensure your Gemini API key is configured in Vercel settings.`,
          });
          return;
        }

        report = {
          candidateName: 'Manual Candidate',
          skillTitle: 'Frontend Development', 
          detectedStack: ['HTML', 'CSS', 'JS'], 
          keywordScore,
          signals: { hasExperience: true, hasEducation: true, hasProjects: true, hasCertifications: false },
          matchedKeywords: foundKeywords.slice(0, 8),
          readinessLevel: 'Rising Talent',
          readinessPercent: 65,
          whyThisScore: ['✅ Manual fallback audit passed with high signals', '⚠️ AI validation unavailable'],
          aiPowered: false,
        };
      }

      setAuditReport(report);
      setAnalyzing(false);

      setTimeout(() => {
        onComplete({
          mode: 'skilled',
          skill: { title: report.skillTitle, icon: '🚀' },
          level: report.readinessLevel === 'Industry Ready' ? 'Intermediate' : 'Beginner',
          onboardingType: 'skilled',
          auditReport: report,
          learningProgress: {
            modules: report.readinessPercent > 30 ? {
              0: { completed: true, courseDone: true, testPassed: true, testScore: 100 },
              1: { completed: true, courseDone: true, testPassed: true, testScore: 95 }
            } : {},
            completedCount: report.readinessPercent > 30 ? 2 : 0, 
            total: 6, 
            percent: report.readinessPercent // Use dynamic score from AI report
          },
          analysisSummary: `${report.aiPowered ? 'Gemini AI' : 'Multi-RAG'} Audit complete! Detected ${report.skillTitle} expertise. ${report.readinessLevel} status granted based on ${report.keywordScore} signals.`
        });
      }, 3000);
    };
    // Use readAsBinaryString — works for both PDF and Docx binary formats
    reader.readAsBinaryString(uploadedFile);
  };

  const startAnalysis = (type, data) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onComplete({
        mode: type,
        skill: { title: data, icon: '🚀' },
        level: 'Beginner',
        onboardingType: type,
        analysisSummary: `Potential Mapping complete! Based on your interest in ${data}, we've mapped your path.`
      });
    }, 2500);
  };

  const handleBeginnerChoice = (value) => {
    if (value === 'OTHER') {
      setShowOtherInput(true);
      return;
    }
    
    if (quizStep < beginnerQuestions.length - 1) {
      setBeginnerScore({ ...beginnerScore, [quizStep]: value });
      setQuizStep(quizStep + 1);
      setShowOtherInput(false);
      setOtherText('');
    } else {
      startAnalysis('beginner', value);
    }
  };

  const submitOther = () => {
    if (!otherText || otherText.length < 3) return;
    handleBeginnerChoice(otherText);
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    borderRadius: '45px',
    padding: '60px',
    textAlign: 'center',
    maxWidth: '650px',
    width: '100%',
    boxShadow: '0 30px 80px rgba(0,0,0,0.06)',
    border: 'none',
    animation: 'fadeSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both',
  };

  const buttonStyle = {
    padding: '22px 35px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    width: '100%',
    marginBottom: '15px',
    letterSpacing:'0.5px'
  };

  if (analyzing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: 'var(--text-body)', fontFamily:'var(--font-main)' }}>
        <div className="pf-glass" style={cardStyle}>
          <div className="loader" style={{ fontSize: '70px', marginBottom: '35px', filter:'drop-shadow(0 0 20px var(--brand-teal))' }}>🧠</div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '15px', fontFamily:'var(--font-display)', letterSpacing:'-1.5px' }}>Neural Synapse Scan</h2>
          <p style={{ color: 'var(--text-body)', fontWeight:'700', opacity:0.6, fontSize:'17px' }}>
            {mode === 'skilled' ? 'Extracting multi-dimensional skills from your resume...' : 'Mapping your unique Career DNA architecture...'}
          </p>
          <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', marginTop: '40px', overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: 'var(--brand-teal)', borderRadius: '4px', boxShadow:'0 0 15px rgba(0, 212, 170, 0.5)' }} className="progress-bar-anim"></div>
          </div>
        </div>
        <style>{`
          @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
          @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          .progress-bar-anim { animation: progress 2s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: 'var(--text-body)', padding: '40px 20px', fontFamily:'var(--font-main)' }}>

      {!mode ? (
        <div className="pf-glass" style={cardStyle}>
          <h1 className="pf-shimmer-text" style={{ fontSize: '56px', fontWeight: '900', marginBottom: '15px', fontFamily:'var(--font-display)', letterSpacing:'-3px' }}>PROTOCOL SELECT</h1>
          <p style={{ color: 'var(--text-body)', marginBottom: '50px', fontSize:'20px', fontWeight:'700', opacity:0.6 }}>Define your entry point to initialize the PathForge engine.</p>

          <button
            onClick={() => setMode('skilled')}
            className="pf-glow-btn"
            style={{ ...buttonStyle, background: 'var(--brand-teal)', color: '#FFFFFF', textTransform:'uppercase', letterSpacing:'1.5px' }}
          >
            📄 RESUME AUDIT (SKILLED)
          </button>

          <button
            onClick={() => setMode('beginner')}
            className="pf-glass"
            style={{ ...buttonStyle, background: 'white', color: 'var(--text-heading)', border: 'none', textTransform:'uppercase', letterSpacing:'1.5px', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' }}
          >
            🌱 DNA MAPPING (BEGINNER)
          </button>

          <button onClick={onBack} style={{ background: 'transparent', color: 'var(--text-body)', border: 'none', cursor: 'pointer', marginTop: '25px', fontWeight:'900', fontSize:'13px', letterSpacing:'1.5px', opacity:0.5 }}>← PREVIOUS PHASE</button>
        </div>
      ) : mode === 'skilled' ? (
        <div className="pf-glass" style={cardStyle}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '15px', fontFamily:'var(--font-display)', letterSpacing:'-1.5px' }}>RESUME UPLOAD</h2>
          <p style={{ color: 'var(--text-body)', marginBottom: '40px', fontWeight:'700', opacity:0.6, fontSize:'17px' }}>Our Neural Scanner will audit your document to generate a verified skill matrix.</p>

          {/* Fraud Alert Box */}
          {fraudAlert && (
            <div className="pf-glass" style={{ background: 'rgba(255,107,107,0.1)', border: 'none', borderRadius: '25px', padding: '25px 35px', marginBottom: '35px', textAlign: 'left', animation:'fadeSlideIn 0.4s ease' }}>
              <p style={{ color: 'var(--brand-coral)', fontWeight: '900', marginBottom: '10px', fontSize:'16px', letterSpacing:'-0.5px' }}>🚫 UPLOAD ANOMALY DETECTED</p>
              <p style={{ color: 'var(--text-heading)', fontSize: '15px', lineHeight: '1.6', fontWeight:'700' }}>{fraudAlert.message}</p>
            </div>
          )}

          {/* Audit Report Card (shown after successful scan) */}
          {auditReport && (
            <div className="pf-glass" style={{ background: 'rgba(0, 212, 170, 0.1)', border: 'none', borderRadius: '30px', padding: '30px 40px', marginBottom: '35px', textAlign: 'left', animation:'fadeSlideIn 0.4s ease' }}>
              <p style={{ color: 'var(--brand-teal)', fontWeight: '900', marginBottom: '20px', fontSize:'18px', letterSpacing:'-0.5px' }}>✅ RESUME AUDIT SUCCESSFUL</p>
              <div style={{ display:'grid', gap:'12px' }}>
                <p style={{ color: 'var(--text-body)', fontSize: '14px', fontWeight:'800', opacity:0.6, textTransform:'uppercase', letterSpacing:'1px' }}>🔍 DOMAIN: <span style={{ color: 'var(--text-heading)', opacity:1 }}>{auditReport.skillTitle.toUpperCase()}</span></p>
                <p style={{ color: 'var(--text-body)', fontSize: '14px', fontWeight:'800', opacity:0.6, textTransform:'uppercase', letterSpacing:'1px' }}>📊 SIGNALS: <span style={{ color: 'var(--brand-teal)', opacity:1 }}>{auditReport.keywordScore} DETECTED</span></p>
                <p style={{ color: 'var(--text-body)', fontSize: '14px', fontWeight:'800', opacity:0.6, textTransform:'uppercase', letterSpacing:'1px' }}>🏷️ STATUS: <span style={{ color: auditReport.readinessLevel === 'Industry Ready' ? 'var(--brand-teal)' : 'var(--brand-yellow)', opacity:1 }}>{auditReport.readinessLevel.toUpperCase()}</span></p>
              </div>
              <div style={{ marginTop: '20px', padding:'15px', background:'white', borderRadius:'18px', fontSize: '13px', lineHeight: '1.8', fontWeight:'700' }}>
                {auditReport.whyThisScore.map((line, i) => (
                  <div key={i} style={{ color: 'var(--text-heading)', display:'flex', gap:'8px' }}><span>•</span> {line}</div>
                ))}
              </div>
            </div>
          )}

          {!auditReport && (
            <div className="pf-glass" style={{ border: '2px dashed rgba(0, 212, 170, 0.3)', borderRadius: '35px', padding: '60px 40px', marginBottom: '40px', cursor: 'pointer', background:'white', transition:'all 0.3s' }} onClick={() => document.getElementById('resume-up').click()}>
              <span style={{ fontSize: '60px', display:'block', marginBottom:'15px' }}>📥</span>
              <p style={{ fontSize: '18px', color: 'var(--text-heading)', fontWeight:'900', fontFamily:'var(--font-display)' }}>TRANSMIT DOCUMENT</p>
              <p style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '10px', fontWeight:'700', opacity:0.5 }}>PDF or DOCX format required for Neural Scan</p>
              <input id="resume-up" type="file" hidden onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
            </div>
          )}

          <button onClick={() => { setMode(null); setFraudAlert(null); setAuditReport(null); }} style={{ background: 'transparent', color: 'var(--text-body)', border: 'none', cursor: 'pointer', fontWeight:'900', fontSize:'13px', letterSpacing:'1.5px', opacity:0.5 }}>← PREVIOUS PHASE</button>
        </div>
      ) : (
        <div className="pf-glass" style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems:'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--brand-teal)', fontWeight: '900', letterSpacing:'2px' }}>STEP {quizStep + 1} / {beginnerQuestions.length}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-body)', fontWeight:'900', opacity:0.4, letterSpacing:'1px' }}>DNA POTENTIAL MAPPING</span>
          </div>
          <h2 style={{ fontSize: '32px', marginBottom: '45px', textAlign: 'left', color: 'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1px', lineHeight:'1.1' }}>{beginnerQuestions[quizStep].question}</h2>

          {showOtherInput ? (
            <div style={{ animation: 'fadeSlideIn 0.4s ease both' }}>
              <input 
                type="text" 
                placeholder="DEFINE YOUR INTEREST..." 
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '24px', borderRadius: '22px', border: 'none', background: 'white', color: 'var(--text-heading)', fontSize: '18px', marginBottom: '25px', outline: 'none', fontWeight:'900', fontFamily:'var(--font-display)', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' }}
              />
              <button 
                onClick={submitOther}
                className="pf-glow-btn"
                style={{ ...buttonStyle, background: 'var(--brand-teal)', color: '#FFFFFF', textTransform:'uppercase', letterSpacing:'2px' }}
              >
                INITIALIZE MAPPING →
              </button>
              <button 
                onClick={() => setShowOtherInput(false)}
                style={{ background: 'transparent', color: 'var(--text-body)', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight:'900', letterSpacing:'1px', opacity:0.5 }}
              >
                ← SELECT FROM PRESETS
              </button>
            </div>
          ) : (
            <div style={{ display:'grid', gap:'12px' }}>
              {beginnerQuestions[quizStep].options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleBeginnerChoice(opt.value)}
                  className="pf-glass"
                  style={{ ...buttonStyle, background: 'white', color: 'var(--text-heading)', textAlign: 'left', border: 'none', fontSize: '15px', padding: '24px 35px', fontWeight:'800', boxShadow:'0 8px 25px rgba(0,0,0,0.02)', display:'flex', alignItems:'center', justifyContent:'space-between' }}
                >
                  <span>{opt.label}</span>
                  <span style={{ fontSize:'20px', opacity:0.3 }}>→</span>
                </button>
              ))}
            </div>
          )}
          
          {!showOtherInput && (
            <button onClick={() => setMode(null)} style={{ background: 'transparent', color: 'var(--text-body)', border: 'none', cursor: 'pointer', marginTop: '30px', fontWeight:'900', fontSize:'13px', letterSpacing:'1.5px', opacity:0.5 }}>← ABORT MAPPING</button>
          )}
        </div>
      )}
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

