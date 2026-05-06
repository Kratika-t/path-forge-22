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

export default function IndustryDashboard({ onBack, theme = defaultTheme }) {
  const [search, setSearch] = useState('');

  // Mock data for the "Talent Marketplace"
  const candidates = [
    { id: 1, name: "Arjun Sharma", role: "Frontend Developer", score: 94, tokens: 120, skills: ["React", "TypeScript", "Tailwind"], status: "Ready to Interview", velocity: "Fast Learner" },
    { id: 2, name: "Priya Patel", role: "Data Scientist", score: 88, tokens: 95, skills: ["Python", "Pandas", "Scikit-Learn"], status: "Project Verified", velocity: "Consistent" },
    { id: 3, name: "Rahul Verma", role: "Backend Developer", score: 91, tokens: 110, skills: ["Node.js", "MongoDB", "Docker"], status: "Ready to Interview", velocity: "Fast Learner" },
    { id: 4, name: "Sneha Reddy", role: "UI/UX Designer", score: 85, tokens: 70, skills: ["Figma", "Adobe XD", "User Research"], status: "Foundations Complete", velocity: "Consistent" },
    { id: 5, name: "Vikram Singh", role: "Cyber Security", score: 92, tokens: 130, skills: ["Ethical Hacking", "Kali Linux", "Python"], status: "Top 1% Talent", velocity: "Expert Depth" },
  ];

  const filtered = candidates.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.role.toLowerCase().includes(search.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '16px',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1.2fr',
    alignItems: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', padding: '80px 20px', fontFamily: 'var(--font-main)' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
          <div>
            <h1 className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', marginBottom: '15px', fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>🏢 Industry Talent Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight:'700', opacity:0.8 }}>Hire pre-vetted candidates with verified "Proof of Work" scores.</p>
          </div>
          <button onClick={onBack} className="pf-glass" style={{ border: 'none', color: 'var(--text-body)', padding: '16px 35px', borderRadius: '25px', cursor: 'pointer', fontWeight:'900', letterSpacing:'1.5px', textTransform:'uppercase' }}>EXIT DASHBOARD</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '25px', marginBottom: '50px' }}>
          <div style={{ position:'relative' }}>
            <input 
              placeholder="Search by name, role, or skill (e.g. 'React', 'Fast Learner')..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pf-glass"
              style={{ padding: '25px 35px', borderRadius: '30px', border: 'none', background: 'white !important', color: 'var(--text-heading)', width: '100%', boxSizing: 'border-box', fontSize:'18px', fontWeight:'700', outline:'none', fontFamily:'var(--font-main)', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' }} 
            />
            <span style={{ position:'absolute', right:'30px', top:'50%', transform:'translateY(-50%)', fontSize:'24px', opacity:0.3 }}>🔍</span>
          </div>
          <div className="pf-glass" style={{ background: 'white !important', border: 'none', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-teal)', fontWeight: '900', fontSize:'15px', letterSpacing:'1px', boxShadow:'0 10px 30px rgba(0, 212, 170, 0.08)' }}>
            {candidates.length} VERIFIED TALENTS
          </div>
          <div className="pf-glass" style={{ background: 'white !important', border: 'none', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-yellow)', fontWeight: '900', fontSize:'15px', letterSpacing:'1px', boxShadow:'0 10px 30px rgba(245, 166, 35, 0.08)' }}>
            5 HIRING PARTNERS
          </div>
        </div>

        <div className="pf-glass" style={{ padding: '40px', background:'white !important', borderRadius:'50px', border:'none', boxShadow:'0 40px 100px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr 1.2fr', padding: '0 30px 25px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1.5px', opacity:0.5 }}>
            <span>Candidate</span>
            <span>Skills & Tech Stack</span>
            <span>Employability</span>
            <span>Proof Score</span>
            <span>Status</span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
            {filtered.map((c) => (
              <div key={c.id} className="pf-glass talent-row" style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="pf-glass" style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border:'none' }}>👤</div>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '18px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>{c.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight:'800', marginTop:'4px' }}>{c.role}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {c.skills.map(s => <span key={s} className="pf-glass" style={{ fontSize: '12px', background: 'rgba(0, 212, 170, 0.05) !important', padding: '8px 16px', borderRadius: '12px', border: 'none', fontWeight:'900', color:'var(--brand-teal)', letterSpacing:'0.5px' }}>{s}</span>)}
                </div>

                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--brand-teal)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>{c.velocity}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight:'700', marginTop:'4px' }}>Learning Pace</div>
                </div>

                <div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>{c.score}%</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight:'700', marginTop:'4px' }}>{c.tokens} Tokens Earned</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="pf-glass" style={{ fontSize: '12px', background: 'var(--brand-teal)', color: 'white', padding: '10px 20px', borderRadius: '18px', border: 'none', fontWeight: '900', letterSpacing:'1px', textTransform:'uppercase', boxShadow:'0 8px 20px rgba(0, 212, 170, 0.2)' }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '120px', color: 'var(--text-muted)', fontWeight:'900', fontSize:'22px', opacity:0.3, fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>
              No candidates found matching your criteria.
            </div>
          )}
        </div>
      </div>
      <style>{`
        .talent-row:hover { background: white !important; transform: scale(1.02) translateX(10px); box-shadow: 0 30px 70px rgba(0,0,0,0.06) !important; z-index: 10; }
        .talent-row { position: relative; }
      `}</style>
    </div>
  );
}
