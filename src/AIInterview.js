import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PREDEFINED_FIELDS = [
  "Frontend Developer",
  "Backend Engineer",
  "Data Scientist",
  "UI/UX Designer",
  "Product Manager",
  "Full Stack Engineer",
  "Other"
];

const MAX_WARNINGS = 5;
const MAX_PERSON_WARNINGS = 3; // Terminate after 3 person violations
const MAX_EYE_WARNINGS = 5; // Terminate after 5 eye tracking violations

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

export default function AIInterview({ userData, onBack, onComplete, theme }) {
  const currentTheme = theme || defaultTheme;
  // Setup Phase
  const [setupPhase, setSetupPhase] = useState(true);
  const [selectedField, setSelectedField] = useState('');
  const [customField, setCustomField] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Recording / Transcription States
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [timer, setTimer] = useState(60); 
  const [stream, setStream] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Integrity States
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [personCount, setPersonCount] = useState(1);
  const [securityViolation, setSecurityViolation] = useState(null);
  const [boundingBox, setBoundingBox] = useState(null);
  
  // Enhanced Detection States
  const [warnings, setWarnings] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const [eyeContactScore, setEyeContactScore] = useState(100);
  const [personDetected, setPersonDetected] = useState(false);
  const [sessionTerminated, setSessionTerminated] = useState(false);
  
  // Biometric Protection States
  const [personWarningCount, setPersonWarningCount] = useState(0);
  const [eyeWarningCount, setEyeWarningCount] = useState(0);
  const [eyeTrackingData, setEyeTrackingData] = useState({ x: 0, y: 0, movement: 0 });
  const [personBoundingBox, setPersonBoundingBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [biometricStatus, setBiometricStatus] = useState('active'); // active, warning, terminated
  
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const lastWarningTime = useRef(0);
  const analyzerRef = useRef(null);
  const recognitionRef = useRef(null);
  const prevMassesRef = useRef({ l: 0, r: 0 });
  
  // Biometric Tracking Refs
  const lastPersonWarningTime = useRef(0);
  const lastEyeWarningTime = useRef(0);
  const previousEyePosition = useRef({ x: 0, y: 0 });
  const eyeMovementAccumulator = useRef(0);
  const personDetectionHistory = useRef([]);

  const targetField = selectedField === 'Other' ? customField : selectedField;
  const isFieldValid = targetField.length > 2 && /^[a-zA-Z\s]+$/.test(targetField);

  // Biometric Protection Functions
  const detectPersonInFrame = (frameData) => {
    // Square detection method - analyze frame for human presence
    let skinPixels = 0;
    let totalPixels = frameData.length / 4;
    let minX = 320, maxX = 0, minY = 240, maxY = 0;
    
    for (let i = 0; i < frameData.length; i += 4) {
      const x = (i / 4) % 320;
      const y = Math.floor((i / 4) / 320);
      const r = frameData[i];
      const g = frameData[i + 1];
      const b = frameData[i + 2];
      
      // Skin detection
      const isSkin = (r > 95 && g > 40 && b > 20 && r > g && r > b);
      
      if (isSkin) {
        skinPixels++;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    
    const skinRatio = skinPixels / totalPixels;
    const hasPerson = skinRatio > 0.05; // At least 5% skin pixels
    
    // Calculate bounding box for person
    const boundingBox = hasPerson ? {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    } : null;
    
    // Check for multiple people using square method
    const personArea = (maxX - minX) * (maxY - minY);
    const expectedSinglePersonArea = 15000; // Expected area for one person
    const multiplePersonThreshold = expectedSinglePersonArea * 2.5;
    
    const multiplePeopleDetected = hasPerson && personArea > multiplePersonThreshold;
    
    return {
      hasPerson,
      multiplePeopleDetected,
      boundingBox,
      confidence: skinRatio
    };
  };
  
  const trackEyeMovement = (frameData, boundingBox) => {
    if (!boundingBox) return { x: 0, y: 0, movement: 0, valid: false };
    
    // Focus on eye region (upper third of face)
    const eyeRegionY = boundingBox.y + (boundingBox.height * 0.2);
    const eyeRegionHeight = boundingBox.height * 0.3;
    const eyeRegionX = boundingBox.x + (boundingBox.width * 0.2);
    const eyeRegionWidth = boundingBox.width * 0.6;
    
    let eyePixels = [];
    
    for (let y = eyeRegionY; y < eyeRegionY + eyeRegionHeight && y < 240; y++) {
      for (let x = eyeRegionX; x < eyeRegionX + eyeRegionWidth && x < 320; x++) {
        const i = (y * 320 + x) * 4;
        const r = frameData[i];
        const g = frameData[i + 1];
        const b = frameData[i + 2];
        
        // Eye detection (dark pixels in eye region)
        const brightness = (r + g + b) / 3;
        if (brightness < 80) { // Dark pixels likely eyes
          eyePixels.push({ x, y, brightness });
        }
      }
    }
    
    if (eyePixels.length < 10) return { x: 0, y: 0, movement: 0, valid: false };
    
    // Calculate center of eye region
    const avgX = eyePixels.reduce((sum, p) => sum + p.x, 0) / eyePixels.length;
    const avgY = eyePixels.reduce((sum, p) => sum + p.y, 0) / eyePixels.length;
    
    // Calculate movement from previous position
    const prevX = previousEyePosition.current.x || avgX;
    const prevY = previousEyePosition.current.y || avgY;
    const movement = Math.sqrt(Math.pow(avgX - prevX, 2) + Math.pow(avgY - prevY, 2));
    
    // Update previous position
    previousEyePosition.current = { x: avgX, y: avgY };
    
    // Accumulate movement
    eyeMovementAccumulator.current += movement;
    
    return {
      x: avgX,
      y: avgY,
      movement: eyeMovementAccumulator.current,
      valid: true
    };
  };
  
  const handlePersonViolation = () => {
    const now = Date.now();
    if (now - lastPersonWarningTime.current < 10000) return; // 10 second throttle
    
    setPersonWarningCount(prev => {
      const newCount = prev + 1;
      
      if (newCount >= MAX_PERSON_WARNINGS) {
        setBiometricStatus('terminated');
        terminateSession('Multiple person violations detected. Session terminated for security reasons.');
      } else {
        setBiometricStatus('warning');
        addWarning('multiple_persons', `👥 Unauthorized person detected! Warning ${newCount}/${MAX_PERSON_WARNINGS}`);
      }
      
      return newCount;
    });
    
    lastPersonWarningTime.current = now;
  };
  
  const handleEyeViolation = () => {
    const now = Date.now();
    if (now - lastEyeWarningTime.current < 8000) return; // 8 second throttle for eye tracking
    
    setEyeWarningCount(prev => {
      const newCount = prev + 1;
      
      if (newCount >= MAX_EYE_WARNINGS) {
        setBiometricStatus('terminated');
        terminateSession('Excessive eye movement detected. Session terminated for security reasons.');
      } else {
        addWarning('eye_tracking', `👁️ Suspicious eye movement detected! Warning ${newCount}/${MAX_EYE_WARNINGS}`);
      }
      
      return newCount;
    });
    
    lastEyeWarningTime.current = now;
  };
  
  const resetEyeMovementAccumulator = () => {
    eyeMovementAccumulator.current = 0;
  };

  // Warning System Functions
  const addWarning = (type, message) => {
    const now = Date.now();
    if (now - lastWarningTime < 2000) return; // Prevent spam warnings
    
    const newWarning = {
      id: Date.now(),
      type,
      message,
      timestamp: now
    };
    
    setWarnings(prev => [...prev, newWarning]);
    
    // Auto-remove warning after 5 seconds
    setTimeout(() => {
      setWarnings(prev => prev.filter(w => w.id !== newWarning.id));
    }, 5000);
    
    // Terminate session after 5 warnings
    if (warnings.length >= 4) {
      terminateSession('Maximum warnings reached. Session terminated for security reasons.');
    }
  };

  const terminateSession = (reason) => {
    setSessionTerminated(true);
    stopRecording();
    stopStream();
    setSecurityViolation(reason);
    setRecorded(false);
  };

  // TAB & WINDOW FOCUS LOCK
  useEffect(() => {
    const triggerViolation = () => {
      if (recording) handleViolation("🚫 SECURITY VIOLATION: Unauthorized window switch or focus loss detected.");
    };
    window.addEventListener("blur", triggerViolation);
    document.addEventListener("visibilitychange", () => { if (document.hidden) triggerViolation(); });
    return () => {
      window.removeEventListener("blur", triggerViolation);
      document.removeEventListener("visibilitychange", triggerViolation);
    };
    // eslint-disable-next-line
  }, [recording]);

  // Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let finalStr = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalStr += event.results[i][0].transcript;
      }
      if (finalStr) setCurrentTranscript(prev => prev + ' ' + finalStr);
    };
    recognitionRef.current = recognition;
  }, []);

  // Kill Stream Utility
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    recognitionRef.current?.stop();
  };

  // Start Camera & Audio Analysis
  useEffect(() => {
    if (setupPhase) return;
    async function startCam() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyzer = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(s);
        source.connect(analyzer);
        analyzer.fftSize = 256;
        audioContextRef.current = audioContext;
        analyzerRef.current = analyzer;
        
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        const checkNoise = () => {
          if (!analyzerRef.current) return;
          analyzerRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setNoiseLevel(Math.round(avg * 1.5));
          requestAnimationFrame(checkNoise);
        };
        checkNoise();
      } catch (err) { alert("Camera access denied."); }
    }
    startCam();
    return () => stopStream();
    // eslint-disable-next-line
  }, [setupPhase]);

  // ENHANCED BIOMETRIC PROTECTION SYSTEM
  useEffect(() => {
    if (setupPhase || !videoRef.current || results || sessionTerminated) return;

    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    let frameCount = 0;
    
    const interval = setInterval(() => {
      if (!videoRef.current) return;

      canvasRef.current.width = 320;
      canvasRef.current.height = 240;
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      const frame = ctx.getImageData(0, 0, 320, 240).data;
      
      frameCount++;
      
      // BIOMETRIC PERSON DETECTION (Square Method)
      const personDetection = detectPersonInFrame(frame);
      
      if (personDetection.hasPerson) {
        setPersonDetected(true);
        
        // Update person bounding box
        if (personDetection.boundingBox) {
          const normalizedBox = {
            x: (personDetection.boundingBox.x / 320) * 100,
            y: (personDetection.boundingBox.y / 240) * 100,
            w: (personDetection.boundingBox.width / 320) * 100,
            h: (personDetection.boundingBox.height / 240) * 100
          };
          setBoundingBox(normalizedBox);
          setPersonBoundingBox(personDetection.boundingBox);
        }
        
        // Check for multiple people using square detection
        if (personDetection.multiplePeopleDetected && recording) {
          handlePersonViolation();
        }
        
        // EYE TRACKING SYSTEM
        if (personDetection.boundingBox && recording) {
          const eyeTracking = trackEyeMovement(frame, personDetection.boundingBox);
          
          if (eyeTracking.valid) {
            setEyeTrackingData(eyeTracking);
            
            // Check for excessive eye movement
            const movementThreshold = 500; // Accumulated movement threshold
            if (eyeTracking.movement > movementThreshold) {
              handleEyeViolation();
              resetEyeMovementAccumulator(); // Reset after violation
            }
            
            // Update eye contact score based on stability
            const movementStability = Math.max(0, 100 - (eyeTracking.movement / 10));
            setEyeContactScore(movementStability);
          }
        }
        
      } else {
        setPersonDetected(false);
        setBoundingBox(null);
        setPersonBoundingBox({ x: 0, y: 0, width: 0, height: 0 });
        
        // Warning for no person detected
        if (frameCount % 60 === 0 && recording) { // Check every ~9 seconds
          addWarning('no_person', '⚠️ No person detected in camera view');
        }
      }
      
      // Update biometric status based on warnings
      if (personWarningCount >= 2 || eyeWarningCount >= 4) {
        setBiometricStatus('warning');
      } else if (personWarningCount === 0 && eyeWarningCount === 0) {
        setBiometricStatus('active');
      }
      
    }, 150); // Monitor every 150ms

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [setupPhase, recording, results, sessionTerminated]);

  // Countdown Timer
  useEffect(() => {
    let interval;
    if (recording && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && recording) {
      nextQuestion();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [recording, timer]);

  const handleViolation = (msg) => {
    stopRecording();
    setSecurityViolation(msg);
    setRecorded(false);
    stopStream();
  };

  const handleBack = () => {
    stopStream();
    onBack();
  };

  const generateQuestions = async () => {
    if (!isFieldValid) return;
    setAnalyzing(true);
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('PATHFORGE_GEMINI_API_KEY');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate 5 high-quality technical interview questions for: ${targetField}. Return as plain list.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const qList = text.split('\n').filter(q => q.trim().length > 5).slice(0, 5);
      setQuestions(qList.length > 0 ? qList : ["Tell us about your background.", "Describe a complex bug.", "How do you handle scalability?", "What is your testing strategy?", "Explain a technical trade-off."]);
      setSetupPhase(false);
    } catch (e) {
      setQuestions(["Explain your technical background.", "Describe a complex bug.", "How do you handle scalability?", "What is your testing strategy?", "Explain a technical trade-off."]);
      setSetupPhase(false);
    } finally { setAnalyzing(false); }
  };

  const startRecording = () => {
    setRecording(true);
    setRecorded(false);
    setTimer(60);
    setCurrentTranscript('');
    setTranscripts([]);
    chunksRef.current = [];
    try { recognitionRef.current?.start(); } catch(e){}
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoUrl(URL.createObjectURL(blob));
    };
    recorder.start();
  };

  const stopRecording = () => {
    setRecording(false);
    setRecorded(true);
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
  };

  const nextQuestion = () => {
    setTranscripts(prev => [...prev, currentTranscript]);
    setCurrentTranscript('');
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setTimer(60);
    } else { stopRecording(); }
  };

  const analyzeInterview = async () => {
    setAnalyzing(true);
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('PATHFORGE_GEMINI_API_KEY');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const interviewContext = questions.map((q, i) => `Q: ${q}\nA: ${transcripts[i] || 'Silent'}`).join('\n\n');
      const prompt = `Perform a brutal technical audit of this ${targetField} interview. 
      STRICT RULES:
      - If answers are gibberish, empty, or unrelated, the rating MUST be 0.0/10.
      - Evaluate technical depth only.
      
      TRANSCRIPT:
      ${interviewContext}
      
      Return ONLY a valid JSON:
      {
        "rating": number (out of 10),
        "confidence": "string",
        "feelings": "string",
        "explanation": "brutal 1-sentence summary",
        "detailedJudgement": "A detailed 3-sentence technical audit.",
        "metrics": { "communication": number, "technical": number, "integrity": 100 }
      }`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, '').trim();
      setResults(JSON.parse(cleaned));
      stopStream();
    } catch (e) {
      setResults({ rating: 0.0, confidence: "None", feelings: "Silent", explanation: "Failed audit.", detailedJudgement: "No depth.", metrics: { communication: 0, technical: 0, integrity: 100 } });
      stopStream();
    } finally { setAnalyzing(false); }
  };

  if (setupPhase) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg-base)', color:'var(--text-body)', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 20px', fontFamily:'var(--font-main)' }}>
        <div className="pf-glass" style={{ maxWidth:'1000px', width:'100%', padding:'80px', textAlign:'center', borderRadius:'60px', border:'none', boxShadow: '0 60px 150px rgba(0,0,0,0.08)', background:'white !important' }}>
          <div style={{ fontSize:'120px', marginBottom:'50px', filter:'drop-shadow(0 30px 60px rgba(0, 212, 170, 0.25))' }}>🎥</div>
          <h2 className="pf-shimmer-text" style={{ fontSize:'72px', fontWeight:'900', marginBottom:'25px', fontFamily:'var(--font-display)', letterSpacing:'-3.5px', lineHeight:1 }}>Interview Studio</h2>
          <p style={{ color:'var(--text-muted)', marginBottom:'80px', fontWeight:'900', fontSize:'24px', opacity:0.6, letterSpacing: '1px' }}>SELECT YOUR TARGET DOMAIN FOR A PRECISION TECHNICAL AUDIT.</p>
          
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'25px', marginBottom:'60px' }}>
            {PREDEFINED_FIELDS.map(f => (
              <button 
                key={f}
                onClick={() => setSelectedField(f)}
                className={selectedField === f ? "" : "pf-glass"}
                style={{ 
                  padding:'25px', borderRadius:'30px', 
                  background: selectedField === f ? 'var(--brand-teal) !important' : 'rgba(0,0,0,0.01) !important', 
                  border: 'none',
                  color: selectedField === f ? 'white' : 'var(--text-heading)', 
                  cursor:'pointer', fontSize:'16px', fontWeight:'900', transition:'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: selectedField === f ? '0 20px 50px rgba(0, 212, 170, 0.3)' : '0 5px 15px rgba(0,0,0,0.02)',
                  textTransform:'uppercase', letterSpacing:'2px',
                  transform: selectedField === f ? 'translateY(-10px)' : 'translateY(0)'
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {selectedField === 'Other' && (
            <input 
              type="text" 
              placeholder="SPECIFY YOUR CORE EXPERTISE..." 
              value={customField}
              onChange={(e) => setCustomField(e.target.value)}
              className="pf-glass"
              style={{ width:'100%', padding:'35px', borderRadius:'40px', background:'rgba(0,0,0,0.01) !important', border:'none !important', color:'var(--text-heading)', marginBottom:'60px', outline:'none', fontSize:'22px', fontWeight:'800', fontFamily:'var(--font-main)', textAlign:'center', boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.03)' }}
            />
          )}

          <button 
            onClick={generateQuestions}
            disabled={!isFieldValid || analyzing}
            className={isFieldValid ? "pf-glow-btn" : "pf-glass"}
            style={{ width:'100%', padding:'35px', borderRadius:'45px', border:'none', fontWeight:'900', cursor: isFieldValid ? 'pointer' : 'not-allowed', fontSize:'24px', textTransform:'uppercase', letterSpacing:'4px', opacity: isFieldValid ? 1 : 0.5 }}
          >
            {analyzing ? 'CALIBRATING AI INTERVIEWER...' : 'INITIATE PROCTORED SESSION ⚡'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', color:'var(--text-body)', padding:'80px 20px', fontFamily:'var(--font-main)' }}>
      
      <div style={{ display:'flex', alignItems:'center', gap:'30px', maxWidth:'1300px', margin:'0 auto 60px' }}>
        <button onClick={handleBack} className="pf-glass" style={{ border:'none', padding:'16px 35px', cursor:'pointer', fontSize:'13px', fontWeight:'900', borderRadius:'25px', letterSpacing:'1.5px', textTransform:'uppercase' }}>BACK</button>
        <h1 className="pf-shimmer-text" style={{ fontSize:'42px', fontWeight:'900', margin:0, fontFamily:'var(--font-display)', letterSpacing:'-2.5px' }}>⚡ AI INTERVIEW STUDIO</h1>
      </div>

      {securityViolation && (
        <div className="pf-glass" style={{ maxWidth:'1100px', margin:'0 auto 80px', border:'none', borderRadius:'50px', padding:'60px', textAlign:'center', color:'var(--brand-coral)', background:'white !important', boxShadow: '0 40px 100px rgba(255, 107, 107, 0.15)' }}>
          <div style={{ fontSize:'48px', fontWeight:'900', marginBottom:'25px', fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>⚠️ SECURITY LOCK TRIGGERED</div>
          <p style={{ fontWeight:'900', fontSize:'26px', opacity:0.8, letterSpacing:'-0.5px' }}>{securityViolation.toUpperCase()}</p>
          <button onClick={() => window.location.reload()} className="pf-glow-btn" style={{ border:'none', marginTop:'50px', padding:'25px 60px', borderRadius:'35px', fontSize:'17px', background:'var(--brand-coral) !important', fontWeight:'900', textTransform:'uppercase', letterSpacing:'3px' }}>RE-AUTHENTICATE & RESTART</button>
        </div>
      )}

      <div style={{ maxWidth:'1400px', margin:'0 auto', display:'grid', gridTemplateColumns: results ? '1fr 1.2fr' : '1fr', gap:'80px' }}>
        
        <div style={{ display:'flex', flexDirection:'column', gap:'50px' }}>
          {!results && (
            <div className="pf-glass" style={{ padding:'60px', border:'none', background:'white !important', borderRadius:'50px', boxShadow: '0 30px 80px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px' }}>
                <div style={{ fontSize:'14px', color:'var(--brand-teal)', fontWeight:'900', textTransform:'uppercase', letterSpacing:'3px', opacity:0.5 }}>CALIBRATION UNIT {currentQIndex + 1} / {questions.length}</div>
                <div style={{ display:'flex', gap:'40px', alignItems:'center' }}>
                  {recording && <div className="pf-shimmer-text" style={{ fontSize:'42px', fontWeight:'900', color:'var(--brand-coral)', fontFamily:'var(--font-display)', letterSpacing:'-2px', lineHeight:1 }}>⏱️ {timer}S</div>}
                  
                  <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
                    <div style={{ 
                      fontSize:'12px', fontWeight:'900', padding:'12px 25px', borderRadius:'20px',
                      background: biometricStatus === 'terminated' ? 'var(--brand-coral)' : biometricStatus === 'warning' ? 'var(--brand-yellow)' : 'var(--brand-teal)',
                      color: 'white', textTransform:'uppercase', letterSpacing:'2px', border:'none',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                      {biometricStatus === 'terminated' ? 'SESSION LOCKED' : biometricStatus === 'warning' ? 'ACTIVE MONITOR' : 'SECURE LINK'}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize:'38px', fontWeight:'900', lineHeight:'1.3', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>{questions[currentQIndex]}</div>
            </div>
          )}

          <div style={{ position:'relative', borderRadius:'60px', overflow:'hidden', background:'#000', border:'none', boxShadow:'0 60px 150px rgba(0,0,0,0.25)', aspectRatio:'16/9' }}>
            {!recorded ? (
              <>
                <video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter: securityViolation ? 'blur(80px) grayscale(1)' : 'none' }} />
                {boundingBox && !securityViolation && (
                  <div style={{ 
                    position:'absolute', 
                    border:`4px solid ${personCount > 1 ? 'var(--brand-coral)' : 'var(--brand-teal)'}`, 
                    left: `${boundingBox.x}%`, top: `${boundingBox.y}%`, 
                    width: `${boundingBox.w}%`, height: `${boundingBox.h}%`, 
                    transition: 'all 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: `0 0 100px ${personCount > 1 ? 'var(--brand-coral)' : 'var(--brand-teal)'}`,
                    borderRadius: '40px', pointerEvents: 'none'
                  }}>
                    <div style={{ position:'absolute', top:'-50px', left:0, background: personCount > 1 ? 'var(--brand-coral)' : 'var(--brand-teal)', color:'white', fontSize:'13px', padding:'10px 25px', borderRadius:'15px', fontWeight:'900', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'2px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                      {personCount > 1 ? '⚠️ MULTIPLE ENTITIES DETECTED' : '🎯 NEURAL TRACKING ACTIVE'}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <video src={videoUrl} controls style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            )}

            {recording && currentTranscript && (
              <div className="pf-glass" style={{ position:'absolute', bottom:60, left:60, right:60, padding:'40px', background:'rgba(255,255,255,0.98) !important', borderRadius:'40px', border:'none', boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}>
                <div style={{ fontSize:'13px', color:'var(--brand-teal)', fontWeight:'900', marginBottom:'15px', textTransform:'uppercase', letterSpacing:'3px', opacity:0.6 }}>SYNCHRONIZED SPEECH CAPTURE</div>
                <div style={{ fontSize:'22px', color:'var(--text-heading)', fontStyle:'italic', fontWeight:'700', lineHeight:1.6 }}>"...{currentTranscript.slice(-180)}"</div>
              </div>
            )}

            {!results && (
              <div style={{ position:'absolute', top:60, left:60, display:'flex', flexDirection:'column', gap:'25px' }}>
                <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
                  <div style={{ 
                    background: personDetected ? 'rgba(0, 212, 170, 0.95)' : 'rgba(255, 107, 107, 0.95)', 
                    padding:'15px 30px', borderRadius:'20px', fontSize:'14px', color:'white',
                    fontWeight: '900', textTransform:'uppercase', letterSpacing:'2px',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
                  }}>
                    👤 {personDetected ? 'SYNCED' : 'LOST'}
                  </div>
                  <div style={{ 
                    background: eyeContactScore > 70 ? 'rgba(0, 212, 170, 0.95)' : 'rgba(245, 166, 35, 0.95)', 
                    padding:'15px 30px', borderRadius:'20px', fontSize:'14px', color:'white',
                    fontWeight: '900', textTransform:'uppercase', letterSpacing:'2px',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
                  }}>
                    👁️ EYE: {Math.round(eyeContactScore)}%
                  </div>
                  <div style={{ 
                    background: noiseLevel > 65 ? 'rgba(255, 107, 107, 0.95)' : 'rgba(0, 212, 170, 0.95)', 
                    padding:'15px 30px', borderRadius:'20px', fontSize:'14px', color:'white',
                    fontWeight: '900', textTransform:'uppercase', letterSpacing:'2px',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
                  }}>
                    🔊 ACOUSTIC: {noiseLevel > 65 ? 'NOISY' : 'CLEAN'}
                  </div>
                </div>
              </div>
            )}

            <div style={{ position:'absolute', top:60, right:60, maxWidth:'450px', display:'flex', flexDirection:'column', gap:'25px' }}>
                {warnings.map(warning => (
                  <div key={warning.id} className="pf-glass" style={{
                      background:'rgba(255, 107, 107, 0.98) !important', color:'#FFFFFF', border:'none',
                      padding:'25px 40px', fontSize:'15px', fontWeight:'900', borderRadius:'30px',
                      boxShadow: '0 30px 60px rgba(255, 107, 107, 0.4)', animation:'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      textTransform:'uppercase', letterSpacing:'1.5px'
                  }}>
                    {warning.message}
                  </div>
                ))}
            </div>
          </div>

          {!recording && !recorded && !securityViolation && (
            <button onClick={startRecording} className="pf-glow-btn" style={{ border:'none', width:'100%', padding:'35px', borderRadius:'45px', fontWeight:'900', fontSize:'26px', textTransform:'uppercase', letterSpacing:'5px' }}>ENGAGE AI INTERVIEW SEQUENCE</button>
          )}
          {recording && (
             <button onClick={nextQuestion} className="pf-glow-btn" style={{ border:'none', width:'100%', padding:'35px', borderRadius:'45px', fontWeight:'900', fontSize:'26px', textTransform:'uppercase', letterSpacing:'5px', background:'var(--brand-yellow) !important' }}>
               {currentQIndex === questions.length - 1 ? 'TERMINATE & GENERATE AUDIT' : 'PROCEED TO NEXT UNIT'}
             </button>
          )}
          {recorded && !results && !analyzing && (
            <button onClick={analyzeInterview} className="pf-glow-btn" style={{ border:'none', width:'100%', padding:'35px', borderRadius:'45px', fontWeight:'900', fontSize:'26px', textTransform:'uppercase', letterSpacing:'5px', background:'var(--brand-teal) !important' }}>SYNTHESIZE TECHNICAL SCORECARD</button>
          )}
          {analyzing && (
            <div className="pf-glass" style={{ textAlign:'center', padding:'100px', background:'white !important', borderRadius:'60px', border:'none', boxShadow: '0 30px 80px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize:'120px', marginBottom:'50px', animation:'pf-pulse 1.5s infinite' }}>🧠</div>
              <div style={{ fontWeight:'900', color:'var(--brand-teal)', fontSize:'24px', letterSpacing:'4px', textTransform:'uppercase' }}>PATHFORGE AI IS CONDUCTING DEEP TECHNICAL SYNTHESIS...</div>
            </div>
          )}
        </div>

        {results && (
          <div className="pf-glass" style={{ padding:'80px', border:'none', background:'white !important', height:'fit-content', borderRadius:'60px', boxShadow:'0 60px 150px rgba(0,0,0,0.1)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'60px' }}>
              <h3 className="pf-shimmer-text" style={{ fontSize:'56px', fontWeight:'900', fontFamily:'var(--font-display)', margin:0, letterSpacing:'-3px' }}>Technical Audit</h3>
              <div style={{ fontSize:'84px', fontWeight:'900', color: results.rating > 5 ? 'var(--brand-teal)' : 'var(--brand-coral)', fontFamily:'var(--font-display)', letterSpacing:'-4px', lineHeight:1 }}>{results.rating}<span style={{fontSize:'32px', opacity:0.4, letterSpacing:0}}>/10</span></div>
            </div>
            
            <div style={{ marginBottom:'60px' }}>
              <div style={{ fontSize:'14px', color:'var(--brand-teal)', fontWeight:'900', textTransform:'uppercase', marginBottom:'30px', letterSpacing:'4px', opacity:0.5 }}>CRITICAL AUDIT SUMMARY</div>
              <p className="pf-glass" style={{ fontSize:'24px', lineHeight:'1.8', color:'var(--text-heading)', padding:'50px', borderRadius:'40px', borderLeft:'15px solid var(--brand-teal) !important', background:'rgba(0, 212, 170, 0.04) !important', fontWeight:'600' }}>{results.detailedJudgement}</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'30px', marginBottom:'80px' }}>
               <div className="pf-glass" style={{ padding:'45px', textAlign:'center', borderRadius:'40px', background:'rgba(0,0,0,0.01) !important', border:'none' }}>
                  <div style={{ fontSize:'14px', fontWeight:'900', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'15px', letterSpacing:'3px' }}>COGNITIVE SYNC</div>
                  <div className="pf-shimmer-text" style={{ fontSize:'56px', fontWeight:'900', fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>{results.metrics?.communication || 0}%</div>
               </div>
               <div className="pf-glass" style={{ padding:'45px', textAlign:'center', borderRadius:'40px', background:'rgba(0,0,0,0.01) !important', border:'none' }}>
                  <div style={{ fontSize:'14px', fontWeight:'900', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:'15px', letterSpacing:'3px' }}>NEURAL INTEGRITY</div>
                  <div className="pf-shimmer-text" style={{ fontSize:'56px', fontWeight:'900', fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>{results.metrics?.integrity || 100}%</div>
               </div>
            </div>

            <button onClick={handleBack} className="pf-glow-btn" style={{ border:'none', width:'100%', padding:'35px', borderRadius:'45px', fontWeight:'900', fontSize:'24px', textTransform:'uppercase', letterSpacing:'4px' }}>RETURN TO COMMAND CENTER</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
