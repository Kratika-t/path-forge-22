import React, { useState } from 'react';

export default function BeginnerFlow({ onNext, onBack, trackId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  const trackInfo = {
    frontend: {
      title: 'Frontend Development',
      icon: '🎨'
    },
    backend: {
      title: 'Backend Development', 
      icon: '⚙️'
    },
    ai: {
      title: 'AI & Machine Learning',
      icon: '🤖'
    },
    mobile: {
      title: 'Mobile Development',
      icon: '📱'
    },
    game: {
      title: 'Game Development',
      icon: '🎮'
    },
    cybersecurity: {
      title: 'Cybersecurity',
      icon: '🔐'
    }
  };

  const questions = [
    {
      question: `What excites you most about ${trackInfo[trackId]?.title || 'this field'}?`,
      options: [
        'Creating things people will use every day',
        'Solving complex technical problems',
        'Building something from scratch',
        'Making a good living with my skills',
        'Being part of the tech community',
        'Always learning new things'
      ]
    },
    {
      question: 'How do you imagine yourself working?',
      options: [
        'In an office with a team',
        'Remote from home',
        'Freelance on different projects',
        'Starting my own company',
        'For a big tech company',
        'Flexible - I\'m open to anything'
      ]
    },
    {
      question: 'What would you be proudest to build?',
      options: [
        'A popular app thousands use',
        'A system that runs smoothly behind the scenes',
        'Something that helps people solve real problems',
        'A beautiful, user-friendly website',
        'A cutting-edge AI tool',
        'Something that pushes technical boundaries'
      ]
    },
    {
      question: 'How do you like to learn new things?',
      options: [
        'Step by step with clear guidance',
        'Jump in and learn by doing',
        'Watching others then trying myself',
        'Reading documentation and examples',
        'Building projects that interest me',
        'With a mentor or teacher'
      ]
    }
  ];

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, move to result
      onNext({
        experienceLevel: 'beginner',
        trackId,
        answers: newAnswers,
        level: 'beginner'
      });
    }
  };

  const optionStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    backdropFilter: 'blur(10px)',
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.5'
  };

  const optionHoverStyle = {
    background: 'rgba(255,107,53,0.1)',
    borderColor: 'rgba(255,107,53,0.3)',
    transform: 'translateY(-2px)'
  };

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
          onMouseEnter={e => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        >
          ← Back
        </button>
        
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {trackInfo[trackId]?.icon}
        </div>
        
        <h1 style={{
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: '900',
          marginBottom: '16px',
          letterSpacing: '-0.5px',
          lineHeight: '1.2'
        }}>
          Let's confirm {trackInfo[trackId]?.title} is right for you
        </h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '40px'
        }}>
          {questions.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index <= currentQuestion ? '#FF6B35' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
        
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.8)',
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: '1.6',
          fontWeight: '600'
        }}>
          {questions[currentQuestion].question}
        </p>
      </div>

      {/* Options */}
      <div style={{
        flex: 1,
        padding: '0 20px 60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {questions[currentQuestion].options.map((option, index) => (
            <div
              key={index}
              style={optionStyle}
              onClick={() => handleAnswer(option)}
              onMouseEnter={e => {
                Object.assign(e.currentTarget.style, optionHoverStyle);
              }}
              onMouseLeave={e => {
                Object.assign(e.currentTarget.style, optionStyle);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
