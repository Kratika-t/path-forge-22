import React, { useMemo, useState, useRef, useEffect } from 'react';

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

export default function AIMentorChat({ skillName, currentModuleTitle, theme = defaultTheme }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hi! I'm your AI Mentor for ${skillName}. Ask me any course doubt, coding question, or career advice. I'm powered by AI and ready to help!`,
    },
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const placeholder = useMemo(() => {
    if (currentModuleTitle) return `Ask about: ${currentModuleTitle}`;
    return 'Ask your doubt here...';
  }, [currentModuleTitle]);

  const systemPrompt = `You are an expert AI mentor helping a student learn ${skillName}. ${currentModuleTitle ? `They are currently studying: ${currentModuleTitle}.` : ''} Give concise, practical, and encouraging answers. Keep responses under 150 words. Use simple language. If they ask about code, give short examples. If they ask career advice, be specific and actionable.`;

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.filter((m) => m.role !== 'bot' || messages.indexOf(m) !== 0).map((m) => ({
              role: m.role === 'bot' ? 'assistant' : 'user',
              content: m.text,
            })),
            { role: 'user', content: trimmed },
          ],
          model: 'openai',
          seed: Math.floor(Math.random() * 10000),
        }),
      });

      if (!response.ok) {
        throw new Error('API Error: 502 Bad Gateway or server issue');
      }

      const text = await response.text();
      setMessages((prev) => [...prev, { role: 'bot', text: text || 'Sorry, I could not generate a response. Please try again.' }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Sorry, the AI mentor is currently experiencing high traffic. Please try asking again!' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="pf-glass chat-container" style={{ padding: '40px', position: 'relative', overflow: 'hidden', borderRadius: '45px', background:'white !important', border:'none', boxShadow:'0 30px 80px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px', borderBottom:'1px solid rgba(0,0,0,0.03)', paddingBottom:'25px' }}>
        <div className="pf-glass" style={{ width:'64px', height:'64px', borderRadius:'20px', background:'rgba(0, 212, 170, 0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '36px', border:'none' }}>🤖</div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing: '-1px' }}>AI Mentor Pulse</div>
          <div style={{ fontSize: '12px', color: 'var(--brand-teal)', fontWeight: '900', opacity: 0.8, textTransform:'uppercase', letterSpacing:'2px', marginTop:'4px' }}>{skillName} EXPERT SYSTEM</div>
        </div>
        <div style={{ marginLeft: 'auto', display:'flex', alignItems:'center', gap:'10px', background:'white', padding:'10px 20px', borderRadius:'20px', boxShadow:'0 5px 15px rgba(0,0,0,0.03)' }}>
           <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand-teal)', boxShadow: '0 0 15px var(--brand-teal)', animation:'pf-pulse 1.5s infinite' }} />
           <span style={{ fontSize:'11px', fontWeight:'900', color:'var(--brand-teal)', letterSpacing:'1.5px' }}>ACTIVE</span>
        </div>
      </div>

      <div style={{ height: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '35px', padding: '10px 15px', scrollbarWidth: 'none', scrollBehavior:'smooth' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'var(--brand-teal)' : 'rgba(0,0,0,0.02)',
            border: 'none',
            borderRadius: msg.role === 'user' ? '30px 30px 4px 30px' : '30px 30px 30px 4px',
            color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-heading)',
            padding: '22px 28px',
            fontSize: '15px',
            maxWidth: '85%',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            fontWeight: '700',
            boxShadow: msg.role === 'user' ? '0 15px 35px rgba(0, 212, 170, 0.25)' : 'none',
            opacity: 0,
            animation: 'pf-fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            {msg.role === 'bot' && (
              <span style={{ fontSize: '11px', color: 'var(--brand-teal)', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '10px', letterSpacing: '2px', opacity:0.6 }}>NEURAL RESPONSE</span>
            )}
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(0,0,0,0.02)',
            border: 'none',
            borderRadius: '30px 30px 30px 4px',
            padding: '22px 28px',
            maxWidth: '85%',
            animation: 'pf-fadeIn 0.4s forwards'
          }}>
             <span style={{ fontSize: '11px', color: 'var(--brand-teal)', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '2px', opacity:0.6 }}>SYSTEM IS THINKING</span>
            <span className="typing-dots" style={{ display: 'inline-flex', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-teal)', animation: 'pf-pulse 1s infinite', animationDelay: '0s' }} />
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-teal)', animation: 'pf-pulse 1s infinite', animationDelay: '0.2s' }} />
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-teal)', animation: 'pf-pulse 1s infinite', animationDelay: '0.4s' }} />
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '35px', border: 'none' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          placeholder={placeholder.toUpperCase()}
          disabled={isTyping}
          style={{
            flex: 1,
            padding: '18px 25px',
            borderRadius: '25px',
            border: 'none',
            background: 'white',
            color: 'var(--text-heading)',
            outline: 'none',
            fontSize: '15px',
            fontWeight: '800',
            opacity: isTyping ? 0.6 : 1,
            fontFamily:'var(--font-main)',
            letterSpacing:'0.5px',
            boxShadow:'0 8px 25px rgba(0,0,0,0.03)'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isTyping || !input.trim()}
          className={!input.trim() || isTyping ? "" : "pf-glow-btn"}
          style={{
            border: 'none',
            borderRadius: '25px',
            background: isTyping || !input.trim() ? 'rgba(0,0,0,0.05)' : 'var(--brand-teal)',
            color: isTyping || !input.trim() ? 'var(--text-body)' : '#FFFFFF',
            fontWeight: '900',
            padding: '0 40px',
            cursor: isTyping || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            textTransform: 'uppercase',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            letterSpacing:'2px'
          }}
        >
          {isTyping ? '...' : 'SEND'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes msgIn {
          from { opacity:0; transform: translateY(10px); }
          to { opacity:1; transform: translateY(0); }
        }
        .chat-container::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
