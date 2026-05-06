import React, { useState } from 'react';

const skills = [
  { id: 1, icon: '💻', title: 'Frontend Development', desc: 'HTML, CSS, React, UI Design', color: '#0A66C2' },
  { id: 2, icon: '⚙️', title: 'Backend Development', desc: 'Node.js, Python, Databases', color: '#4ECDC4' },
  { id: 3, icon: '🤖', title: 'Artificial Intelligence', desc: 'ML, Deep Learning, NLP', color: '#9B59B6' },
  { id: 4, icon: '📊', title: 'Data Science', desc: 'Data Analysis, Visualization, SQL', color: '#3498DB' },
  { id: 5, icon: '📱', title: 'Mobile Development', desc: 'React Native, Flutter, Android', color: '#057642' },
  { id: 6, icon: '🔐', title: 'Cyber Security', desc: 'Ethical Hacking, Network Security', color: '#CC1016' },
  { id: 7, icon: '☁️', title: 'Cloud Computing', desc: 'AWS, Azure, DevOps', color: '#F5C518' },
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

const defaultTheme = { 
  pageBg:'transparent', 
  cardBg:'rgba(255, 255, 255, 0.7)', 
  inputBg:'rgba(255, 255, 255, 0.8)', 
  border:'none', 
  textPrimary:'var(--text-heading)', 
  textMuted:'var(--text-body)', 
  accent:'var(--brand-teal)', 
  accentHover:'var(--brand-yellow)', 
  accentLight:'rgba(0, 212, 170, 0.1)', 
  success:'var(--brand-teal)', 
  warning:'var(--brand-yellow)', 
  error:'var(--brand-coral)' 
};

export default function Quiz({ onComplete, theme = defaultTheme }) {
  const [step, setStep] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  const containerStyle = {
    minHeight: '100vh',
    background: 'transparent',
    color: 'var(--text-body)',
    fontFamily: 'var(--font-main)',
    padding: '80px 20px',
    overflowY: 'auto'
  };

  const nextBtnClass = "pf-glow-btn";
  const backBtnClass = "pf-glass";

  const cardStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '70px',
    borderRadius: '50px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.75)',
    boxShadow: '0 40px 100px rgba(0,0,0,0.05)',
    animation: 'fadeSlideIn 1s cubic-bezier(0.4, 0, 0.2, 1) both',
  };

  const stepLabels = ['Identity', 'Domain', 'Expertise', 'Objective'];

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        .quiz-option-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .quiz-option-card:hover {
          transform: translateY(-8px);
          background: white !important;
          box-shadow: 0 25px 60px rgba(0,0,0,0.06);
        }
        .quiz-input {
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05) !important;
        }
        .quiz-input:focus {
          border-color: var(--brand-teal) !important;
          background: white !important;
          box-shadow: 0 15px 35px rgba(0, 212, 170, 0.1) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="pf-shimmer-text" style={{ fontSize: '56px', fontWeight: '900', fontFamily: 'var(--font-display)', letterSpacing: '-3px', marginBottom:'15px' }}>PathForge AI</h1>
        <p style={{ color: 'var(--text-body)', fontSize: '20px', fontWeight:'700', opacity:0.7, letterSpacing:'-0.5px' }}>Architecting high-impact career trajectories with precision</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '35px' }}>
          {[
            '⏱️ 2 MIN ENGINE',
            '🤖 NEURAL ROADMAP',
            '📊 MERIT INDEX',
          ].map((badge, i) => (
            <span key={i} className="pf-glass" style={{ fontSize: '11px', color: 'var(--brand-teal)', background: 'white', borderRadius: '25px', padding: '10px 22px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', boxShadow:'0 10px 25px rgba(0,0,0,0.03)' }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="pf-glass" style={cardStyle}>
Progress bar */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '0 10px' }}>
            {stepLabels.map((label, i) => (
              <span key={i} style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: i + 1 <= step ? 'var(--brand-teal)' : 'var(--text-body)', opacity: i + 1 <= step ? 1 : 0.3, transition: 'all 0.4s' }}>
                {label}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                height: '8px',
                flex: 1,
                borderRadius: '4px',
                background: s <= step ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)',
                boxShadow: s <= step ? '0 0 20px rgba(0, 212, 170, 0.4)' : 'none',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            ))}
          </div>
        </div>

        {/* Summary Bar */}
        <div className="pf-glass" style={{ background: 'white', borderRadius: '35px', padding: '30px 45px', marginBottom: '70px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', boxShadow:'0 20px 50px rgba(0,0,0,0.03)', border:'none' }}>
          {[
            { label: 'Name', value: name || '-', icon: '👤' },
            { label: 'Location', value: city || '-', icon: '📍' },
            { label: 'Domain', value: selectedSkill?.title || '-', icon: '🎯' },
            { label: 'Objective', value: selectedGoal?.label?.split(' ').slice(1).join(' ') || '-', icon: '🚀' },
          ].map((item, i) => (
            <div key={i} style={{ borderRight: i < 3 ? '1px solid rgba(0,0,0,0.05)' : 'none', paddingRight: '20px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-body)', marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1.5px', opacity:0.4 }}>{item.label}</div>
              <div style={{ fontSize: '16px', color: item.value !== '-' ? 'var(--text-heading)' : 'var(--text-body)', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '10px', fontFamily:'var(--font-display)' }}>
                <span style={{ fontSize:'18px', opacity: item.value !== '-' ? 1 : 0.2 }}>{item.icon}</span> {item.value.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1 - Identity */}
        {step === 1 && (
          <div style={{ animation: 'fadeInOut 0.6s ease' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', textAlign: 'center', marginBottom: '20px', fontFamily:'var(--font-display)', color:'var(--text-heading)', letterSpacing:'-2px' }}>
              IDENTITY PROTOCOL
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-body)', marginBottom: '60px', fontSize:'20px', fontWeight:'700', opacity:0.6 }}>
              Let's synchronize your profile for high-impact personalization
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '35px', maxWidth: '500px', margin: '0 auto' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--brand-teal)', display: 'block', marginBottom: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>FULL LEGAL NAME</label>
                <input
                  type="text"
                  placeholder="E.G. ALEX RIVERA"
                  value={name}
                  className="quiz-input"
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%', padding: '24px 30px', borderRadius: '22px',
                    background: 'white', color: 'var(--text-heading)',
                    fontSize: '18px', outline: 'none', boxSizing: 'border-box',
                    fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--brand-teal)', display: 'block', marginBottom: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>BASE COORDINATES (CITY)</label>
                <input
                  type="text"
                  placeholder="E.G. SAN FRANCISCO"
                  value={city}
                  className="quiz-input"
                  onChange={e => setCity(e.target.value)}
                  style={{
                    width: '100%', padding: '24px 30px', borderRadius: '22px',
                    background: 'white', color: 'var(--text-heading)',
                    fontSize: '18px', outline: 'none', boxSizing: 'border-box',
                    fontWeight: '800', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px'
                  }}
                />
              </div>
            </div>
            <button
              className={name && city ? nextBtnClass : ""}
              disabled={!name || !city}
              style={{ 
                margin: '60px auto 0', display: 'block', padding: '24px 80px', borderRadius: '25px',
                background: name && city ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)',
                color: name && city ? 'white' : 'var(--text-body)',
                border:'none', fontWeight:'900', fontSize:'18px', cursor: name && city ? 'pointer' : 'not-allowed',
                textTransform:'uppercase', letterSpacing:'2px'
              }}
              onClick={() => name && city && setStep(2)}
            >
              INITIALIZE SYNC →
            </button>
          </div>
        )}

        {/* Step 2 - Domain */}
        {step === 2 && (
          <div style={{ animation: 'fadeInOut 0.6s ease' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', textAlign: 'center', marginBottom: '20px', fontFamily:'var(--font-display)', color:'var(--text-heading)', letterSpacing:'-2px' }}>
              CORE DOMAIN
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-body)', marginBottom: '60px', fontSize:'20px', fontWeight:'700', opacity:0.6 }}>
              Select the technical track that defines your future evolution
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '25px',
            }}>
              {skills.map(skill => (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className="pf-glass quiz-option-card"
                  style={{
                    padding: '35px', borderRadius: '35px', 
                    border: selectedSkill?.id === skill.id ? `3px solid var(--brand-teal)` : 'none',
                    background: selectedSkill?.id === skill.id ? 'white' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '30px',
                    boxShadow: selectedSkill?.id === skill.id ? `0 25px 60px rgba(0, 212, 170, 0.15)` : '0 10px 30px rgba(0,0,0,0.02)',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '70px', height: '70px', borderRadius: '22px', background: `${skill.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', flexShrink:0, border:`1px solid ${skill.color}20` }}>
                    {skill.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '22px', color: 'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>{skill.title.toUpperCase()}</div>
                    <div style={{ color: 'var(--text-body)', fontSize: '15px', marginTop: '8px', fontWeight: '700', opacity:0.6 }}>{skill.desc}</div>
                  </div>
                  {selectedSkill?.id === skill.id && <div style={{ position: 'absolute', right: '30px', top: '30px', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--brand-teal)', color:'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight:'900', boxShadow:'0 0 15px rgba(0, 212, 170, 0.4)' }}>✓</div>}
                </div>
              ))}
            </div>
            <button
              className={selectedSkill ? nextBtnClass : ""}
              disabled={!selectedSkill}
              style={{ 
                margin: '60px auto 0', display: 'block', padding: '24px 80px', borderRadius: '25px',
                background: selectedSkill ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)',
                color: selectedSkill ? 'white' : 'var(--text-body)',
                border:'none', fontWeight:'900', fontSize:'18px', cursor: selectedSkill ? 'pointer' : 'not-allowed',
                textTransform:'uppercase', letterSpacing:'2px'
              }}
              onClick={() => selectedSkill && setStep(3)}
            >LOCK DOMAIN →</button>
            <button className={backBtnClass} style={{ border:'none', margin: '25px auto 0', display: 'block', padding: '12px 35px', cursor:'pointer', fontWeight:'900', fontSize:'12px', color:'var(--text-body)', letterSpacing:'2px', borderRadius:'15px', opacity:0.6 }} onClick={() => setStep(1)}>PREVIOUS PHASE</button>
          </div>
        )}

        {/* Step 3 - Expertise */}
        {step === 3 && (
          <div style={{ animation: 'fadeInOut 0.6s ease' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', textAlign: 'center', marginBottom: '20px', fontFamily:'var(--font-display)', color:'var(--text-heading)', letterSpacing:'-2px' }}>
              EXPERTISE INDEX
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-body)', marginBottom: '60px', fontSize:'20px', fontWeight:'700', opacity:0.6 }}>
              Synchronizing difficulty vectors for optimal learning flow
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '600px', margin: '0 auto' }}>
              {experiences.map(exp => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  className="pf-glass quiz-option-card"
                  style={{
                    padding: '30px 45px', borderRadius: '30px',
                    border: selectedExp?.id === exp.id ? '3px solid var(--brand-teal)' : 'none',
                    background: selectedExp?.id === exp.id ? 'white' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: selectedExp?.id === exp.id ? '0 20px 50px rgba(0, 212, 170, 0.15)' : '0 10px 30px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '22px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>{exp.label.toUpperCase()}</div>
                    <div style={{ color: 'var(--text-body)', fontSize: '15px', marginTop: '8px', fontWeight: '700', opacity:0.6 }}>{exp.desc}</div>
                  </div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `4px solid ${selectedExp?.id === exp.id ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition:'all 0.4s' }}>
                    {selectedExp?.id === exp.id && <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--brand-teal)', boxShadow:'0 0 15px var(--brand-teal)' }} />}
                  </div>
                </div>
              ))}
            </div>
            <button
              className={selectedExp ? nextBtnClass : ""}
              disabled={!selectedExp}
              style={{ 
                margin: '60px auto 0', display: 'block', padding: '24px 80px', borderRadius: '25px',
                background: selectedExp ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)',
                color: selectedExp ? 'white' : 'var(--text-body)',
                border:'none', fontWeight:'900', fontSize:'18px', cursor: selectedExp ? 'pointer' : 'not-allowed',
                textTransform:'uppercase', letterSpacing:'2px'
              }}
              onClick={() => selectedExp && setStep(4)}
            >LOCK INDEX →</button>
            <button className={backBtnClass} style={{ border:'none', margin: '25px auto 0', display: 'block', padding: '12px 35px', cursor:'pointer', fontWeight:'900', fontSize:'12px', color:'var(--text-body)', letterSpacing:'2px', borderRadius:'15px', opacity:0.6 }} onClick={() => setStep(2)}>PREVIOUS PHASE</button>
          </div>
        )}

        {/* Step 4 - Objective */}
        {step === 4 && (
          <div style={{ animation: 'fadeInOut 0.6s ease' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', textAlign: 'center', marginBottom: '20px', fontFamily:'var(--font-display)', color:'var(--text-heading)', letterSpacing:'-2px' }}>
              PRIMARY OBJECTIVE
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-body)', marginBottom: '60px', fontSize:'20px', fontWeight:'700', opacity:0.6 }}>
              Defining your target vector for roadmap trajectory optimization
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '25px', maxWidth: '750px', margin: '0 auto' }}>
              {goals.map(goal => (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  className="pf-glass quiz-option-card"
                  style={{
                    padding: '45px 35px', borderRadius: '40px', textAlign: 'center',
                    border: selectedGoal?.id === goal.id ? '3px solid var(--brand-teal)' : 'none',
                    background: selectedGoal?.id === goal.id ? 'white' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    boxShadow: selectedGoal?.id === goal.id ? '0 25px 60px rgba(0, 212, 170, 0.15)' : '0 10px 30px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ fontSize: '56px', marginBottom: '20px', filter: selectedGoal?.id === goal.id ? 'none' : 'grayscale(1) opacity(0.3)', transition:'all 0.4s' }}>{goal.label.split(' ')[0]}</div>
                  <div style={{ fontWeight: '900', fontSize: '22px', color: 'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>{goal.label.split(' ').slice(1).join(' ').toUpperCase()}</div>
                  <div style={{ color: 'var(--text-body)', fontSize: '15px', marginTop: '12px', fontWeight: '700', opacity:0.6 }}>{goal.desc}</div>
                </div>
              ))}
            </div>
            <button
              className={selectedGoal ? nextBtnClass : ""}
              disabled={!selectedGoal}
              style={{ 
                margin: '60px auto 0', display: 'block', padding: '26px 85px', borderRadius: '28px',
                background: selectedGoal ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)',
                color: selectedGoal ? 'white' : 'var(--text-body)',
                border:'none', fontWeight:'900', fontSize:'20px', cursor: selectedGoal ? 'pointer' : 'not-allowed',
                textTransform:'uppercase', letterSpacing:'3px'
              }}
              onClick={() => {
                if (selectedGoal) {
                  onComplete && onComplete({ name, city, skill: selectedSkill, experience: selectedExp, goal: selectedGoal });
                }
              }}
            >
              BUILD NEURAL PATH 🚀
            </button>
            <button className={backBtnClass} style={{ border:'none', margin: '25px auto 0', display: 'block', padding: '12px 35px', cursor:'pointer', fontWeight:'900', fontSize:'12px', color:'var(--text-body)', letterSpacing:'2px', borderRadius:'15px', opacity:0.6 }} onClick={() => setStep(3)}>PREVIOUS PHASE</button>
          </div>
        )}
      </div>
    </div>
  );
}

