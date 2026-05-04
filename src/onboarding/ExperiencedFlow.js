import React, { useState } from 'react';

export default function ExperiencedFlow({ onNext, onBack, trackId }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentSkillTest, setCurrentSkillTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState([]);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [failedSkills, setFailedSkills] = useState([]);

  const trackInfo = {
    frontend: {
      title: 'Frontend Development',
      icon: '🎨',
      skills: [
        { id: 'html-css', name: 'HTML & CSS', description: 'Structure and styling of web pages' },
        { id: 'javascript', name: 'JavaScript', description: 'Programming language for web interactivity' },
        { id: 'react-vue', name: 'React or Vue', description: 'Modern frontend frameworks' },
        { id: 'git-github', name: 'Git & GitHub', description: 'Version control and collaboration' },
        { id: 'rest-apis', name: 'REST APIs', description: 'Connecting to backend services' },
        { id: 'responsive-design', name: 'Responsive Design', description: 'Mobile-friendly layouts' }
      ]
    },
    backend: {
      title: 'Backend Development',
      icon: '⚙️',
      skills: [
        { id: 'nodejs-python', name: 'Node.js or Python', description: 'Server-side programming' },
        { id: 'databases', name: 'Databases', description: 'SQL and NoSQL data storage' },
        { id: 'api-design', name: 'API Design', description: 'RESTful and GraphQL APIs' },
        { id: 'authentication', name: 'Authentication', description: 'User login and security' },
        { id: 'cloud-services', name: 'Cloud Services', description: 'AWS, Azure, or GCP' },
        { id: 'testing', name: 'Testing', description: 'Unit and integration tests' }
      ]
    },
    ai: {
      title: 'AI & Machine Learning',
      icon: '🤖',
      skills: [
        { id: 'python-ml', name: 'Python for ML', description: 'Python libraries like pandas, numpy' },
        { id: 'ml-algorithms', name: 'ML Algorithms', description: 'Understanding common ML models' },
        { id: 'deep-learning', name: 'Deep Learning', description: 'Neural networks and frameworks' },
        { id: 'data-processing', name: 'Data Processing', description: 'Cleaning and preparing data' },
        { id: 'model-deployment', name: 'Model Deployment', description: 'Serving ML models' },
        { id: 'math-statistics', name: 'Math & Statistics', description: 'Linear algebra, probability' }
      ]
    },
    mobile: {
      title: 'Mobile Development',
      icon: '📱',
      skills: [
        { id: 'react-native-flutter', name: 'React Native or Flutter', description: 'Cross-platform frameworks' },
        { id: 'ios-android', name: 'iOS or Android Native', description: 'Platform-specific development' },
        { id: 'mobile-ui', name: 'Mobile UI/UX', description: 'Mobile-first design principles' },
        { id: 'app-state', name: 'App State Management', description: 'Handling data flow in apps' },
        { id: 'mobile-testing', name: 'Mobile Testing', description: 'Device testing and automation' },
        { id: 'app-deployment', name: 'App Deployment', description: 'App store submission' }
      ]
    },
    game: {
      title: 'Game Development',
      icon: '🎮',
      skills: [
        { id: 'unity-unreal', name: 'Unity or Unreal', description: 'Game engines and frameworks' },
        { id: 'game-physics', name: 'Game Physics', description: 'Physics simulation and collision' },
        { id: '3d-modeling', name: '3D Modeling', description: 'Creating game assets' },
        { id: 'game-logic', name: 'Game Logic', description: 'Gameplay programming' },
        { id: 'performance', name: 'Performance Optimization', description: 'FPS and memory optimization' },
        { id: 'multiplayer', name: 'Multiplayer Networking', description: 'Real-time game networking' }
      ]
    },
    cybersecurity: {
      title: 'Cybersecurity',
      icon: '🔐',
      skills: [
        { id: 'network-security', name: 'Network Security', description: 'Network protocols and firewalls' },
        { id: 'encryption', name: 'Encryption', description: 'Cryptography and data protection' },
        { id: 'vulnerability-testing', name: 'Vulnerability Testing', description: 'Penetration testing tools' },
        { id: 'security-tools', name: 'Security Tools', description: 'SIEM, IDS/IPS systems' },
        { id: 'compliance', name: 'Compliance', description: 'Security standards and regulations' },
        { id: 'incident-response', name: 'Incident Response', description: 'Security incident handling' }
      ]
    }
  };

  const currentTrack = trackInfo[trackId];
  const skills = currentTrack?.skills || [];

  const generateTestQuestions = (skillId) => {
    // Mock test questions - in real app, these would come from a database
    const questionBank = {
      'html-css': [
        { type: 'mcq', question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'], correct: 1 },
        { type: 'mcq', question: 'Which HTML tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<head>'], correct: 2 },
        { type: 'fill', question: 'The CSS property used to change text color is _______.', answer: 'color' },
        { type: 'bug', question: 'Find the error: <div style="color: red;" color: blue>Text</div>', error: 'Duplicate color attribute' },
        { type: 'short', question: 'What is the box model in CSS?', answer: 'margin, border, padding, content' }
      ],
      'javascript': [
        { type: 'mcq', question: 'How do you declare a variable in JavaScript?', options: ['var name', 'variable name', 'v name', 'declare name'], correct: 0 },
        { type: 'mcq', question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correct: 0 },
        { type: 'fill', question: 'The function used to parse JSON is JSON.______().', answer: 'parse' },
        { type: 'bug', question: 'Find the error: if (x = 5) { console.log("true"); }', error: 'Assignment instead of comparison' },
        { type: 'short', question: 'What is a closure in JavaScript?', answer: 'Function with access to outer scope' }
      ]
    };

    return questionBank[skillId] || questionBank['javascript'];
  };

  const handleSkillSelection = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const startSkillTest = (skillId) => {
    setCurrentSkillTest(skillId);
    setTestAnswers([]);
  };

  const handleTestAnswer = (questionIndex, answer) => {
    const newAnswers = [...testAnswers];
    newAnswers[questionIndex] = answer;
    setTestAnswers(newAnswers);
  };

  const completeSkillTest = () => {
    if (!currentSkillTest) return;

    const questions = generateTestQuestions(currentSkillTest);
    let correctCount = 0;
    
    questions.forEach((question, index) => {
      const userAnswer = testAnswers[index];
      let isCorrect = false;
      
      if (question.type === 'mcq') {
        isCorrect = userAnswer === question.correct;
      } else if (question.type === 'fill' || question.type === 'short') {
        isCorrect = userAnswer?.toLowerCase().includes(question.answer.toLowerCase());
      } else if (question.type === 'bug') {
        isCorrect = userAnswer?.toLowerCase().includes(question.error.toLowerCase());
      }
      
      if (isCorrect) correctCount++;
    });

    if (correctCount >= 3) {
      setVerifiedSkills([...verifiedSkills, currentSkillTest]);
    } else {
      setFailedSkills([...failedSkills, currentSkillTest]);
    }

    setCurrentSkillTest(null);
    setTestAnswers([]);
  };

  const proceedToResults = () => {
    const level = verifiedSkills.length >= 4 ? 'advanced' : 
                  verifiedSkills.length >= 1 ? 'intermediate' : 'beginner';
    
    onNext({
      experienceLevel: 'experienced',
      trackId,
      selectedSkills,
      verifiedSkills,
      failedSkills,
      level
    });
  };

  const skillCheckboxStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  };

  const skillSelectedStyle = {
    background: 'rgba(255,107,53,0.1)',
    borderColor: 'rgba(255,107,53,0.3)'
  };

  const skillVerifiedStyle = {
    background: 'rgba(46,204,113,0.1)',
    borderColor: 'rgba(46,204,113,0.3)'
  };

  const skillFailedStyle = {
    background: 'rgba(231,76,60,0.1)',
    borderColor: 'rgba(231,76,60,0.3)'
  };

  if (currentSkillTest) {
    const questions = generateTestQuestions(currentSkillTest);
    const skill = skills.find(s => s.id === currentSkillTest);

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: 'white',
        fontFamily: 'var(--font-main)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <button 
            onClick={() => setCurrentSkillTest(null)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '30px',
              transition: 'all 0.2s'
            }}
          >
            ← Back to Skills
          </button>
          
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#FF6B35'
          }}>
            {skill?.name} Verification Test
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Answer 3 out of 5 questions correctly to verify this skill
          </p>
        </div>

        {/* Test Questions */}
        <div style={{
          flex: 1,
          padding: '0 20px 60px',
          overflowY: 'auto'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}>
            {questions.map((question, qIndex) => (
              <div key={qIndex} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                padding: '30px',
                backdropFilter: 'blur(10px)'
              }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: 'white'
                }}>
                  Question {qIndex + 1}: {question.question}
                </h4>
                
                {question.type === 'mcq' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '12px',
                        borderRadius: '12px',
                        background: testAnswers[qIndex] === oIndex ? 'rgba(255,107,53,0.1)' : 'transparent',
                        border: testAnswers[qIndex] === oIndex ? '1px solid rgba(255,107,53,0.3)' : '1px solid transparent'
                      }}>
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={testAnswers[qIndex] === oIndex}
                          onChange={() => handleTestAnswer(qIndex, oIndex)}
                          style={{ display: 'none' }}
                        />
                        <span style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.3)',
                          background: testAnswers[qIndex] === oIndex ? '#FF6B35' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {testAnswers[qIndex] === oIndex && '✓'}
                        </span>
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                
                {(question.type === 'fill' || question.type === 'short' || question.type === 'bug') && (
                  <textarea
                    placeholder="Type your answer here..."
                    value={testAnswers[qIndex] || ''}
                    onChange={(e) => handleTestAnswer(qIndex, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '100px',
                      outline: 'none'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Complete Button */}
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button
            onClick={completeSkillTest}
            disabled={testAnswers.filter(a => a).length < questions.length}
            style={{
              background: testAnswers.filter(a => a).length === questions.length ? '#FF6B35' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '30px',
              fontSize: '16px',
              fontWeight: '800',
              cursor: testAnswers.filter(a => a).length === questions.length ? 'pointer' : 'not-allowed',
              opacity: testAnswers.filter(a => a).length === questions.length ? 1 : 0.5
            }}
          >
            Complete Test →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: 'white',
      fontFamily: 'var(--font-main)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Header */}
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '30px',
            transition: 'all 0.2s'
          }}
        >
          ← Back
        </button>
        
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {currentTrack?.icon}
        </div>
        
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: '900',
          marginBottom: '16px',
          letterSpacing: '-0.5px'
        }}>
          Select Your {currentTrack?.title} Skills
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.6)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Check all the skills you already know. We'll verify them with a quick test.
        </p>
      </div>

      {/* Skills Grid */}
      <div style={{
        flex: 1,
        padding: '0 20px 60px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {skills.map(skill => {
            const isVerified = verifiedSkills.includes(skill.id);
            const isFailed = failedSkills.includes(skill.id);
            const isSelected = selectedSkills.includes(skill.id);
            
            let currentStyle = skillCheckboxStyle;
            if (isVerified) currentStyle = skillVerifiedStyle;
            else if (isFailed) currentStyle = skillFailedStyle;
            else if (isSelected) currentStyle = skillSelectedStyle;

            return (
              <div
                key={skill.id}
                style={currentStyle}
                onClick={() => {
                  if (!isVerified && !isFailed) {
                    handleSkillSelection(skill.id);
                  }
                }}
                onMouseEnter={e => {
                  if (!isVerified && !isFailed) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '8px',
                      color: isVerified ? '#2ECC71' : isFailed ? '#E74C3C' : 'white'
                    }}>
                      {skill.name}
                      {isVerified && ' ✅'}
                      {isFailed && ' ❌'}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: '1.5',
                      margin: 0
                    }}>
                      {skill.description}
                    </p>
                  </div>
                  
                  {!isVerified && !isFailed && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      background: isSelected ? '#FF6B35' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {isSelected && '✓'}
                    </div>
                  )}
                </div>
                
                {isSelected && !isVerified && !isFailed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startSkillTest(skill.id);
                    }}
                    style={{
                      background: 'rgba(255,107,53,0.2)',
                      color: '#FF6B35',
                      border: '1px solid rgba(255,107,53,0.4)',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '16px',
                      width: '100%'
                    }}
                  >
                    Verify Skill →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      {selectedSkills.length > 0 && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button
            onClick={proceedToResults}
            style={{
              background: '#FF6B35',
              color: 'white',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '30px',
              fontSize: '16px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Continue to Results →
          </button>
        </div>
      )}
    </div>
  );
}
