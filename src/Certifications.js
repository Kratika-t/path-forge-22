import React, { useState, useEffect } from 'react';

const CERTIFICATIONS_DATA = {
  'Frontend Development': [
    {
      id: 'infosys-react-basics',
      provider: 'Infosys',
      title: 'React.js Fundamentals',
      description: 'Learn React basics from industry experts at Infosys',
      duration: '4 weeks',
      level: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      videos: [
        {
          id: 'react-1',
          title: 'Introduction to React',
          duration: '15:30',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'react-2', 
          title: 'Components and Props',
          duration: '18:45',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'react-3',
          title: 'State and Lifecycle',
          duration: '22:10',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'react-4',
          title: 'Handling Events',
          duration: '16:20',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        }
      ],
      certificate: 'Infosys Certified React Developer',
      skills: ['React', 'JavaScript', 'Components', 'State Management'],
      rating: 4.8,
      enrolled: 12500
    },
    {
      id: 'microsoft-frontend',
      provider: 'Microsoft',
      title: 'Frontend Development Best Practices',
      description: 'Microsoft\'s comprehensive frontend development course',
      duration: '6 weeks',
      level: 'Intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
      videos: [
        {
          id: 'ms-1',
          title: 'Modern HTML5 & CSS3',
          duration: '25:15',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'ms-2',
          title: 'JavaScript ES6+ Features',
          duration: '30:45',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'ms-3',
          title: 'Responsive Design Principles',
          duration: '20:30',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        }
      ],
      certificate: 'Microsoft Certified Frontend Developer',
      skills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
      rating: 4.9,
      enrolled: 8900
    }
  ],
  'Backend Development': [
    {
      id: 'infosys-nodejs',
      provider: 'Infosys',
      title: 'Node.js & Express Mastery',
      description: 'Complete backend development with Node.js',
      duration: '5 weeks',
      level: 'Intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
      videos: [
        {
          id: 'node-1',
          title: 'Node.js Fundamentals',
          duration: '28:30',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'node-2',
          title: 'Express.js Framework',
          duration: '32:15',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'node-3',
          title: 'RESTful APIs',
          duration: '26:45',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        }
      ],
      certificate: 'Infosys Certified Node.js Developer',
      skills: ['Node.js', 'Express', 'REST APIs', 'Backend'],
      rating: 4.7,
      enrolled: 10200
    },
    {
      id: 'google-cloud-backend',
      provider: 'Google',
      title: 'Cloud Backend Development',
      description: 'Build scalable backend systems on Google Cloud',
      duration: '8 weeks',
      level: 'Advanced',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      videos: [
        {
          id: 'gcp-1',
          title: 'Google Cloud Platform Basics',
          duration: '35:20',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'gcp-2',
          title: 'Cloud Functions & Serverless',
          duration: '40:15',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        }
      ],
      certificate: 'Google Cloud Certified Backend Developer',
      skills: ['Google Cloud', 'Serverless', 'Cloud Functions', 'Scalability'],
      rating: 4.9,
      enrolled: 6700
    }
  ],
  'Artificial Intelligence': [
    {
      id: 'ibm-ml-foundation',
      provider: 'IBM',
      title: 'Machine Learning Foundations',
      description: 'IBM\'s comprehensive ML course for beginners',
      duration: '10 weeks',
      level: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1555255703-cb9fa53fbdb1?w=400',
      videos: [
        {
          id: 'ml-1',
          title: 'Introduction to Machine Learning',
          duration: '45:30',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'ml-2',
          title: 'Python for Data Science',
          duration: '38:45',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'ml-3',
          title: 'Supervised Learning Algorithms',
          duration: '42:20',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        }
      ],
      certificate: 'IBM Certified Machine Learning Practitioner',
      skills: ['Machine Learning', 'Python', 'Data Science', 'Algorithms'],
      rating: 4.8,
      enrolled: 15400
    },
    {
      id: 'microsoft-ai-engineering',
      provider: 'Microsoft',
      title: 'AI Engineering with Azure',
      description: 'Build AI solutions using Microsoft Azure',
      duration: '12 weeks',
      level: 'Advanced',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
      videos: [
        {
          id: 'azure-1',
          title: 'Azure AI Services Overview',
          duration: '48:30',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'azure-2',
          title: 'Building ML Models with Azure ML',
          duration: '52:15',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        }
      ],
      certificate: 'Microsoft Certified AI Engineer',
      skills: ['Azure AI', 'Machine Learning', 'Cloud AI', 'MLOps'],
      rating: 4.9,
      enrolled: 8900
    }
  ],
  'Data Science': [
    {
      id: 'infosys-data-analytics',
      provider: 'Infosys',
      title: 'Data Analytics Professional',
      description: 'Complete data analytics with real-world projects',
      duration: '8 weeks',
      level: 'Intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      videos: [
        {
          id: 'data-1',
          title: 'Data Analysis Fundamentals',
          duration: '35:45',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'data-2',
          title: 'SQL for Data Analysis',
          duration: '40:30',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        },
        {
          id: 'data-3',
          title: 'Data Visualization with Tableau',
          duration: '38:15',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false
        }
      ],
      certificate: 'Infosys Certified Data Analyst',
      skills: ['Data Analysis', 'SQL', 'Tableau', 'Analytics'],
      rating: 4.6,
      enrolled: 11200
    }
  ]
};

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

export default function Certifications({ userData, onBack, onProgressUpdate, theme = defaultTheme }) {
  const [selectedCategory, setSelectedCategory] = useState('Frontend Development');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedVideos, setCompletedVideos] = useState({});

  const availableCategories = Object.keys(CERTIFICATIONS_DATA);

  useEffect(() => {
    // Load user's certification progress
    const savedProgress = userData?.certifications || {};
    setEnrolledCourses(savedProgress.enrolled || []);
    setCompletedVideos(savedProgress.completedVideos || {});
  }, [userData]);

  const handleEnroll = async (course) => {
    if (enrolledCourses.includes(course.id)) return;

    const newEnrolled = [...enrolledCourses, course.id];
    setEnrolledCourses(newEnrolled);

    // Save progress
    if (onProgressUpdate) {
      await onProgressUpdate({
        certifications: {
          enrolled: newEnrolled,
          completedVideos,
          lastAccessed: new Date().toISOString()
        }
      });
    }
  };

  const handleVideoComplete = async (courseId, videoId) => {
    const newCompleted = { ...completedVideos, [videoId]: true };
    setCompletedVideos(newCompleted);

    // Save progress
    if (onProgressUpdate) {
      await onProgressUpdate({
        certifications: {
          enrolled: enrolledCourses,
          completedVideos: newCompleted,
          lastAccessed: new Date().toISOString()
        }
      });
    }
  };

  const getCourseProgress = (course) => {
    const completedCount = course.videos.filter(v => completedVideos[v.id]).length;
    return Math.round((completedCount / course.videos.length) * 100);
  };

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

  if (currentVideo) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--text-body)',
        fontFamily: 'var(--font-main)',
        padding: '80px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', maxWidth: '1400px', margin: '0 auto 60px' }}>
          <button 
            onClick={() => setCurrentVideo(null)}
            className="pf-glass"
            style={{
              border: 'none', color: 'var(--text-body)',
              padding: '16px 35px', borderRadius: '25px', cursor: 'pointer', fontSize: '13px', fontWeight:'900', letterSpacing:'1.5px', textTransform:'uppercase'
            }}
          >
            ← BACK TO COURSE
          </button>
          <h1 className="pf-shimmer-text" style={{ fontSize: '32px', fontWeight: '900', fontFamily:'var(--font-display)', margin:0, letterSpacing:'-1px' }}>⚡ PathForge Academy</h1>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '40px' }}>
            {/* Video Player */}
            <div>
              <div className="pf-glass" style={{
                borderRadius: '32px',
                overflow: 'hidden',
                marginBottom: '40px',
                background:'white !important',
                padding:'20px',
                border:'none',
                boxShadow:'0 40px 100px rgba(0,0,0,0.05)'
              }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius:'20px', overflow:'hidden' }}>
                  <iframe
                    src={currentVideo.url}
                    title={currentVideo.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    allowFullScreen
                  />
                </div>
              </div>
              
              <div className="pf-glass" style={{ textAlign: 'center', padding:'50px', background:'white !important', borderRadius:'32px' }}>
                <h3 style={{ fontSize: '38px', fontWeight: '900', marginBottom: '15px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>
                  {currentVideo.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontWeight:'700', fontSize: '18px' }}>
                  Duration: {currentVideo.duration}
                </p>
                <button
                  onClick={() => handleVideoComplete(selectedCourse.id, currentVideo.id)}
                  className="pf-glow-btn"
                  style={{
                    border: 'none',
                    padding: '22px 60px',
                    borderRadius: '40px',
                    fontSize: '18px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    marginTop: '35px',
                    textTransform:'uppercase',
                    letterSpacing:'2px'
                  }}
                >
                  ✅ Mark as Completed
                </button>
              </div>
            </div>

            {/* Course Content */}
            <div className="pf-glass" style={{ padding:'40px', background:'white !important', borderRadius:'32px', height:'fit-content' }}>
              <h4 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '35px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>
                Course Content
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedCourse.videos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => setCurrentVideo(video)}
                    className="pf-glass"
                    style={{
                      background: currentVideo?.id === video.id ? 'var(--brand-teal) !important' : (completedVideos[video.id] ? 'rgba(0, 212, 170, 0.05) !important' : 'rgba(0,0,0,0.02) !important'),
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      transition:'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      border:'none'
                    }}
                  >
                    <div className="pf-glass" style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: currentVideo?.id === video.id ? 'white' : (completedVideos[video.id] ? 'var(--brand-teal)' : 'white'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: '900',
                      color: currentVideo?.id === video.id ? 'var(--brand-teal)' : (completedVideos[video.id] ? 'white' : 'var(--text-heading)'),
                      border:'none'
                    }}>
                      {completedVideos[video.id] ? '✓' : index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '17px', fontWeight: '800', color: currentVideo?.id === video.id ? 'white' : 'var(--text-heading)' }}>
                        {video.title}
                      </div>
                      <div style={{ fontSize: '14px', color: currentVideo?.id === video.id ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', fontWeight:'700' }}>
                        {video.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    const progress = getCourseProgress(selectedCourse);
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--text-body)',
        fontFamily: 'var(--font-main)',
        padding: '80px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', maxWidth: '1200px', margin: '0 auto 60px' }}>
          <button 
            onClick={() => setSelectedCourse(null)}
            className="pf-glass"
            style={{
              border: 'none', color: 'var(--text-body)',
              padding: '16px 35px', borderRadius: '25px', cursor: 'pointer', fontSize: '13px', fontWeight:'900', letterSpacing:'1.5px', textTransform:'uppercase'
            }}
          >
            ← BACK TO COURSES
          </button>
          <h1 className="pf-shimmer-text" style={{ fontSize: '32px', fontWeight: '900', fontFamily:'var(--font-display)', margin:0, letterSpacing:'-1px' }}>⚡ PathForge Academy</h1>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="pf-glass" style={{
            background: 'white !important',
            padding: '60px',
            marginBottom: '60px',
            borderRadius: '50px',
            boxShadow:'0 40px 100px rgba(0,0,0,0.05)',
            border:'none'
          }}>
            <div style={{ display: 'flex', gap: '60px', marginBottom: '60px', alignItems:'flex-start' }}>
              <div className="pf-glass" style={{ padding:'15px', borderRadius:'32px', background:'white', border:'none', boxShadow:'0 30px 70px rgba(0,0,0,0.08)' }}>
                <img 
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  style={{
                    width: '320px',
                    height: '240px',
                    borderRadius: '20px',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                  <span className="pf-glass" style={{
                    background: 'var(--brand-teal)',
                    color: 'white',
                    padding: '8px 24px',
                    borderRadius: '25px',
                    fontSize: '13px',
                    fontWeight: '900',
                    border:'none',
                    letterSpacing:'1.5px'
                  }}>
                    {selectedCourse.provider.toUpperCase()}
                  </span>
                  <span className="pf-glass" style={{
                    background: 'rgba(0,0,0,0.03)',
                    color: 'var(--text-heading)',
                    padding: '8px 24px',
                    borderRadius: '25px',
                    fontSize: '13px',
                    fontWeight: '900',
                    border:'none',
                    letterSpacing:'1.5px'
                  }}>
                    {selectedCourse.level.toUpperCase()}
                  </span>
                </div>
                <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1.5px', lineHeight:1.1 }}>
                  {selectedCourse.title}
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '35px', fontWeight:'600', fontSize:'18px' }}>
                  {selectedCourse.description}
                </p>
                <div style={{ display: 'flex', gap: '40px', fontSize: '17px', color: 'var(--text-muted)', fontWeight:'700' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>📅 <span>{selectedCourse.duration}</span></div>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>⭐ <span>{selectedCourse.rating} rating</span></div>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>👥 <span>{selectedCourse.enrolled.toLocaleString()} enrolled</span></div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isEnrolled(selectedCourse.id) && (
              <div className="pf-glass" style={{ marginBottom: '60px', padding:'40px', background:'rgba(0,0,0,0.02) !important', borderRadius:'32px', border:'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color:'var(--text-heading)', letterSpacing:'1.5px' }}>YOUR PROGRESS</span>
                  <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--brand-teal)', fontFamily:'var(--font-display)' }}>{progress}%</span>
                </div>
                <div style={{
                  width: '100%', height: '18px', background: 'rgba(0,0,0,0.03)',
                  borderRadius: '9px', overflow: 'hidden', padding:'4px'
                }}>
                  <div style={{
                    width: `${progress}%`, height: '100%',
                    background: 'var(--brand-teal)',
                    borderRadius: '5px', transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow:'0 0 20px rgba(0, 212, 170, 0.4)'
                  }} />
                </div>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'50px', marginBottom:'60px' }}>
              {/* Skills You'll Learn */}
              <div>
                <h4 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '25px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>Skills You'll Learn</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                  {selectedCourse.skills.map(skill => (
                    <span key={skill} style={{
                      background: 'rgba(0,0,0,0.04)',
                      padding: '12px 24px',
                      borderRadius: '15px',
                      fontSize: '15px',
                      fontWeight:'800',
                      color:'var(--text-heading)'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certificate Info */}
              <div className="pf-glass" style={{
                background: 'rgba(0, 212, 170, 0.05) !important',
                border: '1px solid rgba(0, 212, 170, 0.2) !important',
                borderRadius: '32px',
                padding: '35px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                  <div style={{ fontSize: '56px' }}>🏆</div>
                  <div>
                    <div style={{ fontWeight: '900', color: 'var(--brand-teal)', fontSize:'18px', letterSpacing:'1px', textTransform:'uppercase' }}>
                      CERTIFICATE OF COMPLETION
                    </div>
                    <div style={{ fontSize: '18px', color: 'var(--text-heading)', fontWeight:'800', marginTop:'8px' }}>
                      {selectedCourse.certificate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '25px' }}>
              {!isEnrolled(selectedCourse.id) ? (
                <button
                  onClick={() => handleEnroll(selectedCourse)}
                  className="pf-glow-btn"
                  style={{
                    border: 'none',
                    padding: '24px 80px',
                    borderRadius: '45px',
                    fontSize: '20px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    textTransform:'uppercase',
                    letterSpacing:'2px'
                  }}
                >
                  🚀 Enroll Now
                </button>
              ) : (
                <button
                  onClick={() => setCurrentVideo(selectedCourse.videos[0])}
                  className="pf-glow-btn"
                  style={{
                    border: 'none',
                    padding: '24px 80px',
                    borderRadius: '45px',
                    fontSize: '20px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    textTransform:'uppercase',
                    letterSpacing:'2px'
                  }}
                >
                  ▶️ Continue Learning
                </button>
              )}
            </div>
          </div>

          {/* Course Videos */}
          {isEnrolled(selectedCourse.id) && (
            <div className="pf-glass" style={{ padding:'60px', background:'white !important', borderRadius:'50px', border:'none', boxShadow:'0 40px 100px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '45px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>
                Course Curriculum
              </h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                {selectedCourse.videos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => setCurrentVideo(video)}
                    className="pf-glass video-curriculum-item"
                    style={{
                      background: completedVideos[video.id] ? 'rgba(0, 212, 170, 0.03) !important' : 'rgba(0,0,0,0.02) !important',
                      border: 'none',
                      borderRadius: '30px',
                      padding: '35px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '35px',
                      transition:'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div className="pf-glass" style={{
                      width: '90px',
                      height: '60px',
                      borderRadius: '18px',
                      background: completedVideos[video.id] ? 'var(--brand-teal)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      border:'none'
                    }}>
                      {completedVideos[video.id] ? '✅' : '▶️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-heading)', marginBottom: '8px', letterSpacing:'-0.5px' }}>
                        {index + 1}. {video.title}
                      </div>
                      <div style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight:'700' }}>
                        {video.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <style>{`
          .video-curriculum-item:hover { background: white !important; transform: translateX(15px); box-shadow: 0 20px 50px rgba(0,0,0,0.05) !important; }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-body)',
      fontFamily: 'var(--font-main)',
      padding: '80px 20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', maxWidth: '1300px', margin: '0 auto 60px' }}>
        <button 
          onClick={onBack}
          className="pf-glass"
          style={{
            border: 'none', color: 'var(--text-body)',
            padding: '16px 35px', borderRadius: '25px', cursor: 'pointer', fontSize: '13px', fontWeight:'900', letterSpacing:'1.5px', textTransform:'uppercase'
          }}
        >
          ← BACK
        </button>
        <h1 className="pf-shimmer-text" style={{ fontSize: '32px', fontWeight: '900', fontFamily:'var(--font-display)', margin:0, letterSpacing:'-1px' }}>⚡ PathForge Academy</h1>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '20px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-2.5px', lineHeight:1.1 }}>
            🎓 Professional Certifications
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '22px', fontWeight:'700', opacity:0.8, maxWidth:'800px', margin:'0 auto' }}>
            Industry-recognized courses from top companies like Infosys, Microsoft, IBM, and Google
          </p>
        </div>

        {/* Category Tabs */}
        <div className="pf-glass" style={{ display: 'inline-flex', gap: '10px', marginBottom: '80px', padding:'10px', border:'none', background:'rgba(0,0,0,0.03) !important', borderRadius:'45px', left:'50%', transform:'translateX(-50%)', position:'relative' }}>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '16px 40px',
                borderRadius: '35px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '900',
                background: selectedCategory === category ? 'white' : 'transparent',
                color: selectedCategory === category ? 'var(--brand-teal)' : 'var(--text-muted)',
                border: 'none',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: selectedCategory === category ? '0 15px 35px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '40px' }}>
          {CERTIFICATIONS_DATA[selectedCategory].map(course => {
            const progress = isEnrolled(course.id) ? getCourseProgress(course) : 0;
            
            return (
                <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="pf-glass course-card"
                style={{
                  background: 'white !important',
                  borderRadius: '32px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  border:'none',
                  display:'flex',
                  flexDirection:'column',
                  boxShadow:'0 30px 60px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ position:'relative' }}>
                  <img 
                    src={course.thumbnail}
                    alt={course.title}
                    style={{
                      width: '100%',
                      height: '260px',
                      objectFit: 'cover'
                    }}
                  />
                  {isEnrolled(course.id) && (
                    <div style={{ position:'absolute', top:20, right:20, background:'var(--brand-teal)', color:'white', padding:'10px 25px', borderRadius:'25px', fontSize:'14px', fontWeight:'900', boxShadow:'0 10px 25px rgba(0, 212, 170, 0.3)' }}>
                      ENROLLED
                    </div>
                  )}
                </div>
                
                <div style={{ padding:'35px', flex:1, display:'flex', flexDirection:'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <span style={{ background:'rgba(0, 212, 170, 0.1)', color:'var(--brand-teal)', padding:'6px 16px', borderRadius:'20px', fontSize:'12px', fontWeight:'900', letterSpacing:'1px' }}>{course.provider.toUpperCase()}</span>
                    <span style={{ background:'rgba(0,0,0,0.04)', color:'var(--text-muted)', padding:'6px 16px', borderRadius:'20px', fontSize:'12px', fontWeight:'900', letterSpacing:'1px' }}>{course.level.toUpperCase()}</span>
                  </div>
                  
                  <h3 style={{ fontSize:'24px', fontWeight:'900', marginBottom:'15px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>{course.title}</h3>
                  <p style={{ color:'var(--text-muted)', fontSize:'15px', lineHeight:1.6, marginBottom:'25px', fontWeight:'600' }}>{course.description}</p>
                  
                  <div style={{ marginTop:'auto' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' }}>
                      <span style={{ color:'var(--text-muted)', fontSize:'14px', fontWeight:'700' }}>{course.videos.length} Modules • {course.duration}</span>
                      <span style={{ color:'var(--text-heading)', fontSize:'15px', fontWeight:'900' }}>⭐ {course.rating}</span>
                    </div>
                    
                    {isEnrolled(course.id) && (
                      <div style={{ width:'100%', height:'8px', background:'rgba(0,0,0,0.03)', borderRadius:'4px', overflow:'hidden' }}>
                        <div style={{ width:`${progress}%`, height:'100%', background:'var(--brand-teal)', transition:'width 0.8s ease' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .course-card:hover { transform: translateY(-10px); background: white !important; box-shadow: 0 30px 60px rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  );
}
