import React, { useState, useEffect, useRef } from 'react';

const mockMentors = [
  { id: 'm1', expertise: ['React', 'Node.js', 'System Design'], exp: '5+ years', style: 'Practical & Project-driven', match: 98, bio: 'Focuses on real-world application building and code reviews.' },
  { id: 'm2', expertise: ['DSA', 'Algorithms', 'Python'], exp: '3+ years', style: 'Structured & Deep Dive', match: 92, bio: 'Helps you build a strong foundation in core concepts.' },
  { id: 'm3', expertise: ['UI/UX', 'CSS', 'Frontend'], exp: '4+ years', style: 'Visual & Interactive', match: 89, bio: 'Specializes in pixel-perfect designs and animations.' },
];

export default function BiasMentoring({ userData, onBack }) {
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

  const containerStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', padding: '30px 20px', fontFamily: 'Arial, sans-serif' };
  const cardStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '30px', maxWidth: '800px', margin: '0 auto' };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
        <button onClick={() => view === 'chat' ? setView('list') : onBack()} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>
        <h1 style={{ color: '#FF6B35', fontSize: '24px', margin: 0 }}>🎯 Bias-Free Mentoring</h1>
      </div>

      {view === 'intro' && (
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Find the Right Mentor, <span style={{ color: '#FF6B35' }}>Without Bias</span></h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '30px' }}>
            We match you purely based on skill gaps, experience, and goals. No photos, no college tags, no names — just pure expertise alignment.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {['No Identity Markers', 'Skill-Based Matching', 'AI-Powered Connections'].map((text, i) => (
              <div key={i} style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', padding: '16px', borderRadius: '12px', color: '#FF6B35', fontWeight: 'bold' }}>✓ {text}</div>
            ))}
          </div>
          <button onClick={() => setView('quiz')} style={{ background: '#FF6B35', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Start Matching Quiz 🚀</button>
        </div>
      )}

      {view === 'quiz' && (
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            {quizQuestions.map((_, i) => (
               <div key={i} style={{ height: '6px', width: '40px', borderRadius: '3px', background: i <= quizStep ? '#FF6B35' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>Step {quizStep + 1} of {quizQuestions.length}</p>
          <h2 style={{ fontSize: '28px', marginBottom: '40px' }}>{quizQuestions[quizStep].question}</h2>
          <div style={{ display: 'grid', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
            {quizQuestions[quizStep].options.map((opt, i) => (
              <button key={i} onClick={() => handleQuizSelect(quizQuestions[quizStep].key, opt)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', padding: '20px', borderRadius: '16px', color: 'white', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.border='1px solid #FF6B35'} onMouseLeave={e => e.currentTarget.style.border='1px solid rgba(255,255,255,0.2)'}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {view === 'matching' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '70px', animation: 'pulse 1.5s infinite', display: 'inline-block' }}>🤖</div>
          <h2 style={{ marginTop: '30px', color: '#FF6B35', fontSize: '28px' }}>Analyzing Profile & Preferences...</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>Finding the perfect mentor matches based on pure skill alignment.</p>
        </div>
      )}

      {view === 'list' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '26px' }}>Your Top Matches ✨</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {matchedMentors.map((mentor, i) => (
              <div key={i} style={{ ...cardStyle, display: 'flex', gap: '20px', alignItems: 'center', margin: 0, transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(45deg, #FF6B35, #9B59B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', boxShadow: '0 4px 15px rgba(255,107,53,0.3)' }}>🎭</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Anonymous Mentor #{i+1}</h3>
                    <div style={{ background: 'rgba(46,204,113,0.15)', color: '#2ECC71', padding: '6px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', border: '1px solid rgba(46,204,113,0.3)' }}>{mentor.match}% Match</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {mentor.expertise.map((exp, j) => <span key={j} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>{exp}</span>)}
                  </div>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{mentor.exp} • {mentor.style}</p>
                </div>
                <button onClick={() => { setSelectedMentor(mentor); setChatMessages([{ role: 'bot', text: `Hello! I'm your AI Mentor matched to your profile. Let's discuss your goals around ${mentor.expertise.join(', ')}.` }]); setView('chat'); }} style={{ background: '#FF6B35', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Connect</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'chat' && selectedMentor && (
        <div style={{ ...cardStyle, height: '70vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(45deg, #FF6B35, #9B59B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎭</div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Anonymous Mentor Session</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{selectedMentor.expertise.join(' • ')}</div>
              </div>
            </div>
            <div style={{ color: '#2ECC71', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(46,204,113,0.1)', padding: '6px 12px', borderRadius: '20px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 6px #2ecc71' }}/> Live</div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '10px' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.06)', border: msg.role === 'user' ? '1px solid rgba(255,107,53,0.4)' : '1px solid rgba(255,255,255,0.15)', padding: '14px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', maxWidth: '80%', lineHeight: '1.6', fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.06)', padding: '14px 18px', borderRadius: '18px 18px 18px 4px', color: '#FF6B35', fontWeight: 'bold', display: 'flex', gap: '4px' }}>
               <span style={{ animation: 'pulse 1s infinite' }}>.</span><span style={{ animation: 'pulse 1s infinite 0.2s' }}>.</span><span style={{ animation: 'pulse 1s infinite 0.4s' }}>.</span>
            </div>}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask your mentor anything..." disabled={isTyping} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', padding: '16px', borderRadius: '14px', color: 'white', outline: 'none', fontSize: '15px' }} />
            <button onClick={handleSendMessage} disabled={isTyping} style={{ background: '#FF6B35', border: 'none', color: 'white', padding: '0 28px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Send 🚀</button>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0% { transform: scale(0.9); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.5; } }`}</style>
    </div>
  );
}
