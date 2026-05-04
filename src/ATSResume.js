import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function toBulletLines(value) {
  return value.split('\n').map((line) => line.replace(/^•\s*/, '').trim()).filter(Boolean);
}

export default function ATSResume({ userData, onBack }) {
  const name = userData?.name || 'Your Name';
  const skill = userData?.skill?.title || 'Software Development';
  const city = userData?.city || 'India';
  const experience = userData?.experience?.label || 'Beginner';
  const email = userData?.email || '';
  const phone = userData?.phone || '';
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 4;
  const resumeRef = useRef(null);

  function getDefaultSkills(track) {
    const map = {
      'Frontend Development': 'HTML, CSS, JavaScript, React.js, Tailwind CSS, Git, Responsive Design',
      'Backend Development': 'Node.js, Express.js, Python, REST APIs, MongoDB, SQL, Git',
      'Artificial Intelligence': 'Python, TensorFlow, PyTorch, Scikit-learn, NLP, Data Preprocessing',
      'Data Science': 'Python, Pandas, NumPy, Matplotlib, SQL, Power BI, Machine Learning',
      'Mobile Development': 'React Native, Flutter, Dart, Android SDK, Firebase, REST APIs',
      'Cyber Security': 'Network Security, Ethical Hacking, Kali Linux, Wireshark, OWASP, Python',
      'Cloud Computing': 'AWS, Azure, Docker, Kubernetes, CI/CD, Terraform, Linux',
      'UI/UX Design': 'Figma, Adobe XD, Wireframing, Prototyping, User Research, Design Systems',
    };
    return map[track] || 'JavaScript, Python, Git, Problem Solving, Communication';
  }

  function getDefaultProjects(track) {
    const map = {
      'Frontend Development': '• Portfolio Website — Built a responsive personal portfolio using React.js and Tailwind CSS\n• E-Commerce UI — Designed and developed a product listing page with cart functionality',
      'Backend Development': '• REST API Server — Built a full CRUD API using Node.js, Express, and MongoDB\n• Authentication System — Implemented JWT-based login/signup with email verification',
      'Artificial Intelligence': '• Sentiment Analyzer — Built an NLP model to classify tweet sentiments using Python & NLTK\n• Image Classifier — Trained a CNN model to classify handwritten digits (MNIST dataset)',
      'Data Science': '• Sales Dashboard — Analyzed and visualized sales data using Python, Pandas & Power BI\n• Churn Prediction — Built an ML model to predict customer churn with 87% accuracy',
      'Mobile Development': '• Task Manager App — Built a cross-platform task app using React Native with Firebase sync\n• Weather App — Developed a Flutter app with real-time weather using OpenWeather API',
      'Cyber Security': '• Vulnerability Scanner — Built a Python tool to detect common web vulnerabilities\n• Network Packet Analyzer — Captured and analyzed network packets using Wireshark',
      'Cloud Computing': '• AWS Deployment — Deployed a Node.js app on AWS EC2 with S3 storage and RDS\n• Docker Pipeline — Containerized a web app with Docker and set up CI/CD using GitHub Actions',
      'UI/UX Design': '• E-Commerce App Redesign — Redesigned user flow and UI for a shopping app in Figma\n• Dashboard UI — Created a data dashboard wireframe and prototype for a SaaS product',
    };
    return map[track] || '• Project 1 — Description of your key project\n• Project 2 — Description of another project';
  }

  function getDefaultCerts(track) {
    const map = {
      'Frontend Development': '• Meta Frontend Developer Certificate — Coursera\n• JavaScript Algorithms — freeCodeCamp',
      'Backend Development': '• Node.js Developer Certificate — Udemy\n• MongoDB Developer — MongoDB University',
      'Artificial Intelligence': '• Machine Learning Specialization — Andrew Ng, Coursera\n• Deep Learning Specialization — deeplearning.ai',
      'Data Science': '• Google Data Analytics Certificate — Coursera\n• Python for Data Science — IBM, Coursera',
      'Mobile Development': '• Flutter & Dart — Udemy\n• React Native — Meta, Coursera',
      'Cyber Security': '• Certified Ethical Hacker (CEH) — EC-Council\n• CompTIA Security+ — CompTIA',
      'Cloud Computing': '• AWS Cloud Practitioner — Amazon\n• Microsoft Azure Fundamentals — Microsoft',
      'UI/UX Design': '• Google UX Design Certificate — Coursera\n• Figma UI Design — Udemy',
    };
    return map[track] || '• Relevant Certification — Platform';
  }

  const [resumeData, setResumeData] = useState({
    name,
    email,
    phone,
    city,
    title: `${skill} Engineer`,
    summary: `Motivated ${skill} enthusiast from ${city}, seeking opportunities to apply and grow technical skills. ${experience.includes('Intermediate') || experience.includes('Advanced') ? 'Experienced in building real-world projects.' : 'Eager to learn and contribute to impactful teams.'}`,
    skills: getDefaultSkills(skill),
    education: userData?.education || `B.Tech / B.E. — Computer Science\nYour University Name · ${startYear}–${currentYear}`,
    projects: getDefaultProjects(skill),
    certifications: getDefaultCerts(skill),
  });

  const [photo, setPhoto] = useState('');
  const [downloading, setDownloading] = useState(false);
  const update = (field, value) => setResumeData((prev) => ({ ...prev, [field]: value }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result?.toString() || '');
    reader.readAsDataURL(file);
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(resumeRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`${resumeData.name.replace(/\s+/g, '_')}_Resume.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const fieldStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', resize: 'vertical',
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '20px', marginBottom: '16px',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: 'Arial, sans-serif', padding: '30px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '1160px', margin: '0 auto 24px' }}>
        <button onClick={onBack} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
        <h1 style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 'bold' }}>⚡ PathForge</h1>
      </div>

      <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '18px' }}>
        <div>
          <div style={sectionStyle}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#FF6B35', marginBottom: '16px' }}>Resume Editor</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input style={fieldStyle} value={resumeData.name} onChange={(e) => update('name', e.target.value)} placeholder="Full Name" />
              <input style={fieldStyle} value={resumeData.title} onChange={(e) => update('title', e.target.value)} placeholder="Job Title" />
              <input style={fieldStyle} type="email" value={resumeData.email} onChange={(e) => update('email', e.target.value)} placeholder="Email" />
              <input style={fieldStyle} value={resumeData.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone" />
              <input style={{ ...fieldStyle, gridColumn: '1/-1' }} value={resumeData.city} onChange={(e) => update('city', e.target.value)} placeholder="City" />
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontSize: '12px', color: '#FF6B35', display: 'block', marginBottom: '6px' }}>Profile Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            </div>
          </div>

          <div style={sectionStyle}><textarea style={{ ...fieldStyle, minHeight: '84px' }} value={resumeData.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Professional summary" /></div>
          <div style={sectionStyle}><textarea style={{ ...fieldStyle, minHeight: '70px' }} value={resumeData.skills} onChange={(e) => update('skills', e.target.value)} placeholder="Skills separated by commas" /></div>
          <div style={sectionStyle}><textarea style={{ ...fieldStyle, minHeight: '100px' }} value={resumeData.projects} onChange={(e) => update('projects', e.target.value)} placeholder="Projects (one per line with bullet)" /></div>
          <div style={sectionStyle}><textarea style={{ ...fieldStyle, minHeight: '64px' }} value={resumeData.education} onChange={(e) => update('education', e.target.value)} placeholder="Education" /></div>
          <div style={sectionStyle}><textarea style={{ ...fieldStyle, minHeight: '74px' }} value={resumeData.certifications} onChange={(e) => update('certifications', e.target.value)} placeholder="Certifications" /></div>
          <button onClick={handleDownloadPDF} disabled={downloading} style={{ width: '100%', background: '#FF6B35', color: 'white', border: 'none', padding: '14px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: downloading ? 0.75 : 1 }}>
            {downloading ? 'Generating PDF...' : '⬇ Download Attractive Resume (PDF)'}
          </button>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px' }}>
          <div ref={resumeRef} style={{ width: '100%', background: 'white', color: '#111', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ background: 'linear-gradient(120deg, #12203a, #1f4f94)', color: 'white', padding: '24px 26px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '4px' }}>{resumeData.name}</div>
                <div style={{ fontSize: '14px', letterSpacing: '0.2px', opacity: 0.95 }}>{resumeData.title}</div>
                <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>
                  {resumeData.email} | {resumeData.phone} | {resumeData.city}
                </div>
              </div>
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.65)', background: '#dbe7ff', flexShrink: 0 }}>
                {photo ? (
                  <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f5f8f', fontWeight: 'bold', fontSize: '12px' }}>PHOTO</div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.4fr' }}>
              <div style={{ background: '#f4f7fc', padding: '18px 16px' }}>
                <div style={{ fontWeight: 'bold', color: '#0f2e5c', marginBottom: '8px', fontSize: '13px' }}>Skills</div>
                <div style={{ fontSize: '12px', lineHeight: 1.7 }}>{resumeData.skills.split(',').map((s) => s.trim()).filter(Boolean).map((skillItem, i) => <div key={i}>• {skillItem}</div>)}</div>
                <div style={{ fontWeight: 'bold', color: '#0f2e5c', margin: '14px 0 8px', fontSize: '13px' }}>Certifications</div>
                <div style={{ fontSize: '12px', lineHeight: 1.65 }}>{toBulletLines(resumeData.certifications).map((line, i) => <div key={i}>• {line}</div>)}</div>
              </div>
              <div style={{ padding: '18px 18px 20px' }}>
                <div style={{ fontWeight: 'bold', color: '#143461', marginBottom: '6px', fontSize: '13px' }}>Professional Summary</div>
                <div style={{ fontSize: '12px', lineHeight: 1.7, marginBottom: '12px' }}>{resumeData.summary}</div>

                <div style={{ fontWeight: 'bold', color: '#143461', marginBottom: '6px', fontSize: '13px' }}>Projects</div>
                <div style={{ fontSize: '12px', lineHeight: 1.7, marginBottom: '12px' }}>
                  {toBulletLines(resumeData.projects).map((line, i) => <div key={i}>• {line}</div>)}
                </div>

                <div style={{ fontWeight: 'bold', color: '#143461', marginBottom: '6px', fontSize: '13px' }}>Education</div>
                <div style={{ fontSize: '12px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{resumeData.education}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}