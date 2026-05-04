import React, { useState } from 'react';

export default function IndustryDashboard({ onBack }) {
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
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr',
    alignItems: 'center',
    transition: 'all 0.2s',
    cursor: 'pointer'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0c', color: 'white', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>🏢 Industry Talent Dashboard</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Hire pre-vetted candidates with verified "Proof of Work" scores.</p>
          </div>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>Exit Dashboard</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
          <input 
            placeholder="Search by name, role, or skill (e.g. 'React', 'Fast Learner')..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6B35', fontWeight: 'bold' }}>
            {candidates.length} Verified Talents
          </div>
          <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2ECC71', fontWeight: 'bold' }}>
            5 Hiring Partners
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr', padding: '0 20px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            <span>Candidate</span>
            <span>Skills & Tech Stack</span>
            <span>Employability</span>
            <span>Proof Score</span>
            <span>Status</span>
          </div>

          {filtered.map((c) => (
            <div key={c.id} style={cardStyle} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{c.role}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {c.skills.map(s => <span key={s} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>{s}</span>)}
              </div>

              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FF6B35' }}>{c.velocity}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Learning Pace</div>
              </div>

              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{c.score}%</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{c.tokens} Tokens Earned</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', background: c.status.includes('Top') ? 'rgba(142,68,173,0.2)' : 'rgba(46,204,113,0.2)', color: c.status.includes('Top') ? '#9B59B6' : '#2ECC71', padding: '6px 12px', borderRadius: '12px', border: `1px solid ${c.status.includes('Top') ? '#9B59B6' : '#2ECC71'}50`, fontWeight: 'bold' }}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
              No candidates found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
