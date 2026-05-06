import React, { useState } from 'react';

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

export default function RewardHub({ userData, onBack, theme = defaultTheme }) {
  const [redeeming, setRedeeming] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  
  // Calculate tokens from scores and modules
  const projectScore = userData?.projectAuditScore || 0;
  const modulesDone = userData?.learningProgress?.completedCount || 0;
  const totalTokens = Math.floor(projectScore / 10) + (modulesDone * 5);
  const tokensUsed = userData?.tokensUsed || 0;
  const availableTokens = totalTokens - tokensUsed;

  const handleRedeem = () => {
    if (availableTokens < 10) return;
    setRedeeming(true);
    setTimeout(() => {
      setRedeeming(false);
      setShowSandbox(true);
    }, 2000);
  };

  const cardStyle = {
    padding: '40px',
    textAlign: 'center',
    animation: 'fadeUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) both'
  };

  if (showSandbox) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', padding: '80px 20px', fontFamily:'var(--font-main)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
            <h1 className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', fontFamily:'var(--font-display)', letterSpacing:'-2px', margin: 0 }}>💎 Gemini Pro Premium Sandbox</h1>
            <button onClick={() => setShowSandbox(false)} className="pf-glass" style={{ border: 'none', color: 'var(--text-body)', padding: '16px 35px', borderRadius: '25px', fontWeight:'900', cursor:'pointer', letterSpacing:'1.5px', textTransform:'uppercase' }}>EXIT SANDBOX</button>
          </div>
          <div className="pf-glass" style={{ height: '650px', borderRadius: '40px', padding: '50px', display: 'flex', flexDirection: 'column', background:'white !important', border:'none', boxShadow:'0 40px 100px rgba(0, 212, 170, 0.15)' }}>
            <div style={{ flex: 1, color: 'var(--text-body)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize: '80px', marginBottom: '30px', animation: 'float 3s ease-in-out infinite' }}>✨</div>
                <h3 style={{ fontSize: '32px', fontWeight: '900', color:'var(--text-heading)', marginBottom:'20px', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>Premium AI Access Active</h3>
                <p style={{ fontSize: '20px', fontWeight:'700', color:'var(--text-body)', opacity:0.8 }}>Your Gemini Pro access is active for the next 24 hours.</p>
                <p style={{ fontSize: '15px', marginTop:'15px', opacity:0.5, fontWeight:'600' }}>Ask advanced architectural questions or request deep code refactoring.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', background:'rgba(0,0,0,0.02)', padding:'10px', borderRadius:'35px' }}>
              <input 
                placeholder="Ask Gemini Pro anything..." 
                style={{ flex: 1, padding: '25px 35px', borderRadius: '28px', border: 'none', background: 'white', color: 'var(--text-heading)', fontSize:'18px', fontWeight:'700', outline:'none', fontFamily:'var(--font-main)', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' }} 
              />
              <button className="pf-glow-btn" style={{ padding: '0 50px', borderRadius: '28px', border:'none', color:'white', fontWeight:'900', fontSize:'14px', letterSpacing:'2px' }}>SEND</button>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-25px); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', padding: '80px 20px', fontFamily: 'var(--font-main)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '60px' }}>
          <button onClick={onBack} className="pf-glass" style={{ border: 'none', color: 'var(--text-body)', padding: '16px 35px', borderRadius: '25px', cursor: 'pointer', fontWeight:'900', letterSpacing:'1.5px', textTransform:'uppercase' }}>BACK</button>
          <h1 className="pf-shimmer-text" style={{ fontSize: '48px', fontWeight: '900', fontFamily:'var(--font-display)', letterSpacing:'-2px', margin: 0 }}>🏆 Reward Hub</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
            <div className="pf-glass" style={{ ...cardStyle, background: 'white !important', border: 'none', boxShadow:'0 40px 100px rgba(0, 212, 170, 0.12)', borderRadius:'50px' }}>
              <div style={{ fontSize: '15px', color: 'var(--brand-teal)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '20px', letterSpacing:'3px' }}>Available PathTokens</div>
              <div style={{ fontSize: '100px', fontWeight: '900', color: 'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-5px', lineHeight:1 }}>{availableTokens}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '17px', fontWeight:'700', marginTop:'20px' }}>Earned from Project Audits & Learning Modules</p>
            </div>

            <div className="pf-glass" style={{ ...cardStyle, background:'white !important', borderRadius:'50px', boxShadow:'0 30px 80px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '40px', textAlign: 'left', fontWeight:'900', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>Unlock Premium Rewards</h3>
              <div className="pf-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px', background: 'rgba(0,0,0,0.015) !important', borderRadius: '30px', border: 'none', marginBottom: '25px', transition:'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '900', fontSize: '20px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.2px' }}>✨ Gemini Pro Access (24h)</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight:'700', opacity:0.7, marginTop:'6px' }}>Advanced AI coding assistant</div>
                </div>
                <button 
                  onClick={handleRedeem}
                  disabled={availableTokens < 10 || redeeming}
                  className={availableTokens >= 10 && !redeeming ? "pf-glow-btn" : ""}
                  style={{ background: availableTokens >= 10 ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)', color: availableTokens >= 10 ? '#FFFFFF' : 'var(--text-muted)', border: 'none', padding: '16px 30px', borderRadius: '20px', fontWeight: '900', cursor: availableTokens >= 10 ? 'pointer' : 'not-allowed', fontSize:'13px', textTransform:'uppercase', letterSpacing:'1px' }}
                >
                  {redeeming ? 'UNLOCKING...' : '10 TOKENS'}
                </button>
              </div>

              <div className="pf-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px', background: 'rgba(0,0,0,0.01) !important', borderRadius: '30px', border: 'none', opacity: 0.5 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '900', fontSize: '20px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.2px' }}>💼 Priority Shortlist</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight:'700', marginTop:'6px' }}>Direct referral to partner companies</div>
                </div>
                <button disabled style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', border: 'none', padding: '16px 30px', borderRadius: '20px', fontWeight: '900', fontSize:'13px', textTransform:'uppercase', letterSpacing:'1px' }}>50 TOKENS</button>
              </div>
            </div>
          </div>

          <div className="pf-glass" style={{ ...cardStyle, background:'white !important', borderRadius:'50px', boxShadow:'0 30px 80px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '40px', textAlign: 'left', fontWeight:'900', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>How to earn tokens?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {[
                { activity: "Complete a Learning Module", reward: "+5 Tokens", icon: "📘" },
                { activity: "High-Depth Project Audit", reward: "+10-15 Tokens", icon: "🚀" },
                { activity: "Pass Industry Assessment", reward: "+20 Tokens", icon: "🎯" },
                { activity: "Help others in Community", reward: "+2 Tokens", icon: "🤝" }
              ].map((item, i) => (
                <div key={i} className="pf-glass" style={{ display: 'flex', alignItems: 'center', gap: '25px', padding: '25px', background: 'rgba(0,0,0,0.015) !important', borderRadius: '30px', border:'none', transition:'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <div style={{ width:'70px', height:'70px', background:'white', borderRadius:'22px', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '36px', boxShadow:'0 10px 25px rgba(0,0,0,0.05)' }}>{item.icon}</div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.2px' }}>{item.activity}</div>
                    <div style={{ fontSize: '15px', color: 'var(--brand-teal)', fontWeight:'900', marginTop:'6px', letterSpacing:'0.5px' }}>{item.reward}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .pf-glass:hover { transform: translateY(-5px); box-shadow: 0 40px 100px rgba(0,0,0,0.06) !important; }
      `}</style>
    </div>
  );
}
