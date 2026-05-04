import React, { useState } from 'react';

const skills = [
  { id: 1, icon: '💻', title: 'Frontend Development', desc: 'HTML, CSS, React, UI Design', color: '#FF6B35' },
  { id: 2, icon: '⚙️', title: 'Backend Development', desc: 'Node.js, Python, Databases', color: '#4ECDC4' },
  { id: 3, icon: '🤖', title: 'Artificial Intelligence', desc: 'ML, Deep Learning, NLP', color: '#9B59B6' },
  { id: 4, icon: '📊', title: 'Data Science', desc: 'Data Analysis, Visualization, SQL', color: '#3498DB' },
  { id: 5, icon: '📱', title: 'Mobile Development', desc: 'React Native, Flutter, Android', color: '#2ECC71' },
  { id: 6, icon: '🔐', title: 'Cyber Security', desc: 'Ethical Hacking, Network Security', color: '#E74C3C' },
  { id: 7, icon: '☁️', title: 'Cloud Computing', desc: 'AWS, Azure, DevOps', color: '#F39C12' },
  { id: 8, icon: '🎨', title: 'UI/UX Design', desc: 'Figma, Wireframing, User Research', color: '#E91E63' },
];

const experiences = [
  { id: 'beginner', label: '🌱 Complete Beginner', desc: 'I am just starting out' },
  { id: 'basic', label: '📚 Know the Basics', desc: 'I know some fundamentals' },
  { id: 'intermediate', label: '🔥 Intermediate', desc: 'I have built some projects' },
  { id: 'advanced', label: '🚀 Advanced', desc: 'I am looking to level up' },
];

const goals = [
  { id: 'job', label: '💼 Get a Job', desc: 'Campus placement or off-campus hiring' },
  { id: 'startup', label: '🚀 Start a Business', desc: 'Build my own product or startup' },
  { id: 'freelance', label: '💻 Freelancing', desc: 'Work independently on projects' },
  { id: 'higher', label: '🎓 Higher Studies', desc: 'MS, MBA or research abroad' },
];

export default function Quiz({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');


  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    padding: '40px 20px',
    overflowY: 'auto'
  };

  const nextBtn = {
    background: 'linear-gradient(135deg, #FF6B35, #FF9A6C)',
    color: 'white',
    border: 'none',
    padding: '16px 48px',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '40px',
    display: 'block',
    margin: '40px auto 0',
    boxShadow: '0 8px 25px rgba(255,107,53,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const backBtn = {
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '12px 30px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    display: 'block',
    margin: '20px auto 0',
    transition: 'all 0.2s'
  };

  const cardStyle = {
    maxWidth: '920px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '40px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
    animation: 'fadeSlideIn 0.8s ease both',
  };

  const stepLabels = ['Identity', 'Domain', 'Expertise', 'Objective'];

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes fieldFocus {
          0% { border-color: rgba(255,255,255,0.2); box-shadow: none; }
          100% { border-color: rgba(255,107,53,0.5); box-shadow: 0 0 15px rgba(255,107,53,0.2); }
        }
        input:focus {
          animation: fieldFocus 0.3s ease forwards;
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="pf-shimmer-text" style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>⚡ PathForge</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '8px', fontSize: '15px' }}>Precision skill mapping for high-impact careers</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
          {[
            '⏱️ ~2 min',
            '🤖 AI Roadmap',
            '📊 Merit Score',
          ].map((badge, i) => (
            <span key={i} style={{ fontSize: '11px', color: '#FF6B35', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', borderRadius: '20px', padding: '6px 14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        {/* Progress bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
            {stepLabels.map((label, i) => (
              <span key={i} style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: i + 1 <= step ? '#FF6B35' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s' }}>
                {label}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                height: '4px',
                flex: 1,
                borderRadius: '2px',
                background: s <= step ? 'linear-gradient(90deg, #FF6B35, #FF9A6C)' : 'rgba(255,255,255,0.1)',
                boxShadow: s <= step ? '0 0 10px rgba(255,107,53,0.3)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            ))}
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px 20px', marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          {[
            { label: 'Name', value: name || '-', icon: '👤' },
            { label: 'Location', value: city || '-', icon: '📍' },
            { label: 'Domain', value: selectedSkill?.title || '-', icon: '🎯' },
            { label: 'Objective', value: selectedGoal?.label?.split(' ').slice(1).join(' ') || '-', icon: '🚀' },
          ].map((item, i) => (
            <div key={i} style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingRight: '10px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', fontWeight: '800', textTransform: 'uppercase' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: item.value !== '-' ? 'white' : 'rgba(255,255,255,0.2)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ opacity: item.value !== '-' ? 1 : 0.3 }}>{item.icon}</span> {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1 - Name and City */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
              Welcome! Let's get to know you 👋
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '35px' }}>
              This helps us personalise your experience
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mohd Zaid Khan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your City</label>
                <input
                  type="text"
                  placeholder="e.g. Greater Noida"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s',
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
            </div>
            <button
              style={{ ...nextBtn, opacity: name && city ? 1 : 0.3, transform: name && city ? 'scale(1)' : 'scale(0.98)' }}
              onMouseEnter={e => { if(name && city) { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 12px 35px rgba(255,107,53,0.45)'; } }}
              onMouseLeave={e => { if(name && city) { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 8px 25px rgba(255,107,53,0.3)'; } }}
              onClick={() => name && city && setStep(2)}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 - Pick skill */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
              Which skill track are you on? 🎯
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '35px' }}>
              Pick the one that excites you most
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px',
            }}>
              {skills.map(skill => (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    border: selectedSkill?.id === skill.id
                      ? `2px solid ${skill.color}`
                      : '1px solid rgba(255,255,255,0.1)',
                    background: selectedSkill?.id === skill.id
                      ? `${skill.color}15`
                      : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: selectedSkill?.id === skill.id ? `0 0 20px ${skill.color}20` : 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    if (selectedSkill?.id !== skill.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedSkill?.id !== skill.id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${skill.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {skill.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: selectedSkill?.id === skill.id ? 'white' : 'rgba(255,255,255,0.9)' }}>{skill.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>{skill.desc}</div>
                  </div>
                  {selectedSkill?.id === skill.id && <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', borderRadius: '50%', background: skill.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</div>}
                </div>
              ))}
            </div>
            <button
              style={{ ...nextBtn, opacity: selectedSkill ? 1 : 0.4 }}
              onClick={() => selectedSkill && setStep(3)}
            >Continue →</button>
            <button style={backBtn} onClick={() => setStep(1)}>← Back</button>
          </div>
        )}

        {/* Step 3 - Experience level */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
              What's your current level? 📊
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '35px' }}>
              Be honest — we'll build the right path for you
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '500px', margin: '0 auto' }}>
              {experiences.map(exp => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  style={{
                    padding: '18px 24px',
                    borderRadius: '14px',
                    border: selectedExp?.id === exp.id
                      ? '2px solid #FF6B35'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: selectedExp?.id === exp.id
                      ? 'rgba(255,107,53,0.1)'
                      : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={e => { if(selectedExp?.id !== exp.id) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { if(selectedExp?.id !== exp.id) e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}
                >
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '16px' }}>{exp.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>{exp.desc}</div>
                  </div>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${selectedExp?.id === exp.id ? '#FF6B35' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedExp?.id === exp.id && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF6B35' }} />}
                  </div>
                </div>
              ))}
            </div>
            <button
              style={{ ...nextBtn, opacity: selectedExp ? 1 : 0.4 }}
              onClick={() => selectedExp && setStep(4)}
            >Continue →</button>
            <button style={backBtn} onClick={() => setStep(2)}>← Back</button>
          </div>
        )}

        {/* Step 4 - Goal */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
              What's your end goal? 🏆
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '35px' }}>
              This helps us tailor your entire path
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px', maxWidth: '580px', margin: '0 auto' }}>
              {goals.map(goal => (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  style={{
                    padding: '24px 20px',
                    borderRadius: '14px',
                    border: selectedGoal?.id === goal.id
                      ? '2px solid #FF6B35'
                      : '1px solid rgba(255,255,255,0.1)',
                    background: selectedGoal?.id === goal.id
                      ? 'rgba(255,107,53,0.1)'
                      : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={e => { if(selectedGoal?.id !== goal.id) e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { if(selectedGoal?.id !== goal.id) e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px', filter: selectedGoal?.id === goal.id ? 'none' : 'grayscale(1)' }}>{goal.label.split(' ')[0]}</div>
                  <div style={{ fontWeight: '800', fontSize: '15px', color: selectedGoal?.id === goal.id ? 'white' : 'rgba(255,255,255,0.9)' }}>{goal.label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>{goal.desc}</div>
                </div>
              ))}
            </div>
            <button
              style={{ ...nextBtn, opacity: selectedGoal ? 1 : 0.4 }}
              onClick={() => {
                if (selectedGoal) {
                  onComplete && onComplete({ name, city, skill: selectedSkill, experience: selectedExp, goal: selectedGoal });
                }
              }}
            >
              Build My Path 🚀
            </button>
            <button style={backBtn} onClick={() => setStep(3)}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
