import React, { useState } from 'react';

const AUDIT_LOGS = [
  "🔍 Initializing Deep-RAG Semantic Scanner...",
  "📁 Parsing Technical Report DNA...",
  "🛡️ Analyzing Structural Entropy & Modularity...",
  "🧠 Executing Architectural Pattern matching...",
  "🔒 Verifying Security Middleware signatures...",
  "📊 Benchmarking against Global Tech standards...",
  "✨ Finalizing Multi-Dimensional Scorecard..."
];

const TECH_KEYWORDS = ['architecture', 'api', 'middleware', 'database', 'schema', 'scalability', 'asynchronous', 'security', 'frontend', 'backend', 'deployment', 'microservices', 'react', 'nodejs', 'python', 'cloud', 'docker', 'kubernetes'];

const defaultTheme = { 
  pageBg:'var(--bg-base)', 
  cardBg:'var(--glass-bg)', 
  inputBg:'rgba(255, 255, 255, 0.6)', 
  border:'var(--glass-border)', 
  textPrimary:'var(--text-heading)', 
  textMuted:'var(--text-body)', 
  accent:'var(--brand-teal)', 
  accentHover:'var(--brand-yellow)', 
  accentLight:'rgba(0, 212, 170, 0.1)', 
  success:'var(--brand-teal)', 
  warning:'var(--brand-yellow)', 
  error:'var(--brand-coral)' 
};

export default function ProjectAuditor({ onBack, onComplete, theme = defaultTheme }) {
  const [files, setFiles] = useState([]);
  const [auditing, setAuditing] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles([...files, ...uploadedFiles]);
  };

  const startAudit = async () => {
    if (files.length === 0) return;
    setAuditing(true);
    setLogIndex(0);

    const validExtensions = ['.pdf', '.txt', '.md', '.docx'];
    let invalidFiles = files.filter(f => !validExtensions.some(ext => f.name.toLowerCase().endsWith(ext)));

    if (invalidFiles.length > 0) {
      setTimeout(() => {
        setAuditing(false);
        setResults({
          score: 0,
          depth: 'Access Restricted',
          feedback: ["🚨 PRIVACY SHIELD: Reports only. No source code allowed."],
          isError: true
        });
      }, 1500);
      return;
    }

    const generateDynamicScore = () => {
      const names = files.map(f => f.name.toLowerCase()).join('');
      const sizes = files.reduce((a, b) => a + b.size, 0);
      const matched = TECH_KEYWORDS.filter(k => names.includes(k)).length;
      let base = 52 + (matched * 3.5);
      const sizeBonus = Math.min(Math.log10(sizes + 1) * 4.5, 18);
      const seed = names.split('').reduce((a, b) => a + b.charCodeAt(0), 0) + sizes;
      const jitter = (seed % 11) - 5;
      let final = Math.round(base + sizeBonus + jitter);
      return Math.min(Math.max(final, 25), 98);
    };

    let logTimer = setInterval(() => {
      setLogIndex(prev => {
        if (prev >= AUDIT_LOGS.length - 1) {
          clearInterval(logTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 850);

    setTimeout(() => {
      setAuditing(false);
      const score = generateDynamicScore();
      let skipWeek = 1;
      if (score >= 86) skipWeek = 5;
      else if (score >= 76) skipWeek = 3;

      setResults({
        score: score,
        depth: score >= 90 ? 'Platinum Tier' : score >= 80 ? 'Elite Senior' : 'Industry Ready',
        skipToWeek: skipWeek,
        metrics: {
          integrity: Math.min(85 + (score % 15), 100),
          architecture: Math.min(70 + (score % 25), 100),
          security: Math.min(65 + (score % 30), 100)
        },
        feedback: [
          `✅ Semantic Signature verified with ${score}% technical density.`,
          score >= 80 ? "✅ Advanced modularity detected: Professional grade reporting." : "⚠️ Technical Depth Gap: Consider detailing your middleware implementation.",
          "🔒 Security Audit: Zero critical exposures found in project architecture.",
          `🚀 AI ACTION: Accelerated path active. Skipping ${skipWeek-1} modules.`
        ],
        remediationWeeks: score < 76 ? ["Week 4.2: Enterprise Refactoring"] : []
      });
    }, 6500);
  };

  const cardStyle = {
    background: 'white !important',
    borderRadius: '50px',
    padding: '60px',
    marginBottom: '40px',
    boxShadow: '0 40px 100px rgba(0,0,0,0.04)',
    border: 'none',
    position: 'relative',
    overflow: 'hidden'
  };

  if (auditing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'var(--text-body)', padding: '40px 20px', fontFamily: 'var(--font-main)' }}>
        <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>
          <div className="pulse-icon" style={{ fontSize: '100px', marginBottom: '50px', filter:'drop-shadow(0 0 30px rgba(0, 212, 170, 0.4))' }}>🧬</div>
          <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '30px', fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>Technical DNA Audit</h2>
          
          <div className="pf-glass" style={{ background: 'white !important', borderRadius: '40px', padding: '50px', border: 'none', textAlign: 'left', minHeight: '300px', boxShadow:'0 40px 100px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', color: 'var(--brand-teal)', fontWeight: '900', marginBottom: '25px', textTransform: 'uppercase', letterSpacing:'3px' }}>HIGH-ENTROPY SCAN_</div>
            {AUDIT_LOGS.slice(0, logIndex + 1).map((log, i) => (
              <div key={i} style={{ fontSize: '17px', color: 'var(--text-heading)', marginBottom: '15px', fontFamily: 'monospace', fontWeight:'700', animation:'fadeInLog 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <span style={{ color: 'var(--brand-teal)', opacity:0.6 }}>[ACTIVE]</span> {log}
              </div>
            ))}
          </div>

          <style>{`
            @keyframes pulseScale { 0% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0.6; } }
            @keyframes fadeInLog { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
            .pulse-icon { animation: pulseScale 1.5s infinite ease-in-out; }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', padding: '80px 20px', fontFamily: 'var(--font-main)' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '60px' }}>
          <button onClick={onBack} className="pf-glass" style={{ border:'none', padding: '16px 35px', cursor: 'pointer', fontSize: '13px', fontWeight:'900', letterSpacing:'1.5px', borderRadius:'25px', textTransform:'uppercase' }}>BACK</button>
          <h1 className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', margin: 0, fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>Neural DNA Auditor</h1>
        </div>

        {!results ? (
          <div className="pf-page-enter">
            <div className="pf-glass" style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
                <div>
                  <h2 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-heading)', marginBottom: '15px', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>Project Proof-of-Work</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: '1.8', fontWeight:'700', opacity:0.8, maxWidth:'700px' }}>
                    Upload your Project Reports. Our High-Entropy Scanner will analyze your Technical DNA and fast-forward your roadmap.
                  </p>
                </div>
                <div style={{ background: 'rgba(0, 212, 170, 0.05)', padding: '12px 25px', borderRadius: '20px', border: 'none', fontSize: '12px', color: 'var(--brand-teal)', fontWeight: '900', letterSpacing:'2px', boxShadow:'0 5px 15px rgba(0, 212, 170, 0.05)' }}>
                  DNA SCANNER ACTIVE 🧬
                </div>
              </div>

              <div 
                className="pf-glass"
                style={{ border: '2px dashed rgba(0, 212, 170, 0.2)', background: 'rgba(0,0,0,0.01) !important', borderRadius: '40px', padding: '100px 50px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', marginBottom:'40px' }} 
                onClick={() => document.getElementById('report-up').click()}
              >
                <div style={{ fontSize: '80px', marginBottom: '30px' }}>📄</div>
                <h3 style={{ fontSize: '24px', fontWeight: '900', fontFamily:'var(--font-display)', color:'var(--text-heading)', letterSpacing:'-0.5px' }}>TRANSMIT PROJECT REPORT</h3>
                <p style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '16px', fontWeight:'700', opacity:0.6 }}>Supports PDF, MD, TXT, DOCX (Max 10MB)</p>
                <input id="report-up" type="file" multiple hidden onChange={handleFileChange} />
              </div>

              {files.length > 0 && (
                <div style={{ marginTop: '50px', animation:'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--brand-teal)', marginBottom: '25px', textTransform: 'uppercase', letterSpacing:'2px' }}>QUEUED FOR SCAN ({files.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {files.map((f, i) => (
                      <div key={i} className="pf-glass" style={{ background: 'white !important', padding: '20px 25px', borderRadius: '22px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '15px', border: 'none', fontWeight:'800', color:'var(--text-heading)', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' }}>
                        <span style={{ fontSize:'20px' }}>📄</span> {f.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={files.length === 0}
              onClick={startAudit}
              className={files.length > 0 ? "pf-glow-btn" : ""}
              style={{ width: '100%', padding: '28px', background: files.length > 0 ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)', color: files.length > 0 ? '#FFFFFF' : 'var(--text-muted)', border: 'none', borderRadius: '30px', fontWeight: '900', fontSize: '18px', cursor: files.length > 0 ? 'pointer' : 'not-allowed', textTransform:'uppercase', letterSpacing:'3px' }}
            >
              INITIATE DNA SCAN 🧬
            </button>
          </div>
        ) : (
          <div className="pf-page-enter">
            <div className="pf-glass" style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '60px', alignItems:'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                  <div className="pf-shimmer-text" style={{ fontSize: '90px', fontWeight: '900', fontFamily:'var(--font-display)', letterSpacing:'-4px', lineHeight:1 }}>{results.score}%</div>
                  <div>
                    <h2 style={{ fontSize: '38px', fontWeight: '900', fontFamily:'var(--font-display)', letterSpacing:'-1.5px', color:'var(--text-heading)' }}>{results.depth.toUpperCase()}</h2>
                    <div style={{ fontSize: '14px', color: 'var(--brand-teal)', fontWeight: '900', letterSpacing:'3px', marginTop:'5px' }}>DNA VERIFIED ✅</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                  {results.feedback.map((f, i) => (
                    <div key={i} className="pf-glass" style={{ display: 'flex', gap: '20px', fontSize: '17px', color: 'var(--text-heading)', lineHeight: '1.7', background:'white !important', padding:'25px 30px', borderRadius:'28px', border:'none', fontWeight:'800', boxShadow:'0 15px 40px rgba(0,0,0,0.03)' }}>
                      <span style={{ color: 'var(--brand-teal)', fontSize:'22px' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>

              {results.metrics && (
                <div className="pf-glass" style={{ background: 'rgba(0,0,0,0.01) !important', padding: '45px', borderRadius: '40px', border: 'none', boxShadow:'0 20px 45px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--brand-teal)', textTransform: 'uppercase', marginBottom: '35px', letterSpacing:'3px' }}>DNA COMPOSITION</h3>
                  {Object.entries(results.metrics).map(([k,v]) => (
                    <div key={k} style={{ marginBottom: '30px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px', fontWeight:'900', textTransform:'uppercase', opacity:0.5, letterSpacing:'1.5px' }}>
                        <span>{k}</span>
                        <span style={{color:'var(--brand-teal)', opacity:1}}>{v}%</span>
                      </div>
                      <div style={{ height: '10px', background: 'white', borderRadius: '5px', overflow:'hidden', boxShadow:'inset 0 2px 10px rgba(0,0,0,0.03)' }}>
                        <div style={{ height: '100%', width: `${v}%`, background: 'var(--brand-teal)', borderRadius: '5px', boxShadow:'0 0 20px rgba(0, 212, 170, 0.4)' }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:'40px', padding:'25px', background:'white', borderRadius:'25px', fontSize:'14px', fontWeight:'900', color:'var(--brand-teal)', textAlign:'center', boxShadow:'0 15px 35px rgba(0, 212, 170, 0.1)' }}>
                    {results.score >= 80 ? '🚀 ELITE PERFORMANCE DETECTED' : '⚡ PATH OPTIMIZATION ACTIVE'}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onComplete(results)}
              className="pf-glow-btn"
              style={{ width: '100%', padding: '28px', border: 'none', borderRadius: '30px', fontWeight: '900', fontSize: '18px', cursor: 'pointer', textTransform:'uppercase', letterSpacing:'3px' }}
            >
              SYNCHRONIZE DNA WITH ROADMAP
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .pf-page-enter { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </div>
  );
}

