import React, { useState } from 'react';

export default function RewardHub({ userData, onBack }) {
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
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '30px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)'
  };

  if (showSandbox) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: 'white', padding: '40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '24px', color: '#8E44AD' }}>💎 Gemini Pro Premium Sandbox</h1>
            <button onClick={() => setShowSandbox(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px' }}>Exit Sandbox</button>
          </div>
          <div style={{ height: '500px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid #8E44AD', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div>
                <div style={{ fontSize: '40px', marginBottom: '10px', textAlign: 'center' }}>✨</div>
                <p>Welcome to the Premium Sandbox. Your Gemini Pro access is active for 24 hours.</p>
                <p style={{ fontSize: '12px' }}>Ask advanced architectural questions or request deep code refactoring.</p>
              </div>
            </div>
            <input placeholder="Ask Gemini Pro anything..." style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', padding: '60px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>🏆 Reward Hub</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(142,68,173,0.1))', border: '1px solid rgba(255,107,53,0.3)', marginBottom: '30px' }}>
              <div style={{ fontSize: '14px', color: '#FF6B35', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Available PathTokens</div>
              <div style={{ fontSize: '64px', fontWeight: '900', color: 'white' }}>{availableTokens}</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Earned from Project Audits & Learning Modules</p>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px', textAlign: 'left' }}>Unlock Premium Rewards</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>✨ Gemini Pro Access (24h)</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Advanced AI coding assistant</div>
                </div>
                <button 
                  onClick={handleRedeem}
                  disabled={availableTokens < 10 || redeeming}
                  style={{ background: availableTokens >= 10 ? '#8E44AD' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {redeeming ? 'Unlocking...' : '10 Tokens'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', opacity: 0.6 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>💼 Priority Shortlist</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Direct referral to partner companies</div>
                </div>
                <button disabled style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold' }}>50 Tokens</button>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', textAlign: 'left' }}>How to earn tokens?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { activity: "Complete a Learning Module", reward: "+5 Tokens", icon: "📘" },
                { activity: "High-Depth Project Audit", reward: "+10-15 Tokens", icon: "🚀" },
                { activity: "Pass Industry Assessment", reward: "+20 Tokens", icon: "🎯" },
                { activity: "Help others in Community", reward: "+2 Tokens", icon: "🤝" }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px' }}>{item.icon}</div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.activity}</div>
                    <div style={{ fontSize: '12px', color: '#FF6B35' }}>{item.reward}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
