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

export default function Certifications({ userData, onBack, onProgressUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState('Frontend Development');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedVideos, setCompletedVideos] = useState({});

  const skillName = userData?.skill?.title || 'Frontend Development';
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
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button 
            onClick={() => setCurrentVideo(null)}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
              borderRadius: '20px', cursor: 'pointer', fontSize: '13px'
            }}
          >
            ← Back to Course
          </button>
          <h1 style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 'bold' }}>⚡ PathForge</h1>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Video Player */}
            <div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
                  <iframe
                    src={currentVideo.url}
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
              
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {currentVideo.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Duration: {currentVideo.duration}
                </p>
                <button
                  onClick={() => handleVideoComplete(selectedCourse.id, currentVideo.id)}
                  style={{
                    background: '#2ECC71',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '16px'
                  }}
                >
                  ✅ Mark as Completed
                </button>
              </div>
            </div>

            {/* Course Content */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                Course Content
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedCourse.videos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => setCurrentVideo(video)}
                    style={{
                      background: completedVideos[video.id] ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.05)',
                      border: completedVideos[video.id] ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: currentVideo?.id === video.id ? '#FF6B35' : 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {completedVideos[video.id] ? '✓' : index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>
                        {video.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
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
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button 
            onClick={() => setSelectedCourse(null)}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
              borderRadius: '20px', cursor: 'pointer', fontSize: '13px'
            }}
          >
            ← Back to Certifications
          </button>
          <h1 style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 'bold' }}>⚡ PathForge</h1>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
              <img 
                src={selectedCourse.thumbnail}
                alt={selectedCourse.title}
                style={{
                  width: '200px',
                  height: '150px',
                  borderRadius: '12px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{
                    background: 'rgba(255,107,53,0.2)',
                    color: '#FF6B35',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {selectedCourse.provider}
                  </span>
                  <span style={{
                    background: 'rgba(52,152,219,0.2)',
                    color: '#3498DB',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {selectedCourse.level}
                  </span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                  {selectedCourse.title}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '16px' }}>
                  {selectedCourse.description}
                </p>
                <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  <div>📅 {selectedCourse.duration}</div>
                  <div>⭐ {selectedCourse.rating} rating</div>
                  <div>👥 {selectedCourse.enrolled.toLocaleString()} enrolled</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isEnrolled(selectedCourse.id) && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Your Progress</span>
                  <span style={{ fontSize: '14px', color: '#FF6B35' }}>{progress}%</span>
                </div>
                <div style={{
                  width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px', overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`, height: '100%',
                    background: '#FF6B35',
                    borderRadius: '4px', transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Skills You'll Learn */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Skills You'll Learn</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedCourse.skills.map(skill => (
                  <span key={skill} style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certificate Info */}
            <div style={{
              background: 'rgba(46,204,113,0.1)',
              border: '1px solid rgba(46,204,113,0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🏆</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#2ECC71' }}>
                    Certificate of Completion
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                    {selectedCourse.certificate}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {!isEnrolled(selectedCourse.id) ? (
                <button
                  onClick={() => handleEnroll(selectedCourse)}
                  style={{
                    background: '#FF6B35',
                    color: 'white',
                    border: 'none',
                    padding: '14px 32px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🚀 Enroll Now
                </button>
              ) : (
                <button
                  onClick={() => setCurrentVideo(selectedCourse.videos[0])}
                  style={{
                    background: '#2ECC71',
                    color: 'white',
                    border: 'none',
                    padding: '14px 32px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ▶️ Continue Learning
                </button>
              )}
            </div>
          </div>

          {/* Course Videos */}
          {isEnrolled(selectedCourse.id) && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                Course Videos
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedCourse.videos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => setCurrentVideo(video)}
                    style={{
                      background: completedVideos[video.id] ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.05)',
                      border: completedVideos[video.id] ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      {completedVideos[video.id] ? '✅' : '▶️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {index + 1}. {video.title}
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                        {video.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'transparent', color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
            borderRadius: '20px', cursor: 'pointer', fontSize: '13px'
          }}
        >
          ← Back
        </button>
        <h1 style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 'bold' }}>⚡ PathForge</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            🎓 Professional Certifications
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            Industry-recognized courses from top companies like Infosys, Microsoft, IBM, and Google
          </p>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedCategory === category ? 'bold' : 'normal',
                background: selectedCategory === category ? '#FF6B35' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {CERTIFICATIONS_DATA[selectedCategory].map(course => {
            const progress = isEnrolled(course.id) ? getCourseProgress(course) : 0;
            
            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                <img 
                  src={course.thumbnail}
                  alt={course.title}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover'
                  }}
                />
                
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                      background: 'rgba(255,107,53,0.2)',
                      color: '#FF6B35',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {course.provider}
                    </span>
                    <span style={{
                      background: 'rgba(52,152,219,0.2)',
                      color: '#3498DB',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {course.level}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {course.title}
                  </h3>
                  
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
                    {course.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      📅 {course.duration}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      ⭐ {course.rating}
                    </div>
                  </div>

                  {/* Progress Bar for Enrolled Courses */}
                  {isEnrolled(course.id) && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px' }}>Progress</span>
                        <span style={{ fontSize: '12px', color: '#FF6B35' }}>{progress}%</span>
                      </div>
                      <div style={{
                        width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)',
                        borderRadius: '2px', overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${progress}%`, height: '100%',
                          background: '#FF6B35',
                          borderRadius: '2px'
                        }} />
                      </div>
                    </div>
                  )}

                  <div style={{
                    background: 'rgba(46,204,113,0.1)',
                    border: '1px solid rgba(46,204,113,0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#2ECC71',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    🏆 {course.certificate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
