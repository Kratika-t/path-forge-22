import React, { useState, useRef, useEffect } from 'react';

const TEMPLATES = {
  modern: {
    name: 'Neural Modern',
    colors: { primary: '#1a1a1a', secondary: '#00d4aa', accent: '#ff6b6b' },
    layout: 'two-column'
  },
  classic: {
    name: 'Executive Classic',
    colors: { primary: '#000000', secondary: '#444444', accent: '#333333' },
    layout: 'single-column'
  },
  creative: {
    name: 'Digital Creative',
    colors: { primary: '#1a1a1a', secondary: '#00d4aa', accent: '#f5a623' },
    layout: 'sidebar'
  }
};

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

function ATSResume({ userData, onBack, onProgressUpdate, theme }) {
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
  const currentTheme = theme || defaultTheme;
  const [formData, setFormData] = useState({
    fullName: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    location: userData?.city || '',
    website: userData?.website || '',
    linkedin: userData?.linkedin || '',
    github: userData?.github || '',
    summary: userData?.bio || '',
    experience: userData?.experience || [],
    education: userData?.education || [],
    skills: userData?.skills || [],
    projects: userData?.projects || [],
    certifications: userData?.certifications || [],
    languages: userData?.languages || []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isEditing, setIsEditing] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [resumeScore, setResumeScore] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.fullName || formData.email) {
        saveResumeData();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Validate and score resume
  useEffect(() => {
    validateResume();
  }, [formData]);

  const saveResumeData = async () => {
    try {
      if (onProgressUpdate) {
        await onProgressUpdate({
          resumeData: formData,
          lastSaved: new Date().toISOString()
        });
      }
      setAutoSaveStatus('Auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving resume:', error);
      setAutoSaveStatus('Save failed');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const validateResume = () => {
    const errors = [];
    let score = 0;

    if (!formData.fullName) errors.push('Full name is required');
    else score += 10;
    
    if (!formData.email) errors.push('Email is required');
    else score += 10;
    
    if (!formData.phone) errors.push('Phone is required');
    else score += 10;
    
    if (!formData.summary || formData.summary.length < 50) {
      errors.push('Professional summary should be at least 50 characters');
    } else score += 15;
    
    if (formData.experience.length === 0) {
      errors.push('Add at least one work experience');
    } else score += 20;
    
    if (formData.education.length === 0) {
      errors.push('Add at least one education entry');
    } else score += 15;
    
    if (formData.skills.length === 0) {
      errors.push('Add at least one skill');
    } else score += 10;
    
    if (formData.projects.length > 0) score += 5;
    if (formData.certifications.length > 0) score += 5;

    setValidationErrors(errors);
    setResumeScore(score);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { 
        company: '', 
        position: '', 
        duration: '', 
        location: '',
        description: ''
      }]
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { 
        institution: '', 
        degree: '', 
        field: '',
        year: ''
      }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 'Intermediate' }]
    }));
  };

  const updateSkill = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const exportToPDF = () => {
    window.print();
  };

  const exportToWord = () => {
    alert('Word export feature coming soon!');
  };

  const renderTemplate = () => {
    const template = TEMPLATES[selectedTemplate];
    
    if (template.layout === 'two-column') {
      return renderModernTemplate();
    } else if (template.layout === 'single-column') {
      return renderClassicTemplate();
    } else {
      return renderCreativeTemplate();
    }
  };

  const renderModernTemplate = () => (
    <div className="pf-resume-paper" style={{ background: 'white', color: 'black', padding: '60px', borderRadius: '15px', fontFamily: '"Inter", sans-serif', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px', borderBottom: '4px solid #1a1a1a', paddingBottom: '40px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 15px 0', letterSpacing: '-2px' }}>
          {formData.fullName || 'Your Name'}
        </h1>
        <p style={{ color: '#444', margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800' }}>
          {formData.email} | {formData.phone} | {formData.location}
        </p>
        <p style={{ color: '#666', margin: '0', fontSize: '14px', fontWeight: '800' }}>
          {formData.website && `${formData.website} | `}{formData.linkedin && `LinkedIn: ${formData.linkedin}`} | {formData.github && `GitHub: ${formData.github}`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '60px' }}>
        {/* Left Column */}
        <div style={{ flex: '2' }}>
          {formData.summary && (
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a1a', marginBottom: '20px', textTransform: 'uppercase', borderBottom: '3px solid #f0f0f0', paddingBottom: '10px', letterSpacing:'1.5px' }}>
                Profile
              </h2>
              <p style={{ color: '#222', lineHeight: '1.8', fontSize: '15px', fontWeight: '500' }}>{formData.summary}</p>
            </div>
          )}

          {formData.experience.length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a1a', marginBottom: '25px', textTransform: 'uppercase', borderBottom: '3px solid #f0f0f0', paddingBottom: '10px', letterSpacing:'1.5px' }}>
                Experience
              </h2>
              {formData.experience.map((exp, index) => (
                <div key={index} style={{ marginBottom: '35px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>{exp.position}</h3>
                    <span style={{ fontSize: '14px', color: '#555', fontWeight: '800' }}>{exp.duration}</span>
                  </div>
                  <p style={{ color: 'var(--brand-teal)', fontSize: '15px', margin: '0 0 15px 0', fontWeight: '800' }}>
                    {exp.company} | {exp.location}
                  </p>
                  <p style={{ color: '#333', fontSize: '15px', lineHeight: '1.8', fontWeight: '500' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: '1' }}>
          {formData.skills.length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a1a', marginBottom: '20px', textTransform: 'uppercase', borderBottom: '3px solid #f0f0f0', paddingBottom: '10px', letterSpacing:'1.5px' }}>
                Expertise
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {formData.skills.map((skill, index) => (
                  <span key={index} style={{ fontSize: '13px', background: '#f5f5f5', color: '#1a1a1a', padding: '8px 18px', borderRadius: '10px', fontWeight: '800', border:'1px solid #eee' }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.education.length > 0 && (
            <div style={{ marginBottom: '50px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a1a', marginBottom: '20px', textTransform: 'uppercase', borderBottom: '3px solid #f0f0f0', paddingBottom: '10px', letterSpacing:'1.5px' }}>
                Education
              </h2>
              {formData.education.map((edu, index) => (
                <div key={index} style={{ marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 6px 0' }}>{edu.degree}</h3>
                  <p style={{ color: '#444', fontSize: '14px', margin: '0 0 6px 0', fontWeight: '700' }}>{edu.institution}</p>
                  <p style={{ color: '#888', fontSize: '13px', margin: 0, fontWeight: '600' }}>
                    {edu.year}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderClassicTemplate = () => (
    <div className="pf-resume-paper" style={{ background: 'white', color: 'black', padding: '80px', borderRadius: '15px', fontFamily: '"Playfair Display", serif', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}>
      {/* Classic single-column layout */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: 'black', margin: '0 0 15px 0', textTransform: 'uppercase', letterSpacing:'3px' }}>
          {formData.fullName || 'Your Name'}
        </h1>
        <p style={{ color: '#333', margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
          {formData.email} • {formData.phone} • {formData.location}
        </p>
        <p style={{ color: '#333', margin: '10px 0 0 0', fontSize: '15px' }}>
          {formData.linkedin && `LinkedIn: ${formData.linkedin}`} • {formData.github && `GitHub: ${formData.github}`}
        </p>
      </div>

      <div style={{ marginBottom: '45px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'black', borderBottom: '3px solid black', marginBottom: '20px', textTransform: 'uppercase', letterSpacing:'2px' }}>Summary</h2>
        <p style={{ color: 'black', lineHeight: '1.7', fontSize: '16px' }}>{formData.summary}</p>
      </div>

      {formData.experience.length > 0 && (
        <div style={{ marginBottom: '45px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'black', borderBottom: '3px solid black', marginBottom: '30px', textTransform: 'uppercase', letterSpacing:'2px' }}>Experience</h2>
          {formData.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '35px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black', margin: 0 }}>{exp.position} | {exp.company}</h3>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{exp.duration}</span>
              </div>
              <p style={{ color: '#444', fontSize: '15px', fontStyle: 'italic', margin: '0 0 15px 0' }}>{exp.location}</p>
              <p style={{ color: 'black', fontSize: '16px', lineHeight: '1.7' }}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreativeTemplate = () => (
    <div className="pf-resume-paper" style={{ background: 'white', color: 'black', borderRadius: '20px', fontFamily: '"Outfit", sans-serif', display: 'flex', minHeight: '1000px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }}>
      {/* Sidebar */}
      <div style={{ background: '#1a1a1a', color: 'white', padding: '60px 50px', width: '350px' }}>
        <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0 0 50px 0', lineHeight: '1.1', letterSpacing:'-2px' }}>
          {formData.fullName || 'Your Name'}
        </h1>
        
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '25px', textTransform: 'uppercase', color: 'var(--brand-teal)', letterSpacing: '3px' }}>CONTACT</h3>
          <p style={{ fontSize: '15px', margin: '12px 0', opacity: 0.9, fontWeight: '600' }}>{formData.email}</p>
          <p style={{ fontSize: '15px', margin: '12px 0', opacity: 0.9, fontWeight: '600' }}>{formData.phone}</p>
          <p style={{ fontSize: '15px', margin: '12px 0', opacity: 0.9, fontWeight: '600' }}>{formData.location}</p>
        </div>

        {formData.skills.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '25px', textTransform: 'uppercase', color: 'var(--brand-teal)', letterSpacing: '3px' }}>EXPERTISE</h3>
            {formData.skills.map((skill, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>{skill.name}</div>
                <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '10px' }}>
                  <div style={{ 
                    background: 'var(--brand-teal)', 
                    height: '100%', 
                    borderRadius: '10px',
                    width: `${(SKILL_LEVELS.indexOf(skill.level) + 1) * 25}%`,
                    boxShadow: '0 0 15px var(--brand-teal)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: '1', padding: '80px' }}>
        {formData.summary && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a1a', marginBottom: '20px', fontFamily: 'var(--font-display)', letterSpacing:'-1.5px' }}>PROFILE</h2>
            <p style={{ color: '#333', lineHeight: '1.8', fontSize: '17px', fontWeight: '600' }}>{formData.summary}</p>
          </div>
        )}

        {formData.experience.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a1a', marginBottom: '35px', fontFamily: 'var(--font-display)', letterSpacing:'-1.5px' }}>EXPERIENCE</h2>
            {formData.experience.map((exp, index) => (
              <div key={index} style={{ marginBottom: '40px', position: 'relative', paddingLeft: '40px', borderLeft: '4px solid var(--brand-teal)' }}>
                <div style={{ position: 'absolute', left: '-12px', top: '0', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--brand-teal)', border:'5px solid white', boxShadow:'0 0 20px rgba(0, 212, 170, 0.4)' }} />
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 8px 0' }}>{exp.position}</h3>
                <p style={{ color: 'var(--brand-teal)', fontSize: '15px', margin: '0 0 18px 0', fontWeight: '800' }}>{exp.company} • {exp.duration}</p>
                <p style={{ color: '#444', fontSize: '17px', lineHeight: '1.8', fontWeight: '600' }}>{exp.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const inputStyle = {
    width: '100%',
    padding: '18px',
    marginBottom: '12px',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '20px',
    background: 'white',
    color: 'var(--text-heading)',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow:'inset 0 2px 10px rgba(0,0,0,0.02)'
  };

  const sectionStyle = {
    background: 'white !important',
    border: 'none',
    borderRadius: '40px',
    padding: '45px',
    marginBottom: '40px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.04)'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-main)', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px', gap: '30px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="pf-shimmer-text" style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 15px 0', letterSpacing: '-2px', fontFamily: 'var(--font-display)' }}>
              Neural ATS Architect
            </h1>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background:'white', padding:'10px 24px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1px' }}>ATS RANK:</span>
                <span className="pf-shimmer-text" style={{ 
                  fontSize: '28px', 
                  fontWeight: '900', 
                  fontFamily: 'var(--font-display)',
                  letterSpacing:'-1px'
                }}>
                  {resumeScore}%
                </span>
              </div>
              {autoSaveStatus && (
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'8px', height:'8px', background:'var(--brand-teal)', borderRadius:'50%', animation:'pf-pulse 1.5s infinite' }} />
                  <span style={{ fontSize: '14px', color: 'var(--brand-teal)', fontWeight: '900', textTransform:'uppercase', letterSpacing:'1.5px' }}>{autoSaveStatus}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? "pf-glow-btn" : "pf-glass"}
              style={{
                border:'none',
                padding: '20px 45px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontSize: '14px',
                letterSpacing:'2px'
              }}
            >
              {isEditing ? '⚡ VISUALIZE RESUME' : '✏️ MODIFY DATA'}
            </button>
            <button
              onClick={onBack}
              className="pf-glass"
              style={{
                border:'none',
                padding: '20px 45px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontSize: '14px',
                letterSpacing:'2px'
              }}
            >
              EXIT
            </button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && isEditing && (
          <div className="pf-glass" style={{
            border: 'none',
            background: 'rgba(255, 107, 107, 0.05) !important',
            padding: '40px 50px',
            marginBottom: '50px',
            borderRadius:'40px',
            boxShadow: '0 20px 40px rgba(255, 107, 107, 0.1)'
          }}>
            <h3 style={{ color: 'var(--brand-coral)', fontSize: '20px', margin: '0 0 20px 0', fontWeight: '900', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px' }}>🚨 OPTIMIZATION REQUIRED:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {validationErrors.map((error, index) => (
                <div key={index} style={{ color: 'var(--text-heading)', fontSize: '15px', fontWeight: '700', display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'8px', height:'8px', background:'var(--brand-coral)', borderRadius:'50%' }} />
                  {error.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {isEditing ? (
          /* Edit Mode */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Template Selection */}
              <div className="pf-glass" style={sectionStyle}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px' }}>NEURAL TEMPLATE</h2>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {Object.entries(TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTemplate(key)}
                      className={selectedTemplate === key ? "pf-glow-btn" : "pf-glass"}
                      style={{
                        border:'none',
                        padding: '16px 30px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '900',
                        textTransform:'uppercase',
                        letterSpacing:'1.5px'
                      }}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="pf-glass" style={sectionStyle}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px' }}>CORE IDENTITY</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <input style={inputStyle} placeholder="FULL NAME *" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
                  <input style={inputStyle} placeholder="EMAIL ADDRESS *" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                  <input style={inputStyle} placeholder="PHONE NUMBER *" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                  <input style={inputStyle} placeholder="LOCATION" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
                  <input style={inputStyle} placeholder="PORTFOLIO LINK" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} />
                  <input style={inputStyle} placeholder="LINKEDIN" value={formData.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} />
                  <input style={inputStyle} placeholder="GITHUB" value={formData.github} onChange={(e) => handleInputChange('github', e.target.value)} />
                </div>
              </div>

              {/* Summary */}
              <div className="pf-glass" style={sectionStyle}>
                <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px' }}>NEURAL SUMMARY</h2>
                <textarea
                  style={{ ...inputStyle, height: '220px', resize: 'none', lineHeight: '1.8' }}
                  placeholder="SYNTHESIZE YOUR PROFESSIONAL NARRATIVE... (ATS LIKES KEYWORDS RELEVANT TO YOUR DOMAIN)"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Experience */}
              <div className="pf-glass" style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px', margin: 0 }}>PROFESSIONAL LOG</h2>
                  <button onClick={addExperience} className="pf-glass" style={{ border:'none', padding: '12px 28px', borderRadius: '18px', fontSize: '12px', fontWeight: '900', color: 'var(--brand-teal)', cursor: 'pointer', textTransform:'uppercase', letterSpacing:'1.5px' }}>+ EXP UNIT</button>
                </div>
                {formData.experience.map((exp, index) => (
                  <div key={index} className="pf-glass" style={{ background: 'rgba(0,0,0,0.02) !important', padding: '35px', borderRadius: '30px', marginBottom: '25px', border: '1px solid rgba(0,0,0,0.04) !important' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom:'20px' }}>
                      <input style={inputStyle} placeholder="ROLE / POSITION" value={exp.position} onChange={(e) => updateExperience(index, 'position', e.target.value)} />
                      <input style={inputStyle} placeholder="ORGANIZATION" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} />
                      <input style={inputStyle} placeholder="TIMEFRAME" value={exp.duration} onChange={(e) => updateExperience(index, 'duration', e.target.value)} />
                      <input style={inputStyle} placeholder="GEOGRAPHY" value={exp.location} onChange={(e) => updateExperience(index, 'location', e.target.value)} />
                    </div>
                    <textarea
                      style={{ ...inputStyle, height: '140px', resize:'none', background:'white !important' }}
                      placeholder="CORE RESPONSIBILITIES & KEY ACHIEVEMENTS..."
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    />
                    <button onClick={() => removeExperience(index)} style={{ border:'none', background:'none', color:'var(--brand-coral)', fontSize:'12px', fontWeight:'900', cursor:'pointer', marginTop:'20px', textTransform:'uppercase', letterSpacing:'1.5px' }}>TERMINATE UNIT</button>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="pf-glass" style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px', margin: 0 }}>ACADEMIC RECORD</h2>
                  <button onClick={addEducation} className="pf-glass" style={{ border:'none', padding: '12px 28px', borderRadius: '18px', fontSize: '12px', fontWeight: '900', color: 'var(--brand-teal)', cursor: 'pointer', textTransform:'uppercase', letterSpacing:'1.5px' }}>+ EDU UNIT</button>
                </div>
                {formData.education.map((edu, index) => (
                  <div key={index} className="pf-glass" style={{ background: 'rgba(0,0,0,0.02) !important', padding: '35px', borderRadius: '30px', marginBottom: '25px', border: '1px solid rgba(0,0,0,0.04) !important' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <input style={inputStyle} placeholder="QUALIFICATION / DEGREE" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} />
                      <input style={inputStyle} placeholder="INSTITUTION" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} />
                      <input style={inputStyle} placeholder="CORE DOMAIN" value={edu.field} onChange={(e) => updateEducation(index, 'field', e.target.value)} />
                      <input style={inputStyle} placeholder="YEAR" value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} />
                    </div>
                    <button onClick={() => removeEducation(index)} style={{ border:'none', background:'none', color:'var(--brand-coral)', fontSize:'12px', fontWeight:'900', cursor:'pointer', marginTop:'20px', textTransform:'uppercase', letterSpacing:'1.5px' }}>TERMINATE UNIT</button>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="pf-glass" style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px', margin: 0 }}>SKILL MATRIX</h2>
                  <button onClick={addSkill} className="pf-glass" style={{ border:'none', padding: '12px 28px', borderRadius: '18px', fontSize: '12px', fontWeight: '900', color: 'var(--brand-teal)', cursor: 'pointer', textTransform:'uppercase', letterSpacing:'1.5px' }}>+ SKILL</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="pf-glass" style={{ background: 'white !important', padding: '20px', borderRadius: '25px', position:'relative', border: '1px solid rgba(0,0,0,0.05) !important' }}>
                      <input style={{ ...inputStyle, padding:'12px', fontSize:'14px', marginBottom:'10px', boxShadow:'none', border:'1px solid rgba(0,0,0,0.04)' }} placeholder="SKILL" value={skill.name} onChange={(e) => updateSkill(index, 'name', e.target.value)} />
                      <select style={{ ...inputStyle, padding:'12px', fontSize:'13px', marginBottom:0, background:'rgba(0,0,0,0.03) !important', boxShadow:'none' }} value={skill.level} onChange={(e) => updateSkill(index, 'level', e.target.value)}>
                        {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <button onClick={() => removeSkill(index)} style={{ position:'absolute', top:'-10px', right:'-10px', border:'none', background:'var(--brand-coral)', color:'white', width:'28px', height:'28px', borderRadius:'50%', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', boxShadow: '0 5px 15px rgba(255, 107, 107, 0.3)' }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div style={{ animation:'pf-fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {/* Export Options */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', justifyContent: 'center' }}>
              <button onClick={exportToPDF} className="pf-glow-btn" style={{ border:'none', padding: '22px 55px', borderRadius: '30px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'2.5px', fontSize:'15px' }}>📄 SYNTHESIZE PDF</button>
              <button onClick={exportToWord} className="pf-glass" style={{ border:'none', padding: '22px 55px', borderRadius: '30px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'2.5px', fontSize:'15px' }}>📝 EXPORT DOCX</button>
            </div>

            {/* Resume Preview */}
            <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
              {renderTemplate()}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .pf-resume-paper, .pf-resume-paper * { visibility: visible; }
          .pf-resume-paper { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; padding: 0; border-radius: 0; }
        }
      `}</style>
    </div>
  );
}

export default ATSResume;
