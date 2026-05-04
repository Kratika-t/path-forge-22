import React, { useMemo, useState, useRef, useEffect } from 'react';

export default function AIMentorChat({ skillName, currentModuleTitle }) {
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
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>🤖</span>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>AI Mentor Chat</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Powered by AI · Ask anything about {skillName}</div>
        </div>
        <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 6px #2ECC71' }} />
      </div>

      <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', padding: '4px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.08)',
            border: msg.role === 'user' ? '1px solid rgba(255,107,53,0.3)' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            padding: '10px 14px',
            fontSize: '13px',
            maxWidth: '85%',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
          }}>
            {msg.role === 'bot' && <span style={{ fontSize: '11px', color: '#FF6B35', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>AI Mentor</span>}
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '14px 14px 14px 4px',
            padding: '10px 14px',
            fontSize: '13px',
          }}>
            <span style={{ fontSize: '11px', color: '#FF6B35', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>AI Mentor</span>
            <span className="typing-dots" style={{ display: 'inline-flex', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', animation: 'pulse 1.2s infinite', animationDelay: '0s' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', animation: 'pulse 1.2s infinite', animationDelay: '0.3s' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', animation: 'pulse 1.2s infinite', animationDelay: '0.6s' }} />
            </span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          placeholder={placeholder}
          disabled={isTyping}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.06)',
            color: 'white',
            outline: 'none',
            fontSize: '13px',
            opacity: isTyping ? 0.5 : 1,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isTyping}
          style={{
            border: 'none',
            borderRadius: '12px',
            background: isTyping ? 'rgba(255,107,53,0.4)' : '#FF6B35',
            color: 'white',
            fontWeight: 'bold',
            padding: '10px 16px',
            cursor: isTyping ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          {isTyping ? '...' : 'Send'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
