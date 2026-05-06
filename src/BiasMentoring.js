import React, { useState, useEffect, useRef } from 'react';

const mockMentors = [
  { id: 'm1', expertise: ['React', 'Node.js', 'System Design'], exp: '5+ years', style: 'Practical & Project-driven', match: 98, bio: 'Focuses on real-world application building and code reviews.' },
  { id: 'm2', expertise: ['DSA', 'Algorithms', 'Python'], exp: '3+ years', style: 'Structured & Deep Dive', match: 92, bio: 'Helps you build a strong foundation in core concepts.' },
  { id: 'm3', expertise: ['UI/UX', 'CSS', 'Frontend'], exp: '4+ years', style: 'Visual & Interactive', match: 89, bio: 'Specializes in pixel-perfect designs and animations.' },
];

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

export default function BiasMentoring({ userData, onBack, theme = defaultTheme }) {
  const [view, setView] = useState('intro'); // intro, quiz, matching, list, chat
  const [quizStep, setQuizStep] = useState(0);
  const [preferences, setPreferences] = useState({});
  const [matchedMentors, setMatchedMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const quizQuestions = [
    { key: 'need', question: 'What do you need help with most?', options: ['Code Review', 'Career Advice', 'Interview Prep', 'Project Guidance'] },
    { key: 'style', question: 'How do you learn best?', options: ['Visuals & Diagrams', 'Hands-on Coding', 'Reading Docs', 'Video Tutorials'] },
    { key: 'comm', question: 'Preferred communication style?', options: ['Detailed Explanations', 'Quick Tips & Hints', 'Structured Roadmap', 'Casual Chat'] },
    { key: 'avail', question: 'When are you mostly available?', options: ['Weekdays Morning', 'Weekdays Evening', 'Weekends Only', 'Flexible'] }
  ];

  const handleQuizSelect = (key, val) => {
    setPreferences({ ...preferences, [key]: val });
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setView('matching');
      setTimeout(() => {
        setMatchedMentors(mockMentors);
        setView('list');
      }, 2500); // Simulate AI matching
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are an expert AI mentor specializing in ${selectedMentor.expertise.join(', ')}. Mentoring style: ${selectedMentor.style}. Give concise, practical advice.` },
            ...chatMessages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: msg }
          ],
          model: 'openai'
        }),
      });
      
      if (!response.ok) {
        throw new Error('API Error: 502 Bad Gateway or server issue');
      }
      
      const text = await response.text();
      setChatMessages(prev => [...prev, { role: 'bot', text }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'bot', text: 'Sorry, the AI mentor is currently experiencing high traffic. Please try asking again!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const containerStyle = { minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', padding: '80px 20px', fontFamily: 'var(--font-main)' };
  const cardStyle = { padding: '60px', maxWidth: '1000px', margin: '0 auto', animation: 'pf-fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent:'space-between', marginBottom: '80px' }}>
        <button onClick={() => view === 'chat' ? setView('list') : onBack()} className="pf-glass" style={{ border: 'none', color: 'var(--text-body)', padding: '16px 35px', borderRadius: '25px', cursor: 'pointer', fontWeight:'900', letterSpacing:'1.5px', fontSize:'13px', textTransform:'uppercase' }}>BACK</button>
        <h1 className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', margin: 0, fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>🎯 Bias-Free Mentoring</h1>
      </div>

      {view === 'intro' && (
        <div className="pf-glass" style={{ ...cardStyle, textAlign: 'center', background:'white !important', borderRadius:'50px', boxShadow:'0 40px 100px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '30px', fontFamily:'var(--font-display)', color:'var(--text-heading)', letterSpacing:'-3px', lineHeight:1.1 }}>Find the Right Mentor, <span className="pf-shimmer-text">Without Bias</span></h2>
          <p style={{ fontSize: '22px', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '60px', fontWeight:'700', maxWidth:'850px', margin:'0 auto 60px' }}>
            We match you purely based on skill gaps, experience, and goals. No photos, no identity markers — just pure expertise alignment.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '70px' }}>
            {['No Identity Markers', 'Skill-Based Matching', 'AI-Powered Connections'].map((text, i) => (
              <div key={i} className="pf-glass" style={{ background: 'rgba(0, 212, 170, 0.03) !important', border: 'none !important', padding: '35px', borderRadius: '30px', color: 'var(--brand-teal)', fontWeight: '900', fontSize:'16px', letterSpacing:'1.5px', textTransform:'uppercase', boxShadow:'0 10px 30px rgba(0, 212, 170, 0.05)' }}>✓ {text}</div>
            ))}
          </div>
          <button onClick={() => setView('quiz')} className="pf-glow-btn" style={{ border: 'none', padding: '25px 80px', borderRadius: '45px', fontSize: '22px', fontWeight: '900', cursor: 'pointer', textTransform:'uppercase', letterSpacing:'2.5px' }}>Start Matching Quiz 🚀</button>
        </div>
      )}
      {view === 'quiz' && (
        <div className="pf-glass" style={{ ...cardStyle, textAlign: 'center', background:'white !important', borderRadius:'50px', boxShadow:'0 40px 100px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '50px' }}>
            {quizQuestions.map((_, i) => (
               <div key={i} style={{ height: '12px', width: '80px', borderRadius: '6px', background: i <= quizStep ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)', boxShadow: i <= quizStep ? '0 0 25px rgba(0, 212, 170, 0.4)' : 'none', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontWeight:'900', fontSize:'15px', letterSpacing:'2px', textTransform:'uppercase' }}>Step {quizStep + 1} of {quizQuestions.length}</p>
          <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '70px', fontFamily:'var(--font-display)', color:'var(--text-heading)', letterSpacing:'-2px' }}>{quizQuestions[quizStep].question}</h2>
          <div style={{ display: 'grid', gap: '25px', maxWidth: '700px', margin: '0 auto' }}>
            {quizQuestions[quizStep].options.map((opt, i) => (
              <button key={i} onClick={() => handleQuizSelect(quizQuestions[quizStep].key, opt)} className="pf-glass quiz-option-card" style={{ background: 'white !important', border: 'none !important', padding: '35px', borderRadius: '30px', color: 'var(--text-heading)', fontSize: '20px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow:'0 15px 40px rgba(0,0,0,0.03) !important' }}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {view === 'matching' && (
        <div className="pf-glass" style={{ ...cardStyle, textAlign: 'center', padding: '150px 20px', background:'white !important', borderRadius:'50px', boxShadow:'0 40px 100px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '120px', animation: 'pf-pulse 1.5s infinite', display: 'inline-block' }}>🤖</div>
          <h2 className="pf-shimmer-text" style={{ marginTop: '60px', fontSize: '48px', fontWeight:'900', fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>Analyzing Profile & Preferences...</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '25px', fontSize:'24px', fontWeight:'700' }}>Finding the perfect mentor matches based on pure skill alignment.</p>
        </div>
      )}

      {view === 'list' && (
        <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '60px', fontSize: '48px', fontWeight:'900', fontFamily:'var(--font-display)', color:'var(--text-heading)', letterSpacing:'-2px' }}>Your Top Matches ✨</h2>
          <div style={{ display: 'grid', gap: '35px' }}>
            {matchedMentors.map((mentor, i) => (
              <div key={i} className="pf-glass mentor-card" style={{ display: 'flex', gap: '50px', alignItems: 'center', padding: '50px', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer', background:'white !important', border:'none', borderRadius:'45px', boxShadow:'0 30px 80px rgba(0,0,0,0.04)' }}>
                <div className="pf-glass" style={{ width: '140px', height: '140px', borderRadius: '45px', background: 'rgba(0, 212, 170, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', border:'none', boxShadow:'0 20px 50px rgba(0, 212, 170, 0.12)' }}>🎭</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom:'20px' }}>
                    <h3 style={{ margin: 0, fontSize: '32px', fontWeight:'900', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>Anonymous Mentor #{i+1}</h3>
                    <div className="pf-shimmer-text" style={{ background: 'white', padding: '12px 30px', borderRadius: '25px', fontSize: '16px', fontWeight: '900', boxShadow:'0 15px 35px rgba(0,0,0,0.06)' }}>{mentor.match}% Match</div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                    {mentor.expertise.map((exp, j) => <span key={j} className="pf-glass" style={{ background: 'rgba(0,0,0,0.02) !important', padding: '10px 22px', borderRadius: '15px', fontSize: '14px', fontWeight:'900', color:'var(--text-heading)', border:'none !important' }}>{exp}</span>)}
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '18px', fontWeight:'800', opacity:0.8 }}>{mentor.exp} • {mentor.style}</p>
                </div>
                <button onClick={() => { setSelectedMentor(mentor); setChatMessages([{ role: 'bot', text: `Hello! I'm your AI Mentor matched to your profile. Let's discuss your goals around ${mentor.expertise.join(', ')}.` }]); setView('chat'); }} className="pf-glow-btn" style={{ border: 'none', padding: '22px 55px', borderRadius: '30px', fontWeight: '900', cursor: 'pointer', fontSize: '16px', textTransform:'uppercase', letterSpacing:'2px' }}>Connect</button>
              </div>
            ))}
          </div>
        </div>
      )}


      {view === 'chat' && selectedMentor && (
        <div className="pf-glass" style={{ ...cardStyle, height: '80vh', display: 'flex', flexDirection: 'column', padding: '50px', background:'white !important', borderRadius:'50px', boxShadow:'0 40px 100px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '40px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
              <div className="pf-glass" style={{ width: '75px', height: '75px', borderRadius: '25px', background: 'rgba(0, 212, 170, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', border:'none' }}>🎭</div>
              <div>
                <div style={{ fontWeight: '900', fontSize: '26px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>Anonymous Mentor Session</div>
                <div style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '6px', fontWeight:'800' }}>{selectedMentor.expertise.join(' • ')}</div>
              </div>
            </div>
            <div style={{ color: 'var(--brand-teal)', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '12px 30px', borderRadius: '30px', boxShadow:'0 15px 35px rgba(0,0,0,0.06)' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--brand-teal)', boxShadow: '0 0 20px var(--brand-teal)', animation:'pf-pulse 1.5s infinite' }}/> LIVE SESSION</div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px', paddingRight: '25px', scrollPaddingBottom: '50px' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'var(--brand-teal)' : 'rgba(0,0,0,0.02)', border: 'none', padding: '25px 35px', borderRadius: msg.role === 'user' ? '35px 35px 4px 35px' : '35px 35px 35px 4px', maxWidth: '75%', lineHeight: '1.8', fontSize: '18px', color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-heading)', fontWeight:'700', boxShadow: msg.role === 'user' ? '0 20px 45px rgba(0, 212, 170, 0.25)' : 'none', animation:'pf-fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="pf-glass" style={{ alignSelf: 'flex-start', background: 'rgba(0,0,0,0.02) !important', padding: '20px 35px', borderRadius: '35px 35px 35px 4px', color: 'var(--brand-teal)', fontWeight: '900', display: 'flex', gap: '10px', border:'none' }}>
               <span style={{ animation: 'pf-pulse 1s infinite' }}>.</span><span style={{ animation: 'pf-pulse 1s infinite 0.2s' }}>.</span><span style={{ animation: 'pf-pulse 1s infinite 0.4s' }}>.</span>
            </div>}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: '25px', marginTop: '50px', background:'rgba(0,0,0,0.02)', padding:'12px', borderRadius:'35px' }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask your mentor anything..." disabled={isTyping} style={{ flex: 1, background: 'white', border: 'none', padding: '25px 40px', borderRadius: '30px', color: 'var(--text-heading)', outline: 'none', fontSize: '18px', fontWeight:'700', fontFamily:'var(--font-main)', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' }} />
            <button onClick={handleSendMessage} disabled={isTyping} className={isTyping ? "" : "pf-glow-btn"} style={{ background: isTyping ? 'rgba(0,0,0,0.05)' : 'var(--brand-teal)', border: 'none', color: '#FFFFFF', padding: '0 55px', borderRadius: '30px', fontWeight: '900', cursor: 'pointer', fontSize: '17px', textTransform:'uppercase', letterSpacing:'2px' }}>SEND</button>
          </div>
        </div>
      )}
      <style>{`
        .quiz-option-card:hover { transform: translateY(-8px); border: none !important; box-shadow: 0 30px 60px rgba(0, 212, 170, 0.12) !important; color: var(--brand-teal); }
        .mentor-card:hover { transform: translateY(-12px); box-shadow: 0 50px 120px rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  );
}
